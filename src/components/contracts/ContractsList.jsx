import React from 'react';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';

export const ContractsList = ({ contracts, loading, error }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">Carregando contratos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    return status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getVencimentoColor = (statusVencimento) => {
    switch (statusVencimento) {
      case 'Dentro do Prazo':
        return 'text-green-600';
      case 'Fora do Prazo':
        return 'text-red-600';
      case 'Descoberto':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTratativaColor = (tipo) => {
    const colors = {
      'PRORROGAÇÃO': 'bg-blue-100 text-blue-800',
      'RENOVAÇÃO': 'bg-green-100 text-green-800',
      'ADITAMENTO': 'bg-purple-100 text-purple-800',
      'CANCELAMENTO': 'bg-red-100 text-red-800',
      'SEM TRATATIVA': 'bg-gray-100 text-gray-800',
      'FINALIZADA': 'bg-green-100 text-green-800',
      'DESCONTINUIDADE': 'bg-orange-100 text-orange-800',
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Contrato
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Grupo
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Status
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Tipo de Tratativa
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Vencimento
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Valor
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Data Fim
            </th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract, index) => (
            <tr
              key={contract.id}
              className={`border-b hover:bg-gray-50 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {contract.contrato}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {contract.cliente}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {contract.grupo_cliente}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(contract.status)}`}>
                  {contract.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTratativaColor(contract.tipo_tratativa)}`}>
                  {contract.tipo_tratativa}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`font-semibold ${getVencimentoColor(contract.status_vencimento)}`}>
                  {contract.status_vencimento}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                R$ {(contract.valor_contrato || 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                {new Date(contract.data_fim_efetividade).toLocaleDateString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {contracts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum contrato encontrado</p>
        </div>
      )}
    </div>
  );
};

export default ContractsList;
