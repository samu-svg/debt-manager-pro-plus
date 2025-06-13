
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; data: { user: User | null } | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

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
  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;
      
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
          }
        );

        // Depois checar sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
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
    signIn,
    signUp,
    signOut
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
