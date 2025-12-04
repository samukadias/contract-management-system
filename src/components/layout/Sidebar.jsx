import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Clock,
    FileText,
    CheckSquare,
    Search,
    BarChart2,
    Plus,
    ListTodo,
    Users,
    Database,
    Bug,
    Building2,
    LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', description: 'Visão geral', roles: ['GESTOR'] },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/analyst-dashboard', description: 'Visão geral', roles: ['ANALISTA'] },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/client-dashboard', description: 'Visão geral', roles: ['CLIENTE'] },
    { icon: Clock, label: 'Timeline 3 Meses', path: '/timeline', description: 'Contratos próximos', roles: ['GESTOR', 'ANALISTA'] },
    { icon: FileText, label: 'Contratos', path: '/contracts', description: 'Gerenciar contratos', roles: ['GESTOR', 'ANALISTA'] },
    { icon: CheckSquare, label: 'TC', path: '/confirmation', description: 'Termos de aceite', roles: ['GESTOR'] },
    { icon: Search, label: 'Pesquisar', path: '/search', description: 'Busca avançada', roles: ['GESTOR', 'ANALISTA'] },
    { icon: BarChart2, label: 'Análise', path: '/analysis', description: 'Saúde dos contratos', roles: ['GESTOR'] },
    { icon: Plus, label: 'Novo Contrato', path: '/contracts/new', description: 'Cadastrar contrato', roles: ['GESTOR', 'ANALISTA'] },
    { icon: ListTodo, label: 'Controle Etapas', path: '/stage-control', description: 'Gantt das etapas', roles: ['GESTOR'] },
    { icon: Users, label: 'Gerenciar Usuários', path: '/users', description: 'Usuários do sistema', roles: ['GESTOR'] },
    { icon: Database, label: 'Gerenciar Dados', path: '/data-management', description: 'Limpar dados', roles: ['GESTOR'] },
    { icon: Bug, label: 'Debug Info', path: '/debug', description: 'Informações de debug', roles: ['GESTOR'] },
];

import { X } from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { user, logout } = useAuth();

    if (!user) return null;

    const filteredMenu = menuItems.filter(item => item.roles.includes(user.perfil));

    return (
        <>
            {/* Overlay para mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <div className={cn(
                "flex flex-col h-screen w-72 bg-white border-r border-gray-200 fixed left-0 top-0 transition-transform duration-300 ease-in-out z-50",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Header */}
                <div className="p-6 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900 text-lg leading-none">ContractPro</h1>
                                <span className="text-xs text-gray-500">Gestão de Contratos</span>
                            </div>
                        </div>
                        <Badge variant="secondary" className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100">
                            {user.perfil}
                        </Badge>
                    </div>
                    {/* Botão Fechar (Mobile) */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-1 text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4">
                    <div className="px-4 mb-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Navegação
                        </span>
                    </div>
                    <nav className="space-y-1 px-2">
                        {filteredMenu.map((item) => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => onClose && onClose()} // Fechar ao clicar em um link no mobile
                                    className={cn(
                                        "flex items-start gap-3 px-3 py-2 rounded-r-lg transition-colors group border-l-4",
                                        isActive
                                            ? "bg-blue-50 text-blue-700 border-blue-600"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5 mt-0.5", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{item.label}</span>
                                        <span className="text-[10px] text-gray-400">{item.description}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                {user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]" title={user.full_name}>
                                    {user.full_name}
                                </span>
                                <span className="text-xs text-gray-500 truncate max-w-[120px]" title={user.email}>
                                    {user.email}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={logout}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                    </Button>
                </div>
            </div>
        </>
    );
}
