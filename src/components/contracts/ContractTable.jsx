import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Edit, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  "Ativo": "bg-green-100 text-green-800",
  "Renovado": "bg-blue-100 text-blue-800",
  "Encerrado": "bg-slate-100 text-slate-800",
  "Expirado": "bg-red-100 text-red-800"
};

const vencimentoColors = {
  "Normal": "bg-gray-100 text-gray-800",
  "Atenção": "bg-orange-100 text-orange-800",
  "Urgente": "bg-red-100 text-red-800",
  "Vencido": "bg-red-100 text-red-800"
};

export default function ContractTable({ contracts, isLoading, onContractUpdate }) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  // Reset page when contracts change (e.g. filtering)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [contracts.length]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Analista Responsável</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500 mb-4">Nenhum contrato encontrado</p>
          <Link to={createPageUrl("NewContract")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Cadastrar Primeiro Contrato
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Pagination Logic
  const totalPages = Math.ceil(contracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContracts = contracts.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Analista Responsável</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Data Fim</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentContracts.map((contract) => (
                <TableRow key={contract.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{contract.analista_responsavel}</TableCell>
                  <TableCell>{contract.cliente}</TableCell>
                  <TableCell>{contract.contrato}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[contract.status]}>
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      let status = contract.status_vencimento;
                      const days = contract.daysUntilExpiry;

                      // Calculate status if missing or empty
                      if (!status && days !== null && days !== undefined && !isNaN(days)) {
                        if (days < 0) status = "Vencido";
                        else if (days <= 30) status = "Urgente";
                        else if (days <= 60) status = "Atenção";
                        else status = "Normal";
                      }

                      // Fallback for color if status is somehow still weird or custom
                      const colorClass = vencimentoColors[status] || "bg-gray-100 text-gray-800";

                      return (
                        <Badge className={`${colorClass} whitespace-nowrap`}>
                          {status || "N/A"}
                          {days !== null && days !== undefined && !isNaN(days) && (
                            <span className="ml-1">
                              ({days}d)
                            </span>
                          )}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      if (!contract.data_fim_efetividade) return "-";
                      const dateStr = contract.data_fim_efetividade.includes("T")
                        ? contract.data_fim_efetividade
                        : contract.data_fim_efetividade + "T00:00:00";
                      const date = new Date(dateStr);
                      return isNaN(date.getTime()) ? "Data Inválida" : format(date, "dd/MM/yyyy");
                    })()}
                  </TableCell>
                  <TableCell className="text-right">
                    {contract.valor_contrato ?
                      contract.valor_contrato.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
                      "-"
                    }
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link to={`${createPageUrl("ViewContract")}?id=${contract.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Visualizar</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link to={`${createPageUrl("EditContract")}?id=${contract.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1} a {Math.min(endIndex, contracts.length)} de {contracts.length} contratos
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show window of pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}