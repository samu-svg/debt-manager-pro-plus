
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Supabase client configuration
const supabaseUrl = "https://xcextmkpjsubhipxdvmu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZXh0bWtwanN1YmhpcHhkdm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDg5MDEsImV4cCI6MjA2MzU4NDkwMX0.G9caj75RPKnqS5NhQef6o1CoK6PxiaQWjrjmA9N-A0Y";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Helper functions for organization management
export const getOrganizationById = async (id: string) => {
  const { data, error } = await supabase
    .from('organizacoes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const getCurrentUserOrganization = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Usuário não autenticado');
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('organizacao_id, organizacoes(*)')
    .eq('id', user.id)
    .maybeSingle();
  
  if (error) throw error;
  
  if (!data || !data.organizacoes) {
    return null;
  }
  
  return data.organizacoes;
};

// Types for organization and subscription plans
export type Plan = 'free' | 'basic' | 'premium' | 'enterprise';

export type Organization = {
  id: string;
  nome: string;
  slug: string;
  plano: Plan;
  limite_devedores: number;
  created_at: string;
};

// Plan limits and features
export const planLimits = {
  free: {
    devedores: 50,
    whatsappMessages: 100,
    users: 1,
  },
  basic: {
    devedores: 200,
    whatsappMessages: 500,
    users: 3,
  },
  premium: {
    devedores: 1000,
    whatsappMessages: 2000,
    users: 10,
  },
  enterprise: {
    devedores: Infinity,
    whatsappMessages: Infinity,
    users: Infinity,
  }
};
