
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocalData } from '@/contexts/LocalDataContext';
import { ClienteLocal } from '@/types/localStorage';

export const useClientesLocal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { 
    clientes, 
    criarCliente, 
    atualizarCliente, 
    removerCliente, 
    buscarClientes,
    recarregar 
  } = useLocalData();

  // Carregar cliente por ID
  const getCliente = (id: string) => {
    try {
      return clientes.find(c => c.id === id) || null;
    } catch (err) {
      console.error('Erro ao buscar cliente:', err);
      setError('Erro ao buscar cliente');
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar o cliente',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Adicionar novo cliente
  const criarClienteLocal = async (clienteData: Omit<ClienteLocal, 'id' | 'createdAt' | 'updatedAt' | 'dividas' | 'pagamentos'>) => {
    try {
      setLoading(true);
      console.log('Criando cliente:', clienteData);
      
      const novoCliente = criarCliente(clienteData);
      console.log('Cliente criado com sucesso:', novoCliente);
      
      toast({
        title: 'Sucesso',
        description: 'Cliente cadastrado com sucesso',
      });
      
      return novoCliente;
    } catch (err) {
      console.error('Erro ao criar cliente:', err);
      setError('Erro ao criar cliente');
      toast({
        title: 'Erro',
        description: 'Não foi possível cadastrar o cliente. Verifique se todos os campos estão preenchidos corretamente.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar cliente existente
  const atualizarClienteLocal = async (
    id: string, 
    updates: Partial<Omit<ClienteLocal, 'id' | 'createdAt' | 'dividas' | 'pagamentos'>>
  ) => {
    try {
      setLoading(true);
      console.log('Atualizando cliente:', id, updates);

      const clienteAtualizado = atualizarCliente(id, updates);
      
      if (!clienteAtualizado) {
        throw new Error('Cliente não encontrado');
      }
      
      console.log('Cliente atualizado com sucesso:', clienteAtualizado);
      
      toast({
        title: 'Sucesso',
        description: 'Cliente atualizado com sucesso',
      });
      
      return clienteAtualizado;
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      setError('Erro ao atualizar cliente');
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o cliente',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Remover cliente
  const removerClienteLocal = async (id: string) => {
    try {
      setLoading(true);
      const sucesso = removerCliente(id);
      
      if (!sucesso) {
        throw new Error('Cliente não encontrado');
      }
      
      toast({
        title: 'Sucesso',
        description: 'Cliente removido com sucesso',
      });
      
      return true;
    } catch (err) {
      console.error('Erro ao remover cliente:', err);
      setError('Erro ao remover cliente');
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o cliente',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar clientes
  const buscarClientesLocal = (termo: string) => {
    try {
      return buscarClientes(termo);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError('Erro ao buscar clientes');
      return [];
    }
  };

  return {
    clientes,
    loading,
    error,
    getCliente,
    criarCliente: criarClienteLocal,
    atualizarCliente: atualizarClienteLocal,
    removerCliente: removerClienteLocal,
    buscarClientes: buscarClientesLocal,
    recarregarClientes: recarregar
  };
};
