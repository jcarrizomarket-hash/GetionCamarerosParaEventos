# ✅ Checklist Pre-Merge - Refactorización Completa

## 📋 Estado de las Tareas

### ✅ Completadas

- [x] **Archivos añadidos** - 16 nuevos archivos creados con estructura moderna
- [x] **No subir claves sensibles** - `.env.example` creado, `.env` no incluido en repo
- [x] **Integrar middleware** - `requireFunctionSecret` aplicado a todas las rutas mutantes
- [x] **Scripts de package.json** - Scripts de testing añadidos
- [x] **Documentación completa** - 5 documentos guía disponibles

### ⚠️ Pendientes (Requieren Acción del Usuario)

- [ ] **Configurar SUPABASE_FN_SECRET** - Generar y configurar en Supabase Functions
- [ ] **Migrar llamadas fetch** - De forma incremental a `src/api/client.ts`
- [ ] **Ejecutar y ajustar tests** - Instalar dependencias y ajustar selectores E2E
- [ ] **Revisar permisos RLS** - Verificar que service_role no se exponga al frontend
- [ ] **Opcional: React Query/SWR** - Para caché y sincronización

---

## 🔐 Configuración de Seguridad CRÍTICA

### Paso 1: Generar Secret Seguro

```bash
# Opción 1: OpenSSL
openssl rand -hex 32

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Resultado ejemplo:
# f4b8c9d2e7a1234567890abcdef1234567890abcdef1234567890abcdef12345
```

### Paso 2: Configurar en Supabase Functions

1. Ve a: https://app.supabase.com/project/_/settings/functions
2. Añade variable de entorno:
   - **Nombre**: `SUPABASE_FN_SECRET`
   - **Valor**: El secret generado en el paso 1
3. Guarda y reinicia las Edge Functions

### Paso 3: (Opcional) Configurar en Frontend

Si quieres que el frontend envíe el secret en peticiones mutantes:

```bash
# En tu archivo .env del frontend
VITE_SUPABASE_FN_SECRET=mismo-secret-del-paso-1
```

### Paso 4: Verificar Middleware Aplicado

El middleware está aplicado en las siguientes rutas:

✅ **Clientes**:
- `POST /make-server-25b11ac0/clientes`
- `PUT /make-server-25b11ac0/clientes/:id`
- `DELETE /make-server-25b11ac0/clientes/:id`

✅ **Camareros**:
- `POST /make-server-25b11ac0/camareros`
- `PUT /make-server-25b11ac0/camareros/:id`

✅ **Coordinadores**:
- `POST /make-server-25b11ac0/coordinadores`

✅ **Pedidos**:
- `POST /make-server-25b11ac0/pedidos`
- `PUT /make-server-25b11ac0/pedidos/:id`
- `DELETE /make-server-25b11ac0/pedidos/:id`

---

## 📦 Instalación de Dependencias de Testing

### Tests Unitarios (Vitest)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitest/ui @vitest/coverage-v8
```

### Tests E2E (Playwright)

```bash
npm install -D @playwright/test
npx playwright install
```

### Scripts Disponibles

```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:all": "npm test && npm run test:e2e"
}
```

---

## 🔄 Migración Incremental a Cliente API

### Ejemplo de Migración

#### Antes (Fetch Directo)

```typescript
// components/mi-componente.tsx
const response = await fetch(`${baseUrl}/pedidos`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: JSON.stringify(pedido)
});

const result = await response.json();
```

#### Después (Cliente API)

```typescript
// components/mi-componente.tsx
import { createPedido } from '../src/api/client';
import type { Pedido } from '../src/types';

const resultado = await createPedido(pedido);
if (resultado.success) {
  console.log(resultado.data); // Pedido tipado
} else {
  console.error(resultado.error);
}
```

### Plan de Migración Recomendado

1. **Semana 1**: Migrar componentes de creación (POST)
2. **Semana 2**: Migrar componentes de actualización (PUT)
3. **Semana 3**: Migrar componentes de eliminación (DELETE)
4. **Semana 4**: Refactorizar componentes complejos con helpers

---

## 🧪 Ejecutar Tests

### Tests Unitarios

```bash
# Ejecutar tests
npm test

# Ejecutar con UI
npm run test:ui

# Generar coverage
npm run test:coverage

# Ver reporte de coverage
open coverage/index.html
```

### Tests E2E

```bash
# Ejecutar todos los tests
npm run test:e2e

# Ejecutar con UI interactiva
npm run test:e2e:ui

# Ejecutar en modo headed (ver navegador)
npx playwright test --headed

# Ejecutar navegador específico
npx playwright test --project=chromium
```

### Ajustar Selectores E2E

Los tests E2E pueden requerir ajustes según tu UI actual. Edita:

```typescript
// tests/e2e/create-pedido.spec.ts

// Cambiar selectores genéricos por selectores específicos de tu app
await page.click('text=Nuevo Pedido'); // Ajustar según tu botón real
await page.fill('input[name="numero"]', 'TEST-001'); // Verificar nombre del input
```

---

## 🔍 Verificar Permisos y RLS

### ⚠️ IMPORTANTE: SERVICE_ROLE_KEY

**NUNCA** exponer `SUPABASE_SERVICE_ROLE_KEY` al frontend:

```typescript
// ❌ MAL - En el frontend
const supabase = createClient(url, SERVICE_ROLE_KEY); // PELIGRO!

// ✅ BIEN - Solo en el backend
// /supabase/functions/server/index.tsx
const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // Solo en servidor
);
```

### Verificar Variables en Frontend

El frontend solo debe usar:
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_FN_SECRET` (opcional)

---

## 📚 Documentación Disponible

### Guías Principales

1. **[README.md](./README.md)** - Documentación principal del proyecto
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura completa del sistema
3. **[REFACTOR_GUIDE.md](./REFACTOR_GUIDE.md)** - Guía de refactorización
4. **[MIGRATION_EXAMPLE.md](./MIGRATION_EXAMPLE.md)** - Ejemplos prácticos
5. **[CHANGELOG.md](./CHANGELOG.md)** - Historial de cambios v2.0.0

### Configuración

- **[.env.example](./.env.example)** - Variables de entorno documentadas
- **[EMAIL_SETUP.md](./EMAIL_SETUP.md)** - Configuración de email
- **[WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)** - Configuración de WhatsApp

---

## 🚀 Comandos Útiles Post-Merge

### Desarrollo

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run preview          # Preview del build
```

### Testing

```bash
npm test                 # Tests unitarios en modo watch
npm run test:coverage    # Tests con coverage
npm run test:e2e         # Tests E2E
npm run test:all         # Todos los tests
```

### Calidad

```bash
npm run type-check       # Verificar TypeScript
npm run lint             # ESLint
```

### Despliegue

```bash
# Desplegar Edge Functions
supabase functions deploy make-server-25b11ac0

# Ver logs
supabase functions logs make-server-25b11ac0
```

---

## ✅ Checklist Final Pre-Merge

### Antes de Hacer Merge

- [ ] Secret configurado en Supabase Functions
- [ ] Tests ejecutados exitosamente: `npm run test:all`
- [ ] TypeScript sin errores: `npm run type-check`
- [ ] Build exitoso: `npm run build`
- [ ] Documentación leída y comprendida
- [ ] `.env.example` revisado y variables configuradas
- [ ] Middleware probado en desarrollo local

### Después del Merge

- [ ] Desplegar Edge Functions actualizadas
- [ ] Verificar logs del servidor (sin errores 401)
- [ ] Probar creación/actualización/eliminación en producción
- [ ] Monitorear errores durante 24h
- [ ] Migrar 1-2 componentes al cliente API
- [ ] Añadir tests para funcionalidad crítica

---

## 🆘 Troubleshooting

### Error: "No autorizado. Header x-fn-secret inválido"

**Causa**: El secret no está configurado o no coincide.

**Solución**:
1. Verificar que `SUPABASE_FN_SECRET` está en Supabase Functions
2. Verificar que el frontend está enviando el header correcto
3. Reiniciar las Edge Functions

### Error: "Cannot find module './middleware.ts'"

**Causa**: El archivo middleware no está desplegado.

**Solución**:
```bash
# Desplegar todas las functions
supabase functions deploy make-server-25b11ac0
```

### Tests E2E fallan con "element not found"

**Causa**: Selectores no coinciden con la UI actual.

**Solución**:
1. Ejecutar con UI: `npm run test:e2e:ui`
2. Inspeccionar elementos en el navegador
3. Actualizar selectores en `tests/e2e/*.spec.ts`

### Coverage bajo (<50%)

**Solución**:
1. Añadir tests para helpers críticos
2. Priorizar lógica de negocio
3. No es necesario 100% coverage inicialmente

---

## 🎯 Próximos Pasos Recomendados

### Corto Plazo (1-2 semanas)

1. Configurar secret en producción
2. Ejecutar suite de tests completa
3. Migrar 2-3 componentes al cliente API
4. Monitorear logs y errores

### Medio Plazo (1-2 meses)

5. Migrar todos los componentes principales
6. Alcanzar 70%+ coverage en helpers
7. Implementar React Query/SWR
8. CI/CD con tests automáticos

### Largo Plazo (3-6 meses)

9. Autenticación de usuarios con roles
10. Notificaciones en tiempo real
11. PWA con offline support
12. Analytics avanzado

---

## 📞 Soporte

Si encuentras problemas durante la migración:

1. **Revisa documentación**: [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Consulta ejemplos**: [MIGRATION_EXAMPLE.md](./MIGRATION_EXAMPLE.md)
3. **Verifica logs**: Supabase Dashboard → Functions → Logs
4. **Debugging**: Usar `console.log` generosamente

---

## 🎉 ¡Felicidades!

Has completado la refactorización v2.0.0 del Sistema de Gestión de Camareros.

Esta actualización proporciona:
- ✅ Seguridad robusta con middleware
- ✅ Types TypeScript completos
- ✅ Cliente API centralizado
- ✅ Tests unitarios y E2E
- ✅ Documentación completa
- ✅ Base sólida para escalar

**¡Buena suerte con el merge y el desarrollo futuro!** 🚀

---

**Versión**: 2.0.0  
**Fecha**: Enero 19, 2026  
**Estado**: ✅ Listo para Merge
