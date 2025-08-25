import React, { useState, useEffect } from "react";
import { Contract } from "@/entities/Contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Database, AlertTriangle, RefreshCw } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      const data = await Contract.list();
      setContracts(data);
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
    }
    setIsLoading(false);
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
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Total de Contratos</p>
                  <p className="text-sm text-gray-600">Registros no sistema</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "..." : contracts.length}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadContracts}
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                  </Button>
                </div>
              </div>
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
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Para limpar os dados dos contratos, acesse a aba <strong>Workspace</strong> no menu lateral, 
                depois vá em <strong>Data</strong> → <strong>Contract</strong> e use as opções de exclusão de registros.
                
                <br /><br />
                
                Alternativamente, você pode deletar registros individuais através das páginas de listagem de contratos.
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 mb-2">Atenção</h4>
                  <p className="text-sm text-red-700 mb-3">
                    A exclusão de dados é permanente e não pode ser desfeita. 
                    Certifique-se de fazer backup dos dados importantes antes de prosseguir.
                  </p>
                  <p className="text-sm text-red-700">
                    <strong>Passos para limpar os dados:</strong>
                  </p>
                  <ol className="text-sm text-red-700 mt-2 ml-4 list-decimal">
                    <li>Clique em "Workspace" na barra lateral</li>
                    <li>Vá para a seção "Data"</li>
                    <li>Selecione "Contract"</li>
                    <li>Use as opções de exclusão disponíveis</li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}