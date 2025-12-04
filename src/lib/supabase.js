import { createClient } from '@supabase/supabase-js';

// Substitua estas variáveis pelas suas credenciais reais do Supabase
// Você pode encontrá-las em Project Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cssgzdjyzyhxeaktbfty.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_NmxGjl1FK5sagWmZowrkcQ_-MX133Li';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
