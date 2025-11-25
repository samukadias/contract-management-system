import React from 'react';
import { Database } from 'lucide-react';

const DataManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <Database size={32} className="text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Dados</h1>
              <p className="text-gray-600 mt-1">Importe, exporte e gerencie seus dados de contratos</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600 text-center">Módulo em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
