# Auditoría de Seguridad y Calidad — GetionCamarerosParaEventos

**Fecha:** 2026-03-01  
**Auditor:** Copilot Senior Audit Agent  
**Versión del proyecto:** según `package.json`

---

## Estado General de Salud

| Área | Estado |
|------|--------|
| Credenciales en código | ✅ Corregido |
| Conflictos de merge | ✅ Resueltos |
| Archivos basura/duplicados | ✅ Eliminados |
| `.env` en git tracking | ✅ Corregido |
| CORS wildcard | ✅ Corregido |
| Dependencias vulnerables | ⚠️ Parcialmente (ver sección 5) |
| CI/CD | ✅ Corregido |

---

## Hallazgos y Acciones Tomadas

### 🔴 CRÍTICO

#### C-01: Archivo `.env` rastreado por git
- **Descripción:** El archivo `.env` estaba incluido en el repositorio git. Aunque contenía valores de ejemplo (`"your_supabase_url"`), el tracking de git habilitaba la exposición accidental de credenciales reales en commits futuros.
- **Acción tomada:** Se ejecutó `git rm --cached .env` para eliminar el tracking. Se verificó que `.gitignore` excluye `.env`, `.env.local` y `.env.*.local`.

---

### 🔴 ALTO

#### H-01: CORS con wildcard (`*`) en servidor de Supabase Functions
- **Descripción:** El servidor `src/supabase/functions/server/index.tsx` usaba `cors()` sin restricciones de origen, permitiendo peticiones desde cualquier dominio.
- **Acción tomada:** Se reemplazó por configuración de CORS que lee orígenes permitidos desde la variable de entorno `ALLOWED_ORIGINS` (lista separada por comas). Agregar `ALLOWED_ORIGINS` al entorno de la Supabase Function en producción.

#### H-02: Conflictos de merge sin resolver en código fuente
- **Descripción:** Se encontraron marcadores de conflicto `<<<<<<<`/`=======`/`>>>>>>>` en tres archivos de código:
  - `.gitignore`
  - `src/src/api/client.ts`
  - `src/supabase/functions/server/index.tsx`
- **Acción tomada:** Todos los conflictos fueron resueltos. En `.gitignore` se adoptó la versión más completa (branch `main`). En `client.ts` se conservó el uso del logger centralizado. En `index.tsx` se mantuvo el endpoint `chat-mensajes` del branch de feature.

#### H-03: Archivo `admin.tsx` duplicado en la raíz
- **Descripción:** Existía un `admin.tsx` en la raíz del proyecto (con código diferente al de `src/components/admin.tsx`) que no era importado por ningún módulo, constituyendo código huérfano confuso.
- **Acción tomada:** El archivo `admin.tsx` de la raíz fue eliminado.

---

### 🟡 MEDIO

#### M-01: `src/package.json` duplicado
- **Descripción:** Existía un `src/package.json` con solo dos scripts (`lint`, `type-check`) que duplicaba parcialmente el `package.json` raíz.
- **Acción tomada:** Eliminado `src/package.json`.

#### M-02: Archivos de documentación/notas en `src/`
- **Descripción:** Se encontraron 35+ archivos `.md`, `.txt` y `.sh` de notas, informes y guías dentro del directorio `src/`, mezclados con el código fuente. Esto no es convencional y dificulta la navegación.
- **Acción tomada:** Todos los archivos de documentación fueron eliminados de `src/`. Los documentos de referencia relevantes permanecen en la raíz del proyecto (README.md, ARCHITECTURE.md, CHANGELOG.md, etc.).

#### M-03: Archivos vacíos/huérfanos en raíz
- **Descripción:** Se encontraron dos archivos vacíos en la raíz del proyecto:
  - `Event` (0 bytes, sin extensión)
  - `eslint` (0 bytes, sin extensión)
- **Acción tomada:** Ambos archivos fueron eliminados.

#### M-04: Script de desinstalación de paquetes vulnerables (`uninstall_vulnerable_packages.sh`)
- **Descripción:** Existía un script `uninstall_vulnerable_packages.sh` que desinstalaba `xlsx`, `jspdf` y `jspdf-autotable`, pero estos paquetes siguen en `package.json` y son usados activamente por la aplicación (`src/components/informes.tsx`, `src/utils/file-export.ts`). Ejecutar el script rompería la funcionalidad.
- **Acción tomada:** El script fue eliminado. Las dependencias vulnerables están documentadas en M-05.

#### M-05: Dependencias con vulnerabilidades conocidas
- **Descripción:** `npm audit` reportó las siguientes vulnerabilidades:

  | Paquete | Severidad | CVE/Advisory | Fix disponible |
  |---------|-----------|--------------|---------------|
  | `xlsx@0.18.5` | HIGH | GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9 | ❌ No fix disponible en npm |
  | `jspdf@2.5.1` | MODERATE | GHSA-vhxf-7vqr-mrjg (via dompurify) | ⚠️ Fix requiere v4.x (breaking change) |
  | `jspdf-autotable@3.x` | MODERATE | Transitiva de jspdf | ⚠️ Fix requiere jspdf v4.x |
  | `vite@6.x` + `vitest@1.x` + `vite-node@x` | MODERATE | GHSA-67mh-4wv8-2f99 (esbuild) | ⚠️ Solo afecta servidor de desarrollo |

- **Recomendaciones pendientes (acción manual requerida):**
  1. **`xlsx`**: Migrar a `exceljs` o `@e965/xlsx` como alternativa segura.
  2. **`jspdf` + `jspdf-autotable`**: Actualizar a jspdf v4.x y la versión compatible de jspdf-autotable. Requiere verificar cambios de API.
  3. **`vite/vitest`**: La vulnerabilidad de esbuild solo afecta al servidor de desarrollo local. Actualizar `vitest` a v4.x cuando sea conveniente.

#### M-06: Middleware de logger del servidor usando `console.log`
- **Descripción:** `app.use('*', logger(console.log))` pasaba `console.log` como callback del middleware logger de Hono.
- **Acción tomada:** Se cambió a `logger()` sin callback (usa la salida predeterminada de Hono, apropiada para Deno/Supabase Functions).

#### M-07: `actions/upload-artifact@v3` deprecado en CI
- **Descripción:** El workflow `.github/workflows/ci.yml` usaba `actions/upload-artifact@v3`, que está deprecado y marcado para retiro.
- **Acción tomada:** Actualizado a `actions/upload-artifact@v4`.

---

### 🔵 BAJO

#### B-01: `.env.example` incompleto
- **Descripción:** El `.env.example` original solo incluía variables genéricas de app pero omitía las variables de Supabase necesarias (`VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_FUNCTION_ENDPOINT`, `VITE_SUPABASE_FN_SECRET`).
- **Acción tomada:** `.env.example` actualizado con todas las variables necesarias.

#### B-02: Versiones de Node.js en CI
- **Descripción:** El CI testea con Node 18.x y 20.x. Node 18 alcanzó End-of-Life en abril 2025.
- **Recomendación pendiente:** Actualizar la matrix de CI a Node 20.x y 22.x.

---

## Recomendaciones Pendientes (requieren acción manual)

1. **Migrar `xlsx`** a una alternativa segura (`exceljs`, `@e965/xlsx`) — impacto en `src/utils/file-export.ts` y `src/components/informes.tsx`.
2. **Actualizar `jspdf` a v4.x** — revisar cambios en API de jsPDF 4.x antes de actualizar.
3. **Configurar `ALLOWED_ORIGINS`** en las variables de entorno de Supabase Functions con el dominio real de la aplicación.
4. **Agregar `ALLOWED_ORIGINS` a `.env.example`** una vez conocido el dominio de producción.
5. **Actualizar matrix de CI** de Node 18 a Node 22.
6. **Rate limiting**: No se encontró protección de rate limiting en el servidor. Considerar implementarlo en Supabase Edge Functions usando el middleware de Hono `rateLimit`.
7. **Headers de seguridad**: Agregar middleware `secureHeaders()` de Hono al servidor para añadir `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, etc.
