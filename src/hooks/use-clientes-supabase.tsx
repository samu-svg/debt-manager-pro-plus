
import { useState, useEffect } from 'react';
import { Cliente } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatarCPF, formatarTelefone } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export const useClientesSupabase = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, organization } = useAuth();

  // Converter dados do banco para o formato da aplicação
  const mapDbClienteToCliente = (dbCliente: any): Cliente => {
    return {
      id: dbCliente.id.toString(),
      nome: dbCliente.nome,
      cpf: dbCliente.cpf || '',
      telefone: dbCliente.telefone || '',
      createdAt: dbCliente.created_at || new Date().toISOString(),
      updatedAt: dbCliente.updated_at || new Date().toISOString()
    };
  };

  // Carregar todos os clientes
  const loadClientes = async () => {
    try {
      setLoading(true);
      console.log('Carregando clientes da organização:', organization?.id);
      
      if (!user || !organization?.id) {
        console.error('Usuário não autenticado ou sem organização');
        setClientes([]);
        return;
      }

      // Usando o tipo 'any' temporariamente para evitar erros de TypeScript
      // até que o Supabase regenere os tipos
      const { data, error: supaError } = await (supabase as any)
        .from('clientes')
        .select('*')
        .eq('organizacao_id', organization.id);

      if (supaError) {
        console.error('Erro ao buscar clientes:', supaError);
        throw supaError;
      }
      
      console.log('Clientes carregados:', data);
      const clientesMapeados = data ? data.map(mapDbClienteToCliente) : [];
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
      const { data, error: supaError } = await (supabase as any)
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

      if (supaError) throw supaError;
      return mapDbClienteToCliente(data);
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
      if (!organization?.id) {
        toast({
          title: 'Erro',
          description: 'Organização não encontrada',
          variant: 'destructive',
        });
        return null;
      }

      const novoClienteDB = {
        nome: cliente.nome,
        cpf: cliente.cpf,
        telefone: cliente.telefone,
        organizacao_id: organization.id
      };

      console.log('Criando cliente:', novoClienteDB);

      const { data, error: supaError } = await (supabase as any)
        .from('clientes')
        .insert(novoClienteDB)
        .select()
        .single();

      if (supaError) {
        console.error('Erro ao criar cliente:', supaError);
        throw supaError;
      }

      console.log('Cliente criado com sucesso:', data);
      const novoCliente = mapDbClienteToCliente(data);
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
        description: 'Não foi possível cadastrar o cliente',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Atualizar cliente existente
  const atualizarCliente = async (id: string, updates: Partial<Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      console.log('Atualizando cliente:', id, updates);

      const clienteDB = {
        nome: updates.nome,
        cpf: updates.cpf,
        telefone: updates.telefone,
        updated_at: new Date().toISOString()
      };

      const { data, error: supaError } = await (supabase as any)
        .from('clientes')
        .update(clienteDB)
        .eq('id', id)
        .select()
        .single();

      if (supaError) {
        console.error('Erro ao atualizar cliente no Supabase:', supaError);
        throw supaError;
      }

      console.log('Cliente atualizado com sucesso:', data);
      const clienteAtualizado = mapDbClienteToCliente(data);
      
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
      const { error: supaError, data } = await (supabase as any)
        .from('clientes')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (supaError) throw supaError;
      
      const clienteRemovido = mapDbClienteToCliente(data);
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
      
      const termoLowerCase = termo.toLowerCase();
      const cpfLimpo = termo.replace(/\D/g, '');
      
      console.log('Buscando clientes por termo:', termoLowerCase, 'ou CPF:', cpfLimpo);
      
      // Usando o tipo 'any' temporariamente para evitar erros de TypeScript
      let query = (supabase as any)
        .from('clientes')
        .select('*')
        .eq('organizacao_id', organization.id);
        
      // Aplicar filtros usando ilike para busca parcial case-insensitive
      query = query.or(`nome.ilike.%${termoLowerCase}%,cpf.ilike.%${cpfLimpo}%`);
      
      const { data, error: supaError } = await query;
      
      if (supaError) throw supaError;
      
      console.log('Resultados da busca:', data);
      return data ? data.map(mapDbClienteToCliente) : [];
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError('Erro ao buscar clientes');
      return [];
    }
  };

  // Carregar clientes na inicialização
  useEffect(() => {
    if (user && organization) {
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
