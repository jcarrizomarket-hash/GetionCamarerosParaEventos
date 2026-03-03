# Architecture and Security Documentation

## Overview
This document describes the architecture and security model of GetionCamarerosParaEventos.
See also [README.md](../README.md) and the related issue/PR [#157](https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/issues/157).

## Deployment: Option A

The canonical deployment (Option A) consists of:

| Layer | Service | URL |
|---|---|---|
| Frontend | Azure App Service | `https://appservice.jcarrizo.com` |
| API | Supabase Edge Functions | `https://<project-id>.supabase.co/functions/v1/make-server-25b11ac0` |
| Auth | Supabase Auth (email/password) | Redirect URL: `https://appservice.jcarrizo.com` |

### Supabase Auth Redirect URLs

Configure these in **Supabase Dashboard → Authentication → URL Configuration**:

- **Site URL**: `https://appservice.jcarrizo.com`
- **Additional Redirect URLs** (for local development only):
  - `http://localhost:5173`
  - `http://localhost:3000`

## Security

### Authentication and Authorization

All sensitive API endpoints are protected by **JWT-only authentication** using Supabase Auth.

1. Users authenticate with email/password via `supabase.auth.signInWithPassword()`.
2. Supabase returns a signed JWT (`access_token`) valid for the session duration.
3. The frontend injects this token into every API request via `setAuthToken(token)` from `src/api/client.ts`.
4. The Edge Function validates the token with `supabase.auth.getUser(token)` on every sensitive request.
5. Requests without a valid JWT receive HTTP 401.

**No client-side shared secrets** (`VITE_SUPABASE_FN_SECRET`) are used. The old `x-fn-secret` header approach has been removed.

#### Protected endpoints (require valid user JWT)

- `GET /camareros`, `GET /coordinadores`, `GET /pedidos`, `GET /clientes` — data listings
- `GET /informes/*` — reports
- `GET /chats/*`, `GET /chat-mensajes/*` — chat data
- `GET /diagnostico-chats` — diagnostics
- All `POST`, `PUT`, `DELETE` data-mutation endpoints

#### Public endpoints (no JWT required)

- `GET /confirmar/:token` — waiter confirmation link (token-based)
- `GET /no-confirmar/:token` — waiter rejection link (token-based)
- `GET /whatsapp-webhook`, `POST /whatsapp-webhook` — Meta webhook
- `GET /qr-scan/:token` — QR scan page
- `GET /verificar-whatsapp-config`, `GET /verificar-email-config` — admin config checks

### CORS Policy

The Edge Function enforces a **restricted CORS allowlist**:

```
Allowed origins:
  https://appservice.jcarrizo.com   ← production
  http://localhost:5173             ← local dev (not in production builds)
  http://localhost:3000             ← local dev (not in production builds)
```

All other origins receive no `Access-Control-Allow-Origin` header and are blocked by the browser.

### Data Encryption

- All data is transmitted over TLS (HTTPS).
- Supabase stores data encrypted at rest.

### Input Validation and Sanitization

- Request bodies are parsed via Hono's JSON parser.
- Database queries use Supabase's parameterized query builder (RLS enabled).

### Security Audits

- Dependencies are audited with `npm audit` in CI.
- Regularly update dependencies to mitigate known vulnerabilities.

## Conclusion

The JWT-only, origin-restricted architecture described here provides a strong security baseline for Option A deployment while maintaining developer ergonomics for local development.
