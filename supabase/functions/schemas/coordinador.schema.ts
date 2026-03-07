import { z } from 'npm:zod@3';

export const CoordinadorSchema = z.object({
  id: z.string().min(1, 'El ID es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede tener más de 100 caracteres'),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  activo: z.boolean().optional(),
  createdAt: z.string().optional(),
});

export const CreateCoordinadorSchema = CoordinadorSchema.omit({ id: true, createdAt: true });

export const UpdateCoordinadorSchema = CoordinadorSchema.partial().omit({ id: true, createdAt: true });

export type CoordinadorInput = z.infer<typeof CoordinadorSchema>;
export type CreateCoordinadorInput = z.infer<typeof CreateCoordinadorSchema>;
export type UpdateCoordinadorInput = z.infer<typeof UpdateCoordinadorSchema>;
