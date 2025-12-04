-- Adicionar coluna de senha na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '123456';

-- Atualizar usuários existentes para ter a senha padrão '123456'
UPDATE public.users SET password = '123456' WHERE password IS NULL;
