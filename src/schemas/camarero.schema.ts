import { z } from 'zod';

export const CamareroSchema = z.object({
  id: z.string().uuid(),
  numero: z.number().int().positive(),
  nombre: z.string().min(1, 'El nombre es requerido'),
  telefono: z.string()
    .regex(/^\+?[0-9]{7,15}$/, 'Número de teléfono inválido')
    .optional(),
  email: z.string().email('Email inválido').optional(),
  activo: z.boolean().default(true),
  notas: z.string().optional(),
  createdAt: z.string().optional(),
});

export const CreateCamareroSchema = CamareroSchema.omit({ id: true, createdAt: true });
export const UpdateCamareroSchema = CamareroSchema.omit({ id: true }).partial();

export type Camarero = z.infer<typeof CamareroSchema>;
export type CreateCamarero = z.infer<typeof CreateCamareroSchema>;
export type UpdateCamarero = z.infer<typeof UpdateCamareroSchema>;
