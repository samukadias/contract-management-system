import React, { useState, useEffect, useCallback } from "react";
import { TermoConfirmacao } from "@/entities/TermoConfirmacao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function ContractDetails({ contract }) {
    const [relatedTCs, setRelatedTCs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadRelatedTCs = useCallback(async () => {
        if (!contract?.contrato) return;

        setIsLoading(true);
        try {
            const allTCs = await TermoConfirmacao.list();
            // Ensure allTCs is an array before filtering
            const contractTCs = (allTCs || []).filter(tc => tc.contrato_associado_pd === contract.contrato);
            setRelatedTCs(contractTCs || []); // Garantir que seja sempre um array
        } catch (error) {
            console.error("Erro ao carregar TCs relacionados:", error);
            setRelatedTCs([]); // Em caso de erro, definir como array vazio
        }
        setIsLoading(false);
    }, [contract?.contrato]);

    useEffect(() => {
        loadRelatedTCs();
    }, [loadRelatedTCs]);

    const getVigenciaStatus = (dataFim) => {
        if (!dataFim) return { text: "Indefinido", color: "bg-gray-100 text-gray-800" };

        const today = new Date();
        const endDate = new Date(dataFim);
        const isActive = endDate >= today;

        return isActive
            ? { text: "Ativo", color: "bg-green-100 text-green-800" }
            : { text: "Expirado", color: "bg-red-100 text-red-800" };
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        Termos de Confirmação Associados ({relatedTCs?.length || 0})
                    </CardTitle>
                    <Link to={createPageUrl(`NewTC?contract=${contract.contrato}`)}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Novo TC
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p className="text-gray-500 text-center py-4">Carregando TCs...</p>
                ) : (relatedTCs || []).length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">Nenhum TC associado a este contrato</p>
                        <Link to={createPageUrl(`NewTC?contract=${contract.contrato}`)}>
                            <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Criar Primeiro TC
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {(relatedTCs || []).map((tc) => {
                            const vigenciaStatus = getVigenciaStatus(tc.data_fim_vigencia);

                            return (
                                <div key={tc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-semibold text-gray-900">{tc.numero_tc}</h4>
                                                <Badge className={vigenciaStatus.color}>
                                                    {vigenciaStatus.text}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                {tc.numero_processo && (
                                                    <div>
                                                        <strong>Processo:</strong> {tc.numero_processo}
                                                    </div>
                                                )}
                                                {tc.numero_acordo && (
                                                    <div>
                                                        <strong>Acordo:</strong> {tc.numero_acordo}
                                                    </div>
                                                )}
                                                {tc.valor_total > 0 && (
                                                    <div>
                                                        <strong>Valor:</strong> R$ {(tc.valor_total || 0).toLocaleString('pt-BR')}
                                                    </div>
                                                )}
                                                {tc.data_fim_vigencia && (
                                                    <div>
                                                        <strong>Vigência até:</strong> {format(new Date(tc.data_fim_vigencia), "dd/MM/yyyy")}
                                                    </div>
                                                )}
                                            </div>

                                            {tc.observacoes && (
                                                <p className="text-sm text-gray-600 mt-2">{tc.observacoes}</p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Link to={createPageUrl(`ViewTC?id=${tc.id}`)}>
                                                <Button variant="outline" size="sm">
                                                    Ver Detalhes
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
