// Caminho: MIL_EVENTOS/components/Agenda.tsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Calendar, Loader2, AlertTriangle, Clock } from 'lucide-react';

// Assumindo a interface simplificada do Evento (para listagem)
interface EventListItem {
    id: string;
    title: string;
    date: string; // ISO Date string do DB
    type: string;
    proposal: { client: { name: string } };
}

// 1. Função de Fetch com Filtro
const fetchEventsByMonth = async (month: number, year: number): Promise<EventListItem[]> => {
    const token = localStorage.getItem('authToken');
    // Chama o endpoint com os parâmetros de filtro (query params)
    const response = await axios.get(`/api/events?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export default function Agenda() {
    // 2. Estado de Filtro: Mês e Ano
    const [currentDate, setCurrentDate] = useState(new Date());
    const month = currentDate.getMonth() + 1; // JS months são 0-11
    const year = currentDate.getFullYear();

    // 3. Uso do React Query: Chave de Cache Dinâmica
    const { data: events, isLoading, isError, error } = useQuery<EventListItem[], Error>({
        queryKey: ['events', month, year], // Recarrega sempre que o mês ou ano mudar
        queryFn: () => fetchEventsByMonth(month, year),
        staleTime: 5 * 60 * 1000, // Cache de 5 minutos
    });

    const goToPreviousMonth = () => {
        setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() - 1)));
    };
    const goToNextMonth = () => {
        setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + 1)));
    };
    
    // Função utilitária para formatar o mês
    const formatMonth = (date: Date) => date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    if (isLoading) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" /> Carregando Agenda...</div>;
    if (isError) return <div className="p-8 text-center text-red-600"><AlertTriangle className="w-6 h-6 inline mr-2"/>Erro ao carregar agenda.</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center"><Calendar className="mr-3"/> Agenda de Eventos</h2>
            
            {/* 4. Navegação do Calendário */}
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-t-lg border-b">
                <button onClick={goToPreviousMonth} className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 rounded-md font-semibold text-indigo-700">← Anterior</button>
                <span className="text-xl font-bold text-gray-800">{formatMonth(currentDate)}</span>
                <button onClick={goToNextMonth} className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 rounded-md font-semibold text-indigo-700">Próximo →</button>
            </div>
            
            {/* 5. Listagem de Eventos do Mês */}
            <div className="bg-white rounded-b-lg shadow-lg divide-y divide-gray-100">
                {events && events.length > 0 ? (
                    events.map(event => (
                        <div key={event.id} className="p-4 hover:bg-indigo-50 transition duration-150 cursor-pointer flex justify-between items-center" 
                             onClick={() => alert(`Abrir detalhes do evento ${event.title}`)}> 
                            <div>
                                <p className="text-lg font-semibold text-gray-900">{event.title} ({event.type})</p>
                                <p className="text-sm text-gray-600">Cliente: {event.proposal.client.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-medium text-indigo-600">{new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                {/* Implementar a hora de início se houver */}
                                <p className="text-xs text-gray-500 flex items-center justify-end mt-0.5"><Clock className="w-3 h-3 mr-1"/> Horário: N/A</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-6 text-center text-gray-500">Nenhum evento agendado para este mês.</div>
                )}
            </div>
        </div>
    );
}