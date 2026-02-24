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
| **Mutante** | `x-fn-secret: <FN_SECRET>` | POST, PUT, DELETE |

```
Request → Supabase Edge Function
             │
             ├─ Verificar Authorization header (ANON_KEY)
             │    └─ 401 si inválido
             │
             └─ Si POST/PUT/DELETE: Verificar x-fn-secret
                  └─ 401 si inválido o faltante
```

---

## 🔑 Variables de Entorno

### Clasificación de Secretos

| Variable | Nivel | Descripción |
|----------|-------|-------------|
| `VITE_SUPABASE_ANON_KEY` | 🟡 Semipúblico | Clave pública de Supabase. Visible en el frontend pero sin permisos de escritura directa. |
| `VITE_SUPABASE_PROJECT_ID` | 🟡 Semipúblico | ID del proyecto. No es un secreto pero no debe compartirse innecesariamente. |
| `VITE_SUPABASE_FN_SECRET` | 🔴 Secreto | Protege operaciones de escritura. **Nunca exponer públicamente.** |
| `SUPABASE_SERVICE_ROLE_KEY` | 🔴 Crítico | Solo para el servidor. **Nunca usar en el frontend.** |
| `WHATSAPP_API_KEY` | 🔴 Secreto | Token de Meta. Solo en Supabase Secrets. |
| `RESEND_API_KEY` | 🔴 Secreto | Token de Resend. Solo en Supabase Secrets. |

### Reglas de Manejo

1. **Nunca** commitear archivos `.env` con valores reales al repositorio
2. El archivo `.env.example` es el único permitido en el repositorio (con valores de ejemplo)
3. `SUPABASE_SERVICE_ROLE_KEY` **nunca** debe estar en variables `VITE_*` (quedaría expuesto en el bundle del frontend)
4. Usar `.gitignore` para excluir `.env` y variantes

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

### Protección de Operaciones Mutantes

Todos los endpoints que modifican datos requieren el header `x-fn-secret`:

```typescript
// ✅ Correcto: incluir x-fn-secret para operaciones mutantes
const headers = {
  'Authorization': `Bearer ${anonKey}`,
  'x-fn-secret': fnSecret,
  'Content-Type': 'application/json'
};

// ❌ Incorrecto: POST sin x-fn-secret
fetch('/pedidos', { method: 'POST', ... }); // Fallará con 401
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

# Configurar en Supabase Edge Functions
supabase secrets set SUPABASE_FN_SECRET=<secret-generado> --project-ref <PROJECT_ID>
```

Y en el frontend (`.env`):
```bash
VITE_SUPABASE_FN_SECRET=<mismo-secret-generado>
```

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

### 3. Actualizar en el frontend

Actualizar `VITE_SUPABASE_FN_SECRET` en el panel de variables de entorno de Vercel/Netlify y hacer un nuevo deploy.

### 4. Verificar funcionamiento

```bash
curl -X POST https://<PROJECT_ID>.supabase.co/functions/v1/make-server-25b11ac0/pedidos \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "x-fn-secret: abc123..." \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## ✅ Buenas Prácticas

### En el Frontend

- ✅ Usar solo `VITE_SUPABASE_ANON_KEY` para llamadas a la API
- ✅ Incluir `x-fn-secret` solo para operaciones que lo requieran
- ✅ Validar datos en el frontend antes de enviarlos a la API
- ✅ Manejar errores de autenticación (401) mostrando mensaje al usuario
- ❌ Nunca loggear secretos en la consola del navegador
- ❌ Nunca hardcodear claves en el código fuente

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
