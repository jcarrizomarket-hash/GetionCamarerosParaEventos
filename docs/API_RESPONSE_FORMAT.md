# Formato Estandarizado de Respuestas API

## Estructura base

Todas las respuestas del servidor siguen el formato definido en
`src/supabase/functions/server/response-helpers.ts`:

```typescript
interface StandardApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId: string;
}
```

## Ejemplos

### Respuesta exitosa (200 OK)

```json
{
  "success": true,
  "data": { "id": "camarero:123", "nombre": "Juan", "apellido": "Pérez" },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "1705312200000-abc1234"
}
```

### Respuesta de error (4xx / 5xx)

```json
{
  "success": false,
  "error": "No autorizado. Header x-fn-secret inválido o ausente.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "1705312200000-def5678"
}
```

## Códigos HTTP

| Código | Significado | Cuándo usar |
|---|---|---|
| `200 OK` | Operación exitosa | GET, PUT exitosos |
| `201 Created` | Recurso creado | POST exitoso |
| `202 Accepted` | Operación asíncrona iniciada | Tareas en background |
| `400 Bad Request` | Datos de entrada inválidos | Validación fallida |
| `401 Unauthorized` | Sin autenticación | Token ausente o inválido |
| `403 Forbidden` | Sin autorización | Permisos insuficientes |
| `404 Not Found` | Recurso no encontrado | ID inexistente |
| `409 Conflict` | Conflicto de datos | Duplicado |
| `429 Too Many Requests` | Rate limit excedido | Abuso de API |
| `500 Internal Server Error` | Error del servidor | Error inesperado (reintentable) |

## Helpers disponibles

```typescript
import { jsonSuccess, jsonError } from './response-helpers.ts';

// En un handler Hono:
return jsonSuccess(c, data, 'Pedido creado', 201);
return jsonError(c, 'No encontrado', 404);
```

## Validación con schemas Zod

Usar los schemas de `src/utils/validation-schemas.ts` para validar
entrada del usuario antes de procesar la solicitud:

```typescript
import { validate, PedidoSchema } from '../../utils/validation-schemas';

const { ok, data, errors } = validate(PedidoSchema, rawInput);
if (!ok) {
  return c.json({ success: false, errors }, 400);
}
```
