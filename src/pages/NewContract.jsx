import React, { useState } from "react";
import { Contract } from "@/entities/Contract";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import ContractForm from "../components/contracts/ContractForm";

export default function NewContract() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (contractData) => {
    setIsSubmitting(true);
    try {
      await Contract.create(contractData);
      navigate(createPageUrl("Contracts"));
    } catch (error) {
      console.error("Erro ao criar contrato:", error);
    }
    setIsSubmitting(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Novo Contrato</h1>
          <p className="text-gray-600 mt-1">Cadastre um novo contrato no sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Dados do Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContractForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting} 
            submitButtonText="Criar Contrato"
          />
        </CardContent>
      </Card>
    </div>
  );
}