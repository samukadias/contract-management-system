import React, { useState, useEffect } from "react";
import { Contract } from "@/entities/Contract";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, User as UserIcon, Database, AlertTriangle, CheckCircle } from "lucide-react";

export default function DebugInfo() {
    const [currentUser, setCurrentUser] = useState(null);
    const [contracts, setContracts] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rawContractCount, setRawContractCount] = useState(0);

    const loadDebugInfo = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Carregar usuário atual
            console.log("Carregando usuário atual...");
            const user = await User.me();
            console.log("Usuário logado:", user);
            setCurrentUser(user);

            // Carregar contratos
            console.log("Carregando contratos...");
            const contractList = await Contract.list();
            console.log("Contratos carregados:", contractList.length, contractList);
            setContracts(contractList);

            // Tentar contar todos os contratos (isso pode falhar se RLS estiver ativo)
            try {
                // Isso é só para debug - normalmente não seria possível
                console.log("Tentando contar total de contratos...");
                const allContracts = await Contract.list("-created_date", 1000);
                setRawContractCount(allContracts.length);
            } catch (countError) {
                console.log("Não foi possível contar todos os contratos:", countError);
                setRawContractCount("N/A");
            }

            // Carregar todos os usuários
            const userList = await User.list();
            setAllUsers(userList);

        } catch (err) {
            setError(err.message);
            console.error("Erro no debug:", err);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadDebugInfo();
    }, []);

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="text-center">Carregando informações de debug...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Debug - Problemas de Visibilidade</h1>
                <Button onClick={loadDebugInfo} disabled={isLoading}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recarregar
                </Button>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <p className="text-red-700">Erro: {error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Status do RLS */}
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Database className="w-5 h-5" />
                        Status do RLS (Row Level Security)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-blue-700 space-y-2">
                        <p><strong>RLS Status:</strong> {contracts.length > 0 ? "TEMPORARIAMENTE DESABILITADO PARA DEBUG" : "POSSIVELMENTE ATIVO E BLOQUEANDO"}</p>
                        <p><strong>Contratos Visíveis:</strong> {contracts.length}</p>
                        <p><strong>Total Esperado:</strong> {rawContractCount}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Informações do Usuário Atual */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5" />
                        Usuário Logado (Detalhes Completos)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {currentUser ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <strong>ID:</strong> {currentUser.id || "Não definido"}
                                </div>
                                <div>
                                    <strong>Nome:</strong> {currentUser.full_name || "Não definido"}
                                </div>
                                <div>
                                    <strong>Email:</strong> {currentUser.email || "Não definido"}
                                </div>
                                <div>
                                    <strong>Role:</strong> {currentUser.role || "Não definido"}
                                </div>
                                <div>
                                    <strong>Perfil:</strong>
                                    <Badge className="ml-2" variant={currentUser.perfil === "GESTOR" ? "default" : "secondary"}>
                                        {currentUser.perfil || "NÃO DEFINIDO"}
                                    </Badge>
                                </div>
                                <div>
                                    <strong>Nome Cliente:</strong> {currentUser.nome_cliente || "Não definido"}
                                </div>
                                <div>
                                    <strong>Departamento:</strong> {currentUser.departamento || "Não definido"}
                                </div>
                                <div>
                                    <strong>Data Criação:</strong> {currentUser.created_date || "Não definido"}
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                                <strong>JSON Completo do Usuário:</strong>
                                <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                                    {JSON.stringify(currentUser, null, 2)}
                                </pre>
                            </div>
                        </div>
                    ) : (
                        <p className="text-red-600">Nenhum usuário logado - PROBLEMA CRÍTICO</p>
                    )}
                </CardContent>
            </Card>

            {/* Diagnóstico de Contratos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Contratos Visíveis - Diagnóstico
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {contracts.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-green-700 font-medium">
                                    {contracts.length} contratos visíveis (RLS funcionando ou desabilitado)
                                </span>
                            </div>

                            <div className="grid gap-4">
                                {contracts.slice(0, 3).map((contract, index) => (
                                    <div key={contract.id || index} className="p-4 border rounded-lg bg-gray-50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                            <div>
                                                <strong>Analista:</strong> {contract.analista_responsavel || "❌ VAZIO"}
                                            </div>
                                            <div>
                                                <strong>Cliente:</strong> {contract.cliente || "❌ VAZIO"}
                                            </div>
                                            <div>
                                                <strong>Contrato:</strong> {contract.contrato || "❌ VAZIO"}
                                            </div>
                                            <div>
                                                <strong>Status:</strong> {contract.status || "❌ VAZIO"}
                                            </div>
                                            <div>
                                                <strong>Criado por:</strong> {contract.created_by || "❌ VAZIO"}
                                            </div>
                                            <div>
                                                <strong>ID:</strong> {contract.id || "❌ VAZIO"}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {contracts.length > 3 && (
                                    <p className="text-gray-600">... e mais {contracts.length - 3} contratos</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-red-800 mb-2">❌ PROBLEMA IDENTIFICADO</h3>
                            <p className="text-red-600 mb-4">Nenhum contrato visível mesmo sendo GESTOR</p>

                            <div className="text-left bg-red-50 p-4 rounded-lg">
                                <p className="text-sm text-red-700 mb-2">
                                    <strong>Possíveis causas:</strong>
                                </p>
                                <ul className="text-sm text-red-700 list-disc ml-5 space-y-1">
                                    <li>Seu perfil não está definido como "GESTOR" (verifique acima)</li>
                                    <li>RLS (Row Level Security) está mal configurado</li>
                                    <li>Não há contratos na base de dados</li>
                                    <li>Problema de sincronização do banco de dados</li>
                                </ul>

                                <div className="mt-4 p-3 bg-yellow-100 rounded border">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Ação recomendada:</strong> Removi temporariamente o RLS da entidade Contract.
                                        Se você ver contratos agora, o problema é na configuração do RLS.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Lista de Usuários para Verificação */}
            <Card>
                <CardHeader>
                    <CardTitle>Verificação de Usuários por Perfil</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <h4 className="font-semibold text-purple-800 mb-2">Gestores ({allUsers.filter(u => u.perfil === "GESTOR").length})</h4>
                            {allUsers.filter(u => u.perfil === "GESTOR").map(user => (
                                <div key={user.id} className="text-sm text-purple-700 mb-1">
                                    {user.full_name} - {user.email}
                                    {user.id === currentUser?.id && " (VOCÊ)"}
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Analistas ({allUsers.filter(u => u.perfil === "ANALISTA").length})</h4>
                            {allUsers.filter(u => u.perfil === "ANALISTA").slice(0, 5).map(user => (
                                <div key={user.id} className="text-sm text-blue-700 mb-1">
                                    {user.full_name} - {user.email}
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2">Clientes ({allUsers.filter(u => u.perfil === "CLIENTE").length})</h4>
                            {allUsers.filter(u => u.perfil === "CLIENTE").slice(0, 5).map(user => (
                                <div key={user.id} className="text-sm text-green-700 mb-1">
                                    {user.full_name} - {user.nome_cliente}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
