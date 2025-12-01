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

  const getHealthAnalysis = () => {
    const activeContracts = contracts.filter(c => c.status === "Ativo");

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Análise de Saúde dos Contratos</h1>
        <p className="text-gray-600 mt-1">Entenda a rentabilidade e riscos dos seus contratos</p>
      </div>

      <HealthMetrics healthData={healthData} isLoading={isLoading} />

      <div className="grid lg:grid-cols-2 gap-6">
        <ProfitabilityChart contracts={contracts} isLoading={isLoading} />
        <ClientAnalysis contracts={contracts} isLoading={isLoading} />
      </div>

      <ExpiryAnalysis contracts={contracts} isLoading={isLoading} />
    </div>
  );
}