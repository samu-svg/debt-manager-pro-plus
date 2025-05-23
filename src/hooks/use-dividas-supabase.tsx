
import { useState, useEffect } from 'react';
import { Divida, StatusPagamento, MesInicioJuros } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { determinarStatusDivida } from '@/lib/utils';
import {
  listarDividas,
  listarDividasPorCliente,
  buscarDividaPorId,
  criarDivida,
  atualizarDivida,
  excluirDivida,
  DividaInsert,
  DividaUpdate
} from '@/services/dividas-service';

export const useDividasSupabase = (clienteId?: string) => {
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar dívidas
  const carregarDividas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = clienteId 
        ? await listarDividasPorCliente(clienteId)
        : await listarDividas();
      
      // Atualizar status das dívidas com base na data de vencimento
      const dividasAtualizadas = data.map(divida => {
        if (divida.status !== 'pago') {
          const novoStatus = determinarStatusDivida(divida.dataVencimento);
          return { ...divida, status: novoStatus };
        }
        return divida;
      });
      
      setDividas(dividasAtualizadas);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar dívidas:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as dívidas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar dívida por ID
  const buscarDivida = async (id: string) => {
    try {
      return await buscarDividaPorId(id);
    } catch (err) {
      console.error('Erro ao buscar dívida:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar a dívida',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Criar nova dívida
  const adicionarDivida = async (dadosDivida: Omit<Divida, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const dividaInsert: DividaInsert = {
        cliente_id: dadosDivida.clienteId,
        valor: dadosDivida.valor,
        data_compra: dadosDivida.dataCompra,
        data_vencimento: dadosDivida.dataVencimento,
        status: dadosDivida.status,
        descricao: dadosDivida.descricao,
        taxa_juros: dadosDivida.taxaJuros,
        mes_inicio_juros: dadosDivida.mesInicioJuros
      };

      const novaDivida = await criarDivida(dividaInsert);
      setDividas(prev => [novaDivida, ...prev]);
      
      toast({
        title: 'Sucesso',
        description: 'Dívida registrada com sucesso',
      });
      
      return novaDivida;
    } catch (err) {
      console.error('Erro ao criar dívida:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a dívida',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Atualizar dívida
  const editarDivida = async (id: string, updates: Partial<Omit<Divida, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const dividaUpdate: DividaUpdate = {};
      
      if (updates.valor !== undefined) dividaUpdate.valor = updates.valor;
      if (updates.dataCompra !== undefined) dividaUpdate.data_compra = updates.dataCompra;
      if (updates.dataVencimento !== undefined) dividaUpdate.data_vencimento = updates.dataVencimento;
      if (updates.status !== undefined) dividaUpdate.status = updates.status;
      if (updates.descricao !== undefined) dividaUpdate.descricao = updates.descricao;
      if (updates.taxaJuros !== undefined) dividaUpdate.taxa_juros = updates.taxaJuros;
      if (updates.mesInicioJuros !== undefined) dividaUpdate.mes_inicio_juros = updates.mesInicioJuros;

      const dividaAtualizada = await atualizarDivida(id, dividaUpdate);
      setDividas(prev => prev.map(d => d.id === id ? dividaAtualizada : d));
      
      toast({
        title: 'Sucesso',
        description: 'Dívida atualizada com sucesso',
      });
      
      return dividaAtualizada;
    } catch (err) {
      console.error('Erro ao atualizar dívida:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a dívida',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Marcar como paga
  const marcarComoPaga = async (id: string) => {
    return await editarDivida(id, { status: 'pago' });
  };

  // Remover dívida
  const removerDivida = async (id: string) => {
    try {
      await excluirDivida(id);
      setDividas(prev => prev.filter(d => d.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Dívida removida com sucesso',
      });
      
      return true;
    } catch (err) {
      console.error('Erro ao remover dívida:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a dívida',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Filtrar por status
  const filtrarPorStatus = (status: StatusPagamento) => {
    return dividas.filter(divida => divida.status === status);
  };

  // Carregar dívidas na inicialização
  useEffect(() => {
    carregarDividas();
  }, [clienteId]);

  return {
    dividas,
    loading,
    error,
    buscarDivida,
    adicionarDivida,
    editarDivida,
    marcarComoPaga,
    removerDivida,
    filtrarPorStatus,
    recarregarDividas: carregarDividas
  };
};
