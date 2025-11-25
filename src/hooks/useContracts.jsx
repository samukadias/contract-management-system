import { useState, useEffect } from 'react';
import contractsData from '../data/contracts.json';

export const useContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Simulando carregamento de dados
      setTimeout(() => {
        setContracts(contractsData);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Erro ao carregar contratos');
      setLoading(false);
    }
  }, []);

  const addContract = (newContract) => {
    const contract = {
      ...newContract,
      id: Math.max(...contracts.map(c => c.id), 0) + 1,
    };
    setContracts([...contracts, contract]);
    return contract;
  };

  const updateContract = (id, updatedContract) => {
    setContracts(contracts.map(c => (c.id === id ? { ...c, ...updatedContract } : c)));
  };

  const deleteContract = (id) => {
    setContracts(contracts.filter(c => c.id !== id));
  };

  const getContractById = (id) => {
    return contracts.find(c => c.id === id);
  };

  return {
    contracts,
    loading,
    error,
    addContract,
    updateContract,
    deleteContract,
    getContractById,
  };
};
