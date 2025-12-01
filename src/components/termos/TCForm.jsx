import React, { useState, useEffect } from "react";
import { Contract } from "@/entities/Contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function TCForm({
    initialData = {},
    onSubmit,
    isSubmitting = false,
    submitButtonText = "Salvar",
    isEdit = false
}) {
    const [formData, setFormData] = useState({
        numero_tc: "",
        numero_processo: "",
        numero_acordo: "",
        numero_ct: "",
        data_inicio_vigencia: "",
        data_fim_vigencia: "",
        valor_total: 0,
        contrato_associado_pd: "",
        observacoes: "",
        ...initialData
    });

    const [contracts, setContracts] = useState([]);
    const [contractsLoading, setContractsLoading] = useState(false);
    const [contractSearch, setContractSearch] = useState("");
    const [showContractDropdown, setShowContractDropdown] = useState(false);

    useEffect(() => {
        loadContracts();
    }, []);

    // Pre-fill contract search if editing
    useEffect(() => {
        if (formData.contrato_associado_pd && !contractSearch) {
            setContractSearch(formData.contrato_associado_pd);
        }
    }, [formData.contrato_associado_pd, contractSearch]);

    const loadContracts = async () => {
        setContractsLoading(true);
        try {
            const data = await Contract.list();
            setContracts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar contratos:", error);
            setContracts([]);
        }
        setContractsLoading(false);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const processedData = {
            ...formData,
            valor_total: parseFloat(formData.valor_total) || 0
        };

        onSubmit(processedData);
    };

    // Filtrar contratos baseado na busca
    const filteredContracts = contracts.filter(contract =>
        contract.contrato?.toLowerCase().includes(contractSearch.toLowerCase()) ||
        contract.cliente?.toLowerCase().includes(contractSearch.toLowerCase()) ||
        contract.analista_responsavel?.toLowerCase().includes(contractSearch.toLowerCase())
    );

    const selectedContract = contracts.find(c => c.contrato === formData.contrato_associado_pd);

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informações Básicas */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Informações do TC</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="numero_tc">Número do TC *</Label>
                        <Input
                            id="numero_tc"
                            value={formData.numero_tc}
                            onChange={(e) => handleInputChange("numero_tc", e.target.value)}
                            required
                            disabled={isEdit}
                            className={isEdit ? "bg-gray-100" : ""}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="numero_processo">Número do Processo</Label>
                        <Input
                            id="numero_processo"
                            value={formData.numero_processo}
                            onChange={(e) => handleInputChange("numero_processo", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="numero_acordo">Número do Acordo</Label>
                        <Input
                            id="numero_acordo"
                            value={formData.numero_acordo}
                            onChange={(e) => handleInputChange("numero_acordo", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="numero_ct">Número do CT</Label>
                        <Input
                            id="numero_ct"
                            value={formData.numero_ct}
                            onChange={(e) => handleInputChange("numero_ct", e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Contrato Associado */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Contrato Associado</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Contrato Associado (PD) *</Label>
                            <div className="relative">
                                <Input
                                    placeholder="Digite para buscar contrato (número, cliente ou analista)..."
                                    value={contractSearch}
                                    onChange={(e) => {
                                        setContractSearch(e.target.value);
                                        setShowContractDropdown(true);
                                    }}
                                    onFocus={() => setShowContractDropdown(true)}
                                    disabled={isEdit || contractsLoading}
                                    className={isEdit ? "bg-gray-100" : ""}
                                />

                                {showContractDropdown && !isEdit && filteredContracts.length > 0 && contractSearch && (
                                    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                                        {filteredContracts.slice(0, 10).map((contract) => (
                                            <div
                                                key={contract.id}
                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                                                onClick={() => {
                                                    handleInputChange("contrato_associado_pd", contract.contrato);
                                                    setContractSearch(contract.contrato);
                                                    setShowContractDropdown(false);
                                                }}
                                            >
                                                <div className="font-medium text-gray-900">{contract.contrato}</div>
                                                <div className="text-sm text-gray-600">
                                                    {contract.cliente} - {contract.analista_responsavel}
                                                </div>
                                                {contract.objeto_contrato && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {contract.objeto_contrato}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {contractsLoading && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedContract && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-blue-900">Contrato Selecionado</h4>
                                    <Badge className="bg-blue-100 text-blue-800">
                                        {selectedContract.status}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="font-medium text-blue-700">Cliente:</span>
                                        <span className="ml-2 text-blue-900">{selectedContract.cliente}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-blue-700">Analista:</span>
                                        <span className="ml-2 text-blue-900">{selectedContract.analista_responsavel}</span>
                                    </div>
                                    {selectedContract.objeto_contrato && (
                                        <div className="md:col-span-2">
                                            <span className="font-medium text-blue-700">Objeto:</span>
                                            <span className="ml-2 text-blue-900">{selectedContract.objeto_contrato}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Vigência e Valor */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Vigência e Valor</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="data_inicio_vigencia">Data Início Vigência</Label>
                        <Input
                            id="data_inicio_vigencia"
                            type="date"
                            value={formData.data_inicio_vigencia}
                            onChange={(e) => handleInputChange("data_inicio_vigencia", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="data_fim_vigencia">Data Fim Vigência</Label>
                        <Input
                            id="data_fim_vigencia"
                            type="date"
                            value={formData.data_fim_vigencia}
                            onChange={(e) => handleInputChange("data_fim_vigencia", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="valor_total">Valor Total</Label>
                        <Input
                            id="valor_total"
                            type="number"
                            step="0.01"
                            value={formData.valor_total}
                            onChange={(e) => handleInputChange("valor_total", e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Observações */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Observações</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                            id="observacoes"
                            value={formData.observacoes}
                            onChange={(e) => handleInputChange("observacoes", e.target.value)}
                            rows={4}
                            placeholder="Digite observações sobre o TC..."
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {isSubmitting ? "Salvando..." : submitButtonText}
                </Button>
            </div>

            {/* Overlay para fechar dropdown */}
            {showContractDropdown && (
                <div
                    className="fixed inset-0 z-5"
                    onClick={() => setShowContractDropdown(false)}
                />
            )}
        </form>
    );
}
