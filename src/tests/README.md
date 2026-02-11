# 🧪 Sistema de Testing

Este directorio contiene toda la infraestructura de testing del sistema de gestión de camareros.

---

## 📁 Estructura

```
tests/
├── e2e/                    # Tests End-to-End con Playwright
│   └── create-pedido.spec.ts
├── integration/            # Tests de integración
│   ├── whatsapp.spec.ts   # Tests de WhatsApp Business API
│   └── email.spec.ts      # Tests de sistema de email
├── unit/                   # Tests unitarios
│   └── helpers.spec.ts    # Tests de funciones helper
├── manual/                 # Guías de testing manual
│   └── testing-guide.md   # Guía detallada paso a paso
├── test-config.ts         # Configuración centralizada de testing
└── setup.ts               # Setup global de tests
```

---

## 🚀 Comandos de Testing

### Tests Unitarios

```bash
# Ejecutar todos los tests unitarios
npm run test:unit

# Ejecutar en modo watch (re-ejecuta al cambiar archivos)
npm run test:watch

# Ver interfaz visual de tests
npm run test:ui
```

### Tests de Integración

```bash
# Ejecutar tests de integración
npm run test:integration

# Ejecutar solo tests de WhatsApp
npx vitest tests/integration/whatsapp.spec.ts

# Ejecutar solo tests de Email
npx vitest tests/integration/email.spec.ts
```

### Tests E2E

```bash
# Ejecutar tests End-to-End
npm run test:e2e

# Ejecutar con interfaz visual
npm run test:e2e:ui

# Ejecutar viendo el navegador
npm run test:e2e:headed
```

### Todos los Tests

```bash
# Ejecutar TODOS los tests (unit + integration + e2e)
npm run test:all

# Ejecutar tests con cobertura de código
npm run test:coverage
```

---

## 📱 Número de Prueba WhatsApp

**Número configurado:** `+15558327331`

Este número está pre-configurado en todos los tests y en el Panel de Pruebas de la UI.

### Cómo usarlo:

1. **Registra el número en WhatsApp Business API:**
   - Ve a Meta for Developers
   - En tu app → WhatsApp → Números de prueba
   - Agrega `+15558327331`

2. **El número ya está en:**
   - `test-config.ts` → `TEST_CONFIG.whatsapp.testPhoneNumber`
   - Panel de Pruebas en la UI
   - Todos los tests de integración

---

## 🎯 Casos de Prueba Principales

### 1. Validación de Phone Number ID

**Objetivo:** Verificar que el sistema distingue correctamente entre Phone Number ID y número de teléfono.

```typescript
import { validatePhoneNumberId } from './test-config';

// ✅ Debería pasar
validatePhoneNumberId('106540852500791');  // true

// ❌ Debería fallar
validatePhoneNumberId('+34628904614');     // false
validatePhoneNumberId('628 904 614');      // false
```

### 2. Formateo de Números

**Objetivo:** Verificar el formateo correcto de números internacionales.

```typescript
import { formatPhoneNumber } from './test-config';

formatPhoneNumber('628904614');           // '34628904614'
formatPhoneNumber('+34628904614');        // '34628904614'
formatPhoneNumber('+15558327331');        // '15558327331'
```

### 3. Envío de WhatsApp

**Objetivo:** Enviar un mensaje real a través de WhatsApp Business API.

```typescript
// Ver: tests/integration/whatsapp.spec.ts
// o usar el Panel de Pruebas en la UI
```

---

## 🔧 Configuración de Testing

### Variables de Entorno

Para ejecutar tests que requieren conexión real al servidor:

```bash
# .env.test (crear este archivo)
TEST_BASE_URL=http://localhost:3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
```

### Configuración Centralizada

Todo está en `test-config.ts`:

```typescript
export const TEST_CONFIG = {
  whatsapp: {
    testPhoneNumber: '+15558327331',
    testPhoneNumberClean: '15558327331',
    // ... más configuración
  },
  email: {
    testEmail: 'pruebas@sistema-camareros.com',
    // ... más configuración
  },
  // ... más configuración
};
```

---

## 📊 Cobertura de Tests

### Tests Implementados

- ✅ **25+ tests de WhatsApp** (validación, formateo, integración)
- ✅ **15+ tests de Email** (validación, estructura, proveedores)
- ✅ **10+ tests de helpers** (funciones auxiliares)
- ✅ **35+ tests E2E** (flujos completos de usuario)
- ✅ **27 procedimientos manuales** (guía detallada)

**Total: 85+ tests automatizados + 27 procedimientos manuales**

### Áreas Cubiertas

- ✅ Validación de datos de entrada
- ✅ Formateo de números de teléfono
- ✅ Validación de Phone Number ID vs número de teléfono
- ✅ Integración con WhatsApp Business API
- ✅ Sistema de email multi-proveedor
- ✅ Manejo de errores y edge cases
- ✅ CRUD de entidades (camareros, pedidos, etc.)
- ✅ Flujos de confirmación/rechazo
- ✅ UI/UX completo

---

## 🧪 Panel de Pruebas Interactivo

### Acceso

1. Inicia la aplicación: `npm run dev`
2. Ve a la pestaña **"Panel de Pruebas"** 🧪

### Funcionalidades

#### Pestaña WhatsApp
- ✅ Verificar configuración
- ✅ Ejecutar tests de validación
- ✅ Enviar mensaje de prueba al número configurado
- ✅ Ver resultados en tiempo real

#### Pestaña Email
- 📧 Envío de email de prueba (próximamente)

#### Pestaña Resultados
- 📊 Historial de las últimas 10 pruebas
- 🔍 Detalles expandibles para debugging
- 🎨 Estados visuales (éxito/error/advertencia)

---

## 📚 Documentación Adicional

### Guías Detalladas

- **[Guía de Testing Manual](manual/testing-guide.md)** - 27 procedimientos paso a paso
- **[Configuración de Testing](../TESTING_SETUP.md)** - Setup completo del entorno de testing
- **[Configuración de WhatsApp](../WHATSAPP_SETUP.md)** - Configuración de WhatsApp Business API

### Archivos de Configuración

- **test-config.ts** - Configuración centralizada de testing
- **setup.ts** - Setup global para Vitest
- **vitest.config.ts** - Configuración de Vitest (raíz del proyecto)
- **playwright.config.ts** - Configuración de Playwright (raíz del proyecto)

---

## 🎓 Ejemplos de Uso

### Ejecutar un test específico

```bash
# Test específico de validación de Phone Number ID
npx vitest tests/integration/whatsapp.spec.ts -t "debe validar un Phone Number ID correcto"
```

### Modo debug

```bash
# Ejecutar tests con output detallado
npx vitest --reporter=verbose

# Ejecutar tests E2E con navegador visible
npm run test:e2e:headed
```

### Generar datos de prueba

```typescript
import { generateRandomTestData } from './tests/test-config';

const testData = generateRandomTestData();
// Genera camarero y pedido con IDs únicos basados en timestamp
```

---

## 🐛 Debugging

### Ver logs de tests

```bash
# Ejecutar tests con más detalle
npx vitest --reporter=verbose

# Ver stack traces completos
npx vitest --no-coverage
```

### Tests fallando

1. **Revisa los logs** en la consola
2. **Verifica la configuración** en `test-config.ts`
3. **Comprueba el servidor** está corriendo
4. **Revisa las variables de entorno**

### Tests E2E fallando

1. **Ejecuta en modo headed** para ver el navegador: `npm run test:e2e:headed`
2. **Usa el modo UI** para debugging interactivo: `npm run test:e2e:ui`
3. **Revisa los screenshots** de fallos en `test-results/`

---

## ✅ Checklist Pre-Deployment

Antes de desplegar a producción, asegúrate de:

- [ ] Todos los tests unitarios pasan (`npm run test:unit`)
- [ ] Todos los tests de integración pasan (`npm run test:integration`)
- [ ] Todos los tests E2E pasan (`npm run test:e2e`)
- [ ] Cobertura de código > 70% (`npm run test:coverage`)
- [ ] Pruebas manuales críticas completadas (ver guía manual)
- [ ] Panel de Pruebas oculto/protegido en producción
- [ ] Variables de entorno de producción configuradas
- [ ] Tokens de WhatsApp permanentes configurados (no temporales)

---

## 🤝 Contribuir con Tests

### Agregar un nuevo test

1. Identifica el tipo: unit, integration, o e2e
2. Crea el archivo en el directorio correcto
3. Usa la configuración de `test-config.ts`
4. Sigue las convenciones existentes
5. Ejecuta los tests localmente
6. Documenta el propósito del test

### Convenciones

- **Nombres descriptivos:** `debe validar un Phone Number ID correcto`
- **Organización por describe:** Agrupa tests relacionados
- **Datos de prueba:** Usa `test-config.ts`, no hardcodees
- **Cleanup:** Limpia datos de prueba después de cada test si es necesario

---

## 📞 Soporte

Si tienes problemas con los tests:

1. Revisa la documentación en `/tests/manual/testing-guide.md`
2. Verifica la configuración en `test-config.ts`
3. Comprueba los logs del servidor en Supabase
4. Revisa los issues existentes en el repositorio

---

## 🎉 ¡Listo para Testing!

Ahora tienes:
- ✅ 85+ tests automatizados
- ✅ Panel de pruebas interactivo en la UI
- ✅ Guía manual detallada
- ✅ Número de prueba configurado
- ✅ Documentación completa

**¡Happy Testing! 🧪**
