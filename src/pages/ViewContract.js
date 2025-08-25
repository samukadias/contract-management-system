import React, { useState, useEffect } from "react";
import { Contract } from "@/entities/Contract";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Edit, Calendar, DollarSign, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function ViewContract() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get("id");

  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!contractId) {
      navigate(createPageUrl("Contracts"));
      return;
    }

    const loadContract = async () => {
      setIsLoading(true);
      try {
        const data = await Contract.get(contractId);
        setContract(data);
      } catch (error) {
        console.error("Erro ao carregar contrato:", error);
        setContract(null);
      }
      setIsLoading(false);
    };

    loadContract();
  }, [contractId, navigate]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="w-10 h-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <p className="text-red-500 text-lg">Contrato não encontrado.</p>
          <Button 
            onClick={() => navigate(createPageUrl("Contracts"))}
            className="mt-4"
          >
            Voltar para Contratos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Contracts"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{contract.nome}</h1>
            <p className="text-gray-600 mt-1">Visualizar detalhes do contrato</p>
          </div>
        </div>
        <Link to={createPageUrl(`EditContract?id=${contract.id}`)}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Informações Principais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações Principais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Cliente</p>
              <p className="text-lg text-gray-900">{contract.cliente}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Número do Contrato</p>
              <p className="text-lg text-gray-900">{contract.contrato}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
              <Badge className={contract.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {contract.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tipo de Tratativa</p>
              <Badge variant="outline">
                {contract.tipo_tratativa}
              </Badge>
            </div>
            {contract.grupo_cliente && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Grupo Cliente</p>
                <p className="text-lg text-gray-900">{contract.grupo_cliente}</p>
              </div>
            )}
            {contract.termo && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Termo</p>
                <p className="text-lg text-gray-900">{contract.termo}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Etapa e Datas */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Etapa e Prazos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Etapa Atual</p>
                <p className="text-sm text-gray-900">{contract.etapa}</p>
              </div>
              {contract.data_inicio_efetividade && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Data Início</p>
                  <p className="text-gray-900">{format(new Date(contract.data_inicio_efetividade), "dd/MM/yyyy")}</p>
                </div>
              )}
              {contract.data_fim_efetividade && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Data Fim</p>
                  <p className="text-gray-900">{format(new Date(contract.data_fim_efetividade), "dd/MM/yyyy")}</p>
                </div>
              )}
              {contract.data_limite_andamento && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Data Limite Andamento</p>
                  <p className="text-gray-900">{format(new Date(contract.data_limite_andamento), "dd/MM/yyyy")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Valores Financeiros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contract.valor_contrato && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Valor do Contrato</p>
                  <p className="text-xl font-semibold text-gray-900">
                    R$ {contract.valor_contrato.toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
              {contract.valor_faturado && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Valor Faturado</p>
                  <p className="text-lg text-green-600">
                    R$ {contract.valor_faturado.toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
              {contract.valor_a_faturar && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Valor a Faturar</p>
                  <p className="text-lg text-blue-600">
                    R$ {contract.valor_a_faturar.toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
              {contract.valor_cancelado && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Valor Cancelado</p>
                  <p className="text-lg text-red-600">
                    R$ {contract.valor_cancelado.toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Objeto do Contrato */}
        {contract.objeto_contrato && (
          <Card>
            <CardHeader>
              <CardTitle>Objeto do Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">{contract.objeto_contrato}</p>
            </CardContent>
          </Card>
        )}

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contract.numero_processo_sei_nosso && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Processo SEI Nosso</p>
                <p className="text-gray-900">{contract.numero_processo_sei_nosso}</p>
              </div>
            )}
            {contract.numero_processo_sei_cliente && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Processo SEI Cliente</p>
                <p className="text-gray-900">{contract.numero_processo_sei_cliente}</p>
              </div>
            )}
            {contract.numero_pnpp_crm && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Número PNPP/CRM</p>
                <p className="text-gray-900">{contract.numero_pnpp_crm}</p>
              </div>
            )}
            {contract.sei && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">SEI</p>
                <p className="text-gray-900">{contract.sei}</p>
              </div>
            )}
            {contract.esp && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">ESP</p>
                <p className="text-gray-900">{contract.esp}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observações */}
        {contract.observacao && (
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">{contract.observacao}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}