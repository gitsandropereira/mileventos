// Caminho: MIL_EVENTOS/api/events/[id].js

import { protectedRoute } from '../../middlewares/authMiddleware';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { checklistUpdateSchema } from '../../../src/schemas/eventSchema'; 

const prisma = new PrismaClient();

async function eventByIdHandler(req, res) {
    const userId = req.userId;
    const eventId = req.query.id; 

    if (req.method === 'GET') {
        // --- GET: Detalhes do Evento ---
        try {
            const event = await prisma.event.findFirst({
                where: { id: eventId, user_id: userId },
                // Incluir dados da proposta e cliente
                include: {
                    proposal: {
                        include: { client: true }
                    }
                }
            });

            if (!event) {
                return res.status(404).json({ message: 'Evento não encontrado.' });
            }
            return res.status(200).json(event);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar detalhes do evento.' });
        }
    }
    
    // Otimização para PATCH: Atualização de uma tarefa (Checklist)
    if (req.method === 'PATCH') {
        // --- PATCH: Atualizar Checklist Item Status ---
        try {
            const { itemId, done } = checklistUpdateSchema.parse(req.body);

            // 1. Busca o evento para obter o JSONB atual
            const event = await prisma.event.findFirst({
                where: { id: eventId, user_id: userId },
                select: { checklist: true }
            });

            if (!event || !event.checklist) {
                return res.status(404).json({ message: 'Evento ou checklist não encontrado.' });
            }
            
            // 2. Manipulação do Array JSONB no Node.js
            let checklist = event.checklist as any[]; // Type assertion para Array
            const itemIndex = checklist.findIndex(item => item.id === itemId);

            if (itemIndex === -1) {
                return res.status(404).json({ message: 'Item do checklist não encontrado.' });
            }

            // Atualiza o status 'done'
            checklist[itemIndex].done = done;

            // 3. Persistência da atualização no JSONB
            await prisma.event.updateMany({
                where: { id: eventId, user_id: userId },
                data: {
                    checklist: checklist, // Prisma sobrescreve o campo JSONB
                },
            });

            return res.status(200).json({ message: 'Item do checklist atualizado.', checklist });

        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: 'Dados de checklist inválidos.' });
            }
            console.error(error);
            return res.status(500).json({ message: 'Erro ao atualizar checklist.' });
        }
    }

    return res.status(405).json({ message: 'Método não permitido.' });
}

export default protectedRoute(eventByIdHandler);