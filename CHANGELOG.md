# Changelog

All notable changes to the Event Waitstaff Management System are documented here.

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions and uses [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Planned
- User authentication with Supabase Auth (roles: coordinator, waiter)
- Real-time notifications via Supabase Realtime
- PWA support (installable on mobile)
- Advanced analytics dashboard

---

## [2.0.0] – 2026-01-19

> **Note:** This release contains [breaking changes](./MIGRATION.md#from-v1x-to-v20). See the [Migration Guide](./MIGRATION.md) before upgrading.

### Added
- **Centralized API client** (`src/api/client.ts`) – single entry point for all backend calls
- **TypeScript domain types** (`src/types.ts`) – strict types for `Pedido`, `Camarero`, `Coordinador`, `Cliente`, `Asignacion`, `ApiResponse<T>`, `WhatsAppConfig`, `EmailConfig`, `InformeMetrics`
- **Shared helper utilities** (`src/utils/helpers.ts`):
  - `calcularHoras()` – hours worked between two times, handles midnight crossings
  - `formatearHoras()` – human-readable duration ("8h 30min")
  - `calcularCamarerosNecesarios()` – sum of shift-1 and shift-2 waiters
  - `calcularHoraEncuentro()` – catering meeting-time calculation
  - `formatearTelefono()` – phone number formatting with country code
  - `validarEmail()` – robust email format validation
  - `formatearFecha()` – Spanish locale date formatting
  - `deduplicarPorId()` – removes duplicate items from arrays
  - `isPedidoCompleto()` – checks whether all waiters have confirmed
  - `calcularPorcentajeConfirmacion()` – confirmation percentage for a pedido
  - `generarId()` / `generarToken()` – unique ID and token generation
- **Security middleware** (`supabase/functions/server/middleware.ts`):
  - `requireFunctionSecret` – validates `x-fn-secret` header on POST/PUT/DELETE
  - `requireAuth` – validates Supabase auth tokens
  - `rateLimit` – configurable rate limiting
  - `errorLogger` – contextual error logging
  - `corsMiddleware` – configurable CORS with multiple origins
- **Unit tests** (Vitest) – 50+ tests for helper functions (`tests/unit/helpers.spec.ts`)
- **E2E tests** (Playwright) – main user flows, multi-browser (Chromium, Firefox, Safari), responsive (mobile, tablet, desktop) (`tests/e2e/create-pedido.spec.ts`)
- **Email multi-provider support** – Resend, SendGrid, Mailgun with automatic fallback
- **WhatsApp Business API** – enhanced integration with Phone Number ID validation
- **Environment variable template** (`.env.example`) – fully documented
- **Testing scripts** in `package.json`: `test`, `test:e2e`, `test:coverage`, `test:ui`, `test:e2e:ui`, `test:all`
- **Documentation**:
  - `src/ARCHITECTURE.md` – three-layer architecture overview
  - `src/REFACTOR_GUIDE.md` – step-by-step refactoring guide
  - `src/MIGRATION_EXAMPLE.md` – before/after code example
  - `src/CHANGELOG.md` – changelog (also mirrored here at root)

### Changed
- API configuration moved from component props (`baseUrl`, `publicAnonKey`) to environment variables
- Components now use the centralized API client instead of direct `fetch()` calls
- Error handling unified across all API interactions via `ApiResponse<T>`

### Fixed
- Unique React keys in `EnvioParte` and `EnvioMensaje` components (eliminated console warnings)
- Email validation now rejects malformed addresses
- Hour calculation correctly handles shifts that cross midnight
- Phone formatter correctly strips non-numeric characters

### Security
- Added `x-fn-secret` header requirement for all mutation endpoints (POST/PUT/DELETE)
- Rate limiting added to prevent API abuse
- Environment variables clearly separated into public (`VITE_*`) and private (server-side only)

### Breaking Changes

See [MIGRATION.md](./MIGRATION.md) for full details. Summary:

1. Direct `fetch()` calls to the backend are replaced by the API client.
2. `x-fn-secret` header is now required for POST, PUT, DELETE requests.
3. `baseUrl` / `publicAnonKey` props removed from components – use env variables.
4. TypeScript strict types enforced; implicit `any` is no longer accepted.
5. Several database field names renamed (see [Compatibility Matrix](./MIGRATION.md#compatibility-matrix)).

---

## [1.0.0] – 2025-06-01

### Added
- Initial release of the Event Waitstaff Management System
- Event (pedido) registration with calendar view
- Waiter assignment with shift 1 and shift 2 support
- Confirmation states: pending, sent, confirmed
- Dashboard with KPIs and metrics
- PDF and Excel export for reports
- WhatsApp message sending (basic)
- Email sending (basic, single provider)
- Coordinator and client management
- Figma design implementation

---

## How to Read This Changelog

- **Added** – new features
- **Changed** – changes to existing functionality
- **Deprecated** – features that will be removed in a future version
- **Removed** – features removed in this release
- **Fixed** – bug fixes
- **Security** – security-related changes
- **Breaking Changes** – changes requiring action when upgrading

[Unreleased]: https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/releases/tag/v1.0.0
