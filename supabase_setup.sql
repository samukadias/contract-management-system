-- Script para garantir que a tabela users existe e tem um usuário Gestor
-- Rode isso no SQL Editor do Supabase se o login não estiver funcionando

-- 1. Criar a tabela se não existir
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    perfil TEXT NOT NULL CHECK (perfil IN ('GESTOR', 'ANALISTA', 'CLIENTE')),
    nome_cliente TEXT -- Apenas para perfil CLIENTE
);

-- 2. Habilitar RLS (Opcional - se quiser segurança, mas precisa de policies)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Criar política de leitura pública (se RLS estiver ativado)
-- CREATE POLICY "Permitir leitura pública" ON public.users FOR SELECT USING (true);

-- 4. Inserir usuário Gestor padrão (se não existir)
INSERT INTO public.users (email, full_name, perfil)
VALUES ('samuel@contractpro.com', 'Samuel Dias', 'GESTOR')
ON CONFLICT (email) DO NOTHING;

-- 5. Inserir usuário Analista de teste
INSERT INTO public.users (email, full_name, perfil)
VALUES ('analista@teste.com', 'Analista Teste', 'ANALISTA')
ON CONFLICT (email) DO NOTHING;
