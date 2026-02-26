# 🔐 Security Guidelines

Guía de seguridad para el Sistema de Gestión de Camareros.

---

## 📋 Tabla de Contenidos

- [Modelo de Seguridad](#-modelo-de-seguridad)
- [Variables de Entorno](#-variables-de-entorno)
- [Autenticación de la API](#-autenticación-de-la-api)
- [Middleware de Seguridad](#-middleware-de-seguridad)
- [Rotación de Claves](#-rotación-de-claves)
- [Buenas Prácticas](#-buenas-prácticas)
- [Vulnerabilidades Conocidas](#-vulnerabilidades-conocidas)
- [Reportar Vulnerabilidades](#-reportar-vulnerabilidades)

---

## 🛡️ Modelo de Seguridad

La API usa dos niveles de protección:

| Nivel | Mecanismo | Endpoints |
|-------|-----------|-----------|
| **Básico** | `Authorization: Bearer <ANON_KEY>` | Todos (GET) |
| **Mutante** | Proxy seguro del servidor (agrega `x-fn-secret`) | POST, PUT, DELETE |

```
Frontend (sin secret)
       │
       │ POST /proxy  (Authorization: Bearer ANON_KEY,
       │               x-proxy-path: /pedidos,
       │               x-proxy-method: POST)
       ▼
Proxy endpoint (servidor)
       │
       │ Agrega x-fn-secret desde SUPABASE_FN_SECRET (env del servidor)
       │
       ▼
Endpoint real (/pedidos POST)
       │
       ├─ Verificar Authorization header (ANON_KEY)
       │    └─ 401 si inválido
       │
       └─ Verificar x-fn-secret
            └─ 401 si inválido o faltante
```

---

## 🔑 Variables de Entorno

### Clasificación de Secretos

| Variable | Nivel | Descripción |
|----------|-------|-------------|
| `VITE_SUPABASE_ANON_KEY` | 🟡 Semipúblico | Clave pública de Supabase. Visible en el frontend pero sin permisos de escritura directa. |
| `VITE_SUPABASE_PROJECT_ID` | 🟡 Semipúblico | ID del proyecto. No es un secreto pero no debe compartirse innecesariamente. |
| `SUPABASE_FN_SECRET` | 🔴 Secreto | Protege operaciones de escritura. **Solo en Supabase Secrets (servidor). Nunca exponer en variables `VITE_*`.** |
| `SUPABASE_SERVICE_ROLE_KEY` | 🔴 Crítico | Solo para el servidor. **Nunca usar en el frontend.** |
| `WHATSAPP_API_KEY` | 🔴 Secreto | Token de Meta. Solo en Supabase Secrets. |
| `RESEND_API_KEY` | 🔴 Secreto | Token de Resend. Solo en Supabase Secrets. |

### Reglas de Manejo

1. **Nunca** commitear archivos `.env` con valores reales al repositorio
2. El archivo `.env.example` es el único permitido en el repositorio (con valores de ejemplo)
3. `SUPABASE_SERVICE_ROLE_KEY` **nunca** debe estar en variables `VITE_*` (quedaría expuesto en el bundle del frontend)
4. `SUPABASE_FN_SECRET` **nunca** debe estar en variables `VITE_*`; usar únicamente en Supabase Secrets
5. Usar `.gitignore` para excluir `.env` y variantes

---

## 🔒 Autenticación de la API

### Uso Correcto del ANON_KEY

El `ANON_KEY` es una clave semipública diseñada para usarse en el frontend. Sin embargo, **las Row Level Security (RLS) policies de Supabase** controlan qué datos puede ver cada usuario.

```typescript
// ✅ Correcto: usando ANON_KEY para lectura
const headers = {
  'Authorization': `Bearer ${anonKey}`,
  'Content-Type': 'application/json'
};

// ❌ Incorrecto: nunca usar SERVICE_ROLE_KEY en el frontend
const headers = {
  'Authorization': `Bearer ${serviceRoleKey}` // NUNCA HACER ESTO
};
```

### Protección de Operaciones Mutantes via Proxy

Todas las operaciones que modifican datos se enrutan a través del proxy seguro en el servidor. El frontend **nunca** envía `x-fn-secret`; el proxy lo agrega desde el entorno del servidor.

```typescript
// ✅ Correcto: usar el proxy para operaciones mutantes (sin secret en el frontend)
fetch(`${baseUrl}/proxy`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${anonKey}`,
    'x-proxy-path': '/pedidos',
    'x-proxy-method': 'POST',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

// ❌ Incorrecto: exponer x-fn-secret desde una variable VITE_ del frontend
fetch('/pedidos', {
  method: 'POST',
  headers: {
    'x-fn-secret': import.meta.env.VITE_SUPABASE_FN_SECRET, // NUNCA HACER ESTO
  },
});
```

---

## 🛡️ Middleware de Seguridad

El servidor implementa el siguiente middleware en `src/supabase/functions/server/middleware.ts`:

### `requireFunctionSecret`

Valida el header `x-fn-secret` para operaciones mutantes:

```typescript
import { requireFunctionSecret } from './middleware';

// Proteger endpoints sensibles
app.post('/pedidos', requireFunctionSecret, handler);
app.put('/pedidos/:id', requireFunctionSecret, handler);
app.delete('/pedidos/:id', requireFunctionSecret, handler);
```

### `requireAuth`

Valida tokens de autenticación Supabase para rutas privadas.

### `rateLimit`

Previene abuso con rate limiting configurable.

### Configurar el Secret

```bash
# Generar un secret criptográficamente seguro (mínimo 32 caracteres)
openssl rand -hex 32

# Configurar en Supabase Edge Functions (NUNCA como variable VITE_*)
supabase secrets set SUPABASE_FN_SECRET=<secret-generado> --project-ref <PROJECT_ID>
```

El frontend no necesita ni debe tener acceso a este secret. El proxy del servidor lo agrega automáticamente.

---

## 🔄 Rotación de Claves

Se recomienda rotar los secretos periódicamente o ante cualquier posible compromiso:

### 1. Generar nuevo secret

```bash
openssl rand -hex 32
# Guardar el resultado: abc123...
```

### 2. Actualizar en Supabase

```bash
supabase secrets set SUPABASE_FN_SECRET=abc123... --project-ref <PROJECT_ID>
```

### 3. Verificar funcionamiento

La rotación del secret **no requiere redeploy del frontend**, ya que el secret solo reside en el servidor.

```bash
curl -X POST https://<PROJECT_ID>.supabase.co/functions/v1/make-server-25b11ac0/proxy \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "x-proxy-path: /pedidos" \
  -H "x-proxy-method: POST" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## ✅ Buenas Prácticas

### En el Frontend

- ✅ Usar solo `VITE_SUPABASE_ANON_KEY` para llamadas a la API
- ✅ Usar el proxy (`/proxy`) para operaciones mutantes — el secret nunca llega al navegador
- ✅ Validar datos en el frontend antes de enviarlos a la API
- ✅ Manejar errores de autenticación (401) mostrando mensaje al usuario
- ❌ Nunca loggear secretos en la consola del navegador
- ❌ Nunca hardcodear claves en el código fuente
- ❌ Nunca usar variables `VITE_SUPABASE_FN_SECRET` — el secret debe estar solo en Supabase Secrets

### En el Servidor (Edge Functions)

- ✅ Usar `SUPABASE_SERVICE_ROLE_KEY` solo en el servidor, nunca en el cliente
- ✅ Validar y sanitizar todos los inputs del usuario
- ✅ Loggear intentos de acceso no autorizado
- ✅ Usar HTTPS siempre (Supabase Edge Functions lo garantiza)
- ❌ Nunca exponer stack traces completos en respuestas de error

### En el Repositorio

- ✅ `.env` y variantes en `.gitignore`
- ✅ Solo `.env.example` con valores de ejemplo en el repo
- ✅ Revisión de código antes de merges a `main`
- ❌ Nunca commitear secretos reales, incluso en ramas de desarrollo

---

## ⚠️ Vulnerabilidades Conocidas

### Moderada: Sin autenticación de usuario

Actualmente el sistema no implementa autenticación de usuarios (login/signup). El acceso a la API está protegido únicamente por el `x-fn-secret` a nivel de aplicación, no por usuario individual.

**Mitigación actual:** El secret de función actúa como control de acceso a nivel de aplicación.

**Mejora planificada (v2.2):** Implementar Supabase Auth con roles (coordinador, camarero).

---

## 🚨 Reportar Vulnerabilidades

Si descubres una vulnerabilidad de seguridad:

1. **No** abrir un Issue público con detalles de la vulnerabilidad
2. Reportar directamente al equipo de desarrollo a través de los canales privados del proyecto
3. Incluir:
   - Descripción de la vulnerabilidad
   - Pasos para reproducir
   - Impacto potencial
   - Sugerencia de solución (opcional)

Responderemos en un plazo máximo de 48 horas hábiles.

---

## 🔗 Referencias

- [API Reference](./API.md)
- [ARCHITECTURE.md](../src/ARCHITECTURE.md) — Sección de seguridad
- [Supabase Security Docs](https://supabase.com/docs/guides/auth)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
