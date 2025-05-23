
import { useState, useEffect } from 'react';
import { Cliente } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import * as ClientesService from '@/services/clientes-service';

export const useClientesSupabase = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, organization } = useAuth();

  // Carregar todos os clientes
  const loadClientes = async () => {
    try {
      setLoading(true);
      console.log('Carregando clientes da organização:', organization?.id);
      
      if (!user) {
        console.error('Usuário não autenticado');
        setClientes([]);
        return;
      }

      if (!organization?.id) {
        console.error('Usuário não possui organização associada');
        setClientes([]);
        toast({
          title: 'Erro',
          description: 'Você precisa estar associado a uma organização para gerenciar clientes',
          variant: 'destructive',
        });
        return;
      }

      const clientesMapeados = await ClientesService.fetchClientes(organization.id);
      console.log('Clientes carregados:', clientesMapeados);
      
      setClientes(clientesMapeados);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError('Erro ao carregar clientes');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os clientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar cliente por ID
  const getCliente = async (id: string) => {
    try {
      return await ClientesService.fetchClienteById(id);
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
  const criarCliente = async (cliente: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar logado para criar clientes',
          variant: 'destructive',
        });
        return null;
      }

      if (!organization?.id) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar associado a uma organização para criar clientes',
          variant: 'destructive',
        });
        return null;
      }

      console.log('Criando cliente:', cliente);
      console.log('Organização ID:', organization.id);
      
      const novoCliente = await ClientesService.createCliente(cliente, organization.id);
      console.log('Cliente criado com sucesso:', novoCliente);
      
      setClientes(prev => [...prev, novoCliente]);
      
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
    }
  };

  // Atualizar cliente existente
  const atualizarCliente = async (
    id: string, 
    updates: Partial<Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    try {
      console.log('Atualizando cliente:', id, updates);

      const clienteAtualizado = await ClientesService.updateCliente(id, updates);
      console.log('Cliente atualizado com sucesso:', clienteAtualizado);
      
      setClientes(prev => prev.map(c => c.id === id ? clienteAtualizado : c));
      
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
    }
  };

  // Remover cliente
  const removerCliente = async (id: string) => {
    try {
      const clienteRemovido = await ClientesService.removeCliente(id);
      
      setClientes(prev => prev.filter(c => c.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Cliente removido com sucesso',
      });
      
      return clienteRemovido;
    } catch (err) {
      console.error('Erro ao remover cliente:', err);
      setError('Erro ao remover cliente');
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o cliente',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Buscar clientes
  const buscarClientes = async (termo: string) => {
    try {
      if (!organization?.id) return [];
      
      return await ClientesService.searchClientes(termo, organization.id);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError('Erro ao buscar clientes');
      return [];
    }
  };

  // Carregar clientes na inicialização
  useEffect(() => {
    if (user && organization?.id) {
      loadClientes();
    }
  }, [user, organization]);

  return {
    clientes,
    loading,
    error,
    getCliente,
    criarCliente,
    atualizarCliente,
    removerCliente,
    buscarClientes,
    recarregarClientes: loadClientes
  };
};
