import React from 'react';
import { BarChart3 } from 'lucide-react';

const Analysis = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <BarChart3 size={32} className="text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Análise de Contratos</h1>
              <p className="text-gray-600 mt-1">Visualize métricas e análises dos contratos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600 text-center">Módulo de análise em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

export default Analysis;