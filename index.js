// Caminho: MIL_EVENTOS/api/contacts/clients/index.js

import { protectedRoute } from '../../middlewares/authMiddleware';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { clientSchema } from '../../../src/schemas/clientSchema'; 

const prisma = new PrismaClient();

async function clientsHandler(req, res) {
  const userId = req.userId; // Injetado pelo protectedRoute

  if (req.method === 'POST') {
    // --- POST: Criar Cliente ---
    try {
      // 1. Zod Validation
      const validatedData = clientSchema.parse(req.body);
      
      // 2. Criação no Banco de Dados (com user_id)
      const client = await prisma.client.create({
        data: {
          user_id: userId,
          name: validatedData.name,
          phone: validatedData.phone || null, // Salva nulo se string vazia
          email: validatedData.email || null,
        },
        select: { id: true, name: true }, // Retorno simplificado
      });

      return res.status(201).json({ message: 'Cliente criado com sucesso.', client });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Dados inválidos.', errors: error.flatten().fieldErrors });
      }
      console.error(error);
      return res.status(500).json({ message: 'Erro ao criar cliente.' });
    }
  } 
  
  if (req.method === 'GET') {
    // --- GET: Listar Clientes (com otimização de contagem) ---
    try {
      // Otimização: Buscamos todos os clientes e usamos o count embutido do Prisma
      const clients = await prisma.client.findMany({
        where: { user_id: userId },
        orderBy: { name: 'asc' },
        // Inclui a contagem de Propostas relacionadas ao cliente (JOIN eficiente)
        include: {
          _count: {
            select: { proposals: true },
          },
        },
      });

      // Mapeamento para o formato esperado pelo Frontend (ClientOutput)
      const formattedClients = clients.map(client => ({
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        proposalsCount: client._count.proposals, // Mapeia o count para 'proposalsCount'
      }));

      return res.status(200).json(formattedClients);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao buscar clientes.' });
    }
  }

  // Se o método não for POST nem GET
  return res.status(405).json({ message: 'Método não permitido.' });
}

// Exporta a função protegida pelo Middleware
export default protectedRoute(clientsHandler);