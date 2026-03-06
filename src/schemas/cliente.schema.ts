import { z } from 'zod';

export const ClienteSchema = z.object({
  id: z.string().min(1, 'El ID es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido').max(150, 'El nombre no puede tener más de 150 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  notas: z.string().optional(),
  createdAt: z.string().optional(),
});

export const CreateClienteSchema = ClienteSchema.omit({ id: true, createdAt: true });

export const UpdateClienteSchema = ClienteSchema.partial().omit({ id: true, createdAt: true });

export type ClienteInput = z.infer<typeof ClienteSchema>;
export type CreateClienteInput = z.infer<typeof CreateClienteSchema>;
export type UpdateClienteInput = z.infer<typeof UpdateClienteSchema>;
