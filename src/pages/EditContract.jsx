import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Contract } from "@/entities/Contract";
import { User } from "@/entities/User";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

  useEffect(() => {
    const fetchContractAndUsers = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams(location.search);
        const contractId = params.get("id");
        console.log("EditContract - ID from URL:", contractId);

        if (!contractId) {
          console.log("EditContract - No ID found in URL, redirecting...");
          navigate(createPageUrl("Contracts"));
          return;
        }

        // Find contract by ID (handle both string and number)
        const allContracts = await Contract.list();
        console.log("EditContract - All Contracts IDs:", allContracts.map(c => c.id));

        const contractData = allContracts.find(c => String(c.id) === String(contractId));
        console.log("EditContract - Found Contract:", contractData);

        if (!contractData) {
          console.error("Contrato não encontrado para o ID:", contractId);
          setContract(null);
          return;
        }
        // Format dates for input[type=date]
        if (contractData.data_inicio_efetividade) {
          contractData.data_inicio_efetividade = contractData.data_inicio_efetividade.split('T')[0];
        }
        if (contractData.data_fim_efetividade) {
          contractData.data_fim_efetividade = contractData.data_fim_efetividade.split('T')[0];
        }
        if (contractData.data_limite_andamento) {
          contractData.data_limite_andamento = contractData.data_limite_andamento.split('T')[0];
        }
        setContract(contractData);

        const allUsers = await User.list();
        const loggedUser = await User.me();

        const filteredUsers = allUsers.filter(
          (user) => user.perfil === "ANALISTA" || user.perfil === "GESTOR"
        );

        setUsers(filteredUsers);
        setCurrentUser(loggedUser);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setContract(null); // Ensure contract is null if an error occurs
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
          />
        </CardContent>
      </Card>
    </div>
  );
}