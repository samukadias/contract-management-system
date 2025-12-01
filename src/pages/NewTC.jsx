import React, { useState, useEffect } from "react";
import { TermoConfirmacao } from "@/entities/TermoConfirmacao";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import TCForm from "../components/termos/TCForm";

export default function NewTC() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preSelectedContract, setPreSelectedContract] = useState("");

    useEffect(() => {
        // Verificar se há um contrato pré-selecionado na URL
        const urlParams = new URLSearchParams(location.search);
        const contractParam = urlParams.get("contract");
        if (contractParam) {
            setPreSelectedContract(contractParam);
        }
    }, [location.search]);

    const handleSubmit = async (tcData) => {
        setIsSubmitting(true);
        try {
            await TermoConfirmacao.create(tcData);
            navigate(createPageUrl("TermosConfirmacao"));
        } catch (error) {
            console.error("Erro ao criar TC:", error);
        }
        setIsSubmitting(false);
    };

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
                    <h1 className="text-3xl font-bold text-gray-900">Novo Termo de Confirmação</h1>
                    <p className="text-gray-600 mt-1">Cadastre um novo TC no sistema</p>
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
                        initialData={{ contrato_associado_pd: preSelectedContract }}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        submitButtonText="Criar TC"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
