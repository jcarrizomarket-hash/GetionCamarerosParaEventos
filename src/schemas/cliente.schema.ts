import { z } from 'zod';

export const ClienteSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional(),
  telefono: z.string()
    .regex(/^\+?[0-9]{7,15}$/, 'Número de teléfono inválido')
    .optional(),
  direccion: z.string().optional(),
  notas: z.string().optional(),
  createdAt: z.string().optional(),
});

export const CreateClienteSchema = ClienteSchema.omit({ id: true, createdAt: true });
export const UpdateClienteSchema = ClienteSchema.omit({ id: true }).partial();

export type Cliente = z.infer<typeof ClienteSchema>;
export type CreateCliente = z.infer<typeof CreateClienteSchema>;
export type UpdateCliente = z.infer<typeof UpdateClienteSchema>;
