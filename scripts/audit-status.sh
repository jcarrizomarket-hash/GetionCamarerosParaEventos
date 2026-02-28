#!/bin/bash

# Script de análisis de estado de correcciones de auditoría
# Genera un reporte Markdown con el estado actual del repositorio

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ─── Verificar cada corrección ────────────────────────────────────────────────

# P0 — Críticas

# 1. Conflictos de merge resueltos (buscar <<<<<<< en .ts/.tsx)
if grep -rq '<<<<<<<' "$ROOT_DIR/src" --include='*.ts' --include='*.tsx' 2>/dev/null || \
   grep -q '<<<<<<<' "$ROOT_DIR/.gitignore" 2>/dev/null; then
  STATUS_MERGE="❌"
  MERGE_DONE=0
else
  STATUS_MERGE="✅"
  MERGE_DONE=1
fi

# 2. Credenciales hardcodeadas eliminadas
if grep -q 'your_api_key_here\|example\.com/api' "$ROOT_DIR/src/context/ApiContext.tsx" 2>/dev/null; then
  STATUS_CREDS="❌"
  CREDS_DONE=0
else
  STATUS_CREDS="✅"
  CREDS_DONE=1
fi

# 3. Logging de API keys seguro
if grep -q 'substring(0, 5)' "$ROOT_DIR/src/supabase/functions/server/index.tsx" 2>/dev/null; then
  STATUS_LOGGING="✅"
  LOGGING_DONE=1
else
  STATUS_LOGGING="❌"
  LOGGING_DONE=0
fi

# 4. .env en .gitignore
if grep -q '^\.env$' "$ROOT_DIR/.gitignore" 2>/dev/null || grep -q '^\.env' "$ROOT_DIR/.gitignore" 2>/dev/null; then
  STATUS_ENV="✅"
  ENV_DONE=1
else
  STATUS_ENV="❌"
  ENV_DONE=0
fi

# P1 — Graves

# 5. CORS restringido (defaultOrigin = '*' indica pendiente)
if grep -q "defaultOrigin = '\*'" "$ROOT_DIR/src/supabase/functions/server/middleware.ts" 2>/dev/null; then
  STATUS_CORS="❌"
  CORS_DONE=0
else
  STATUS_CORS="✅"
  CORS_DONE=1
fi

# 6. Middleware de seguridad mejorado (return next() después de !expectedSecret indica pendiente)
if awk '/!expectedSecret/{found=1} found && /return next\(\)/{exit 1}' \
     "$ROOT_DIR/src/supabase/functions/server/middleware.ts" 2>/dev/null; then
  STATUS_MIDDLEWARE="✅"
  MIDDLEWARE_DONE=1
else
  STATUS_MIDDLEWARE="❌"
  MIDDLEWARE_DONE=0
fi

# P2 — Limpieza

# 7. Archivos basura eliminados (Event, eslint, admin.tsx en raíz)
if [ -e "$ROOT_DIR/Event" ] || [ -e "$ROOT_DIR/eslint" ] || [ -e "$ROOT_DIR/admin.tsx" ]; then
  STATUS_TRASH="❌"
  TRASH_DONE=0
else
  STATUS_TRASH="✅"
  TRASH_DONE=1
fi

# 8. Documentación movida a docs/
if [ -d "$ROOT_DIR/docs" ]; then
  STATUS_DOCS="✅"
  DOCS_DONE=1
else
  STATUS_DOCS="❌"
  DOCS_DONE=0
fi

# Automatización

# 9. Script de auditoría creado (scripts/audit.sh)
if [ -f "$ROOT_DIR/scripts/audit.sh" ]; then
  STATUS_AUDIT_SH="✅"
  AUDIT_SH_DONE=1
else
  STATUS_AUDIT_SH="❌"
  AUDIT_SH_DONE=0
fi

# 10. GitHub Action de auditoría continua (.github/workflows/audit.yml)
if [ -f "$ROOT_DIR/.github/workflows/audit.yml" ]; then
  STATUS_AUDIT_CI="✅"
  AUDIT_CI_DONE=1
else
  STATUS_AUDIT_CI="❌"
  AUDIT_CI_DONE=0
fi

# ─── Calcular progreso ────────────────────────────────────────────────────────

TOTAL=10
COMPLETED=$(( MERGE_DONE + CREDS_DONE + LOGGING_DONE + ENV_DONE + CORS_DONE + \
              MIDDLEWARE_DONE + TRASH_DONE + DOCS_DONE + AUDIT_SH_DONE + AUDIT_CI_DONE ))
PERCENT=$(( COMPLETED * 100 / TOTAL ))

# Barra visual (20 chars)
FILLED=$(( PERCENT / 5 ))
EMPTY=$(( 20 - FILLED ))
BAR=""
[ $FILLED -gt 0 ] && for i in $(seq 1 $FILLED); do BAR="${BAR}█"; done
[ $EMPTY  -gt 0 ] && for i in $(seq 1 $EMPTY);  do BAR="${BAR}░"; done

# ─── Estimar tiempo restante ──────────────────────────────────────────────────
# P0: 1h cada uno (×10 para trabajar en enteros), P1: 2h (×10=20), P2: 0.5h (×10=5), Auto: 1h (×10=10)

REMAINING_TENTHS=0

[ $MERGE_DONE -eq 0 ]      && REMAINING_TENTHS=$(( REMAINING_TENTHS + 10 ))
[ $CREDS_DONE -eq 0 ]      && REMAINING_TENTHS=$(( REMAINING_TENTHS + 10 ))
[ $LOGGING_DONE -eq 0 ]    && REMAINING_TENTHS=$(( REMAINING_TENTHS + 10 ))
[ $ENV_DONE -eq 0 ]        && REMAINING_TENTHS=$(( REMAINING_TENTHS + 10 ))
[ $CORS_DONE -eq 0 ]       && REMAINING_TENTHS=$(( REMAINING_TENTHS + 20 ))
[ $MIDDLEWARE_DONE -eq 0 ] && REMAINING_TENTHS=$(( REMAINING_TENTHS + 20 ))
[ $TRASH_DONE -eq 0 ]      && REMAINING_TENTHS=$(( REMAINING_TENTHS +  5 ))
[ $DOCS_DONE -eq 0 ]       && REMAINING_TENTHS=$(( REMAINING_TENTHS +  5 ))
[ $AUDIT_SH_DONE -eq 0 ]   && REMAINING_TENTHS=$(( REMAINING_TENTHS + 10 ))
[ $AUDIT_CI_DONE -eq 0 ]   && REMAINING_TENTHS=$(( REMAINING_TENTHS + 10 ))

REMAINING_HOURS="${REMAINING_TENTHS%0}.${REMAINING_TENTHS#${REMAINING_TENTHS%0}}"
# Handle exact multiples of 10 (e.g. 10 -> "1.", fix to "1.0")
case "$REMAINING_HOURS" in
  *.) REMAINING_HOURS="${REMAINING_HOURS}0" ;;
esac

# ─── Fecha y próximo reporte ──────────────────────────────────────────────────

NOW=$(date -u '+%Y-%m-%d %H:%M UTC')
NEXT=$(date -u -d '+4 hours' '+%Y-%m-%d %H:%M UTC' 2>/dev/null || \
       date -u -v+4H '+%Y-%m-%d %H:%M UTC' 2>/dev/null || \
       echo "en 4 horas")

# ─── Próximos pasos ───────────────────────────────────────────────────────────

NEXT_STEPS=""
[ $MERGE_DONE -eq 0 ]      && NEXT_STEPS="${NEXT_STEPS}1. Resolver conflictos de merge en archivos \`.ts\`/\`.tsx\` y \`.gitignore\`\n"
[ $CREDS_DONE -eq 0 ]      && NEXT_STEPS="${NEXT_STEPS}2. Eliminar credenciales hardcodeadas en \`src/context/ApiContext.tsx\`\n"
[ $LOGGING_DONE -eq 0 ]    && NEXT_STEPS="${NEXT_STEPS}3. Añadir logging seguro de API keys (\`substring(0, 5)\`) en \`src/supabase/functions/server/index.tsx\`\n"
[ $ENV_DONE -eq 0 ]        && NEXT_STEPS="${NEXT_STEPS}4. Asegurarse de que \`.env\` esté en \`.gitignore\`\n"
[ $CORS_DONE -eq 0 ]       && NEXT_STEPS="${NEXT_STEPS}5. Configurar CORS restrictivo en el middleware (eliminar \`defaultOrigin = '*'\`)\n"
[ $MIDDLEWARE_DONE -eq 0 ] && NEXT_STEPS="${NEXT_STEPS}6. Mejorar el middleware de seguridad para que rechace solicitudes sin secret\n"
[ $TRASH_DONE -eq 0 ]      && NEXT_STEPS="${NEXT_STEPS}7. Eliminar archivos basura en la raíz: \`Event\`, \`eslint\`, \`admin.tsx\`\n"
[ $DOCS_DONE -eq 0 ]       && NEXT_STEPS="${NEXT_STEPS}8. Crear directorio \`docs/\` y mover documentación\n"
[ $AUDIT_SH_DONE -eq 0 ]   && NEXT_STEPS="${NEXT_STEPS}9. Crear script \`scripts/audit.sh\`\n"
[ $AUDIT_CI_DONE -eq 0 ]   && NEXT_STEPS="${NEXT_STEPS}10. Crear GitHub Action \`.github/workflows/audit.yml\`\n"

if [ -z "$NEXT_STEPS" ]; then
  NEXT_STEPS="¡Todas las correcciones completadas! 🎉\n"
fi

# ─── Generar reporte ──────────────────────────────────────────────────────────

cat <<EOF
# 🔍 Reporte de Auditoría — ${NOW}

## 📊 Progreso General: ${PERCENT}% ${BAR}

**Completadas:** ${COMPLETED} de ${TOTAL} correcciones
**Tiempo estimado restante:** ~${REMAINING_HOURS} horas

---

## 🔴 Críticas (P0)
| # | Corrección | Estado |
|---|-----------|--------|
| 1 | Conflictos de merge resueltos | ${STATUS_MERGE} |
| 2 | Credenciales hardcodeadas eliminadas | ${STATUS_CREDS} |
| 3 | Logging seguro de API keys | ${STATUS_LOGGING} |
| 4 | \`.env\` protegido en \`.gitignore\` | ${STATUS_ENV} |

## 🟠 Graves (P1)
| # | Corrección | Estado |
|---|-----------|--------|
| 5 | CORS restringido | ${STATUS_CORS} |
| 6 | Middleware de seguridad mejorado | ${STATUS_MIDDLEWARE} |

## 🟡 Limpieza (P2)
| # | Corrección | Estado |
|---|-----------|--------|
| 7 | Archivos basura eliminados | ${STATUS_TRASH} |
| 8 | Documentación reorganizada | ${STATUS_DOCS} |

## 🤖 Automatización
| # | Corrección | Estado |
|---|-----------|--------|
| 9 | Script de auditoría (\`audit.sh\`) | ${STATUS_AUDIT_SH} |
| 10 | CI/CD de auditoría continua | ${STATUS_AUDIT_CI} |

---

## 📋 Próximos Pasos
$(echo -e "$NEXT_STEPS")
---
*Reporte generado automáticamente. Próximo reporte: ${NEXT}*
EOF
