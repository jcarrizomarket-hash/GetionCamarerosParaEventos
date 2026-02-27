# Remediation Plan

**Application:** Gestión de Camareros para Eventos  
**Created:** 2026-02-27  
**Based on:** SECURITY_AUDIT.md, ARCHITECTURE_REVIEW.md

---

## Phase 1 — Critical (Complete within 24–48 hours)

### P1.1 Enable Supabase Row-Level Security
**Addresses:** CRIT-001, CRIT-002  
**Effort:** Low (configuration change, no code)

```sql
-- Enable RLS on all tables
ALTER TABLE camareros ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordinadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Example policy: allow authenticated users to read
CREATE POLICY "Authenticated users can read camareros"
  ON camareros FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admin-only write operations
CREATE POLICY "Admin users can modify camareros"
  ON camareros FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

**Acceptance Criteria:**
- [ ] All tables have RLS enabled
- [ ] Anonymous reads return 0 rows when RLS is active
- [ ] Authenticated users can read data
- [ ] Only authorized roles can write

---

### P1.2 Add JWT Verification to Edge Functions
**Addresses:** CRIT-002  
**Effort:** Medium (code change in server function)

```typescript
// src/supabase/functions/server/middleware/auth.ts
import { createClient } from '@supabase/supabase-js';

export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.slice(7);
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  c.set('user', user);
  await next();
}
```

**Acceptance Criteria:**
- [ ] Unauthenticated requests to write endpoints return 401
- [ ] Valid tokens are accepted
- [ ] Expired/invalid tokens are rejected

---

## Phase 2 — High Priority (Complete within 1 week)

### P2.1 Add Input Validation with Zod
**Addresses:** HIGH-001  
**Effort:** Medium

```typescript
// src/supabase/functions/server/schemas/camarero.schema.ts
import { z } from 'zod';

export const CreateCamareroSchema = z.object({
  nombre: z.string().min(1).max(100),
  telefono: z.string().regex(/^\+?[\d\s-]{7,20}$/).optional(),
  email: z.string().email().optional(),
  activo: z.boolean().default(true),
  notas: z.string().max(500).optional(),
});

// In route handler:
const result = CreateCamareroSchema.safeParse(await c.req.json());
if (!result.success) {
  return c.json({ error: 'Validation failed', details: result.error.issues }, 400);
}
```

**Acceptance Criteria:**
- [ ] All POST/PUT endpoints validate request bodies
- [ ] Invalid inputs return 400 with descriptive errors
- [ ] Valid inputs are processed normally

---

### P2.2 Sanitize Error Responses
**Addresses:** HIGH-003  
**Effort:** Low

Replace all instances of:
```typescript
return c.json({ success: false, error: String(error) }, 500);
```
With:
```typescript
console.error('[ERROR]', error); // server-side only
return c.json({ success: false, error: 'An internal error occurred' }, 500);
```

**Acceptance Criteria:**
- [ ] No stack traces or internal details returned to clients
- [ ] Errors are logged server-side with full context
- [ ] Client receives generic error messages

---

### P2.3 Update Vulnerable Dependencies
**Addresses:** HIGH-004  
**Effort:** Low

```bash
# Check current vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# For xlsx (prototype pollution - CVE):
# Option A: Update to latest (may have breaking changes)
npm install xlsx@latest

# Option B: Replace with exceljs
npm uninstall xlsx
npm install exceljs
# Update src/utils/file-export.ts accordingly
```

**Acceptance Criteria:**
- [ ] `npm audit` reports 0 high/critical vulnerabilities
- [ ] All existing export functionality still works
- [ ] Build passes

---

### P2.4 Implement Rate Limiting
**Addresses:** HIGH-002  
**Effort:** Medium

```typescript
// src/supabase/functions/server/middleware/rate-limit.ts
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 100;
const WINDOW_MS = 60_000;

export async function rateLimit(c: Context, next: Next) {
  const ip = c.req.header('x-forwarded-for') ?? 'unknown';
  const now = Date.now();
  const entry = requestCounts.get(ip) ?? { count: 0, resetAt: now + WINDOW_MS };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }

  entry.count++;
  requestCounts.set(ip, entry);

  if (entry.count > LIMIT) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  c.header('X-RateLimit-Limit', String(LIMIT));
  c.header('X-RateLimit-Remaining', String(LIMIT - entry.count));
  await next();
}
```

**Acceptance Criteria:**
- [ ] Requests beyond 100/minute per IP return 429
- [ ] Rate limit headers are returned on all responses
- [ ] Legitimate traffic is not affected

---

## Phase 3 — Medium Priority (Complete within 2 weeks)

### P3.1 Add Content Security Policy
**Addresses:** MED-001  
**Effort:** Low

In `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               connect-src 'self' https://*.supabase.co; 
               script-src 'self' 'nonce-{NONCE}'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: blob:;">
```

Or via hosting platform (Vercel `vercel.json`):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; connect-src 'self' https://*.supabase.co;" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

### P3.2 Refactor State Management
**Addresses:** ARCH-002  
**Effort:** High

1. Create `src/context/AppContext.tsx` with a React Context provider.
2. Move all `useState` arrays out of `App.tsx`.
3. Create custom hooks: `useCamareros()`, `usePedidos()`, `useCoordinadores()`, `useClientes()`.
4. Update all components to use hooks instead of props.

---

### P3.3 Merge src/src/ into src/
**Addresses:** ARCH-005  
**Effort:** Medium

1. Move `src/src/api/client.ts` → `src/api/client.ts`
2. Move `src/src/schemas/` → `src/schemas/`
3. Move `src/src/types.ts` → `src/types/index.ts`
4. Update all imports.
5. Delete `src/src/` directory.

---

### P3.4 Add Security Event Logging
**Addresses:** MED-005  
**Effort:** Medium

Extend `src/utils/logger.ts` to capture security events:
```typescript
export function logSecurityEvent(event: string, metadata: Record<string, unknown>) {
  logger.warn(`[SECURITY] ${event}`, metadata);
  // In production: send to monitoring service
}
```

Log events:
- Authentication failures
- Rate limit hits
- Unauthorized access attempts
- Input validation failures

---

## Phase 4 — Low Priority / Technical Debt (Complete within 1 month)

### P4.1 Add Comprehensive Tests
**Addresses:** ARCH-009  
**Effort:** High

Priority test areas:
1. Unit: `src/utils/logger.ts`, `src/utils/file-export.ts`, all schema validators
2. Component: Dashboard, Pedidos form, Camareros table
3. Integration: API client with mocked responses
4. E2E: Create pedido flow, assign camarero flow

Target: 70% branch coverage for business logic

---

### P4.2 Replace console.error with Logger
**Addresses:** LOW-001  
**Effort:** Low

Search and replace all `console.error`, `console.warn`, `console.log` calls with appropriate `logger.error()`, `logger.warn()`, `logger.info()` calls from `src/utils/logger.ts`.

```bash
# Find all console.* calls
grep -rn "console\." src/ --include="*.ts" --include="*.tsx"
```

---

### P4.3 Environment Variable Validation
**Addresses:** LOW-004  
**Effort:** Low

```typescript
// src/config/env.ts - add validation
function validateEnv() {
  const required = ['VITE_SUPABASE_PROJECT_ID', 'VITE_SUPABASE_ANON_KEY'];
  const missing = required.filter(k => !import.meta.env[k]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Call at app startup in main.tsx
```

---

## Timeline Summary

| Phase | Timeline | Items |
|-------|----------|-------|
| Phase 1 — Critical | 24–48 hours | P1.1, P1.2 |
| Phase 2 — High | 1 week | P2.1, P2.2, P2.3, P2.4 |
| Phase 3 — Medium | 2 weeks | P3.1, P3.2, P3.3, P3.4 |
| Phase 4 — Low | 1 month | P4.1, P4.2, P4.3 |

## Success Metrics

- `npm audit` reports 0 critical/high vulnerabilities
- `npm ci && npm run lint && npm run build` passes in CI
- All API endpoints return 401 for unauthenticated requests
- 70%+ test coverage for business logic
- No merge conflict markers in source code
- All domain types imported from a single source
