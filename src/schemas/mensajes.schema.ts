import { z } from 'zod';

/**
 * Schema de validación para Mensajes
 */

export const MensajeSchema = z.object({
  telefono: z.string()
    .regex(/^(\\+?34|0034|34)?[6789]\d{8}$/, 'Teléfono español inválido'),
  
  mensaje: z.string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(4096, 'El mensaje es demasiado largo'),
  
  tipo: z.enum(['whatsapp', 'email', 'sms'], {
    errorMap: () => ({ message: 'Tipo debe ser whatsapp, email o sms' })
  }),
  
  timestamp: z.string()
    .datetime('Timestamp inválido')
    .optional(),
  
  estado: z.enum(['pendiente', 'enviado', 'fallido', 'entregado'])
    .optional(),
  
  id: z.string().optional()
});

export const CreateMensajeSchema = MensajeSchema.omit({
  id: true,
  timestamp: true,
  estado: true
});

export type Mensaje = z.infer<typeof MensajeSchema>;
export type CreateMensaje = z.infer<typeof CreateMensajeSchema>;