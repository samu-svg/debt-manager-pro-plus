
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
