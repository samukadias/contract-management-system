-- SCRIPT COMPLETO DE CRIAÇÃO DO BANCO DE DADOS (SUPABASE)
-- Copie e cole este conteúdo no SQL Editor do Supabase e clique em RUN.

-- ============================================================================
-- 1. TABELA DE USUÁRIOS (users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    perfil TEXT NOT NULL CHECK (perfil IN ('GESTOR', 'ANALISTA', 'CLIENTE')),
    nome_cliente TEXT
);

-- Habilitar RLS mas criar política pública (para evitar bloqueios iniciais)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso total users" ON public.users FOR ALL USING (true) WITH CHECK (true);


-- ============================================================================
-- 2. TABELA DE CONTRATOS (contracts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    contrato TEXT NOT NULL,
    cliente TEXT NOT NULL,
    analista_responsavel TEXT NOT NULL,
    status TEXT DEFAULT 'Ativo',
    status_vencimento TEXT,
    data_fim_efetividade DATE,
    valor_contrato NUMERIC,
    objeto TEXT,
    tipo_tratativa TEXT,
    secao_responsavel TEXT,
    created_by TEXT
);

-- Habilitar RLS mas criar política pública
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso total contracts" ON public.contracts FOR ALL USING (true) WITH CHECK (true);


-- ============================================================================
-- 3. TABELA DE TERMOS DE CONFIRMAÇÃO (termos_confirmacao)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.termos_confirmacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    numero_tc TEXT NOT NULL,
    contrato_associado_pd TEXT,
    numero_processo TEXT,
    data_inicio_vigencia DATE,
    data_fim_vigencia DATE,
    valor_total NUMERIC,
    objeto TEXT,
    area_demandante TEXT,
    fiscal_contrato TEXT,
    gestor_contrato TEXT,
    created_by TEXT
);

-- Habilitar RLS mas criar política pública
ALTER TABLE public.termos_confirmacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso total termos" ON public.termos_confirmacao FOR ALL USING (true) WITH CHECK (true);


-- ============================================================================
-- 4. DADOS INICIAIS (SEED)
-- ============================================================================

-- Usuário Gestor
INSERT INTO public.users (email, full_name, perfil)
VALUES ('samuel@contractpro.com', 'Samuel Dias', 'GESTOR')
ON CONFLICT (email) DO NOTHING;

-- Usuário Analista (Exemplo)
INSERT INTO public.users (email, full_name, perfil)
VALUES ('analista@teste.com', 'Analista Teste', 'ANALISTA')
ON CONFLICT (email) DO NOTHING;

-- Usuário Cliente (Exemplo)
INSERT INTO public.users (email, full_name, perfil, nome_cliente)
VALUES ('cliente@empresa.com', 'Cliente Exemplo', 'CLIENTE', 'Empresa X')
ON CONFLICT (email) DO NOTHING;

-- Contrato de Exemplo
INSERT INTO public.contracts (contrato, cliente, analista_responsavel, status, valor_contrato, data_fim_efetividade)
VALUES ('CT-2024/001', 'Empresa X', 'Samuel Dias', 'Ativo', 150000.00, CURRENT_DATE + INTERVAL '60 days')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. ATUALIZAÇÕES DE SCHEMA (update_contracts_schema.sql)
-- ============================================================================
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS grupo_cliente TEXT,
ADD COLUMN IF NOT EXISTS termo TEXT,
ADD COLUMN IF NOT EXISTS tipo_aditamento TEXT,
ADD COLUMN IF NOT EXISTS etapa TEXT,
ADD COLUMN IF NOT EXISTS data_inicio_efetividade DATE,
ADD COLUMN IF NOT EXISTS data_limite_andamento DATE,
ADD COLUMN IF NOT EXISTS valor_faturado NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_cancelado NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_a_faturar NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_novo_contrato NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS observacao TEXT,
ADD COLUMN IF NOT EXISTS numero_processo_sei_nosso TEXT,
ADD COLUMN IF NOT EXISTS numero_processo_sei_cliente TEXT,
ADD COLUMN IF NOT EXISTS contrato_cliente TEXT,
ADD COLUMN IF NOT EXISTS contrato_anterior TEXT,
ADD COLUMN IF NOT EXISTS numero_pnpp_crm TEXT,
ADD COLUMN IF NOT EXISTS sei TEXT,
ADD COLUMN IF NOT EXISTS contrato_novo TEXT,
ADD COLUMN IF NOT EXISTS termo_novo TEXT;

-- ============================================================================
-- 6. ADICIONAR SENHA (add_password_column.sql)
-- ============================================================================
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '123456';

UPDATE public.users SET password = '123456' WHERE password IS NULL;
