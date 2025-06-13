
import { DadosLocais, StatusSincronizacao } from '@/types/localStorage';
import { getDadosLocais, salvarDadosLocais } from './localStorage.service';

// Chaves para IndexedDB
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
  // Não funciona em iframes
  if (window.self !== window.top) {
    return false;
  }
  
  // Não funciona em ambientes de preview
  if (window.location.hostname.includes('lovable.app')) {
    return false;
  }
  
  return true;
};

// Verificar se a funcionalidade está disponível
export const funcionalidadeDisponivel = (): boolean => {
  return suportaFileSystemAPI() && ambienteSeguroParaAPI();
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
    console.log('Handle da pasta salvo no IndexedDB');
  } catch (error) {
    console.error('Erro ao salvar handle da pasta:', error);
    throw error;
  }
};

// Recuperar handle da pasta do IndexedDB
export const recuperarHandlePasta = async (): Promise<FileSystemDirectoryHandle | null> => {
  if (!funcionalidadeDisponivel()) {
    return null;
  }

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
      // Verificar se ainda temos permissão
      const permission = await handle.queryPermission({ mode: 'readwrite' });
      if (permission === 'granted') {
        console.log('Handle da pasta recuperado com permissão válida');
        return handle;
      } else if (permission === 'prompt') {
        const requestPermission = await handle.requestPermission({ mode: 'readwrite' });
        if (requestPermission === 'granted') {
          console.log('Permissão da pasta renovada');
          return handle;
        }
      }
      console.log('Permissão da pasta negada ou expirada');
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao recuperar handle da pasta:', error);
    return null;
  }
};

// Configurar pasta local
export const configurarPastaLocal = async (): Promise<FileSystemDirectoryHandle> => {
  if (!suportaFileSystemAPI()) {
    throw new Error('Seu navegador não suporta a seleção de pastas. Use Chrome, Edge ou Opera atualizado.');
  }
  
  if (!ambienteSeguroParaAPI()) {
    throw new Error('A seleção de pasta não funciona no ambiente de preview. Acesse o app diretamente.');
  }
  
  try {
    console.log('Solicitando seleção de pasta...');
    
    const handle = await (window as any).showDirectoryPicker({
      mode: 'readwrite'
    });
    
    console.log('Pasta selecionada:', handle.name);
    
    await salvarHandlePasta(handle);
    
    return handle;
  } catch (error) {
    console.error('Erro ao configurar pasta:', error);
    
    if ((error as Error).name === 'AbortError') {
      throw new Error('Seleção de pasta cancelada');
    }
    
    if ((error as Error).name === 'NotAllowedError') {
      throw new Error('Permissão negada para acessar a pasta');
    }
    
    if ((error as Error).name === 'SecurityError') {
      throw new Error('Funcionalidade não disponível no ambiente atual');
    }
    
    throw new Error(`Erro ao selecionar pasta: ${(error as Error).message}`);
  }
};

// Verificar se pasta está configurada
export const verificarPastaConfigurada = async (): Promise<boolean> => {
  const handle = await recuperarHandlePasta();
  return !!handle;
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
    
    console.log(`Arquivo ${nomeArquivo} salvo na pasta`);
  } catch (error) {
    console.error('Erro ao escrever arquivo:', error);
    throw error;
  }
};

// Sincronizar dados
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
      // Criar arquivo inicial
      await escreverArquivo(handle, 'devedores.json', dadosLocais);
      console.log('Arquivo inicial criado na pasta');
    } else {
      // Sincronizar baseado na última atualização
      const dataLocal = new Date(dadosLocais.configuracoes.ultimaAtualizacao);
      const dataArquivo = new Date(dadosArquivo.configuracoes.ultimaAtualizacao);
      
      if (dataArquivo > dataLocal) {
        // Arquivo mais recente, atualizar localStorage
        salvarDadosLocais(dadosArquivo);
        console.log('Dados atualizados do arquivo para localStorage');
      } else if (dataLocal > dataArquivo) {
        // localStorage mais recente, atualizar arquivo
        await escreverArquivo(handle, 'devedores.json', dadosLocais);
        console.log('Dados atualizados do localStorage para arquivo');
      }
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
  const agora = new Date();
  const timestamp = agora.toISOString().slice(0, 10).replace(/-/g, '');
  const nomeBackup = `devedores_backup_${timestamp}.json`;
  
  await escreverArquivo(handle, nomeBackup, dados);
  console.log(`Backup criado: ${nomeBackup}`);
};

// Auto-sincronização
export const iniciarAutoSincronizacao = async (): Promise<void> => {
  if (!funcionalidadeDisponivel()) {
    return;
  }
  
  // Sincronização inicial
  try {
    await sincronizarDados();
  } catch (error) {
    console.error('Erro na sincronização inicial:', error);
  }
  
  // Sincronização a cada 30 segundos
  setInterval(async () => {
    try {
      const handle = await recuperarHandlePasta();
      if (handle) {
        await sincronizarDados();
      }
    } catch (error) {
      console.error('Erro na sincronização automática:', error);
    }
  }, 30000);
  
  // Sincronizar ao fechar a página
  window.addEventListener('beforeunload', () => {
    sincronizarDados();
  });
};
