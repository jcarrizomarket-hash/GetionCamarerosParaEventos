# Secrets Template

This document describes all secrets required to run the GitHub Actions workflows in this repository.

## How to Add Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret** for each secret below
4. Enter the name and value exactly as specified

---

## Required Secrets (11 total)

### Supabase Configuration

| Secret Name | Description | Where to Find |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard → Project Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) | Supabase Dashboard → Project Settings → API → service_role |
| `SUPABASE_DB_PASSWORD` | Database password | Supabase Dashboard → Project Settings → Database → Database password |

### Application Configuration

| Secret Name | Description | Where to Find |
|---|---|---|
| `NODE_ENV` | Environment name (`production` or `staging`) | Set to `production` for main branch |
| `APP_SECRET_KEY` | Application-level secret for signing tokens | Generate with: `openssl rand -hex 32` |

### WhatsApp / Notifications

| Secret Name | Description | Where to Find |
|---|---|---|
| `WHATSAPP_API_TOKEN` | WhatsApp Business API token | Meta Developer Portal → WhatsApp → Configuration |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID | Meta Developer Portal → WhatsApp → Phone numbers |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verification token (any string you choose) | Set any secure random string |

### Email Configuration

| Secret Name | Description | Where to Find |
|---|---|---|
| `RESEND_API_KEY` | Resend email service API key | Resend Dashboard → API Keys |
| `EMAIL_FROM_ADDRESS` | Sender email address | Your verified sender domain in Resend |

---

## Environment Setup

### For Staging Environment

Repeat the steps above under **Settings → Environments → staging** to set environment-specific secrets.

### For Production Environment

Repeat the steps above under **Settings → Environments → production** to set environment-specific secrets.

---

## Generating Secure Secrets

```bash
# Generate a secure random secret key
openssl rand -hex 32

# Generate a secure random token
openssl rand -base64 32
```

---

## Security Notes

- **Never commit secrets to source code** — use environment variables or GitHub Secrets only
- Rotate secrets regularly (recommended: every 90 days)
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges — keep it strictly confidential
- Review secret access in GitHub Settings → Actions → secrets periodically
