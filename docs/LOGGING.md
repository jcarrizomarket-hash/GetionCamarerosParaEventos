# Estrategia de Logging

## Loggers disponibles

### Frontend (`src/utils/logger.ts`)

Logger singleton basado en clases con niveles `DEBUG | INFO | WARN | ERROR`.

```typescript
import { logger } from './utils/logger';

logger.debug('Mensaje de debug', { contexto: 'opcional' });
logger.info('Operación completada', { pedidoId: '123' });
logger.warn('Configuración faltante');
logger.error('Error crítico', error);
```

- En **desarrollo** (`DEV=true`): muestra todos los niveles.
- En **producción**: muestra solo `WARN` y `ERROR`.
- Soporta contexto persistente con `logger.setContext({ userId })`.

### Servidor Deno (`src/supabase/functions/server/logger.ts`)

Logger compatible con Deno que emite JSON estructurado.

```typescript
import { serverLogger } from './logger.ts';

serverLogger.info('Pedido creado', { pedidoId: '123', duration: 145 });
serverLogger.warn('Secret no configurado');
serverLogger.error('Error en BD', { error: err.message });
```

- Emite JSON válido: fácil de parsear con ELK, CloudWatch, Datadog, etc.
- Nivel mínimo configurable mediante `ENVIRONMENT=development`.

### Módulo `src/src/utils/logger.ts`

Logger estructurado para la capa `src/src/` (API client, utils compartidos).
Soporta contexto fijo por módulo con `logger.withContext({ module: 'api' })`.

## Niveles de log

| Nivel | Cuándo usar |
|---|---|
| `DEBUG` | Información de depuración detallada (solo desarrollo) |
| `INFO` | Eventos normales del sistema (pedido creado, usuario autenticado) |
| `WARN` | Situaciones inesperadas pero recuperables (config faltante, reintento) |
| `ERROR` | Errores que requieren atención (fallo de BD, error de red crítico) |

## Datos sensibles

Usar `maskSensitiveData()` de `src/utils/data-masking.ts` antes de loguear
objetos con datos personales. Ver `docs/SECURITY.md` para más detalles.

## Formato estructurado (servidor)

```json
{
  "level": "info",
  "message": "Pedido creado",
  "context": { "pedidoId": "123", "duration": 145 },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
