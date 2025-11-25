import React, { useState, useEffect } from "react";
import { Contract } from "@/entities/Contract";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import ContractForm from "../components/contracts/ContractForm";

export default function EditContract() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get("id");

  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!contractId) {
      navigate(createPageUrl("Contracts"));
      return;
    }

    const loadContract = async () => {
      setIsLoading(true);
      try {
        const data = await Contract.get(contractId);
        // Format dates for input[type=date]
        if (data.data_inicio_efetividade) {
            data.data_inicio_efetividade = data.data_inicio_efetividade.split('T')[0];
        }
        if (data.data_fim_efetividade) {
            data.data_fim_efetividade = data.data_fim_efetividade.split('T')[0];
        }
        if (data.data_limite_andamento) {
            data.data_limite_andamento = data.data_limite_andamento.split('T')[0];
        }
        setContract(data);
      } catch (error) {
        console.error("Erro ao carregar contrato:", error);
        setContract(null);
      }
      setIsLoading(false);
    };

    loadContract();
  }, [contractId, navigate]);

  const handleSubmit = async (contractData) => {
    setIsSubmitting(true);
    try {
      await Contract.update(contractId, contractData);
      // Force a small delay to ensure update completes
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate(createPageUrl("Contracts"));
    } catch (error) {
      console.error("Erro ao atualizar contrato:", error);
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      );
    }

    if (!contract) {
      return (
        <CardContent>
          <p className="text-red-500 text-center">Contrato não encontrado.</p>
        </CardContent>
      );
    }

    return (
      <CardContent>
        <ContractForm
          initialData={contract}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitButtonText="Salvar Alterações"
          isEdit={true}
        />
      </CardContent>
    );
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(createPageUrl("Contracts"))}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Contrato</h1>
          <p className="text-gray-600 mt-1">Atualize os dados do contrato selecionado</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Dados do Contrato
          </CardTitle>
        </CardHeader>
        {renderContent()}
      </Card>
    </div>
  );
}