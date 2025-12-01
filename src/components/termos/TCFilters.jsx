import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function TCFilters({ filters = {}, onFiltersChange }) {
    const updateFilter = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        onFiltersChange(newFilters);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Filter className="w-4 h-4" />
                    Filtros Avançados
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Contrato (PD)</label>
                        <Input
                            placeholder="Filtrar por número do PD..."
                            value={filters.contrato || ""}
                            onChange={(e) => updateFilter("contrato", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status da Vigência</label>
                        <Select
                            value={filters.vigencia || "all"}
                            onValueChange={(value) => updateFilter("vigencia", value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="ativo">Ativo</SelectItem>
                                <SelectItem value="expirado">Expirado</SelectItem>
                                <SelectItem value="indefinido">Indefinido</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
