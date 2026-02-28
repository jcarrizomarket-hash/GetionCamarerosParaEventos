# Security Remediation

## Known Vulnerabilities

### xlsx@0.18.5 — Prototype Pollution / ReDoS (No fix available)

| Field       | Detail |
|-------------|--------|
| Package     | `xlsx` (SheetJS CE) |
| Version     | 0.18.5 |
| Severity    | High |
| CVE         | CVE-2023-30533 (Prototype Pollution) |
| Fix         | **No patch available** in the open-source `xlsx` package |

**Description:** The `xlsx` package at version 0.18.5 contains a prototype pollution vulnerability (CVE-2023-30533) that can be triggered by parsing a specially crafted workbook file. This could allow an attacker to manipulate JavaScript object prototypes.

**Current mitigation:** The package is used only for server-side Excel export; user-supplied files are not parsed through this library in the current implementation.

**Recommended action:** Migrate to a maintained alternative such as [`exceljs`](https://github.com/exceljs/exceljs) when bandwidth allows. Track upstream: https://github.com/advisories/GHSA-4r6h-8v6p-xvh6

---

## Dependency Monitoring

Run `npm audit` regularly to stay informed of new vulnerabilities in project dependencies.