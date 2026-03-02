# 🏗️ Arquitectura del Sistema

## Visión General

Sistema de gestión de camareros con arquitectura de tres capas:

```
┌─────────────────────────────────────────┐
│          FRONTEND (React)               │
│  - Components                           │
│  - API Client (centralized)             │
│  - Types (TypeScript)                   │
└──────────────┬──────────────────────────┘
               │
               │ HTTPS + Auth + Secret
               │
┌──────────────▼──────────────────────────┐
│     SERVER (Supabase Edge Functions)    │
│  - Hono Web Framework                   │
│  - Middleware (Security)                │
│  - Business Logic                       │
└──────────────┬──────────────────────────┘
               │
               │ Supabase Client
               │
┌──────────────▼──────────────────────────┐
│       DATABASE (PostgreSQL)             │
│  - KV Store (key-value table)           │
│  - Supabase Auth                        │
│  - Supabase Storage                     │
└─────────────────────────────────────────┘
```

## 📁 Estructura de Archivos

```
/
├── src/
│   ├── types.ts              # Tipos TypeScript del dominio
│   ├── api/
│   │   └── client.ts         # Cliente API centralizado
│   └── utils/
│       └── helpers.ts        # Utilidades reutilizables
│
├── components/               # Componentes React
│   ├── dashboard.tsx
│   ├── pedidos.tsx
│   ├── camareros.tsx
│   ├── coordinadores.tsx
│   ├── clientes.tsx
│   ├── entrada-pedidos.tsx
│   ├── gestion-pedidos.tsx
│   ├── envio-mensaje.tsx
│   ├── envio-parte.tsx
│   ├── informes.tsx
│   └── ui/                   # Componentes UI reutilizables
│
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx     # Servidor Hono principal
│           ├── middleware.ts # Middleware de seguridad
│           └── kv_store.tsx  # Utilidades KV Store (protegido)
│
├── tests/
│   ├── unit/
│   │   └── helpers.spec.ts  # Tests unitarios (Vitest)
│   ├── e2e/
│   │   └── create-pedido.spec.ts  # Tests E2E (Playwright)
│   └── setup.ts             # Configuración de tests
│
├── .env.example             # Plantilla de variables de entorno
├── vitest.config.ts         # Configuración Vitest
├── playwright.config.ts     # Configuración Playwright
└── ARCHITECTURE.md          # Este archivo
```

## 🔐 Seguridad

### Niveles de Protección

1. **Frontend**: 
   - Solo usa `SUPABASE_ANON_KEY` (pública)
   - Opcionalmente `VITE_SUPABASE_FN_SECRET` para operaciones mutantes

2. **Backend (Edge Functions)**:
   - Middleware `requireFunctionSecret`: Valida header `x-fn-secret` para POST/PUT/DELETE
   - `SUPABASE_SERVICE_ROLE_KEY`: Solo en servidor, NUNCA expuesta al frontend
   - Validación de tokens de autenticación

3. **Database**:
   - Row Level Security (RLS) configurado en Supabase
   - Acceso solo a través del servidor

### Headers de Seguridad

```typescript
// Operaciones de lectura (GET)
headers: {
  'Authorization': 'Bearer SUPABASE_ANON_KEY'
}

// Operaciones mutantes (POST/PUT/DELETE)
headers: {
  'Authorization': 'Bearer SUPABASE_ANON_KEY',
  'x-fn-secret': 'SUPABASE_FN_SECRET'  // Validado por middleware
}
```

## 🎯 Tipos de Datos

### Entidades Principales

```typescript
// src/types.ts

interface Pedido {
  id: string
  numero: string
  cliente: string
  lugar: string
  diaEvento: string
  cantidadCamareros: number
  horaEntrada: string
  asignaciones: Asignacion[]
  // ... más campos
}

interface Camarero {
  id: string
  numero: number
  nombre: string
  telefono?: string
  activo: boolean
  // ... más campos
}

interface Coordinador {
  id: string
  nombre: string
  telefono?: string
  email?: string
  // ... más campos
}

interface Cliente {
  id: string
  nombre: string
  email?: string
  telefono?: string
  // ... más campos
}

interface Asignacion {
  camareroId: string
  camareroNumero: number
  camareroNombre: string
  estado: 'pendiente' | 'enviado' | 'confirmado' | 'no confirmado'
  turno?: 1 | 2
}
```

## 🔄 Cliente API

### Uso del Cliente Centralizado

```typescript
// Importar funciones del cliente
import { 
  getPedidos, 
  createPedido, 
  updatePedido,
  deletePedido 
} from './src/api/client';

// Ejemplo: Obtener todos los pedidos
const resultado = await getPedidos();
if (resultado.success) {
  console.log(resultado.data); // Pedido[]
} else {
  console.error(resultado.error);
}

// Ejemplo: Crear pedido
const nuevoPedido = await createPedido({
  numero: 'P-001',
  cliente: 'Cliente Test',
  // ... resto de campos
});
```

### Ventajas del Cliente API

- ✅ **Centralización**: Un solo lugar para toda la lógica de API
- ✅ **Manejo de Errores**: Consistente en toda la app
- ✅ **Type Safety**: Tipado completo con TypeScript
- ✅ **Configuración**: Variables de entorno manejadas centralmente
- ✅ **Testing**: Fácil de mockear en tests

## 🛠️ Utilidades (Helpers)

### Funciones Disponibles

```typescript
import {
  calcularHoras,           // Calcula horas entre dos tiempos
  formatearHoras,          // Formatea horas a "Xh Ymin"
  calcularCamarerosNecesarios,  // Suma turnos 1 y 2
  calcularHoraEncuentro,   // Calcula hora de encuentro (catering)
  formatearTelefono,       // Formatea teléfono con código país
  validarEmail,            // Valida formato de email
  formatearFecha,          // Formatea fecha en español
  deduplicarPorId,         // Elimina duplicados de array
  isPedidoCompleto,        // Verifica si pedido está completo
  calcularPorcentajeConfirmacion,  // % de confirmación
} from './src/utils/helpers';

// Ejemplo
const horas = calcularHoras('09:00', '17:00'); // 8
const formateado = formatearHoras(8.5); // "8h 30min"
```

## 🧪 Testing

### Tests Unitarios (Vitest)

```bash
# Instalar dependencias
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Ejecutar tests
npm test

# Ejecutar con coverage
npm test -- --coverage
```

### Tests E2E (Playwright)

```bash
# Instalar Playwright
npm install -D @playwright/test
npx playwright install

# Ejecutar tests E2E
npx playwright test

# Ejecutar con UI
npx playwright test --ui

# Ver reporte
npx playwright show-report
```

## 🔧 Middleware del Servidor

### Middleware Disponibles

```typescript
import { 
  requireFunctionSecret,  // Valida x-fn-secret para mutaciones
  requireAuth,            // Valida token de autenticación
  rateLimit,              // Previene abuso con rate limiting
  errorLogger,            // Logging de errores con contexto
  corsMiddleware,         // CORS configurable
} from './supabase/functions/server/middleware';

// Uso en el servidor
app.post('/pedidos', requireFunctionSecret, async (c) => {
  // Solo se ejecuta si x-fn-secret es válido
});
```

### Aplicar Middleware Global

```typescript
// En supabase/functions/server/index.tsx
import { Hono } from 'npm:hono';
import { requireFunctionSecret, errorLogger } from './middleware';

const app = new Hono();

// Middleware global
app.use('*', errorLogger);

// Middleware específico por ruta
app.post('/pedidos', requireFunctionSecret, handler);
app.put('/pedidos/:id', requireFunctionSecret, handler);
app.delete('/pedidos/:id', requireFunctionSecret, handler);
```

## 🚀 Despliegue

### Variables de Entorno en Producción

1. **Frontend** (Vercel/Netlify/etc):
   ```
   VITE_SUPABASE_PROJECT_ID=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_SUPABASE_FN_SECRET=...  # Opcional
   ```

2. **Backend** (Supabase Functions):
   ```
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   SUPABASE_FN_SECRET=...
   WHATSAPP_PHONE_ID=...
   WHATSAPP_API_KEY=...
   EMAIL_FROM=...
   RESEND_API_KEY=...
   ```

### Checklist de Despliegue

- [ ] Configurar todas las variables de entorno
- [ ] Generar `SUPABASE_FN_SECRET` seguro (32+ caracteres)
- [ ] Verificar que el middleware de seguridad está activo
- [ ] Ejecutar tests antes de desplegar: `npm test && npx playwright test`
- [ ] Revisar logs del servidor para errores
- [ ] Verificar que emails y WhatsApp funcionan
- [ ] Probar en diferentes dispositivos/navegadores

## 📊 Monitoreo y Logging

### Logs del Servidor

Los logs se pueden ver en:
- Supabase Dashboard → Functions → Logs
- Durante desarrollo local con `supabase functions serve`

### Ejemplo de Logging Efectivo

```typescript
// En el servidor
console.log('✅ Pedido creado:', { id, cliente, fecha });
console.error('❌ Error al crear pedido:', { error, pedido });
console.warn('⚠️ Advertencia: Secret no configurado');
```

## 🔄 Migración Gradual

### Plan de Migración por Etapas

1. **Fase 1: Preparación**
   - ✅ Crear tipos TypeScript
   - ✅ Crear cliente API
   - ✅ Crear helpers y tests

2. **Fase 2: Implementación**
   - [ ] Refactorizar componentes para usar cliente API
   - [ ] Aplicar middleware en rutas críticas
   - [ ] Migrar lógica de helpers a funciones centralizadas

3. **Fase 3: Testing**
   - [ ] Añadir tests unitarios para nuevas funcionalidades
   - [ ] Añadir tests E2E para flujos críticos
   - [ ] Verificar coverage de código

4. **Fase 4: Producción**
   - [ ] Desplegar cambios gradualmente
   - [ ] Monitorear logs y errores
   - [ ] Ajustar según feedback

## 📚 Recursos Adicionales

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Hono Framework](https://hono.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## 🤝 Contribución

Para contribuir al proyecto:

1. Seguir la estructura de tipos en `src/types.ts`
2. Usar el cliente API en lugar de fetch directo
3. Añadir tests para nueva funcionalidad
4. Documentar cambios importantes en este archivo
5. Usar middleware de seguridad para endpoints sensibles

---

**Última actualización**: Enero 2026
**Versión**: 2.0.0
