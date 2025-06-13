
import { PagamentoLocal } from '@/types/localStorage';
import { getDadosLocais, salvarDadosLocais } from './core.service';
import { obterClientePorId } from './clientes.service';

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
