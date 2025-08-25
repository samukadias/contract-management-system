import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinancialOverview({ contracts, isLoading }) {
  const getFinancialData = () => {
    const activeContracts = contracts.filter(c => c.status === "Ativo");
    
    const totalContractValue = activeContracts.reduce((sum, c) => sum + (c.valor_contrato || 0), 0);
    const totalBilled = activeContracts.reduce((sum, c) => sum + (c.valor_faturado || 0), 0);
    const totalToBill = activeContracts.reduce((sum, c) => sum + (c.valor_a_faturar || 0), 0);
    const totalCanceled = activeContracts.reduce((sum, c) => sum + (c.valor_cancelado || 0), 0);

    const billingPercentage = totalContractValue > 0 ? (totalBilled / totalContractValue) * 100 : 0;

    return {
      totalContractValue,
      totalBilled,
      totalToBill,
      totalCanceled,
      billingPercentage
    };
  };

  const financialData = getFinancialData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          Resumo Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Valor Total dos Contratos</p>
          <p className="text-2xl font-bold text-gray-900">
            R$ {financialData.totalContractValue.toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-600 font-medium">Faturado</p>
            </div>
            <p className="font-semibold text-green-700">
              R$ {financialData.totalBilled.toLocaleString('pt-BR')}
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-blue-600 font-medium">A Faturar</p>
            </div>
            <p className="font-semibold text-blue-700">
              R$ {financialData.totalToBill.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {financialData.totalCanceled > 0 && (
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <p className="text-xs text-red-600 font-medium">Cancelado</p>
            </div>
            <p className="font-semibold text-red-700">
              R$ {financialData.totalCanceled.toLocaleString('pt-BR')}
            </p>
          </div>
        )}

        <div className="pt-3 border-t">
          <p className="text-sm text-gray-600 mb-2">Taxa de Faturamento</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(financialData.billingPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {financialData.billingPercentage.toFixed(1)}% dos contratos ativos
          </p>
        </div>
      </CardContent>
    </Card>
  );
}