import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Contract } from "@/entities/Contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, CheckCircle, Plus, DollarSign, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl, formatCurrency, formatCompactCurrency } from "@/utils";
import { format, addMonths, isBefore } from "date-fns";

export default function AnalystDashboard() {
    const { user } = useAuth();
    const [contracts, setContracts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Otimização: Filtrar direto no banco
            const myContracts = await Contract.list({ analista: user.full_name });

            setContracts(myContracts);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
        setIsLoading(false);
    };

    // Métricas
    const totalContracts = contracts.length;
    const activeContractsList = contracts.filter(c => c.status === "Ativo");
    const activeContractsCount = activeContractsList.length;

    const twoMonthsFromNow = addMonths(new Date(), 2);
    const expiringContracts = contracts.filter(c => {
        if (!c.data_fim_efetividade || c.status !== "Ativo") return false;
        const endDate = new Date(c.data_fim_efetividade);
        return isBefore(endDate, twoMonthsFromNow) && endDate >= new Date();
    });

    // Cálculos Financeiros (Considerando apenas contratos ATIVOS)
    const totalValue = activeContractsList.reduce((acc, curr) => acc + (curr.valor_contrato || 0), 0);
    const totalInvoiced = activeContractsList.reduce((acc, curr) => acc + (curr.valor_faturado || 0), 0);
    const totalToInvoice = activeContractsList.reduce((acc, curr) => acc + (curr.valor_a_faturar || 0), 0);

    if (isLoading) {
        return <div className="p-6">Carregando dashboard...</div>;
    }

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Olá, {user.full_name.split(' ')[0]}! 👋</h1>
                    <p className="text-gray-600 mt-1">Aqui está o resumo dos seus contratos.</p>
                </div>
                <Link to={createPageUrl("NewContract")}>
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Contrato
                    </Button>
                </Link>
            </div>

            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-500 truncate">Total de Contratos</p>
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2 truncate" title={totalContracts}>
                                    {totalContracts}
                                </h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-500 truncate">Contratos Ativos</p>
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2 truncate" title={activeContractsCount}>
                                    {activeContractsCount}
                                </h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg shrink-0">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-500 truncate">Vencendo em Breve</p>
                                <p className="text-xs text-orange-600 font-medium mb-1 truncate">(Próximos 2 meses)</p>
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 truncate" title={expiringContracts.length}>
                                    {expiringContracts.length}
                                </h3>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg shrink-0">
                                <AlertTriangle className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="overflow-hidden min-w-0">
                                <p className="text-sm font-medium text-gray-500 truncate">Valor Total (Carteira)</p>
                                <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mt-2 truncate" title={formatCurrency(totalValue)}>
                                    {formatCompactCurrency(totalValue)}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 truncate" title={`Faturado: ${formatCurrency(totalInvoiced)}`}>
                                    Faturado: {formatCompactCurrency(totalInvoiced)}
                                </p>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg shrink-0">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de Contratos a Vencer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-500" />
                                Atenção Necessária
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {expiringContracts.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Nenhum contrato vencendo nos próximos 2 meses. Tudo tranquilo! 🏖️
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {expiringContracts.map(contract => (
                                        <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{contract.contrato}</h4>
                                                <p className="text-sm text-gray-600">{contract.cliente}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 mb-1">
                                                    Vence em {format(new Date(contract.data_fim_efetividade.includes("T") ? contract.data_fim_efetividade : contract.data_fim_efetividade + "T00:00:00"), "dd/MM/yyyy")}
                                                </Badge>
                                                <Link to={`${createPageUrl("EditContract")}?id=${contract.id}`} className="block text-sm text-blue-600 hover:underline">
                                                    Resolver
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Resumo Financeiro Detalhado */}
                <div>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Sua Carteira</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm items-center gap-2">
                                    <span className="text-gray-600 whitespace-nowrap">Valor Total Contratado</span>
                                    <span className="font-medium truncate" title={formatCurrency(totalValue)}>{formatCurrency(totalValue)}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm items-center gap-2">
                                    <span className="text-gray-600 whitespace-nowrap">Valor Faturado</span>
                                    <span className="font-medium text-green-600 truncate" title={formatCurrency(totalInvoiced)}>{formatCurrency(totalInvoiced)}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full"
                                        style={{ width: `${totalValue > 0 ? (totalInvoiced / totalValue) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm items-center gap-2">
                                    <span className="text-gray-600 whitespace-nowrap">Valor a Faturar</span>
                                    <span className="font-medium text-orange-600 truncate" title={formatCurrency(totalToInvoice)}>{formatCurrency(totalToInvoice)}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500 rounded-full"
                                        style={{ width: `${totalValue > 0 ? (totalToInvoice / totalValue) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
