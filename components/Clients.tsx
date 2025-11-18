// Caminho: MIL_EVENTOS/components/Clients.tsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Plus, Loader2, AlertTriangle, User, Search } from 'lucide-react';

import { clientSchema, ClientInput, ClientOutput } from '../src/schemas/clientSchema'; 

// --- 1. Funções de Dados ---

const fetchClients = async (): Promise<ClientOutput[]> => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get('/api/contacts/clients', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const createClient = async (data: ClientInput) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.post('/api/contacts/clients', data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// --- 2. Componente Principal ---

export default function Clients() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    
    // RHF para o Formulário de Criação Rápida
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ClientInput>({
        resolver: zodResolver(clientSchema),
        defaultValues: { name: '', phone: '', email: '' }
    });

    // React Query para Listagem
    const { data: clients, isLoading, isError } = useQuery({
        queryKey: ['clients'],
        queryFn: fetchClients,
    });

    // React Query para Criação
    const mutation = useMutation({
        mutationFn: createClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] }); // Recarrega a lista
            reset(); // Limpa o formulário
        },
        onError: (error) => {
            console.error(error);
            alert('Erro ao criar cliente.');
        },
    });

    const onSubmit = (data: ClientInput) => {
        // Remove strings vazias para enviar undefined/nulo ao backend
        const sanitizedData = {
            ...data,
            phone: data.phone || undefined,
            email: data.email || undefined,
        };
        mutation.mutate(sanitizedData as ClientInput);
    };
    
    // Filtro de Busca
    const filteredClients = clients?.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
    );

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">👥 Catálogo de Clientes</h2>
            
            {/* Seção de Criação Rápida */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-indigo-100">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Adicionar Novo Cliente</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    
                    <input {...register('name')} placeholder="Nome *" className="rounded-md border-gray-300 shadow-sm px-3 py-2" />
                    <input {...register('phone')} placeholder="Telefone (Opcional)" className="rounded-md border-gray-300 shadow-sm px-3 py-2" />
                    <input {...register('email')} placeholder="E-mail (Opcional)" className="rounded-md border-gray-300 shadow-sm px-3 py-2" />
                    
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-md transition duration-150 disabled:opacity-50"
                    >
                        {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="w-5 h-5 mr-1" />}
                        Adicionar
                    </button>
                    
                    {errors.name && <p className="col-span-4 text-sm text-red-500">{errors.name.message}</p>}
                    {(errors.phone || errors.email) && <p className="col-span-4 text-sm text-red-500">{(errors.phone?.message || '') + (errors.email?.message || '')}</p>}
                </form>
            </div>

            {/* Tabela/Listagem de Clientes */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Clientes Ativos ({clients?.length || 0})</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-md"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                </div>

                {isLoading && <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>}
                {isError && <div className="text-center py-4 text-red-500">Erro ao carregar clientes.</div>}

                {/* Exemplo de Tabela Simples */}
                {!isLoading && !isError && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propostas Feitas</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredClients?.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{client.proposalsCount || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {(filteredClients?.length === 0 && clients.length > 0) && (
                            <div className="text-center py-6 text-gray-500">Nenhum cliente encontrado com os critérios de busca.</div>
                        )}
                        {(clients?.length === 0) && (
                            <div className="text-center py-6 text-gray-500">Seu catálogo de clientes está vazio. Adicione o primeiro!</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}