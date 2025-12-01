import React, { useState } from "react";
import { useTCs } from "@/hooks/useTCs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Search, FileText } from "lucide-react";

import TCTable from "../components/termos/TCTable";
import TCFilters from "../components/termos/TCFilters";

export default function TermosConfirmacao() {
    const { data: tcs = [], isLoading } = useTCs();
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        contrato: "",
        vigencia: "all"
    });

    // Filter logic
    const filteredTCs = tcs.filter((tc) => {
        const matchesSearch =
            tc.numero_tc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tc.contrato_associado_pd?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tc.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesContrato = !filters.contrato || tc.contrato_associado_pd?.toLowerCase().includes(filters.contrato.toLowerCase());

        let matchesVigencia = true;
        if (filters.vigencia !== "all") {
            const today = new Date();
            if (!tc.data_fim_vigencia) {
                matchesVigencia = filters.vigencia === "indefinido";
            } else {
                const endDate = new Date(tc.data_fim_vigencia);
                const isActive = endDate >= today;
                matchesVigencia = filters.vigencia === "ativo" ? isActive : !isActive;
            }
        }

        return matchesSearch && matchesContrato && matchesVigencia;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Termos de Confirmação</h1>
                    <p className="text-gray-600 mt-1">Gerencie todos os Termos de Confirmação</p>
                </div>
                <div className="flex gap-3">
                    <Link to={createPageUrl("NewTC")}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Novo TC
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Buscar por número do TC, PD ou processo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={showFilters ? "bg-blue-50 text-blue-700" : ""}
                >
                    <FileText className="w-4 h-4 mr-2" />
                    Filtros
                </Button>
            </div>

            {showFilters && (
                <TCFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                />
            )}

            <TCTable
                tcs={filteredTCs}
                isLoading={isLoading}
            />
        </div>
    );
}
