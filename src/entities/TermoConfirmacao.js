import { supabase } from '@/lib/supabase';

export class TermoConfirmacao {
    static STORAGE_KEY = "termos_confirmacao_v2";

    // Mapear campos do banco para o formato da aplicação
    static mapFromDB(dbTC) {
        if (!dbTC) return null;
        return {
            id: dbTC.id,
            numero_tc: dbTC.numero_tc,
            contrato_associado_pd: dbTC.contrato_associado_pd,
            numero_processo: dbTC.numero_processo,
            data_inicio_vigencia: dbTC.data_inicio_vigencia,
            data_fim_vigencia: dbTC.data_fim_vigencia,
            valor_total: dbTC.valor_total ? parseFloat(dbTC.valor_total) : null,
            objeto: dbTC.objeto,
            area_demandante: dbTC.area_demandante,
            fiscal_contrato: dbTC.fiscal_contrato,
            gestor_contrato: dbTC.gestor_contrato,
            created_by: dbTC.created_by,
            created_at: dbTC.created_at,
            updated_at: dbTC.updated_at,
        };
    }

    // Mapear campos da aplicação para o banco
    static mapToDB(tc) {
        return {
            numero_tc: tc.numero_tc,
            contrato_associado_pd: tc.contrato_associado_pd,
            numero_processo: tc.numero_processo,
            data_inicio_vigencia: tc.data_inicio_vigencia,
            data_fim_vigencia: tc.data_fim_vigencia,
            valor_total: tc.valor_total,
            objeto: tc.objeto,
            area_demandante: tc.area_demandante,
            fiscal_contrato: tc.fiscal_contrato,
            gestor_contrato: tc.gestor_contrato,
            created_by: tc.created_by,
        };
    }

    static async list(orderBy = '-created_at') {
        try {
            const [field, direction] = orderBy.startsWith('-')
                ? [orderBy.slice(1), false]
                : [orderBy, true];

            const { data, error } = await supabase
                .from('termos_confirmacao')
                .select('*')
                .order(field, { ascending: direction });

            if (error) throw error;

            return (data || []).map(this.mapFromDB);
        } catch (error) {
            console.error('Erro ao listar TCs:', error);
            throw error;
        }
    }

    static async get(id) {
        try {
            const { data, error } = await supabase
                .from('termos_confirmacao')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            return this.mapFromDB(data);
        } catch (error) {
            console.error('Erro ao buscar TC:', error);
            throw error;
        }
    }

    static async create(tcData) {
        try {
            const dbData = this.mapToDB(tcData);

            const { data, error } = await supabase
                .from('termos_confirmacao')
                .insert([dbData])
                .select()
                .single();

            if (error) throw error;

            return this.mapFromDB(data);
        } catch (error) {
            console.error('Erro ao criar TC:', error);
            throw error;
        }
    }

    static async update(id, updates) {
        try {
            const dbData = this.mapToDB(updates);
            dbData.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from('termos_confirmacao')
                .update(dbData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return this.mapFromDB(data);
        } catch (error) {
            console.error('Erro ao atualizar TC:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const { error } = await supabase
                .from('termos_confirmacao')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Erro ao deletar TC:', error);
            throw error;
        }
    }

    // Métodos de compatibilidade
    static async clear() {
        try {
            const { error } = await supabase
                .from('termos_confirmacao')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao limpar TCs:', error);
            throw error;
        }
    }

    static async reset() {
        await this.clear();
    }

    // Método para importar dados do localStorage para Supabase
    static async migrateFromLocalStorage() {
        try {
            const localData = localStorage.getItem(this.STORAGE_KEY);
            if (!localData) {
                console.log('Nenhum dado de TC no localStorage para migrar.');
                return { success: true, count: 0 };
            }

            const tcs = JSON.parse(localData);
            if (!Array.isArray(tcs) || tcs.length === 0) {
                console.log('Nenhum TC válido para migrar.');
                return { success: true, count: 0 };
            }

            // Inserir em lote
            const dbTCs = tcs.map(tc => this.mapToDB(tc));

            const { data, error } = await supabase
                .from('termos_confirmacao')
                .insert(dbTCs)
                .select();

            if (error) throw error;

            console.log(`${data.length} TCs migrados com sucesso!`);
            return { success: true, count: data.length };
        } catch (error) {
            console.error('Erro ao migrar TCs:', error);
            return { success: false, error: error.message };
        }
    }
}
