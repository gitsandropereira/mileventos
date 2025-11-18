// Caminho: MIL_EVENTOS/src/schemas/clientSchema.ts

import { z } from 'zod';

// Schema para criação/atualização de Clientes
export const clientSchema = z.object({
  name: z.string().min(2, "O nome do cliente é obrigatório."),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Formato de telefone inválido (Ex: (XX) XXXX-XXXX).").optional().or(z.literal('')),
  email: z.string().email("E-mail inválido.").optional().or(z.literal('')),
});

export type ClientInput = z.infer<typeof clientSchema>;

// Tipo de dados de Output (incluindo dados do backend)
export interface ClientOutput extends ClientInput {
    id: string;
    proposalsCount: number; // Campo que será calculado no Backend
}