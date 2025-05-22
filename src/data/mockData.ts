
import { Cliente, Divida } from '@/types';

// Dados fictícios para testes
export const clientesMock: Cliente[] = [
  {
    id: '1',
    nome: 'João da Silva',
    cpf: '123.456.789-00',
    telefone: '(11) 98765-4321',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-01-15T10:30:00Z'
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    cpf: '987.654.321-00',
    telefone: '(11) 91234-5678',
    createdAt: '2023-02-20T14:45:00Z',
    updatedAt: '2023-02-20T14:45:00Z'
  },
  {
    id: '3',
    nome: 'Carlos Pereira',
    cpf: '456.789.123-00',
    telefone: '(21) 99876-5432',
    createdAt: '2023-03-10T09:15:00Z',
    updatedAt: '2023-03-10T09:15:00Z'
  },
  {
    id: '4',
    nome: 'Ana Santos',
    cpf: '789.123.456-00',
    telefone: '(31) 98765-1234',
    createdAt: '2023-04-05T16:20:00Z',
    updatedAt: '2023-04-05T16:20:00Z'
  },
  {
    id: '5',
    nome: 'Roberto Costa',
    cpf: '321.654.987-00',
    telefone: '(41) 99999-8888',
    createdAt: '2023-05-12T11:40:00Z',
    updatedAt: '2023-05-12T11:40:00Z'
  }
];

// Função para gerar uma data no passado (para dívidas atrasadas)
function gerarDataPassada(diasAtras: number): string {
  const data = new Date();
  data.setDate(data.getDate() - diasAtras);
  return data.toISOString();
}

// Função para gerar uma data no futuro (para dívidas pendentes)
function gerarDataFutura(diasAFrente: number): string {
  const data = new Date();
  data.setDate(data.getDate() + diasAFrente);
  return data.toISOString();
}

// Dados fictícios de dívidas
export const dividasMock: Divida[] = [
  {
    id: '1',
    clienteId: '1',
    valor: 1500.00,
    dataCompra: gerarDataPassada(45),
    dataVencimento: gerarDataPassada(15),
    status: 'atrasado',
    descricao: 'Compra de materiais',
    createdAt: gerarDataPassada(45),
    updatedAt: gerarDataPassada(45)
  },
  {
    id: '2',
    clienteId: '1',
    valor: 800.00,
    dataCompra: gerarDataPassada(20),
    dataVencimento: gerarDataFutura(10),
    status: 'pendente',
    descricao: 'Serviços prestados',
    createdAt: gerarDataPassada(20),
    updatedAt: gerarDataPassada(20)
  },
  {
    id: '3',
    clienteId: '2',
    valor: 2000.00,
    dataCompra: gerarDataPassada(60),
    dataVencimento: gerarDataPassada(30),
    status: 'atrasado',
    descricao: 'Empréstimo pessoal',
    createdAt: gerarDataPassada(60),
    updatedAt: gerarDataPassada(60)
  },
  {
    id: '4',
    clienteId: '3',
    valor: 1200.00,
    dataCompra: gerarDataPassada(15),
    dataVencimento: gerarDataFutura(15),
    status: 'pendente',
    descricao: 'Produtos diversos',
    createdAt: gerarDataPassada(15),
    updatedAt: gerarDataPassada(15)
  },
  {
    id: '5',
    clienteId: '4',
    valor: 3500.00,
    dataCompra: gerarDataPassada(90),
    dataVencimento: gerarDataPassada(60),
    status: 'atrasado',
    descricao: 'Financiamento',
    createdAt: gerarDataPassada(90),
    updatedAt: gerarDataPassada(90)
  },
  {
    id: '6',
    clienteId: '5',
    valor: 750.00,
    dataCompra: gerarDataPassada(10),
    dataVencimento: gerarDataFutura(20),
    status: 'pendente',
    descricao: 'Serviço de manutenção',
    createdAt: gerarDataPassada(10),
    updatedAt: gerarDataPassada(10)
  },
  {
    id: '7',
    clienteId: '2',
    valor: 1800.00,
    dataCompra: gerarDataPassada(30),
    dataVencimento: gerarDataPassada(5),
    status: 'atrasado',
    descricao: 'Pagamento parcial',
    createdAt: gerarDataPassada(30),
    updatedAt: gerarDataPassada(30)
  }
];

// Funções para manipular os dados (simulando um backend)
let clientes = [...clientesMock];
let dividas = [...dividasMock];

// Funções para clientes
export const getClientes = () => [...clientes];
export const getClienteById = (id: string) => clientes.find(c => c.id === id);
export const addCliente = (cliente: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newCliente: Cliente = {
    ...cliente,
    id: (clientes.length + 1).toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  clientes.push(newCliente);
  return newCliente;
};
export const updateCliente = (id: string, updates: Partial<Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const index = clientes.findIndex(c => c.id === id);
  if (index !== -1) {
    clientes[index] = {
      ...clientes[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return clientes[index];
  }
  return null;
};
export const deleteCliente = (id: string) => {
  const index = clientes.findIndex(c => c.id === id);
  if (index !== -1) {
    const deleted = clientes[index];
    clientes = clientes.filter(c => c.id !== id);
    return deleted;
  }
  return null;
};

// Funções para dívidas
export const getDividas = () => [...dividas];
export const getDividaById = (id: string) => dividas.find(d => d.id === id);
export const getDividasByClienteId = (clienteId: string) => dividas.filter(d => d.clienteId === clienteId);
export const addDivida = (divida: Omit<Divida, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newDivida: Divida = {
    ...divida,
    id: (dividas.length + 1).toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  dividas.push(newDivida);
  return newDivida;
};
export const updateDivida = (id: string, updates: Partial<Omit<Divida, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const index = dividas.findIndex(d => d.id === id);
  if (index !== -1) {
    dividas[index] = {
      ...dividas[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return dividas[index];
  }
  return null;
};
export const deleteDivida = (id: string) => {
  const index = dividas.findIndex(d => d.id === id);
  if (index !== -1) {
    const deleted = dividas[index];
    dividas = dividas.filter(d => d.id !== id);
    return deleted;
  }
  return null;
};
