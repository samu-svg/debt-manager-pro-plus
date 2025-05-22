
import { DbCliente, DbDivida } from './index';

// Tipo para o status do envio de mensagens
export type StatusMensagem = 'pendente' | 'enviado' | 'erro' | 'lido';

// Tipo para configuração de mensagem automática
export interface ConfiguracaoMensagem {
  templateMensagem: string;
  horarioEnvio: string; // formato HH:MM
  limiteDiario: number;
  diasSemana: number[]; // 0 = domingo, 1 = segunda, ..., 6 = sábado
}

// Tipo para comunicação do banco de dados
export interface DbComunicacao {
  id: number;
  cliente_id: number;
  divida_id: number | null;
  tipo: string;
  mensagem: string;
  status: string;
  data_envio: string | null;
  data_criacao: string;
}

// Tipo para comunicação da aplicação
export interface Comunicacao {
  id: string;
  clienteId: string;
  dividaId: string | null;
  tipo: string;
  mensagem: string;
  status: StatusMensagem;
  dataEnvio: string | null;
  dataCriacao: string;
}

// Função de mapeamento entre tipos da aplicação e banco de dados
export function mapDbComunicacaoToComunicacao(dbComunicacao: DbComunicacao): Comunicacao {
  const statusMap: Record<string, StatusMensagem> = {
    'pendente': 'pendente',
    'enviado': 'enviado',
    'erro': 'erro',
    'lido': 'lido'
  };
  
  return {
    id: dbComunicacao.id.toString(),
    clienteId: dbComunicacao.cliente_id.toString(),
    dividaId: dbComunicacao.divida_id ? dbComunicacao.divida_id.toString() : null,
    tipo: dbComunicacao.tipo,
    mensagem: dbComunicacao.mensagem,
    status: statusMap[dbComunicacao.status] || 'pendente',
    dataEnvio: dbComunicacao.data_envio,
    dataCriacao: dbComunicacao.data_criacao
  };
}

// Função para construir uma mensagem a partir de um template e dados do cliente/dívida
export function construirMensagem(
  template: string,
  cliente: DbCliente,
  divida: DbDivida,
  mesesAtraso: number,
  valorCorrigido: number
): string {
  return template
    .replace(/{NOME}/g, cliente.nome)
    .replace(/{VALOR_ORIGINAL}/g, divida.valor_original.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
    .replace(/{MESES_ATRASO}/g, mesesAtraso.toString())
    .replace(/{VALOR_CORRIGIDO}/g, valorCorrigido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
    .replace(/{DATA_VENCIMENTO}/g, new Date(divida.data_vencimento).toLocaleDateString('pt-BR'));
}
