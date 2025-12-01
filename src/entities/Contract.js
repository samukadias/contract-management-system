import { supabase } from '@/lib/supabase';

export class Contract {
    static STORAGE_KEY = "contracts_v4";

    // Mapear campos do banco para o formato da aplicação
    static mapFromDB(dbContract) {
        if (!dbContract) return null;
        return {
            id: dbContract.id,
            analista_responsavel: dbContract.analista_responsavel,
            cliente: dbContract.cliente,
            contrato: dbContract.contrato,
            status: dbContract.status,
            status_vencimento: dbContract.status_vencimento,
            data_fim_efetividade: dbContract.data_fim_efetividade,
            valor_contrato: dbContract.valor_contrato ? parseFloat(dbContract.valor_contrato) : null,
            objeto: dbContract.objeto,
            tipo_tratativa: dbContract.tipo_tratativa,
            secao_responsavel: dbContract.secao_responsavel,
            created_by: dbContract.created_by,
            created_at: dbContract.created_at,
            updated_at: dbContract.updated_at,
        };
    }

    // Mapear campos da aplicação para o banco
    static mapToDB(contract) {
        return {
            analista_responsavel: contract.analista_responsavel,
            cliente: contract.cliente,
            contrato: contract.contrato,
            status: contract.status,
            status_vencimento: contract.status_vencimento,
            data_fim_efetividade: contract.data_fim_efetividade,
            valor_contrato: contract.valor_contrato,
            objeto: contract.objeto,
            tipo_tratativa: contract.tipo_tratativa,
            secao_responsavel: contract.secao_responsavel,
            created_by: contract.created_by,
        };
    }

    // Schema for CSV import/export
    static schema() {
        return {
            type: "object",
            properties: {
                analista_responsavel: { type: "string" },
                cliente: { type: "string" },
                contrato: { type: "string" },
                status: { type: "string" },
                status_vencimento: { type: "string" },
                data_fim_efetividade: { type: "string" },
                valor_contrato: { type: "number" },
                objeto: { type: "string" },
                tipo_tratativa: { type: "string" },
                secao_responsavel: { type: "string" },
                created_by: { type: "string" },
            },
            required: ["analista_responsavel", "cliente", "contrato"]
        };
    }

    // Bulk create for CSV import
    static async bulkCreate(contracts) {
        try {
            const dbContracts = contracts.map(c => this.mapToDB(c));

            const { data, error } = await supabase
                .from('contracts')
                .insert(dbContracts)
                .select();

            if (error) throw error;

            return data.map(this.mapFromDB);
        } catch (error) {
            console.error('Erro ao criar contratos em lote:', error);
            throw error;
        }
    }

    static async list() {
        try {
            const { data, error } = await supabase
                .from('contracts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(this.mapFromDB);
        } catch (error) {
            console.error('Erro ao listar contratos:', error);
            throw error;
        }
    }

    static async get(id) {
        try {
            const { data, error } = await supabase
                .from('contracts')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            return this.mapFromDB(data);
        } catch (error) {
            console.error('Erro ao buscar contrato:', error);
            throw error;
        }
    }

    static async create(contractData) {
        try {
            const dbData = this.mapToDB(contractData);

            const { data, error } = await supabase
                .from('contracts')
                .insert([dbData])
                .select()
                .single();

            if (error) throw error;

            return this.mapFromDB(data);
        } catch (error) {
            console.error('Erro ao criar contrato:', error);
            throw error;
        }
    }

    static async update(id, updates) {
        try {
            const dbData = this.mapToDB(updates);
            dbData.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from('contracts')
                .update(dbData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return this.mapFromDB(data);
        } catch (error) {
            console.error('Erro ao atualizar contrato:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const { error } = await supabase
                .from('contracts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Erro ao deletar contrato:', error);
            throw error;
        }
    }

    // Métodos de compatibilidade com localStorage (para migração)
    static async clear() {
        try {
            const { error } = await supabase
                .from('contracts')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao limpar contratos:', error);
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
                console.log('Nenhum dado no localStorage para migrar.');
                return { success: true, count: 0 };
            }

            const contracts = JSON.parse(localData);
            if (!Array.isArray(contracts) || contracts.length === 0) {
                console.log('Nenhum contrato válido para migrar.');
                return { success: true, count: 0 };
            }

            // Inserir em lote
            const dbContracts = contracts.map(c => this.mapToDB(c));

            const { data, error } = await supabase
                .from('contracts')
                .insert(dbContracts)
                .select();

            if (error) throw error;

            console.log(`${data.length} contratos migrados com sucesso!`);
            return { success: true, count: data.length };
        } catch (error) {
            console.error('Erro ao migrar contratos:', error);
            return { success: false, error: error.message };
        }
    }
}
