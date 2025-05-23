
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
  // organizacao_id será definido automaticamente pelo trigger
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
  
  const { data, error } = await supabase
    .from('dividas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar dívidas:', error);
    throw new Error(`Erro ao carregar dívidas: ${error.message}`);
  }

  console.log('Dívidas encontradas:', data?.length || 0);
  return data?.map(mapDividaFromDb) || [];
}

// Buscar dívidas por cliente
export async function listarDividasPorCliente(clienteId: string) {
  console.log('Buscando dívidas para cliente:', clienteId);
  
  const { data, error } = await supabase
    .from('dividas')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar dívidas do cliente:', error);
    throw new Error(`Erro ao carregar dívidas do cliente: ${error.message}`);
  }

  console.log('Dívidas do cliente encontradas:', data?.length || 0);
  return data?.map(mapDividaFromDb) || [];
}

// Buscar dívida por ID
export async function buscarDividaPorId(id: string) {
  console.log('Buscando dívida por ID:', id);
  
  const { data, error } = await supabase
    .from('dividas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar dívida:', error);
    if (error.code === 'PGRST116') {
      return null; // Dívida não encontrada
    }
    throw new Error(`Erro ao buscar dívida: ${error.message}`);
  }

  return data ? mapDividaFromDb(data) : null;
}

// Criar nova dívida
export async function criarDivida(divida: DividaInsert) {
  console.log('Criando nova dívida:', divida);
  
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
      mes_inicio_juros: divida.mes_inicio_juros || '2º mês'
      // organizacao_id será definido automaticamente pelo trigger
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar dívida:', error);
    throw new Error(`Erro ao criar dívida: ${error.message}`);
  }

  console.log('Dívida criada com sucesso:', data.id);
  return mapDividaFromDb(data);
}

// Atualizar dívida
export async function atualizarDivida(id: string, updates: DividaUpdate) {
  console.log('Atualizando dívida:', id, updates);
  
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
}

// Excluir dívida
export async function excluirDivida(id: string) {
  console.log('Excluindo dívida:', id);
  
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
}
