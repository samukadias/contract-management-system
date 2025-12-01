import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Calendar, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default function ContractDetailsModal({ open, onOpenChange, contracts, title }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getStatusIcon = (status) => {
    if (status === "advanced") {
      return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    } else if (status === "onTime") {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    } else { // status === "delayed"
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status) => {
    if (status === "advanced") {
      return <Badge className="bg-blue-100 text-blue-800">Adiantado</Badge>;
    } else if (status === "onTime") {
      return <Badge className="bg-green-100 text-green-800">No Prazo</Badge>;
    } else { // status === "delayed"
      return <Badge className="bg-red-100 text-red-800">Fora do Prazo</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {contracts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum contrato encontrado nesta categoria.
            </p>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Resumo</h3>
                </div>
                <p className="text-sm text-blue-700">
                  Exibindo <strong>{contracts.length}</strong> contratos nesta categoria.
                  {contracts.some(c => c.status === "advanced") && (
                    <span className="block mt-1">
                      Contratos "Adiantados" estão em uma etapa mais avançada que o esperado pelo prazo.
                    </span>
                  )}
                  {contracts.some(c => c.status === "delayed") && (
                    <span className="block mt-1">
                      Contratos "Fora do Prazo" deveriam estar em etapas diferentes com base no tempo restante.
                    </span>
                  )}
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes dos Contratos</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Analista Responsável</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Etapa Atual</TableHead>
                          <TableHead>Etapa Esperada</TableHead>
                          <TableHead>Dias Restantes</TableHead>
                          <TableHead>Data Fim</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contracts.map((contract) => (
                          <TableRow key={contract.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(contract.status)}
                                {getStatusBadge(contract.status)}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {contract.analista_responsavel}
                            </TableCell>
                            <TableCell>{contract.cliente}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">
                                  {contract.currentStage}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className={`font-medium ${contract.status === "advanced" ? 'text-blue-700' :
                                    contract.status === "onTime" ? 'text-green-700' : 'text-red-700'
                                  }`}>
                                  {contract.expectedStage}
                                </div>
                                {contract.status !== "onTime" && (
                                  <div className={`text-xs mt-1 ${contract.status === "advanced" ? 'text-blue-600' : 'text-red-600'
                                    }`}>
                                    {contract.status === "advanced" ? "Acima do esperado" : "Deveria estar nesta etapa"}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-center">
                                <div className={`font-bold ${contract.daysToExpiry <= 30 ? 'text-red-600' :
                                    contract.daysToExpiry <= 60 ? 'text-orange-600' : 'text-gray-600'
                                  }`}>
                                  {contract.daysToExpiry}
                                </div>
                                <div className="text-xs text-gray-500">dias</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {contract.data_fim_efetividade ?
                                  format(new Date(contract.data_fim_efetividade), "dd/MM/yyyy") :
                                  "-"
                                }
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">
                                {formatCurrency(contract.valor_contrato)}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {contracts.some(c => c.status !== "onTime") && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800">Atenção</h3>
                  </div>
                  <div className="text-sm text-yellow-700 space-y-2">
                    {contracts.some(c => c.status === "advanced") && (
                      <p>
                        ✓ Contratos "Adiantados" estão progredindo mais rápido que o esperado - isso é positivo!
                      </p>
                    )}
                    {contracts.some(c => c.status === "delayed") && (
                      <p>
                        ⚠ Contratos "Fora do Prazo" estão em etapas que não correspondem ao tempo restante.
                        Considere revisar e atualizar as etapas destes contratos.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}