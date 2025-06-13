import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClienteLocal, DividaLocal, PagamentoLocal, StatusSincronizacao } from '@/types/localStorage';
import * as LocalStorage from '@/services/localStorage.service';
import * as FileSystem from '@/services/fileSystem.service';

interface LocalDataContextType {
  // Clientes
  clientes: ClienteLocal[];
  criarCliente: (cliente: Omit<ClienteLocal, 'id' | 'createdAt' | 'updatedAt' | 'dividas' | 'pagamentos'>) => ClienteLocal;
  atualizarCliente: (id: string, updates: Partial<Omit<ClienteLocal, 'id' | 'createdAt' | 'dividas' | 'pagamentos'>>) => ClienteLocal | null;
  removerCliente: (id: string) => boolean;
  buscarClientes: (termo: string) => ClienteLocal[];
  
  // Dívidas
  dividas: DividaLocal[];
  criarDivida: (divida: Omit<DividaLocal, 'id' | 'createdAt' | 'updatedAt' | 'valorAtualizado'>) => DividaLocal | null;
  atualizarDivida: (id: string, updates: Partial<Omit<DividaLocal, 'id' | 'createdAt'>>) => DividaLocal | null;
  removerDivida: (id: string) => boolean;
  obterDividasPorCliente: (clienteId: string) => DividaLocal[];
  
  // Pagamentos
  pagamentos: PagamentoLocal[];
  criarPagamento: (pagamento: Omit<PagamentoLocal, 'id' | 'createdAt' | 'updatedAt'>) => PagamentoLocal | null;
  obterPagamentosPorCliente: (clienteId: string) => PagamentoLocal[];
  obterPagamentosPorDivida: (dividaId: string) => PagamentoLocal[];
  
  // File System
  statusSincronizacao: StatusSincronizacao;
  configurarPasta: () => Promise<void>;
  sincronizar: () => Promise<void>;
  criarBackup: () => Promise<void>;
  mostrarConfiguracao: boolean;
  setMostrarConfiguracao: (mostrar: boolean) => void;
  
  // Utils
  recarregar: () => void;
}

const LocalDataContext = createContext<LocalDataContextType | undefined>(undefined);

export const LocalDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientes, setClientes] = useState<ClienteLocal[]>([]);
  const [dividas, setDividas] = useState<DividaLocal[]>([]);
  const [pagamentos, setPagamentos] = useState<PagamentoLocal[]>([]);
  const [mostrarConfiguracao, setMostrarConfiguracao] = useState(false);
  const [statusSincronizacao, setStatusSincronizacao] = useState<StatusSincronizacao>({
    conectado: false,
    pastaConfigurada: false
  });

  // Carregar dados do localStorage
  const carregarDados = () => {
    console.log('Carregando dados do localStorage...');
    const clientesData = LocalStorage.obterClientes();
    const dividasData = LocalStorage.obterDividas();
    const pagamentosData = LocalStorage.obterPagamentos();
    
    console.log('Dados carregados:', { 
      clientes: clientesData.length, 
      dividas: dividasData.length, 
      pagamentos: pagamentosData.length 
    });
    
    setClientes(clientesData);
    setDividas(dividasData);
    setPagamentos(pagamentosData);
  };

  // Verificar status da sincronização
  const verificarStatus = async () => {
    console.log('Verificando status de sincronização...');
    
    const funcionalidadeDisponivel = FileSystem.funcionalidadeDisponivel();
    const pastaConfigurada = await FileSystem.verificarPastaConfigurada();
    
    console.log('Status verificado:', {
      funcionalidadeDisponivel,
      pastaConfigurada,
      clientesLength: clientes.length
    });
    
    const novoStatus: StatusSincronizacao = {
      conectado: funcionalidadeDisponivel && pastaConfigurada,
      pastaConfigurada: pastaConfigurada
    };
    
    setStatusSincronizacao(novoStatus);
    
    // Mostrar modal de configuração se:
    // 1. Funcionalidade está disponível
    // 2. Pasta não está configurada
    // 3. Há dados para fazer backup (clientes cadastrados)
    const deveExibirModal = funcionalidadeDisponivel && !pastaConfigurada && clientes.length > 0;
    
    console.log('Deve exibir modal?', {
      funcionalidadeDisponivel,
      pastaConfigurada: !pastaConfigurada,
      temClientes: clientes.length > 0,
      resultado: deveExibirModal
    });
    
    if (deveExibirModal) {
      console.log('Exibindo modal de configuração obrigatória');
      setMostrarConfiguracao(true);
    }
  };

  // Auto-sincronização
  const autoSincronizar = async () => {
    try {
      if (statusSincronizacao.pastaConfigurada) {
        console.log('Executando auto-sincronização...');
        const status = await FileSystem.sincronizarDados();
        setStatusSincronizacao(status);
        carregarDados(); // Recarregar dados após sincronização
      }
    } catch (error) {
      console.error('Erro na auto-sincronização:', error);
    }
  };

  // Inicialização
  useEffect(() => {
    console.log('LocalDataProvider: Inicializando...');
    carregarDados();
  }, []);

  // Verificar status após carregar clientes
  useEffect(() => {
    console.log('LocalDataProvider: Clientes mudaram, verificando status...', clientes.length);
    if (clientes.length >= 0) { // Verificar sempre, mesmo com 0 clientes
      verificarStatus();
    }
  }, [clientes.length]);

  // Iniciar auto-sincronização se disponível
  useEffect(() => {
    if (FileSystem.funcionalidadeDisponivel()) {
      console.log('Iniciando auto-sincronização...');
      FileSystem.iniciarAutoSincronizacao();
    }
  }, []);

  // Auto-sincronização a cada 30 segundos
  useEffect(() => {
    const intervalo = setInterval(autoSincronizar, 30000);
    return () => clearInterval(intervalo);
  }, [statusSincronizacao.pastaConfigurada]);

  // Funções dos clientes
  const criarClienteLocal = (clienteData: Omit<ClienteLocal, 'id' | 'createdAt' | 'updatedAt' | 'dividas' | 'pagamentos'>) => {
    console.log('Criando cliente no contexto:', clienteData);
    const novoCliente = LocalStorage.criarCliente(clienteData);
    carregarDados();
    autoSincronizar();
    return novoCliente;
  };

  const atualizarClienteLocal = (id: string, updates: Partial<Omit<ClienteLocal, 'id' | 'createdAt' | 'dividas' | 'pagamentos'>>) => {
    const clienteAtualizado = LocalStorage.atualizarCliente(id, updates);
    carregarDados();
    autoSincronizar();
    return clienteAtualizado;
  };

  const removerClienteLocal = (id: string) => {
    const sucesso = LocalStorage.removerCliente(id);
    carregarDados();
    autoSincronizar();
    return sucesso;
  };

  // Funções das dívidas
  const criarDividaLocal = (dividaData: Omit<DividaLocal, 'id' | 'createdAt' | 'updatedAt' | 'valorAtualizado'>) => {
    console.log('Criando dívida no contexto:', dividaData);
    const novaDivida = LocalStorage.criarDivida(dividaData);
    carregarDados();
    autoSincronizar();
    return novaDivida;
  };

  const atualizarDividaLocal = (id: string, updates: Partial<Omit<DividaLocal, 'id' | 'createdAt'>>) => {
    const dividaAtualizada = LocalStorage.atualizarDivida(id, updates);
    carregarDados();
    autoSincronizar();
    return dividaAtualizada;
  };

  const removerDividaLocal = (id: string) => {
    const sucesso = LocalStorage.removerDivida(id);
    carregarDados();
    autoSincronizar();
    return sucesso;
  };

  // Funções dos pagamentos
  const criarPagamentoLocal = (pagamentoData: Omit<PagamentoLocal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const novoPagamento = LocalStorage.criarPagamento(pagamentoData);
    carregarDados();
    autoSincronizar();
    return novoPagamento;
  };

  // File System
  const configurarPasta = async () => {
    try {
      console.log('Configurando pasta local...');
      const handle = await FileSystem.configurarPastaLocal();
      
      if (handle) {
        console.log('Pasta configurada com sucesso');
        await verificarStatus();
        await sincronizar();
        setMostrarConfiguracao(false);
      }
    } catch (error) {
      console.error('Erro ao configurar pasta:', error);
      throw error;
    }
  };

  const sincronizar = async () => {
    try {
      console.log('Sincronizando dados...');
      const status = await FileSystem.sincronizarDados();
      setStatusSincronizacao(status);
      carregarDados();
    } catch (error) {
      console.error('Erro na sincronização:', error);
      throw error;
    }
  };

  const criarBackupLocal = async () => {
    try {
      await FileSystem.criarBackup();
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw error;
    }
  };

  const value = {
    clientes,
    criarCliente: criarClienteLocal,
    atualizarCliente: atualizarClienteLocal,
    removerCliente: removerClienteLocal,
    buscarClientes: LocalStorage.buscarClientes,
    
    dividas,
    criarDivida: criarDividaLocal,
    atualizarDivida: atualizarDividaLocal,
    removerDivida: removerDividaLocal,
    obterDividasPorCliente: LocalStorage.obterDividasPorCliente,
    
    pagamentos,
    criarPagamento: criarPagamentoLocal,
    obterPagamentosPorCliente: LocalStorage.obterPagamentosPorCliente,
    obterPagamentosPorDivida: LocalStorage.obterPagamentosPorDivida,
    
    statusSincronizacao,
    configurarPasta,
    sincronizar,
    criarBackup: criarBackupLocal,
    mostrarConfiguracao,
    setMostrarConfiguracao,
    
    recarregar: carregarDados
  };

  return (
    <LocalDataContext.Provider value={value}>
      {children}
    </LocalDataContext.Provider>
  );
};

export const useLocalData = () => {
  const context = useContext(LocalDataContext);
  if (!context) {
    throw new Error('useLocalData deve ser usado dentro de LocalDataProvider');
  }
  return context;
};
