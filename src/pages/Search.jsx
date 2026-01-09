import React, { useState, useEffect, useCallback } from "react";
import { Contract } from "@/entities/Contract";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import { differenceInDays } from "date-fns";

import ContractTable from "../components/contracts/ContractTable";

import { useAuth } from "@/context/AuthContext";

export default function Search() {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
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
    if (user) {
      loadAllContracts();
    }
  }, [user]);

  const loadAllContracts = async () => {
    setIsLoading(true);
    try {
      const data = await Contract.list("-created_date");

      // Filtrar se for Analista
      const baseData = user.perfil === "ANALISTA"
        ? data.filter(c => c.analista_responsavel === user.full_name)
        : data;

      const enrichedData = baseData.map(contract => {
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

  const applyFilters = useCallback(() => {
    let filtered = contracts;

    // Text search
    if (searchFilters.searchTerm) {
      const term = searchFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(contract =>
        contract.analista_responsavel?.toLowerCase().includes(term) ||
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
  }, [contracts, searchFilters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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
    <div className="p-6 min-h-screen bg-gray-50/50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pesquisa Avançada</h1>
        <p className="text-gray-500 mt-1">Explore sua base de contratos com precisão</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-6 border-gray-200 shadow-sm">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="w-5 h-5" />
                  Filtros
                </CardTitle>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 show-scroll max-h-[calc(100vh-200px)] overflow-y-auto">

              {/* Status Section */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">Status do Contrato</label>
                <div className="flex flex-col gap-2">
                  {['all', 'Ativo', 'Expirado'].map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="status"
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        checked={searchFilters.status === status}
                        onChange={() => updateFilter('status', status)}
                      />
                      <span className={`text-sm ${searchFilters.status === status ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        {status === 'all' ? 'Todos' : status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Client Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Cliente</label>
                <Input
                  placeholder="Nome do cliente..."
                  value={searchFilters.cliente}
                  onChange={(e) => updateFilter("cliente", e.target.value)}
                  className="bg-gray-50"
                />
              </div>

              <div className="h-px bg-gray-100" />

              {/* Expiry Status */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Situação de Vencimento</label>
                <Select value={searchFilters.vencimento} onValueChange={(value) => updateFilter("vencimento", value)}>
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Atenção">Atenção (30-60 dias)</SelectItem>
                    <SelectItem value="Urgente">Urgente (&lt; 30 dias)</SelectItem>
                    <SelectItem value="Vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Value Range */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">Faixa de Valor</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">Mínimo</span>
                    <Input
                      type="number"
                      placeholder="0"
                      className="bg-gray-50 text-sm"
                      value={searchFilters.valorMin}
                      onChange={(e) => updateFilter("valorMin", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">Máximo</span>
                    <Input
                      type="number"
                      placeholder="Sem limite"
                      className="bg-gray-50 text-sm"
                      value={searchFilters.valorMax}
                      onChange={(e) => updateFilter("valorMax", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Date Range - Start */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">Início de Vigência</label>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">De</span>
                    <Input
                      type="date"
                      className="bg-gray-50 text-sm"
                      value={searchFilters.dataInicioMin}
                      onChange={(e) => updateFilter("dataInicioMin", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">Até</span>
                    <Input
                      type="date"
                      className="bg-gray-50 text-sm"
                      value={searchFilters.dataInicioMax}
                      onChange={(e) => updateFilter("dataInicioMax", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Main Search Bar */}
          <div className="relative shadow-sm">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Pesquise por contrato, objeto, analista..."
              value={searchFilters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">Resultados encontrados:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                {filteredContracts.length}
              </span>
            </div>
            {/* Future: Sort Dropdown could go here */}
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
            <ContractTable
              contracts={filteredContracts}
              isLoading={isLoading}
              onContractUpdate={loadAllContracts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}