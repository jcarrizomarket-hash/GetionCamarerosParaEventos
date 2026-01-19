# 🔧 Guía de Refactorización - Cliente API y Seguridad

## 📋 Resumen

Esta rama `refactor/api-client-and-security` introduce mejoras arquitectónicas para centralizar la API, añadir seguridad robusta, y establecer una base sólida de testing.

## 🎯 Objetivos Cumplidos

✅ **Tipos TypeScript**: Todas las entidades del dominio tipadas  
✅ **Cliente API Centralizado**: Unifica llamadas al backend  
✅ **Helpers Reutilizables**: Lógica extraída y testeada  
✅ **Middleware de Seguridad**: Protección de endpoints mutantes  
✅ **Variables de Entorno**: Documentación completa  
✅ **Tests**: Plantillas de unitarios (Vitest) y E2E (Playwright)  

## 📁 Archivos Nuevos

```
✨ Nuevos archivos creados:

├── src/
│   ├── types.ts                      # Tipos TypeScript del dominio
│   ├── api/client.ts                 # Cliente API centralizado
│   └── utils/helpers.ts              # Utilidades reutilizables
│
├── supabase/functions/server/
│   └── middleware.ts                 # Middleware de seguridad
│
├── tests/
│   ├── unit/helpers.spec.ts          # Tests unitarios (Vitest)
│   ├── e2e/create-pedido.spec.ts     # Tests E2E (Playwright)
│   └── setup.ts                      # Configuración tests
│
├── .env.example                      # Plantilla variables entorno
├── package.json                      # Scripts de testing
├── vitest.config.ts                  # Config Vitest
├── playwright.config.ts              # Config Playwright
├── ARCHITECTURE.md                   # Documentación arquitectura
└── REFACTOR_GUIDE.md                 # Esta guía
```

## 🚀 Inicio Rápido

### 1. Instalar Dependencias de Testing

```bash
# Instalar dependencias de desarrollo
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @playwright/test @vitest/ui @vitest/coverage-v8

# Instalar navegadores de Playwright
npx playwright install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar plantilla
cp .env.example .env

# Editar .env y configurar:
# - VITE_SUPABASE_PROJECT_ID
# - VITE_SUPABASE_ANON_KEY
# - SUPABASE_FN_SECRET (generar uno nuevo y seguro)
# - Resto de variables según necesidad
```

### 3. Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests unitarios con UI
npm run test:ui

# Tests unitarios con coverage
npm run test:coverage

# Tests E2E
npm run test:e2e

# Tests E2E con UI
npm run test:e2e:ui

# Todos los tests
npm run test:all
```

## 🔐 Seguridad: Implementar Middleware

### Paso 1: Actualizar el Servidor

Edita `/supabase/functions/server/index.tsx`:

```typescript
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { 
  requireFunctionSecret, 
  errorLogger 
} from './middleware';

const app = new Hono();

// Middleware global
app.use('*', cors());
app.use('*', logger(console.log));
app.use('*', errorLogger);

// Proteger endpoints mutantes
app.post('/pedidos', requireFunctionSecret, async (c) => {
  // Tu código aquí
});

app.put('/pedidos/:id', requireFunctionSecret, async (c) => {
  // Tu código aquí
});

app.delete('/pedidos/:id', requireFunctionSecret, async (c) => {
  // Tu código aquí
});

// Rutas GET no necesitan secret (solo lectura)
app.get('/pedidos', async (c) => {
  // Tu código aquí
});
```

### Paso 2: Generar Secret Seguro

```bash
# Generar un secret aleatorio
openssl rand -hex 32

# O en Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Paso 3: Configurar en Supabase

1. Ve a: https://app.supabase.com/project/_/settings/functions
2. Añade la variable: `SUPABASE_FN_SECRET` con el valor generado
3. Reinicia las Edge Functions

### Paso 4: Actualizar Frontend (Opcional)

Si quieres proteger llamadas desde el frontend:

```typescript
// En .env
VITE_SUPABASE_FN_SECRET=mismo-secret-del-backend

// El cliente API ya lo maneja automáticamente
import { createPedido } from './src/api/client';

const resultado = await createPedido(nuevoPedido);
// Automáticamente incluye x-fn-secret en el header
```

## 🔄 Migrar Componentes al Cliente API

### Antes (Fetch Directo)

```typescript
// ❌ Antiguo: Fetch directo con duplicación de lógica
const response = await fetch(`${baseUrl}/pedidos`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: JSON.stringify(pedido)
});

const result = await response.json();
if (result.success) {
  // éxito
} else {
  // error
}
```

### Después (Cliente API)

```typescript
// ✅ Nuevo: Cliente centralizado con tipos
import { createPedido } from '../src/api/client';
import type { Pedido } from '../src/types';

const resultado = await createPedido(nuevoPedido);
if (resultado.success) {
  console.log(resultado.data); // Pedido con tipos
} else {
  console.error(resultado.error); // Error tipado
}
```

## 🛠️ Usar Helpers en Componentes

### Antes (Lógica Duplicada)

```typescript
// ❌ Lógica de cálculo dispersa en múltiples componentes
const [horaEntrada, minEntrada] = pedido.horaEntrada.split(':').map(Number);
const [horaSalida, minSalida] = pedido.horaSalida.split(':').map(Number);
const totalMinutos = (horaSalida * 60 + minSalida) - (horaEntrada * 60 + minEntrada);
const horas = totalMinutos / 60;
```

### Después (Helper Centralizado y Testeado)

```typescript
// ✅ Usar helper testeado
import { calcularHoras, formatearHoras } from '../src/utils/helpers';

const horas = calcularHoras(pedido.horaEntrada, pedido.horaSalida);
const horasFormateadas = formatearHoras(horas); // "8h 30min"
```

## 📝 Añadir Tipos a Componentes

### Antes (Sin Tipos)

```typescript
export function MiComponente({ pedidos, camareros }) {
  // TypeScript no puede ayudarte aquí
}
```

### Después (Con Tipos)

```typescript
import type { Pedido, Camarero } from '../src/types';

interface MiComponenteProps {
  pedidos: Pedido[];
  camareros: Camarero[];
}

export function MiComponente({ pedidos, camareros }: MiComponenteProps) {
  // Autocompletado y validación completos ✨
}
```

## 🧪 Añadir Tests para Nueva Funcionalidad

### Test Unitario

```typescript
// tests/unit/mi-funcion.spec.ts
import { describe, it, expect } from 'vitest';
import { miFuncion } from '../../src/utils/helpers';

describe('miFuncion', () => {
  it('debe hacer algo correctamente', () => {
    const resultado = miFuncion('entrada');
    expect(resultado).toBe('salida esperada');
  });
});
```

### Test E2E

```typescript
// tests/e2e/mi-flujo.spec.ts
import { test, expect } from '@playwright/test';

test('debe completar el flujo correctamente', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Mi Sección');
  
  // ... más acciones ...
  
  await expect(page.locator('text=Éxito')).toBeVisible();
});
```

## 📊 Monitoreo de Coverage

```bash
# Generar reporte de coverage
npm run test:coverage

# Ver reporte HTML
open coverage/index.html
```

Objetivo: **>80% de coverage** para lógica crítica

## 🔍 Validación de Tipos

```bash
# Verificar tipos sin compilar
npm run type-check

# Integrar en CI/CD
npm run type-check && npm test && npm run build
```

## ⚡ Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Testing
npm test                 # Tests unitarios en modo watch
npm run test:coverage    # Tests con coverage
npm run test:e2e         # Tests E2E
npm run test:all         # Todos los tests

# Build
npm run build            # Compilar para producción
npm run preview          # Preview del build

# Calidad de Código
npm run type-check       # Validar TypeScript
npm run lint             # Linter ESLint
```

## 📚 Documentación Adicional

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Arquitectura completa del sistema
- **[.env.example](./.env.example)**: Variables de entorno documentadas
- **[EMAIL_SETUP.md](./EMAIL_SETUP.md)**: Configuración de email
- **[WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)**: Configuración de WhatsApp

## 🎯 Próximos Pasos

### Fase 1: Adopción Gradual

1. [ ] Migrar 1-2 componentes al cliente API
2. [ ] Aplicar middleware en rutas críticas
3. [ ] Añadir tipos a componentes principales

### Fase 2: Testing

4. [ ] Escribir tests para funciones críticas
5. [ ] Añadir tests E2E para flujos principales
6. [ ] Alcanzar >70% coverage

### Fase 3: Optimización

7. [ ] Refactorizar lógica duplicada a helpers
8. [ ] Optimizar queries al backend
9. [ ] Implementar caché si es necesario

### Fase 4: Producción

10. [ ] Configurar CI/CD con tests automáticos
11. [ ] Configurar monitoring y alertas
12. [ ] Documentar cambios para el equipo

## 🤝 Contribuir

1. Seguir estructura de tipos en `src/types.ts`
2. Usar cliente API en lugar de fetch directo
3. Extraer lógica compleja a `src/utils/helpers.ts`
4. Añadir tests para nueva funcionalidad
5. Documentar cambios importantes

## 💡 Tips

- **Migración Gradual**: No hay que migrar todo de golpe. Empieza por los componentes más críticos.
- **Tests Primero**: Al refactorizar, escribe el test primero para asegurar que la funcionalidad no cambia.
- **Type Safety**: Deja que TypeScript te guíe. Si no compila, algo está mal.
- **Logs Descriptivos**: En el servidor, usa logs descriptivos con emojis para facilitar debugging.

## ❓ Preguntas Frecuentes

### ¿Debo migrar todo mi código existente?

No necesariamente. El código actual seguirá funcionando. Usa el nuevo sistema para:
- Código nuevo
- Refactorizaciones importantes
- Áreas críticas que necesitan tests

### ¿El middleware romperá mi código actual?

No, si lo implementas gradualmente:
1. Primero añade `logFunctionAccess` (solo logea)
2. Luego añade `requireFunctionSecret` en rutas nuevas
3. Finalmente migra rutas existentes una por una

### ¿Cómo debugging cuando algo falla?

1. Revisa logs del servidor: Supabase Dashboard → Functions → Logs
2. Verifica variables de entorno: `SUPABASE_FN_SECRET` configurado
3. Comprueba que el frontend envía el header correcto
4. Usa `console.log` generosamente durante desarrollo

### ¿Los tests son obligatorios?

No son obligatorios, pero **altamente recomendados** para:
- Lógica de negocio crítica (cálculos de horas, asignaciones)
- Flujos principales (crear pedido, confirmar camarero)
- Funciones con bugs históricos

---

**¡Éxito con la refactorización!** 🚀

Para dudas o sugerencias, consulta la documentación completa en [ARCHITECTURE.md](./ARCHITECTURE.md)
