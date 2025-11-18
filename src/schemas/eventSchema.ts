// Caminho: MIL_EVENTOS/src/schemas/eventSchema.ts

import { z } from 'zod';

// Sub-schemas para os campos JSONB
export const checklistItemSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1, "A descrição da tarefa é obrigatória."),
  done: z.boolean().default(false),
});

export const timelineItemSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)."),
  title: z.string().min(1, "O título do cronograma é obrigatório."),
  desc: z.string().optional(),
});

// 1. Schema Base do Evento (Usado para Edição)
export const eventSchema = z.object({
    title: z.string().min(3, "O título do evento é obrigatório."),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido (YYYY-MM-DD)."),
    type: z.string().min(3, "O tipo de evento é obrigatório."),
    location: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    
    // As estruturas abaixo são tratadas como JSON no DB
    checklist: z.array(checklistItemSchema).optional(),
    timeline: z.array(timelineItemSchema).optional(),
});

export type EventInput = z.infer<typeof eventSchema>;

// 2. Schema para o PATCH de Checklist (Atualização específica)
export const checklistUpdateSchema = z.object({
    itemId: z.string().uuid(),
    done: z.boolean(),
});

export type ChecklistUpdateInput = z.infer<typeof checklistUpdateSchema>;