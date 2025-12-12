import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Contract } from "@/entities/Contract";
import { User } from "@/entities/User";
import { TermoConfirmacao } from "@/entities/TermoConfirmacao";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Save, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import ContractForm from "../components/contracts/ContractForm";

export default function EditContract() {
  const navigate = useNavigate();
  const location = useLocation();

  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [executedValue, setExecutedValue] = useState(0);

  // Renewal State
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [newContractNumber, setNewContractNumber] = useState("");
  const [isRenewing, setIsRenewing] = useState(false);

  useEffect(() => {
    const fetchContractAndUsers = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams(location.search);
        const contractId = params.get("id");

        if (!contractId) {
          navigate(createPageUrl("Contracts"));
          return;
        }

        const [allContracts, allUsers, loggedUser, allTCs] = await Promise.all([
          Contract.list(),
          User.list(),
          User.me(),
          TermoConfirmacao.list()
        ]);

        const contractData = allContracts.find(c => String(c.id) === String(contractId));

        if (!contractData) {
          setContract(null);
          return;
        }

        // Format dates
        if (contractData.data_inicio_efetividade) contractData.data_inicio_efetividade = contractData.data_inicio_efetividade.split('T')[0];
        if (contractData.data_fim_efetividade) contractData.data_fim_efetividade = contractData.data_fim_efetividade.split('T')[0];
        if (contractData.data_limite_andamento) contractData.data_limite_andamento = contractData.data_limite_andamento.split('T')[0];

        // Calculate executed value from TCs for reference or default
        const contractTCs = allTCs.filter(tc =>
          String(tc.contrato_associado_pd).trim() === String(contractData.contrato).trim()
        );
        const totalTCsValue = contractTCs.reduce((sum, tc) => sum + (tc.valor_total || 0), 0);

        // Prioritize the value stored in the database if it exists (allows manual overrides)
        // Only use the calculated totalTCsValue if the DB value is 0 or null
        const finalExecutedValue = (contractData.valor_faturado && contractData.valor_faturado > 0)
          ? contractData.valor_faturado
          : totalTCsValue;

        setExecutedValue(finalExecutedValue);

        // Ensure contract data reflects the value we decided to use
        contractData.valor_faturado = finalExecutedValue;

        // Recalculate 'valor_a_faturar' based on the decided 'valor_faturado'
        contractData.valor_a_faturar = (contractData.valor_contrato || 0) - finalExecutedValue;

        setContract(contractData);

        const filteredUsers = allUsers.filter(
          (user) => user.perfil === "ANALISTA" || user.perfil === "GESTOR"
        );

        setUsers(filteredUsers);
        setCurrentUser(loggedUser);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setContract(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractAndUsers();
  }, [location, navigate]);

  const handleSubmit = async (contractData) => {
    setIsSubmitting(true);
    try {
      await Contract.update(contract.id, contractData);
      toast.success("Contrato atualizado com sucesso!");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for toast
      navigate(createPageUrl("Contracts"));
    } catch (error) {
      console.error("Erro ao atualizar contrato:", error);
      toast.error("Erro ao atualizar contrato. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await Contract.delete(contract.id);
      navigate(createPageUrl("Contracts"));
    } catch (error) {
      console.error("Erro ao excluir contrato:", error);
      setIsDeleting(false);
    }
  };

  const handleRenewContract = async () => {
    if (!newContractNumber.trim()) {
      toast.error("Informe o número do novo contrato.");
      return;
    }

    setIsRenewing(true);
    try {
      // 1. Prepare data for NEW contract (Clone existing but reset financials/status)
      const newContractData = {
        ...contract, // Copy all fields
        id: undefined, // Let DB generate new ID
        created_at: undefined,
        updated_at: undefined,

        contrato: newContractNumber.toUpperCase(), // The new number
        contrato_anterior: contract.contrato, // Link to old
        contrato_novo: null, // New one has no successor yet

        status: "Ativo", // Start fresh
        status_vencimento: "Em dia",

        // Reset financials
        valor_faturado: 0,
        valor_cancelado: 0,
        valor_a_faturar: contract.valor_contrato, // Starts full? Or maybe 0? Usually renewed contracts maintain value logic, let's assume full value for now or user adjusts. 
        // Actually, if it's a renewal, the value might change. For safety, we keep the old value as default but reset execution.

        // Dates usually change, but we'll keep them for the user to edit as they are likely different.
      };

      // 2. Create the NEW contract
      const createdContract = await Contract.create(newContractData);

      // 3. Update the OLD contract
      await Contract.update(contract.id, {
        status: "Renovado",
        contrato_novo: newContractNumber.toUpperCase()
      });

      toast.success("Contrato renovado com sucesso!");
      setIsRenewDialogOpen(false);

      // 4. Redirect to the NEW contract's edit page
      // We need to wait a moment or just navigate
      navigate(`${createPageUrl("EditContract")}?id=${createdContract.id}`);

    } catch (error) {
      console.error("Erro ao renovar contrato:", error);
      toast.error("Erro ao renovar contrato.");
    } finally {
      setIsRenewing(false);
    }
  };


  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Contracts"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Contrato</h1>
            <p className="text-gray-600 mt-1">Atualize os dados do contrato selecionado</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              Dados do Contrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not loading and contract is null (e.g., ID not found or error)
  if (!contract) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Contracts"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Contrato</h1>
            <p className="text-gray-600 mt-1">Atualize os dados do contrato selecionado</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              Dados do Contrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 text-center">Contrato não encontrado ou erro ao carregar.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(createPageUrl("Contracts"))}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Editar Contrato</h1>
          <p className="text-gray-600 mt-1">Atualize os dados do contrato selecionado</p>
        </div>

        {/* Botão Renovar para Analistas/Gestores e contratos ativos */}
        {["ANALISTA", "GESTOR"].includes(currentUser?.perfil) && contract.status === "Ativo" && (
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setIsRenewDialogOpen(true)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Renovar Contrato
          </Button>
        )}

        {/* Botão Excluir apenas para Gestores */}
        {currentUser?.perfil === "GESTOR" && contract && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" disabled={isDeleting}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o contrato <strong>{contract.contrato}</strong>?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                  {isDeleting ? "Excluindo..." : "Excluir Contrato"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Dados do Contrato
          </CardTitle>
          <CardDescription>Preencha os detalhes do contrato.</CardDescription>
        </CardHeader>
        <CardContent>
          <ContractForm
            initialData={contract}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Atualizar Contrato"
            isEdit={true}
            users={users}
            currentUser={currentUser}
            executedValue={executedValue}
          />
        </CardContent>
      </Card>

      {/* Dialogo de Renovação */}
      <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renovar Contrato</DialogTitle>
            <DialogDescription>
              Isso irá encerrar o contrato atual ({contract.contrato}) como "Renovado" e criar um novo contrato vinculado a ele.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Número do Novo Contrato/PD</Label>
              <Input
                placeholder="Ex: PD-2025/001"
                value={newContractNumber}
                onChange={(e) => setNewContractNumber(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenewDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleRenewContract}
              className="bg-green-600 hover:bg-green-700"
              disabled={isRenewing}
            >
              {isRenewing ? "Processando..." : "Confirmar Renovação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
