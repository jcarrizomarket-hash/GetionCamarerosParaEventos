#!/usr/bin/env bash
# =============================================================================
# scripts/audit.sh — Automated security and code quality audit
# Run with: npm run audit
# =============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAILURES=0
WARNINGS=0

red()    { printf '\033[0;31m%s\033[0m\n' "$*"; }
yellow() { printf '\033[0;33m%s\033[0m\n' "$*"; }
green()  { printf '\033[0;32m%s\033[0m\n' "$*"; }
header() { printf '\n\033[1;34m=== %s ===\033[0m\n' "$*"; }

fail() { red "  ✗ $*"; FAILURES=$((FAILURES + 1)); }
warn() { yellow "  ⚠ $*"; WARNINGS=$((WARNINGS + 1)); }
ok()   { green "  ✓ $*"; }

cd "$REPO_ROOT"

# -----------------------------------------------------------------------------
# 1. Merge conflict markers
# -----------------------------------------------------------------------------
header "1. Merge conflict markers"
CONFLICT_FILES=$(grep -rl --include="*.ts" --include="*.tsx" --include="*.js" \
  -e "^<<<<<<< " -e "^=======$" -e "^>>>>>>> " . \
  2>/dev/null || true)
if [ -n "$CONFLICT_FILES" ]; then
  fail "Unresolved merge conflicts found in:"
  echo "$CONFLICT_FILES" | while read -r f; do red "     $f"; done
else
  ok "No unresolved merge conflicts"
fi

# -----------------------------------------------------------------------------
# 2. Empty files in project root
# -----------------------------------------------------------------------------
header "2. Empty files in project root"
EMPTY_FILES=$(find . -maxdepth 1 -type f -empty 2>/dev/null || true)
if [ -n "$EMPTY_FILES" ]; then
  warn "Empty files in root:"
  echo "$EMPTY_FILES" | while read -r f; do yellow "     $f"; done
else
  ok "No empty files in root"
fi

# -----------------------------------------------------------------------------
# 3. Hardcoded credentials in TypeScript source files
# -----------------------------------------------------------------------------
header "3. Hardcoded credentials"
CRED_PATTERNS=("your_api_key_here" "password\s*=" "secret\s*=" "apiKey\s*=\s*['\"][^$'\"]")
CRED_FILES=""
for pattern in "${CRED_PATTERNS[@]}"; do
  MATCHES=$(grep -rl --include="*.ts" --include="*.tsx" \
    -e "$pattern" \
    --exclude-dir=node_modules \
    --exclude="*env*" \
    --exclude="*test*" \
    --exclude="*spec*" \
    . 2>/dev/null || true)
  CRED_FILES="$CRED_FILES$MATCHES"
done
# Deduplicate
CRED_FILES=$(echo "$CRED_FILES" | sort -u | grep -v "^$" || true)
if [ -n "$CRED_FILES" ]; then
  fail "Potential hardcoded credentials found in:"
  echo "$CRED_FILES" | while read -r f; do red "     $f"; done
else
  ok "No obvious hardcoded credentials found"
fi

# -----------------------------------------------------------------------------
# 4. Duplicate filenames across directories
# -----------------------------------------------------------------------------
header "4. Duplicate filenames"
DUPES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -path "*/node_modules/*" \
  2>/dev/null | xargs -I{} basename {} | sort | uniq -d || true)
if [ -n "$DUPES" ]; then
  warn "Duplicate filenames detected (may indicate src/src/ duplication):"
  echo "$DUPES" | while read -r f; do yellow "     $f"; done
  warn "TODO: Resolve src/src/ directory duplication in a future PR."
else
  ok "No duplicate filenames"
fi

# -----------------------------------------------------------------------------
# 5. .env tracked by git
# -----------------------------------------------------------------------------
header "5. .env tracked by git"
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  fail ".env is tracked by git! Remove it with: git rm --cached .env"
  fail "Then run: git filter-branch or use 'git-filter-repo' to purge history."
else
  ok ".env is not tracked by git"
fi

# -----------------------------------------------------------------------------
# 6. Required environment variables in .env.example
# -----------------------------------------------------------------------------
header "6. Required environment variables"
REQUIRED_VARS=(
  "VITE_SUPABASE_URL"
  "VITE_SUPABASE_ANON_KEY"
)
if [ -f .env.example ]; then
  for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "$var" .env.example; then
      ok "$var documented in .env.example"
    else
      warn "$var not found in .env.example"
    fi
  done
else
  warn ".env.example not found"
fi

# -----------------------------------------------------------------------------
# 7. npm audit for dependency vulnerabilities
# -----------------------------------------------------------------------------
header "7. Dependency vulnerabilities (npm audit)"
if command -v npm >/dev/null 2>&1; then
  AUDIT_OUTPUT=$(npm audit --audit-level=high 2>&1 || true)
  if echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
    ok "No high/critical vulnerabilities found"
  elif echo "$AUDIT_OUTPUT" | grep -qE "critical|high severity"; then
    warn "High/critical vulnerabilities found (review required):"
    echo "$AUDIT_OUTPUT" | grep -E "Severity:|No fix available" | head -10 | while read -r l; do yellow "     $l"; done
    warn "Run 'npm audit' for full details. Address before next release."
  else
    warn "Some lower-severity vulnerabilities found. Run 'npm audit' for details."
  fi
else
  warn "npm not found, skipping dependency audit"
fi

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
header "AUDIT SUMMARY"
echo "  Failures : $FAILURES"
echo "  Warnings : $WARNINGS"
echo ""

if [ "$FAILURES" -gt 0 ]; then
  red "Audit FAILED with $FAILURES critical issue(s). Fix them before merging."
  exit 1
else
  green "Audit PASSED (warnings: $WARNINGS)."
  exit 0
fi
