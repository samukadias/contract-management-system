import React, { useState, useEffect } from "react";
import { Contract } from "@/entities/Contract";
import { TermoConfirmacao } from "@/entities/TermoConfirmacao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Database, AlertTriangle, RefreshCw, Users, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { supabase } from "@/lib/supabase";

export default function DataManagement() {
  const [contracts, setContracts] = useState([]);
  const [tcs, setTcs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  // Transfer States
  const [analysts, setAnalysts] = useState([]);
  const [sourceAnalyst, setSourceAnalyst] = useState("");
  const [targetAnalyst, setTargetAnalyst] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Transfer Client States
  const [clients, setClients] = useState([]);
  const [sourceClient, setSourceClient] = useState("");
  const [targetAnalystForClient, setTargetAnalystForClient] = useState("");
  const [isTransferringClient, setIsTransferringClient] = useState(false);

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

      // Extract unique analysts
      const uniqueAnalysts = [...new Set(contractsData.map(c => c.analista_responsavel).filter(Boolean))].sort();
      setAnalysts(uniqueAnalysts);

      // Extract unique clients
      const uniqueClients = [...new Set(contractsData.map(c => c.cliente).filter(Boolean))].sort();
      setClients(uniqueClients);

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

  const handleTransferPortfolio = async () => {
    if (!sourceAnalyst || !targetAnalyst) {
      toast.error("Selecione os analistas de origem e destino.");
      return;
    }

    if (sourceAnalyst === targetAnalyst) {
      toast.error("Os analistas de origem e destino devem ser diferentes.");
      return;
    }

    setIsTransferring(true);
    try {
      // 1. Get contracts to count
      const contractsToTransfer = contracts.filter(c => c.analista_responsavel === sourceAnalyst);
      const count = contractsToTransfer.length;

      if (count === 0) {
        toast.warning(`O analista ${sourceAnalyst} não possui contratos.`);
        setIsTransferring(false);
        return;
      }

      // 2. Perform Update via Supabase
      const { error } = await supabase
        .from('contracts')
        .update({ analista_responsavel: targetAnalyst })
        .eq('analista_responsavel', sourceAnalyst);

      if (error) throw error;

      toast.success(`${count} contratos transferidos de ${sourceAnalyst} para ${targetAnalyst}.`);

      // 3. Reset and Reload
      setSourceAnalyst("");
      setTargetAnalyst("");
      await loadData();

    } catch (error) {
      console.error("Erro na transferência:", error);
      toast.error("Erro ao transferir carteira.");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleTransferClientPortfolio = async () => {
    if (!sourceClient || !targetAnalystForClient) {
      toast.error("Selecione o cliente e o analista de destino.");
      return;
    }

    setIsTransferringClient(true);
    try {
      // 1. Get contracts to count
      const contractsToTransfer = contracts.filter(c => c.cliente === sourceClient);
      const count = contractsToTransfer.length;

      if (count === 0) {
        toast.warning(`O cliente ${sourceClient} não possui contratos.`);
        setIsTransferringClient(false);
        return;
      }

      // 2. Perform Update via Supabase
      const { error } = await supabase
        .from('contracts')
        .update({ analista_responsavel: targetAnalystForClient })
        .eq('cliente', sourceClient);

      if (error) throw error;

      toast.success(`${count} contratos do cliente ${sourceClient} transferidos para ${targetAnalystForClient}.`);

      // 3. Reset and Reload
      setSourceClient("");
      setTargetAnalystForClient("");
      await loadData();

    } catch (error) {
      console.error("Erro na transferência de cliente:", error);
      toast.error("Erro ao transferir contratos do cliente.");
    } finally {
      setIsTransferringClient(false);
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

        {/* Transferência de Carteira */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Transferência de Carteira
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Transfira todos os contratos de um analista para outro. Útil em casos de férias, desligamento ou redistribuição.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label>Analista de Origem (Quem sai)</Label>
                <Select value={sourceAnalyst} onValueChange={setSourceAnalyst}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o analista..." />
                  </SelectTrigger>
                  <SelectContent>
                    {analysts.map(a => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center pb-2 md:pb-0">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>

              <div className="space-y-2">
                <Label>Analista de Destino (Quem assume)</Label>
                <div className="flex gap-2">
                  {/* Dropdown for existing */}
                  <Select value={targetAnalyst} onValueChange={setTargetAnalyst}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione ou digite..." />
                    </SelectTrigger>
                    <SelectContent>
                      {analysts.filter(a => a !== sourceAnalyst).map(a => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Optional: Add a way to type a new name if needed, but simplistic for now */}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ou digite um novo nome para o destino:</Label>
              <Input
                placeholder="Nome do novo analista (opcional)"
                value={targetAnalyst}
                onChange={(e) => setTargetAnalyst(e.target.value)}
              />
              <p className="text-xs text-gray-500">Selecione na lista acima OU digite um novo nome.</p>
            </div>


            <div className="flex justify-end pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={isTransferring || !sourceAnalyst || !targetAnalyst || sourceAnalyst === targetAnalyst}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {isTransferring ? "Transferindo..." : "Realizar Transferência"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Transferência</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você está prestes a transferir <strong>TODOS</strong> os contratos de <span className="font-bold text-purple-600">{sourceAnalyst}</span> para <span className="font-bold text-purple-600">{targetAnalyst}</span>.
                      <br /><br />
                      Contratos afetados: {contracts.filter(c => c.analista_responsavel === sourceAnalyst).length}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleTransferPortfolio} className="bg-purple-600 hover:bg-purple-700">
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>

        </Card>

        {/* Transferência de Cliente para Analista */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Transferência por Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Transfira todos os contratos de um determinado Cliente para um Analista específico.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label>Cliente (Origem)</Label>
                <Select value={sourceClient} onValueChange={setSourceClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center pb-2 md:pb-0">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>

              <div className="space-y-2">
                <Label>Analista de Destino</Label>
                <Select value={targetAnalystForClient} onValueChange={setTargetAnalystForClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o analista..." />
                  </SelectTrigger>
                  <SelectContent>
                    {analysts.map(a => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={isTransferringClient || !sourceClient || !targetAnalystForClient}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {isTransferringClient ? "Transferindo..." : "Transf. Cliente -> Analista"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Transferência de Cliente</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você está prestes a transferir <strong>TODOS</strong> os contratos do cliente <span className="font-bold text-indigo-600">{sourceClient}</span> para o analista <span className="font-bold text-indigo-600">{targetAnalystForClient}</span>.
                      <br /><br />
                      Contratos afetados: {contracts.filter(c => c.nome_cliente === sourceClient).length}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleTransferClientPortfolio} className="bg-indigo-600 hover:bg-indigo-700">
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
