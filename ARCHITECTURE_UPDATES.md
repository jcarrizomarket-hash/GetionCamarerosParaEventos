# Architecture Updates

## Summary of Architectural Changes

This document records architectural decisions and changes introduced as part of
the CI/CD consolidation and infrastructure hardening effort.

---

## Change 1 — CI Workflow Upgraded to Non-Deprecated Actions

**Date:** 2026-02-27
**PR:** #72
**Component:** `.github/workflows/ci.yml`

### Before
```yaml
uses: actions/upload-artifact@v3   # deprecated
```

### After
```yaml
uses: actions/upload-artifact@v4   # current LTS
```

**Impact:** Resolves `action_required` CI conclusions. All future artifact uploads
use the v4 API which includes improved compression and parallel upload support.

---

## Change 2 — SQL Migration Layer Added

**Date:** 2026-02-27
**PR:** #72
**Component:** `src/supabase/migrations/`

### Architecture Decision
All database schema changes are now version-controlled as numbered SQL migration
files. This enables:
- Reproducible environments for development, staging, and production
- Auditable schema history via git blame
- Rollback capability by running migrations in reverse

### New Tables
| Table | Purpose |
|-------|---------|
| `audit_trail` | Immutable log of all INSERT/UPDATE/DELETE operations |
| `error_logs` | Runtime error capture from Edge Functions and frontend |

### New Security Controls
- Row-Level Security (RLS) enabled on `eventos`, `camareros`, `asignaciones`, `user_profiles`
- Service-role-only write access to audit and error tables
- Users can only read their own error logs

### Performance Indexes
- `idx_eventos_fecha` — upcoming events ordered by date
- `idx_camareros_disponible` — available waitstaff filter
- `idx_asignaciones_evento_camarero` — unique composite index (prevents double-booking)
- `idx_audit_trail_write_ops` — fast compliance queries
- `idx_error_logs_critical_recent` — dashboard critical error view

---

## Change 3 — Expanded CI/CD Workflow Suite

**Date:** 2026-02-27
**PR:** #72
**Component:** `.github/workflows/`

### Workflow Architecture

```
Push to main/develop
        │
        ├─► ci.yml                  (lint + build) ← existing, upgraded
        ├─► 01-security-audit.yml   (npm audit + secret scanning)
        ├─► 02-test-automation.yml  (unit + integration + E2E)
        └─► 03-deploy-production.yml (build + deploy artifact)

Pull Request opened/updated
        │
        └─► 05-pr-validation.yml    (lint + type-check + build + test + conflict check)

Scheduled (every 15 min)
        │
        └─► 04-anomaly-detection.yml (vulnerability scan + build integrity check)
```

### Key Design Choices
- All artifact upload steps use `actions/upload-artifact@v4`
- E2E tests (`02-test-automation.yml`) depend on unit tests passing first
- PR validation skips draft PRs to avoid unnecessary compute
- Deploy workflow requires explicit `environment` approval for production

---

## Security Architecture

### Layers of Defence
1. **Secret scanning** — `gitleaks` in `01-security-audit.yml` prevents credentials in code
2. **Dependency scanning** — `npm audit --audit-level=high` on every push
3. **RLS policies** — database-level access control for all tables
4. **Audit trail** — immutable log of all data mutations
5. **PR gates** — build and tests must pass before merge

### Secrets Required
The following GitHub Actions secrets must be configured in
`Settings → Secrets and variables → Actions`:

| Secret | Purpose | How to obtain |
|--------|---------|---------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase dashboard → Settings → API |
| `SUPABASE_TOKEN` | Supabase CLI authentication | `supabase.com` → Account → Access Tokens |
| `SUPABASE_PROJECT_ID` | Target project for migrations | Supabase dashboard → Project Settings |
| `SLACK_WEBHOOK` | Deployment notifications | Slack → Apps → Incoming Webhooks |
| `SENTRY_DSN` | Error tracking | Sentry → Project → Settings → Client Keys |
