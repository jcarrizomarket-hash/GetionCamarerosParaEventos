# 📊 Repository Status Report

**Repository:** `jcarrizomarket-hash/GetionCamarerosParaEventos`
**Branch analyzed:** `main`
**Report generated:** 2026-03-02

---

## 1. Open Pull Requests

| # | Title | Status |
|---|-------|--------|
| [#112](https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/pull/112) | [WIP] Generate complete status report for the repository | 🔵 Draft / Open |

> **Note:** PR #112 is the current Copilot agent PR creating this report. It is in draft state.

---

## 2. Closed Pull Requests (Last 7 Days — since 2026-02-23)

| # | Title | Closed At | Merged? |
|---|-------|-----------|---------|
| [#78](https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/pull/78) | Upgrade jspdf to 4.2.0 to fix 8 security vulnerabilities | 2026-02-27 | ❌ Closed (NOT merged) |
| [#14](https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos/pull/14) | docs: add MIGRATION.md, CHANGELOG.md, CONTRIBUTING.md and expand root README | 2026-02-27 | ✅ Merged |

> **Audit PR #78 was NOT merged.** The `jspdf` vulnerability fix was rejected. See Section 8 for dependency risks.

---

## 3. File Existence Check on `main`

| File | Exists? | Notes |
|------|---------|-------|
| `AUDIT_REPORT.md` | ❌ Not found | — |
| `.env.example` | ✅ Exists | Contains only non-sensitive placeholder keys |
| `.env` | ⚠️ EXISTS | **Should NOT be committed!** (contains placeholder values but the file is tracked) |
| `scripts/audit.sh` | ❌ Not found | `scripts/` directory does not exist |
| `METRICS_REPORT.md` | ❌ Not found | — |
| `PR_STATUS_REVIEW.md` | ❌ Not found | — |
| `STATUS_CHECK.md` | ❌ Not found | — |

### `.env` file contents (committed to repo):
```
SUPABASE_URL="your_supabase_url"
SUPABASE_ANON_KEY="your_supabase_anon_key"
APP_ENV="production"
APP_DEBUG="false"
APP_PORT="3000"
```
Values are placeholders (not real credentials), but committing `.env` establishes a bad pattern.

---

## 4. Security Status

### 4a. Hardcoded Supabase URLs/Keys in `.ts`/`.tsx` files

| File | Finding | Severity |
|------|---------|----------|
| `src/config/env.ts:17` | Template literal builds URL: `` `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-25b11ac0` `` | ⚠️ Medium — function path `make-server-25b11ac0` is hardcoded |
| `src/App.tsx:24` | Template literal builds URL: `` `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0` `` | ⚠️ Medium — same hardcoded function path |
| `src/supabase/functions/server/kv_store.tsx` | Comment references Supabase dashboard URL with project ID `gkfpsyclglyradzeyuwz` | ⚠️ Low — project ID exposed in comment |

**No hardcoded API keys (JWT tokens) were found** in `.ts`/`.tsx` files. No `eyJ...` base64 tokens detected.

### 4b. Is `.env` in `.gitignore`?

✅ **Yes** — `.gitignore` contains rules for `.env`, `.env.local`, and `.env.*.local`.

> ⚠️ **However**, a `.env` file IS committed to the repository (it predates or bypasses the `.gitignore` rule). It should be removed via `git rm --cached .env`.

### 4c. `console.log` Statements in `src/`

| Metric | Value |
|--------|-------|
| Files containing `console.log` | **7 files** |
| Total `console.log` occurrences | **110** |

**Files with `console.log`:**
- `src/components/entrada-pedidos.tsx`
- `src/components/configuracion.tsx`
- `src/supabase/functions/server/middleware.ts`
- `src/supabase/functions/server/index.tsx`
- `src/tests/unit/logger.spec.ts`
- `src/tests/integration/whatsapp.spec.ts`
- `src/utils/logger.ts`

> 110 `console.log` calls is high for production code. Consider replacing with the structured logger (`src/utils/logger.ts`).

---

## 5. Merge Conflict Markers

⚠️ **Merge conflicts found in 2 files!**

| File | Lines | Conflict Description |
|------|-------|---------------------|
| `src/supabase/functions/server/index.tsx` | ~1203–1218 | `copilot/implement-centralized-logging` vs `main` — chat message endpoint missing from main |
| `src/src/api/client.ts` | ~32–39 | `copilot/implement-centralized-logging` vs `main` — `getBaseUrl()` uses `logger.warn` in branch vs `console.warn` in main |

**These files contain raw `<<<<<<<`, `=======`, `>>>>>>>` markers and are broken/unparseable as TypeScript.**

---

## 6. Root Directory File Audit

```
/
├── .env                        ⚠️ Should NOT be committed
├── .env.example                ✅ OK
├── .gitignore                  ✅ OK
├── .npmrc                      ✅ OK
├── ARCHITECTURE.md             ✅ OK
├── CHANGELOG.md                ✅ OK
├── CONTRIBUTING.md             ✅ OK
├── Event                       🗑️ JUNK — zero-byte file with no extension
├── FINAL_SUMMARY.md            🗑️ Accumulated report file (likely from previous Copilot agent)
├── IMPLEMENTATION_COMPLETE.md  🗑️ Accumulated report file (likely from previous Copilot agent)
├── MIGRATION.md                ✅ OK
├── README.md                   ✅ OK
├── SECURITY_REMEDIATION.md     ⚠️ May be needed — security notes
├── admin.tsx                   ⚠️ Loose component in root (should be in src/components/)
├── eslint                      🗑️ JUNK — zero-byte file named "eslint"
├── eslint.config.js            ✅ OK
├── index.html                  ✅ OK
├── package-lock.json           ✅ OK
├── package.json                ✅ OK
├── setup.sh                    ✅ OK (setup script)
├── src/                        ✅ OK
├── tsconfig.json               ✅ OK
├── tsconfig.node.json          ✅ OK
├── uninstall_vulnerable_packages.sh  ⚠️ Utility script — purpose unclear, may be residual
├── vite-env.d.ts               ⚠️ Loose file (should be in src/)
└── vite.config.ts              ✅ OK
```

**Issues found:**
- `Event` — zero-byte junk file, should be deleted
- `eslint` — zero-byte junk file, should be deleted
- `FINAL_SUMMARY.md`, `IMPLEMENTATION_COMPLETE.md` — accumulated agent-generated report files
- `admin.tsx` — loose component file in root instead of `src/components/`
- `.env` — should not be tracked (see Section 4b)

---

## 7. GitHub Actions Workflows

| File | Status |
|------|--------|
| `.github/workflows/ci.yml` | ✅ Present |

**Total workflow files: 1**

✅ No duplicate workflows detected. Only `ci.yml` exists.

---

## 8. Package.json Dependency Vulnerabilities

| Package | Current Version | Risk | Notes |
|---------|----------------|------|-------|
| `jspdf` | `^2.5.1` | 🔴 **HIGH** | 8 CVEs in 2.x: PDF injection (arbitrary JS), path traversal, DoS. PR #78 to upgrade to 4.2.0 was **NOT merged**. |
| `jspdf-autotable` | `^3.5.31` | 🟡 Medium | v3 depends on jspdf@^2 — upgrade blocked by jspdf version |
| `xlsx` | `^0.18.5` | 🔴 **HIGH** | SheetJS 0.18.x has known prototype pollution vulnerabilities. Last safe community release; commercial fork available. |

**Recommendations:**
1. Merge or re-open PR #78: upgrade `jspdf` to `^4.2.0` and `jspdf-autotable` to `^5.0.0`
2. Evaluate `xlsx` — consider switching to `exceljs` (maintained, no known CVEs) or lock to `xlsx@0.19.x` if upgrade path exists

---

## Summary / Action Items

| Priority | Action |
|----------|--------|
| 🔴 Critical | Fix merge conflicts in `src/supabase/functions/server/index.tsx` and `src/src/api/client.ts` |
| 🔴 Critical | Remove `.env` from git tracking: `git rm --cached .env` |
| 🔴 Critical | Upgrade `jspdf` to `^4.2.0` (re-open/merge PR #78) |
| 🔴 Critical | Address `xlsx ^0.18.5` vulnerability |
| 🟠 High | Remove or create `AUDIT_REPORT.md`, `METRICS_REPORT.md`, `PR_STATUS_REVIEW.md`, `STATUS_CHECK.md` if needed |
| 🟠 High | Delete junk files: `Event`, `eslint` (zero-byte) |
| 🟡 Medium | Reduce 110 `console.log` calls in `src/` — use structured logger |
| 🟡 Medium | Move `admin.tsx` and `vite-env.d.ts` to proper locations in `src/` |
| 🟡 Medium | Review hardcoded Supabase function path `make-server-25b11ac0` — move to env var |
| 🔵 Low | Clean up accumulated report files: `FINAL_SUMMARY.md`, `IMPLEMENTATION_COMPLETE.md` |
