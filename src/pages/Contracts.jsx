import React, { useState } from "react";
import { useContracts } from "@/hooks/useContracts";
import ContractTable from "../components/contracts/ContractTable";
import ContractFilters from "../components/contracts/ContractFilters";
import ImportExportDialog from "../components/contracts/ImportExportDialog";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { contractKeys } from "@/hooks/useContracts";

import { useAuth } from "@/context/AuthContext";

export default function Contracts() {
  const { data: contracts = [], isLoading } = useContracts();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    analista: "all",
    vencimento: "all"
  });
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Filter logic
  const filteredContracts = contracts.filter((contract) => {
    // Filtro de segurança por perfil
    if (user?.perfil === "ANALISTA" && contract.analista_responsavel !== user.full_name) {
      return false;
    }

    const matchesSearch =
      contract.contrato?.toLowerCase().includes(filters.search.toLowerCase()) ||
      contract.cliente?.toLowerCase().includes(filters.search.toLowerCase()) ||
      contract.analista_responsavel?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = filters.status === "all" || contract.status === filters.status;
    const matchesAnalista = filters.analista === "all" || contract.analista_responsavel === filters.analista;
    const matchesVencimento = filters.vencimento === "all" || contract.status_vencimento === filters.vencimento;

    return matchesSearch && matchesStatus && matchesAnalista && matchesVencimento;
  });

  const handleImportComplete = () => {
    queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    setIsImportDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contratos</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os contratos do sistema</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Importar/Exportar
          </Button>
          <Link to={createPageUrl("NewContract")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Contrato
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <ContractFilters
        filters={filters}
        setFilters={setFilters}
        contracts={contracts}
      />

      {/* Table */}
      <ContractTable
        contracts={filteredContracts}
        isLoading={isLoading}
      />

      {/* Import Dialog */}
      <ImportExportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        contracts={contracts}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}