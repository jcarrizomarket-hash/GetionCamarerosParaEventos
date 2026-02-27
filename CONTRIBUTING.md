# Contributing Guide

Thank you for your interest in contributing to the Event Waitstaff Management System! This document explains how to set up your development environment, run tests, and submit pull requests.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Pull Request Workflow](#pull-request-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

---

## Code of Conduct

Be respectful and constructive in all interactions. We welcome contributions from everyone, regardless of background or experience level.

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- A [Supabase](https://supabase.com/) account (for backend testing)
- Git

### Fork and Clone

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/<your-username>/GetionCamarerosParaEventos.git
cd GetionCamarerosParaEventos

# 3. Add the upstream remote
git remote add upstream https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos.git
```

---

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp src/.env.example .env
```

Edit `.env` with your Supabase credentials:

```bash
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_ANON_KEY=your-anon-key
# NOTE: Do not put Supabase function secrets in Vite env vars (VITE_*).
# Configure any SUPABASE_FN_SECRET only in your backend/server environment, not in this .env file.
```

### 3. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Install Playwright Browsers (for E2E tests)

```bash
npx playwright install
```

---

## Project Structure

```
GetionCamarerosParaEventos/
│
├── src/                        # Frontend source root
│   └── src/                    # TypeScript source
│       ├── types.ts            # Domain types
│       ├── api/
│       │   └── client.ts       # Centralized API client
│       └── utils/
│           └── helpers.ts      # Shared helper functions
│
├── components/                 # React components
│   ├── dashboard.tsx
│   ├── pedidos.tsx
│   ├── camareros.tsx
│   └── ...
│
├── supabase/
│   └── functions/server/
│       ├── index.tsx           # Hono server (Edge Function)
│       ├── middleware.ts       # Security middleware
│       └── kv_store.tsx        # KV store utilities
│
├── tests/
│   ├── unit/                   # Vitest unit tests
│   └── e2e/                    # Playwright E2E tests
│
├── MIGRATION.md                # Upgrade guide
├── CHANGELOG.md                # Version history
└── CONTRIBUTING.md             # This file
```

See [src/ARCHITECTURE.md](./src/ARCHITECTURE.md) for a detailed architecture overview.

---

## Making Changes

### Create a Feature Branch

Always branch off `main`:

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/<description>` – new features
- `fix/<description>` – bug fixes
- `docs/<description>` – documentation changes
- `refactor/<description>` – refactoring without behavior change
- `test/<description>` – test additions or fixes

### Coding Standards

#### TypeScript

- Use **strict types** – avoid `any`
- Import domain types from `src/types.ts`
- Define interfaces for component props

```typescript
// ✅ Good
import type { Pedido } from '../src/types';

interface PedidoCardProps {
  pedido: Pedido;
  onUpdate: (id: string) => void;
}
```

#### API Calls

Use the centralized client – never write raw `fetch()` calls in components:

```typescript
// ✅ Good
import { getPedidos, createPedido } from '../src/api/client';

const result = await getPedidos();
if (result.success && result.data) { ... }
```

#### Shared Logic

Extract reusable calculations to `src/utils/helpers.ts`:

```typescript
// ✅ Good
import { calcularHoras, formatearFecha } from '../src/utils/helpers';
```

#### Component Style

- Use **Tailwind CSS** for styling
- Use **Lucide React** for icons
- Keep components focused and small

---

## Testing

### Run Unit Tests

```bash
npm test
# or
npm run test:unit
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Run All Tests

```bash
npm run test:all
```

### Check Code Coverage

```bash
npm run test:coverage
```

### Writing Tests

#### Unit Tests (Vitest)

Place unit tests under `tests/unit/`. Follow the existing `helpers.spec.ts` as a guide:

```typescript
import { describe, it, expect } from 'vitest';
import { myHelper } from '../../src/utils/helpers';

describe('myHelper', () => {
  it('should return expected value', () => {
    expect(myHelper('input')).toBe('expected');
  });
});
```

#### E2E Tests (Playwright)

Place E2E tests under `tests/e2e/`. Follow the existing `create-pedido.spec.ts` as a guide:

```typescript
import { test, expect } from '@playwright/test';

test('should complete main flow', async ({ page }) => {
  await page.goto('/');
  // ...assertions
});
```

### Before Submitting a PR

```bash
npm run type-check   # TypeScript check
npm test             # Unit tests
npm run test:e2e     # E2E tests
npm run build        # Production build
```

---

## Pull Request Workflow

1. **Push your branch** to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** against `main` in the upstream repository.

3. **Fill in the PR template** with:
   - What changed and why
   - How to test the change
   - Screenshots if there are UI changes
   - References to related issues (e.g. `Closes #10`)

4. **Address review comments** – make changes and push new commits to the same branch.

5. Once approved, a maintainer will merge your PR.

### PR Checklist

- [ ] Code follows the TypeScript and style standards above
- [ ] New and existing unit tests pass (`npm test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated if behavior changed
- [ ] `CHANGELOG.md` updated under `[Unreleased]` if applicable

---

## Commit Messages

Use clear, descriptive commit messages:

```
<type>: <short description>

[optional body]
[optional footer]
```

Types:
- `feat` – new feature
- `fix` – bug fix
- `docs` – documentation only
- `refactor` – code restructuring without behavior change
- `test` – adding or updating tests
- `chore` – maintenance tasks (dependencies, config)

Examples:

```
feat: add PDF export for weekly reports
fix: correct midnight-crossing hour calculation
docs: update README with deployment instructions
test: add unit tests for formatearTelefono helper
```

---

## Questions

- Open a [GitHub Issue](https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/issues) for bugs or feature requests.
- Use [GitHub Discussions](https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/discussions) for questions and general conversation.

Thank you for contributing! 🎉
