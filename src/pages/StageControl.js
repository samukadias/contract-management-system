import React, { useState, useEffect } from "react";
import { Contract } from "@/entities/Contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { differenceInDays } from "date-fns";
import { Calendar, AlertTriangle, CheckCircle2, Search, Eye } from "lucide-react";

import ContractDetailsModal from "../components/stagecontrol/ContractDetailsModal";

export default function StageControl() {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contractFilter, setContractFilter] = useState("");
  const [selectedContracts, setSelectedContracts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

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

  const getStageRangeForProrrogacao = (stageName) => {
    const ranges = {
      "0. Sem Status (<120)": { min: 120, max: Infinity },
      "1. Abordagem do Cliente (120 a 90)": { min: 90, max: 120 },
      "2. Abertura de Demanda (PNPP/CRM) (90 a 87)": { min: 87, max: 90 },
      "3. Elaboração do Kit Proposta (87 a 80)": { min: 80, max: 87 },
      "4. Assinatura da ESP / Solicitação de Alçada / Entrega da Proposta ao Cliente (80 a 75)": { min: 75, max: 80 },
      "5. Aguardando \"De Acordo\" do Cliente (75 a 60)": { min: 60, max: 75 },
      "6. Aguardo Recebimento da Minuta Contratual do Cliente (60 a 30)": { min: 30, max: 60 },
      "7. Análise Jurídica da Prodesp da Minuta do Cliente (30 a 15)": { min: 15, max: 30 },
      "8. Solicitação de Atualização da Minuta Contratual (15 a 5)": { min: 5, max: 15 },
      "9. Assinatura do Contrato (5 a 3)": { min: 3, max: 5 },
      "10. Cadastro no ERP (3 a 2)": { min: 2, max: 3 },
      "11. Reunião de Kickoff (2 a 0)": { min: 0, max: 2 },
      "12. Finalizado (0)": { min: 0, max: 0 }
    };
    return ranges[stageName] || { min: 0, max: 0 };
  };

  const getStageRangeForRenovacao = (stageName) => {
    const ranges = {
      "0. Sem Status (<190)": { min: 190, max: Infinity },
      "1. Notificação a equipe de vendas (190 a 180)": { min: 180, max: 190 },
      "2. Abordagem do Cliente e Retorno para COCR (Renovação ou Prorrogação)(180 a 120)": { min: 120, max: 180 },
      "3. Tratativas comerciais (120 a 90)": { min: 90, max: 120 },
      "4. Recebimento do TR / Abertura de Demanda (PNPP/CRM) (90 a 87)": { min: 87, max: 90 },
      "5. Elaboração do Kit Proposta (87 a 80)": { min: 80, max: 87 },
      "6. Assinatura da ESP / Solicitação de Alçada / Entrega da Proposta ao Cliente (80 a 75)": { min: 75, max: 80 },
      "7. Aguardando \"De Acordo\" do Cliente (75 a 65)": { min: 65, max: 75 },
      "8. Aguardando o \"De Acordo\" do TR do Cliente pelo Delivery (65 a 60)": { min: 60, max: 65 },
      "9. Aguardo Recebimento da Minuta Contratual do Cliente (60 a 30)": { min: 30, max: 60 },
      "10. Análise Jurídica da Prodesp da Minuta do Cliente (30 a 15)": { min: 15, max: 30 },
      "11. Solicitação de Atualização da Minuta Contratual (15 a 5)": { min: 5, max: 15 },
      "12. Assinatura do Contrato (5 a 3)": { min: 3, max: 5 },
      "13. Cadastro no ERP (3 a 2)": { min: 2, max: 3 },
      "14. Reunião de Kickoff (2 a 0)": { min: 0, max: 2 },
      "15. Finalizado (0)": { min: 0, max: 0 }
    };
    return ranges[stageName] || { min: 0, max: 0 };
  };

  const getExpectedStageForDays = (daysRemaining, contractType) => {
    const stages = contractType === "PRORROGAÇÃO" 
      ? [
          "12. Finalizado (0)",
          "11. Reunião de Kickoff (2 a 0)",
          "10. Cadastro no ERP (3 a 2)",
          "9. Assinatura do Contrato (5 a 3)",
          "8. Solicitação de Atualização da Minuta Contratual (15 a 5)",
          "7. Análise Jurídica da Prodesp da Minuta do Cliente (30 a 15)",
          "6. Aguardo Recebimento da Minuta Contratual do Cliente (60 a 30)",
          "5. Aguardando \"De Acordo\" do Cliente (75 a 60)",
          "4. Assinatura da ESP / Solicitação de Alçada / Entrega da Proposta ao Cliente (80 a 75)",
          "3. Elaboração do Kit Proposta (87 a 80)",
          "2. Abertura de Demanda (PNPP/CRM) (90 a 87)",
          "1. Abordagem do Cliente (120 a 90)",
          "0. Sem Status (<120)"
        ]
      : [
          "15. Finalizado (0)",
          "14. Reunião de Kickoff (2 a 0)",
          "13. Cadastro no ERP (3 a 2)",
          "12. Assinatura do Contrato (5 a 3)",
          "11. Solicitação de Atualização da Minuta Contratual (15 a 5)",
          "10. Análise Jurídica da Prodesp da Minuta do Cliente (30 a 15)",
          "9. Aguardo Recebimento da Minuta Contratual do Cliente (60 a 30)",
          "8. Aguardando o \"De Acordo\" do TR do Cliente pelo Delivery (65 a 60)",
          "7. Aguardando \"De Acordo\" do Cliente (75 a 65)",
          "6. Assinatura da ESP / Solicitação de Alçada / Entrega da Proposta ao Cliente (80 a 75)",
          "5. Elaboração do Kit Proposta (87 a 80)",
          "4. Recebimento do TR / Abertura de Demanda (PNPP/CRM) (90 a 87)",
          "3. Tratativas comerciais (120 a 90)",
          "2. Abordagem do Cliente e Retorno para COCR (Renovação ou Prorrogação)(180 a 120)",
          "1. Notificação a equipe de vendas (190 a 180)",
          "0. Sem Status (<190)"
        ];

    for (const stage of stages) {
      const range = contractType === "PRORROGAÇÃO" 
        ? getStageRangeForProrrogacao(stage)
        : getStageRangeForRenovacao(stage);
      
      if (daysRemaining >= range.min && daysRemaining <= range.max) {
        return stage;
      }
    }
    
    return contractType === "PRORROGAÇÃO" ? "0. Sem Status (<120)" : "0. Sem Status (<190)";
  };

  const analyzeContracts = (contractType) => {
    let filteredContracts = contracts.filter(c => 
      c.tipo_tratativa === contractType && c.status === "Ativo" && c.data_fim_efetividade
    );

    // Apply contract name filter
    if (contractFilter) {
      filteredContracts = filteredContracts.filter(c =>
        c.nome?.toLowerCase().includes(contractFilter.toLowerCase())
      );
    }

    const allStages = contractType === "PRORROGAÇÃO" 
      ? [
          "0. Sem Status (<120)",
          "1. Abordagem do Cliente (120 a 90)",
          "2. Abertura de Demanda (PNPP/CRM) (90 a 87)",
          "3. Elaboração do Kit Proposta (87 a 80)",
          "4. Assinatura da ESP / Solicitação de Alçada / Entrega da Proposta ao Cliente (80 a 75)",
          "5. Aguardando \"De Acordo\" do Cliente (75 a 60)",
          "6. Aguardo Recebimento da Minuta Contratual do Cliente (60 a 30)",
          "7. Análise Jurídica da Prodesp da Minuta do Cliente (30 a 15)",
          "8. Solicitação de Atualização da Minuta Contratual (15 a 5)",
          "9. Assinatura do Contrato (5 a 3)",
          "10. Cadastro no ERP (3 a 2)",
          "11. Reunião de Kickoff (2 a 0)",
          "12. Finalizado (0)"
        ]
      : [
          "0. Sem Status (<190)",
          "1. Notificação a equipe de vendas (190 a 180)",
          "2. Abordagem do Cliente e Retorno para COCR (Renovação ou Prorrogação)(180 a 120)",
          "3. Tratativas comerciais (120 a 90)",
          "4. Recebimento do TR / Abertura de Demanda (PNPP/CRM) (90 a 87)",
          "5. Elaboração do Kit Proposta (87 a 80)",
          "6. Assinatura da ESP / Solicitação de Alçada / Entrega da Proposta ao Cliente (80 a 75)",
          "7. Aguardando \"De Acordo\" do Cliente (75 a 65)",
          "8. Aguardando o \"De Acordo\" do TR do Cliente pelo Delivery (65 a 60)",
          "9. Aguardo Recebimento da Minuta Contratual do Cliente (60 a 30)",
          "10. Análise Jurídica da Prodesp da Minuta do Cliente (30 a 15)",
          "11. Solicitação de Atualização da Minuta Contratual (15 a 5)",
          "12. Assinatura do Contrato (5 a 3)",
          "13. Cadastro no ERP (3 a 2)",
          "14. Reunião de Kickoff (2 a 0)",
          "15. Finalizado (0)"
        ];

    const stageData = {};
    const today = new Date();

    // Initialize all stages
    allStages.forEach(stage => {
      stageData[stage] = {
        stage: stage.split('.')[0] + '.',
        fullStage: stage,
        onTime: [],
        delayed: [],
        total: 0,
        range: contractType === "PRORROGAÇÃO" 
          ? getStageRangeForProrrogacao(stage)
          : getStageRangeForRenovacao(stage)
      };
    });

    filteredContracts.forEach(contract => {
      const stageName = contract.etapa || (contractType === "PRORROGAÇÃO" ? "0. Sem Status (<120)" : "0. Sem Status (<190)");
      const daysToExpiry = differenceInDays(new Date(contract.data_fim_efetividade), today);
      const expectedStage = getExpectedStageForDays(daysToExpiry, contractType);
      
      let stageRange;
      if (contractType === "PRORROGAÇÃO") {
        stageRange = getStageRangeForProrrogacao(stageName);
      } else {
        stageRange = getStageRangeForRenovacao(stageName);
      }
      
      const isOnTime = daysToExpiry >= stageRange.min && daysToExpiry <= stageRange.max;
      
      const contractWithAnalysis = {
        ...contract,
        daysToExpiry,
        expectedStage,
        isOnTime,
        currentStage: stageName
      };

      if (!stageData[stageName]) {
        stageData[stageName] = {
          stage: stageName.split('.')[0] + '.',
          fullStage: stageName,
          onTime: [],
          delayed: [],
          total: 0,
          range: stageRange
        };
      }

      stageData[stageName].total += 1;
      if (isOnTime) {
        stageData[stageName].onTime.push(contractWithAnalysis);
      } else {
        stageData[stageName].delayed.push(contractWithAnalysis);
      }
    });

    return Object.values(stageData).sort((a, b) => 
      parseInt(a.stage) - parseInt(b.stage)
    );
  };

  const handleContractClick = (contractsArray, title) => {
    setSelectedContracts({ contracts: contractsArray, title });
    setModalOpen(true);
  };

  const getOtherTreatmentCounts = () => {
    const otherTypes = ["ADITAMENTO", "CANCELAMENTO", "SEM TRATATIVA", "FINALIZADA", "DESCONTINUIDADE"];
    
    return otherTypes.map(type => ({
      type,
      count: contracts.filter(c => c.tipo_tratativa === type).length
    }));
  };

  const renderStageChart = (data, title, color) => {
    if (data.length === 0) {
      return (
        <p className="text-center text-gray-500 py-8">
          Nenhum contrato de {title.toLowerCase()} encontrado
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {data.map((stage, index) => (
          <div key={stage.stage} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-700 w-6">
                    {stage.stage}
                  </span>
                  <span className="text-sm text-gray-600 flex-1">
                    {stage.fullStage}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Prazo ideal: {stage.range.min} - {stage.range.max === Infinity ? '∞' : stage.range.max} dias
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {stage.total} contratos
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-green-600 font-medium mb-1">No Prazo</div>
                    <div className="text-2xl font-bold text-green-700">
                      {stage.onTime.length}
                    </div>
                  </div>
                  {stage.onTime.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleContractClick(stage.onTime, `${stage.fullStage} - No Prazo`)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-red-600 font-medium mb-1">Fora do Prazo</div>
                    <div className="text-2xl font-bold text-red-700">
                      {stage.delayed.length}
                    </div>
                  </div>
                  {stage.delayed.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleContractClick(stage.delayed, `${stage.fullStage} - Fora do Prazo`)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renovationData = analyzeContracts("RENOVAÇÃO");
  const extensionData = analyzeContracts("PRORROGAÇÃO");
  const otherCounts = getOtherTreatmentCounts();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle de Etapas</h1>
          <p className="text-gray-600 mt-1">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Controle de Etapas</h1>
        <p className="text-gray-600 mt-1">Acompanhamento das etapas dos contratos por tipo de tratativa</p>
      </div>

      {/* Filter by contract name */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="contract-filter" className="text-sm font-medium">
                Filtrar por Nome do Contrato
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="contract-filter"
                  placeholder="Digite o nome do contrato..."
                  value={contractFilter}
                  onChange={(e) => setContractFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage Charts */}
      <div className="grid lg:grid-cols-1 gap-6">
        {/* Renovação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Contratos de Renovação - Controle de Etapas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStageChart(renovationData, "Renovação", "bg-blue-500")}
          </CardContent>
        </Card>

        {/* Prorrogação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              Contratos de Prorrogação - Controle de Etapas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStageChart(extensionData, "Prorrogação", "bg-green-500")}
          </CardContent>
        </Card>
      </div>

      {/* Outros tipos de tratativa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-purple-500" />
            Outros Tipos de Tratativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {otherCounts.map(({ type, count }) => (
              <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 mb-1">{count}</p>
                <p className="text-xs text-gray-600 font-medium">{type}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo geral */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Renovações</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {renovationData.reduce((sum, stage) => sum + stage.total, 0)}
            </p>
            <p className="text-sm text-gray-600">
              {renovationData.reduce((sum, stage) => sum + stage.onTime.length, 0)} no prazo, {' '}
              {renovationData.reduce((sum, stage) => sum + stage.delayed.length, 0)} atrasados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Prorrogações</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {extensionData.reduce((sum, stage) => sum + stage.total, 0)}
            </p>
            <p className="text-sm text-gray-600">
              {extensionData.reduce((sum, stage) => sum + stage.onTime.length, 0)} no prazo, {' '}
              {extensionData.reduce((sum, stage) => sum + stage.delayed.length, 0)} atrasados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Outros</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {otherCounts.reduce((sum, item) => sum + item.count, 0)}
            </p>
            <p className="text-sm text-gray-600">Demais tratativas</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal for contract details */}
      <ContractDetailsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        contracts={selectedContracts?.contracts || []}
        title={selectedContracts?.title || ""}
      />
    </div>
  );
}