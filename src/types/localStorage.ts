
// Tipos para o sistema localStorage
export interface ClienteLocal {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  endereco?: string;
  createdAt: string;
  updatedAt: string;
  dividas: DividaLocal[];
  pagamentos: PagamentoLocal[];
}

export interface DividaLocal {
  id: string;
  clienteId: string;
  valor: number;
  dataVencimento: string;
  dataCriacao: string;
  descricao: string;
  status: 'pendente' | 'pago' | 'vencido';
  juros: number; // % mensal
  valorAtualizado: number; // com juros calculados
  createdAt: string;
  updatedAt: string;
}

export interface PagamentoLocal {
  id: string;
  clienteId: string;
  dividaId: string;
  valor: number;
  data: string;
  observacao?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DadosLocais {
  clientes: ClienteLocal[];
  configuracoes: {
    ultimaAtualizacao: string;
    versao: string;
    usuario: string;
  };
}

export interface StatusSincronizacao {
  conectado: boolean;
  ultimaSincronizacao?: string;
  pastaConfigurada: boolean;
  erro?: string;
}
