import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HealthMetrics({ healthData, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="w-12 h-12 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getHealthColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const metrics = [
    {
      title: "Taxa de Rentabilidade",
      value: `${healthData.profitabilityRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: getHealthColor(healthData.profitabilityRate),
      bgColor: healthData.profitabilityRate >= 80 ? "bg-green-50" : 
               healthData.profitabilityRate >= 60 ? "bg-yellow-50" : "bg-red-50"
    },
    {
      title: "Eficiência de Faturamento",
      value: `${healthData.billingEfficiency.toFixed(1)}%`,
      icon: DollarSign,
      color: getHealthColor(healthData.billingEfficiency),
      bgColor: healthData.billingEfficiency >= 80 ? "bg-green-50" : 
               healthData.billingEfficiency >= 60 ? "bg-yellow-50" : "bg-red-50"
    },
    {
      title: "Taxa de Cancelamento",
      value: `${healthData.cancellationRate.toFixed(1)}%`,
      icon: TrendingDown,
      color: healthData.cancellationRate <= 10 ? "text-green-600" : 
             healthData.cancellationRate <= 20 ? "text-yellow-600" : "text-red-600",
      bgColor: healthData.cancellationRate <= 10 ? "bg-green-50" : 
               healthData.cancellationRate <= 20 ? "bg-yellow-50" : "bg-red-50"
    },
    {
      title: "Contratos em Risco",
      value: healthData.riskContracts,
      icon: AlertTriangle,
      color: healthData.riskContracts === 0 ? "text-green-600" : 
             healthData.riskContracts <= 3 ? "text-yellow-600" : "text-red-600",
      bgColor: healthData.riskContracts === 0 ? "bg-green-50" : 
               healthData.riskContracts <= 3 ? "bg-yellow-50" : "bg-red-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">{metric.title}</p>
                <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}