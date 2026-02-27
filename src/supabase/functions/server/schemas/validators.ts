/**
 * Centralized Zod validation schemas
 * Single source of truth for all data validation
 */

import { z } from 'npm:zod@3.22.4';

export const CamareroSchema = z.object({
  nombre: z.string().min(1).max(100),
  apellido: z.string().min(1).max(100),
  email: z.string().email().optional(),
  telefono: z.string().max(20).optional(),
  tipo_perfil: z.enum(['CAM', 'COC', 'PIC', 'AZA']).optional(),
  activo: z.boolean().default(true),
});

export const PedidoSchema = z.object({
  cliente_id: z.string().uuid(),
  fecha: z.string().datetime(),
  num_camareros: z.number().int().min(1).max(100),
  descripcion: z.string().max(2000).optional(),
  estado: z.enum(['pendiente', 'confirmado', 'completado', 'cancelado']).default('pendiente'),
});

export const CoordinadorSchema = z.object({
  nombre: z.string().min(1).max(100),
  email: z.string().email(),
  telefono: z.string().max(20).optional(),
  activo: z.boolean().default(true),
});

export const ClienteSchema = z.object({
  nombre: z.string().min(1).max(200),
  email: z.string().email().optional(),
  telefono: z.string().max(20).optional(),
  direccion: z.string().max(500).optional(),
});

export type Camarero = z.infer<typeof CamareroSchema>;
export type Pedido = z.infer<typeof PedidoSchema>;
export type Coordinador = z.infer<typeof CoordinadorSchema>;
export type Cliente = z.infer<typeof ClienteSchema>;
