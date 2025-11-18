// Caminho: MIL_EVENTOS/api/auth/login.js

import { loginInputSchema } from '../../src/schemas/authSchema';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'; // SECRET da Vercel ENV

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  try {
    // 1. Validação Zod
    const { email, password } = loginInputSchema.parse(req.body);

    // 2. Busca e Comparação
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 3. Geração de JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Resposta
    return res.status(200).json({
      message: 'Login efetuado com sucesso.',
      token: token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    // Tratamento de erro específico para validação Zod
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados de login inválidos.' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}