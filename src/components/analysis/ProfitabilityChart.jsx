import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

export default function ProfitabilityChart({ contracts, isLoading }) {
  const getProfitabilityData = () => {
    const activeContracts = contracts.filter(c => c.status === "Ativo");
    
    // Group contracts by client
    const clientData = {};
    activeContracts.forEach(contract => {
      const client = contract.cliente || "Sem Cliente";
      if (!clientData[client]) {
        clientData[client] = {
          client,
          totalValue: 0,
          totalBilled: 0,
          totalCanceled: 0,
          contracts: 0
        };
      }
      
      clientData[client].totalValue += contract.valor_contrato || 0;
      clientData[client].totalBilled += contract.valor_faturado || 0;
      clientData[client].totalCanceled += contract.valor_cancelado || 0;
      clientData[client].contracts += 1;
    });

    // Calculate profitability and format for chart
    return Object.values(clientData)
      .map(data => ({
        ...data,
        profit: data.totalBilled - data.totalCanceled,
        margin: data.totalValue > 0 ? ((data.totalBilled - data.totalCanceled) / data.totalValue) * 100 : 0
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 8); // Top 8 clients
  };

  const profitabilityData = getProfitabilityData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Rentabilidade por Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Rentabilidade por Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {profitabilityData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Dados insuficientes para análise
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitabilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="client" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    `R$ ${value.toLocaleString('pt-BR')}`,
                    name === 'profit' ? 'Lucro' : 'Faturado'
                  ]}
                  labelFormatter={(label) => `Cliente: ${label}`}
                />
                <Bar dataKey="profit" fill="#10b981" name="profit" />
                <Bar dataKey="totalBilled" fill="#3b82f6" name="totalBilled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}