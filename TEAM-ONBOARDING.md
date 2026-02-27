# Team Onboarding

Welcome to the Event Waitstaff Management System! This guide gets new team members set up and productive as quickly as possible.

## Table of Contents

- [Day 1 – Environment Setup](#day-1--environment-setup)
- [Daily Workflow](#daily-workflow)
- [Best Practices](#best-practices)
- [Resources and References](#resources-and-references)

---

## Day 1 – Environment Setup

### 1. Access and Accounts

Request access to the following before your first day:

- [ ] GitHub repository (write access)
- [ ] Supabase project dashboard
- [ ] Slack workspace and `#incidents`, `#monitoring`, `#dev` channels
- [ ] Sentry organization (error tracking)

### 2. Clone and Install

```bash
git clone https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos.git
cd GetionCamarerosParaEventos
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with the Supabase credentials provided by your lead:

```bash
VITE_SUPABASE_PROJECT_ID=<project-id>
VITE_SUPABASE_ANON_KEY=<anon-key>
```

> **Security note:** Never commit `.env` to version control. Never add `SUPABASE_FN_SECRET` or any secret to a `VITE_*` variable — those values are exposed to the browser.

### 4. Start the Development Server

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### 5. Install Playwright Browsers (E2E tests)

```bash
npx playwright install
```

### 6. Verify Everything Works

```bash
npm run type-check   # Should exit 0
npm run lint         # Should exit 0
npm run build        # Should produce dist/
npm test             # Unit tests should pass
```

---

## Daily Workflow

### Starting Work

```bash
git checkout main
git pull origin main
git checkout -b <type>/<short-description>
# e.g. feat/add-export-button, fix/midnight-hours-bug
```

### During Development

- Run `npm run dev` for live-reload development.
- Run `npm run type-check` frequently — fix TypeScript errors before committing.
- Run `npm test` before opening a PR.

### Opening a Pull Request

1. Push your branch: `git push origin <branch-name>`
2. Open a PR against `main` on GitHub.
3. Fill in the PR description: what changed, why, how to test it.
4. Wait for CI (lint + type-check + build) to pass.
5. Request a review from a team member.

### Code Review

- Review PRs promptly (target: within 1 business day).
- Leave constructive comments — suggest alternatives, not just problems.
- Approve only when you are confident the change is correct and safe.

---

## Best Practices

### TypeScript

- Use strict types; avoid `any`.
- Import domain types from `src/types.ts`.
- Define interfaces for component props.

### API Calls

Use the centralized client — never write raw `fetch()` in components:

```typescript
import { getPedidos } from '../src/api/client';
const result = await getPedidos();
```

### Secrets

- Store all secrets in **GitHub → Settings → Secrets and variables → Actions**.
- See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) for the full list of required secrets.
- Rotate secrets whenever a team member leaves.

### Commits

Follow the conventional commit format:

```
feat: add PDF export for weekly reports
fix: correct midnight-crossing hour calculation
docs: update README with deployment instructions
test: add unit tests for formatearTelefono helper
chore: upgrade eslint-plugin-react-hooks to v5
```

### Incident Response

If you detect a production issue, follow the procedures in [INCIDENT-RESPONSE.md](./INCIDENT-RESPONSE.md).

---

## Resources and References

| Resource | Link |
|----------|------|
| Architecture overview | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Deployment guide | [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) |
| Monitoring setup | [MONITORING-SETUP.md](./MONITORING-SETUP.md) |
| Incident response | [INCIDENT-RESPONSE.md](./INCIDENT-RESPONSE.md) |
| Contributing guide | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Changelog | [CHANGELOG.md](./CHANGELOG.md) |
| Supabase docs | https://supabase.com/docs |
| Vite docs | https://vitejs.dev |
| React docs | https://react.dev |
| Tailwind CSS docs | https://tailwindcss.com/docs |
| Vitest docs | https://vitest.dev |
| Playwright docs | https://playwright.dev |
