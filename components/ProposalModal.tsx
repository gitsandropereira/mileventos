// Caminho: MIL_EVENTOS/components/ProposalModal.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { proposalInputSchema, ProposalInput, ProposalStatusEnum } from '../src/schemas/proposalSchema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { X, Save, Loader2 } from 'lucide-react';

interface ProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentProposal: ProposalInput | null; // Para futura edição
}

const createProposal = async (data: ProposalInput) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.post('/api/proposals', data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export default function ProposalModal({ isOpen, onClose, currentProposal }: ProposalModalProps) {
    const queryClient = useQueryClient();
    
    // Configura o RHF com o Zod Resolver
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ProposalInput>({
        resolver: zodResolver(proposalInputSchema),
        defaultValues: currentProposal || { 
            clientName: '', 
            eventName: '', 
            amount: 0, 
            status: 'Rascunho', 
            date: new Date().toISOString().substring(0, 10) // Data de hoje
        },
    });

    // Mutation para criar (POST)
    const mutation = useMutation({
        mutationFn: createProposal,
        onSuccess: () => {
            // Invalida o cache para que a lista 'proposals' recarregue automaticamente
            queryClient.invalidateQueries({ queryKey: ['proposals'] }); 
            onClose(); // Fecha o modal
            reset(); // Limpa o formulário
        },
        onError: (error: any) => {
            console.error("Erro na criação:", error.response?.data?.message || error.message);
            alert(`Erro ao criar proposta: ${error.response?.data?.message || 'Verifique o console.'}`);
        },
    });

    const onSubmit = (data: ProposalInput) => {
        mutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                
                {/* Cabeçalho do Modal */}
                <div className="p-5 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {currentProposal ? 'Editar Proposta' : 'Nova Proposta'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Corpo do Formulário */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    
                    {/* Linha 1: Cliente e Evento */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Campo Cliente */}
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Cliente:</span>
                            <input
                                {...register('clientName')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                            {errors.clientName && <p className="text-xs text-red-500">{errors.clientName.message}</p>}
                        </label>
                        {/* Campo Evento */}
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Nome do Evento:</span>
                            <input
                                {...register('eventName')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                            {errors.eventName && <p className="text-xs text-red-500">{errors.eventName.message}</p>}
                        </label>
                    </div>

                    {/* Linha 2: Valor e Data */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Campo Valor */}
                        <label className="block col-span-1">
                            <span className="text-sm font-medium text-gray-700">Valor (R$):</span>
                            <input
                                type="number"
                                step="0.01"
                                {...register('amount', { valueAsNumber: true })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                        </label>
                        {/* Campo Data */}
                        <label className="block col-span-2">
                            <span className="text-sm font-medium text-gray-700">Data do Evento:</span>
                            <input
                                type="date"
                                {...register('date')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                            {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
                        </label>
                    </div>

                    {/* Campo Status (Opcional, pode ser útil no modal) */}
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <select
                            {...register('status')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        >
                            {ProposalStatusEnum.options.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
                    </label>

                    {/* Campo Descrição */}
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Descrição (Opcional):</span>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </label>

                    {/* Rodapé do Modal (Ações) */}
                    <div className="flex justify-end pt-4 border-t">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition disabled:opacity-50"
                        >
                            {mutation.isPending ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-5 w-5" />
                            )}
                            {mutation.isPending ? 'Salvando...' : 'Salvar Proposta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}