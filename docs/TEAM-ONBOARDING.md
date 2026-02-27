# Team Onboarding - GetionCamarerosParaEventos

Guía de incorporación para nuevos miembros del equipo.

## Bienvenida

Esta aplicación gestiona camareros, pedidos y eventos. El stack tecnológico es:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions con Deno)
- **Testing**: Playwright (E2E) + Vitest (unit)
- **CI/CD**: GitHub Actions

## Setup Local (Día 1)

### Prerrequisitos

- Node.js 20.x (`nvm use 20`)
- Git
- Editor (VS Code recomendado con extensión Tailwind CSS IntelliSense)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/jcarrizomarket-hash/GetionCamarerosParaEventos
cd GetionCamarerosParaEventos

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con los valores del equipo

# 4. Iniciar en desarrollo
npm run dev
```

### Variables de Entorno

Solicitar al Tech Lead los valores para tu `.env.local`:

```bash
VITE_SUPABASE_URL=          # URL del proyecto Supabase
VITE_SUPABASE_ANON_KEY=     # Clave pública de Supabase
VITE_SUPABASE_PROJECT_ID=   # ID del proyecto
```

**IMPORTANTE**: Nunca commitear `.env.local` ni compartir estas claves.

## Estructura del Proyecto

```
src/
├── components/         # Componentes React de la UI
│   ├── admin.tsx       # Panel de administración
│   ├── camareros.tsx   # Gestión de camareros
│   ├── pedidos.tsx     # Gestión de pedidos
│   └── ui/             # Componentes de UI reutilizables (shadcn)
├── middleware/         # Middleware TypeScript para la API
│   ├── validation.ts   # Validación con Zod
│   ├── rateLimit.ts    # Rate limiting
│   ├── audit.ts        # Audit trail
│   ├── errorHandler.ts # Manejo centralizado de errores
│   └── security.ts     # CORS, headers y validación de secretos
├── schemas/            # Schemas de validación Zod
├── supabase/
│   └── functions/server/ # Edge Functions de Supabase (Deno)
├── tests/
│   └── e2e/
│       ├── security/   # Tests E2E de seguridad
│       └── create-pedido.spec.ts
└── utils/              # Utilidades: logger, file-export, supabase client
supabase/
└── migrations/         # Scripts SQL de migraciones
docs/                   # Documentación operacional
```

## Flujo de Trabajo

### Branches

- `main` - Producción (solo merges aprobados)
- `develop` - Integración (rama principal de desarrollo)
- `feature/<nombre>` - Nueva funcionalidad
- `fix/<nombre>` - Corrección de bugs
- `copilot/<nombre>` - Cambios de Copilot AI

### Commits

Seguir Conventional Commits:

```
feat: agregar filtro de pedidos por fecha
fix: corregir validación de email en formulario
docs: actualizar guía de deployment
chore: actualizar dependencias
```

### Pull Requests

1. Crear branch desde `develop`
2. Hacer cambios y tests
3. Abrir PR hacia `develop`
4. Solicitar review (mínimo 1 aprobación)
5. CI debe estar verde
6. Merge con "Squash and merge"

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Build de producción
npm run type-check       # Verificar tipos TypeScript
npm run lint             # Linter ESLint

# Tests
npx playwright test                              # Todos los tests E2E
npx playwright test src/tests/e2e/security/     # Solo tests de seguridad
npx playwright test --headed                     # Con browser visible
npx playwright test --debug                      # Modo debug

# Supabase CLI
supabase status                                  # Estado del proyecto local
supabase db diff                                 # Cambios en BD
supabase functions serve                         # Servidor local de funciones
```

## Best Practices

### Código

- **Validar SIEMPRE** los inputs con los schemas Zod de `src/schemas/`
- **Usar el middleware** de `src/middleware/` para nuevos endpoints
- **Logging**: usar `logger.info/error/warn` de `src/utils/logger.ts`
- **Nunca** hardcodear secretos o tokens en el código

### Seguridad

- Revisar el `docs/SECURITY-CHECKLIST.md` antes de cada PR
- Los cambios en RLS policies requieren review adicional
- Reportar vulnerabilidades al Tech Lead de forma privada

### Base de Datos

- Toda nueva tabla debe tener RLS habilitado
- Toda tabla crítica debe tener triggers de audit trail
- Agregar índices para campos que se usen en WHERE/ORDER BY

## Contactos y Recursos

- **Tech Lead**: Ver canal #dev-team en Slack
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Documentación Supabase**: https://supabase.com/docs
- **Playwright Docs**: https://playwright.dev/docs/intro
- **shadcn/ui**: https://ui.shadcn.com/docs

## Accesos Necesarios

Solicitar al Tech Lead:

- [ ] Acceso al repositorio GitHub
- [ ] Invitación al proyecto Supabase (rol Developer)
- [ ] Acceso al workspace de Slack
- [ ] Valores de `.env.local` para desarrollo
- [ ] Acceso al dashboard de Sentry (si aplica)
