import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExpiryAnalysis({ contracts, isLoading }) {
  const getExpiryAnalysis = () => {
    const today = new Date();
    const activeContracts = contracts.filter(c => c.status === "Ativo" && c.data_fim_efetividade);
    
    const categories = {
      urgent: [], // <= 30 days
      attention: [], // 31-60 days
      warning: [], // 61-90 days
      normal: [] // > 90 days
    };

    activeContracts.forEach(contract => {
      const daysUntilExpiry = differenceInDays(new Date(contract.data_fim_efetividade), today);
      
      if (daysUntilExpiry <= 30) {
        categories.urgent.push({ ...contract, daysUntilExpiry });
      } else if (daysUntilExpiry <= 60) {
        categories.attention.push({ ...contract, daysUntilExpiry });
      } else if (daysUntilExpiry <= 90) {
        categories.warning.push({ ...contract, daysUntilExpiry });
      } else {
        categories.normal.push({ ...contract, daysUntilExpiry });
      }
    });

    // Sort by days until expiry
    Object.keys(categories).forEach(key => {
      categories[key].sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    });

    return categories;
  };

  const expiryData = getExpiryAnalysis();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Análise de Vencimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-8 w-12 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryConfig = {
    urgent: {
      title: "Urgente (≤30 dias)",
      color: "bg-red-100 text-red-800 border-red-200",
      bgColor: "bg-red-50",
      icon: AlertTriangle
    },
    attention: {
      title: "Atenção (31-60 dias)",
      color: "bg-orange-100 text-orange-800 border-orange-200",
      bgColor: "bg-orange-50",
      icon: Calendar
    },
    warning: {
      title: "Aviso (61-90 dias)",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
      bgColor: "bg-yellow-50",
      icon: Calendar
    },
    normal: {
      title: "Normal (>90 dias)",
      color: "bg-green-100 text-green-800 border-green-200",
      bgColor: "bg-green-50",
      icon: Calendar
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Análise de Vencimentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(expiryData).map(([category, contracts]) => {
            const config = categoryConfig[category];
            return (
              <div key={category} className={`p-4 border rounded-lg ${config.bgColor}`}>
                <div className="flex items-center gap-2 mb-3">
                  <config.icon className="w-4 h-4" />
                  <h3 className="font-medium text-sm">{config.title}</h3>
                </div>
                <p className="text-2xl font-bold mb-3">{contracts.length}</p>
                
                {contracts.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {contracts.slice(0, 3).map((contract) => (
                      <div key={contract.id} className="text-xs">
                        <p className="font-medium truncate">{contract.nome}</p>
                        <p className="text-gray-600">
                          {contract.daysUntilExpiry} dias • {format(new Date(contract.data_fim_efetividade), "dd/MM/yyyy")}
                        </p>
                      </div>
                    ))}
                    {contracts.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{contracts.length - 3} outros contratos
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}