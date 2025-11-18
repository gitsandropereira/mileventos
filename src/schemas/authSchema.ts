// Caminho: MIL_EVENTOS/src/schemas/authSchema.ts

import { z } from 'zod';

// Zod Schema para Login (usado no Front e Back)
export const loginInputSchema = z.object({
  email: z.string().email("Formato de e-mail inválido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
});

// Zod Schema para Registro (usado no Front e Back)
export const registerInputSchema = loginInputSchema.extend({
  name: z.string().min(2, "O nome é obrigatório."),
});

// Tipos Inferidos (para uso no Frontend TypeScript)
export type LoginInput = z.infer<typeof loginInputSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;