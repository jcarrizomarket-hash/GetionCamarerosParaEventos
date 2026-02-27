# Monitoring Setup - GetionCamarerosParaEventos

Guía de configuración de dashboards, alertas y métricas.

## 1. Métricas Importantes

### Métricas de Aplicación

| Métrica | Umbral Normal | Alerta |
|---------|---------------|--------|
| Tiempo de respuesta API | < 500ms | > 2000ms |
| Tasa de errores 5xx | < 1% | > 5% |
| Rate limit alcanzado | < 5% de requests | > 20% |
| Intentos de auth fallidos | < 10/hora | > 50/hora |
| Registros en error_logs | < 10/hora | > 100/hora |

### Métricas de Base de Datos

| Métrica | Umbral Normal | Alerta |
|---------|---------------|--------|
| Conexiones activas | < 80% del máximo | > 90% |
| Tiempo de query | < 100ms | > 1000ms |
| Tamaño de tablas | - | Crecimiento > 20%/semana |

## 2. Configuración de Alertas

### Supabase Dashboard

1. Ir a **Supabase Dashboard > Settings > Alerts**
2. Configurar alertas para:
   - Database CPU > 80%
   - Database connections > 80%
   - Edge Function errors > threshold

### Sentry (Tracking de Errores)

```typescript
// En src/main.tsx (opcional)
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Slack Webhook (Alertas)

Configurar en `SLACK_WEBHOOK` como GitHub Secret y usar en workflows:

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 3. Dashboard SQL (Supabase)

Guardar estas queries como vistas en Supabase para monitoreo:

### Errores por Severidad (últimas 24h)

```sql
SELECT 
  severity,
  COUNT(*) as count,
  MAX(created_at) as last_occurrence
FROM error_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND resolved = FALSE
GROUP BY severity
ORDER BY 
  CASE severity 
    WHEN 'critical' THEN 1
    WHEN 'error' THEN 2
    WHEN 'warning' THEN 3
    ELSE 4
  END;
```

### Actividad de Audit Trail (últimas 24h)

```sql
SELECT 
  table_name,
  operation,
  COUNT(*) as count,
  COUNT(DISTINCT changed_by) as unique_users
FROM audit_trail
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY table_name, operation
ORDER BY count DESC;
```

### Top 10 IPs con más actividad

```sql
SELECT 
  ip_address,
  COUNT(*) as request_count,
  MAX(created_at) as last_seen
FROM audit_trail
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
ORDER BY request_count DESC
LIMIT 10;
```

## 4. Logs de Funciones Supabase

```bash
# Ver logs en tiempo real
supabase functions logs make-server-25b11ac0 --scroll

# Filtrar por nivel de error
supabase functions logs make-server-25b11ac0 | grep '"level":"error"'
```

## 5. Health Check Automatizado

Agregar al CI (`.github/workflows/ci.yml`):

```yaml
- name: Health Check
  run: |
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${{ vars.APP_URL }}/api/health)
    if [ "$STATUS" != "200" ]; then
      echo "Health check failed: $STATUS"
      exit 1
    fi
```

## 6. Rotación Automática de Logs

Agregar un cron job en Supabase:

```sql
-- Limpiar error_logs resueltos más antiguos de 90 días
SELECT cron.schedule(
  'cleanup-resolved-errors',
  '0 2 * * *', -- Cada día a las 2am
  $$
    DELETE FROM error_logs 
    WHERE resolved = TRUE 
      AND resolved_at < NOW() - INTERVAL '90 days';
  $$
);

-- Archivar audit_trail más antiguo de 365 días
SELECT cron.schedule(
  'archive-old-audit-trail',
  '0 3 * * 0', -- Cada domingo a las 3am
  $$
    DELETE FROM audit_trail 
    WHERE created_at < NOW() - INTERVAL '365 days';
  $$
);
```
