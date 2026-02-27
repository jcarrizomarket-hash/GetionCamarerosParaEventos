/**
 * Schemas de validación Zod para todos los DTOs de la aplicación
 *
 * Usar estos schemas en formularios del frontend y en los endpoints
 * del servidor para garantizar integridad de datos.
 */

import { z } from 'zod';

// ==================== CAMARERO ====================

export const CamareroSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  telefono: z.string().regex(/^\+?[0-9]{7,15}$/, 'Teléfono inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  disponibilidad: z.array(z.string()).default([]),
  comentarios: z.string().default(''),
});

export type CamareroDTO = z.infer<typeof CamareroSchema>;

// ==================== COORDINADOR ====================

export const CoordinadorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  telefono: z.string().regex(/^\+?[0-9]{7,15}$/, 'Teléfono inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  activo: z.boolean().default(true),
});

export type CoordinadorDTO = z.infer<typeof CoordinadorSchema>;

// ==================== CLIENTE ====================

export const ClienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  empresa: z.string().optional(),
  telefono: z.string().regex(/^\+?[0-9]{7,15}$/, 'Teléfono inválido').optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

export type ClienteDTO = z.infer<typeof ClienteSchema>;

// ==================== PEDIDO ====================

export const PedidoSchema = z.object({
  numero: z.string().min(1, 'El número de pedido es obligatorio'),
  cliente: z.string().min(1, 'El cliente es obligatorio'),
  lugar: z.string().min(1, 'El lugar es obligatorio'),
  diaEvento: z.string().min(1, 'La fecha del evento es obligatoria'),
  cantidadCamareros: z.number().int().positive('La cantidad debe ser un número positivo'),
  horaEntrada: z.string().optional(),
  horaSalida: z.string().optional(),
  comentarios: z.string().default(''),
});

export type PedidoDTO = z.infer<typeof PedidoSchema>;

// ==================== WHATSAPP ====================

export const EnviarWhatsAppSchema = z.object({
  telefono: z.string().regex(/^\+?[0-9]{7,15}$/, 'Teléfono inválido'),
  mensaje: z.string().min(1, 'El mensaje es obligatorio').max(4096, 'El mensaje es demasiado largo'),
});

export type EnviarWhatsAppDTO = z.infer<typeof EnviarWhatsAppSchema>;

// ==================== EMAIL ====================

export const EnviarEmailSchema = z.object({
  destinatario: z.string().email('Email del destinatario inválido'),
  cc: z.string().email('Email de CC inválido').optional().nullable(),
  asunto: z.string().min(1, 'El asunto es obligatorio'),
  mensaje: z.string().min(1, 'El mensaje es obligatorio'),
  parteHTML: z.string().min(1, 'El contenido HTML es obligatorio'),
  pedido: z.object({
    cliente: z.string(),
    fecha: z.string(),
    lugar: z.string(),
  }),
});

export type EnviarEmailDTO = z.infer<typeof EnviarEmailSchema>;

// ==================== HELPERS ====================

/**
 * Valida datos contra un schema Zod y retorna `{ ok, data, errors }`.
 * Útil para validar sin lanzar excepciones.
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { ok: boolean; data?: T; errors?: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || 'root';
    errors[key] = issue.message;
  }
  return { ok: false, errors };
}
