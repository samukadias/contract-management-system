import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Contract } from '@/entities/Contract';
import { toast } from 'sonner';

// Keys
export const contractKeys = {
    all: ['contracts'],
    lists: () => [...contractKeys.all, 'list'],
    list: (filters) => [...contractKeys.lists(), { filters }],
    details: () => [...contractKeys.all, 'detail'],
    detail: (id) => [...contractKeys.details(), id],
};

// Hooks
export function useContracts() {
    return useQuery({
        queryKey: contractKeys.lists(),
        queryFn: async () => {
            const data = await Contract.list();
            return data;
        },
    });
}

export function useContract(id) {
    return useQuery({
        queryKey: contractKeys.detail(id),
        queryFn: async () => {
            if (!id) return null;
            // Handle both string and number IDs
            const allContracts = await Contract.list();
            const contract = allContracts.find(c => String(c.id) === String(id));
            if (!contract) throw new Error('Contrato não encontrado');
            return contract;
        },
        enabled: !!id,
    });
}

export function useCreateContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newContract) => Contract.create(newContract),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
            toast.success('Contrato criado com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao criar contrato:', error);
            toast.error('Erro ao criar contrato.');
        },
    });
}

export function useUpdateContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => Contract.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
            queryClient.invalidateQueries({ queryKey: contractKeys.detail(variables.id) });
            toast.success('Contrato atualizado com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao atualizar contrato:', error);
            toast.error('Erro ao atualizar contrato.');
        },
    });
}

export function useDeleteContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => Contract.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
            toast.success('Contrato excluído com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao excluir contrato:', error);
            toast.error('Erro ao excluir contrato.');
        },
    });
}
