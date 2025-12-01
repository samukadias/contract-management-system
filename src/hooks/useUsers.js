import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/entities/User';
import { toast } from 'sonner';

// Keys
export const userKeys = {
    all: ['users'],
    lists: () => [...userKeys.all, 'list'],
    list: (filters) => [...userKeys.lists(), { filters }],
    details: () => [...userKeys.all, 'detail'],
    detail: (id) => [...userKeys.details(), id],
};

// Hooks
export function useUsers() {
    return useQuery({
        queryKey: userKeys.lists(),
        queryFn: async () => {
            const data = await User.list();
            return data;
        },
    });
}

export function useUser(id) {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: async () => {
            if (!id) return null;
            const user = await User.get(id);
            if (!user) throw new Error('Usuário não encontrado');
            return user;
        },
        enabled: !!id,
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newUser) => User.create(newUser),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            toast.success('Usuário criado com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao criar usuário:', error);

            // Check for specific errors
            if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
                toast.error('Este email já está cadastrado no sistema.');
            } else if (error.code === '23505') { // Common PostgreSQL unique violation error code
                toast.error('Este email já está cadastrado no sistema.');
            } else {
                toast.error('Erro ao criar usuário. Verifique os dados e tente novamente.');
            }
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => User.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
            toast.success('Usuário atualizado com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao atualizar usuário:', error);
            toast.error('Erro ao atualizar usuário.');
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => User.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            toast.success('Usuário excluído com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao excluir usuário:', error);
            toast.error('Erro ao excluir usuário.');
        },
    });
}
