# Setup Final - Implementation Checklist

Complete checklist for deploying the full infrastructure of this project.

---

## Phase 1: Repository Secrets

- [ ] Add `VITE_SUPABASE_URL` to GitHub Secrets
- [ ] Add `VITE_SUPABASE_ANON_KEY` to GitHub Secrets
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to GitHub Secrets
- [ ] Add `SUPABASE_DB_PASSWORD` to GitHub Secrets
- [ ] Add `NODE_ENV` to GitHub Secrets
- [ ] Add `APP_SECRET_KEY` to GitHub Secrets
- [ ] Add `WHATSAPP_API_TOKEN` to GitHub Secrets
- [ ] Add `WHATSAPP_PHONE_NUMBER_ID` to GitHub Secrets
- [ ] Add `WHATSAPP_VERIFY_TOKEN` to GitHub Secrets
- [ ] Add `RESEND_API_KEY` to GitHub Secrets
- [ ] Add `EMAIL_FROM_ADDRESS` to GitHub Secrets

> See [SECRETS_TEMPLATE.md](./SECRETS_TEMPLATE.md) for detailed instructions.

---

## Phase 2: Supabase Database Migrations

Run the following migrations in order in the Supabase SQL Editor or via the Supabase CLI:

- [ ] `src/supabase/migrations/001-create-audit-trail.sql` — Audit trail table
- [ ] `src/supabase/migrations/002-create-error-logs.sql` — Error logs table
- [ ] `src/supabase/migrations/003-create-rls-policies.sql` — Row Level Security policies
- [ ] `src/supabase/migrations/004-create-indexes.sql` — Performance indexes

### Running Migrations via Supabase CLI

```bash
# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref <your-project-ref>

# Run migrations
npx supabase db push
```

### Running Migrations via SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Open and run each migration file in order (001 → 002 → 003 → 004)

---

## Phase 3: GitHub Actions Workflows

Verify that all workflows are active and configured:

- [ ] `01-security-audit.yml` — Runs weekly and on push/PR
- [ ] `02-test-automation.yml` — Runs on push/PR, validates build
- [ ] `03-deploy-production.yml` — Runs on push to main/master
- [ ] `04-anomaly-detection.yml` — Runs every 6 hours
- [ ] `05-pr-validation.yml` — Runs on every PR

### Verify Workflows

1. Go to your repository on GitHub
2. Navigate to **Actions**
3. Confirm all 5 workflows appear in the list
4. Trigger `workflow_dispatch` on each to test manually

---

## Phase 4: Environment Setup

- [ ] Create `production` environment in GitHub Settings → Environments
- [ ] Create `staging` environment in GitHub Settings → Environments
- [ ] Add required reviewers for production environment (recommended)
- [ ] Configure environment-specific secrets for staging and production

---

## Phase 5: Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Fill in your local development credentials in .env
# Required variables:
#   VITE_SUPABASE_URL=
#   VITE_SUPABASE_ANON_KEY=

# Start development server
npm run dev

# Run type check
npm run type-check

# Run linter
npm run lint

# Build for production
npm run build
```

---

## Phase 6: Verification

- [ ] Development server starts without errors (`npm run dev`)
- [ ] TypeScript type check passes (`npm run type-check`)
- [ ] ESLint passes with no errors (`npm run lint`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Security audit passes (`npm audit`)
- [ ] All GitHub Actions workflows run successfully

---

## Quick Status Check

```bash
# Check all npm vulnerabilities
npm audit

# Check outdated packages
npm outdated

# Verify build
npm run build
```

---

## Support

- See [README.md](./README.md) for general project documentation
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system architecture
- See [SECURITY_REMEDIATION.md](./SECURITY_REMEDIATION.md) for security notes
- See [SECRETS_TEMPLATE.md](./SECRETS_TEMPLATE.md) for secrets configuration
