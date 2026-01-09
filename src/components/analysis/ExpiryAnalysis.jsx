import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExpiryAnalysis({ contracts, isLoading }) {
  const navigate = useNavigate();
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
      const date = new Date(contract.data_fim_efetividade);
      if (isNaN(date.getTime())) return;
      const daysUntilExpiry = differenceInDays(date, today);

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(expiryData).map(([category, contracts]) => {
        const config = categoryConfig[category];
        return (
          <div key={category} className="flex flex-col h-full bg-white rounded-xl border shadow-sm">
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${config.bgColor}`}>
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md bg-white/60`}>
                  <config.icon className={`w-4 h-4 ${config.color.split(' ')[1]}`} /> {/* Extract text color */}
                </div>
                <h3 className={`font-semibold text-sm ${config.color.split(' ')[1]}`}>{config.title}</h3>
              </div>
              <Badge variant="outline" className="bg-white/50 border-0 font-bold">
                {contracts.length}
              </Badge>
            </div>

            {/* List */}
            <div className="p-3 space-y-3 flex-1">
              {contracts.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-xs text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                  Nenhum contrato
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {contracts.map((contract) => (
                    <div
                      key={contract.id}
                      onClick={() => navigate(`/contracts/view?id=${contract.id}`)}
                      className="p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow group cursor-pointer border-l-4"
                      style={{ borderLeftColor: category === 'urgent' ? '#ef4444' : category === 'attention' ? '#f97316' : category === 'warning' ? '#eab308' : '#22c55e' }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-sm text-gray-900 line-clamp-1 flex-1" title={contract.contrato}>
                          {contract.contrato || "Sem Número"}
                        </p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                          {format(new Date(contract.data_fim_efetividade), "dd/MM")}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 mb-2 line-clamp-1" title={contract.cliente}>
                        {contract.cliente}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${config.bgColor} ${config.color.split(' ')[1]}`}>
                          {contract.daysUntilExpiry} dias
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-blue-600 font-medium hover:underline">Ver detalhes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Action (Optional) */}
            {contracts.length > 5 && (
              <div className="p-2 border-t bg-gray-50 text-center">
                <button className="text-xs text-gray-500 hover:text-gray-900 font-medium">Ver todos</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}