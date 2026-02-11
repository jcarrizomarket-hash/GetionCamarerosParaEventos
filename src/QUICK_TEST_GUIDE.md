# ⚡ Guía Rápida de Testing

Guía ultra-rápida para ejecutar pruebas. Para documentación completa, ver [TESTING_SUMMARY.md](TESTING_SUMMARY.md).

---

## 🚀 Inicio Rápido (1 minuto)

```bash
# 1. Inicia la aplicación
npm run dev

# 2. Abre en el navegador: http://localhost:3000
# 3. Click en la pestaña "Panel de Pruebas" 🧪
# 4. Click en "Ejecutar Todas las Pruebas"
# 5. ✅ ¡Listo! Ver resultados en pantalla
```

---

## 🧪 Comandos de Testing

### Tests Rápidos

```bash
# Tests unitarios (30 segundos)
npm run test:unit

# Tests de integración (1 minuto)
npm run test:integration

# Todos los tests (2-3 minutos)
npm run test:all
```

### Tests Interactivos

```bash
# UI visual de Vitest
npm run test:ui

# Tests E2E con interfaz visual
npm run test:e2e:ui

# Tests en modo watch (re-ejecuta al cambiar archivos)
npm run test:watch
```

### Tests Específicos

```bash
# Solo tests de WhatsApp
npx vitest tests/integration/whatsapp.spec.ts

# Solo tests de Email
npx vitest tests/integration/email.spec.ts

# Solo tests E2E de pedidos
npx playwright test tests/e2e/create-pedido.spec.ts
```

---

## 📱 Número de Prueba

**Número configurado:** `+15558327331`

### Usar el Número

1. **Registrar en Meta:**
   - Ve a https://developers.facebook.com/apps
   - Tu app → WhatsApp → Números de prueba
   - Agrega: `+15558327331`

2. **Enviar mensaje de prueba:**
   - Panel de Pruebas → WhatsApp
   - "Enviar Mensaje de Prueba"

---

## ✅ Checklist de 30 Segundos

Antes de hacer commit/deploy:

```bash
# Ejecuta esto y asegúrate de que todo pasa
npm run test:all
```

Si todo pasa → ✅ Listo para commit/deploy  
Si algo falla → ❌ Revisa los logs y corrige

---

## 🔧 Panel de Pruebas (UI)

### Ubicación
**Pestaña "Panel de Pruebas"** 🧪 en la aplicación

### Funciones Principales

| Función | Descripción | Tiempo |
|---------|-------------|--------|
| Verificar Configuración | Chequea WhatsApp API | 1 seg |
| Test: Validación Phone ID | 4 casos de prueba | 2 seg |
| Test: Formato Números | 4 casos de prueba | 2 seg |
| Enviar Mensaje Prueba | Envío real a +15558327331 | 3-5 seg |
| Ejecutar Todas | Batería completa | 10 seg |

---

## 🐛 Solución Rápida de Problemas

### "WhatsApp no configurado"

```bash
# Opción 1: Usar el Panel de Pruebas
1. Ve a "Configuración WhatsApp" en la app
2. Introduce Phone Number ID y Token
3. Guarda

# Opción 2: Continuar sin WhatsApp
- Los tests funcionan sin configuración
- WhatsApp Web se usa como fallback
```

### "Tests fallan"

```bash
# Ver qué está fallando
npm run test:unit -- --reporter=verbose

# Ejecutar solo el test que falla
npx vitest tests/integration/whatsapp.spec.ts -t "nombre del test"
```

### "No puedo ver la UI de tests"

```bash
# Asegúrate de tener las dependencias
npm install

# Inicia la UI de Vitest
npm run test:ui

# Abre en navegador: http://localhost:51204 (o el puerto que indique)
```

---

## 📊 Estados y Resultados

### En el Panel de Pruebas

- ✅ **Verde** = Test pasó
- ❌ **Rojo** = Test falló
- ⚠️ **Amarillo** = Advertencia

### En la Terminal

```bash
✓ tests/integration/whatsapp.spec.ts (25)  # ✅ Todos pasaron
✓ tests/integration/email.spec.ts (15)     # ✅ Todos pasaron
✓ tests/unit/helpers.spec.ts (10)          # ✅ Todos pasaron

Test Files  3 passed (3)
     Tests  50 passed (50)
```

---

## 📝 Datos de Prueba Rápidos

### Copy-Paste Ready

```javascript
// Número de prueba WhatsApp
+15558327331

// Email de prueba
pruebas@sistema-camareros.com

// Phone Number ID de ejemplo (NO es real, usar el tuyo)
106540852500791

// Camarero de prueba
{
  nombre: 'Juan',
  apellido: 'Pérez Test',
  telefono: '+15558327331',
  email: 'juan.test@ejemplo.com'
}

// Pedido de prueba
{
  numero: 'TEST-001',
  cliente: 'Empresa Test S.L.',
  lugar: 'Salón Test',
  diaEvento: '2026-02-20',
  cantidadCamareros: 5,
  horaEntrada: '14:00',
  horaSalida: '22:00'
}
```

---

## 🎯 Casos de Prueba Críticos

### 1. Validar Phone Number ID

```bash
# Panel de Pruebas → WhatsApp → "Test: Validación Phone ID"
```

**Resultado esperado:**
- ✅ `106540852500791` → válido
- ❌ `+34628904614` → inválido (es un número de teléfono)

### 2. Formatear Número

```bash
# Panel de Pruebas → WhatsApp → "Test: Formato Números"
```

**Resultado esperado:**
- ✅ `628904614` → `34628904614`
- ✅ `+15558327331` → `15558327331`

### 3. Enviar WhatsApp

```bash
# Panel de Pruebas → WhatsApp → "Enviar Mensaje de Prueba"
```

**Resultado esperado:**
- ✅ Mensaje enviado a +15558327331
- ✅ Respuesta de la API exitosa

---

## 📚 Documentación Completa

Para guías detalladas, ver:

- **[TESTING_SUMMARY.md](TESTING_SUMMARY.md)** - Resumen ejecutivo completo
- **[TESTING_SETUP.md](TESTING_SETUP.md)** - Setup detallado
- **[tests/README.md](tests/README.md)** - Sistema de testing
- **[tests/manual/testing-guide.md](tests/manual/testing-guide.md)** - Guía paso a paso

---

## ⚡ Comandos Ultra-Rápidos

```bash
# Test todo (3 min)
npm run test:all

# Solo unit (30 seg)
npm run test:unit

# Solo integration (1 min)
npm run test:integration

# Ver en UI
npm run test:ui

# Ver cobertura
npm run test:coverage

# E2E con navegador visible
npm run test:e2e:headed
```

---

## 🎉 ¡Listo!

Ya estás preparado para ejecutar tests. Para más detalles, revisa la documentación completa.

**Recuerda:**
- 🧪 Panel de Pruebas = Testing visual e interactivo
- 📝 Tests automatizados = CI/CD y validación continua
- 📚 Guías manuales = Procedimientos detallados

**¡Happy Testing! ⚡**
