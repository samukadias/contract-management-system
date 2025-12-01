import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TermoConfirmacao } from '@/entities/TermoConfirmacao';
import { toast } from 'sonner';

// Keys
export const tcKeys = {
    all: ['tcs'],
    lists: () => [...tcKeys.all, 'list'],
    list: (filters) => [...tcKeys.lists(), { filters }],
    details: () => [...tcKeys.all, 'detail'],
    detail: (id) => [...tcKeys.details(), id],
};

// Hooks
export function useTCs() {
    return useQuery({
        queryKey: tcKeys.lists(),
        queryFn: async () => {
            const data = await TermoConfirmacao.list();
            return data;
        },
    });
}

export function useTC(id) {
    return useQuery({
        queryKey: tcKeys.detail(id),
        queryFn: async () => {
            if (!id) return null;
            const allTCs = await TermoConfirmacao.list();
            const tc = allTCs.find(t => String(t.id) === String(id));
            if (!tc) throw new Error('TC não encontrado');
            return tc;
        },
        enabled: !!id,
    });
}

export function useCreateTC() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newTC) => TermoConfirmacao.create(newTC),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tcKeys.lists() });
            toast.success('TC criado com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao criar TC:', error);
            toast.error('Erro ao criar TC.');
        },
    });
}

export function useUpdateTC() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => TermoConfirmacao.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: tcKeys.lists() });
            queryClient.invalidateQueries({ queryKey: tcKeys.detail(variables.id) });
            toast.success('TC atualizado com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao atualizar TC:', error);
            toast.error('Erro ao atualizar TC.');
        },
    });
}

export function useDeleteTC() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => TermoConfirmacao.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tcKeys.lists() });
            toast.success('TC excluído com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao excluir TC:', error);
            toast.error('Erro ao excluir TC.');
        },
    });
}
