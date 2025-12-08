import { createClient } from '@supabase/supabase-js';

// Configuração para acesso via REDE (LAN)
// Permite que outros dispositivos em 10.2.9.xxx acessem o sistema
const supabaseUrl = 'http://10.2.9.111:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
