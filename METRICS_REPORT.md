# 📊 Repository Metrics Report

**Generated:** 2026-03-01T23:29:34Z  
**Repository:** `jcarrizomarket-hash/GetionCamarerosParaEventos`  
**Branch:** `main`

---

## 1. 🤖 Open Pull Requests by Copilot

**Total open Copilot PRs:** 76

| # | Title | Status | Created |
|---|-------|--------|---------|
| [#106](https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/pull/106) | [WIP] Create metrics report for repository review | 🟡 Draft / Open | 2026-03-01 |
| [#105](https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/pull/105) | [WIP] Conduct thorough audit of app for optimization | 🟡 Draft / Open | 2026-03-01 |
| [#56](https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/pull/56) | Move test dependencies to devDependencies | 🟡 Draft / Open | 2026-02-26 |

> **Note:** 76 open PRs total. Table above shows a representative sample of the most recent. Many older PRs remain open/unmerged.

---

## 2. 🔀 Recently Merged Audit/Security PRs

| # | Title | Merged At |
|---|-------|-----------|
| [#31](https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/pull/31) | Fix security vulnerabilities: pin vitest/jspdf/xlsx and add security infrastructure | 2026-02-26 |
| [#19](https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/pull/19) | Add full CRUD endpoints (GET/POST/PUT/DELETE) for all entities + requireSecret middleware | 2026-02-25 |
| [#4](https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/pull/4) | Fix env config: centralize VITE_ vars and add .env.example + .gitignore | 2026-02-26 |

**24 Copilot PRs have been merged in total.**

---

## 3. 🗂️ Codebase Status Dashboard

### 3.1 `.env` Files

| File | Exists | Git-Tracked | Status |
|------|--------|-------------|--------|
| `.env` | ✅ Yes | ⚠️ **YES** (tracked by git) | ❌ RISK: should NOT be tracked |
| `.env.example` | ✅ Yes | ✅ Yes | ✅ OK — template file |

> **.gitignore** contains `.env` entries (lines 4–5 and 17–19), but `.env` is already being tracked in git and the ignore rule has no effect. Run `git rm --cached .env` to untrack it.

---

### 3.2 GitHub Actions Workflow Files

| Count | Files Found |
|-------|-------------|
| **1** | `.github/workflows/ci.yml` |

---

### 3.3 Markdown Report Files in Root Directory

**Count: 8**

| File | Notes |
|------|-------|
| `README.md` | Main project readme |
| `ARCHITECTURE.md` | Architecture documentation |
| `CHANGELOG.md` | Change log |
| `CONTRIBUTING.md` | Contribution guidelines |
| `MIGRATION.md` | Migration guide |
| `SECURITY_REMEDIATION.md` | Security remediation notes |
| `IMPLEMENTATION_COMPLETE.md` | Implementation summary |
| `FINAL_SUMMARY.md` | Final summary |

---

### 3.4 AUDIT_REPORT.md

| Check | Result |
|-------|--------|
| `AUDIT_REPORT.md` exists? | ❌ **NOT FOUND** |

---

### 3.5 Merge Conflict Markers

⚠️ **2 files contain unresolved merge conflict markers:**

| File | Lines |
|------|-------|
| `src/supabase/functions/server/index.tsx` | 1203 (`<<<<<<<`), 1217 (`=======`), 1218 (`>>>>>>>`) |
| `src/src/api/client.ts` | 32 (`<<<<<<<`), 36 (`=======`), 39 (`>>>>>>>`) |

> Conflict branch: `copilot/implement-centralized-logging` vs `main`. These files will cause build/runtime failures if not resolved.

---

### 3.6 Hardcoded Credentials / API Keys

| File | Line | Finding | Severity |
|------|------|---------|----------|
| `src/components/whatsapp-chatbot-config.tsx` | 13 | `verifyToken = 'TU_TOKEN_DE_VERIFICACION'` — hardcoded placeholder token | ⚠️ Medium (placeholder, not a real secret, but should use env var) |
| `src/tests/integration/whatsapp.spec.ts` | 199, 212, 218 | Test token/ID values in test cases | ✅ Acceptable (test-only context) |

> No real/live credentials or API keys detected in source files.

---

### 3.7 `console.log` Statements in `src/`

| Scope | Count |
|-------|-------|
| TypeScript / JavaScript source files (`.ts`, `.tsx`, `.js`) | **191** |
| Markdown documentation files (`.md`) | 17 |
| **Total across all files in `src/`** | **208** |

> High number of `console.log` statements in production source code. Consider replacing with the structured logger (`src/src/utils/logger.ts`) that was added in a prior PR.

---

### 3.8 Duplicate / Junk Files

| File | Size | Issue |
|------|------|-------|
| `Event` | 0 bytes | Empty file in root — appears to be a junk/accidental file |
| `eslint` | 0 bytes | Empty file in root — likely an accidental artifact (real config is `eslint.config.js`) |
| `admin.tsx` (root) | 205 bytes | Duplicate: real component is `src/components/admin.tsx` |
| `vite-env.d.ts` (root) | 308 bytes | Misplaced: Vite env declarations should be inside `src/` |

---

## 4. 📋 Summary

| Metric | Value | Status |
|--------|-------|--------|
| Open Copilot PRs | 76 | ⚠️ High backlog |
| Merged Copilot PRs | 24 | ✅ |
| `.env` tracked by git | Yes | ❌ Security risk |
| Workflow files | 1 (`ci.yml`) | ℹ️ |
| Root markdown files | 8 | ℹ️ |
| `AUDIT_REPORT.md` exists | No | ❌ Missing |
| Files with merge conflicts | 2 | ❌ Action required |
| Hardcoded credentials | 1 placeholder | ⚠️ Low risk |
| `console.log` in source | 191 | ⚠️ Should use logger |
| Junk/duplicate files | 4 | ⚠️ Cleanup recommended |
