// Caminho: MIL_EVENTOS/api/finance/kpis.js

import { protectedRoute } from '../middlewares/authMiddleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function kpisHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }
  
  const userId = req.userId; // user_id injetado pelo Middleware

  try {
    // 1. Query Otimizada: SUM por Status e Total (uma única chamada ao DB)
    const results = await prisma.transaction.groupBy({
        by: ['status'],
        _sum: {
            amount: true,
        },
        where: { user_id: userId }, // Filtro Multi-tenant obrigatório!
    });

    let totalPaid = 0;
    let totalPending = 0;

    // 2. Processar Resultados
    results.forEach(item => {
        const sum = item._sum.amount ? item._sum.amount.toNumber() : 0; // Converte Decimal do Prisma para Number
        if (item.status === 'PAID') {
            totalPaid = sum;
        } else if (item.status === 'PENDING') {
            totalPending = sum;
        }
        // Adicionar OVERDUE se necessário
    });
    
    // Calcular a Receita Total
    const totalRevenue = totalPaid + totalPending;

    // 3. Buscar Meta Mensal (Exemplo)
    const profile = await prisma.businessProfile.findUnique({
        where: { user_id: userId },
        select: { monthlyGoal: true }
    });
    const monthlyGoal = profile?.monthlyGoal?.toNumber() || 0;

    // 4. Resposta de Alta Performance
    return res.status(200).json({
      kpis: {
        totalRevenue,
        totalPaid,
        totalPending,
        monthlyGoal,
        // Você pode adicionar mais KPIs aqui (ex: count de transações)
      },
      message: 'KPIs calculados no servidor.'
    });

  } catch (error) {
    console.error("Erro ao calcular KPIs:", error);
    return res.status(500).json({ message: 'Erro interno ao calcular KPIs financeiros.' });
  }
}

// Exporta a função protegida
export default protectedRoute(kpisHandler);