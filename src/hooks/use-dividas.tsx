
import { useState, useEffect } from 'react';
import { Divida, StatusPagamento } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { determinarStatusDivida } from '@/lib/utils';
import {
  listarDividas,
  listarDividasPorCliente,
  buscarDividaPorId,
  criarDivida as criarDividaService,
  atualizarDivida as atualizarDividaService,
  excluirDivida,
  DividaInsert,
  DividaUpdate
} from '@/services/dividas-service';

export const useDividas = (clienteId?: string) => {
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar todas as dívidas ou dívidas de um cliente específico
  const loadDividas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = clienteId 
        ? await listarDividasPorCliente(clienteId)
        : await listarDividas();
      
      // Atualiza o status das dívidas com base na data de vencimento
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

  // Carregar dívida por ID
  const getDivida = async (id: string) => {
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

  // Adicionar nova dívida
  const criarDivida = async (divida: Omit<Divida, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const dividaInsert: DividaInsert = {
        cliente_id: divida.clienteId,
        valor: divida.valor,
        data_compra: divida.dataCompra,
        data_vencimento: divida.dataVencimento,
        status: divida.status,
        descricao: divida.descricao,
        taxa_juros: divida.taxaJuros,
        mes_inicio_juros: divida.mesInicioJuros
      };

      const novaDivida = await criarDividaService(dividaInsert);
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

  // Atualizar dívida existente
  const atualizarDivida = async (id: string, updates: Partial<Omit<Divida, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const dividaUpdate: DividaUpdate = {};
      
      if (updates.valor !== undefined) dividaUpdate.valor = updates.valor;
      if (updates.dataCompra !== undefined) dividaUpdate.data_compra = updates.dataCompra;
      if (updates.dataVencimento !== undefined) dividaUpdate.data_vencimento = updates.dataVencimento;
      if (updates.status !== undefined) dividaUpdate.status = updates.status;
      if (updates.descricao !== undefined) dividaUpdate.descricao = updates.descricao;
      if (updates.taxaJuros !== undefined) dividaUpdate.taxa_juros = updates.taxaJuros;
      if (updates.mesInicioJuros !== undefined) dividaUpdate.mes_inicio_juros = updates.mesInicioJuros;

      const dividaAtualizada = await atualizarDividaService(id, dividaUpdate);
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

  // Marcar dívida como paga
  const marcarComoPaga = async (id: string) => {
    return await atualizarDivida(id, { status: 'pago' });
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

  // Filtrar dívidas por status
  const filtrarPorStatus = (status: StatusPagamento) => {
    return dividas.filter(divida => divida.status === status);
  };

  // Carregar dívidas na inicialização
  useEffect(() => {
    loadDividas();
  }, [clienteId]);

  return {
    dividas,
    loading,
    error,
    getDivida,
    criarDivida,
    atualizarDivida,
    marcarComoPaga,
    removerDivida,
    filtrarPorStatus,
    recarregarDividas: loadDividas
  };
};
