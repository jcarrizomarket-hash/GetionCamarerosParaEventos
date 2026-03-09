import { z } from 'npm:zod@3';

export const ClienteSchema = z.object({
  id: z.string().min(1, 'El ID es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido').max(150),
  contacto1: z.string().optional(),
  contacto2: z.string().optional(),
  telefono1: z.string().optional(),
  telefono2: z.string().optional(),
  mail1: z.string().optional(),
  mail2: z.string().optional(),
  notas: z.string().optional(),
  // legacy fields
  email: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  createdAt: z.string().optional(),
});

export const CreateClienteSchema = ClienteSchema.omit({ id: true, createdAt: true });
export const UpdateClienteSchema = ClienteSchema.partial().omit({ id: true, createdAt: true });

export type ClienteInput = z.infer<typeof ClienteSchema>;
export type CreateClienteInput = z.infer<typeof CreateClienteSchema>;
export type UpdateClienteInput = z.infer<typeof UpdateClienteSchema>;
