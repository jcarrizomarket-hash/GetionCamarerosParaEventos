import { z } from 'npm:zod@3';

export const CamareroSchema = z.object({
  id: z.string().min(1, 'El ID es requerido'),
  numero: z.number().int().positive('El número debe ser positivo'),
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede tener más de 100 caracteres'),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  activo: z.boolean(),
  notas: z.string().optional(),
  createdAt: z.string().optional(),
});

export const CreateCamareroSchema = CamareroSchema.omit({ id: true, numero: true, createdAt: true });

export const UpdateCamareroSchema = CamareroSchema.partial().omit({ id: true, numero: true, createdAt: true });

export type CamareroInput = z.infer<typeof CamareroSchema>;
export type CreateCamareroInput = z.infer<typeof CreateCamareroSchema>;
export type UpdateCamareroInput = z.infer<typeof UpdateCamareroSchema>;
