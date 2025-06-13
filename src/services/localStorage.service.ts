
import { ClienteLocal, DividaLocal, PagamentoLocal, DadosLocais } from '@/types/localStorage';

const STORAGE_KEY = 'devedores_dados';
const CONFIG_KEY = 'devedores_config';

// Inicializar dados se não existirem
const initializeLocalStorage = (): DadosLocais => {
  const defaultData: DadosLocais = {
    clientes: [],
    configuracoes: {
      ultimaAtualizacao: new Date().toISOString(),
      versao: '1.0.0',
      usuario: ''
    }
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  return defaultData;
};

// Obter todos os dados
export const getDadosLocais = (): DadosLocais => {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (!dados) {
      return initializeLocalStorage();
    }
    return JSON.parse(dados);
  } catch (error) {
    console.error('Erro ao ler dados do localStorage:', error);
    return initializeLocalStorage();
  }
};

// Salvar dados
export const salvarDadosLocais = (dados: DadosLocais): void => {
  try {
    dados.configuracoes.ultimaAtualizacao = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  } catch (error) {
    console.error('Erro ao salvar dados no localStorage:', error);
    throw new Error('Não foi possível salvar os dados');
  }
};

// CRUD Clientes
export const criarCliente = (cliente: Omit<ClienteLocal, 'id' | 'createdAt' | 'updatedAt' | 'dividas' | 'pagamentos'>): ClienteLocal => {
  const dados = getDadosLocais();
  const novoCliente: ClienteLocal = {
    ...cliente,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dividas: [],
    pagamentos: []
  };
  
  dados.clientes.push(novoCliente);
  salvarDadosLocais(dados);
  return novoCliente;
};

export const obterClientes = (): ClienteLocal[] => {
  return getDadosLocais().clientes;
};

export const obterClientePorId = (id: string): ClienteLocal | null => {
  const dados = getDadosLocais();
  return dados.clientes.find(c => c.id === id) || null;
};

export const atualizarCliente = (id: string, updates: Partial<Omit<ClienteLocal, 'id' | 'createdAt' | 'dividas' | 'pagamentos'>>): ClienteLocal | null => {
  const dados = getDadosLocais();
  const index = dados.clientes.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  dados.clientes[index] = {
    ...dados.clientes[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  salvarDadosLocais(dados);
  return dados.clientes[index];
};

export const removerCliente = (id: string): boolean => {
  const dados = getDadosLocais();
  const index = dados.clientes.findIndex(c => c.id === id);
  
  if (index === -1) return false;
  
  dados.clientes.splice(index, 1);
  salvarDadosLocais(dados);
  return true;
};

// CRUD Dívidas
export const criarDivida = (divida: Omit<DividaLocal, 'id' | 'createdAt' | 'updatedAt' | 'valorAtualizado'>): DividaLocal | null => {
  const dados = getDadosLocais();
  const clienteIndex = dados.clientes.findIndex(c => c.id === divida.clienteId);
  
  if (clienteIndex === -1) return null;
  
  const novaDivida: DividaLocal = {
    ...divida,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    valorAtualizado: divida.valor // Será calculado depois
  };
  
  dados.clientes[clienteIndex].dividas.push(novaDivida);
  salvarDadosLocais(dados);
  return novaDivida;
};

export const obterDividas = (): DividaLocal[] => {
  const dados = getDadosLocais();
  return dados.clientes.flatMap(c => c.dividas);
};

export const obterDividasPorCliente = (clienteId: string): DividaLocal[] => {
  const cliente = obterClientePorId(clienteId);
  return cliente?.dividas || [];
};

export const atualizarDivida = (dividaId: string, updates: Partial<Omit<DividaLocal, 'id' | 'createdAt'>>): DividaLocal | null => {
  const dados = getDadosLocais();
  
  for (const cliente of dados.clientes) {
    const dividaIndex = cliente.dividas.findIndex(d => d.id === dividaId);
    if (dividaIndex !== -1) {
      cliente.dividas[dividaIndex] = {
        ...cliente.dividas[dividaIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      salvarDadosLocais(dados);
      return cliente.dividas[dividaIndex];
    }
  }
  
  return null;
};

export const removerDivida = (dividaId: string): boolean => {
  const dados = getDadosLocais();
  
  for (const cliente of dados.clientes) {
    const dividaIndex = cliente.dividas.findIndex(d => d.id === dividaId);
    if (dividaIndex !== -1) {
      cliente.dividas.splice(dividaIndex, 1);
      salvarDadosLocais(dados);
      return true;
    }
  }
  
  return false;
};

// CRUD Pagamentos
export const criarPagamento = (pagamento: Omit<PagamentoLocal, 'id' | 'createdAt' | 'updatedAt'>): PagamentoLocal | null => {
  const dados = getDadosLocais();
  const clienteIndex = dados.clientes.findIndex(c => c.id === pagamento.clienteId);
  
  if (clienteIndex === -1) return null;
  
  const novoPagamento: PagamentoLocal = {
    ...pagamento,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  dados.clientes[clienteIndex].pagamentos.push(novoPagamento);
  salvarDadosLocais(dados);
  return novoPagamento;
};

export const obterPagamentos = (): PagamentoLocal[] => {
  const dados = getDadosLocais();
  return dados.clientes.flatMap(c => c.pagamentos);
};

export const obterPagamentosPorCliente = (clienteId: string): PagamentoLocal[] => {
  const cliente = obterClientePorId(clienteId);
  return cliente?.pagamentos || [];
};

export const obterPagamentosPorDivida = (dividaId: string): PagamentoLocal[] => {
  const dados = getDadosLocais();
  return dados.clientes.flatMap(c => c.pagamentos.filter(p => p.dividaId === dividaId));
};

// Busca
export const buscarClientes = (termo: string): ClienteLocal[] => {
  const dados = getDadosLocais();
  const termoLower = termo.toLowerCase();
  
  return dados.clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(termoLower) ||
    cliente.cpf.replace(/\D/g, '').includes(termo.replace(/\D/g, '')) ||
    cliente.telefone.replace(/\D/g, '').includes(termo.replace(/\D/g, '')) ||
    (cliente.email && cliente.email.toLowerCase().includes(termoLower))
  );
};
