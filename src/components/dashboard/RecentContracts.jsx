import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function RecentContracts({ contracts, isLoading }) {
  const recentContracts = contracts.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Contratos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentContracts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhum contrato cadastrado</p>
            <Link to={createPageUrl("NewContract")}>
              <Badge className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200">
                Cadastrar primeiro contrato
              </Badge>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentContracts.map((contract) => (
              <div key={contract.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{contract.nome}</p>
                  <p className="text-sm text-gray-600">{contract.cliente}</p>
                  <p className="text-xs text-gray-500">
                    Criado em {format(new Date(contract.created_date), "dd/MM/yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={contract.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {contract.status}
                  </Badge>
                  {contract.valor_contrato && (
                    <p className="text-xs text-gray-500 mt-1">
                      R$ {contract.valor_contrato.toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}