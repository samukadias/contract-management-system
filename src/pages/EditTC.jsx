import React, { useState, useEffect } from "react";
import { TermoConfirmacao } from "@/entities/TermoConfirmacao";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import TCForm from "../components/termos/TCForm";

export default function EditTC() {
    const navigate = useNavigate();
    const location = useLocation();
    const [tc, setTC] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            const tcList = await TermoConfirmacao.list();
            const foundTC = tcList.find(t => t.id === tcId);
            setTC(foundTC);
        } catch (error) {
            console.error("Erro ao carregar TC:", error);
        }
        setIsLoading(false);
    };

    const handleSubmit = async (tcData) => {
        setIsSubmitting(true);
        try {
            await TermoConfirmacao.update(tc.id, tcData);
            navigate(createPageUrl("TermosConfirmacao"));
        } catch (error) {
            console.error("Erro ao atualizar TC:", error);
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="w-10 h-10" />
                    <div className="flex-1">
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {Array(4).fill(0).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!tc) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">TC não encontrado</h3>
                    <p className="text-gray-600 mb-4">O Termo de Confirmação solicitado não foi encontrado.</p>
                    <Button onClick={() => navigate(createPageUrl("TermosConfirmacao"))}>
                        Voltar para lista
                    </Button>
                </div>
            </div>
        );
    }

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
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Editar TC</h1>
                    <p className="text-gray-600 mt-1">Atualize os dados do Termo de Confirmação</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        Dados do Termo de Confirmação
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <TCForm
                        initialData={tc}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        submitButtonText="Atualizar TC"
                        isEdit={true}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
