import { z } from 'zod';

// Main Pedido schema definition
const PedidoSchema = z.object({
  id: z.string().uuid(), // Assuming id is a UUID
  numero: z.string(),
  cliente: z.string(),
  lugar: z.string(),
  ubicacion: z.string(),
  diaEvento: z.date(),
  cantidadCamareros: z.number().int().positive(),
  horaEntrada: z.string(), // Assuming this will be a time string
  horaSalida: z.string(), // Assuming this will be a time string
  totalHoras: z.number().nonnegative(),
  cantidadCamareros2: z.number().int().positive().optional(),
  horaEntrada2: z.string().optional(),
  horaSalida2: z.string().optional(),
  totalHoras2: z.number().nonnegative().optional(),
  catering: z.string(),
  tiempoViaje: z.number().nonnegative(),
  camisa: z.string(),
  asignaciones: z.array(z.string()), // Assuming asignaciones is an array of strings
  notas: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Derived schemas
export const CreatePedidoSchema = PedidoSchema.omit({ id: true, updatedAt: true });
export const UpdatePedidoSchema = PedidoSchema.partial();

// TypeScript types
export type Pedido = z.infer<typeof PedidoSchema>;
export type CreatePedido = z.infer<typeof CreatePedidoSchema>;
export type UpdatePedido = z.infer<typeof UpdatePedidoSchema>;