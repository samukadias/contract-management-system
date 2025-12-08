import pg from 'pg';
const { Client } = pg;

// Default Supabase local DB credentials
const connectionString = 'postgres://postgres:postgres@localhost:54322/postgres';

const client = new Client({
    connectionString,
});

const sql = `
-- 1. TABELA DE USUÁRIOS (users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    perfil TEXT NOT NULL CHECK (perfil IN ('GESTOR', 'ANALISTA', 'CLIENTE')),
    nome_cliente TEXT
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total users" ON public.users;
CREATE POLICY "Acesso total users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- 2. TABELA DE CONTRATOS (contracts)
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

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total contracts" ON public.contracts;
CREATE POLICY "Acesso total contracts" ON public.contracts FOR ALL USING (true) WITH CHECK (true);

-- 3. TABELA DE TERMOS DE CONFIRMAÇÃO (termos_confirmacao)
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

ALTER TABLE public.termos_confirmacao ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total termos" ON public.termos_confirmacao;
CREATE POLICY "Acesso total termos" ON public.termos_confirmacao FOR ALL USING (true) WITH CHECK (true);

-- 5. ATUALIZAÇÕES DE SCHEMA (update_contracts_schema.sql)
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

-- 6. ADICIONAR SENHA
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '123456';
`;

async function applySchema() {
    try {
        await client.connect();
        console.log('Connected to database.');
        await client.query(sql);
        console.log('Schema applied successfully.');
    } catch (err) {
        console.error('Error applying schema:', err);
    } finally {
        await client.end();
    }
}

applySchema();
