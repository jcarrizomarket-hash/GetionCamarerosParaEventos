# Política de Seguridad

## Reporte de Vulnerabilidades

Si descubres una vulnerabilidad de seguridad, por favor repórtala de forma responsable
abriendo un issue privado o contactando al equipo directamente. No abras issues públicos
para vulnerabilidades críticas.

## Gestión de Secrets

### Variables de entorno

| Variable | Descripción | Rotar cada |
|---|---|---|
| `VITE_SUPABASE_ANON_KEY` | Clave pública de Supabase | 90 días |
| `VITE_SUPABASE_FN_SECRET` | Secret para endpoints mutantes | 30 días |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo en servidor Deno | 90 días |
| `WHATSAPP_API_KEY` | API key de WhatsApp | 30 días |

### Reglas

- **NUNCA** commitear archivos `.env` al repositorio.
- Usar **Supabase Vault** para secrets críticos en producción (no archivos `.env`).
- Rotar secrets comprometidos inmediatamente.
- Ver `.env.example` para todas las variables requeridas.

## CORS

Los orígenes permitidos están definidos en `src/supabase/functions/server/index.tsx`
en la constante `ALLOWED_ORIGINS`. En producción, incluir solo dominios propios.

## Rate Limiting

- **General**: 100 requests/minuto por IP.
- Implementado en `src/supabase/functions/server/index.tsx`.
- Para mayor robustez en producción, usar Redis o el rate limiting de Supabase/Cloudflare.

## Headers de Seguridad HTTP

Los siguientes headers se aplican a todas las respuestas del servidor:

| Header | Valor |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |

## Datos Sensibles en Logs

Usar `maskSensitiveData()` de `src/utils/data-masking.ts` antes de loguear
objetos que contengan teléfonos, tokens, emails u otros datos sensibles.

## Dependencias

Ejecutar `npm run audit-vulnerabilities` regularmente para detectar dependencias
con vulnerabilidades conocidas.
