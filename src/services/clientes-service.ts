
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types';
import { mapDbClienteToCliente, prepareClienteForDb } from '@/utils/cliente-mappers';

/**
 * Busca todos os clientes de uma organização
 */
export const fetchClientes = async (organizacaoId: string) => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('organizacao_id', organizacaoId);

  if (error) throw error;
  
  return data ? data.map(mapDbClienteToCliente) : [];
};

/**
 * Busca um cliente específico por ID
 */
export const fetchClienteById = async (id: string) => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  
  return mapDbClienteToCliente(data);
};

/**
 * Cria um novo cliente
 */
export const createCliente = async (
  cliente: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>,
  organizacaoId: string
) => {
  const clienteDb = prepareClienteForDb(cliente, organizacaoId);
  
  const { data, error } = await supabase
    .from('clientes')
    .insert(clienteDb)
    .select()
    .single();

  if (error) throw error;
  
  return mapDbClienteToCliente(data);
};

/**
 * Atualiza um cliente existente
 */
export const updateCliente = async (
  id: string,
  updates: Partial<Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>>
) => {
  const clienteDb = {
    nome: updates.nome,
    cpf: updates.cpf,
    telefone: updates.telefone,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('clientes')
    .update(clienteDb)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  return mapDbClienteToCliente(data);
};

/**
 * Remove um cliente
 */
export const removeCliente = async (id: string) => {
  const { data, error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  return mapDbClienteToCliente(data);
};

/**
 * Busca clientes por termo (nome ou CPF)
 */
export const searchClientes = async (termo: string, organizacaoId: string) => {
  if (!organizacaoId) return [];
  
  const termoLowerCase = termo.toLowerCase();
  const cpfLimpo = termo.replace(/\D/g, '');
  
  let query = supabase
    .from('clientes')
    .select('*')
    .eq('organizacao_id', organizacaoId);
    
  query = query.or(`nome.ilike.%${termoLowerCase}%,cpf.ilike.%${cpfLimpo}%`);
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return data ? data.map(mapDbClienteToCliente) : [];
};
