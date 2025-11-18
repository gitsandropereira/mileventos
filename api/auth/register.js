// Caminho: MIL_EVENTOS/api/auth/register.js

import { registerInputSchema } from '../../src/schemas/authSchema'; // Importando do novo caminho
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Para gerar o token após o registro

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'; // SECRET da Vercel ENV

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  try {
    // 1. Validação Zod
    const validatedData = registerInputSchema.parse(req.body);
    const { name, email, password } = validatedData;

    // 2. Checagem e Hashing
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Usuário já registrado.' });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Criação de Usuário e Perfil de Negócio (Transação)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        businessProfile: {
          create: {
            name: `${name}'s Company`,
            // ... inicializar outros campos obrigatórios (category, phone, etc.)
          },
        },
      },
      select: { id: true, name: true, email: true },
    });

    // 4. Geração de JWT para Login Imediato
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // 5. Resposta
    return res.status(201).json({
      message: 'Registro e login efetuados com sucesso.',
      token: token,
      user: { id: user.id, name: user.name, email: user.email },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Falha na validação dos dados.' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}