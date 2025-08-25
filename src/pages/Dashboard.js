
import React, { useState, useEffect } from "react";
import { Contract } from "@/entities/Contract";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Plus,
  Download,
  Upload,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { differenceInDays, format } from "date-fns";

import StatsCard from "../components/dashboard/StatsCard";
import ContractAlerts from "../components/dashboard/ContractAlerts";
import RecentContracts from "../components/dashboard/RecentContracts";
import FinancialOverview from "../components/dashboard/FinancialOverview";

export default function Dashboard() {
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

  const getContractStats = () => {
    const today = new Date();
    const activeContracts = contracts.filter(c => c.status === "Ativo");
    const expiredContracts = contracts.filter(c => c.status === "Expirado");
    
    const expiringContracts = activeContracts.filter(contract => {
      if (!contract.data_fim_efetividade) return false;
      const daysUntilExpiry = differenceInDays(new Date(contract.data_fim_efetividade), today);
      return daysUntilExpiry <= 60 && daysUntilExpiry >= 0;
    });

    const urgentContracts = activeContracts.filter(contract => {
      if (!contract.data_fim_efetividade) return false;
      const daysUntilExpiry = differenceInDays(new Date(contract.data_fim_efetividade), today);
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    });

    const totalValue = contracts.reduce((sum, contract) => sum + (contract.valor_contrato || 0), 0);
    const totalBilled = contracts.reduce((sum, contract) => sum + (contract.valor_faturado || 0), 0);

    return {
      total: contracts.length,
      active: activeContracts.length,
      expired: expiredContracts.length,
      expiring: expiringContracts.length,
      urgent: urgentContracts.length,
      totalValue,
      totalBilled
    };
  };

  const stats = getContractStats();
  const billingProgress = stats.totalValue > 0 ? (stats.totalBilled / stats.totalValue) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral dos seus contratos</p>
        </div>
        <div className="flex gap-3">
          <Link to={createPageUrl("NewContract")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Contrato
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Contratos"
          value={stats.total}
          icon={FileText}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Contratos Ativos"
          value={stats.active}
          icon={TrendingUp}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Vencendo em 2 Meses"
          value={stats.expiring}
          icon={Calendar}
          color="orange"
          isLoading={isLoading}
        />
        <StatsCard
          title="Valor Total dos Contratos"
          value={`R$ ${stats.totalValue.toLocaleString('pt-BR')}`}
          icon={DollarSign}
          color="purple"
          isLoading={isLoading}
          progress={billingProgress}
          progressLabel={`R$ ${stats.totalBilled.toLocaleString('pt-BR')} faturado`}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ContractAlerts contracts={contracts} isLoading={isLoading} />
          <RecentContracts contracts={contracts} isLoading={isLoading} />
        </div>
        <div>
          <FinancialOverview contracts={contracts} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
