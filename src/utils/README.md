# Utils

Utilidades compartidas del frontend.

| Archivo | Descripción |
|---|---|
| `logger.ts` | Logger centralizado con niveles DEBUG/INFO/WARN/ERROR |
| `api-client.ts` | Clase `APIClient` browser-safe para llamadas al backend |
| `deduplicar.ts` | `deduplicarPorId`, `deduplicarPorClave` — deduplicación de arrays |
| `file-export.ts` | `exportToCSV`, `exportToJSON` — exportar datos desde el browser |

## Uso del logger

```typescript
import { logger } from './logger';
logger.info('mensaje');
logger.warn('advertencia', { contexto: 'valor' });
logger.error('error crítico', { message: error.message });
```

## Uso de file-export

```typescript
import { exportToCSV, exportToJSON } from './file-export';
exportToCSV(data, 'nombre-archivo'); // descarga nombre-archivo.csv
exportToJSON(data, 'nombre-archivo'); // descarga nombre-archivo.json
```
