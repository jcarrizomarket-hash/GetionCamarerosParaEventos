import { z } from 'zod';

export const CreateCoordinadorSchema = z.object({
  id: z.string(),
  numero: z.number().optional(),
  nombre: z.string(),
  telefono: z.string().optional().refine(v => !v || /^\+34\d{9}$/.test(v), 'Invalid Spanish phone number'),
  email: z.string().optional().refine(v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email'),
  activo: z.boolean().optional(),
  departamento: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const UpdateCoordinadorSchema = CreateCoordinadorSchema.partial();

export type CreateCoordinador = z.infer<typeof CreateCoordinadorSchema>;
export type UpdateCoordinador = z.infer<typeof UpdateCoordinadorSchema>;
