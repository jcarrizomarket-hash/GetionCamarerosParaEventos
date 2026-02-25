# Error Types Reference

Documentación centralizada de los tipos de errores esperados, formato de respuesta y guía de resolución de problemas.

## Formato de Respuesta de Error

Todos los endpoints del servidor retornan errores con el siguiente formato JSON:

```json
{
  "success": false,
  "error": "Descripción del error"
}
```

Para errores HTTP estándar, el código de estado HTTP refleja la categoría del error:

| Código | Categoría              | Descripción                                           |
|--------|------------------------|-------------------------------------------------------|
| 400    | Bad Request            | Parámetros faltantes o datos inválidos                |
| 401    | Unauthorized           | Token de autenticación ausente, inválido o expirado   |
| 403    | Forbidden              | El rol del usuario no tiene permiso para la operación |
| 404    | Not Found              | El recurso solicitado no existe                       |
| 429    | Too Many Requests      | Límite de tasa excedido                               |
| 500    | Internal Server Error  | Error inesperado en el servidor                       |

---

## Errores por Endpoint

### Autenticación (todos los endpoints)

| Error | Código HTTP | Causa | Solución |
|-------|-------------|-------|----------|
| `No autorizado. Header Authorization requerido.` | 401 | Header `Authorization` ausente | Incluir `Authorization: Bearer <token>` |
| `Token inválido.` | 401 | JWT malformado | Verificar que el token sea un JWT válido |
| `Token expirado. Por favor, inicie sesión nuevamente.` | 401 | Token JWT vencido | Recargar la página para renovar sesión |
| `Token inválido o sesión no encontrada.` | 401 | Token no reconocido por Supabase | Volver a iniciar sesión |
| `No autorizado. Header x-fn-secret inválido o ausente.` | 401 | Secret de función ausente o incorrecto | Incluir `x-fn-secret` con el valor correcto |
| `Acceso denegado. Se requiere uno de los roles: ...` | 403 | Rol insuficiente | Verificar permisos del usuario |

### Rate Limiting

| Error | Código HTTP | Causa | Solución |
|-------|-------------|-------|----------|
| `Too Many Requests` | 429 | Más de 200 req/min globales o 500 req/min por endpoint | Reducir frecuencia de peticiones |

---

### `GET /camareros`

| Respuesta JSON (campo `"error"`) | Mensaje de log del servidor                  | Causa                         |
|----------------------------------|-----------------------------------------------|-------------------------------|
| Mensaje de error interno del KV | `Error al obtener camareros: <detalle error>` | Fallo en lectura del KV store |

### `POST /camareros`

| Respuesta JSON (campo `"error"`) | Mensaje de log del servidor                 | Causa                          |
|----------------------------------|----------------------------------------------|--------------------------------|
| Mensaje de error interno del KV | `Error al crear camarero: <detalle error>`  | Fallo al escribir en KV store |

### `PUT /camareros/:id`

| Respuesta JSON (campo `"error"`) | Mensaje de log del servidor                     | Causa                                 |
|----------------------------------|--------------------------------------------------|---------------------------------------|
| Mensaje de error interno del KV | `Error al actualizar camarero: <detalle error>` | ID no encontrado o fallo de escritura |
### `DELETE /camareros/:id`

| Respuesta JSON (campo `"error"`) | Mensaje de log del servidor                   | Causa                          |
|----------------------------------|------------------------------------------------|-------------------------------|
| Mensaje de error interno del KV | `Error al eliminar camarero: <detalle error>` | Fallo al eliminar del KV store |

---

### `GET /pedidos`

| Respuesta JSON (campo `"error"`) | Mensaje de log del servidor                | Causa                         |
|----------------------------------|---------------------------------------------|-------------------------------|
| Mensaje de error interno del KV | `Error al obtener pedidos: <detalle error>` | Fallo en lectura del KV store |

### `POST /pedidos`

| Respuesta JSON (campo `"error"`) | Mensaje de log del servidor              | Causa                                |
|----------------------------------|-------------------------------------------|--------------------------------------|
| Mensaje de error interno del KV | `Error al crear pedido: <detalle error>` | Datos inválidos o fallo de escritura |

### `PUT /pedidos/:id`

| Respuesta JSON (campo `"error"`) | Mensaje de log del servidor                  | Causa                                 |
|----------------------------------|-----------------------------------------------|---------------------------------------|
| Mensaje de error interno del KV | `Error al actualizar pedido: <detalle error>` | ID no encontrado o fallo de escritura |

### `DELETE /pedidos/:id`

| Respuesta JSON (campo `"error"`) | Mensaje de log del servidor                | Causa                          |
|----------------------------------|---------------------------------------------|-------------------------------|
| Mensaje de error interno del KV | `Error al eliminar pedido: <detalle error>` | Fallo al eliminar del KV store |

---

### `GET /coordinadores`

| Respuesta JSON (campo `"error"`) | Mensaje de log del servidor                      | Causa                         |
|----------------------------------|---------------------------------------------------|-------------------------------|
| Mensaje de error interno del KV | `Error al obtener coordinadores: <detalle error>` | Fallo en lectura del KV store |

### `POST /coordinadores`

| Respuesta JSON (campo `"error"`) | Mensaje de log del servidor                  | Causa                                |
|----------------------------------|-----------------------------------------------|--------------------------------------|
| Mensaje de error interno del KV | `Error al crear coordinador: <detalle error>` | Datos inválidos o fallo de escritura |

---

### `GET /clientes`

| Respuesta JSON (campo `"error"`) | Mensaje de log del servidor                | Causa                         |
|----------------------------------|---------------------------------------------|-------------------------------|
| Mensaje de error interno del KV | `Error al obtener clientes: <detalle error>` | Fallo en lectura del KV store |

### `POST /clientes`

| Respuesta JSON (campo `"error"`) | Mensaje de log del servidor              | Causa                                |
|----------------------------------|-------------------------------------------|--------------------------------------|
| Mensaje de error interno del KV | `Error al crear cliente: <detalle error>` | Datos inválidos o fallo de escritura |

---

### `POST /enviar-parte`

Envía un parte de servicio por WhatsApp y/o Email.

**Parámetros requeridos:** `eventoId`, al menos uno de `clienteEmail` o `clienteTelefono`, `mensaje`

| Error | Causa |
|-------|-------|
| `WhatsApp no configurado` | Variables de entorno `WHATSAPP_API_KEY` / `WHATSAPP_PHONE_ID` ausentes |
| `Error en envío por WhatsApp: ...` | Fallo en API de WhatsApp (Meta Graph API) |
| `Error en envío por Email: ...` | Fallo en servicio de email (Resend) |
| `No se pudo enviar el parte por ningún canal` | Ambos canales fallaron |

---

### `POST /chat-evento`

Persiste un mensaje en el chat de un evento específico.

**Parámetros requeridos:** `eventoId` (string), `mensaje` (objeto plano)

| Respuesta JSON (campo `"error"`) | Código HTTP | Causa |
|----------------------------------|-------------|-------|
| `eventoId y mensaje son requeridos` | 400 | Cuerpo de la petición incompleto |
| `mensaje debe ser un objeto` | 400 | `mensaje` es un string, array u otro tipo no-objeto |
| Mensaje de error interno del KV | 500 | Fallo en KV store |

---

### `POST /chat-mensajes`

Persiste un mensaje en un chat grupal.

**Parámetros requeridos:** `chatId`, `id` (en el objeto mensaje)

| Respuesta JSON (campo `"error"`) | Mensaje de log del servidor                     | Causa        |
|----------------------------------|--------------------------------------------------|--------------|
| Mensaje de error interno del KV | `Error al crear mensaje en chat: <detalle error>` | Fallo en KV store |

### `GET /chat-mensajes/:chatId`

| Respuesta JSON (campo `"error"`) | Mensaje de log del servidor                        | Causa                         |
|----------------------------------|-----------------------------------------------------|-------------------------------|
| Mensaje de error interno del KV | `Error al obtener mensajes del chat: <detalle error>` | Fallo en lectura del KV store |

---

### `POST /enviar-email`
| Error | Causa |
|-------|-------|
| `Email service not configured` | Variable `RESEND_API_KEY` ausente |
| Error HTTP de Resend | Credenciales inválidas o límite de envío alcanzado |

### `POST /enviar-whatsapp`
| Error | Causa |
|-------|-------|
| `WhatsApp no configurado` | Variables de entorno de WhatsApp ausentes |
| Error HTTP de Meta Graph API | Credenciales inválidas o número no registrado |

---

## Códigos de Error de la Aplicación Frontend

Los componentes React utilizan el `ErrorBoundary` global para capturar errores no manejados.
En caso de error en un componente:

1. Se muestra una UI de fallback con el mensaje de error
2. El error se registra en consola con contexto `[ErrorBoundary]`
3. El usuario puede pulsar **Reintentar** para intentar recuperar el componente

---

## Guía de Resolución de Problemas

### El frontend muestra pantalla en blanco
→ Verificar consola del navegador para errores de JavaScript.
→ El `ErrorBoundary` debería capturar y mostrar el error. Si no lo hace, es un error fuera del árbol de React.

### Error 401 persistente
1. Recargar la página (renueva el token de autenticación)
2. Verificar que `VITE_SUPABASE_PROJECT_ID` y `VITE_SUPABASE_ANON_KEY` estén correctamente configurados
3. Verificar que `SUPABASE_FN_SECRET` coincida entre frontend y servidor

### Error 500 en operaciones de datos
1. Verificar logs del servidor en el panel de Supabase Edge Functions
2. Revisar estado del KV store (`/make-server-25b11ac0/limpiar-datos` para diagnóstico)
3. Comprobar que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén configurados en la función

### Envío de emails no funciona
1. Verificar que `RESEND_API_KEY` esté configurado en el entorno de la Edge Function
2. Comprobar los logs de Resend en su panel de control
3. Verificar que el dominio remitente esté verificado en Resend

### Envío de WhatsApp no funciona
1. Verificar `WHATSAPP_API_KEY` y `WHATSAPP_PHONE_ID` en el entorno
2. Comprobar que el número de teléfono tenga formato correcto (sin `+`, con código de país: `34XXXXXXXXX`)
3. Revisar límites y estado del número en Meta Business Manager

---

## Logging

El sistema utiliza `src/utils/logger.ts` para logging estructurado.

```typescript
import { logger } from '../utils/logger';
const log = logger.forContext('MiComponente');

log.info('Operación completada', { id, resultado });
log.error('Error al procesar', error);
```

En **desarrollo**: los logs se emiten con `console.debug/info/warn/error` con prefijo de contexto.
En **producción**: los logs se emiten como JSON estructurado para facilitar el análisis.
