import { z, ZodSchema } from 'zod';

// Validation schema for Camarero
export const CamareroSchema = z.object({
    id: z.string().uuid(),
    nombre: z.string().min(1),
    apellido: z.string().min(1),
    email: z.string().email(),
    telefono: z.string().optional(),
});

// Validation schema for Pedido
export const PedidoSchema = z.object({
    id: z.string().uuid(),
    camareroId: z.string().uuid(),
    clienteId: z.string().uuid(),
    fecha: z.date(),
    total: z.number().positive(),
});

// Validation schema for Coordinador
export const CoordinadorSchema = z.object({
    id: z.string().uuid(),
    nombre: z.string().min(1),
    email: z.string().email(),
});

// Validation schema for Cliente
export const ClienteSchema = z.object({
    id: z.string().uuid(),
    nombre: z.string().min(1),
    apellido: z.string().min(1),
    email: z.string().email(),
    telefono: z.string().optional(),
});

// Helper function to validate against a schema
export const validate = <T>(schema: ZodSchema<T>, data: unknown): T => {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new Error('Validation failed: ' + JSON.stringify(result.error.issues));
    }
    return result.data;
};