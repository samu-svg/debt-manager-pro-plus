
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClienteLocal, DividaLocal, PagamentoLocal, StatusSincronizacao } from '@/types/localStorage';
import * as LocalStorage from '@/services/localStorage.service';
import * as FileSystem from '@/services/fileSystem.service';
import { iniciarAtualizacaoAutomatica } from '@/services/juros.service';

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
  
  // Utils
  recarregar: () => void;
}

const LocalDataContext = createContext<LocalDataContextType | undefined>(undefined);

export const LocalDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientes, setClientes] = useState<ClienteLocal[]>([]);
  const [dividas, setDividas] = useState<DividaLocal[]>([]);
  const [pagamentos, setPagamentos] = useState<PagamentoLocal[]>([]);
  const [statusSincronizacao, setStatusSincronizacao] = useState<StatusSincronizacao>({
    conectado: false,
    pastaConfigurada: false
  });

  // Carregar dados iniciais
  const carregarDados = () => {
    const clientesData = LocalStorage.obterClientes();
    const dividasData = LocalStorage.obterDividas();
    const pagamentosData = LocalStorage.obterPagamentos();
    
    setClientes(clientesData);
    setDividas(dividasData);
    setPagamentos(pagamentosData);
  };

  // Verificar status da sincronização
  const verificarStatus = async () => {
    const suporta = FileSystem.suportaFileSystemAPI();
    const handle = await FileSystem.recuperarHandlePasta();
    
    setStatusSincronizacao({
      conectado: suporta && !!handle,
      pastaConfigurada: !!handle
    });
  };

  // Inicialização
  useEffect(() => {
    carregarDados();
    verificarStatus();
    iniciarAtualizacaoAutomatica();
    
    if (FileSystem.suportaFileSystemAPI()) {
      FileSystem.inicializarSincronizacao();
    }
  }, []);

  // Funções dos clientes
  const criarClienteLocal = (clienteData: Omit<ClienteLocal, 'id' | 'createdAt' | 'updatedAt' | 'dividas' | 'pagamentos'>) => {
    const novoCliente = LocalStorage.criarCliente(clienteData);
    carregarDados();
    return novoCliente;
  };

  const atualizarClienteLocal = (id: string, updates: Partial<Omit<ClienteLocal, 'id' | 'createdAt' | 'dividas' | 'pagamentos'>>) => {
    const clienteAtualizado = LocalStorage.atualizarCliente(id, updates);
    carregarDados();
    return clienteAtualizado;
  };

  const removerClienteLocal = (id: string) => {
    const sucesso = LocalStorage.removerCliente(id);
    carregarDados();
    return sucesso;
  };

  const buscarClientesLocal = (termo: string) => {
    return LocalStorage.buscarClientes(termo);
  };

  // Funções das dívidas
  const criarDividaLocal = (dividaData: Omit<DividaLocal, 'id' | 'createdAt' | 'updatedAt' | 'valorAtualizado'>) => {
    const novaDivida = LocalStorage.criarDivida(dividaData);
    carregarDados();
    return novaDivida;
  };

  const atualizarDividaLocal = (id: string, updates: Partial<Omit<DividaLocal, 'id' | 'createdAt'>>) => {
    const dividaAtualizada = LocalStorage.atualizarDivida(id, updates);
    carregarDados();
    return dividaAtualizada;
  };

  const removerDividaLocal = (id: string) => {
    const sucesso = LocalStorage.removerDivida(id);
    carregarDados();
    return sucesso;
  };

  // Funções dos pagamentos
  const criarPagamentoLocal = (pagamentoData: Omit<PagamentoLocal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const novoPagamento = LocalStorage.criarPagamento(pagamentoData);
    carregarDados();
    return novoPagamento;
  };

  // File System
  const configurarPasta = async () => {
    try {
      const handle = await FileSystem.configurarPastaLocal();
      if (handle) {
        await verificarStatus();
        await sincronizar();
      }
    } catch (error) {
      console.error('Erro ao configurar pasta:', error);
      throw error;
    }
  };

  const sincronizar = async () => {
    try {
      const status = await FileSystem.sincronizarDados();
      setStatusSincronizacao(status);
      carregarDados(); // Recarregar após sincronização
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
    buscarClientes: buscarClientesLocal,
    
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
