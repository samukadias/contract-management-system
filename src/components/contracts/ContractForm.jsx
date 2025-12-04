import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CurrencyInput from "@/components/ui/currency-input";

export default function ContractForm({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Salvar",
  isEdit = false,
  users = [],
  currentUser = null,
  executedValue
}) {
  const [formData, setFormData] = useState({
    analista_responsavel: "",
    cliente: "",
    grupo_cliente: "",
    contrato: "",
    termo: "",
    status: "Ativo",
    tipo_tratativa: "SEM TRATATIVA",
    tipo_aditamento: "",
    objeto_contrato: "",
    numero_processo_sei_nosso: "",
    numero_processo_sei_cliente: "",
    data_inicio_efetividade: "",
    data_fim_efetividade: "",
    contrato_cliente: "",
    contrato_anterior: "",
    valor_contrato: 0,
    valor_faturado: 0,
    valor_cancelado: 0,
    valor_a_faturar: 0,
    numero_pnpp_crm: "",
    contrato_novo: "",
    termo_novo: "",
    esp: "",
    valor_novo_contrato: 0,
    sei: "",
    etapa: "",
    data_limite_andamento: "",
    observacao: "",
    ...initialData
  });

  useEffect(() => {
    if (!isEdit && currentUser) {
      setFormData(prev => ({ ...prev, analista_responsavel: currentUser.full_name }));
    }
  }, [isEdit, currentUser]);

  // Atualizar valor faturado se vier calculado de fora (via TCs)
  useEffect(() => {
    if (executedValue !== undefined && executedValue !== null) {
      setFormData(prev => ({
        ...prev,
        valor_faturado: executedValue
      }));
    }
  }, [executedValue]);

  // Calcular automaticamente o Valor a Faturar
  useEffect(() => {
    const valorContrato = parseFloat(formData.valor_contrato) || 0;
    const valorFaturado = parseFloat(formData.valor_faturado) || 0;
    const valorCancelado = parseFloat(formData.valor_cancelado) || 0;

    const valorAFaturar = valorContrato - valorFaturado - valorCancelado;

    setFormData(prev => ({
      ...prev,
      valor_a_faturar: Math.max(0, valorAFaturar) // Não permitir valores negativos
    }));
  }, [formData.valor_contrato, formData.valor_faturado, formData.valor_cancelado]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      if (field === 'tipo_tratativa') {
        newData.etapa = "";
        newData.tipo_aditamento = "";
      }

      return newData;
    });
  };

  const getEtapaOptions = () => {
    if (formData.tipo_tratativa === "PRORROGAÇÃO") {
      return [
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
      ];
    } else if (formData.tipo_tratativa === "RENOVAÇÃO") {
      return [
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
    }
    return [];
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const processedData = {
      ...formData,
      valor_contrato: parseFloat(formData.valor_contrato) || 0,
      valor_faturado: parseFloat(formData.valor_faturado) || 0,
      valor_cancelado: parseFloat(formData.valor_cancelado) || 0,
      valor_a_faturar: parseFloat(formData.valor_a_faturar) || 0,
      valor_novo_contrato: parseFloat(formData.valor_novo_contrato) || 0,
    };

    onSubmit(processedData);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const etapaOptions = getEtapaOptions();
  const isEtapaEnabled = formData.tipo_tratativa === "PRORROGAÇÃO" || formData.tipo_tratativa === "RENOVAÇÃO";

  // Verificar se o usuário é Gestor - se for, pode editar tudo
  const isGestor = currentUser?.perfil === "GESTOR";
  const canEditBasicInfo = !isEdit || isGestor;



  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-4">
          <TabsTrigger value="basic">Geral</TabsTrigger>
          <TabsTrigger value="process">Tratativa</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="dates">Prazos</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="notes">Observações</TabsTrigger>
        </TabsList>

        {/* Informações Básicas */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="analista_responsavel">Analista Responsável *</Label>
                <Select
                  value={formData.analista_responsavel}
                  onValueChange={(value) => handleInputChange("analista_responsavel", value)}
                  disabled={!canEditBasicInfo}
                  required
                >
                  <SelectTrigger className={!canEditBasicInfo ? "bg-gray-100" : ""}>
                    <SelectValue placeholder="Selecione um analista" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.full_name}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Input
                  id="cliente"
                  value={formData.cliente}
                  onChange={(e) => handleInputChange("cliente", e.target.value)}
                  required
                  disabled={!canEditBasicInfo}
                  className={!canEditBasicInfo ? "bg-gray-100" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grupo_cliente">Grupo Cliente</Label>
                <Input
                  id="grupo_cliente"
                  value={formData.grupo_cliente}
                  onChange={(e) => handleInputChange("grupo_cliente", e.target.value)}
                  disabled={!canEditBasicInfo}
                  className={!canEditBasicInfo ? "bg-gray-100" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contrato">Número do Contrato *</Label>
                <Input
                  id="contrato"
                  value={formData.contrato}
                  onChange={(e) => handleInputChange("contrato", e.target.value)}
                  required
                  disabled={!canEditBasicInfo}
                  className={!canEditBasicInfo ? "bg-gray-100" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="termo">Termo</Label>
                <Input
                  id="termo"
                  value={formData.termo}
                  onChange={(e) => handleInputChange("termo", e.target.value)}
                  disabled={!canEditBasicInfo}
                  className={!canEditBasicInfo ? "bg-gray-100" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)} disabled={!canEditBasicInfo}>
                  <SelectTrigger className={!canEditBasicInfo ? "bg-gray-100" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Expirado">Expirado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tipo de Tratativa e Etapa */}
        <TabsContent value="process">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tratativa e Etapa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_tratativa">Tipo de Tratativa</Label>
                  <Select value={formData.tipo_tratativa} onValueChange={(value) => handleInputChange("tipo_tratativa", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRORROGAÇÃO">PRORROGAÇÃO</SelectItem>
                      <SelectItem value="RENOVAÇÃO">RENOVAÇÃO</SelectItem>
                      <SelectItem value="ADITAMENTO">ADITAMENTO</SelectItem>
                      <SelectItem value="CANCELAMENTO">CANCELAMENTO</SelectItem>
                      <SelectItem value="SEM TRATATIVA">SEM TRATATIVA</SelectItem>
                      <SelectItem value="FINALIZADA">FINALIZADA</SelectItem>
                      <SelectItem value="DESCONTINUIDADE">DESCONTINUIDADE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etapa">Etapa</Label>
                  <Select
                    value={formData.etapa}
                    onValueChange={(value) => handleInputChange("etapa", value)}
                    disabled={!isEtapaEnabled}
                  >
                    <SelectTrigger className={!isEtapaEnabled ? "bg-gray-100" : ""}>
                      <SelectValue placeholder={isEtapaEnabled ? "Selecione uma etapa" : "Selecione primeiro o tipo de tratativa"} />
                    </SelectTrigger>
                    <SelectContent>
                      {etapaOptions.map((etapa) => (
                        <SelectItem key={etapa} value={etapa}>
                          {etapa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.tipo_tratativa === "ADITAMENTO" && (
                <div className="space-y-2">
                  <Label htmlFor="tipo_aditamento">Tipo de Aditamento</Label>
                  <Select value={formData.tipo_aditamento} onValueChange={(value) => handleInputChange("tipo_aditamento", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de aditamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aditamento com Expansão">Aditamento com Expansão</SelectItem>
                      <SelectItem value="Aditamento com Redução">Aditamento com Redução</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detalhes do Contrato */}
        <TabsContent value="details">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhes do Contrato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="objeto_contrato">Objeto do Contrato</Label>
                  <Textarea
                    id="objeto_contrato"
                    value={formData.objeto_contrato}
                    onChange={(e) => handleInputChange("objeto_contrato", e.target.value)}
                    rows={3}
                    disabled={!canEditBasicInfo}
                    className={!canEditBasicInfo ? "bg-gray-100" : ""}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero_processo_sei_nosso">Processo SEI Nosso</Label>
                    <Input
                      id="numero_processo_sei_nosso"
                      value={formData.numero_processo_sei_nosso}
                      onChange={(e) => handleInputChange("numero_processo_sei_nosso", e.target.value)}
                      disabled={!canEditBasicInfo}
                      className={!canEditBasicInfo ? "bg-gray-100" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero_processo_sei_cliente">Processo SEI Cliente</Label>
                    <Input
                      id="numero_processo_sei_cliente"
                      value={formData.numero_processo_sei_cliente}
                      onChange={(e) => handleInputChange("numero_processo_sei_cliente", e.target.value)}
                      disabled={!canEditBasicInfo}
                      className={!canEditBasicInfo ? "bg-gray-100" : ""}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contrato_cliente">Contrato Cliente</Label>
                  <Input
                    id="contrato_cliente"
                    value={formData.contrato_cliente}
                    onChange={(e) => handleInputChange("contrato_cliente", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contrato_anterior">Contrato Anterior</Label>
                  <Input
                    id="contrato_anterior"
                    value={formData.contrato_anterior}
                    onChange={(e) => handleInputChange("contrato_anterior", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_pnpp_crm">Número PNPP/CRM</Label>
                  <Input
                    id="numero_pnpp_crm"
                    value={formData.numero_pnpp_crm}
                    onChange={(e) => handleInputChange("numero_pnpp_crm", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sei">SEI</Label>
                  <Input
                    id="sei"
                    value={formData.sei}
                    onChange={(e) => handleInputChange("sei", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="esp">ESP</Label>
                  <Input
                    id="esp"
                    value={formData.esp}
                    onChange={(e) => handleInputChange("esp", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Datas */}
        <TabsContent value="dates">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prazos e Datas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio_efetividade">Data Início Efetividade</Label>
                <Input
                  id="data_inicio_efetividade"
                  type="date"
                  value={formData.data_inicio_efetividade}
                  onChange={(e) => handleInputChange("data_inicio_efetividade", e.target.value)}
                  disabled={!canEditBasicInfo}
                  className={!canEditBasicInfo ? "bg-gray-100" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_fim_efetividade">Data Fim Efetividade</Label>
                <Input
                  id="data_fim_efetividade"
                  type="date"
                  value={formData.data_fim_efetividade}
                  onChange={(e) => handleInputChange("data_fim_efetividade", e.target.value)}
                  disabled={!canEditBasicInfo}
                  className={!canEditBasicInfo ? "bg-gray-100" : ""}
                />
              </div>

            </CardContent>
          </Card>
        </TabsContent>



        {/* Valores Financeiros */}
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Valores Financeiros</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isEdit && !isGestor ? (
                <>
                  <div className="space-y-2">
                    <Label>Valor do Contrato</Label>
                    <div className="p-2 bg-gray-100 border rounded-md">
                      {formatCurrency(formData.valor_contrato)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Faturado</Label>
                    <div className="p-2 bg-gray-100 border rounded-md">
                      {formatCurrency(formData.valor_faturado)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Cancelado</Label>
                    <div className="p-2 bg-gray-100 border rounded-md">
                      {formatCurrency(formData.valor_cancelado)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor a Faturar</Label>
                    <div className="p-2 bg-gray-100 border rounded-md">
                      {formatCurrency(formData.valor_a_faturar)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="valor_contrato">Valor do Contrato</Label>
                    <CurrencyInput
                      id="valor_contrato"
                      value={formData.valor_contrato}
                      onChange={(value) => handleInputChange("valor_contrato", value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor_faturado">Valor Faturado</Label>
                    <CurrencyInput
                      id="valor_faturado"
                      value={formData.valor_faturado}
                      onChange={(value) => handleInputChange("valor_faturado", value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor_cancelado">Valor Cancelado</Label>
                    <CurrencyInput
                      id="valor_cancelado"
                      value={formData.valor_cancelado}
                      onChange={(value) => handleInputChange("valor_cancelado", value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor_a_faturar">
                      Valor a Faturar
                      <span className="text-xs text-gray-500 ml-2">(Calculado automaticamente)</span>
                    </Label>
                    <CurrencyInput
                      id="valor_a_faturar"
                      value={formData.valor_a_faturar}
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Observações */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observacao">Observações</Label>
                <Textarea
                  id="observacao"
                  value={formData.observacao}
                  onChange={(e) => handleInputChange("observacao", e.target.value)}
                  rows={4}
                  placeholder="Digite observações sobre o contrato..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 min-w-[150px]"
        >
          {isSubmitting ? "Salvando..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
}