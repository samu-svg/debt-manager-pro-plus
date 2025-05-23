
import { supabase } from '@/integrations/supabase/client';
import { Divida, StatusPagamento, MesInicioJuros } from '@/types';

// Interface for inserting a new record
export interface DividaInsert {
  cliente_id: string;
  valor: number;
  data_compra: string;
  data_vencimento: string;
  status: StatusPagamento;
  descricao?: string;
  taxa_juros?: number;
  mes_inicio_juros?: MesInicioJuros;
  organizacao_id: string; // Agora obrigatório
}

// Interface for updating an existing record
export interface DividaUpdate {
  valor?: number;
  data_compra?: string;
  data_vencimento?: string;
  status?: StatusPagamento;
  descricao?: string;
  taxa_juros?: number;
  mes_inicio_juros?: MesInicioJuros;
}

// Mapear dados do banco para o tipo da aplicação
export function mapDividaFromDb(dbDivida: any): Divida {
  return {
    id: dbDivida.id,
    clienteId: dbDivida.cliente_id,
    valor: Number(dbDivida.valor),
    dataCompra: dbDivida.data_compra,
    dataVencimento: dbDivida.data_vencimento,
    status: dbDivida.status as StatusPagamento,
    descricao: dbDivida.descricao || '',
    taxaJuros: dbDivida.taxa_juros ? Number(dbDivida.taxa_juros) : 3,
    mesInicioJuros: dbDivida.mes_inicio_juros as MesInicioJuros || '2º mês',
    createdAt: dbDivida.created_at,
    updatedAt: dbDivida.updated_at
  };
}

// Listar todas as dívidas da organização do usuário
export async function listarDividas() {
  console.log('Buscando dívidas no Supabase...');
  
  try {
    // Verificar se o usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Buscar organização do usuário
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('organizacao_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar organização do usuário:', userError);
      throw new Error(`Erro ao carregar dados do usuário: ${userError.message}`);
    }
    
    if (!userData?.organizacao_id) {
      console.error('Usuário não possui organização associada');
      return [];
    }

    const { data, error } = await supabase
      .from('dividas')
      .select('*')
      .eq('organizacao_id', userData.organizacao_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar dívidas:', error);
      throw new Error(`Erro ao carregar dívidas: ${error.message}`);
    }

    console.log('Dívidas encontradas:', data?.length || 0);
    return data?.map(mapDividaFromDb) || [];
  } catch (error) {
    console.error('Erro geral ao buscar dívidas:', error);
    throw error;
  }
}

// Buscar dívidas por cliente
export async function listarDividasPorCliente(clienteId: string) {
  console.log('Buscando dívidas para cliente:', clienteId);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('organizacao_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar organização do usuário:', userError);
      throw new Error(`Erro ao carregar dados do usuário: ${userError.message}`);
    }

    const { data, error } = await supabase
      .from('dividas')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('organizacao_id', userData.organizacao_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar dívidas do cliente:', error);
      throw new Error(`Erro ao carregar dívidas do cliente: ${error.message}`);
    }

    console.log('Dívidas do cliente encontradas:', data?.length || 0);
    return data?.map(mapDividaFromDb) || [];
  } catch (error) {
    console.error('Erro geral ao buscar dívidas do cliente:', error);
    throw error;
  }
}

// Buscar dívida por ID
export async function buscarDividaPorId(id: string) {
  console.log('Buscando dívida por ID:', id);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('organizacao_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar organização do usuário:', userError);
      throw new Error(`Erro ao carregar dados do usuário: ${userError.message}`);
    }

    const { data, error } = await supabase
      .from('dividas')
      .select('*')
      .eq('id', id)
      .eq('organizacao_id', userData.organizacao_id)
      .single();

    if (error) {
      console.error('Erro ao buscar dívida:', error);
      if (error.code === 'PGRST116') {
        return null; // Dívida não encontrada
      }
      throw new Error(`Erro ao buscar dívida: ${error.message}`);
    }

    return data ? mapDividaFromDb(data) : null;
  } catch (error) {
    console.error('Erro geral ao buscar dívida:', error);
    throw error;
  }
}

// Criar nova dívida
export async function criarDivida(divida: DividaInsert) {
  console.log('Criando nova dívida:', divida);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('organizacao_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar organização do usuário:', userError);
      throw new Error(`Erro ao carregar dados do usuário: ${userError.message}`);
    }

    // Garantir que a organização_id seja a do usuário logado
    divida.organizacao_id = userData.organizacao_id;

    const { data, error } = await supabase
      .from('dividas')
      .insert({
        cliente_id: divida.cliente_id,
        valor: divida.valor,
        data_compra: divida.data_compra,
        data_vencimento: divida.data_vencimento,
        status: divida.status,
        descricao: divida.descricao,
        taxa_juros: divida.taxa_juros || 3,
        mes_inicio_juros: divida.mes_inicio_juros || '2º mês',
        organizacao_id: divida.organizacao_id
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar dívida:', error);
      throw new Error(`Erro ao criar dívida: ${error.message}`);
    }

    console.log('Dívida criada com sucesso:', data.id);
    return mapDividaFromDb(data);
  } catch (error) {
    console.error('Erro geral ao criar dívida:', error);
    throw error;
  }
}

// Atualizar dívida
export async function atualizarDivida(id: string, updates: DividaUpdate) {
  console.log('Atualizando dívida:', id, updates);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('organizacao_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar organização do usuário:', userError);
      throw new Error(`Erro ao carregar dados do usuário: ${userError.message}`);
    }

    // Verificar se a dívida pertence ao usuário
    const { data: dividaExistente, error: dividaError } = await supabase
      .from('dividas')
      .select('id')
      .eq('id', id)
      .eq('organizacao_id', userData.organizacao_id)
      .single();

    if (dividaError || !dividaExistente) {
      console.error('Dívida não encontrada ou não pertence ao usuário');
      throw new Error('Dívida não encontrada ou não pertence ao usuário');
    }
  
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.valor !== undefined) updateData.valor = updates.valor;
    if (updates.data_compra !== undefined) updateData.data_compra = updates.data_compra;
    if (updates.data_vencimento !== undefined) updateData.data_vencimento = updates.data_vencimento;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
    if (updates.taxa_juros !== undefined) updateData.taxa_juros = updates.taxa_juros;
    if (updates.mes_inicio_juros !== undefined) updateData.mes_inicio_juros = updates.mes_inicio_juros;

    const { data, error } = await supabase
      .from('dividas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar dívida:', error);
      throw new Error(`Erro ao atualizar dívida: ${error.message}`);
    }

    console.log('Dívida atualizada com sucesso');
    return mapDividaFromDb(data);
  } catch (error) {
    console.error('Erro geral ao atualizar dívida:', error);
    throw error;
  }
}

// Excluir dívida
export async function excluirDivida(id: string) {
  console.log('Excluindo dívida:', id);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('organizacao_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar organização do usuário:', userError);
      throw new Error(`Erro ao carregar dados do usuário: ${userError.message}`);
    }

    // Verificar se a dívida pertence ao usuário
    const { data: dividaExistente, error: dividaError } = await supabase
      .from('dividas')
      .select('id')
      .eq('id', id)
      .eq('organizacao_id', userData.organizacao_id)
      .single();

    if (dividaError || !dividaExistente) {
      console.error('Dívida não encontrada ou não pertence ao usuário');
      throw new Error('Dívida não encontrada ou não pertence ao usuário');
    }

    const { error } = await supabase
      .from('dividas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir dívida:', error);
      throw new Error(`Erro ao excluir dívida: ${error.message}`);
    }

    console.log('Dívida excluída com sucesso');
    return true;
  } catch (error) {
    console.error('Erro geral ao excluir dívida:', error);
    throw error;
  }
}
