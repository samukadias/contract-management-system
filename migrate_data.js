import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO ---

// Credenciais REMOTAS (Origem)
// Peguei do src/lib/supabase.js
const REMOTE_URL = 'https://cssgzdjyzyhxeaktbfty.supabase.co';
const REMOTE_KEY = 'sb_publishable_NmxGjl1FK5sagWmZowrkcQ_-MX133Li';

// Credenciais LOCAIS (Destino)
const LOCAL_URL = 'http://127.0.0.1:54321';
// Chave ANON local padrão do Supabase Docker
const LOCAL_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// --- CLIENTES ---

const remoteSupabase = createClient(REMOTE_URL, REMOTE_KEY);
const localSupabase = createClient(LOCAL_URL, LOCAL_KEY);

async function migrateTable(tableName) {
    console.log(`\n--- Migrando tabela: ${tableName} ---`);

    // 1. Buscar dados da origem
    console.log('Buscando dados remotos...');
    const { data: remoteData, error: fetchError } = await remoteSupabase
        .from(tableName)
        .select('*');

    if (fetchError) {
        console.error(`Erro ao buscar dados de ${tableName}:`, fetchError.message);
        return;
    }

    if (!remoteData || remoteData.length === 0) {
        console.log(`Nenhum dado encontrado em ${tableName} remoto.`);
        return;
    }

    console.log(`${remoteData.length} registros encontrados.`);

    // 2. Limpar tabela local (opcional, mas bom para evitar duplicatas na migração inicial)
    // CUIDADO: Isso apaga dados locais existentes!
    console.log('Limpando tabela local...');
    const { error: deleteError } = await localSupabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all hack

    if (deleteError) {
        console.error(`Erro ao limpar tabela local ${tableName}:`, deleteError.message);
        // Continua mesmo assim, pode ser que a tabela esteja vazia
    }

    // 3. Inserir dados no destino
    console.log('Inserindo dados locais...');
    const { error: insertError } = await localSupabase
        .from(tableName)
        .insert(remoteData);

    if (insertError) {
        console.error(`Erro ao inserir dados em ${tableName}:`, insertError.message);
    } else {
        console.log(`Sucesso! ${tableName} migrada.`);
    }
}

async function runMigration() {
    console.log('Iniciando migração de dados...');

    // Ordem importa por causa de chaves estrangeiras (se houver)
    // Users primeiro, depois Contracts, depois TCs
    await migrateTable('users');
    await migrateTable('contracts');
    await migrateTable('termos_confirmacao');

    console.log('\nMigração concluída!');
}

runMigration();
