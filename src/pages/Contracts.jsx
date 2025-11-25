import React from 'react';
import { useContracts } from '../hooks/useContracts';
import ContractsList from '../components/contracts/ContractsList';
import { Plus } from 'lucide-react';

const Contracts = () => {
  const { contracts, loading, error } = useContracts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contratos</h1>
              <p className="text-gray-600 mt-1">Gerencie todos os seus contratos</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
              <Plus size={20} />
              Novo Contrato
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
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

export default Contracts;