import React, { useState, useEffect } from "react";
import { Contract } from "@/entities/Contract";
import { TermoConfirmacao } from "@/entities/TermoConfirmacao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Database, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DataManagement() {
  const [contracts, setContracts] = useState([]);
  const [tcs, setTcs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const contractsData = await Contract.list();
      const tcsData = await TermoConfirmacao.list();
      setContracts(contractsData);
      setTcs(tcsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados.");
    }
    setIsLoading(false);
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      await Contract.clear();
      await TermoConfirmacao.clear();

      toast.success("Todos os dados foram apagados com sucesso!");
      await loadData();
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      toast.error("Erro ao limpar dados. Tente novamente.");
    } finally {
      setIsClearing(false);
    }
  };

  const handleMigrateFromLocalStorage = async () => {
    setIsMigrating(true);
    try {
      const contractResult = await Contract.migrateFromLocalStorage();
      const tcResult = await TermoConfirmacao.migrateFromLocalStorage();

      const totalMigrated = contractResult.count + tcResult.count;

      if (totalMigrated > 0) {
        toast.success(`${totalMigrated} registros migrados com sucesso!`);
        await loadData();
      } else {
        toast.info("Nenhum dado encontrado no localStorage para migrar.");
      }
    } catch (error) {
      console.error("Erro ao migrar dados:", error);
      toast.error("Erro ao migrar dados. Tente novamente.");
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Dados</h1>
        <p className="text-gray-600 mt-1">Gerencie os dados do sistema</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              Status dos Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Total de Contratos</p>
                    <p className="text-sm text-gray-600">Registros no sistema</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? "..." : contracts.length}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Total de TCs</p>
                    <p className="text-sm text-gray-600">Registros no sistema</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? "..." : tcs.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  disabled={isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar Dados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-green-500" />
              Migração de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Se você tem dados salvos no navegador (localStorage) e quer transferi-los para o banco de dados na nuvem, use o botão abaixo.
                <br /><br />
                <strong>Nota:</strong> Esta ação não apaga os dados do localStorage, apenas copia para o Supabase.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end">
              <Button
                onClick={handleMigrateFromLocalStorage}
                disabled={isMigrating}
                className="bg-green-600 hover:bg-green-700"
              >
                <Database className="w-4 h-4 mr-2" />
                {isMigrating ? "Migrando..." : "Migrar do Navegador"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Limpeza de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Esta ação apagará <strong>TODOS</strong> os contratos e termos de confirmação cadastrados no sistema.
                Esta ação é irreversível e os dados não poderão ser recuperados.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isClearing || (contracts.length === 0 && tcs.length === 0)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isClearing ? "Limpando..." : "Apagar Todos os Dados"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente todos os contratos e termos de confirmação do banco de dados local do seu navegador.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAllData} className="bg-red-600 hover:bg-red-700">
                      Sim, apagar tudo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}