# Known Issues & Solutions

## Overview

This document tracks known issues in the codebase and their recommended solutions.
It is updated as new PRs are opened, reviewed, and merged.

---

## Open PR Evaluation Matrix

| PR # | Title | Author | Status | Severity | Root Cause | Solution | ETA |
|------|-------|--------|--------|----------|-----------|----------|-----|
| #70 | docs: add operational documentation suite + fix deprecated CI action | Copilot | Open (draft) | 🟡 MEDIUM | `upload-artifact@v3` deprecated; missing operational docs | Upgrade to `@v4`; add DEPLOYMENT-GUIDE, MONITORING-SETUP, INCIDENT-RESPONSE, TEAM-ONBOARDING | 0–1 day |
| #73 | [WIP] Add GitHub secrets and SQL migrations for CI/CD | Copilot | Open (draft) | 🟠 HIGH | Missing SQL migrations and secrets configuration | Add 4 SQL migrations + secrets documentation | 0–4 hours |

---

## Issue #1 — Deprecated `actions/upload-artifact@v3`

**Affected PRs:** All branches using `ci.yml`

**Severity:** 🟠 HIGH — causes `action_required` CI conclusion

**Root Cause:**
GitHub deprecated `actions/upload-artifact@v3` and `@v2` in 2024. Workflows using
these versions receive an `action_required` conclusion instead of `success` or `failure`,
which blocks PR merges in repositories with required status checks.

**Solution:**
```yaml
# Before
uses: actions/upload-artifact@v3
# After
uses: actions/upload-artifact@v4
```

**Status:** ✅ Fixed in this PR (`ci.yml` updated to `@v4`)

---

## Issue #2 — Missing SQL Migrations

**Affected PRs:** #73

**Severity:** 🟠 HIGH — database schema not version-controlled

**Root Cause:**
The `src/supabase/migrations/` directory did not exist. Without migration files,
the database schema cannot be reproducibly applied to new environments, making
onboarding and disaster-recovery difficult.

**Solution:**
Four migration files created:
- `001-create-audit-trail.sql` — audit logging table + trigger function
- `002-create-error-logs.sql` — runtime error capture table
- `003-create-rls-policies.sql` — Row-Level Security policies for all tables
- `004-create-indexes.sql` — performance indexes for common query patterns

**Status:** ✅ Fixed in this PR

---

## Issue #3 — Missing GitHub Actions Workflows

**Affected PRs:** #73

**Severity:** 🟡 MEDIUM — CI/CD automation incomplete

**Root Cause:**
Only a single `ci.yml` workflow existed. No security audit, test automation,
deployment, anomaly detection, or PR validation workflows were present.

**Solution:**
Five new workflows added to `.github/workflows/`:
- `01-security-audit.yml` — daily + on-push security scanning
- `02-test-automation.yml` — unit, integration, and E2E tests
- `03-deploy-production.yml` — build and deploy to production
- `04-anomaly-detection.yml` — scheduled health checks every 15 min
- `05-pr-validation.yml` — gates all PRs with lint, type-check, build, test

**Status:** ✅ Fixed in this PR

---

## Issue #4 — Missing Operational Documentation

**Affected PRs:** #70

**Severity:** 🟢 LOW — no immediate functional impact

**Root Cause:**
Operational runbooks (deployment guide, monitoring setup, incident response,
team onboarding) were absent, creating risk during incidents or team expansion.

**Solution:**
Operational documentation added in PR #70 and this PR.

**Status:** 🔄 In progress (PR #70 + this PR)

---

## Common Error Patterns

### Pattern: Deprecated GitHub Actions

**PRs affected:** All CI-related branches

**Common cause:** Actions ecosystem moves fast; pinned versions become deprecated.

**Prevention:**
- Enable Dependabot for GitHub Actions version updates in `.github/dependabot.yml`
- Review action deprecation notices in the GitHub changelog quarterly

### Pattern: Missing Database Migrations

**PRs affected:** #73

**Common cause:** Schema changes applied directly in Supabase dashboard without
creating a corresponding migration file.

**Prevention:**
- Always create a migration file for every schema change
- Run `supabase db diff` before pushing to catch undocumented changes
- Add a CI step that validates migration files exist for schema changes

### Pattern: Insufficient Test Coverage

**Common cause:** New features added without corresponding tests.

**Prevention:**
- Enforce minimum 70% coverage in CI via `vitest --coverage`
- Block merges if coverage drops below threshold (add to `05-pr-validation.yml`)
