// Caminho: MIL_EVENTOS/api/middlewares/authMiddleware.js

import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Função de Middleware para envolver as funções Serverless
export function protectedRoute(handler) {
  return async (req, res) => {
    // 1. Verificar o Header de Autorização
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // 2. Verificar o Token e Decodificar
      const decoded = jwt.verify(token, JWT_SECRET);

      // 3. Injetar o userId na requisição para Multi-tenant
      req.userId = decoded.userId;

      // 4. Prosseguir para o manipulador original (e.g., /api/proposals)
      return handler(req, res);

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado. Efetue login novamente.' });
      }
      return res.status(401).json({ message: 'Token inválido.' });
    }
  };
}