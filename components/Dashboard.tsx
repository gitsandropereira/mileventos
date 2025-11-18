
import React, { useState } from 'react';
import type { FinancialKPI, Event } from '../types';
import { SparklesIcon } from './icons';
import { extractProposalFromText } from '../services/geminiService';

interface DashboardProps {
  kpis: FinancialKPI[];
  events: Event[];
  onEventClick: (event: Event) => void;
  onMagicCreate: (data: any) => void;
  privacyMode: boolean;
}

const KPICard: React.FC<{ kpi: FinancialKPI; privacyMode: boolean }> = ({ kpi, privacyMode }) => {
  const changeColor = kpi.isPositive ? 'text-green-400' : 'text-red-400';
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-indigo-500/30 transition-shadow duration-300">
      <p className="text-sm text-gray-400">{kpi.label}</p>
      <p className="text-2xl font-bold text-white">
          {privacyMode && kpi.value.includes('R$') ? 'R$ ****' : kpi.value}
      </p>
      {kpi.change && <p className={`text-sm font-semibold ${changeColor}`}>{kpi.change}</p>}
    </div>
  );
};

const EventItem: React.FC<{event: Event; onClick: () => void}> = ({ event, onClick }) => {
  const typeColors = {
    'DJ': 'bg-purple-500',
    'Fotografia': 'bg-blue-500',
    'Decoração': 'bg-pink-500',
  }
  return (
    <li 
        onClick={onClick}
        className="flex items-center justify-between p-3 bg-gray-800 rounded-md mb-2 cursor-pointer hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-600"
    >
      <div>
        <p className="font-semibold text-white">{event.title}</p>
        <p className="text-sm text-gray-400">{event.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${typeColors[event.type as keyof typeof typeColors] || 'bg-gray-600'}`}>{event.type}</span>
    </li>
  );
};


const Dashboard: React.FC<DashboardProps> = ({ kpis, events, onEventClick, onMagicCreate, privacyMode }) => {
  const [magicInput, setMagicInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMagicSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!magicInput.trim()) return;

      setIsProcessing(true);
      try {
          const data = await extractProposalFromText(magicInput);
          onMagicCreate(data);
          setMagicInput('');
      } catch (error) {
          console.error(error);
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="space-y-6">
      {/* Magic Input Section */}
      <section className="bg-gradient-to-r from-indigo-900 to-purple-900 p-1 rounded-xl shadow-lg relative overflow-hidden">
          <div className="bg-gray-900/90 p-5 rounded-lg backdrop-blur-sm relative z-10">
              <div className="flex items-center mb-3 text-indigo-300">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  <h2 className="font-bold text-lg">Recebeu um pedido no Zap?</h2>
              </div>
              <form onSubmit={handleMagicSubmit}>
                  <textarea
                      value={magicInput}
                      onChange={(e) => setMagicInput(e.target.value)}
                      placeholder="Cole aqui a mensagem... (ex: 'Oi, sou a Carol, queria orçamento de DJ pro meu casamento dia 20/11')"
                      className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm mb-3 resize-none h-20"
                  />
                  <button 
                    type="submit" 
                    disabled={isProcessing || !magicInput}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center shadow-md"
                  >
                      {isProcessing ? (
                          <span className="animate-pulse">Processando com IA...</span>
                      ) : (
                          <>
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            Criar Proposta Mágica
                          </>
                      )}
                  </button>
              </form>
          </div>
          {/* Decorative bg elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-white">Visão Geral Financeira</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(kpi => <KPICard key={kpi.label} kpi={kpi} privacyMode={privacyMode} />)}
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4 text-white">Próximos Eventos</h2>
        <ul className="space-y-3">
          {events.slice(0, 4).map(event => (
            <EventItem key={event.id} event={event} onClick={() => onEventClick(event)} />
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Dashboard;