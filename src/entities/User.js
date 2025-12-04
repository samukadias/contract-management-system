import { supabase } from '../lib/supabase';

export class User {
    static STORAGE_KEY = "users_v1";

    // Mapear campos do banco para o formato da aplicação
    static mapFromDB(dbUser) {
        if (!dbUser) return null;
        return {
            id: dbUser.id,
            email: dbUser.email,
            password: dbUser.password, // Incluir senha (cuidado em produção!)
            full_name: dbUser.full_name,
            perfil: dbUser.perfil,
            nome_cliente: dbUser.nome_cliente,
            created_at: dbUser.created_at,
            updated_at: dbUser.updated_at,
        };
    }

    // Mapear campos da aplicação para o banco
    static mapToDB(user) {
        return {
            email: user.email,
            password: user.password, // Salvar senha
            full_name: user.full_name,
            perfil: user.perfil,
            nome_cliente: user.nome_cliente,
        };
    }

    static async list() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(this.mapFromDB);
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            throw error;
        }
    }

    static async get(id) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            return this.mapFromDB(data);
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            throw error;
        }
    }

    static async getByEmail(email) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            return this.mapFromDB(data);
        } catch (error) {
            console.error('Erro ao buscar usuário por email:', error);
            throw error;
        }
    }

    static async create(userData) {
        try {
            const dbData = this.mapToDB(userData);

            const { data, error } = await supabase
                .from('users')
                .insert([dbData])
                .select()
                .single();

            if (error) throw error;

            return this.mapFromDB(data);
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    }

    static async update(id, updates) {
        try {
            const dbData = this.mapToDB(updates);
            dbData.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from('users')
                .update(dbData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return this.mapFromDB(data);
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            throw error;
        }
    }

    // Método para obter o usuário atual (mock - em produção seria autenticação real)
    static async me() {
        try {
            // Por enquanto, retorna o primeiro gestor encontrado
            // Em produção, isso seria baseado na sessão/autenticação
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('perfil', 'GESTOR')
                .limit(1)
                .single();

            if (error) {
                // Se não houver gestor, retorna um usuário padrão
                console.warn('Nenhum gestor encontrado, usando usuário padrão');
                return {
                    id: '1',
                    email: 'samuel@contractpro.com',
                    full_name: 'Samuel Dias',
                    perfil: 'GESTOR'
                };
            }

            return this.mapFromDB(data);
        } catch (error) {
            console.error('Erro ao buscar usuário atual:', error);
            // Fallback para usuário padrão
            return {
                id: '1',
                email: 'samuel@contractpro.com',
                full_name: 'Samuel Dias',
                perfil: 'GESTOR'
            };
        }
    }

    // Método de compatibilidade
    static async clear() {
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao limpar usuários:', error);
            throw error;
        }
    }
}
