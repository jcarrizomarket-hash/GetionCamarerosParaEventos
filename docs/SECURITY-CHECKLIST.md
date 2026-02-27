# Security Checklist - GetionCamarerosParaEventos

Checklist de seguridad para ejecutar **antes de cada deployment** a producción.

## ✅ Pre-Deployment Checklist

### 1. Secretos y Variables de Entorno

- [ ] `VITE_SUPABASE_URL` configurado con URL correcta de producción
- [ ] `VITE_SUPABASE_ANON_KEY` configurado (clave pública)
- [ ] `SUPABASE_FN_SECRET` configurado con valor aleatorio seguro (≥32 chars)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` **NO** está incluido en el build del frontend
- [ ] `.env.local` está en `.gitignore`
- [ ] No hay secretos hardcodeados en el código fuente

```bash
# Verificar que no hay secretos en el código
grep -r "service_role" src/ --include="*.ts" --include="*.tsx"
grep -r "sk_live_\|pk_live_" src/
```

### 2. Autenticación y Autorización

- [ ] Row Level Security (RLS) está habilitado en todas las tablas
- [ ] Las políticas RLS de producción están desplegadas (migration 003)
- [ ] Los roles `admin`, `coordinador`, `viewer` están configurados
- [ ] Los endpoints mutantes requieren `x-fn-secret` o autenticación Bearer

### 3. Base de Datos

- [ ] Migraciones aplicadas en orden: 001 → 002 → 003 → 004
- [ ] Audit trail activo en todas las tablas críticas
- [ ] Backups automáticos habilitados en Supabase
- [ ] Conexión directa a PostgreSQL deshabilitada (solo via API)

```bash
# Verificar migraciones aplicadas
supabase db diff --schema public
```

### 4. Build y Dependencias

- [ ] `npm audit` sin vulnerabilidades HIGH o CRITICAL
- [ ] Build de producción sin warnings de seguridad
- [ ] Sin dependencias con licencias incompatibles

```bash
npm audit --audit-level=high
npm run build
```

### 5. Headers de Seguridad (API)

- [ ] `Content-Security-Policy` configurado
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `Strict-Transport-Security` habilitado
- [ ] CORS configurado solo para dominios autorizados

### 6. Rate Limiting

- [ ] Rate limiting activo en endpoints de autenticación (10 req/15min)
- [ ] Rate limiting activo en API general (100 req/min)
- [ ] Rate limiting activo en exports (5 req/min)

### 7. Logging y Monitoreo

- [ ] Error logs tabla activa y accesible
- [ ] Audit trail registrando cambios
- [ ] Alertas configuradas para errores críticos

### 8. Tests de Seguridad

- [ ] Tests E2E de seguridad ejecutados y pasando
- [ ] Tests de XSS pasando
- [ ] Tests de SQL injection pasando
- [ ] Tests de auth bypass pasando

```bash
# Ejecutar suite de seguridad
npx playwright test src/tests/e2e/security/
```

## 🔴 Procedimientos Críticos

### Rotación de Secretos

Si se sospecha compromiso de secretos:

1. Rotar `SUPABASE_FN_SECRET` inmediatamente
2. Invalidar todos los tokens activos en Supabase Auth
3. Revisar audit_trail de las últimas 24h
4. Notificar al equipo
5. Documentar el incidente

### Rollback de Emergencia

```bash
# Ver deployments recientes en Supabase
supabase projects list

# Rollback de función específica
supabase functions delete <nombre-funcion>
supabase functions deploy <nombre-funcion> --project-ref <id>
```

## 📋 Verificaciones Post-Deployment

- [ ] Verificar que la aplicación carga correctamente
- [ ] Probar flujo de login/logout
- [ ] Verificar que los datos se cargan y guardan
- [ ] Revisar logs de error en las primeras 30 minutos
- [ ] Confirmar que el audit trail está registrando cambios
