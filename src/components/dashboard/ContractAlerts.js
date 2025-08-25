import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContractAlerts({ contracts, isLoading }) {
  const getAlertContracts = () => {
    const today = new Date();
    return contracts
      .filter(contract => {
        if (!contract.data_fim_efetividade || contract.status !== "Ativo") return false;
        const daysUntilExpiry = differenceInDays(new Date(contract.data_fim_efetividade), today);
        return daysUntilExpiry <= 60 && daysUntilExpiry >= 0;
      })
      .map(contract => ({
        ...contract,
        daysUntilExpiry: differenceInDays(new Date(contract.data_fim_efetividade), today)
      }))
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  };

  const alertContracts = getAlertContracts();

  const getAlertLevel = (days) => {
    if (days <= 30) return { level: "Urgente", color: "bg-red-100 text-red-800", icon: AlertTriangle };
    if (days <= 60) return { level: "Atenção", color: "bg-orange-100 text-orange-800", icon: Calendar };
    return { level: "Normal", color: "bg-green-100 text-green-800", icon: Calendar };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Alertas de Vencimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : alertContracts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum contrato próximo do vencimento
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {alertContracts.map((contract) => {
              const alert = getAlertLevel(contract.daysUntilExpiry);
              return (
                <div key={contract.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{contract.nome}</p>
                    <p className="text-sm text-gray-600">{contract.cliente}</p>
                    <p className="text-xs text-gray-500">
                      Vence em {format(new Date(contract.data_fim_efetividade), "dd/MM/yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={alert.color}>
                      {contract.daysUntilExpiry} dias
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{alert.level}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}