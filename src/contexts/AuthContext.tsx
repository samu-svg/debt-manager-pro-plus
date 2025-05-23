
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
      const { data, error } = await supabase
        .from('usuarios')
        .select('organizacao_id, organizacoes:organizacao_id(*)')
        .eq('id', userId)
        .single();
      
      console.log('Dados recebidos do Supabase:', data);
      
      if (error) throw error;
      
      if (data?.organizacoes) {
        // Verificar se organizacoes é um array e pegar o primeiro elemento se necessário
        const org = Array.isArray(data.organizacoes) 
          ? data.organizacoes[0] 
          : data.organizacoes;
        
        console.log('Objeto de organização formatado:', org);
        setOrganization(org as unknown as Organization);
      } else {
        console.log('Nenhuma organização encontrada para o usuário');
      }
    } catch (error) {
      console.error('Erro ao carregar dados da organização:', error);
    } finally {
      setLoading(false);
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
      // Create slug from organization name
      const slug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Sign up user
      const { error: signUpError, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            organization_name: organizationName
          }
        }
      });

      if (signUpError || !data.user) {
        return { error: signUpError };
      }

      // Create organization
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

      if (orgError) {
        return { error: orgError };
      }

      // Link user to organization
      const { error: userOrgError } = await supabase
        .from('usuarios')
        .update({ 
          organizacao_id: orgData.id,
          role: 'admin' 
        })
        .eq('id', data.user.id);

      if (userOrgError) {
        return { error: userOrgError };
      }

      return { error: null };
    } catch (error) {
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
    loading
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
