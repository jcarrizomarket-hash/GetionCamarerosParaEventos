import { z } from 'zod';

export const CreateCoordinadorSchema = z.object({
  id: z.string(),
  numero: z.number().optional(),
  nombre: z.string(),
  telefono: z.string().regex(/^\+34\d{9}$/, 'Invalid Spanish phone number').optional(),
  email: z.string().email().optional(),
  activo: z.boolean().optional(),
  departamento: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const UpdateCoordinadorSchema = CreateCoordinadorSchema.partial();

export type CreateCoordinador = z.infer<typeof CreateCoordinadorSchema>;
export type UpdateCoordinador = z.infer<typeof UpdateCoordinadorSchema>;
