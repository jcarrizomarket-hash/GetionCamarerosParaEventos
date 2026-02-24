# 🤝 Contributing Guidelines

Guía para contribuir al Sistema de Gestión de Camareros.

¡Gracias por tu interés en contribuir! Este documento describe cómo colaborar de manera efectiva.

---

## 📋 Tabla de Contenidos

- [Antes de Empezar](#-antes-de-empezar)
- [Configuración del Entorno](#-configuración-del-entorno)
- [Flujo de Trabajo](#-flujo-de-trabajo)
- [Estándares de Código](#-estándares-de-código)
- [Commits](#-commits)
- [Pull Requests](#-pull-requests)
- [Tests](#-tests)
- [Documentación](#-documentación)
- [Reportar Bugs](#-reportar-bugs)
- [Solicitar Funcionalidades](#-solicitar-funcionalidades)

---

## 🎯 Antes de Empezar

1. Lee este documento completo
2. Revisa la [arquitectura del sistema](../src/ARCHITECTURE.md)
3. Busca si ya existe un issue o PR similar
4. Para cambios grandes, abre un issue primero para discutir el enfoque

---

## 🛠️ Configuración del Entorno

```bash
# 1. Fork del repositorio en GitHub

# 2. Clonar tu fork
git clone https://github.com/<tu-usuario>/GetionCamarerosParaEventos.git
cd GetionCamarerosParaEventos

# 3. Instalar dependencias
npm install

# 4. Configurar variables de entorno
# Crear .env con las variables necesarias (ver src/ARCHITECTURE.md para la lista completa)
# VITE_SUPABASE_PROJECT_ID=tu-project-id
# VITE_SUPABASE_ANON_KEY=tu-anon-key

# 5. Verificar que todo funciona
npm run type-check
npm run test:unit
npm run dev
```

---

## 🔄 Flujo de Trabajo

```bash
# 1. Crear branch desde main
git checkout main
git pull origin main
git checkout -b feature/nombre-de-la-funcionalidad

# 2. Hacer cambios incrementales con commits descriptivos
git add .
git commit -m "feat: descripción del cambio"

# 3. Mantener el branch actualizado
git fetch origin
git rebase origin/main

# 4. Push y abrir PR
git push origin feature/nombre-de-la-funcionalidad
```

### Tipos de Branch

| Prefijo | Uso | Ejemplo |
|---------|-----|---------|
| `feature/` | Nueva funcionalidad | `feature/auth-usuarios` |
| `fix/` | Corrección de bug | `fix/endpoint-envio-mensaje` |
| `docs/` | Solo documentación | `docs/api-reference` |
| `refactor/` | Refactorización | `refactor/api-client` |
| `test/` | Solo tests | `test/e2e-pedidos` |
| `chore/` | Tareas de mantenimiento | `chore/update-deps` |

---

## 📐 Estándares de Código

### TypeScript

- Usar tipos estrictos. Evitar `any`
- Definir interfaces en `src/src/types.ts` para tipos del dominio
- Exportar e importar tipos correctamente (`import type { ... }`)

```typescript
// ✅ Correcto
const pedido: Pedido = { id: '...', cliente: '...', ... };

// ❌ Evitar
const pedido: any = { ... };
```

### React

- Componentes funcionales con hooks
- Props tipadas con interfaces TypeScript
- Manejar estados de carga y error

```typescript
// ✅ Correcto
interface Props {
  pedidoId: string;
  onSuccess: () => void;
}

export function FormPedido({ pedidoId, onSuccess }: Props) {
  // ...
}
```

### API Client

- Usar el cliente centralizado en `src/src/api/client.ts` en lugar de `fetch` directo
- No hardcodear URLs de la API en componentes

```typescript
// ✅ Correcto
import { getPedidos } from '../api/client';
const pedidos = await getPedidos();

// ❌ Evitar
const resp = await fetch('https://xxx.supabase.co/functions/v1/...');
```

### Helpers

- Extraer lógica reutilizable a `src/src/utils/helpers.ts`
- Añadir tipos de retorno explícitos

```typescript
// ✅ Correcto
export function calcularHoras(inicio: string, fin: string): number {
  // ...
}
```

### Estilos (Tailwind)

- Usar clases de Tailwind CSS
- Para variantes complejas, usar `class-variance-authority` (cva)
- Evitar estilos inline salvo casos excepcionales

---

## 📝 Commits

Seguimos la especificación [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<ámbito opcional>): <descripción>

[cuerpo opcional]

[pie de nota opcional]
```

### Tipos de Commit

| Tipo | Descripción |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `style` | Cambios de formato (sin lógica) |
| `refactor` | Refactorización sin cambio funcional |
| `test` | Añadir o corregir tests |
| `chore` | Tareas de mantenimiento, dependencias |
| `perf` | Mejora de rendimiento |

### Ejemplos

```bash
git commit -m "feat(pedidos): añadir filtro por fecha en listado"
git commit -m "fix(whatsapp): corregir formato de número internacional"
git commit -m "docs: añadir guía de API en docs/API.md"
git commit -m "test(helpers): añadir tests para calcularHoras"
```

---

## 🔀 Pull Requests

### Antes de Abrir un PR

```bash
# Verificar TypeScript
npm run type-check

# Ejecutar tests
npm run test:unit

# Verificar linting
npm run lint

# Build exitoso
npm run build
```

### Plantilla del PR

Al abrir un PR, incluir:

```markdown
## Descripción
Breve descripción de los cambios.

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Refactorización
- [ ] Documentación
- [ ] Otro: ___

## ¿Cómo probar?
1. Pasos para reproducir / verificar el cambio

## Checklist
- [ ] Tests pasando (`npm run test:unit`)
- [ ] TypeScript sin errores (`npm run type-check`)
- [ ] Linting sin errores (`npm run lint`)
- [ ] Documentación actualizada (si aplica)
```

### Revisión de Código

- Todos los PRs requieren al menos una aprobación
- Responde a los comentarios de revisión
- Usa "Resolve conversation" cuando hayas aplicado un cambio sugerido
- Los PRs deben mantenerse pequeños y enfocados (< 400 líneas idealmente)

---

## 🧪 Tests

### Tests Unitarios (Vitest)

- Ubicación: `src/tests/unit/`
- Ejecutar: `npm run test:unit`
- Añadir tests para toda nueva lógica de negocio o helper

```typescript
// Ejemplo: src/tests/unit/mi-funcion.spec.ts
import { describe, it, expect } from 'vitest';
import { miFuncion } from '../../src/utils/helpers';

describe('miFuncion', () => {
  it('should return correct result', () => {
    expect(miFuncion('input')).toBe('expected');
  });
});
```

### Tests E2E (Playwright)

- Ubicación: `src/tests/e2e/`
- Ejecutar: `npm run test:e2e`
- Cubrir flujos críticos de usuario

```typescript
// Ejemplo básico
import { test, expect } from '@playwright/test';

test('crear pedido', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Nuevo Pedido');
  // ...
  await expect(page.locator('.pedido-creado')).toBeVisible();
});
```

### Cobertura Mínima

- Funciones helper: > 80%
- Componentes críticos: testeados E2E

---

## 📚 Documentación

- Actualizar `src/CHANGELOG.md` para cambios significativos
- Actualizar `docs/API.md` si se añaden o modifican endpoints
- Actualizar `src/ARCHITECTURE.md` si cambia la arquitectura
- Comentar funciones complejas con JSDoc

```typescript
/**
 * Calcula el número de horas entre dos tiempos.
 * @param inicio - Hora de inicio en formato "HH:MM"
 * @param fin - Hora de fin en formato "HH:MM"
 * @returns Número de horas (puede ser decimal)
 */
export function calcularHoras(inicio: string, fin: string): number {
  // ...
}
```

---

## 🐛 Reportar Bugs

Al reportar un bug, incluir:

1. **Descripción clara** del problema
2. **Pasos para reproducir** (numerados)
3. **Comportamiento esperado** vs **comportamiento actual**
4. **Entorno**: OS, versión de Node.js, navegador
5. **Logs** de consola y/o Supabase Functions
6. **Screenshots** si aplica

---

## 💡 Solicitar Funcionalidades

1. Verificar que no existe ya un issue similar
2. Abrir un issue con la etiqueta `enhancement`
3. Describir:
   - El problema que resuelve
   - La solución propuesta
   - Alternativas consideradas
   - Impacto esperado

---

## 🔗 Referencias

- [API Reference](./API.md)
- [Architecture](../src/ARCHITECTURE.md)
- [Refactor Guide](../src/REFACTOR_GUIDE.md)
- [Conventional Commits](https://www.conventionalcommits.org/)
