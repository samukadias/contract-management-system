import { createClient } from '@supabase/supabase-js';

// Configuração para acesso dinâmico (Localhost ou LAN)
// Usa o hostname atual do navegador para montar a URL do Supabase
const supabaseUrl = `http://${window.location.hostname}:54321`;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
