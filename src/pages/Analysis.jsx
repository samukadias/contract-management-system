import React, { useState, useEffect } from "react";
import { Contract } from "@/entities/Contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { differenceInDays } from "date-fns";

import HealthMetrics from "../components/analysis/HealthMetrics";
import ProfitabilityChart from "../components/analysis/ProfitabilityChart";
import ClientAnalysis from "../components/analysis/ClientAnalysis";
import ExpiryAnalysis from "../components/analysis/ExpiryAnalysis";

export default function Analysis() {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'thisYear', 'last12Months'

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      const data = await Contract.list("-created_date");
      setContracts(data);
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
    }
    setIsLoading(false);
  };

  const getFilteredContracts = () => {
    if (timeFilter === 'all') return contracts;

    const today = new Date();

    return contracts.filter(contract => {
      if (!contract.data_inicio_efetividade) return false;
      const startDate = new Date(contract.data_inicio_efetividade);

      if (timeFilter === 'thisYear') {
        return startDate.getFullYear() === today.getFullYear();
      }

      if (timeFilter === 'last12Months') {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        return startDate >= oneYearAgo;
      }

      return true;
    });
  };

  const filteredContracts = getFilteredContracts();

  const getHealthAnalysis = () => {
    const activeContracts = filteredContracts.filter(c => c.status === "Ativo");

    // Profitability analysis
    const profitableContracts = activeContracts.filter(contract => {
      const revenue = contract.valor_faturado || 0;
      const contractValue = contract.valor_contrato || 0;
      const canceled = contract.valor_cancelado || 0;

      return revenue > (canceled * 1.2); // Consider profitable if revenue > 120% of canceled value
    });

    // Risk analysis
    const today = new Date();
    const riskContracts = activeContracts.filter(contract => {
      if (!contract.data_fim_efetividade) return false;
      const daysUntilExpiry = differenceInDays(new Date(contract.data_fim_efetividade), today);
      return daysUntilExpiry <= 60 && daysUntilExpiry >= 0;
    });

    // Financial health
    const totalContractValue = activeContracts.reduce((sum, c) => sum + (c.valor_contrato || 0), 0);
    const totalBilled = activeContracts.reduce((sum, c) => sum + (c.valor_faturado || 0), 0);
    const totalCanceled = activeContracts.reduce((sum, c) => sum + (c.valor_cancelado || 0), 0);

    const billingEfficiency = totalContractValue > 0 ? (totalBilled / totalContractValue) * 100 : 0;
    const cancellationRate = totalContractValue > 0 ? (totalCanceled / totalContractValue) * 100 : 0;

    return {
      totalContracts: activeContracts.length,
      profitableContracts: profitableContracts.length,
      riskContracts: riskContracts.length,
      totalContractValue,
      totalBilled,
      totalCanceled,
      billingEfficiency,
      cancellationRate,
      profitabilityRate: activeContracts.length > 0 ? (profitableContracts.length / activeContracts.length) * 100 : 0
    };
  };

  const healthData = getHealthAnalysis();

  return (
    <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Análise de Saúde</h1>
          <p className="text-gray-500 mt-1">Visão estratégica de rentabilidade e riscos contratuais</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border shadow-sm">
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setTimeFilter('thisYear')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === 'thisYear' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Este Ano
          </button>
          <button
            onClick={() => setTimeFilter('last12Months')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === 'last12Months' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Últimos 12 Meses
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <HealthMetrics healthData={healthData} isLoading={isLoading} />

      {/* Main Analysis Grid: Chart (2/3) + Ranking (1/3) */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProfitabilityChart contracts={filteredContracts} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <ClientAnalysis contracts={filteredContracts} isLoading={isLoading} />
        </div>
      </div>

      {/* Risk Management Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <div className="p-1.5 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Monitoramento de Riscos</h2>
        </div>
        <ExpiryAnalysis contracts={filteredContracts} isLoading={isLoading} />
      </div>
    </div>
  );
}