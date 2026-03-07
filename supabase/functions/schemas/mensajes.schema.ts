import { z } from 'npm:zod@3';

export const MensajeSchema = z.object({
  id: z.string().min(1, 'El ID es requerido'),
  chatId: z.string().min(1, 'El ID del chat es requerido'),
  autorId: z.string().min(1, 'El ID del autor es requerido'),
  autorNombre: z.string().min(1, 'El nombre del autor es requerido'),
  contenido: z.string().min(1, 'El contenido no puede estar vacío').max(2000, 'El mensaje no puede superar 2000 caracteres'),
  tipo: z.enum(['texto', 'imagen', 'sistema']).default('texto'),
  createdAt: z.string().optional(),
});

export const CreateMensajeSchema = MensajeSchema.omit({ id: true, createdAt: true });

export type MensajeInput = z.infer<typeof MensajeSchema>;
export type CreateMensajeInput = z.infer<typeof CreateMensajeSchema>;
