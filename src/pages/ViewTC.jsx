import React, { useState, useEffect } from "react";
import { TermoConfirmacao } from "@/entities/TermoConfirmacao";
import { Contract } from "@/entities/Contract";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Edit, FileText, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function ViewTC() {
    const navigate = useNavigate();
    const location = useLocation();
    const [tc, setTC] = useState(null);
    const [associatedContract, setAssociatedContract] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tcId = urlParams.get("id");

        if (tcId) {
            loadTC(tcId);
        }
    }, [location.search]);

    const loadTC = async (tcId) => {
        setIsLoading(true);
        try {
            // Carregar o TC
            const tcList = await TermoConfirmacao.list();
            const foundTC = tcList.find(t => t.id === tcId);

            if (foundTC) {
                setTC(foundTC);

                // Carregar o contrato associado
                if (foundTC.contrato_associado_pd) {
                    const contracts = await Contract.list();
                    const contract = contracts.find(c => c.contrato === foundTC.contrato_associado_pd);
                    setAssociatedContract(contract);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar TC:", error);
        }
        setIsLoading(false);
    };

    const getVigenciaStatus = (dataFim) => {
        if (!dataFim) return { text: "Indefinido", color: "bg-gray-100 text-gray-800" };

        const today = new Date();
        const endDate = new Date(dataFim);
        const isActive = endDate >= today;

        return isActive
            ? { text: "Ativo", color: "bg-green-100 text-green-800" }
            : { text: "Expirado", color: "bg-red-100 text-red-800" };
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="w-10 h-10" />
                    <div className="flex-1">
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="w-24 h-10" />
                </div>
                <div className="space-y-6">
                    {Array(3).fill(0).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-48" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Array(3).fill(0).map((_, j) => (
                                        <div key={j} className="grid grid-cols-2 gap-4">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-40" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!tc) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">TC não encontrado</h3>
                    <p className="text-gray-600 mb-4">O Termo de Confirmação solicitado não foi encontrado.</p>
                    <Button onClick={() => navigate(createPageUrl("TermosConfirmacao"))}>
                        Voltar para lista
                    </Button>
                </div>
            </div>
        );
    }

    const vigenciaStatus = getVigenciaStatus(tc.data_fim_vigencia);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(createPageUrl("TermosConfirmacao"))}
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">TC: {tc.numero_tc}</h1>
                    <p className="text-gray-600 mt-1">Detalhes do Termo de Confirmação</p>
                </div>
                <Link to={createPageUrl(`EditTC?id=${tc.id}`)}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                    </Button>
                </Link>
            </div>

            <div className="space-y-6">
                {/* Informações Básicas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Informações Básicas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Número do TC</label>
                                <p className="text-lg font-semibold text-gray-900">{tc.numero_tc}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status da Vigência</label>
                                <div className="mt-1">
                                    <Badge className={vigenciaStatus.color}>
                                        {vigenciaStatus.text}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Número do Processo</label>
                                <p className="text-gray-900">{tc.numero_processo || "-"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Número do Acordo</label>
                                <p className="text-gray-900">{tc.numero_acordo || "-"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Número do CT</label>
                                <p className="text-gray-900">{tc.numero_ct || "-"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contrato Associado */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Contrato Associado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Número do PD</label>
                                <p className="text-lg font-semibold text-blue-600">
                                    {tc.contrato_associado_pd}
                                </p>
                            </div>
                            {associatedContract && (
                                <>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Cliente</label>
                                        <p className="text-gray-900">{associatedContract.cliente}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Analista Responsável</label>
                                        <p className="text-gray-900">{associatedContract.analista_responsavel}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Status do Contrato</label>
                                        <Badge className={associatedContract.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                            {associatedContract.status}
                                        </Badge>
                                    </div>
                                </>
                            )}
                        </div>
                        {associatedContract && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <Link
                                    to={createPageUrl(`ViewContract?id=${associatedContract.id}`)}
                                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                >
                                    Ver detalhes do contrato →
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Vigência e Financeiro */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-green-500" />
                            Vigência e Valores
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Data Início Vigência</label>
                                <p className="text-gray-900">
                                    {tc.data_inicio_vigencia ? format(new Date(tc.data_inicio_vigencia), "dd/MM/yyyy") : "-"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Data Fim Vigência</label>
                                <p className="text-gray-900">
                                    {tc.data_fim_vigencia ? format(new Date(tc.data_fim_vigencia), "dd/MM/yyyy") : "-"}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-500">Valor Total</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <DollarSign className="w-5 h-5 text-green-500" />
                                    <p className="text-2xl font-bold text-green-600">
                                        {tc.valor_total ? `R$ ${tc.valor_total.toLocaleString('pt-BR')}` : "R$ 0,00"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Observações */}
                {tc.observacoes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Observações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-900 whitespace-pre-wrap">{tc.observacoes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
