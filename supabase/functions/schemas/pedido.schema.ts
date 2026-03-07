import { z } from 'npm:zod@3';

const AsignacionSchema = z.object({
  camareroId: z.string().min(1, 'El ID del camarero es requerido'),
  camareroNumero: z.number().int().positive(),
  camareroNombre: z.string().min(1),
  estado: z.enum(['pendiente', 'enviado', 'confirmado', 'no confirmado']),
  turno: z.union([z.literal(1), z.literal(2)]).optional(),
  horaEntrada: z.string().optional(),
  horaSalida: z.string().optional(),
});

export const PedidoSchema = z.object({
  id: z.string().min(1, 'El ID es requerido'),
  numero: z.string().min(1, 'El número de pedido es requerido'),
  cliente: z.string().min(1, 'El cliente es requerido'),
  lugar: z.string().min(1, 'El lugar es requerido'),
  ubicacion: z.string().optional(),
  diaEvento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe estar en formato YYYY-MM-DD'),
  cantidadCamareros: z.number().int().nonnegative('La cantidad debe ser un número no negativo'),
  horaEntrada: z.string().min(1, 'La hora de entrada es requerida'),
  horaSalida: z.string().optional(),
  totalHoras: z.string().optional(),
  cantidadCamareros2: z.number().int().nonnegative().optional(),
  horaEntrada2: z.string().optional(),
  horaSalida2: z.string().optional(),
  totalHoras2: z.string().optional(),
  catering: z.enum(['si', 'no']),
  tiempoViaje: z.string().optional(),
  camisa: z.enum(['blanca', 'negra']),
  asignaciones: z.array(AsignacionSchema),
  notas: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreatePedidoSchema = PedidoSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const UpdatePedidoSchema = PedidoSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });

export type PedidoInput = z.infer<typeof PedidoSchema>;
export type CreatePedidoInput = z.infer<typeof CreatePedidoSchema>;
export type UpdatePedidoInput = z.infer<typeof UpdatePedidoSchema>;
