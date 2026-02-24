# 🚀 Deployment Guide

Guía completa para desplegar el Sistema de Gestión de Camareros a producción.

---

## 📋 Tabla de Contenidos

- [Requisitos Previos](#-requisitos-previos)
- [Variables de Entorno](#-variables-de-entorno)
- [Frontend](#-frontend)
- [Backend (Supabase Functions)](#-backend-supabase-functions)
- [Checklist de Despliegue](#-checklist-de-despliegue)
- [Plataformas Soportadas](#-plataformas-soportadas)
- [Rollback](#-rollback)

---

## 📦 Requisitos Previos

- Node.js ≥ 18
- npm ≥ 9
- Cuenta de [Supabase](https://app.supabase.com) (proyecto creado)
- CLI de Supabase instalada:

```bash
npm install -g supabase
supabase login
```

---

## 🔑 Variables de Entorno

### Frontend (`.env`)

```bash
# Supabase (obligatorio)
VITE_SUPABASE_PROJECT_ID=tu-project-id
VITE_SUPABASE_ANON_KEY=tu-anon-key

# Seguridad (recomendado en producción)
VITE_SUPABASE_FN_SECRET=tu-secret-aleatorio-largo
```

Para generar un secret seguro:
```bash
openssl rand -hex 32
```

### Backend (Supabase Function Secrets)

Configurar en el dashboard de Supabase > Project Settings > Edge Functions, o con la CLI:

```bash
supabase secrets set SUPABASE_FN_SECRET=tu-secret-aleatorio-largo
supabase secrets set WHATSAPP_PHONE_ID=tu-phone-id
supabase secrets set WHATSAPP_API_KEY=tu-api-key
supabase secrets set RESEND_API_KEY=re_tu-api-key
supabase secrets set EMAIL_FROM=tu@dominio.com
```

Variables disponibles en la función (automáticas de Supabase):
- `SUPABASE_URL` — URL del proyecto
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (acceso completo a DB)

---

## 🌐 Frontend

### Build

```bash
# Verificar que no hay errores de TypeScript
npm run type-check

# Ejecutar tests
npm run test:unit

# Generar build de producción
npm run build

# Archivos generados en: dist/
```

### Vercel (Recomendado)

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Configurar variables de entorno en Settings > Environment Variables
3. El despliegue es automático en cada push a `main`

```bash
# O con la CLI de Vercel
npm install -g vercel
vercel --prod
```

### Netlify

1. Conectar repositorio en [netlify.com](https://netlify.com)
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configurar variables de entorno en Site Settings > Environment Variables

### GitHub Pages

```bash
# Instalar gh-pages
npm install -D gh-pages

# En package.json, añadir script:
# "deploy": "gh-pages -d dist"

npm run build
npm run deploy
```

> ⚠️ GitHub Pages requiere rutas relativas. Configurar `base` en `vite.config.ts`.

---

## ⚙️ Backend (Supabase Functions)

### Desplegar la Edge Function

```bash
# Desde la raíz del proyecto
supabase functions deploy make-server-25b11ac0 \
  --project-ref <SUPABASE_PROJECT_ID>
```

### Verificar el despliegue

```bash
# Ver estado de la función
supabase functions list --project-ref <SUPABASE_PROJECT_ID>

# Ver logs en tiempo real
supabase functions logs make-server-25b11ac0 \
  --project-ref <SUPABASE_PROJECT_ID>
```

### Probar el endpoint

```bash
curl https://<PROJECT_ID>.supabase.co/functions/v1/make-server-25b11ac0/pedidos \
  -H "Authorization: Bearer <ANON_KEY>"
```

Respuesta esperada:
```json
{ "success": true, "data": [] }
```

---

## ✅ Checklist de Despliegue

### Pre-despliegue

- [ ] `npm run type-check` — sin errores TypeScript
- [ ] `npm run lint` — sin errores de linting
- [ ] `npm run test:unit` — todos los tests pasan
- [ ] `npm run build` — build exitoso sin warnings críticos
- [ ] Variables de entorno configuradas en plataforma de hosting
- [ ] `SUPABASE_FN_SECRET` generado y configurado (frontend + Supabase secrets)

### Backend

- [ ] Edge Function desplegada: `supabase functions deploy make-server-25b11ac0`
- [ ] Secrets configurados en Supabase (WhatsApp, Email, FN_SECRET)
- [ ] Endpoint de prueba responde correctamente
- [ ] Logs sin errores: `supabase functions logs`

### Post-despliegue

- [ ] Frontend carga correctamente en la URL de producción
- [ ] Login / autenticación funciona (si aplica)
- [ ] CRUD de pedidos funciona
- [ ] Envío de mensajes WhatsApp funciona (con número de prueba)
- [ ] Envío de emails funciona
- [ ] Exportación a PDF/Excel funciona

---

## 🖥️ Plataformas Soportadas

| Plataforma | Frontend | Notas |
|-----------|---------|-------|
| Vercel | ✅ | Recomendada, integración nativa con GitHub |
| Netlify | ✅ | Buena alternativa |
| GitHub Pages | ✅ | Requiere configuración de `base` en Vite |
| Cloudflare Pages | ✅ | Alto rendimiento global |
| Self-hosted (Nginx) | ✅ | Ver configuración abajo |

### Self-hosted con Nginx

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /var/www/html/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔄 Rollback

### Frontend

En Vercel/Netlify: ir al dashboard > Deployments > seleccionar versión anterior > Redeploy.

Con CLI de Vercel:
```bash
vercel rollback
```

### Backend (Edge Function)

Las Edge Functions de Supabase no tienen rollback automático. Para revertir:

```bash
# Hacer checkout del commit anterior
git checkout <commit-anterior> -- src/supabase/functions/

# Redesplegar
supabase functions deploy make-server-25b11ac0
```

---

## 🔗 Referencias

- [API Reference](./API.md)
- [Security Guidelines](./SECURITY.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Supabase CLI Docs](https://supabase.com/docs/reference/cli)
- [Vercel Docs](https://vercel.com/docs)
