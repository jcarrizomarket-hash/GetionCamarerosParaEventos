# Deployment Guide

Step-by-step instructions for deploying, rolling back, and validating the Event Waitstaff Management System.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Steps](#deployment-steps)
- [Rollback Procedure](#rollback-procedure)
- [Troubleshooting](#troubleshooting)
- [Post-Deploy Validation](#post-deploy-validation)

---

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Access to the Supabase project
- GitHub repository write access (for CI/CD secrets)

---

## Environment Variables

Configure the following secrets in **Settings → Secrets and variables → Actions** before deploying:

| Secret | Description |
|--------|-------------|
| `SUPABASE_TOKEN` | Supabase access token for deployments |
| `SLACK_WEBHOOK` | Slack incoming webhook URL for notifications |
| `SENTRY_DSN` | Sentry Data Source Name for error tracking |
| `SNYK_TOKEN` | Snyk token for vulnerability scanning |
| `CODECOV_TOKEN` | Codecov token for coverage reports |
| `SONARQUBE_HOST` | SonarQube server URL |
| `SONARQUBE_TOKEN` | SonarQube authentication token |
| `ENCRYPTION_KEY` | 32-byte hex encryption key |
| `ALLOWED_ORIGINS` | JSON array of allowed CORS origins |
| `SUPABASE_FN_SECRET` | Secret for Supabase Edge Functions (generate with `openssl rand -hex 32`) |

> **Note:** `GITHUB_TOKEN` is automatically provided by GitHub Actions — do not add it manually.

---

## Deployment Steps

### 1. Build the Frontend

```bash
npm ci
npm run type-check
npm run lint
npm run build
```

The production assets are output to `dist/`.

### 2. Deploy Supabase Edge Functions

```bash
npx supabase login --token "$SUPABASE_TOKEN"
npx supabase functions deploy server --project-ref <project-ref>
```

### 3. Deploy Frontend

Upload the `dist/` directory to your hosting provider (Netlify, Vercel, or a static file host).

**Netlify example:**

```bash
npx netlify-cli deploy --prod --dir=dist --auth "$NETLIFY_TOKEN"
```

### 4. Verify Deployment

```bash
curl -sf https://<your-domain>/health || echo "Health check failed"
```

---

## Rollback Procedure

### Frontend Rollback

1. Identify the last known-good deployment in your hosting provider's dashboard.
2. Promote that deployment to production (one-click in Netlify/Vercel) or re-upload the previous `dist/` artifact from GitHub Actions.

### Edge Function Rollback

Supabase does not natively version Edge Functions. To roll back:

1. Checkout the previous commit that contained the working function:
   ```bash
   git checkout <previous-sha> -- src/supabase/functions/server/
   ```
2. Redeploy:
   ```bash
   npx supabase functions deploy server --project-ref <project-ref>
   ```
3. Restore the branch:
   ```bash
   git checkout main -- src/supabase/functions/server/
   ```

### Database Rollback

Apply the down migration from `src/supabase/migrations/` if needed:

```bash
npx supabase db reset --project-ref <project-ref>
```

> ⚠️ This resets all data. Always take a backup before applying or rolling back migrations.

---

## Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| `npm ci` fails | Lock file out of sync | Run `npm install` locally, commit `package-lock.json` |
| TypeScript errors in CI | Strict mode mismatch | Run `npm run type-check` locally and fix errors |
| Edge Function 401 | Missing or wrong `SUPABASE_FN_SECRET` | Verify the secret value in Supabase dashboard |
| CORS errors | `ALLOWED_ORIGINS` not set correctly | Check the JSON array format: `["https://yourdomain.com"]` |
| Build artifact missing | `upload-artifact` step skipped | Ensure `if: always()` is set on the upload step |

---

## Post-Deploy Validation

Run these checks immediately after every deployment:

1. **Smoke test** – Open the app URL and confirm the dashboard loads.
2. **Auth check** – Log in with a test account to confirm Supabase auth works.
3. **API check** – Create and retrieve a test record to confirm the Edge Function responds.
4. **Error tracker** – Check Sentry for any new errors in the last 5 minutes.
5. **Notifications** – Confirm a Slack message was received in the deployment channel.

If any check fails, execute the [Rollback Procedure](#rollback-procedure) immediately and open an incident in [INCIDENT-RESPONSE.md](./INCIDENT-RESPONSE.md).
