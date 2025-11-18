// Caminho: MIL_EVENTOS/components/Finance.tsx (Refatoração)
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    DollarSign, TrendingUp, TrendingDown, CheckCircle, Clock
} from 'lucide-react'; // Ícones Tailwind/Lucide

// Define a interface esperada do Backend (baseada no /api/finance/kpis.js)
interface KpisData {
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  monthlyGoal: number;
}

// 1. Função de Fetch (Chamada da API)
const fetchKpis = async (): Promise<KpisData> => {
  // O endpoint é /api/finance/kpis na Vercel
  const response = await axios.get('/api/finance/kpis', {
      headers: {
          // **IMPORTANTE:** Obtém o token armazenado após o login
          Authorization: `Bearer ${localStorage.getItem('authToken')}` 
      }
  });
  return response.data.kpis;
};

export default function Finance() {
  // 2. Uso do React Query
  const { data, isLoading, isError, error } = useQuery<KpisData, Error>({
    queryKey: ['financeKpis'], // Chave de cache
    queryFn: fetchKpis,
    // Configurações de cache
    staleTime: 5 * 60 * 1000, // Dados considerados "frescos" por 5 minutos
  });

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Carregando KPIs...</div>;
  }

  if (isError) {
    console.error("Erro ao buscar KPIs:", error.message);
    return <div className="p-6 text-center text-red-500">Erro: Não foi possível conectar ao financeiro.</div>;
  }
  
  // Destructuring com valores padrão seguros (opcional, mas bom para TS)
  const { totalRevenue = 0, totalPaid = 0, totalPending = 0, monthlyGoal = 0 } = data || {};

  // Função utilitária para formatação
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Lógica para cor da meta
  const goalAchieved = totalPaid >= monthlyGoal;
  const goalDifference = monthlyGoal - totalPaid;

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">📊 Painel Financeiro</h2>
      
      {/* Cards de KPIs (Tailwind CSS Styling) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Card: Receita Total */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Receita Total (Propostas + Pendentes)</p>
            <DollarSign className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold mt-1 text-gray-900">{formatCurrency(totalRevenue)}</p>
        </div>

        {/* Card: Total Pago */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Total Pago</p>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-extrabold mt-1 text-gray-900">{formatCurrency(totalPaid)}</p>
        </div>

        {/* Card: Total Pendente */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-amber-500">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Total Pendente</p>
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold mt-1 text-gray-900">{formatCurrency(totalPending)}</p>
        </div>

        {/* Card: Meta Mensal */}
        <div className={`p-6 rounded-lg shadow-md border-t-4 ${goalAchieved ? 'bg-green-50 border-green-700' : 'bg-red-50 border-red-700'}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Meta Mensal: {formatCurrency(monthlyGoal)}</p>
            {goalAchieved ? (
              <TrendingUp className="w-6 h-6 text-green-700" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-700" />
            )}
          </div>
          <p className={`text-xl font-bold mt-1 ${goalAchieved ? 'text-green-800' : 'text-red-800'}`}>
            {goalAchieved ? 'Meta Atingida!' : `Faltam ${formatCurrency(goalDifference)}`}
          </p>
        </div>

      </div>
      
      {/* Aqui você adicionaria a lista de Transações e Gráficos */}
      <div className="mt-8">
          {/* Componente para listar transações (GET /api/finance/transactions) */}
      </div>
    </div>
  );
}