import { supabase } from '@/lib/supabase';

export class Contract {

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
            daysUntilExpiry: (() => {
                if (!dbContract.data_fim_efetividade) return null;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const endDate = new Date(dbContract.data_fim_efetividade);
                if (isNaN(endDate.getTime())) return null;
                endDate.setHours(0, 0, 0, 0);
                const diffTime = endDate - today;
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            })(),
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
                grupo_cliente: { type: "string" },
                contrato: { type: "string" },
                termo: { type: "string" },
                status: { type: "string" },
                status_vencimento: { type: "string" },
                data_inicio_efetividade: { type: "string" },
                data_fim_efetividade: { type: "string" },
                data_limite_andamento: { type: "string" },
                valor_contrato: { type: "number" },
                valor_faturado: { type: "number" },
                valor_cancelado: { type: "number" },
                valor_a_faturar: { type: "number" },
                valor_novo_contrato: { type: "number" },
                objeto_contrato: { type: "string" },
                tipo_tratativa: { type: "string" },
                tipo_aditamento: { type: "string" },
                etapa: { type: "string" },
                esp: { type: "string" },
                observacao: { type: "string" },
                numero_processo_sei_nosso: { type: "string" },
                numero_processo_sei_cliente: { type: "string" },
                contrato_cliente: { type: "string" },
                contrato_anterior: { type: "string" },
                numero_pnpp_crm: { type: "string" },
                sei: { type: "string" },
                contrato_novo: { type: "string" },
                termo_novo: { type: "string" },
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

    static async list(filters = {}) {
        try {
            let allContracts = [];
            let from = 0;
            let to = 999;
            let batchSize = 1000;
            let more = true;

            // Se tiver filtro de analista, podemos otimizar (mas range ainda é necessário se for muitos)
            // Para simplificar a paginação com filtro, vamos assumir que o filtro reduz o set o suficiente
            // ou manter a lógica de paginação.

            let query = supabase
                .from('contracts')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters.analista) {
                // Filtro insensível a caixa ou exato, dependendo da necessidade.
                // O banco geralmente salva o nome completo.
                query = query.eq('analista_responsavel', filters.analista);
            }

            // TODO: Se precisarmos de paginação real no futuro, ajustar aqui.
            // Por enquanto, mantemos o loop para garantir que pegamos tudo que corresponde ao filtro (ou tudo se sem filtro)

            while (more) {
                // Precisamos refazer a query base pq o .range() modifica o objeto (ou clone)
                // Melhor abordagem simples: usar a query construída acima e adicionar range

                const { data, error } = await query.range(from, to);

                if (error) throw error;

                if (data && data.length > 0) {
                    allContracts = allContracts.concat(data);

                    if (data.length < batchSize) {
                        more = false;
                    } else {
                        from += batchSize;
                        to += batchSize;
                    }
                } else {
                    more = false;
                }
            }

            return allContracts.map(this.mapFromDB);
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
}
