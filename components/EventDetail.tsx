// Caminho: MIL_EVENTOS/components/EventDetail.tsx

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Check, Loader2, AlertTriangle, List, Clock, MapPin } from 'lucide-react';

// Assumindo a interface completa do Evento
interface EventDetail {
    id: string;
    title: string;
    date: string;
    location: string | null;
    checklist: Array<{ id: string; text: string; done: boolean }> | null; // Tipagem do JSONB
    timeline: Array<{ time: string; title: string }> | null;
    // ... outros campos e relações (proposal, client)
}

// 1. Fetch de Detalhes (GET /api/events/[id])
const fetchEventDetail = async (eventId: string): Promise<EventDetail> => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// 2. Mutation para Atualizar Checklist (PATCH /api/events/[id])
interface ChecklistPayload { itemId: string; done: boolean; }

const updateChecklistItem = async ({ eventId, payload }: { eventId: string, payload: ChecklistPayload }) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.patch(`/api/events/${eventId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Componente de Detalhes (Simulação)
export default function EventDetail({ eventId }: { eventId: string }) {
    const queryClient = useQueryClient();
    
    // Fetch de detalhes
    const { data: event, isLoading, isError } = useQuery<EventDetail, Error>({
        queryKey: ['eventDetail', eventId],
        queryFn: () => fetchEventDetail(eventId),
    });

    // Mutation para o checklist
    const checklistMutation = useMutation({
        mutationFn: updateChecklistItem,
        onSuccess: () => {
            // Invalida o cache do detalhe para forçar o componente a recarregar o novo JSONB
            queryClient.invalidateQueries({ queryKey: ['eventDetail', eventId] }); 
            // Opcional: Invalida a lista de eventos também
        },
        onError: (error) => {
            console.error(error);
            alert('Erro ao atualizar item do checklist.');
        },
    });

    // 3. Função Handler para o clique no checkbox
    const handleCheckToggle = (itemId: string, currentStatus: boolean) => {
        checklistMutation.mutate({
            eventId: eventId,
            payload: { itemId, done: !currentStatus }
        });
    };

    if (isLoading) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" /></div>;
    if (isError || !event) return <div className="p-8 text-center text-red-600">Erro ao carregar detalhes.</div>;

    return (
        <div className="p-6 bg-gray-50 max-w-4xl mx-auto rounded-xl shadow-lg">
            <h1 className="text-3xl font-extrabold text-indigo-700 mb-2">{event.title}</h1>
            <p className="text-lg font-medium text-gray-600 mb-6">{event.date} | {event.location || 'Local a definir'}</p>

            {/* Checklist */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center"><List className="w-5 h-5 mr-2 text-indigo-500"/> Checklist Operacional</h3>
                <div className="space-y-3">
                    {event.checklist && event.checklist.length > 0 ? (
                        event.checklist.map(item => (
                            <div 
                                key={item.id} 
                                className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition"
                                onClick={() => handleCheckToggle(item.id, item.done)}
                            >
                                <span className={item.done ? 'line-through text-gray-500' : 'text-gray-800'}>
                                    {item.text}
                                </span>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.done ? 'bg-green-500' : 'bg-gray-200'}`}>
                                    {item.done && <Check className="w-4 h-4 text-white" />}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">Nenhum item no checklist.</p>
                    )}
                    {checklistMutation.isPending && <p className="text-sm text-indigo-600 flex items-center"><Loader2 className="w-4 h-4 mr-1 animate-spin"/> Atualizando...</p>}
                </div>
            </div>

            {/* Timeline (Cronograma) */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center"><Clock className="w-5 h-5 mr-2 text-indigo-500"/> Cronograma</h3>
                <ol className="relative border-l border-gray-200 ml-4">
                    {event.timeline && event.timeline.map((item, index) => (
                        <li key={index} className="mb-4 ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-3 ring-4 ring-white">
                                <Clock className="w-3 h-3 text-indigo-600" />
                            </span>
                            <h4 className="text-lg font-semibold text-gray-900">{item.time} - {item.title}</h4>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                        </li>
                    ))}
                </ol>
            </div>
            
        </div>
    );
}