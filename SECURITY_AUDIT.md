# Security Audit Report

**Application:** Gestión de Camareros para Eventos  
**Audit Date:** 2026-02-27  
**Auditor:** Security Review Process  
**Scope:** Full application audit — Frontend, Backend (Supabase Functions), Database, DevOps

---

## Executive Summary

This report documents the findings from a comprehensive security audit of the Event Waitstaff Management application. The application is a React/TypeScript SPA that communicates with Supabase Edge Functions and uses Supabase as its database backend.

**Overall Risk Level:** 🟠 HIGH

| Severity | Count |
|----------|-------|
| 🔴 Critical | 2 |
| 🟠 High | 5 |
| 🟡 Medium | 7 |
| 🟢 Low | 4 |

---

## Critical Findings

### CRIT-001 — API Anon Key Exposed in Frontend Bundle
**Severity:** 🔴 Critical  
**Location:** `src/utils/supabase/info.tsx`, `src/App.tsx`  
**Description:**  
The Supabase public anon key (`publicAnonKey`) is embedded in the frontend code and passed as an `Authorization: Bearer` header on every API request. While the anon key is intended to be public, passing it without Row-Level Security (RLS) policies allows unauthenticated clients to call all endpoints.

**Risk:** Data exposure, unauthorized data manipulation.  
**Remediation:**
1. Enable RLS on all Supabase tables.
2. Use Supabase Auth for user authentication.
3. Audit Edge Functions to validate the JWT before processing any write operations.
4. Rotate the anon key if it was ever used as a service-role key.

---

### CRIT-002 — No Authentication on State-Mutating API Endpoints
**Severity:** 🔴 Critical  
**Location:** `src/supabase/functions/server/index.tsx` (POST, PUT, DELETE routes)  
**Description:**  
The backend Edge Function accepts POST/PUT/DELETE requests from any caller who provides the anon key. There is no user authentication check — any party who obtains the anon key can create, update, or delete records.

**Risk:** Unauthorized data modification, data loss.  
**Remediation:**
1. Implement JWT verification in the Edge Function middleware.
2. Add an `x-fn-secret` header check for sensitive operations (partially implemented in `src/src/api/client.ts`; enforce this on the server side).
3. Consider using Supabase Row Level Security instead of application-level auth for simpler deployments.

---

## High Findings

### HIGH-001 — No Input Validation on API Endpoints
**Severity:** 🟠 High  
**Location:** `src/supabase/functions/server/index.tsx`  
**Description:**  
Request bodies received by the Edge Function are used directly without schema validation. User-controlled data flows into database queries and responses without sanitization.

**Risk:** Malformed data corruption, potential injection via the Supabase client if RLS is not configured.  
**Remediation:**
1. Use the `zod` library (already a project dependency) to validate all incoming request bodies.
2. Return `400 Bad Request` for invalid payloads.

---

### HIGH-002 — Missing Rate Limiting
**Severity:** 🟠 High  
**Location:** All API endpoints in `src/supabase/functions/server/index.tsx`  
**Description:**  
There is no rate limiting on any endpoint. The application is vulnerable to brute-force and denial-of-service attacks.

**Risk:** Service unavailability, resource exhaustion.  
**Remediation:**
1. Implement rate limiting at the Supabase Edge Function level using a KV-based sliding window counter.
2. Alternatively, use Cloudflare or another CDN with built-in rate limiting as a proxy.

---

### HIGH-003 — Sensitive Data in Error Responses
**Severity:** 🟠 High  
**Location:** `src/supabase/functions/server/index.tsx` (multiple catch blocks)  
**Description:**  
Error handlers return `String(error)` directly in API responses. This can expose internal stack traces, file paths, or database error messages to clients.

**Risk:** Information disclosure, facilitates targeted attacks.  
**Remediation:**
1. Return generic error messages to clients (e.g., `"An internal error occurred"`).
2. Log the full error server-side using a secure logging mechanism.

---

### HIGH-004 — Dependency Vulnerabilities (npm audit)
**Severity:** 🟠 High  
**Location:** `package.json`  
**Description:**  
`npm audit` reports 8 vulnerabilities (5 moderate, 2 high, 1 critical) in the dependency tree. Key affected packages include `xlsx` (prototype pollution) and `jspdf`.

**Risk:** Supply-chain attack, data exposure.  
**Remediation:**
1. Run `npm audit fix` to automatically patch patchable vulnerabilities.
2. Evaluate replacing `xlsx@0.18.5` with `exceljs` or `xlsx@>=0.20.0` (SheetJS Pro) which has security patches.
3. Add `npm audit --audit-level=high` as a CI gate (see `security-gates.yml`).

---

### HIGH-005 — No CSRF Protection
**Severity:** 🟠 High  
**Location:** All state-mutating API calls  
**Description:**  
The application does not implement CSRF tokens. Any malicious site can trick an authenticated user's browser into making state-changing requests to the API.

**Risk:** Cross-Site Request Forgery attacks.  
**Remediation:**
1. Implement `SameSite=Strict` or `SameSite=Lax` on session cookies.
2. Use CSRF tokens for all state-mutating operations if cookie-based auth is used.
3. Since the app currently uses Bearer tokens (not cookies), ensure tokens are stored in memory, not `localStorage`.

---

## Medium Findings

### MED-001 — No Content Security Policy (CSP)
**Severity:** 🟡 Medium  
**Location:** `index.html`  
**Description:**  
The application does not set a Content-Security-Policy header. This leaves the application vulnerable to XSS attacks.

**Remediation:** Add CSP headers via the server or meta tag. Start with a strict policy and relax as needed.

---

### MED-002 — XSS Risk via dangerouslySetInnerHTML
**Severity:** 🟡 Medium  
**Location:** `src/supabase/functions/server/index.tsx` (HTML email generation), various components  
**Description:**  
Several places construct HTML strings from user-supplied data for email parts. If this HTML is ever rendered in a browser context, it constitutes an XSS risk.

**Remediation:**
1. Sanitize all HTML with DOMPurify before any browser rendering.
2. For email generation, use templating libraries that auto-escape variables.

---

### MED-003 — Tokens Potentially Stored in localStorage
**Severity:** 🟡 Medium  
**Location:** `src/config/env.ts`, Supabase JS client  
**Description:**  
Supabase JS by default stores session tokens in `localStorage`, which is accessible to any JavaScript on the page. This makes tokens vulnerable to XSS theft.

**Remediation:**
1. Configure Supabase to use `sessionStorage` or in-memory storage.
2. Implement CSP to reduce XSS risk (see MED-001).

---

### MED-004 — Missing Security Headers
**Severity:** 🟡 Medium  
**Location:** Application deployment configuration  
**Description:**  
The application lacks standard security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

**Remediation:** Configure these headers at the CDN/hosting level (Vercel, Netlify, etc.).

---

### MED-005 — No Logging for Security Events
**Severity:** 🟡 Medium  
**Location:** All API endpoints  
**Description:**  
Security-relevant events (authentication failures, unauthorized access attempts, rate limit hits) are not logged. This makes incident detection and forensic analysis impossible.

**Remediation:**
1. Log all authentication failures with source IP and timestamp.
2. Log all 4xx/5xx responses with request metadata (excluding PII).
3. Integrate with a SIEM or security monitoring service.

---

### MED-006 — Merge Conflict Markers in Source Code
**Severity:** 🟡 Medium (code quality / integrity)  
**Location:** `src/src/api/client.ts`, `src/supabase/functions/server/index.tsx` (resolved in this PR)  
**Description:**  
Unresolved Git merge conflict markers were found in two source files, indicating broken code that would fail to compile.

**Remediation:** Resolved in this PR. Implement merge conflict detection in CI (see `security-gates.yml`).

---

### MED-007 — Broken/Stub Source Files Committed
**Severity:** 🟡 Medium (code integrity)  
**Location:** `src/components/admin.tsx` (resolved in this PR)  
**Description:**  
The `src/components/admin.tsx` component was replaced with a non-functional stub that imported a non-existent package (`secure-file-exports`), breaking the entire application build.

**Remediation:** Restored in this PR. Add build verification to CI (already present in `ci.yml`).

---

## Low Findings

### LOW-001 — Verbose console.error in Production
**Severity:** 🟢 Low  
**Location:** Multiple components  
**Description:**  
Several catch blocks use `console.error` directly instead of the project's centralized logger. This logs errors to the browser console in production.

**Remediation:** Replace all `console.error`/`console.log` calls with the `logger` utility from `src/utils/logger.ts`.

---

### LOW-002 — Dead Code / Unused Imports
**Severity:** 🟢 Low  
**Location:** `src/App.tsx`, `src/components/camareros.tsx`  
**Description:**  
Multiple unused imports and variables are present in the codebase.

**Remediation:** Enable `no-unused-vars` in ESLint and TypeScript's `noUnusedLocals`/`noUnusedParameters` (already configured in `tsconfig.json`).

---

### LOW-003 — No HTTPS Enforcement
**Severity:** 🟢 Low  
**Location:** Deployment configuration  
**Description:**  
There is no explicit HTTPS redirect or HSTS header configured.

**Remediation:** Configure HSTS at the hosting level.

---

### LOW-004 — Missing .env Validation at Startup
**Severity:** 🟢 Low  
**Location:** `src/config/env.ts`  
**Description:**  
The application silently uses empty strings when environment variables are not set, leading to cryptic errors at runtime.

**Remediation:** Add a startup validation function that checks required env vars and provides clear error messages. Consider using `zod` to define and validate the env schema.

---

## Recommendations Priority Matrix

| Priority | Action | Timeline |
|----------|--------|----------|
| 🔴 Immediate | Enable RLS on all Supabase tables | 24 hours |
| 🔴 Immediate | Add JWT verification to all API endpoints | 24 hours |
| 🟠 This Sprint | Add input validation with zod on all endpoints | 1 week |
| 🟠 This Sprint | Sanitize error messages in API responses | 1 week |
| 🟠 This Sprint | Update vulnerable dependencies | 1 week |
| 🟡 Next Sprint | Implement CSP headers | 2 weeks |
| 🟡 Next Sprint | Add rate limiting | 2 weeks |
| 🟡 Next Sprint | Implement security event logging | 2 weeks |
| 🟢 Backlog | Replace console.error with logger | 1 month |
| 🟢 Backlog | Add HSTS header | 1 month |

---

## Tools Used
- Manual code review
- `npm audit` for dependency vulnerability scanning
- TypeScript type checker (`tsc --noEmit`)
- ESLint static analysis
- Git history analysis for merge conflicts and code integrity
