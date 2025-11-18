// Caminho: MIL_EVENTOS/src/schemas/profileSchema.ts

import { z } from 'zod';

// Enum para o tipo de chave PIX
export const PixKeyTypeEnum = z.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'EVP']);

// Schema de Perfil de Negócio (Baseado na entidade business_profiles)
export const profileSchema = z.object({
  name: z.string().min(3, "O nome da empresa é obrigatório."),
  category: z.string().min(3, "A categoria é obrigatória."),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Formato de telefone inválido (Ex: (XX) XXXX-XXXX)."),
  email: z.string().email("E-mail comercial inválido."),
  
  // Campos de PIX
  pixKeyType: PixKeyTypeEnum,
  pixKey: z.string().min(5, "A chave PIX é obrigatória."),
  
  // Campos Opcionais
  bio: z.string().max(500, "A Bio deve ter no máximo 500 caracteres.").optional(),
  instagram: z.string().optional(),
  website: z.string().url("O Website deve ser uma URL válida.").optional(),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Formato Hex Code inválido.").default('#4f46e5'),
});

export type ProfileInput = z.infer<typeof profileSchema>;