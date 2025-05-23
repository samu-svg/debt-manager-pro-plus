
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Organization } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  organization: Organization | null;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, organizationName: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  createOrganization: (name: string) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserOrganization(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Use setTimeout to prevent potential recursive auth state issues
        setTimeout(() => {
          loadUserOrganization(session.user.id);
        }, 0);
      } else {
        setLoading(false);
        setOrganization(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserOrganization = async (userId: string) => {
    try {
      console.log('Carregando organização para o usuário:', userId);
      
      // Primeiro, verificar se o usuário existe na tabela usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('organizacao_id')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.log('Usuário não encontrado na tabela usuarios, criando entrada...');
        // Se o usuário não existe, criar entrada
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('usuarios')
            .insert({
              id: userId,
              email: user.email || '',
              role: 'admin'
            });
        }
        
        // Criar organização padrão
        await createDefaultOrganization(userId);
        return;
      }

      if (userData?.organizacao_id) {
        // Buscar dados da organização
        const { data: orgData, error: orgError } = await supabase
          .from('organizacoes')
          .select('*')
          .eq('id', userData.organizacao_id)
          .single();
        
        if (orgError) {
          console.error('Erro ao buscar organização:', orgError);
          await createDefaultOrganization(userId);
        } else {
          console.log('Organização encontrada:', orgData);
          setOrganization(orgData as unknown as Organization);
        }
      } else {
        console.log('Usuário sem organização, criando padrão...');
        await createDefaultOrganization(userId);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da organização:', error);
      await createDefaultOrganization(userId);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultOrganization = async (userId: string) => {
    try {
      console.log('Criando organização padrão para o usuário:', userId);
      
      // Buscar email do usuário
      const { data: { user } } = await supabase.auth.getUser();
      
      const organizationName = user?.email ? `Organização de ${user.email.split('@')[0]}` : 'Minha Organização';
      const slug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Criar a organização
      const { data: orgData, error: orgError } = await supabase
        .from('organizacoes')
        .insert({
          nome: organizationName,
          slug: slug + '-' + Date.now(),
          plano: 'free',
          limite_devedores: 50
        })
        .select()
        .single();

      if (orgError) {
        console.error('Erro ao criar organização padrão:', orgError);
        return;
      }

      // Vincular usuário à organização
      const { error: userOrgError } = await supabase
        .from('usuarios')
        .upsert({ 
          id: userId,
          email: user?.email || '',
          organizacao_id: orgData.id,
          role: 'admin' 
        });

      if (userOrgError) {
        console.error('Erro ao vincular usuário à organização:', userOrgError);
        return;
      }

      console.log('Organização padrão criada com sucesso:', orgData);
      setOrganization(orgData as unknown as Organization);
    } catch (error) {
      console.error('Erro ao criar organização padrão:', error);
    }
  };

  const createOrganization = async (name: string) => {
    try {
      if (!user) {
        return { error: 'Usuário não autenticado' };
      }

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Criar a organização
      const { data: orgData, error: orgError } = await supabase
        .from('organizacoes')
        .insert({
          nome: name,
          slug: slug + '-' + Date.now(),
          plano: 'free',
          limite_devedores: 50
        })
        .select()
        .single();

      if (orgError) {
        return { error: orgError };
      }

      // Vincular usuário à organização
      const { error: userOrgError } = await supabase
        .from('usuarios')
        .upsert({ 
          id: user.id,
          email: user.email || '',
          organizacao_id: orgData.id,
          role: 'admin' 
        });

      if (userOrgError) {
        return { error: userOrgError };
      }

      setOrganization(orgData as unknown as Organization);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, organizationName: string) => {
    try {
      console.log('Iniciando processo de registro...');
      
      // Create slug from organization name
      const slug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      console.log('Slug gerado:', slug);

      // Sign up user - usando função de cadastro anônima que não requer políticas RLS
      const { error: signUpError, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            organization_name: organizationName
          }
        }
      });

      console.log('Resposta do registro do usuário:', { error: signUpError, userData: data });

      if (signUpError || !data.user) {
        console.error('Erro ao registrar usuário:', signUpError);
        return { error: signUpError };
      }

      try {
        // Tente criar a organização com a função de administrador do sistema
        console.log('Criando organização...');
        const { error: orgError, data: orgData } = await supabase
          .from('organizacoes')
          .insert({
            nome: organizationName,
            slug,
            plano: 'free',
            limite_devedores: 50
          })
          .select()
          .single();

        console.log('Resposta da criação da organização:', { error: orgError, orgData });

        if (orgError) {
          console.error('Erro ao criar organização:', orgError);
          return { error: orgError };
        }

        // Link user to organization - também usando função de administrador
        console.log('Vinculando usuário à organização...');
        const { error: userOrgError } = await supabase
          .from('usuarios')
          .update({ 
            organizacao_id: orgData.id,
            role: 'admin' 
          })
          .eq('id', data.user.id);

        console.log('Resposta da vinculação:', { error: userOrgError });

        if (userOrgError) {
          console.error('Erro ao vincular usuário à organização:', userOrgError);
          return { error: userOrgError };
        }

        console.log('Registro concluído com sucesso!');
        return { error: null };
      } catch (processingError) {
        console.error('Erro durante processamento do registro:', processingError);
        return { error: processingError };
      }
    } catch (error) {
      console.error('Erro inesperado durante registro:', error);
      return { error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  const value = {
    user,
    session,
    organization,
    signIn,
    signUp,
    signOut,
    loading,
    createOrganization
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
