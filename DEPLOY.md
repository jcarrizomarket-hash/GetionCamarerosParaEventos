# GUÍA DE DEPLOY A PRODUCCIÓN
# Ejecutar en orden. Tiempo estimado: 30-45 minutos.

# ══════════════════════════════════════════════════════════════════
# PASO 1 — Instalar Supabase CLI (si no lo tenés)
# ══════════════════════════════════════════════════════════════════
npm install -g supabase

# Verificar instalación:
supabase --version   # debe mostrar >= 1.x.x


# ══════════════════════════════════════════════════════════════════
# PASO 2 — Login en Supabase CLI
# ══════════════════════════════════════════════════════════════════
supabase login
# Abre el browser, autenticás con tu cuenta de Supabase.


# ══════════════════════════════════════════════════════════════════
# PASO 3 — Linkear el proyecto local con Supabase
# ══════════════════════════════════════════════════════════════════
cd /ruta/a/GetionCamarerosParaEventos

supabase link --project-ref gkfpsyclglyradzeyuwz
# Te va a pedir la database password del proyecto.
# La encontrás en: supabase.com → tu proyecto → Settings → Database → Database password


# ══════════════════════════════════════════════════════════════════
# PASO 4 — Aplicar la migración (crear tabla kv_store_25b11ac0)
# ══════════════════════════════════════════════════════════════════
supabase db push
# Aplica SOLO las migraciones pendientes. Revisa que incluya:
#   20260307000005_create_kv_store.sql

# Si preferís hacer solo esa migración manualmente via el SQL Editor de Supabase:
# → supabase.com → tu proyecto → SQL Editor → pegar el contenido de:
#   supabase/migrations/20260307000005_create_kv_store.sql
# → Run


# ══════════════════════════════════════════════════════════════════
# PASO 5 — Deploy de la Edge Function
# ══════════════════════════════════════════════════════════════════
supabase functions deploy server --project-ref gkfpsyclglyradzeyuwz

# Verificar que deployó:
# → supabase.com → tu proyecto → Edge Functions
# Debe aparecer "server" con estado "Active"


# ══════════════════════════════════════════════════════════════════
# PASO 6 — Configurar variables de entorno en la Edge Function
# ══════════════════════════════════════════════════════════════════
# En supabase.com → tu proyecto → Edge Functions → server → Secrets:
# (O via CLI:)

supabase secrets set WHATSAPP_API_KEY="tu_token_meta_aqui" --project-ref gkfpsyclglyradzeyuwz
supabase secrets set WHATSAPP_PHONE_ID="tu_phone_id_aqui" --project-ref gkfpsyclglyradzeyuwz
supabase secrets set WHATSAPP_VERIFY_TOKEN="un_token_secreto_que_vos_elijas" --project-ref gkfpsyclglyradzeyuwz

# NOTA: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY se inyectan automáticamente.
# NO necesitás configurarlos manualmente.


# ══════════════════════════════════════════════════════════════════
# PASO 7 — Configurar variables de entorno en Vercel
# ══════════════════════════════════════════════════════════════════
# → vercel.com → getion-camareros-para-eventos → Settings → Environment Variables
# Agregar/actualizar:

#  Variable                        Valor
#  ──────────────────────────────────────────────────────────────────
#  VITE_SUPABASE_URL               https://gkfpsyclglyradzeyuwz.supabase.co
#  VITE_SUPABASE_ANON_KEY          [tu anon key — ver paso 7a]
#  VITE_SUPABASE_FUNCTIONS_URL     https://gkfpsyclglyradzeyuwz.supabase.co/functions/v1
#  VITE_DEMO_MODE                  false   ← CRÍTICO: cambiar de true a false
#  ──────────────────────────────────────────────────────────────────

# PASO 7a — Dónde encontrar la ANON KEY:
# → supabase.com → tu proyecto → Settings → API → Project API keys → anon public


# ══════════════════════════════════════════════════════════════════
# PASO 8 — Redeploy en Vercel
# ══════════════════════════════════════════════════════════════════
# Después de cambiar las variables de entorno, Vercel NO redeploya solo.
# Opción A (desde Vercel UI):
#   → Deployments → seleccionar el último → Redeploy

# Opción B (desde CLI):
npx vercel --prod


# ══════════════════════════════════════════════════════════════════
# VERIFICACIÓN FINAL
# ══════════════════════════════════════════════════════════════════
# 1. Abrir www.eukosgestion.com
# 2. NO debe aparecer el banner amarillo de "Demo Mode"
# 3. Crear un camarero de prueba → debe persistir al recargar la página
# 4. Crear un pedido de prueba → debe aparecer en Gestión de Pedidos
# 5. En supabase.com → SQL Editor → ejecutar:
#      SELECT COUNT(*) FROM kv_store_25b11ac0;
#    Debe devolver el número de registros creados.


# ══════════════════════════════════════════════════════════════════
# ROLLBACK (si algo falla)
# ══════════════════════════════════════════════════════════════════
# En Vercel → Environment Variables → cambiar VITE_DEMO_MODE de vuelta a "true"
# → Redeploy. La app vuelve a funcionar en modo demo sin pérdida de datos.
