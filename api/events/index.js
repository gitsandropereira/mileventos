// Caminho: MIL_EVENTOS/api/events/index.js

import { protectedRoute } from '../../middlewares/authMiddleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function eventsListHandler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }
    
    const userId = req.userId;
    const { month, year } = req.query; // Filtros (opcionais)

    try {
        let dateFilter = {};
        
        // Se Month e Year forem fornecidos, cria um filtro de data
        if (month && year) {
            const startOfMonth = new Date(Number(year), Number(month) - 1, 1);
            const endOfMonth = new Date(Number(year), Number(month), 0); // Último dia do mês anterior

            dateFilter = {
                date: {
                    gte: startOfMonth, // Maior ou igual ao dia 1
                    lte: endOfMonth,   // Menor ou igual ao último dia
                },
            };
        }

        const events = await prisma.event.findMany({
            where: {
                user_id: userId,
                ...dateFilter, // Aplica o filtro
            },
            // Incluir informações básicas da proposta/cliente
            include: {
                proposal: {
                    select: { amount: true, client: { select: { name: true } } }
                }
            },
            orderBy: { date: 'asc' },
        });

        return res.status(200).json(events);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao buscar eventos.' });
    }
}

export default protectedRoute(eventsListHandler);