import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../entities/User';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar se já existe um usuário salvo no localStorage ao carregar
        const storedUser = localStorage.getItem('contract_system_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            // Buscar usuário pelo email na nossa tabela de usuários
            const userFound = await User.getByEmail(email);

            if (!userFound) {
                toast.error('Usuário não encontrado. Verifique o email.');
                return false;
            }

            // Verificar senha (comparação simples por enquanto)
            if (userFound.password !== password) {
                toast.error('Senha incorreta.');
                return false;
            }

            // Salvar usuário no estado e no localStorage
            setUser(userFound);
            localStorage.setItem('contract_system_user', JSON.stringify(userFound));
            toast.success(`Bem-vindo, ${userFound.full_name}!`);
            return true;
        } catch (error) {
            console.error('Erro no login:', error);
            toast.error('Erro ao realizar login.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('contract_system_user');
        toast.info('Você saiu do sistema.');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
