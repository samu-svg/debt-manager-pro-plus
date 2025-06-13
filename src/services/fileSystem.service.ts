
import { DadosLocais, StatusSincronizacao } from '@/types/localStorage';
import { getDadosLocais, salvarDadosLocais } from './localStorage.service';

// Chave para armazenar o handle da pasta no IndexedDB
const DB_NAME = 'DevedoresDB';
const DB_VERSION = 1;
const STORE_NAME = 'handles';
const HANDLE_KEY = 'pastaHandle';

// Verificar se o navegador suporta File System Access API
export const suportaFileSystemAPI = (): boolean => {
  return 'showDirectoryPicker' in window;
};

// Verificar se estamos em um ambiente seguro para usar a API
export const ambienteSeguroParaAPI = (): boolean => {
  // Não funciona em iframes ou subdomínios específicos
  if (window.self !== window.top) {
    return false; // está em iframe
  }
  
  if (window.location.hostname.includes('lovable.app')) {
    return false; // ambiente de preview
  }
  
  return true;
};

// Abrir IndexedDB
const abrirDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

// Salvar handle da pasta no IndexedDB
const salvarHandlePasta = async (handle: FileSystemDirectoryHandle): Promise<void> => {
  try {
    const db = await abrirDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(handle, HANDLE_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    db.close();
  } catch (error) {
    console.error('Erro ao salvar handle da pasta:', error);
  }
};

// Recuperar handle da pasta do IndexedDB
export const recuperarHandlePasta = async (): Promise<FileSystemDirectoryHandle | null> => {
  try {
    const db = await abrirDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const handle = await new Promise<FileSystemDirectoryHandle | undefined>((resolve, reject) => {
      const request = store.get(HANDLE_KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    
    if (handle) {
      return handle;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao recuperar handle da pasta:', error);
    return null;
  }
};

// Configurar pasta local
export const configurarPastaLocal = async (): Promise<FileSystemDirectoryHandle | null> => {
  if (!suportaFileSystemAPI()) {
    throw new Error('Seu navegador não suporta a seleção de pastas. Tente usar Chrome, Edge ou Opera.');
  }
  
  if (!ambienteSeguroParaAPI()) {
    throw new Error('A seleção de pasta não funciona no ambiente de preview. Acesse o app diretamente para usar esta funcionalidade.');
  }
  
  try {
    console.log('Solicitando seleção de pasta...');
    
    const handle = await (window as any).showDirectoryPicker({
      mode: 'readwrite'
    });
    
    console.log('Pasta selecionada:', handle);
    
    await salvarHandlePasta(handle);
    console.log('Handle da pasta salvo com sucesso');
    
    return handle;
  } catch (error) {
    console.error('Erro ao configurar pasta:', error);
    
    if ((error as Error).name === 'AbortError') {
      console.log('Usuário cancelou a seleção da pasta');
      throw new Error('Seleção de pasta cancelada pelo usuário');
    }
    
    if ((error as Error).name === 'NotAllowedError') {
      throw new Error('Permissão negada para acessar a pasta. Verifique as configurações do navegador.');
    }
    
    if ((error as Error).name === 'SecurityError') {
      throw new Error('A seleção de pasta não funciona no ambiente atual. Acesse o app diretamente.');
    }
    
    throw new Error(`Erro ao selecionar pasta: ${(error as Error).message}`);
  }
};

// Ler arquivo JSON da pasta
const lerArquivo = async (handle: FileSystemDirectoryHandle, nomeArquivo: string): Promise<DadosLocais | null> => {
  try {
    const fileHandle = await handle.getFileHandle(nomeArquivo);
    const file = await fileHandle.getFile();
    const texto = await file.text();
    return JSON.parse(texto);
  } catch (error) {
    if ((error as Error).name === 'NotFoundError') {
      return null; // Arquivo não existe
    }
    console.error('Erro ao ler arquivo:', error);
    throw error;
  }
};

const escreverArquivo = async (handle: FileSystemDirectoryHandle, nomeArquivo: string, dados: DadosLocais): Promise<void> => {
  try {
    const fileHandle = await handle.getFileHandle(nomeArquivo, { create: true });
    const writable = await fileHandle.createWritable();
    
    await writable.write(JSON.stringify(dados, null, 2));
    await writable.close();
  } catch (error) {
    console.error('Erro ao escrever arquivo:', error);
    throw error;
  }
};

export const sincronizarDados = async (): Promise<StatusSincronizacao> => {
  const handle = await recuperarHandlePasta();
  
  if (!handle) {
    return {
      conectado: false,
      pastaConfigurada: false,
      erro: 'Pasta não configurada'
    };
  }
  
  try {
    const dadosLocais = getDadosLocais();
    const dadosArquivo = await lerArquivo(handle, 'devedores.json');
    
    if (!dadosArquivo) {
      await escreverArquivo(handle, 'devedores.json', dadosLocais);
      return {
        conectado: true,
        pastaConfigurada: true,
        ultimaSincronizacao: new Date().toISOString()
      };
    }
    
    const dataLocal = new Date(dadosLocais.configuracoes.ultimaAtualizacao);
    const dataArquivo = new Date(dadosArquivo.configuracoes.ultimaAtualizacao);
    
    if (dataArquivo > dataLocal) {
      salvarDadosLocais(dadosArquivo);
    } else if (dataLocal > dataArquivo) {
      await escreverArquivo(handle, 'devedores.json', dadosLocais);
    }
    
    return {
      conectado: true,
      pastaConfigurada: true,
      ultimaSincronizacao: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return {
      conectado: false,
      pastaConfigurada: true,
      erro: (error as Error).message
    };
  }
};

export const criarBackup = async (): Promise<void> => {
  const handle = await recuperarHandlePasta();
  
  if (!handle) {
    throw new Error('Pasta não configurada');
  }
  
  const dados = getDadosLocais();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const nomeBackup = `backup_${timestamp}.json`;
  
  await escreverArquivo(handle, nomeBackup, dados);
};

export const inicializarSincronizacao = async (): Promise<void> => {
  if (!suportaFileSystemAPI() || !ambienteSeguroParaAPI()) {
    console.warn('File System Access API não disponível neste ambiente');
    return;
  }
  
  try {
    await sincronizarDados();
    
    setInterval(async () => {
      try {
        await sincronizarDados();
      } catch (error) {
        console.error('Erro na sincronização automática:', error);
      }
    }, 30000);
    
    window.addEventListener('beforeunload', () => {
      sincronizarDados();
    });
  } catch (error) {
    console.error('Erro ao inicializar sincronização:', error);
  }
};
