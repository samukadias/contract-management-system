import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Edit, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  "Ativo": "bg-green-100 text-green-800",
  "Expirado": "bg-red-100 text-red-800"
};

const vencimentoColors = {
  "Normal": "bg-gray-100 text-gray-800",
  "Atenção": "bg-orange-100 text-orange-800",
  "Urgente": "bg-red-100 text-red-800",
  "Vencido": "bg-red-100 text-red-800"
};

export default function ContractTable({ contracts, isLoading, onContractUpdate }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
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

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Data Fim</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{contract.nome}</TableCell>
                  <TableCell>{contract.cliente}</TableCell>
                  <TableCell>{contract.contrato}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[contract.status]}>
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={vencimentoColors[contract.status_vencimento]}>
                      {contract.status_vencimento}
                      {contract.daysUntilExpiry !== null && contract.daysUntilExpiry >= 0 && (
                        <span className="ml-1">({contract.daysUntilExpiry}d)</span>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {contract.data_fim_efetividade ? 
                      format(new Date(contract.data_fim_efetividade), "dd/MM/yyyy") : 
                      "-"
                    }
                  </TableCell>
                  <TableCell>
                    {contract.valor_contrato ? 
                      `R$ ${contract.valor_contrato.toLocaleString('pt-BR')}` : 
                      "-"
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link to={createPageUrl(`ViewContract?id=${contract.id}`)}>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={createPageUrl(`EditContract?id=${contract.id}`)}>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}