# 🍽️ Event Waitstaff Management System

A complete system for managing events, assigning waitstaff, and communicating with clients. Built with React, TypeScript, Supabase, and a modern three-layer architecture.

[![CI](https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/actions/workflows/ci.yml/badge.svg)](https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat&logo=playwright&logoColor=white)](https://playwright.dev/)

The original design is available at [Figma](https://www.figma.com/design/Nq9oM07FtoZfVCgo0wU81i/Event-Waitstaff-Management-App).

---

## 📋 Table of Contents

- [Features](#-features)
- [Technologies](#-technologies)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Testing](#-testing)
- [CI/CD](#-cicd)
- [Security](#-security)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## ✨ Features

### 🎯 Event Management
- Register events (pedidos) with a visual calendar
- Waiter assignment with shift 1 and shift 2 support
- Confirmation states: pending, sent, confirmed
- Detailed reports with KPIs and PDF/Excel export

### 📱 Integrated Communication
- WhatsApp Business API – automated message sending
- Multi-provider email – Resend, SendGrid, or Mailgun
- Confirmation links with direct accept/reject buttons
- Color-coded visual status indicators

### 👥 Personnel Management
- Waiters: number, name, phone, status
- Coordinators: responsible personnel management
- Clients: client database with event history

### 📊 Dashboard & Reports
- Real-time metrics: total events, confirmed, pending
- Interactive monthly calendar
- PDF and Excel export
- Charts powered by Recharts

---

## 🛠️ Technologies

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS v4, Lucide React |
| Backend | Supabase Edge Functions, Hono, PostgreSQL, KV Store |
| Integrations | WhatsApp Business API, Resend/SendGrid/Mailgun, jsPDF |
| Testing | Vitest (unit), Playwright (E2E), Testing Library |
| Build | Vite, ESLint |

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- A [Supabase](https://app.supabase.com) account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos.git
cd GetionCamarerosParaEventos

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Create a .env file in the project root and add your credentials, e.g.:
# VITE_SUPABASE_PROJECT_ID=your-project-id
# VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Minimum Environment Variables

```bash
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_ANON_KEY=your-anon-key
```

See [`src/.env.example`](./src/.env.example) for the full list.

---

## 📁 Project Structure

```
GetionCamarerosParaEventos/
│
├── src/                        # TypeScript source
│   ├── types.ts                # Domain types
│   ├── api/
│   │   └── client.ts           # Centralized API client
│   ├── utils/
│   │   └── helpers.ts          # Shared helper functions
│   │
│   ├── components/             # React components
│   │   ├── dashboard.tsx
│   │   ├── pedidos.tsx
│   │   ├── camareros.tsx
│   │   ├── gestion-pedidos.tsx
│   │   └── ...
│   │
│   ├── supabase/
│   │   └── functions/server/
│   │       ├── index.tsx       # Hono server (Edge Function)
│   │       ├── middleware.ts   # Security middleware
│   │       └── kv_store.tsx    # KV store utilities
│   │
│   └── tests/
│       ├── unit/               # Vitest unit tests
│       └── e2e/                # Playwright E2E tests
│
├── MIGRATION.md                # Upgrade guide
├── CHANGELOG.md                # Version history
└── CONTRIBUTING.md             # Contributor guide
```

---

## ⚙️ Configuration

### Supabase

1. Create a project at [app.supabase.com](https://app.supabase.com)
2. Copy your Project ID and API Keys
3. Add them to `.env`
4. Deploy the Edge Function:

```bash
supabase functions deploy make-server-25b11ac0
```

### WhatsApp Business API

See the full guide: [src/WHATSAPP_SETUP.md](./src/WHATSAPP_SETUP.md)

1. Create an app on Meta for Developers
2. Set up WhatsApp Business
3. Obtain the Phone Number ID and API Key
4. Add them to the Supabase function secrets

### Email

See the full guide: [src/EMAIL_SETUP.md](./src/EMAIL_SETUP.md)

```bash
# Option 1 – Resend (recommended)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=your@email.com

# Option 2 – SendGrid
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=your@email.com

# Option 3 – Mailgun
MAILGUN_API_KEY=xxxxx
MAILGUN_DOMAIN=yourdomain.com
EMAIL_FROM=your@email.com
```

---

## 🧪 Testing

The system includes **85+ automated tests** and an interactive **Test Panel** in the UI.

```bash
# Unit tests (run from src/)
npm --prefix src test

# E2E tests (run from src/)
npm --prefix src run test:e2e

# All tests (run from src/)
npm --prefix src run test:all

# Coverage report (run from src/)
npm --prefix src run test:coverage
```

For detailed testing instructions, see [src/TESTING_SETUP.md](./src/TESTING_SETUP.md).

---

## 🔄 CI/CD

This project uses GitHub Actions for continuous integration. On every push/PR to `main`:

1. **Type Check** — Validates TypeScript types (`npm run type-check`)
2. **Lint** — Enforces code style (`npm run lint`)
3. **Tests** — Runs unit tests with Vitest
4. **Build** — Ensures the project compiles (`npm run build`)

All checks are intended to pass before merging. To enforce these as required checks that block merges, configure GitHub branch protection rules to require this workflow's status checks.

---

## 🔐 Security

All endpoints require a Supabase JWT Bearer token (`Authorization: Bearer <token>`).  
Mutation endpoints (POST, PUT, DELETE) and sensitive diagnostic GET endpoints enforce this check server-side.

The frontend uses **Supabase email/password authentication**: after login, the Supabase JWT is automatically included in all API requests via `Authorization: Bearer`. No `VITE_SUPABASE_FN_SECRET` is required.

See [src/ARCHITECTURE.md](./src/ARCHITECTURE.md) for a full security overview.

---

## 🚀 Deployment

### Frontend

The production frontend is hosted at **https://appservice.jcarrizo.com**.

```bash
npm run build
```

Required environment variables on the hosting platform:
```
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_ANON_KEY
```

### Backend (Supabase Functions)

The API runs as a Supabase Edge Function:

```bash
supabase functions deploy make-server-25b11ac0
```

API base URL: `https://<project-id>.supabase.co/functions/v1/make-server-25b11ac0`

---

## 📚 Documentation

### Onboarding & Guides

| Document | Description |
|---|---|
| [src/START_HERE.md](./src/START_HERE.md) | Quick-start guide for new developers and admins |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute |
| [MIGRATION.md](./MIGRATION.md) | How to upgrade between versions |

### Architecture & Design

| Document | Description |
|---|---|
| [src/ARCHITECTURE.md](./src/ARCHITECTURE.md) | System architecture |
| [src/REFACTOR_GUIDE.md](./src/REFACTOR_GUIDE.md) | Refactoring guide |
| [src/MIGRATION_EXAMPLE.md](./src/MIGRATION_EXAMPLE.md) | Before/after migration example |
| [CHANGELOG.md](./CHANGELOG.md) | Full version history |

### Configuration

| Document | Description |
|---|---|
| [src/EMAIL_SETUP.md](./src/EMAIL_SETUP.md) | Email service configuration |
| [src/EMAIL_SYSTEM_OVERVIEW.md](./src/EMAIL_SYSTEM_OVERVIEW.md) | Email system overview |
| [src/WHATSAPP_SETUP.md](./src/WHATSAPP_SETUP.md) | WhatsApp API configuration |

### Testing

| Document | Description |
|---|---|
| [src/TESTING_SETUP.md](./src/TESTING_SETUP.md) | Testing environment setup |
| [src/TESTING_SUMMARY.md](./src/TESTING_SUMMARY.md) | Full testing summary |
| [src/QUICK_TEST_GUIDE.md](./src/QUICK_TEST_GUIDE.md) | Quick testing reference |
| [src/tests/manual/testing-guide.md](./src/tests/manual/testing-guide.md) | Manual testing procedures |

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions, coding standards, and the pull request workflow.

---

## 🗺️ Roadmap

### v2.1 (Next release)
- [ ] User authentication with Supabase Auth
- [ ] Coordinator and waiter roles with route protection
- [ ] Real-time notifications via Supabase Realtime
- [ ] PWA support (installable on mobile)

### v2.2
- [ ] Coordinator–waiter chat
- [ ] Advanced analytics and trend reports
- [ ] Google Calendar / Outlook integration
- [ ] React Native mobile app

### Future
- [ ] AI-powered staffing predictions
- [ ] Waiter rating system
- [ ] Payroll and payments module
- [ ] Multi-company SaaS mode

---

## 📝 License

This project is licensed under the MIT License.

---

**Version:** 2.0.0 | **Last updated:** January 2026
  