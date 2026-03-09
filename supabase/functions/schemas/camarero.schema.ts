import { z } from 'npm:zod@3';

export const CamareroSchema = z.object({
  id: z.string().min(1, 'El ID es requerido'),
  numero: z.number().int().positive('El número debe ser positivo'),
  codigo: z.string().optional(),
  tipoPerfil: z.string().optional().default('CAM'),
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  apellido: z.string().optional().default(''),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  estado: z.string().optional().default('activo'),
  especialidades: z.array(z.any()).optional().default([]),
  experiencia: z.string().optional(),
  coordinadorId: z.string().optional(),
  comentarios: z.string().optional(),
  idiomas: z.array(z.any()).optional().default([]),
  otrosIdiomas: z.string().optional(),
  certificaciones: z.array(z.any()).optional().default([]),
  otrasCertificaciones: z.string().optional(),
  disponibilidad: z.array(z.any()).optional().default([]),
  activo: z.boolean().optional(),
  notas: z.string().optional(),
  createdAt: z.string().optional(),
});

export const CreateCamareroSchema = CamareroSchema.omit({ id: true, numero: true, createdAt: true });
export const UpdateCamareroSchema = CamareroSchema.partial().omit({ id: true, numero: true, createdAt: true });

export type CamareroInput = z.infer<typeof CamareroSchema>;
export type CreateCamareroInput = z.infer<typeof CreateCamareroSchema>;
export type UpdateCamareroInput = z.infer<typeof UpdateCamareroSchema>;
