# NPM Scripts

Guía completa de comandos disponibles en este proyecto.

## Desarrollo

### `npm run dev`
Inicia el servidor de desarrollo en http://localhost:5173

```bash
npm run dev
```

### `npm run dev:host`
Inicia el servidor accesible desde otras máquinas en la red

```bash
npm run dev:host
```

### `npm run preview`
Vista previa del build de producción

```bash
npm run preview
```

## Build

### `npm run build`
Compila el proyecto para producción

```bash
npm run build
```

### `npm run build:analyze`
Build con análisis del bundle

```bash
npm run build:analyze
```

### `npm run build:preview`
Build y preview encadenados

```bash
npm run build:preview
```

## Testing

### `npm run test`
Ejecuta tests unitarios en watch mode

```bash
npm run test
```

### `npm run test:watch`
Tests en modo watch explícito

```bash
npm run test:watch
```

### `npm run test:coverage`
Tests con reporte de cobertura

```bash
npm run test:coverage
```

Genera reporte en `coverage/`

### `npm run test:e2e`
Tests E2E con Playwright

```bash
npm run test:e2e
```

### `npm run test:e2e:ui`
Tests E2E con interfaz visual

```bash
npm run test:e2e:ui
```

### `npm run test:e2e:debug`
Tests E2E en modo debug

```bash
npm run test:e2e:debug
```

### `npm run test:all`
Ejecuta toda la suite de tests y validaciones

```bash
npm run test:all
```

Ejecuta:
1. Type checking
2. Linting
3. Tests unitarios con coverage
4. Tests E2E

## Linting y Formatting

### `npm run lint`
Verifica estilo de código con ESLint

```bash
npm run lint
```

### `npm run lint:fix`
Corrige automáticamente errores de ESLint

```bash
npm run lint:fix
```

### `npm run format`
Formatea código con Prettier

```bash
npm run format
```

### `npm run format:check`
Verifica si el código está formateado correctamente

```bash
npm run format:check
```

### `npm run type-check`
Verifica tipos TypeScript sin compilar

```bash
npm run type-check
```

## Validación

### `npm run validate`
Validación completa del proyecto

```bash
npm run validate
```

Ejecuta:
1. Type checking
2. Prettier check
3. ESLint check
4. Tests unitarios con coverage

## Limpieza

### `npm run clean`
Limpia todo (dist, node_modules, cache)

```bash
npm run clean
```

### `npm run clean:dist`
Limpia solo el build

```bash
npm run clean:dist
```

### `npm run clean:cache`
Limpia la cache de Vite y Turbo

```bash
npm run clean:cache
```

### `npm run clean:deps`
Limpia node_modules

```bash
npm run clean:deps
```

### `npm run clean:all`
Limpia y reinstala todo

```bash
npm run clean:all
```

## Análisis

### `npm run analyze`
Build con análisis del bundle

```bash
npm run analyze
```

## Setup

### `npm run setup`
Setup inicial del proyecto

```bash
npm run setup
```

Ejecuta:
1. `npm install`
2. `npm run prepare` (setup de Husky)

### `npm run prepare`
Setup de Husky para pre-commit hooks

```bash
npm run prepare
```

## Workflow Recomendado

### Desarrollo
```bash
npm run dev              # Inicia servidor
npm run test:watch      # En otra terminal, tests watch
npm run validate        # Antes de hacer commit
```

### Pre-commit
Los hooks automáticos ejecutan:
```bash
npm run pre-commit      # Lint y format de archivos modificados
```

### Antes de Push
```bash
npm run test:all        # Suite completa de tests
```

### Antes de Producción
```bash
npm run validate        # Validación completa
npm run build           # Build optimizado
npm run preview         # Preview del build
```

## Troubleshooting

### Cache corrupto
```bash
npm run clean:cache
npm run dev
```

### Dependencias problemáticas
```bash
npm run clean:all
```

### Husky no funciona
```bash
npm run prepare
```

### ESLint/Prettier conflictos
```bash
npm run lint:fix
npm run format
```
