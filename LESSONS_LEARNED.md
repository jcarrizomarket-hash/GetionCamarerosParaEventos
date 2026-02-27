# Lessons Learned

## Context

This document captures lessons learned during the CI/CD consolidation,
infrastructure hardening, and PR evaluation sprint conducted in February 2026.

---

## Lesson 1 — Pin GitHub Actions to Major Versions, Review Quarterly

**What happened:**
The CI workflow used `actions/upload-artifact@v3`, which GitHub deprecated in late 2024.
This produced `action_required` conclusions on every CI run, effectively silently
breaking the CI pipeline without obvious error messages.

**Why it mattered:**
Teams relying on CI status checks were unable to confidently merge PRs because the
CI conclusion was ambiguous. The root cause took time to identify because the
`action_required` state is unfamiliar compared to `failure`.

**What to do differently:**
- Use Dependabot to auto-update GitHub Actions versions:
  ```yaml
  # .github/dependabot.yml
  version: 2
  updates:
    - package-ecosystem: "github-actions"
      directory: "/"
      schedule:
        interval: "weekly"
  ```
- Subscribe to the [GitHub Changelog](https://github.blog/changelog/) for deprecation notices.
- Add a linting step that validates workflow YAML syntax (`actionlint`).

---

## Lesson 2 — Version-Control Every Database Schema Change

**What happened:**
The database schema was modified directly in the Supabase dashboard without
creating corresponding migration files. The `src/supabase/migrations/` directory
did not exist, making it impossible to reproduce the schema in a new environment.

**Why it mattered:**
- Onboarding new developers required manual schema recreation
- Disaster recovery lacked a clear, automated path to rebuild the database
- Code reviews could not include schema change review

**What to do differently:**
- Create a migration file for every schema change *before* applying it
- Run `supabase db diff --linked > migrations/NNN-description.sql` to capture changes
- Add a CI check that validates migrations can be applied cleanly on a fresh database

---

## Lesson 3 — Implement RLS from Day One

**What happened:**
Row-Level Security policies were not applied to all tables from the start.
This created a window where any authenticated user could read or write any row.

**Why it mattered:**
In a multi-tenant application, missing RLS is a critical data-isolation vulnerability.

**What to do differently:**
- Enable RLS on every new table immediately in the migration that creates it
- Include an RLS policy audit in the code review checklist
- Add a CI check that queries `pg_tables` and verifies `rowsecurity = true` for all app tables

---

## Lesson 4 — Automate PR Validation Gates Early

**What happened:**
PRs were merged without consistent validation. Some lacked passing tests,
others had type errors or lint warnings that were manually waived.

**Why it mattered:**
Technical debt accumulated faster than it could be addressed, and production
bugs slipped through that automated gates would have caught.

**What to do differently:**
- Enforce PR validation via `05-pr-validation.yml` from the start of the project
- Require at least one reviewer approval AND all CI checks to pass before merging
- Set up branch protection rules on `main` and `develop`

---

## Lesson 5 — Document Architecture Decisions as They Are Made

**What happened:**
Architecture decisions (technology choices, security controls, DB schema design)
were made implicitly and never documented. New team members had to reverse-engineer
the intent from the code.

**Why it mattered:**
Onboarding time was longer than necessary, and some decisions were inadvertently
reversed because their rationale was unknown.

**What to do differently:**
- Write a short Architecture Decision Record (ADR) for every significant decision
- Store ADRs in `docs/adr/` with a standard format:
  ```
  # ADR-NNN: Title
  Date: YYYY-MM-DD
  Status: Accepted
  Context: ...
  Decision: ...
  Consequences: ...
  ```
