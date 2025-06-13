
-- Remover todas as tabelas de negócio do Supabase, mantendo apenas auth
-- Isso vai limpar o banco e manter apenas a autenticação

-- Remover comunicações WhatsApp se existir
DROP TABLE IF EXISTS public.comunicacoes_whatsapp CASCADE;

-- Remover dívidas
DROP TABLE IF EXISTS public.dividas CASCADE;

-- Remover clientes
DROP TABLE IF EXISTS public.clientes CASCADE;

-- Remover organizações
DROP TABLE IF EXISTS public.organizacoes CASCADE;

-- Remover usuários customizados (vamos usar apenas auth.users)
DROP TABLE IF EXISTS public.usuarios CASCADE;
