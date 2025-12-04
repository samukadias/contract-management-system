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
            grupo_cliente: dbContract.grupo_cliente,
            contrato: dbContract.contrato,
            termo: dbContract.termo,
            status: dbContract.status,
            status_vencimento: dbContract.status_vencimento,
            data_inicio_efetividade: dbContract.data_inicio_efetividade,
            data_fim_efetividade: dbContract.data_fim_efetividade,
            data_limite_andamento: dbContract.data_limite_andamento,
            valor_contrato: dbContract.valor_contrato ? parseFloat(dbContract.valor_contrato) : 0,
            valor_faturado: dbContract.valor_faturado ? parseFloat(dbContract.valor_faturado) : 0,
            valor_cancelado: dbContract.valor_cancelado ? parseFloat(dbContract.valor_cancelado) : 0,
            valor_a_faturar: dbContract.valor_a_faturar ? parseFloat(dbContract.valor_a_faturar) : 0,
            valor_novo_contrato: dbContract.valor_novo_contrato ? parseFloat(dbContract.valor_novo_contrato) : 0,
            objeto_contrato: dbContract.objeto, // Mapeado para objeto no banco
            tipo_tratativa: dbContract.tipo_tratativa,
            tipo_aditamento: dbContract.tipo_aditamento,
            etapa: dbContract.etapa,
            esp: dbContract.secao_responsavel, // Mapeado para secao_responsavel no banco
            observacao: dbContract.observacao,
            numero_processo_sei_nosso: dbContract.numero_processo_sei_nosso,
            numero_processo_sei_cliente: dbContract.numero_processo_sei_cliente,
            contrato_cliente: dbContract.contrato_cliente,
            contrato_anterior: dbContract.contrato_anterior,
            numero_pnpp_crm: dbContract.numero_pnpp_crm,
            sei: dbContract.sei,
            contrato_novo: dbContract.contrato_novo,
            termo_novo: dbContract.termo_novo,
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
            grupo_cliente: contract.grupo_cliente,
            contrato: contract.contrato,
            termo: contract.termo,
            status: contract.status,
            status_vencimento: contract.status_vencimento,
            data_inicio_efetividade: contract.data_inicio_efetividade || null,
            data_fim_efetividade: contract.data_fim_efetividade || null,
            data_limite_andamento: contract.data_limite_andamento || null,
            valor_contrato: contract.valor_contrato,
            valor_faturado: contract.valor_faturado,
            valor_cancelado: contract.valor_cancelado,
            valor_a_faturar: contract.valor_a_faturar,
            valor_novo_contrato: contract.valor_novo_contrato,
            objeto: contract.objeto_contrato, // Mapeado de objeto_contrato
            tipo_tratativa: contract.tipo_tratativa,
            tipo_aditamento: contract.tipo_aditamento,
            etapa: contract.etapa,
            secao_responsavel: contract.esp, // Mapeado de esp
            observacao: contract.observacao,
            numero_processo_sei_nosso: contract.numero_processo_sei_nosso,
            numero_processo_sei_cliente: contract.numero_processo_sei_cliente,
            contrato_cliente: contract.contrato_cliente,
            contrato_anterior: contract.contrato_anterior,
            numero_pnpp_crm: contract.numero_pnpp_crm,
            sei: contract.sei,
            contrato_novo: contract.contrato_novo,
            termo_novo: contract.termo_novo,
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
            // console.error('Erro ao criar contratos em lote:', error);
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
            // console.error('Erro ao listar contratos:', error);
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
            // console.error('Erro ao buscar contrato:', error);
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
            // console.error('Erro ao criar contrato:', error);
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
            // console.error('Erro ao atualizar contrato:', error);
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
            // console.error('Erro ao deletar contrato:', error);
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
            // console.error('Erro ao limpar contratos:', error);
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
                // console.log('Nenhum dado no localStorage para migrar.');
                return { success: true, count: 0 };
            }

            const contracts = JSON.parse(localData);
            if (!Array.isArray(contracts) || contracts.length === 0) {
                // console.log('Nenhum contrato válido para migrar.');
                return { success: true, count: 0 };
            }

            // Inserir em lote
            const dbContracts = contracts.map(c => this.mapToDB(c));

            const { data, error } = await supabase
                .from('contracts')
                .insert(dbContracts)
                .select();

            if (error) throw error;

            // console.log(`${data.length} contratos migrados com sucesso!`);
            return { success: true, count: data.length };
        } catch (error) {
            // console.error('Erro ao migrar contratos:', error);
            return { success: false, error: error.message };
        }
    }
}
