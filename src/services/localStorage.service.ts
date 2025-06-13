
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
  console.log('LocalStorage inicializado com dados padrão');
  return defaultData;
};

// Obter todos os dados
export const getDadosLocais = (): DadosLocais => {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (!dados) {
      console.log('Dados não encontrados, inicializando...');
      return initializeLocalStorage();
    }
    const parsedData = JSON.parse(dados);
    console.log('Dados carregados do localStorage:', { 
      clientes: parsedData.clientes?.length || 0 
    });
    return parsedData;
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
    console.log('Dados salvos no localStorage:', { 
      clientes: dados.clientes.length,
      totalDividas: dados.clientes.reduce((total, c) => total + c.dividas.length, 0)
    });
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
  console.log('Cliente criado:', novoCliente.nome);
  return novoCliente;
};

export const obterClientes = (): ClienteLocal[] => {
  const dados = getDadosLocais();
  return dados.clientes;
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
  console.log('Cliente atualizado:', dados.clientes[index].nome);
  return dados.clientes[index];
};

export const removerCliente = (id: string): boolean => {
  const dados = getDadosLocais();
  const index = dados.clientes.findIndex(c => c.id === id);
  
  if (index === -1) return false;
  
  const clienteRemovido = dados.clientes[index];
  dados.clientes.splice(index, 1);
  salvarDadosLocais(dados);
  console.log('Cliente removido:', clienteRemovido.nome);
  return true;
};

// CRUD Dívidas
export const criarDivida = (divida: Omit<DividaLocal, 'id' | 'createdAt' | 'updatedAt' | 'valorAtualizado'>): DividaLocal | null => {
  const dados = getDadosLocais();
  const clienteIndex = dados.clientes.findIndex(c => c.id === divida.clienteId);
  
  if (clienteIndex === -1) {
    console.error('Cliente não encontrado para criar dívida:', divida.clienteId);
    return null;
  }
  
  const novaDivida: DividaLocal = {
    ...divida,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    valorAtualizado: divida.valor // Inicialmente igual ao valor original
  };
  
  dados.clientes[clienteIndex].dividas.push(novaDivida);
  salvarDadosLocais(dados);
  
  console.log('Dívida criada:', {
    id: novaDivida.id,
    cliente: dados.clientes[clienteIndex].nome,
    valor: novaDivida.valor,
    descricao: novaDivida.descricao
  });
  
  return novaDivida;
};

export const obterDividas = (): DividaLocal[] => {
  const dados = getDadosLocais();
  const todasDividas = dados.clientes.flatMap(c => c.dividas);
  console.log('Dívidas obtidas:', todasDividas.length);
  return todasDividas;
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
      console.log('Dívida atualizada:', cliente.dividas[dividaIndex]);
      return cliente.dividas[dividaIndex];
    }
  }
  
  console.error('Dívida não encontrada para atualizar:', dividaId);
  return null;
};

export const removerDivida = (dividaId: string): boolean => {
  const dados = getDadosLocais();
  
  for (const cliente of dados.clientes) {
    const dividaIndex = cliente.dividas.findIndex(d => d.id === dividaId);
    if (dividaIndex !== -1) {
      const dividaRemovida = cliente.dividas[dividaIndex];
      cliente.dividas.splice(dividaIndex, 1);
      salvarDadosLocais(dados);
      console.log('Dívida removida:', dividaRemovida);
      return true;
    }
  }
  
  console.error('Dívida não encontrada para remover:', dividaId);
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
  console.log('Pagamento criado:', novoPagamento);
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
