# Architecture Review

**Application:** Gestión de Camareros para Eventos  
**Review Date:** 2026-02-27  
**Reviewer:** Architecture Review Process

---

## Overview

The application is a single-page React/TypeScript application (SPA) backed by Supabase Edge Functions (Deno/Hono) as the API layer, with Supabase Postgres as the database. The frontend is built with Vite and deployed as a static site.

```
┌─────────────────────────────────────────┐
│           Browser (React SPA)           │
│  Vite + React 18 + TypeScript           │
│  Radix UI + Tailwind CSS                │
└──────────────┬──────────────────────────┘
               │ HTTPS + Bearer token
               ▼
┌─────────────────────────────────────────┐
│      Supabase Edge Functions (Deno)     │
│      Hono framework                     │
│      src/supabase/functions/server/     │
└──────────────┬──────────────────────────┘
               │ Supabase client
               ▼
┌─────────────────────────────────────────┐
│         Supabase (PostgreSQL)           │
│         Storage / Auth / Realtime       │
└─────────────────────────────────────────┘
```

---

## Current Architecture Assessment

### Strengths

1. **Technology Stack:** Modern, well-supported stack (React 18, TypeScript, Vite 6, Supabase). Good choice for a lean team.
2. **Error Boundary:** `src/components/error-boundary.tsx` wraps the entire app, preventing white-screen crashes.
3. **Centralized Logger:** `src/utils/logger.ts` provides leveled logging with environment awareness.
4. **Zod for Validation:** `zod` is a project dependency and used in schemas — good pattern, needs wider adoption.
5. **Component Separation:** UI components are logically separated into individual files per domain.

### Weaknesses

---

#### ARCH-001 — Monolithic Edge Function
**Severity:** 🟠 High  
**Location:** `src/supabase/functions/server/index.tsx`  
**Description:**  
All API routes are defined in a single ~1500-line file. This violates the Single Responsibility Principle and makes the codebase hard to test, maintain, and scale.

**Recommended Refactor:**
```
src/supabase/functions/server/
├── index.tsx          ← Entry point, middleware, exports
├── routes/
│   ├── camareros.ts   ← /camareros endpoints
│   ├── pedidos.ts     ← /pedidos endpoints
│   ├── coordinadores.ts
│   ├── clientes.ts
│   ├── email.ts
│   └── whatsapp.ts
├── middleware/
│   ├── auth.ts        ← JWT verification
│   └── rate-limit.ts
└── services/
    ├── email.service.ts
    └── whatsapp.service.ts
```

---

#### ARCH-002 — State Management in Root Component
**Severity:** 🟡 Medium  
**Location:** `src/App.tsx`  
**Description:**  
All application state (`camareros`, `pedidos`, `coordinadores`, `clientes`) is held in the root `App` component and passed as props through multiple levels. This is a classic "prop drilling" anti-pattern that makes components tightly coupled.

**Recommended Refactor:**
1. Use React Context API for shared domain state.
2. Or adopt a lightweight state manager like Zustand.
3. Move data fetching to custom hooks (`useCamareros()`, `usePedidos()`, etc.).

```typescript
// Recommended pattern
function useCamareros() {
  const [camareros, setCamareros] = useState<Camarero[]>([]);
  const load = useCallback(async () => { /* fetch */ }, []);
  useEffect(() => { load(); }, [load]);
  return { camareros, reload: load };
}
```

---

#### ARCH-003 — No Repository/Service Layer
**Severity:** 🟡 Medium  
**Location:** All components  
**Description:**  
API calls are made directly from UI components using raw `fetch()`. There is no service/repository layer to abstract data access, making it impossible to:
- Unit test business logic independently
- Mock API calls in tests
- Switch data sources

**Recommended Pattern:**
```typescript
// src/services/camareros.service.ts
export const camarerosService = {
  getAll: () => apiClient.get('/camareros'),
  create: (data: CreateCamareroDTO) => apiClient.post('/camareros', data),
  update: (id: string, data: Partial<Camarero>) => apiClient.put(`/camareros/${id}`, data),
  delete: (id: string) => apiClient.delete(`/camareros/${id}`),
};
```

---

#### ARCH-004 — Inconsistent Type Definitions
**Severity:** 🟡 Medium  
**Location:** Multiple files  
**Description:**  
Domain types (`Camarero`, `Pedido`, etc.) are redefined locally in components instead of being imported from the centralized types file (`src/src/types.ts`). This leads to type drift and bugs.

**Remediation:**
1. Export all domain types from a single `src/types/index.ts`.
2. Configure TypeScript path aliases (already partially configured: `@types/*`).
3. Enforce single-source-of-truth via ESLint `import/no-duplicates` rule.

---

#### ARCH-005 — Duplicate Directory Structure
**Severity:** 🟡 Medium  
**Location:** `src/src/` directory  
**Description:**  
There is a `src/src/` directory containing `api/`, `schemas/`, `types.ts`, and `utils/` — creating a confusing duplicate of the top-level `src/` structure.

**Remediation:**
1. Merge `src/src/` contents into the main `src/` directory.
2. Update all import paths.
3. This was likely caused by an unresolved Git merge or scaffolding error.

---

#### ARCH-006 — N+1 Query Risk
**Severity:** 🟡 Medium  
**Location:** Components that cross-reference entities (e.g., displaying camarero names in pedidos)  
**Description:**  
Data is fetched independently for each entity type. When rendering relationships (e.g., showing which camarero is assigned to which pedido), components iterate through arrays and do lookups, which scales poorly.

**Remediation:**
1. Use Supabase's join queries to fetch related data in a single request.
2. Or implement a simple in-memory join on the frontend using Map for O(1) lookups.

---

#### ARCH-007 — No Error Boundaries at Component Level
**Severity:** 🟢 Low  
**Location:** `src/components/error-boundary.tsx`  
**Description:**  
There is a single `ErrorBoundary` at the application root. If one tab's component crashes, the whole app shows the error UI. Component-level boundaries would allow graceful degradation.

**Remediation:** Wrap each major tab section in its own `ErrorBoundary`.

---

#### ARCH-008 — Large Bundle Size
**Severity:** 🟢 Low  
**Location:** Build output  
**Description:**  
The main chunk is ~1.28 MB (391 KB gzipped). While acceptable for an internal tool, code splitting by route/tab would improve initial load time.

**Remediation:**
1. Use `React.lazy()` and `Suspense` for tab components.
2. Implement dynamic imports for heavy libraries (jsPDF, recharts, xlsx).

---

#### ARCH-009 — Missing Test Infrastructure
**Severity:** 🟠 High  
**Location:** `src/tests/`  
**Description:**  
The project has `vitest` and `@playwright/test` as dependencies and a `playwright.config.ts`, but the test directory contains minimal tests. There are no unit tests for business logic, no integration tests for API calls, and no comprehensive E2E tests.

**Remediation:**
1. Add unit tests for utility functions (logger, file-export, validators).
2. Add component tests using Vitest + Testing Library.
3. Add E2E tests for critical user flows (create pedido, assign camarero).
4. Target 70%+ coverage for business logic.

---

## Recommended Architecture (Target State)

```
src/
├── components/           ← Pure UI components
│   ├── ui/               ← Design system (Radix-based)
│   └── features/         ← Domain feature components
├── context/              ← React Context providers
├── hooks/                ← Custom hooks (data fetching, local state)
├── services/             ← API service layer
├── types/                ← Centralized type definitions
├── utils/                ← Pure utility functions
├── config/               ← Environment + app config
└── tests/                ← Colocated tests

src/supabase/functions/server/
├── index.tsx             ← Entry point only
├── routes/               ← Route handlers by domain
├── middleware/           ← Auth, rate-limit, logging
└── services/             ← Business logic services
```

---

## SOLID Principles Assessment

| Principle | Status | Notes |
|-----------|--------|-------|
| Single Responsibility | 🔴 Violated | Monolithic Edge Function; root App manages all state |
| Open/Closed | 🟡 Partial | Adding new entity types requires changes across multiple files |
| Liskov Substitution | 🟢 OK | Not applicable in most of codebase |
| Interface Segregation | 🟡 Partial | Prop interfaces are large/mixed |
| Dependency Inversion | 🔴 Violated | Components depend on concrete fetch() calls, not abstractions |
