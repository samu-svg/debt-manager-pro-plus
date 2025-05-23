
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Organization = {
  id: string;
  nome: string;
  slug: string;
  plano: string;
  limite_devedores: number;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  organization: Organization | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, organizationName?: string) => Promise<{ error: Error | null; data: { user: User | null } | null }>;
  signOut: () => Promise<void>;
  createOrganization: (name: string) => Promise<{ error: Error | null }>;
  loadOrganization: () => Promise<Organization | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const { toast } = useToast();

  // Verificar se o usuário tem uma organização
  const loadUserOrganization = async (userId: string) => {
    console.log('Carregando organização para o usuário:', userId);
    try {
      // Verificar se o usuário já existe na tabela usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('organizacao_id, organizacoes(*)')
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        console.error('Erro ao carregar dados do usuário:', userError);
        return null;
      }

      // Se o usuário não existe na tabela, criar um novo registro
      if (!userData) {
        console.info('Usuário não encontrado na tabela usuarios, criando entrada...');
        
        // Tentar criar uma organização padrão para o usuário
        const org = await createDefaultOrganization(userId);
        return org;
      }

      // Se o usuário já tem uma organização
      if (userData.organizacao_id && userData.organizacoes) {
        console.log('Organização encontrada:', userData.organizacoes);
        setOrganization(userData.organizacoes as Organization);
        return userData.organizacoes as Organization;
      } else {
        // Se o usuário não tem uma organização, criar uma
        console.log('Usuário não possui organização, criando uma padrão...');
        const org = await createDefaultOrganization(userId);
        return org;
      }
    } catch (error) {
      console.error('Erro ao carregar organização:', error);
      return null;
    }
  };

  // Criar uma organização padrão para o usuário
  const createDefaultOrganization = async (userId: string, orgName?: string) => {
    console.log('Criando organização padrão para o usuário:', userId);
    try {
      // Gerar um slug único baseado no timestamp
      const timestamp = new Date().getTime();
      const slug = orgName 
        ? `${orgName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}`
        : `org-${timestamp}`;
      
      // Inserir a organização
      const { data: orgData, error: orgError } = await supabase
        .from('organizacoes')
        .insert({
          nome: orgName || 'Minha Organização',
          slug,
          plano: 'free',
          limite_devedores: 50
        })
        .select()
        .single();

      if (orgError) {
        console.error('Erro ao criar organização padrão:', orgError);
        throw orgError;
      }

      // Vincular a organização ao usuário
      const { error: updateError } = await supabase
        .from('usuarios')
        .upsert({
          id: userId,
          organizacao_id: orgData.id,
          email: user?.email || 'sem-email'
        });

      if (updateError) {
        console.error('Erro ao vincular usuário à organização:', updateError);
        throw updateError;
      }

      console.log('Organização criada e vinculada com sucesso:', orgData);
      setOrganization(orgData as Organization);
      return orgData as Organization;
    } catch (error) {
      console.error('Erro ao criar organização padrão:', error);
      return null;
    }
  };

  // Criar uma organização personalizada
  const createOrganization = async (name: string) => {
    if (!user) {
      return { error: new Error('Usuário não autenticado') };
    }

    try {
      // Gerar um slug único baseado no nome e timestamp
      const timestamp = new Date().getTime();
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}`;
      
      // Inserir a organização
      const { data: orgData, error: orgError } = await supabase
        .from('organizacoes')
        .insert({
          nome: name,
          slug,
          plano: 'free',
          limite_devedores: 50
        })
        .select()
        .single();

      if (orgError) {
        console.error('Erro ao criar organização:', orgError);
        return { error: orgError };
      }

      // Vincular a organização ao usuário
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ organizacao_id: orgData.id })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao vincular usuário à organização:', updateError);
        return { error: updateError };
      }

      // Atualizar o estado
      setOrganization(orgData as Organization);
      return { error: null };
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      return { error: error as Error };
    }
  };

  // Carregar dados da organização
  const loadOrganization = async () => {
    if (!user) return null;
    
    const org = await loadUserOrganization(user.id);
    return org;
  };

  // Login
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: 'Erro no login',
        description: (error as Error).message,
        variant: 'destructive',
      });
      return { error: error as Error };
    }
  };

  // Registro
  const signUp = async (email: string, password: string, organizationName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      // Se o usuário foi criado com sucesso e tem uma organização para criar
      if (data.user && organizationName) {
        // Criar a organização com o nome fornecido
        await createDefaultOrganization(data.user.id, organizationName);
      }
      
      // Usuário criado com sucesso
      toast({
        title: 'Conta criada com sucesso',
        description: 'Verifique seu email para confirmar a conta.',
      });
      
      return { error: null, data };
    } catch (error) {
      console.error('Erro no registro:', error);
      toast({
        title: 'Erro no registro',
        description: (error as Error).message,
        variant: 'destructive',
      });
      return { error: error as Error, data: null };
    }
  };

  // Logout
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setOrganization(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Efetuar verificação de autenticação na inicialização
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Primeiro configurar listener para mudanças na autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            if (newSession?.user) {
              // Usamos setTimeout para evitar ciclo de dependência
              setTimeout(() => {
                loadUserOrganization(newSession.user.id);
              }, 0);
            }
          }
        );

        // Depois checar sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await loadUserOrganization(currentSession.user.id);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const value = {
    user,
    session,
    loading,
    organization,
    signIn,
    signUp,
    signOut,
    createOrganization,
    loadOrganization
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
