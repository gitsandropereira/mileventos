// Caminho: MIL_EVENTOS/components/Proposals.tsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Loader2, List, Kanban, AlertTriangle } from 'lucide-react';

// Importa o tipo do schema de propostas (para tipagem do frontend)
import { ProposalStatusEnum } from '../src/schemas/proposalSchema';
import ProposalModal from './ProposalModal'; // Componente de Modal a ser criado
import ProposalCard from './ProposalCard'; // Componente de Card a ser criado

// Definição da Interface (Baseada no Output do Backend)
interface Proposal {
    id: string;
    eventName: string;
    amount: number;
    status: z.infer<typeof ProposalStatusEnum>; // Tipagem Zod
    date: string; // Data string (YYYY-MM-DD)
    description?: string;
    client: { name: string }; // Incluído na query do Backend
}

// 1. Função de Fetch de Listagem
const fetchProposals = async (): Promise<Proposal[]> => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get('/api/proposals', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Mapeamento dos status para colunas Kanban
const kanbanColumns = [
    { id: 'Rascunho', title: 'Rascunho', color: 'bg-gray-100' },
    { id: 'Enviada', title: 'Enviada', color: 'bg-blue-100' },
    { id: 'Fechada', title: 'Fechada', color: 'bg-green-100' },
    { id: 'Perdida', title: 'Perdida', color: 'bg-red-100' },
];

export default function Proposals() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban'); // Estado para visualização
    
    // 2. Uso do React Query para Listagem
    const { data: proposals, isLoading, isError, error } = useQuery({
        queryKey: ['proposals'],
        queryFn: fetchProposals,
    });
    
    // Agrupa as propostas pelas colunas do Kanban
    const groupedProposals = proposals ? proposals.reduce((acc, proposal) => {
        const status = proposal.status as keyof typeof kanbanColumns;
        if (!acc[status]) acc[status] = [];
        acc[status].push(proposal);
        return acc;
    }, {} as Record<string, Proposal[]>) : {};


    if (isLoading) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" /> Carregando Propostas...</div>;
    if (isError) return <div className="p-8 text-center text-red-600"><AlertTriangle className="w-6 h-6 inline mr-2"/>Erro ao carregar dados: {(error as Error).message}</div>;

    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Funil de Propostas</h2>
                <div className='flex space-x-3'>
                    {/* Botões de Visualização */}
                    <button 
                        onClick={() => setViewMode('kanban')}
                        className={`p-2 rounded-md ${viewMode === 'kanban' ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Kanban className='w-5 h-5' />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <List className='w-5 h-5' />
                    </button>
                    
                    {/* Botão de Criação */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-md transition duration-150"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Nova Proposta
                    </button>
                </div>
            </header>
            
            {/* 3. Visualização Kanban (Principal) */}
            {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto">
                    {kanbanColumns.map(column => (
                        <div key={column.id} className={`${column.color} p-4 rounded-lg min-w-[300px] shadow-sm`}>
                            <h3 className="font-semibold text-lg mb-4 text-gray-700">{column.title} ({groupedProposals[column.id]?.length || 0})</h3>
                            <div className="space-y-3 min-h-[100px]">
                                {groupedProposals[column.id]?.map(proposal => (
                                    <ProposalCard key={proposal.id} proposal={proposal} /> 
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* 4. Modal de Criação */}
            <ProposalModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                currentProposal={null} // Passar null para criar um novo
            />
        </div>
    );
}

// **A ser implementado:** ProposalCard.tsx (O componente visual de cada item)
// **A ser implementado:** ProposalModal.tsx (O formulário RHF/Zod)