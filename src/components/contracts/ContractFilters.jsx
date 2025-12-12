import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContractFilters({ filters, onFiltersChange }) {
  const updateFilter = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Status do Contrato</Label>
            <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Renovado">Renovado</SelectItem>
                <SelectItem value="Encerrado">Encerrado</SelectItem>
                <SelectItem value="Expirado">Expirado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status do Vencimento</Label>
            <Select value={filters.vencimento} onValueChange={(value) => updateFilter("vencimento", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o vencimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Atenção">Atenção</SelectItem>
                <SelectItem value="Urgente">Urgente</SelectItem>
                <SelectItem value="Vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Busca Geral</Label>
            <Input
              placeholder="Buscar por Contrato, Cliente, Analista, ESP..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}