
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types';
import { mapDbClienteToCliente, prepareClienteForDb } from '@/utils/cliente-mappers';

/**
 * Busca todos os clientes de uma organização
 */
export const fetchClientes = async (organizacaoId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se o usuário pertence à organização
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('organizacao_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
      throw userError;
    }

    if (userData.organizacao_id !== organizacaoId) {
      console.error('Usuário não pertence à organização solicitada');
      throw new Error('Acesso negado: usuário não pertence à organização solicitada');
    }

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('organizacao_id', organizacaoId);

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
    
    return data ? data.map(mapDbClienteToCliente) : [];
  } catch (error) {
    console.error('Erro geral ao buscar clientes:', error);
    throw error;
  }
};

/**
 * Busca um cliente específico por ID
 */
export const fetchClienteById = async (id: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se o usuário tem acesso ao cliente
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('organizacao_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
      throw userError;
    }

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .eq('organizacao_id', userData.organizacao_id)
      .single();

    if (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
    
    return mapDbClienteToCliente(data);
  } catch (error) {
    console.error('Erro geral ao buscar cliente por ID:', error);
    throw error;
  }
};

/**
 * Cria um novo cliente
 */
export const createCliente = async (
  cliente: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>,
  organizacaoId: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se o usuário pertence à organização
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('organizacao_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
      throw userError;
    }

    if (userData.organizacao_id !== organizacaoId) {
      console.error('Usuário não pertence à organização solicitada');
      throw new Error('Acesso negado: usuário não pertence à organização solicitada');
    }

    const clienteDb = prepareClienteForDb(cliente, organizacaoId);
    
    const { data, error } = await supabase
      .from('clientes')
      .insert(clienteDb)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
    
    return mapDbClienteToCliente(data);
  } catch (error) {
    console.error('Erro geral ao criar cliente:', error);
    throw error;
  }
};

/**
 * Atualiza um cliente existente
 */
export const updateCliente = async (
  id: string,
  updates: Partial<Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>>
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se o usuário tem acesso ao cliente
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('organizacao_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
      throw userError;
    }

    // Verificar se o cliente pertence à organização do usuário
    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      .select('id')
      .eq('id', id)
      .eq('organizacao_id', userData.organizacao_id)
      .single();

    if (clienteError || !clienteData) {
      console.error('Cliente não encontrado ou não pertence à organização do usuário');
      throw new Error('Cliente não encontrado ou não pertence à organização do usuário');
    }

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

    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
    
    return mapDbClienteToCliente(data);
  } catch (error) {
    console.error('Erro geral ao atualizar cliente:', error);
    throw error;
  }
};

/**
 * Remove um cliente
 */
export const removeCliente = async (id: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se o usuário tem acesso ao cliente
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('organizacao_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
      throw userError;
    }

    // Verificar se o cliente pertence à organização do usuário
    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      .select('id')
      .eq('id', id)
      .eq('organizacao_id', userData.organizacao_id)
      .single();

    if (clienteError || !clienteData) {
      console.error('Cliente não encontrado ou não pertence à organização do usuário');
      throw new Error('Cliente não encontrado ou não pertence à organização do usuário');
    }

    const { data, error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao remover cliente:', error);
      throw error;
    }
    
    return mapDbClienteToCliente(data);
  } catch (error) {
    console.error('Erro geral ao remover cliente:', error);
    throw error;
  }
};

/**
 * Busca clientes por termo (nome ou CPF)
 */
export const searchClientes = async (termo: string, organizacaoId: string) => {
  try {
    if (!organizacaoId) return [];
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se o usuário pertence à organização
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('organizacao_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
      throw userError;
    }

    if (userData.organizacao_id !== organizacaoId) {
      console.error('Usuário não pertence à organização solicitada');
      throw new Error('Acesso negado: usuário não pertence à organização solicitada');
    }

    const termoLowerCase = termo.toLowerCase();
    const cpfLimpo = termo.replace(/\D/g, '');
    
    let query = supabase
      .from('clientes')
      .select('*')
      .eq('organizacao_id', organizacaoId);
      
    query = query.or(`nome.ilike.%${termoLowerCase}%,cpf.ilike.%${cpfLimpo}%`);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar clientes por termo:', error);
      throw error;
    }
    
    return data ? data.map(mapDbClienteToCliente) : [];
  } catch (error) {
    console.error('Erro geral ao buscar clientes por termo:', error);
    throw error;
  }
};
