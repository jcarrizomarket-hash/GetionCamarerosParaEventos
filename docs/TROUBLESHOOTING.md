# 🔧 Troubleshooting Guide

Soluciones a los problemas más comunes del Sistema de Gestión de Camareros.

---

## 📋 Tabla de Contenidos

- [Problemas de Instalación](#-problemas-de-instalación)
- [Errores de API / Conexión](#-errores-de-api--conexión)
- [Errores de Autenticación](#-errores-de-autenticación)
- [WhatsApp / Mensajería](#-whatsapp--mensajería)
- [Email](#-email)
- [Tests Fallando](#-tests-fallando)
- [Build / TypeScript](#-build--typescript)
- [Diagnóstico General](#-diagnóstico-general)

---

## 📦 Problemas de Instalación

### `npm install` falla con errores de permisos

```bash
# Limpiar cache de npm
npm cache clean --force

# Intentar instalación sin cache
npm install --prefer-offline
```

### Versión de Node.js incompatible

```bash
# Verificar versión
node --version  # Debe ser >= 18.0.0

# Con nvm, cambiar versión
nvm use 18
nvm install 18 --lts
```

### Error: `Cannot find module 'vite'`

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

---

## 🌐 Errores de API / Conexión

### Error `VITE_SUPABASE_PROJECT_ID no está configurado`

**Causa:** Las variables de entorno no están configuradas.

**Solución:**
1. Verificar que existe el archivo `.env` en la raíz del proyecto `src/`
2. Asegurarse de que contiene las variables correctas:

```bash
VITE_SUPABASE_PROJECT_ID=tu-project-id
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

3. Reiniciar el servidor de desarrollo: `npm run dev`

> ⚠️ Las variables deben empezar con `VITE_` para ser accesibles desde el frontend.

---

### Error 404 en llamadas a la API

**Causa posible 1:** URL de la función incorrecta.

Verificar que el endpoint existe en `src/supabase/functions/server/index.tsx`. La URL base es:
```
https://<PROJECT_ID>.supabase.co/functions/v1/make-server-25b11ac0
```

**Causa posible 2:** La Edge Function no está desplegada.

```bash
# Desplegar la función
supabase functions deploy make-server-25b11ac0 --project-ref <PROJECT_ID>

# Verificar que está activa
supabase functions list --project-ref <PROJECT_ID>
```

---

### Error CORS al llamar a la API

**Causa:** La función no está configurando correctamente los headers CORS.

**Verificar** que `app.use('*', cors())` está en `src/supabase/functions/server/index.tsx`.

Si el problema persiste, verificar que el dominio del frontend está en los orígenes permitidos en la configuración de Supabase.

---

### Los datos no se guardan (POST/PUT/DELETE fallan)

**Causa más común:** Falta el header `x-fn-secret`.

Verificar que `VITE_SUPABASE_FN_SECRET` está configurado en `.env` y que coincide con el secret configurado en Supabase Edge Functions.

```bash
# Verificar secret en Supabase
supabase secrets list --project-ref <PROJECT_ID>
```

---

## 🔑 Errores de Autenticación

### Error 401 Unauthorized

**Causa:** Header de autorización faltante o incorrecto.

Verificar que `VITE_SUPABASE_ANON_KEY` es correcto. Obtenerlo desde el dashboard de Supabase > Project Settings > API.

---

### Error `No autorizado` en operaciones mutantes

**Causa:** `x-fn-secret` no coincide con el configurado en la función.

```bash
# Reconfigurar el secret (deben ser iguales en frontend y Supabase)
supabase secrets set SUPABASE_FN_SECRET=nuevo-secret --project-ref <PROJECT_ID>
```

Y actualizar `.env`:
```bash
VITE_SUPABASE_FN_SECRET=nuevo-secret
```

---

## 📱 WhatsApp / Mensajería

### Los mensajes de WhatsApp no se envían

**Verificar paso a paso:**

1. Que `WHATSAPP_PHONE_ID` y `WHATSAPP_API_KEY` están configurados como secrets en Supabase
2. Que el número de teléfono tiene el formato correcto (código de país sin `+`)
3. Que el token de WhatsApp no ha expirado (los tokens temporales expiran a las 24h)

```bash
# Comprobar los secrets configurados
supabase secrets list --project-ref <PROJECT_ID>

# Ver logs de la función para el error específico
supabase functions logs make-server-25b11ac0 --project-ref <PROJECT_ID>
```

**Formato de número correcto:**
- ❌ `+34 600 000 001`
- ❌ `0034600000001`
- ✅ `34600000001`

---

### Error `Phone Number ID vs número de teléfono`

**Causa:** El `WHATSAPP_PHONE_ID` es el ID numérico del teléfono en Meta, NO el número de teléfono en sí.

**Cómo obtenerlo:**
1. Ir a [Meta for Developers](https://developers.facebook.com/)
2. Seleccionar tu app > WhatsApp > API Setup
3. Copiar el **Phone Number ID** (es un número largo, ej: `123456789012345`)
4. El **Phone Number** (ej: `+1 555 832 7331`) es diferente y no se usa aquí

---

### El número de prueba de WhatsApp no funciona

El número de prueba pre-configurado en los tests es `+15558327331`. Este número solo funciona en entornos de desarrollo con la cuenta de Meta configurada correctamente.

Para producción, se necesita un número verificado en WhatsApp Business.

---

## 📧 Email

### Los emails no se envían

**Verificar:**

1. Que `RESEND_API_KEY` (o `SENDGRID_API_KEY` / `MAILGUN_API_KEY`) está configurado
2. Que `EMAIL_FROM` está configurado con un dominio verificado

```bash
supabase secrets set RESEND_API_KEY=re_tu_api_key --project-ref <PROJECT_ID>
supabase secrets set EMAIL_FROM=tu@dominio.com --project-ref <PROJECT_ID>
```

**Con Resend:** el dominio del email `from` debe estar verificado en el dashboard de Resend.

Ver [EMAIL_SETUP.md](../src/EMAIL_SETUP.md) para configuración detallada de cada proveedor.

---

### Los emails llegan a spam

**Soluciones:**
1. Verificar el dominio en el proveedor de email (SPF, DKIM, DMARC)
2. Usar un email `from` del dominio verificado, no un email gratuito
3. Revisar el contenido del email (evitar palabras marcadas como spam)

---

## 🧪 Tests Fallando

### Tests unitarios fallan con `Cannot find module`

```bash
# Reinstalar dependencias de testing
npm install

# Verificar configuración de vitest
cat src/vitest.config.ts
```

---

### Tests E2E fallan con `browser not found`

```bash
# Instalar navegadores de Playwright
npx playwright install

# O solo Chromium
npx playwright install chromium
```

---

### Los tests de WhatsApp fallan

Los tests usan el número `+15558327331` como número de prueba. Si los tests fallan por conexión, verificar que las variables de entorno están configuradas en `.env.test` o que los mocks están activos.

---

## 🔨 Build / TypeScript

### Error de TypeScript: `Property does not exist`

```bash
# Verificar tipos
npm run type-check

# Ver errores específicos
npx tsc --noEmit 2>&1 | head -50
```

### El build falla con `out of memory`

```bash
# Aumentar memoria para Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Vite build genera archivos muy grandes

Verificar que no hay imports innecesarios. Usar `npm run build` y revisar el análisis de bundle:

```bash
# Instalar analizador
npm install -D rollup-plugin-visualizer

# Analizar bundle
npm run build -- --mode analyze
```

---

## 🩺 Diagnóstico General

### Pasos de diagnóstico rápido

```bash
# 1. Verificar variables de entorno
cat .env | grep VITE_

# 2. Verificar conexión a Supabase
curl https://<PROJECT_ID>.supabase.co/functions/v1/make-server-25b11ac0/pedidos \
  -H "Authorization: Bearer <ANON_KEY>"

# 3. Ver logs de la función
supabase functions logs make-server-25b11ac0 --project-ref <PROJECT_ID>

# 4. Ejecutar tests de diagnóstico
npm run test:unit

# 5. Verificar build
npm run build
```

### Herramientas de debugging

- **Consola del navegador** (F12 > Console): Errores de JavaScript
- **Network tab** (F12 > Network): Peticiones API y respuestas
- **Supabase Dashboard > Logs**: Logs de Edge Functions
- **Panel de Pruebas en la UI**: Pestaña 🧪 en la aplicación

---

## 📞 Obtener Ayuda Adicional

Si el problema no está documentado aquí:

1. Revisar [ARCHITECTURE.md](../src/ARCHITECTURE.md) para entender la arquitectura
2. Revisar los logs completos de la función: `supabase functions logs`
3. Abrir un [Issue en GitHub](https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/issues)
4. Incluir en el issue:
   - Descripción del problema
   - Pasos para reproducir
   - Logs de error (consola del navegador + logs de Supabase)
   - Versión de Node.js (`node --version`)
