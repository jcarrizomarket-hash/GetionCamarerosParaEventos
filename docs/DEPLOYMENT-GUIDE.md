# Deployment Guide - GetionCamarerosParaEventos

Guía paso a paso para desplegar la aplicación en producción.

## Prerrequisitos

- Node.js 18.x o 20.x
- Cuenta en Supabase con proyecto configurado
- GitHub Actions habilitado en el repositorio

## 1. Configuración Inicial

### Variables de Entorno

Crear archivo `.env.production` (nunca commitear):

```bash
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_SUPABASE_PROJECT_ID=<project-id>
```

### GitHub Secrets

Configurar en **Settings > Secrets and variables > Actions**:

| Secret | Descripción | Cómo obtener |
|--------|-------------|--------------|
| `SUPABASE_TOKEN` | Token de acceso Supabase CLI | `supabase login` → Settings |
| `SUPABASE_PROJECT_REF` | ID del proyecto | Dashboard de Supabase |
| `SUPABASE_FN_SECRET` | Secret para funciones | Generar: `openssl rand -hex 32` |
| `SLACK_WEBHOOK` | Notificaciones Slack | Crear app en Slack |
| `SENTRY_DSN` | Tracking de errores | Nuevo proyecto en Sentry |

## 2. Despliegue de Base de Datos

### Aplicar Migraciones

```bash
# Instalar Supabase CLI
npm install -g supabase

# Autenticarse
supabase login

# Vincular proyecto
supabase link --project-ref <project-id>

# Aplicar migraciones en orden
supabase db push
```

O manualmente en el SQL Editor de Supabase:

```
001-create-audit-trail.sql
002-create-error-logs.sql
003-create-rls-policies.sql
004-create-indexes.sql
```

### Verificar Migraciones

```sql
-- Verificar que las tablas existen
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar RLS habilitado
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public';
```

## 3. Despliegue de Funciones Supabase

```bash
# Desplegar funciones del servidor
supabase functions deploy make-server-25b11ac0 \
  --project-ref <project-id>

# Configurar variables de entorno de las funciones
supabase secrets set SUPABASE_FN_SECRET=<valor-secreto> \
  --project-ref <project-id>
```

## 4. Build y Despliegue del Frontend

```bash
# Instalar dependencias
npm ci

# Verificar tipo
npm run type-check

# Build de producción
npm run build

# Los archivos en dist/ se despliegan en tu hosting
```

### Hosting Recomendado

- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod --dir=dist`
- **Cloudflare Pages**: vía GitHub Actions

## 5. Verificación Post-Deployment

```bash
# Verificar que la app responde
curl -I https://tu-dominio.com

# Verificar headers de seguridad
curl -s -D - https://tu-dominio.com/api/health | grep -E "X-|Content-Security"

# Test smoke básico
npx playwright test --grep "@smoke"
```

## 6. Rollback

### Rollback de Frontend

```bash
# Vercel
vercel rollback

# Netlify
netlify rollback
```

### Rollback de Base de Datos

```bash
# Crear snapshot antes de migrar
supabase db dump -f backup-$(date +%Y%m%d).sql

# Revertir migración específica
supabase db reset --db-url <connection-string>
```

### Rollback de Funciones

```bash
# Ver versiones anteriores
supabase functions list

# Redeployar versión específica desde git
git checkout <commit-hash>
supabase functions deploy make-server-25b11ac0
```

## 7. Troubleshooting

### Error: "supabase_fn_secret inválido"

1. Verificar que `SUPABASE_FN_SECRET` esté configurado en Supabase Secrets
2. Verificar que el frontend está enviando el header `x-fn-secret`
3. Confirmar que los valores coinciden

### Error: "CORS bloqueado"

1. Verificar que el dominio está en `allowedOrigins` del middleware de seguridad
2. Revisar los logs de la función en Supabase Dashboard > Functions > Logs

### Error: "RLS Policy violation"

1. Revisar el rol del usuario autenticado
2. Ejecutar la query en el SQL Editor con `EXPLAIN` para debug
3. Revisar las políticas en Supabase Dashboard > Auth > Policies
