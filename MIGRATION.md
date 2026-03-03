# Migration Guide

This guide explains how to migrate between versions of the Event Waitstaff Management System.

## Table of Contents

- [From v1.x to v2.0](#from-v1x-to-v20)
  - [Breaking Changes](#breaking-changes)
  - [Migration Steps](#migration-steps)
  - [Compatibility Matrix](#compatibility-matrix)
- [Deprecation Warnings](#deprecation-warnings)
- [Rollback Instructions](#rollback-instructions)

---

## From v1.x to v2.0

### Breaking Changes

#### 1. API Client – Centralized via `src/api/client.ts`

**Before (v1.x):** Components made direct `fetch()` calls with manually constructed headers.

```typescript
// ❌ v1.x – Direct fetch in component
const response = await fetch(`${baseUrl}/pedidos`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  }
});
const result = await response.json();
```

**After (v2.0):** All API calls must go through the centralized client.

```typescript
// ✅ v2.0 – Centralized API client
import { getPedidos } from '../src/api/client';

const result = await getPedidos();
if (result.success && result.data) {
  // use result.data
}
```

**Impact:** Any component that performs direct `fetch()` to the backend must be updated.

---

#### 2. Security – JWT Bearer Authentication Only

**Before (v1.x):** POST, PUT, DELETE requests only required the Supabase `Authorization` header.

**After (v2.0 / Option A):** All requests (including mutations) are authenticated exclusively with the Supabase anon JWT. **No shared secret is stored or sent from the browser.**

```typescript
// ✅ v2.0 – All requests (GET and mutations)
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${VITE_SUPABASE_ANON_KEY}`
}
```

The API client handles this automatically via `Authorization: Bearer <VITE_SUPABASE_ANON_KEY>`.

**Impact:** The `x-fn-secret` / `VITE_SUPABASE_FN_SECRET` approach used in earlier drafts of v2.0 has been superseded. Remove any `VITE_SUPABASE_FN_SECRET` from your frontend `.env` file.

---

#### 3. Environment Variables – New Required Variables

**New variables in v2.0:**

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_PROJECT_ID` | ✅ Yes | Supabase Project ID |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key |
| `VITE_SUPABASE_FUNCTION_ENDPOINT` | Optional | Full Edge Function URL (auto-derived if omitted) |

**Before (v1.x):** `baseUrl` and `publicAnonKey` were passed as component props.

**After (v2.0):** Configuration is read from environment variables via `src/api/client.ts`.

**Impact:** Components that previously accepted `baseUrl` and `publicAnonKey` as props no longer need them; values are read from the environment.

---

#### 4. TypeScript Types – Strict Domain Types Enforced

**Before (v1.x):** Components used `any` or implicit types.

**After (v2.0):** All domain entities use explicit types from `src/types.ts`.

```typescript
// ✅ v2.0 – Typed entities
import type { Pedido, Camarero, Coordinador, Cliente } from '../src/types';
```

**Impact:** TypeScript compilation will fail for code that does not match the defined types.

---

#### 5. Database Schema Changes

The following field renames occurred between v1.x and v2.0:

| v1.x field | v2.0 field | Entity |
|---|---|---|
| `nombre_cliente` | `cliente` | `Pedido` |
| `num_camareros` | `camarerosTurno1` + `camarerosTurno2` | `Pedido` |
| `hora_inicio` | `horaEntrada` | `Pedido` |
| `hora_fin` | `horaSalida` | `Pedido` |
| `fecha_evento` | `diaEvento` | `Pedido` |

---

### Migration Steps

Follow these steps to migrate a project from v1.x to v2.0.

#### Step 1: Install Updated Dependencies

```bash
npm install
```

Review the new `devDependencies` for testing tools:

```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@vitest/coverage-v8": "^1.0.4",
    "vitest": "^1.0.4"
  }
}
```

#### Step 2: Update Environment Variables

Create your `.env` file and fill in your values:

```bash
# If your project includes an .env.example template, copy it:
#   cp .env.example .env
# Otherwise, create an empty .env file:
touch .env
```

Add the required variables:

```bash
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_ANON_KEY=your-anon-key
# Optional: override auto-derived endpoint
# VITE_SUPABASE_FUNCTION_ENDPOINT=https://your-project-id.supabase.co/functions/v1/make-server-25b11ac0
```

#### Step 3: Update Component Imports

Replace direct `fetch()` calls with the centralized API client:

```typescript
// Add imports at top of component file
import { getPedidos, createPedido, updatePedido, deletePedido } from '../src/api/client';
import type { Pedido } from '../src/types';
```

#### Step 4: Remove Prop-Based Configuration

Remove `baseUrl` and `publicAnonKey` props from component signatures:

```typescript
// ❌ v1.x
function MyComponent({ baseUrl, publicAnonKey }) { ... }

// ✅ v2.0
function MyComponent() { ... }
```

#### Step 5: Update API Calls

Replace each direct `fetch()` with the corresponding client function:

```typescript
// ❌ v1.x
const response = await fetch(`${baseUrl}/pedidos`, { headers: { ... } });
const result = await response.json();
if (result.success) setPedidos(result.data);

// ✅ v2.0
const result = await getPedidos();
if (result.success && result.data) setPedidos(result.data);
```

#### Step 6: Replace Inline Logic with Helpers

Move repeated calculation logic to shared helpers:

```typescript
import { calcularHoras, formatearHoras, formatearFecha } from '../src/utils/helpers';

// ❌ v1.x – inline calculation
const totalMin = (horaS * 60 + minS) - (horaE * 60 + minE);
const horas = totalMin / 60;

// ✅ v2.0 – shared helper
const horas = calcularHoras(horaEntrada, horaSalida);
```

#### Step 7: Deploy Backend Changes

Re-deploy the Supabase Edge Function to pick up the updated CORS and authentication middleware:

```bash
supabase functions deploy make-server-25b11ac0
```

CORS is now restricted to `https://appservice.jcarrizo.com`. Configure the Supabase Auth redirect URL accordingly in the Supabase dashboard.

#### Step 8: Verify the Migration

Run the test suite to confirm everything works:

```bash
npm test
npm run test:e2e
```

---

### Compatibility Matrix

| Feature | v1.x | v2.0 |
|---|---|---|
| Direct `fetch()` in components | ✅ Supported | ❌ Deprecated |
| Centralized API client | ❌ Not available | ✅ Required |
| TypeScript strict types | ❌ Optional | ✅ Enforced |
| Auth via `Authorization: Bearer` JWT | ❌ Optional | ✅ Required for all requests |
| `x-fn-secret` client-side header | ❌ Not used | ❌ Not used (server-to-server only) |
| Unit tests (Vitest) | ❌ Not included | ✅ Included |
| E2E tests (Playwright) | ❌ Not included | ✅ Included |
| Email integration | ✅ Basic | ✅ Multi-provider (Resend/SendGrid/Mailgun) |
| WhatsApp integration | ✅ Basic | ✅ Enhanced with validation |
| Rate limiting | ❌ None | ✅ Configurable |
| CORS middleware | ❌ None | ✅ Restricted to appservice.jcarrizo.com |

| Node.js version | v1.x | v2.0 |
|---|---|---|
| Node.js 16 | ✅ | ❌ Not supported |
| Node.js 18 | ✅ | ✅ Minimum required |
| Node.js 20 | ✅ | ✅ Recommended |

---

## Deprecation Warnings

The following APIs and patterns are **deprecated in v2.0** and will be **removed in v3.0**:

### 1. Direct `fetch()` to Backend

```typescript
// ⚠️ DEPRECATED – will be removed in v3.0
const response = await fetch(`${baseUrl}/pedidos`, { ... });
```

**Use instead:** `getPedidos()` from `src/api/client.ts`

---

### 2. Passing `baseUrl` / `publicAnonKey` as Props

```typescript
// ⚠️ DEPRECATED – will be removed in v3.0
<MyComponent baseUrl="..." publicAnonKey="..." />
```

**Use instead:** Configure via environment variables and use the API client.

---

### 3. Inline Calculation Logic

Duplicating calculation logic (hours, phone formatting, date formatting) inside components is deprecated.

**Use instead:** Helpers from `src/utils/helpers.ts`.

---

## Rollback Instructions

If you need to roll back to v1.x after upgrading:

1. Check out the last v1.x commit:

   ```bash
   git checkout <v1.x-commit-sha>
   ```

2. Reinstall dependencies:

   ```bash
   npm install
   ```

3. No `VITE_SUPABASE_FN_SECRET` to remove (not used in either v1.x or v2.0).

4. Redeploy the previous version of the Edge Function from the v1.x commit.

> ⚠️ Note: Rolling back will lose any data written using the v2.0 schema field names. Ensure you have a database backup before rolling back.

---

For additional help, see:
- [CHANGELOG.md](./CHANGELOG.md) – Full version history
- [src/ARCHITECTURE.md](./src/ARCHITECTURE.md) – System architecture
- [src/REFACTOR_GUIDE.md](./src/REFACTOR_GUIDE.md) – Refactoring guide
- [src/MIGRATION_EXAMPLE.md](./src/MIGRATION_EXAMPLE.md) – Practical migration example
