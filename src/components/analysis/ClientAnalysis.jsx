import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientAnalysis({ contracts, isLoading }) {
  const getClientAnalysis = () => {
    const activeContracts = contracts.filter(c => c.status === "Ativo");

    const clientStats = {};
    activeContracts.forEach(contract => {
      const client = contract.cliente || "Sem Cliente";
      if (!clientStats[client]) {
        clientStats[client] = {
          contracts: 0,
          totalValue: 0,
          totalBilled: 0,
          avgValue: 0
        };
      }

      clientStats[client].contracts += 1;
      clientStats[client].totalValue += contract.valor_contrato || 0;
      clientStats[client].totalBilled += contract.valor_faturado || 0;
    });

    return Object.entries(clientStats)
      .map(([client, stats]) => ({
        client,
        ...stats,
        avgValue: stats.contracts > 0 ? stats.totalValue / stats.contracts : 0,
        billingRate: stats.totalValue > 0 ? (stats.totalBilled / stats.totalValue) * 100 : 0
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
  };

  const clientData = getClientAnalysis();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Análise por Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-500" />
          Top 5 Clientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clientData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum cliente encontrado
          </div>
        ) : (
          <div className="space-y-4">
            {clientData.map((client, index) => (
              <div key={client.client} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${['bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-orange-100 text-orange-600', 'bg-pink-100 text-pink-600'][index]
                      }`}>
                      {index + 1}
                    </div>
                    <p className="font-medium text-gray-900">{client.client}</p>
                  </div>
                  <div className="mt-1 text-sm text-gray-600 ml-8">
                    <p>{client.contracts} contratos • Média: R$ {client.avgValue.toLocaleString('pt-BR')}</p>
                    <p>Taxa de faturamento: {client.billingRate.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    R$ {client.totalValue.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-500">
                    R$ {client.totalBilled.toLocaleString('pt-BR')} faturado
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}