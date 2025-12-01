import React, { useState, useEffect } from "react";
import { Contract } from "@/entities/Contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { differenceInDays, format, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { useAuth } from "@/context/AuthContext";

export default function GestorDashboard() {
    const [contracts, setContracts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            loadContracts();
        }
    }, [user]);

    const loadContracts = async () => {
        setIsLoading(true);
        try {
            const data = await Contract.list("-data_fim_efetividade");

            // Filtrar se for Analista
            const filteredData = user.perfil === "ANALISTA"
                ? data.filter(c => c.analista_responsavel === user.full_name)
                : data;

            setContracts(filteredData);
        } catch (error) {
            console.error("Erro ao carregar contratos:", error);
        }
        setIsLoading(false);
    };

    const getTimelineData = () => {
        const today = new Date();
        const months = [
            { start: startOfMonth(today), end: endOfMonth(today), label: "Mês Atual" },
            { start: startOfMonth(addMonths(today, 1)), end: endOfMonth(addMonths(today, 1)), label: "Próximo Mês" },
            { start: startOfMonth(addMonths(today, 2)), end: endOfMonth(addMonths(today, 2)), label: "Em 2 Meses" }
        ];

        return months.map(month => {
            const monthContracts = contracts.filter(contract => {
                if (!contract.data_fim_efetividade || contract.status !== "Ativo") return false;

                const endDate = new Date(contract.data_fim_efetividade);
                return endDate >= month.start && endDate <= month.end;
            });

            // Agrupar por tipo de tratativa
            const byTratativa = {
                "RENOVAÇÃO": [],
                "PRORROGAÇÃO": [],
                "Outros": []
            };

            monthContracts.forEach(contract => {
                const tipo = contract.tipo_tratativa;
                if (tipo === "RENOVAÇÃO") {
                    byTratativa["RENOVAÇÃO"].push(contract);
                } else if (tipo === "PRORROGAÇÃO") {
                    byTratativa["PRORROGAÇÃO"].push(contract);
                } else {
                    byTratativa["Outros"].push(contract);
                }
            });

            return {
                month: format(month.start, "MMMM yyyy"),
                start: month.start,
                end: month.end,
                label: month.label,
                total: monthContracts.length,
                contracts: monthContracts,
                byTratativa
            };
        });
    };

    const timelineData = getTimelineData();

    const getUrgencyColor = (daysRemaining) => {
        if (daysRemaining <= 30) return "bg-red-100 text-red-800 border-red-200";
        if (daysRemaining <= 60) return "bg-orange-100 text-orange-800 border-orange-200";
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Gestor - Timeline de Contratos</h1>
                <p className="text-gray-600">Carregando dados...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Gestor - Timeline de Contratos</h1>
                <p className="text-gray-600 mt-1">Contratos que vencem nos próximos 3 meses</p>
            </div>

            {/* Resumo Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {timelineData.map((period, idx) => (
                    <Card key={idx} className="bg-gradient-to-br from-blue-50 to-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                {period.label}
                            </CardTitle>
                            <p className="text-sm text-gray-600">{period.month}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-blue-600 mb-4">
                                {period.total}
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Renovações:</span>
                                    <span className="font-semibold">{period.byTratativa["RENOVAÇÃO"].length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Prorrogações:</span>
                                    <span className="font-semibold">{period.byTratativa["PRORROGAÇÃO"].length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Outros:</span>
                                    <span className="font-semibold">{period.byTratativa["Outros"].length}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Detalhamento por Período */}
            {timelineData.map((period, idx) => (
                <Card key={idx}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            {period.label} - {period.month}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                            {period.total} contrato(s) vencem neste período
                        </p>
                    </CardHeader>
                    <CardContent>
                        {period.total === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Nenhum contrato vence neste período
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {["RENOVAÇÃO", "PRORROGAÇÃO", "Outros"].map(tipo => {
                                    const contratos = period.byTratativa[tipo];
                                    if (contratos.length === 0) return null;

                                    return (
                                        <div key={tipo}>
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Badge variant="outline">{tipo}</Badge>
                                                <span className="text-sm text-gray-600">({contratos.length} contratos)</span>
                                            </h4>
                                            <div className="grid gap-3">
                                                {contratos.map(contract => {
                                                    const daysRemaining = differenceInDays(
                                                        new Date(contract.data_fim_efetividade),
                                                        new Date()
                                                    );

                                                    return (
                                                        <Link
                                                            key={contract.id}
                                                            to={`${createPageUrl("ViewContract")}?id=${contract.id}`}
                                                            className="block"
                                                        >
                                                            <div className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${getUrgencyColor(daysRemaining)}`}>
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex-1">
                                                                        <h5 className="font-semibold text-gray-900 mb-1">
                                                                            {contract.contrato}
                                                                        </h5>
                                                                        <p className="text-sm text-gray-700 mb-2">
                                                                            Cliente: {contract.cliente}
                                                                        </p>
                                                                        <div className="flex flex-wrap gap-2 text-xs">
                                                                            <Badge variant="outline">
                                                                                Analista: {contract.analista_responsavel}
                                                                            </Badge>
                                                                            {contract.etapa && (
                                                                                <Badge variant="outline">
                                                                                    {contract.etapa}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right ml-4">
                                                                        <div className="flex items-center gap-1 text-lg font-bold mb-1">
                                                                            <AlertTriangle className="w-5 h-5" />
                                                                            <span>{daysRemaining}</span>
                                                                        </div>
                                                                        <p className="text-xs">dias restantes</p>
                                                                        <p className="text-xs mt-1">
                                                                            Vence em {format(new Date(contract.data_fim_efetividade), "dd/MM/yyyy")}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
