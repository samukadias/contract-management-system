import React from 'react';
import { useContracts } from '../hooks/useContracts';
import ContractsList from '../components/contracts/ContractsList';
import { BarChart3, FileText, AlertTriangle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { contracts, loading, error } = useContracts();

  const stats = {
    total: contracts.length,
    ativos: contracts.filter(c => c.status === 'Ativo').length,
    expirados: contracts.filter(c => c.status === 'Expirado').length,
    fora_prazo: contracts.filter(c => c.status_vencimento === 'Fora do Prazo').length,
    valor_total: contracts.reduce((sum, c) => sum + (c.valor_contrato || 0), 0),
  };

  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <Icon size={32} className="text-gray-300" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Contratos</h1>
          <p className="text-gray-600 mt-1">Gestão centralizada de todos os seus contratos</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            title="Total de Contratos"
            value={stats.total}
            icon={FileText}
            color="#3B82F6"
          />
          <StatsCard
            title="Contratos Ativos"
            value={stats.ativos}
            icon={TrendingUp}
            color="#10B981"
          />
          <StatsCard
            title="Contratos Expirados"
            value={stats.expirados}
            icon={AlertTriangle}
            color="#F59E0B"
          />
          <StatsCard
            title="Fora do Prazo"
            value={stats.fora_prazo}
            icon={AlertTriangle}
            color="#EF4444"
          />
          <StatsCard
            title="Valor Total"
            value={`R$ ${(stats.valor_total / 1000).toFixed(0)}K`}
            icon={BarChart3}
            color="#8B5CF6"
          />
        </div>

        {/* Contracts Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Lista de Contratos</h2>
          </div>
          <ContractsList contracts={contracts} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
