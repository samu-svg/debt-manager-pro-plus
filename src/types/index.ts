
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
export type StatusPagamento = 'pendente' | 'pago' | 'atrasado';

export interface Divida {
  id: string;
  clienteId: string;
  valor: number;
  dataCompra: string;
  dataVencimento: string;
  status: StatusPagamento;
  descricao: string;
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
