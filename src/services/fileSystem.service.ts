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
      // Just return the handle without checking permissions
      // Permission checking is not reliably supported across browsers
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
    throw new Error('File System Access API não suportada neste navegador');
  }
  
  try {
    const handle = await (window as any).showDirectoryPicker({
      mode: 'readwrite'
    });
    
    await salvarHandlePasta(handle);
    return handle;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log('Usuário cancelou a seleção da pasta');
      return null;
    }
    console.error('Erro ao configurar pasta:', error);
    throw error;
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

// Escrever arquivo JSON na pasta
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

// Sincronizar dados (localStorage ↔ arquivo)
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
    
    // Se arquivo não existe, criar com dados do localStorage
    if (!dadosArquivo) {
      await escreverArquivo(handle, 'devedores.json', dadosLocais);
      return {
        conectado: true,
        pastaConfigurada: true,
        ultimaSincronizacao: new Date().toISOString()
      };
    }
    
    // Comparar datas de atualização
    const dataLocal = new Date(dadosLocais.configuracoes.ultimaAtualizacao);
    const dataArquivo = new Date(dadosArquivo.configuracoes.ultimaAtualizacao);
    
    if (dataArquivo > dataLocal) {
      // Arquivo é mais recente, atualizar localStorage
      salvarDadosLocais(dadosArquivo);
    } else if (dataLocal > dataArquivo) {
      // localStorage é mais recente, atualizar arquivo
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

// Criar backup
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

// Auto-inicialização
export const inicializarSincronizacao = async (): Promise<void> => {
  if (!suportaFileSystemAPI()) {
    console.warn('File System Access API não suportada');
    return;
  }
  
  try {
    await sincronizarDados();
    
    // Configurar sincronização automática a cada 30 segundos
    setInterval(async () => {
      try {
        await sincronizarDados();
      } catch (error) {
        console.error('Erro na sincronização automática:', error);
      }
    }, 30000);
    
    // Sincronizar antes de fechar a página
    window.addEventListener('beforeunload', () => {
      sincronizarDados();
    });
  } catch (error) {
    console.error('Erro ao inicializar sincronização:', error);
  }
};
