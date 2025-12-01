import React, { useState } from "react";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
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
import { Users, Plus, Edit, UserCheck, UserX, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// UserForm component moved outside to prevent re-creation on each render
const UserForm = ({ formData, setFormData, onSubmit, isEdit = false, resetForm, setShowCreateDialog, setShowEditDialog, setEditingUser }) => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Digite o nome completo"
                required
            />
        </div>

        <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Digite o email"
                required
                disabled={isEdit}
            />
        </div>

        <div className="space-y-2">
            <Label htmlFor="perfil">Perfil de Acesso *</Label>
            <Select
                value={formData.perfil}
                onValueChange={(value) => setFormData(prev => ({ ...prev, perfil: value }))}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="GESTOR">Gestor</SelectItem>
                    <SelectItem value="ANALISTA">Analista</SelectItem>
                    <SelectItem value="CLIENTE">Cliente</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {formData.perfil === "CLIENTE" && (
            <div className="space-y-2">
                <Label htmlFor="nome_cliente">Nome do Cliente *</Label>
                <Input
                    id="nome_cliente"
                    value={formData.nome_cliente}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome_cliente: e.target.value }))}
                    placeholder="Digite o nome do cliente"
                    required
                />
            </div>
        )}

        <div className="space-y-2">
            <Label htmlFor="departamento">Departamento</Label>
            <Input
                id="departamento"
                value={formData.departamento}
                onChange={(e) => setFormData(prev => ({ ...prev, departamento: e.target.value }))}
                placeholder="Digite o departamento"
            />
        </div>

        <DialogFooter>
            <Button
                variant="outline"
                onClick={() => {
                    resetForm();
                    setShowCreateDialog(false);
                    setShowEditDialog(false);
                    setEditingUser(null);
                }}
            >
                Cancelar
            </Button>
            <Button onClick={onSubmit}>
                {isEdit ? "Atualizar" : "Criar"} Usuário
            </Button>
        </DialogFooter>
    </div>
);

export default function UserManagement() {
    const { data: users = [], isLoading } = useUsers();
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const deleteUser = useDeleteUser();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        perfil: "ANALISTA",
        nome_cliente: "",
        departamento: ""
    });

    const handleCreateUser = async () => {
        createUser.mutate(formData, {
            onSuccess: () => {
                setShowCreateDialog(false);
                resetForm();
            }
        });
    };

    const handleEditUser = async () => {
        updateUser.mutate({ id: editingUser.id, data: formData }, {
            onSuccess: () => {
                setShowEditDialog(false);
                setEditingUser(null);
                resetForm();
            }
        });
    };

    const openEditDialog = (user) => {
        setEditingUser(user);
        setFormData({
            full_name: user.full_name || "",
            email: user.email || "",
            perfil: user.perfil || "ANALISTA",
            nome_cliente: user.nome_cliente || "",
            departamento: user.departamento || ""
        });
        setShowEditDialog(true);
    };

    const resetForm = () => {
        setFormData({
            full_name: "",
            email: "",
            perfil: "ANALISTA",
            nome_cliente: "",
            departamento: ""
        });
    };

    const getRoleColor = (perfil) => {
        const colors = {
            "GESTOR": "bg-purple-100 text-purple-800",
            "ANALISTA": "bg-blue-100 text-blue-800",
            "CLIENTE": "bg-green-100 text-green-800"
        };
        return colors[perfil] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
                    <p className="text-gray-600 mt-1">Gerencie os usuários e permissões do sistema</p>
                </div>

                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Usuário
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criar Novo Usuário</DialogTitle>
                        </DialogHeader>
                        <UserForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleCreateUser}
                            isEdit={false}
                            resetForm={resetForm}
                            setShowCreateDialog={setShowCreateDialog}
                            setShowEditDialog={setShowEditDialog}
                            setEditingUser={setEditingUser}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Resumo de Usuários */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Gestores</p>
                                <p className="text-2xl font-bold text-purple-700">
                                    {users.filter(u => u.perfil === "GESTOR").length}
                                </p>
                            </div>
                            <UserCheck className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Analistas</p>
                                <p className="text-2xl font-bold text-blue-700">
                                    {users.filter(u => u.perfil === "ANALISTA").length}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Clientes</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {users.filter(u => u.perfil === "CLIENTE").length}
                                </p>
                            </div>
                            <UserX className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de Usuários */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Lista de Usuários ({users.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array(5).fill(0).map((_, i) => (
                                <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Perfil</TableHead>
                                        <TableHead>Cliente/Departamento</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.full_name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge className={getRoleColor(user.perfil)}>
                                                    {user.perfil}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.perfil === "CLIENTE" ? user.nome_cliente : user.departamento}
                                            </TableCell>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <div className="flex gap-2">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => openEditDialog(user)}
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Editar</p>
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <AlertDialog>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Excluir</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Tem certeza que deseja excluir o usuário <strong>{user.full_name}</strong>?
                                                                        Esta ação não pode ser desfeita.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => deleteUser.mutate(user.id)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Excluir
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog de Edição */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                    </DialogHeader>
                    <UserForm
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleEditUser}
                        isEdit={true}
                        resetForm={resetForm}
                        setShowCreateDialog={setShowCreateDialog}
                        setShowEditDialog={setShowEditDialog}
                        setEditingUser={setEditingUser}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
