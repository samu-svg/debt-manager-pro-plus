// Tipos para o cliente
export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos para dívidas
export type StatusPagamento = 'pendente' | 'pago' | 'atrasado' | 'vencido';

// Tipo para mês de início dos juros (carência)
export type MesInicioJuros = '1º mês' | '2º mês' | '3º mês' | '4º mês' | '5º mês' | '6º mês';

export interface Divida {
  id: string;
  clienteId: string;
  valor: number;
  dataCompra: string;
  dataVencimento: string;
  status: StatusPagamento;
  descricao: string;
  taxaJuros?: number; // Taxa de juros personalizada (%)
  mesInicioJuros?: MesInicioJuros; // Mês para início da cobrança de juros
  createdAt: string;
  updatedAt: string;
}

// Tipo para cálculo de juros
export type TipoJuros = 'simples' | 'composto';

export interface CalculoJuros {
  valorInicial: number;
  meses: number;
  taxa: number;
  tipo: TipoJuros;
  valorFinal: number;
  juros: number;
}

// Tipos para o banco de dados PostgreSQL
export interface DbCliente {
  id: number;
  nome: string;
  telefone: string;
  cpf: string;
  data_cadastro: string;
}

export interface DbDivida {
  id: number;
  cliente_id: number;
  valor_original: number;
  data_compra: string;
  data_vencimento: string;
  status_pagamento: string;
  taxa_juros: number;
  mes_inicio_juros: number;
  observacoes: string | null;
  data_criacao: string;
}

export interface DbConfiguracaoJuros {
  id: number;
  cliente_id: number;
  tipo_juros: 'simples' | 'composto';
  taxa_juros_padrao: number;
}

export interface DbHistoricoPagamento {
  id: number;
  divida_id: number;
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento: string | null;
  observacoes: string | null;
}

export interface DbComunicacao {
  id: number;
  cliente_id: number;
  tipo: string;
  mensagem: string;
  status: string;
  data_envio: string | null;
  data_criacao: string;
}

// Funções de mapeamento entre tipos da aplicação e banco de dados
export function mapDbClienteToCliente(dbCliente: DbCliente): Cliente {
  return {
    id: dbCliente.id.toString(),
    nome: dbCliente.nome,
    cpf: dbCliente.cpf,
    telefone: dbCliente.telefone,
    createdAt: dbCliente.data_cadastro,
    updatedAt: dbCliente.data_cadastro
  };
}

export function mapDbDividaToDivida(dbDivida: DbDivida): Divida {
  const mesInicioJurosMap: Record<number, MesInicioJuros> = {
    1: '1º mês',
    2: '2º mês',
    3: '3º mês',
    4: '4º mês',
    5: '5º mês',
    6: '6º mês'
  };
  
  const statusMap: Record<string, StatusPagamento> = {
    'Pendente': 'pendente',
    'Pago': 'pago',
    'Atrasado': 'atrasado',
    'Vencido': 'vencido'
  };
  
  return {
    id: dbDivida.id.toString(),
    clienteId: dbDivida.cliente_id.toString(),
    valor: dbDivida.valor_original,
    dataCompra: dbDivida.data_compra,
    dataVencimento: dbDivida.data_vencimento,
    status: statusMap[dbDivida.status_pagamento] || 'pendente',
    descricao: dbDivida.observacoes || '',
    taxaJuros: dbDivida.taxa_juros,
    mesInicioJuros: mesInicioJurosMap[dbDivida.mes_inicio_juros] || '2º mês',
    createdAt: dbDivida.data_criacao,
    updatedAt: dbDivida.data_criacao
  };
}
