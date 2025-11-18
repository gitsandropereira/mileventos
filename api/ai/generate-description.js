// Caminho: MIL_EVENTOS/api/ai/generate-description.js

import { protectedRoute } from '../middlewares/authMiddleware';
import { GoogleGenAI } from '@google/genai'; // Assumindo esta importação, substitua se necessário
import { z } from 'zod';

// Zod Schema para validar o INPUT da IA (O que o Frontend envia)
const aiInputSchema = z.object({
  eventName: z.string().min(3),
  clientName: z.string().min(2),
  type: z.string().min(3), // Ex: 'Fotografia', 'DJ', 'Buffet'
  // Adicionar o user_id para contexto do perfil de negócio (opcional, mas bom)
});

// Acessa a chave de ambiente protegida
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

if (!GEMINI_API_KEY) {
    console.error("Erro: GEMINI_API_KEY não configurada.");
}

// Inicializa o cliente Gemini
const ai = new GoogleGenAI(GEMINI_API_KEY);

// Handler principal para a geração de descrição
async function generateDescriptionHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  // 1. Validar Payload
  try {
    const validatedData = aiInputSchema.parse(req.body);
    const { eventName, clientName, type } = validatedData;
    
    // Opcional: Buscar dados do Business Profile (themeColor, contractTerms) para personalizar a descrição.
    const userId = req.userId;
    // const profile = await prisma.businessProfile.findUnique({ where: { user_id: userId } });
    
    // 2. Criar o Prompt (Prompt Engineering)
    const prompt = `Gere uma descrição atraente e profissional para a proposta de serviço de ${type} para o evento "${eventName}" do cliente ${clientName}. O tom deve ser formal, mas inspirador, destacando a qualidade e a singularidade. Limite a resposta a 4 parágrafos curtos.`;

    // 3. Chamada à API Gemini
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Modelo de alta performance e baixo custo
        contents: prompt,
        config: {
            // Configurações de temperatura, etc.
            temperature: 0.7, 
        }
    });

    // 4. Retornar Resultado
    const generatedText = response.text.trim();

    if (!generatedText) {
         return res.status(500).json({ message: 'A IA não conseguiu gerar a descrição.' });
    }

    return res.status(200).json({ description: generatedText });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados de entrada para IA inválidos.' });
    }
    console.error("Erro na integração Gemini:", error);
    return res.status(500).json({ message: 'Erro interno na geração de descrição pela IA.' });
  }
}

// Exporta a função protegida
export default protectedRoute(generateDescriptionHandler);