import React, { useState, useEffect } from "react";
import { Contract } from "@/entities/Contract";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import { differenceInDays } from "date-fns";

import ContractTable from "../components/contracts/ContractTable";

export default function Search() {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: "",
    status: "all",
    cliente: "",
    vencimento: "all",
    valorMin: "",
    valorMax: "",
    dataInicioMin: "",
    dataInicioMax: "",
    dataFimMin: "",
    dataFimMax: ""
  });

  useEffect(() => {
    loadAllContracts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [contracts, searchFilters]);

  const loadAllContracts = async () => {
    setIsLoading(true);
    try {
      const data = await Contract.list("-created_date");
      const enrichedData = data.map(contract => {
        let daysUntilExpiry = null;
        let statusVencimento = "Normal";
        
        if (contract.data_fim_efetividade) {
          const today = new Date();
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

    // Text search
    if (searchFilters.searchTerm) {
      const term = searchFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(contract =>
        contract.nome?.toLowerCase().includes(term) ||
        contract.cliente?.toLowerCase().includes(term) ||
        contract.contrato?.toLowerCase().includes(term) ||
        contract.objeto_contrato?.toLowerCase().includes(term) ||
        contract.grupo_cliente?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (searchFilters.status !== "all") {
      filtered = filtered.filter(contract => contract.status === searchFilters.status);
    }

    // Client filter
    if (searchFilters.cliente) {
      filtered = filtered.filter(contract =>
        contract.cliente?.toLowerCase().includes(searchFilters.cliente.toLowerCase())
      );
    }

    // Expiry status
    if (searchFilters.vencimento !== "all") {
      filtered = filtered.filter(contract => contract.status_vencimento === searchFilters.vencimento);
    }

    // Value range
    if (searchFilters.valorMin) {
      filtered = filtered.filter(contract => 
        contract.valor_contrato >= parseFloat(searchFilters.valorMin)
      );
    }
    if (searchFilters.valorMax) {
      filtered = filtered.filter(contract => 
        contract.valor_contrato <= parseFloat(searchFilters.valorMax)
      );
    }

    // Date ranges
    if (searchFilters.dataInicioMin) {
      filtered = filtered.filter(contract =>
        contract.data_inicio_efetividade >= searchFilters.dataInicioMin
      );
    }
    if (searchFilters.dataInicioMax) {
      filtered = filtered.filter(contract =>
        contract.data_inicio_efetividade <= searchFilters.dataInicioMax
      );
    }
    if (searchFilters.dataFimMin) {
      filtered = filtered.filter(contract =>
        contract.data_fim_efetividade >= searchFilters.dataFimMin
      );
    }
    if (searchFilters.dataFimMax) {
      filtered = filtered.filter(contract =>
        contract.data_fim_efetividade <= searchFilters.dataFimMax
      );
    }

    setFilteredContracts(filtered);
  };

  const updateFilter = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      searchTerm: "",
      status: "all",
      cliente: "",
      vencimento: "all",
      valorMin: "",
      valorMax: "",
      dataInicioMin: "",
      dataInicioMax: "",
      dataFimMin: "",
      dataFimMax: ""
    });
  };

  const hasActiveFilters = Object.values(searchFilters).some(value => 
    value !== "" && value !== "all"
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pesquisa Avançada</h1>
        <p className="text-gray-600 mt-1">Encontre contratos com filtros detalhados</p>
      </div>

      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar em todos os campos..."
              value={searchFilters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={searchFilters.status} onValueChange={(value) => updateFilter("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Expirado">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Input
                placeholder="Nome do cliente..."
                value={searchFilters.cliente}
                onChange={(e) => updateFilter("cliente", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status Vencimento</label>
              <Select value={searchFilters.vencimento} onValueChange={(value) => updateFilter("vencimento", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Atenção">Atenção</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Value range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Mínimo</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={searchFilters.valorMin}
                onChange={(e) => updateFilter("valorMin", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Máximo</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={searchFilters.valorMax}
                onChange={(e) => updateFilter("valorMax", e.target.value)}
              />
            </div>
          </div>

          {/* Date ranges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Início - De</label>
              <Input
                type="date"
                value={searchFilters.dataInicioMin}
                onChange={(e) => updateFilter("dataInicioMin", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Início - Até</label>
              <Input
                type="date"
                value={searchFilters.dataInicioMax}
                onChange={(e) => updateFilter("dataInicioMax", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Fim - De</label>
              <Input
                type="date"
                value={searchFilters.dataFimMin}
                onChange={(e) => updateFilter("dataFimMin", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Fim - Até</label>
              <Input
                type="date"
                value={searchFilters.dataFimMax}
                onChange={(e) => updateFilter("dataFimMax", e.target.value)}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Resultados ({filteredContracts.length} contratos)
        </h2>
      </div>

      <ContractTable
        contracts={filteredContracts}
        isLoading={isLoading}
        onContractUpdate={loadAllContracts}
      />
    </div>
  );
}