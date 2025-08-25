import React, { useState, useEffect } from "react";
import { Contract } from "@/entities/Contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Search, Download, Upload, Filter } from "lucide-react";
import { differenceInDays } from "date-fns";

import ContractTable from "../components/contracts/ContractTable";
import ContractFilters from "../components/contracts/ContractFilters";
import ImportExportDialog from "../components/contracts/ImportExportDialog";

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    vencimento: "all",
    cliente: ""
  });

  useEffect(() => {
    loadContracts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [contracts, searchTerm, filters]);

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      const data = await Contract.list("-created_date");
      // Calculate days until expiry and status for each contract
      const today = new Date();
      const enrichedData = data.map(contract => {
        let daysUntilExpiry = null;
        let statusVencimento = "Normal";
        
        if (contract.data_fim_efetividade) {
          daysUntilExpiry = differenceInDays(new Date(contract.data_fim_efetividade), today);
          
          if (daysUntilExpiry < 0) {
            statusVencimento = "Vencido";
          } else if (daysUntilExpiry <= 30) {
            statusVencimento = "Urgente";
          } else if (daysUntilExpiry <= 60) {
            statusVencimento = "Atenção";
          }
        }
        
        return {
          ...contract,
          daysUntilExpiry,
          status_vencimento: statusVencimento
        };
      });
      
      setContracts(enrichedData);
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = contracts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.contrato?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(contract => contract.status === filters.status);
    }

    // Expiry filter
    if (filters.vencimento !== "all") {
      filtered = filtered.filter(contract => contract.status_vencimento === filters.vencimento);
    }

    // Client filter
    if (filters.cliente) {
      filtered = filtered.filter(contract =>
        contract.cliente?.toLowerCase().includes(filters.cliente.toLowerCase())
      );
    }

    setFilteredContracts(filtered);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contratos</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os seus contratos</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowImportExport(true)}
          >
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

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, cliente ou número do contrato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "bg-blue-50 text-blue-700" : ""}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {showFilters && (
        <ContractFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      <ContractTable
        contracts={filteredContracts}
        isLoading={isLoading}
        onContractUpdate={loadContracts}
      />

      <ImportExportDialog
        open={showImportExport}
        onOpenChange={setShowImportExport}
        contracts={contracts}
        onImportComplete={loadContracts}
      />
    </div>
  );
}