
import { useState, useEffect } from 'react';
import { Cliente } from '@/types';
import { addCliente, getClientes, getClienteById, updateCliente, deleteCliente } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar todos os clientes
  const loadClientes = () => {
    try {
      setLoading(true);
      const data = getClientes();
      setClientes(data);
      setError(null);
    } catch (err) {
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
  const getCliente = (id: string) => {
    try {
      return getClienteById(id);
    } catch (err) {
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
  const criarCliente = (cliente: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const novoCliente = addCliente(cliente);
      setClientes(prev => [...prev, novoCliente]);
      toast({
        title: 'Sucesso',
        description: 'Cliente cadastrado com sucesso',
      });
      return novoCliente;
    } catch (err) {
      setError('Erro ao criar cliente');
      toast({
        title: 'Erro',
        description: 'Não foi possível cadastrar o cliente',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Atualizar cliente existente
  const atualizarCliente = (id: string, updates: Partial<Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const clienteAtualizado = updateCliente(id, updates);
      if (clienteAtualizado) {
        setClientes(prev => prev.map(c => c.id === id ? clienteAtualizado : c));
        toast({
          title: 'Sucesso',
          description: 'Cliente atualizado com sucesso',
        });
      }
      return clienteAtualizado;
    } catch (err) {
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
  const removerCliente = (id: string) => {
    try {
      const clienteRemovido = deleteCliente(id);
      if (clienteRemovido) {
        setClientes(prev => prev.filter(c => c.id !== id));
        toast({
          title: 'Sucesso',
          description: 'Cliente removido com sucesso',
        });
      }
      return clienteRemovido;
    } catch (err) {
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
  const buscarClientes = (termo: string) => {
    try {
      const termoLowerCase = termo.toLowerCase();
      const resultados = getClientes().filter(
        cliente => 
          cliente.nome.toLowerCase().includes(termoLowerCase) || 
          cliente.cpf.replace(/\D/g, '').includes(termoLowerCase)
      );
      return resultados;
    } catch (err) {
      setError('Erro ao buscar clientes');
      return [];
    }
  };

  // Carregar clientes na inicialização
  useEffect(() => {
    loadClientes();
  }, []);

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
