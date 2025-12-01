import React, { useState, useEffect } from "react";
import { Contract } from "@/entities/Contract";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Clock, User as UserIcon, Building2 } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDashboard() {
    const [contracts, setContracts] = useState([]);
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadContracts();
        }
    }, [user]);

    const loadContracts = async () => {
        setIsLoading(true);
        try {
            // Filtrar contratos apenas do cliente logado
            const allContracts = await Contract.list("-created_date");
            const userContracts = allContracts.filter((contract) =>
                contract.cliente === user.nome_cliente
            );

            // Calcular dias restantes para cada contrato
            const today = new Date();
            const enrichedContracts = userContracts.map((contract) => ({
                ...contract,
                daysRemaining: contract.data_fim_efetividade ?
                    differenceInDays(new Date(contract.data_fim_efetividade), today) : null
            }));

            setContracts(enrichedContracts);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
        setIsLoading(false);
    };

    const getTotalValue = () => {
        return contracts.reduce((sum, contract) => sum + (contract.valor_contrato || 0), 0);
    };

    const getExpiringContracts = () => {
        return contracts.filter((contract) => {
            if (!contract.data_fim_efetividade || contract.status !== "Ativo") return false;
            return contract.daysRemaining <= 60 && contract.daysRemaining >= 0;
        });
    };

    const getStatusColor = (daysRemaining) => {
        if (daysRemaining === null) return "bg-gray-100 text-gray-800";
        if (daysRemaining < 0) return "bg-red-100 text-red-800";
        if (daysRemaining <= 30) return "bg-red-100 text-red-800";
        if (daysRemaining <= 60) return "bg-orange-100 text-orange-800";
        return "bg-green-100 text-green-800";
    };

    const getStatusText = (daysRemaining, status) => {
        if (status !== "Ativo") return "Expirado";
        if (daysRemaining === null) return "Sem prazo";
        if (daysRemaining < 0) return "Vencido";
        if (daysRemaining <= 30) return "Urgente";
        if (daysRemaining <= 60) return "Atenção";
        return "Normal";
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array(3).fill(0).map((_, i) =>
                        <Card key={i}>
                            <CardContent className="p-6">
                                <Skeleton className="h-6 w-32 mb-4" />
                                <Skeleton className="h-8 w-24" />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>);

    }

    return (
        <div className="p-6 space-y-8">
            {/* Header do Cliente */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{user?.nome_cliente || "Cliente"}</h1>
                        <p className="text-gray-600 flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            Portal do Cliente - {user?.full_name}
                        </p>
                    </div>
                </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total de Contratos</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{contracts.length}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Valor Total Contratado</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: "compact" }).format(getTotalValue())}
                                </h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Calendar className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Vencendo em Breve</p>
                                <p className="text-xs text-orange-600 font-medium mb-1">(Próximos 2 meses)</p>
                                <h3 className="text-3xl font-bold text-gray-900">{getExpiringContracts().length}</h3>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de Contratos */}
            <Card className="border-0 shadow-md">
                <CardHeader className="bg-gray-50/50 border-b">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="w-5 h-5 text-gray-500" />
                        Seus Contratos Ativos
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {contracts.length === 0 ?
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contrato encontrado</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">Não encontramos contratos vinculados à sua conta neste momento.</p>
                        </div> :

                        <div className="divide-y divide-gray-100">
                            {contracts.map((contract) =>
                                <div
                                    key={contract.id}
                                    className="p-6 hover:bg-gray-50 transition-colors group">

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {contract.contrato}
                                                </h4>
                                                <Badge className={getStatusColor(contract.daysRemaining)}>
                                                    {getStatusText(contract.daysRemaining, contract.status)}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <UserIcon className="w-4 h-4" />
                                                    Analista: {contract.analista_responsavel}
                                                </span>
                                                {contract.objeto_contrato && (
                                                    <span className="hidden md:inline-block text-gray-300">|</span>
                                                )}
                                                {contract.objeto_contrato && (
                                                    <span className="truncate max-w-md" title={contract.objeto_contrato}>
                                                        {contract.objeto_contrato}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right flex flex-col items-end gap-1">
                                            <p className="text-xl font-bold text-gray-900">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.valor_contrato || 0)}
                                            </p>

                                            {contract.data_fim_efetividade ?
                                                <div className="text-sm">
                                                    <p className="text-gray-500">
                                                        Vence em {format(new Date(contract.data_fim_efetividade), "dd/MM/yyyy")}
                                                    </p>
                                                </div> :
                                                <p className="text-sm text-gray-400">Sem data de vencimento</p>
                                            }
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    }
                </CardContent>
            </Card>
        </div>
    );
}
