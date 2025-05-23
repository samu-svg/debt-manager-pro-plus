
import { Cliente } from '@/types';

/**
 * Converter dados do banco para o formato da aplicação
 */
export const mapDbClienteToCliente = (dbCliente: any): Cliente => {
  return {
    id: dbCliente.id.toString(),
    nome: dbCliente.nome,
    cpf: dbCliente.cpf || '',
    telefone: dbCliente.telefone || '',
    createdAt: dbCliente.created_at || new Date().toISOString(),
    updatedAt: dbCliente.updated_at || new Date().toISOString()
  };
};

/**
 * Prepara dados do cliente para envio ao banco
 */
export const prepareClienteForDb = (
  cliente: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>, 
  organizacaoId: string
) => {
  return {
    nome: cliente.nome,
    cpf: cliente.cpf,
    telefone: cliente.telefone,
    organizacao_id: organizacaoId
  };
};
