
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocalData } from '@/contexts/LocalDataContext';
import { DividaLocal } from '@/types/localStorage';

export const useDividasLocal = (clienteId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { 
    dividas, 
    criarDivida, 
    atualizarDivida, 
    removerDivida, 
    obterDividasPorCliente,
    recarregar 
  } = useLocalData();

  // Filtrar dívidas por cliente se especificado
  const dividasFiltradas = clienteId 
    ? dividas.filter(d => d.clienteId === clienteId)
    : dividas;

  // Buscar dívida por ID
  const buscarDivida = (id: string) => {
    try {
      return dividas.find(d => d.id === id) || null;
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
  const adicionarDivida = async (dividaData: Omit<DividaLocal, 'id' | 'createdAt' | 'updatedAt' | 'valorAtualizado'>) => {
    try {
      setLoading(true);
      
      const novaDivida = criarDivida(dividaData);
      
      if (!novaDivida) {
        throw new Error('Não foi possível criar a dívida');
      }
      
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
    } finally {
      setLoading(false);
    }
  };

  // Atualizar dívida
  const editarDivida = async (id: string, updates: Partial<Omit<DividaLocal, 'id' | 'createdAt'>>) => {
    try {
      setLoading(true);
      
      const dividaAtualizada = atualizarDivida(id, updates);
      
      if (!dividaAtualizada) {
        throw new Error('Dívida não encontrada');
      }
      
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
    } finally {
      setLoading(false);
    }
  };

  // Marcar como paga
  const marcarComoPaga = async (id: string) => {
    return await editarDivida(id, { status: 'pago' });
  };

  // Remover dívida
  const removerDividaLocal = async (id: string) => {
    try {
      setLoading(true);
      const sucesso = removerDivida(id);
      
      if (!sucesso) {
        throw new Error('Dívida não encontrada');
      }
      
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
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por status
  const filtrarPorStatus = (status: 'pendente' | 'pago' | 'vencido') => {
    return dividasFiltradas.filter(divida => divida.status === status);
  };

  return {
    dividas: dividasFiltradas,
    loading,
    error,
    buscarDivida,
    adicionarDivida,
    editarDivida,
    marcarComoPaga,
    removerDivida: removerDividaLocal,
    filtrarPorStatus,
    recarregarDividas: recarregar
  };
};
