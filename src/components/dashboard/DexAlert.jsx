import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, DollarSign, Calendar } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function DexAlert({ contracts, isLoading }) {
    const getDexAlerts = () => {
        const today = new Date();
        const highValueThreshold = 20000000; // 20 milhões

        return contracts.filter(contract => {
            if (contract.status !== "Ativo") return false;

            const isHighValue = (contract.valor_contrato || 0) >= highValueThreshold;

            let isExpiringSoon = false;
            if (contract.data_fim_efetividade) {
                const daysUntilExpiry = differenceInDays(new Date(contract.data_fim_efetividade), today);
                isExpiringSoon = daysUntilExpiry <= 60 && daysUntilExpiry >= 0;
            }

            return isHighValue && isExpiringSoon;
        }).map(contract => ({
            ...contract,
            daysUntilExpiry: contract.data_fim_efetividade ?
                differenceInDays(new Date(contract.data_fim_efetividade), today) : null
        }));
    };

    const dexAlerts = getDexAlerts();

    return (
        <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                    <AlertTriangle className="w-5 h-5" />
                    Alertas DEX - Contratos Críticos
                </CardTitle>
                <p className="text-sm text-orange-600">
                    Contratos com valor acima de R$ 20 milhões vencendo em até 2 meses
                </p>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {Array(2).fill(0).map((_, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-white border rounded-lg">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-3 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : dexAlerts.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-green-700 font-medium">Nenhum alerta DEX ativo</p>
                        <p className="text-sm text-green-600 mt-1">
                            Todos os contratos de alto valor estão com prazos adequados
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {dexAlerts.map((contract) => (
                            <div key={contract.id} className="p-4 bg-white border border-orange-200 rounded-lg hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign className="w-4 h-4 text-orange-600" />
                                            <h4 className="font-semibold text-gray-900">{contract.analista_responsavel}</h4>
                                        </div>
                                        <p className="text-gray-700 font-medium mb-1">{contract.cliente}</p>
                                        <p className="text-sm text-gray-600 mb-2">Contrato: {contract.contrato}</p>

                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                R$ {(contract.valor_contrato || 0).toLocaleString('pt-BR')}
                                            </span>
                                            {contract.data_fim_efetividade && (
                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Vence em {format(new Date(contract.data_fim_efetividade), "dd/MM/yyyy")}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right ml-4">
                                        <Badge className="bg-red-100 text-red-800 mb-2">
                                            CRÍTICO
                                        </Badge>
                                        {contract.daysUntilExpiry !== null && (
                                            <p className="text-sm font-bold text-red-600">
                                                {contract.daysUntilExpiry} dias restantes
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="mt-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                            <div className="flex items-center gap-2 text-orange-800">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="font-medium text-sm">
                                    {dexAlerts.length} contrato{dexAlerts.length !== 1 ? 's' : ''} requer{dexAlerts.length === 1 ? '' : 'm'} atenção imediata da Diretoria
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
