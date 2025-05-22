
import { useState, useEffect } from 'react';
import { Divida, StatusPagamento } from '@/types';
import { addDivida, getDividas, getDividaById, getDividasByClienteId, updateDivida, deleteDivida } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { determinarStatusDivida } from '@/lib/utils';

export const useDividas = (clienteId?: string) => {
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar todas as dívidas ou dívidas de um cliente específico
  const loadDividas = () => {
    try {
      setLoading(true);
      const data = clienteId ? getDividasByClienteId(clienteId) : getDividas();
      
      // Atualiza o status das dívidas com base na data de vencimento
      const dividasAtualizadas = data.map(divida => {
        if (divida.status !== 'pago') {
          const novoStatus = determinarStatusDivida(divida.dataVencimento);
          return { ...divida, status: novoStatus };
        }
        return divida;
      });
      
      setDividas(dividasAtualizadas);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dívidas');
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
  const getDivida = (id: string) => {
    try {
      return getDividaById(id);
    } catch (err) {
      setError('Erro ao buscar dívida');
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar a dívida',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Adicionar nova dívida
  const criarDivida = (divida: Omit<Divida, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const novaDivida = addDivida(divida);
      setDividas(prev => [...prev, novaDivida]);
      toast({
        title: 'Sucesso',
        description: 'Dívida registrada com sucesso',
      });
      return novaDivida;
    } catch (err) {
      setError('Erro ao criar dívida');
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a dívida',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Atualizar dívida existente
  const atualizarDivida = (id: string, updates: Partial<Omit<Divida, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const dividaAtualizada = updateDivida(id, updates);
      if (dividaAtualizada) {
        setDividas(prev => prev.map(d => d.id === id ? dividaAtualizada : d));
        toast({
          title: 'Sucesso',
          description: 'Dívida atualizada com sucesso',
        });
      }
      return dividaAtualizada;
    } catch (err) {
      setError('Erro ao atualizar dívida');
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a dívida',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Marcar dívida como paga
  const marcarComoPaga = (id: string) => {
    try {
      const dividaAtualizada = updateDivida(id, { status: 'pago' });
      if (dividaAtualizada) {
        setDividas(prev => prev.map(d => d.id === id ? dividaAtualizada : d));
        toast({
          title: 'Sucesso',
          description: 'Dívida marcada como paga',
        });
      }
      return dividaAtualizada;
    } catch (err) {
      setError('Erro ao atualizar status da dívida');
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar a dívida como paga',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Remover dívida
  const removerDivida = (id: string) => {
    try {
      const dividaRemovida = deleteDivida(id);
      if (dividaRemovida) {
        setDividas(prev => prev.filter(d => d.id !== id));
        toast({
          title: 'Sucesso',
          description: 'Dívida removida com sucesso',
        });
      }
      return dividaRemovida;
    } catch (err) {
      setError('Erro ao remover dívida');
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a dívida',
        variant: 'destructive',
      });
      return null;
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
