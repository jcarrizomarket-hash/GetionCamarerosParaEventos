# 🍽️ Event Waitstaff Management System

A complete system for managing events, assigning waitstaff, and communicating with clients. Built with React, TypeScript, Supabase, and a modern three-layer architecture.

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
| Integrations | WhatsApp Business API, Resend/SendGrid/Mailgun, CSV/PDF export |
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

See [`.env.example`](./.env.example) for the full list.

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

## 🔐 Security

Mutation endpoints (POST, PUT, DELETE) require a function secret header in addition to the Supabase auth token.

```bash
# Generate a secure secret
openssl rand -hex 32

# Add to .env (frontend)
VITE_SUPABASE_FN_SECRET=your-secret

# Add to Supabase function secrets (backend)
supabase secrets set SUPABASE_FN_SECRET=your-secret
```

The centralized API client (`src/api/client.ts`) handles adding this header automatically.

See [src/ARCHITECTURE.md](./src/ARCHITECTURE.md) for a full security overview.

---

## 🚀 Deployment

### Frontend (Vercel / Netlify)

```bash
npm run build
```

Required environment variables on the hosting platform:
```
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_FN_SECRET
```

### Backend (Supabase Functions)

```bash
supabase functions deploy make-server-25b11ac0
supabase secrets set SUPABASE_FN_SECRET=your-secret
```

---

## 📚 Documentation

| Document | Description |
|---|---|
| [MIGRATION.md](./MIGRATION.md) | How to upgrade between versions |
| [CHANGELOG.md](./CHANGELOG.md) | Full version history |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute |
| [SECURITY_REMEDIATION.md](./SECURITY_REMEDIATION.md) | Security improvements and remediation steps |
| [src/ARCHITECTURE.md](./src/ARCHITECTURE.md) | System architecture |
| [src/REFACTOR_GUIDE.md](./src/REFACTOR_GUIDE.md) | Refactoring guide |
| [src/MIGRATION_EXAMPLE.md](./src/MIGRATION_EXAMPLE.md) | Before/after migration example |
| [src/EMAIL_SETUP.md](./src/EMAIL_SETUP.md) | Email service configuration |
| [src/WHATSAPP_SETUP.md](./src/WHATSAPP_SETUP.md) | WhatsApp API configuration |

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions, coding standards, and the pull request workflow.

---

## 🔄 Recent Optimizations (February 2026)

The following changes were applied as part of the project's optimization and security-hardening phase:

- **Removed vulnerable dependencies** – `xlsx`, `jspdf`, and `jspdf-autotable` were uninstalled due to known security vulnerabilities. Excel export was replaced with a lightweight, secure CSV export using an internal helper (`src/utils/file-export.ts`).
- **Security remediation** – 8 critical security issues addressed, including SQL-injection prevention, XSS sanitization, improved authentication flows, and encrypted data handling. See [SECURITY_REMEDIATION.md](./SECURITY_REMEDIATION.md) for details.
- **API context provider** – Application wrapped with `ApiProvider` to centralize API configuration and improve state management across components.
- **Automated setup scripts** – [`setup.sh`](./setup.sh) added to automate dependency validation, linting, type-checking, and build steps; [`uninstall_vulnerable_packages.sh`](./uninstall_vulnerable_packages.sh) documents the package removal process.
- **Implementation documentation** – Added [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) and [FINAL_SUMMARY.md](./FINAL_SUMMARY.md) summarizing completed work and verification status.

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

**Version:** 2.0.1 | **Last updated:** February 2026
  