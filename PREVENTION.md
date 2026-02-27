# Prevention Guide

## Purpose

This document describes automated and manual controls that prevent the categories
of issues identified during the CI/CD consolidation sprint.

---

## Pre-Merge Checks (Automated)

The following checks run automatically on every pull request via `05-pr-validation.yml`:

| Check | Command | Blocks Merge? |
|-------|---------|---------------|
| TypeScript type check | `npm run type-check` | Yes |
| ESLint | `npm run lint` | Yes |
| Build | `npm run build` | Yes |
| Unit tests | `npm run test` | Yes |
| Merge conflict detection | `git merge-tree` | Yes |

---

## Security Prevention

### Dependency Vulnerabilities

`01-security-audit.yml` runs `npm audit --audit-level=high` on every push and
on a daily schedule. High and critical vulnerabilities block the audit step.

**Manual check:**
```bash
npm audit --audit-level=high
npm audit fix          # auto-fix where possible
npm audit fix --force  # use only after reviewing breaking changes
```

### Hardcoded Secrets

`gitleaks` runs in `01-security-audit.yml` on every push to detect accidentally
committed secrets, API keys, or passwords.

**Pre-commit hook (recommended):**
```bash
brew install gitleaks          # macOS
gitleaks protect --staged      # scan staged files before commit
```

**`.gitleaks.toml` allowlist example:**
```toml
[allowlist]
  paths = [
    ".env.example",    # placeholder values only
  ]
```

---

## Database Prevention

### RLS Enforcement

Every new table must have RLS enabled and at least one policy. Use this checklist
when writing a migration:

```sql
-- 1. Create the table
CREATE TABLE my_table (...);

-- 2. Enable RLS immediately
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- 3. Add at least one policy
CREATE POLICY "authenticated_read" ON my_table
  FOR SELECT USING (auth.role() = 'authenticated');
```

### Migration Discipline

```bash
# Always generate a diff before applying manual changes
supabase db diff --linked > src/supabase/migrations/NNN-description.sql

# Push migrations to linked project
supabase db push

# Verify current migration status
supabase migration list
```

---

## CI/CD Prevention

### Keep Actions Updated

Add Dependabot for GitHub Actions in `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

### Branch Protection Rules

Configure the following in `Settings → Branches → Branch protection rules` for
`main` and `develop`:

- ✅ Require a pull request before merging
- ✅ Require at least 1 approval
- ✅ Require status checks to pass before merging:
  - `lint-and-build (18.x)`
  - `lint-and-build (20.x)`
  - `validate` (from `05-pr-validation.yml`)
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

---

## Code Quality Prevention

### Coverage Threshold

Add a coverage threshold to `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/) to enable
automated changelog generation and semantic versioning:

```
feat: add waitstaff availability calendar
fix: resolve double-booking on concurrent event assignments
docs: update deployment guide with rollback steps
chore: upgrade upload-artifact to v4
```

---

## Incident Prevention

- Review the `INCIDENT-RESPONSE.md` runbooks before an incident occurs
- Conduct quarterly fire drills (simulate a production outage and follow the runbook)
- Keep the `KNOWN_ISSUES.md` document up to date after every post-mortem
