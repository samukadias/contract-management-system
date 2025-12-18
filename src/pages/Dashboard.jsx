import React, { useState, useEffect } from "react";
import { Contract } from "@/entities/Contract";
import { User } from "@/entities/User";
import { Link } from "react-router-dom";
import { createPageUrl, formatCurrency, formatCompactCurrency } from "@/utils";
import {
  FileText,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Plus,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { differenceInDays, format } from "date-fns";

import StatsCard from "../components/dashboard/StatsCard";
import ContractAlerts from "../components/dashboard/ContractAlerts";
import RecentContracts from "../components/dashboard/RecentContracts";
import FinancialOverview from "../components/dashboard/FinancialOverview";
import DexAlert from "../components/dashboard/DexAlert";

import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const [contracts, setContracts] = useState([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContracts();
  }, [user]);

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      let currentUser = user;

      // Fallback: If no user in context, try to get default/dev user
      if (!currentUser) {
        try {
          currentUser = await User.me();
          if (currentUser) {
            // If we found a fallback user, set strictly for this component's logic
            setUser(currentUser);
          }
        } catch (e) {
          console.warn("No fallback user found");
        }
      }

      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      let contractData = await Contract.list("-created_date");

      // Filtrar contratos baseado no perfil do usuário
      if (currentUser.perfil === "ANALISTA") {
        const normalizedUserName = (currentUser.full_name || "").trim().toLowerCase();
        const normalizedUserEmail = (currentUser.email || "").trim().toLowerCase();

        contractData = contractData.filter(contract => {
          const contractAnalyst = (contract.analista_responsavel || "").trim().toLowerCase();
          const contractCreator = (contract.created_by || "").trim().toLowerCase();

          return contractAnalyst === normalizedUserName || contractCreator === normalizedUserEmail;
        });
      }

      setContracts(contractData);
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

    const totalValue = contracts.reduce((sum, contract) => sum + (contract.valor_contrato || 0), 0);
    const totalBilled = contracts.reduce((sum, contract) => sum + (contract.valor_faturado || 0), 0);

    return {
      total: contracts.length,
      active: activeContracts.length,
      expired: expiredContracts.length,
      expiring: expiringContracts.length,
      totalValue,
      totalBilled
    };
  };

  const stats = getContractStats();
  const billingProgress = stats.totalValue > 0 ? (stats.totalBilled / stats.totalValue) * 100 : 0;

  // Título personalizado baseado no perfil
  const getDashboardTitle = () => {
    if (user?.perfil === "GESTOR") return "Dashboard Executivo";
    if (user?.perfil === "ANALISTA") return "Meus Contratos";
    return "Dashboard";
  };

  const getDashboardSubtitle = () => {
    if (user?.perfil === "GESTOR") return "Visão geral de todos os contratos";
    if (user?.perfil === "ANALISTA") return `Contratos sob responsabilidade de ${user.full_name}`;
    return "Visão geral dos seus contratos";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getDashboardTitle()}</h1>
          <p className="text-gray-600 mt-1">{getDashboardSubtitle()}</p>
          {user?.perfil && (
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {user.perfil}
            </span>
          )}
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

      {/* Alerta DEX - Apenas para Gestores */}
      {user?.perfil === "GESTOR" && (
        <DexAlert contracts={contracts} isLoading={isLoading} />
      )}

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
          value={formatCompactCurrency(stats.totalValue)}
          fullValue={formatCurrency(stats.totalValue)}
          icon={DollarSign}
          color="purple"
          isLoading={isLoading}
          progress={billingProgress}
          progressLabel={`${formatCompactCurrency(stats.totalBilled)} faturado`}
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
