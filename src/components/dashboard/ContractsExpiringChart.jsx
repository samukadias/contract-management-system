import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "lucide-react";

export default function ContractsExpiringChart({ contracts, isLoading }) {
    const currentYear = new Date().getFullYear();

    const getData = () => {
        // Initialize months
        const months = Array.from({ length: 12 }, (_, i) => ({
            name: format(new Date(currentYear, i, 1), "MMM", { locale: ptBR }),
            fullName: format(new Date(currentYear, i, 1), "MMMM", { locale: ptBR }),
            monthIndex: i,
            count: 0
        }));

        contracts.forEach(contract => {
            if (contract.data_fim_efetividade) {
                const date = parseISO(contract.data_fim_efetividade);
                if (isValid(date) && date.getFullYear() === currentYear) {
                    months[date.getMonth()].count++;
                }
            }
        });

        return months;
    };

    const data = getData();

    if (isLoading) {
        return (
            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle>Vencimentos em {currentYear}</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center bg-gray-50 animate-pulse">
                    <p className="text-gray-400">Carregando dados...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-full lg:col-span-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Vencimentos de Contratos em {currentYear}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#f3f4f6' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white p-2 border rounded shadow-md text-sm">
                                                <p className="font-semibold text-gray-700">
                                                    {payload[0].payload.fullName}
                                                </p>
                                                <p className="text-indigo-600">
                                                    {payload[0].value} contrato(s) vencendo
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#6366f1"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
