import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Edit, Eye, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TCTable({ tcs = [], isLoading = false, onTCUpdate }) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    // Reset page when tcs change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [tcs.length]);

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
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Número TC</TableHead>
                                    <TableHead>PD Associado</TableHead>
                                    <TableHead>Processo</TableHead>
                                    <TableHead>Vigência</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!Array.isArray(tcs) || tcs.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Nenhum TC encontrado</p>
                    <Link to={createPageUrl("NewTC")}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            Cadastrar Primeiro TC
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    // Pagination Logic
    const totalPages = Math.ceil(tcs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTCs = tcs.slice(startIndex, endIndex);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <Card>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Número TC</TableHead>
                                <TableHead>PD Associado</TableHead>
                                <TableHead>Processo</TableHead>
                                <TableHead>Período Vigência</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Valor Total</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentTCs.map((tc) => {
                                const vigenciaStatus = getVigenciaStatus(tc.data_fim_vigencia);

                                return (
                                    <TableRow key={tc.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">{tc.numero_tc || "-"}</TableCell>
                                        <TableCell>
                                            {tc.contrato_associado_pd ? (
                                                <Link
                                                    to={`${createPageUrl("ViewContract")}?id=${tc.contrato_associado_pd}`}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {tc.contrato_associado_pd}
                                                </Link>
                                            ) : "-"}
                                        </TableCell>
                                        <TableCell>{tc.numero_processo || "-"}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {tc.data_inicio_vigencia && (
                                                    <div>De: {format(new Date(tc.data_inicio_vigencia), "dd/MM/yyyy")}</div>
                                                )}
                                                {tc.data_fim_vigencia && (
                                                    <div>Até: {format(new Date(tc.data_fim_vigencia), "dd/MM/yyyy")}</div>
                                                )}
                                                {!tc.data_inicio_vigencia && !tc.data_fim_vigencia && "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={vigenciaStatus.color}>
                                                {vigenciaStatus.text}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {tc.valor_total ?
                                                `R$ ${tc.valor_total.toLocaleString('pt-BR')}` :
                                                "-"
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <TooltipProvider>
                                                <div className="flex gap-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link to={`${createPageUrl("ViewTC")}?id=${tc.id}`}>
                                                                <Button variant="ghost" size="icon">
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Visualizar</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link to={`${createPageUrl("EditTC")}?id=${tc.id}`}>
                                                                <Button variant="ghost" size="icon">
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Editar</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TooltipProvider>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-4 border-t">
                        <div className="text-sm text-gray-500">
                            Mostrando {startIndex + 1} a {Math.min(endIndex, tcs.length)} de {tcs.length} TCs
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Anterior
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "ghost"}
                                            size="sm"
                                            className="w-8 h-8 p-0"
                                            onClick={() => goToPage(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Próximo
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
