import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
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
        margin: data.totalBilled > 0 ? ((data.totalBilled - data.totalCanceled) / data.totalBilled) * 100 : 0
      }))
      .sort((a, b) => b.totalBilled - a.totalBilled) // Sort by volume (Billed)
      .slice(0, 10); // Top 10 clients
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
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Faturado vs Valor Contratado
        </CardTitle>
        <p className="text-sm text-gray-500">
          Compare o volume faturado (Barra) com o valor total dos contratos (Linha).
        </p>
      </CardHeader>
      <CardContent>
        {profitabilityData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Dados insuficientes para análise
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={profitabilityData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <defs>
                  <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="client"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                />
                {/* Removed secondary percentage axis */}
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value, name) => {
                    if (name === 'Contratado' || name === 'totalValue') return [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Contratado'];
                    if (name === 'Faturado' || name === 'totalBilled') return [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturado'];
                    if (name === 'profit') return [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Lucro Real'];
                    return [value, name];
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  yAxisId="left"
                  dataKey="totalBilled"
                  name="Faturado"
                  fill="url(#colorBilled)"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="totalValue"
                  name="Contratado"
                  stroke="#f59e0b" // Amber color for contract value
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}