import { createClient } from '@supabase/supabase-js';

// Substitua estas variáveis pelas suas credenciais reais do Supabase
// Você pode encontrá-las em Project Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://roqjrqgfzjdlgygqqsvv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jPc7wLkYbMT0V5OUeg8X4A_jk30qF2J';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
