# 🧪 Configuración y Pruebas del Sistema

Este documento proporciona información detallada sobre cómo configurar y probar el sistema de gestión de camareros.

---

## 📱 Configuración de Número de Prueba WhatsApp

### Número de Prueba Configurado

**Número:** `+15558327331`

Este es un número de prueba sandbox proporcionado por Meta/WhatsApp Business API.

### ¿Por qué este número?

- **555 es un prefijo estándar de números de prueba** en Estados Unidos
- Es un número reconocido para desarrollo y testing
- No interfiere con números reales
- Ideal para pruebas de integración

### Cómo usar el número de prueba

#### 1. Registrar el número en WhatsApp Business API

Si estás usando el número sandbox de WhatsApp Business API:

1. Ve a [Meta for Developers](https://developers.facebook.com/apps)
2. Selecciona tu aplicación
3. Ve a WhatsApp → Configuración
4. En "Números de prueba" o "Test Numbers", haz clic en "Add number"
5. Introduce: `+15558327331`
6. Guarda

Ahora este número podrá recibir mensajes de tu número sandbox.

#### 2. Usar en la aplicación

El número ya está configurado en:
- Panel de Testing (`/components/test-panel.tsx`)
- Tests de integración (`/tests/integration/whatsapp.spec.ts`)
- Configuración de tests (`/tests/test-config.ts`)

---

## 🔧 Panel de Testing Integrado

### Acceso

1. Inicia la aplicación
2. Haz clic en la pestaña **"Panel de Pruebas"** (icono de probeta 🧪)

### Funcionalidades

#### ✅ Verificación de Configuración WhatsApp
- Detecta si WhatsApp Business API está configurado
- Muestra la fuente de configuración (KV store o variables de entorno)
- Valida que el token sea válido

#### 🧪 Tests de Validación
- **Validación de Phone Number ID**: Verifica que distingues correctamente entre Phone Number ID y número de teléfono
- **Formato de Números**: Prueba el formateo correcto de números internacionales

#### 📤 Envío de Mensaje de Prueba
- Envía un mensaje real al número de prueba configurado
- Verifica que la integración funciona end-to-end
- Muestra errores detallados si algo falla

#### 📊 Resultados
- Historial de las últimas 10 pruebas ejecutadas
- Estados visuales (✅ éxito, ❌ error, ⚠️ advertencia)
- Detalles expandibles para debugging

---

## 🧩 Tests Automatizados

### Tests Unitarios

```bash
npm run test
```

Ejecuta tests unitarios con Vitest:
- Validación de Phone Number ID
- Formateo de números de teléfono
- Generación de mensajes
- Helpers y utilidades

### Tests de Integración

```bash
npm run test:integration
```

Ejecuta tests de integración:
- Verificación de configuración de WhatsApp
- Verificación de configuración de Email
- Validación de estructura de mensajes
- Tests de API

### Tests E2E

```bash
npm run test:e2e
```

Ejecuta tests end-to-end con Playwright:
- Creación de pedidos
- Asignación de camareros
- Envío de notificaciones
- Navegación completa

---

## 📝 Guía de Pruebas Manuales

Ver [`/tests/manual/testing-guide.md`](/tests/manual/testing-guide.md) para una guía detallada paso a paso.

### Pruebas Rápidas

#### 1. Verificar Configuración WhatsApp

```bash
# Desde el Panel de Pruebas en la UI
1. Click en "Panel de Pruebas"
2. Pestaña "WhatsApp"
3. Click en "Verificar Configuración"
```

**Resultado esperado:**
- ✅ "Configurado desde [fuente]" si está configurado
- ⚠️ "WhatsApp no configurado" si no lo está

#### 2. Enviar Mensaje de Prueba

```bash
# Desde el Panel de Pruebas
1. Pestaña "WhatsApp"
2. Verificar que el número es +15558327331
3. Modificar mensaje si deseas
4. Click en "Enviar Mensaje de Prueba"
```

**Resultado esperado:**
- ✅ Mensaje enviado exitosamente
- El mensaje aparece en WhatsApp del número de prueba

#### 3. Ejecutar Batería Completa

```bash
# Desde el Panel de Pruebas
1. Click en "Ejecutar Todas las Pruebas"
2. Esperar resultados
3. Revisar en pestaña "Resultados"
```

---

## 🎯 Casos de Prueba Principales

### Caso 1: Validación de Phone Number ID Inválido

**Input:** `+34628904614` (número de teléfono, NO Phone Number ID)

**Resultado esperado:**
```
❌ PHONE NUMBER ID INCORRECTO

Has configurado: "+34628904614"

❗ IMPORTANTE: El "Phone Number ID" NO es un número de teléfono.

🔧 CÓMO OBTENER EL PHONE NUMBER ID CORRECTO:
[instrucciones detalladas]
```

### Caso 2: Validación de Phone Number ID Válido

**Input:** `106540852500791`

**Resultado esperado:**
```
✅ Phone Number ID válido
```

### Caso 3: Formateo de Número Español

**Input:** `628904614`

**Resultado esperado:** `34628904614`

### Caso 4: Formateo de Número de Prueba

**Input:** `+15558327331` o `+1 555 832 7331`

**Resultado esperado:** `15558327331`

---

## 🔍 Debugging

### Verificar Logs del Servidor

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Edge Functions** → **Logs**
4. Busca logs con:
   - `📱 Intentando enviar WhatsApp`
   - `✅ WhatsApp enviado exitosamente`
   - `❌ Error al enviar WhatsApp`

### Verificar Configuración en KV Store

```typescript
// Desde el servidor o con una llamada API
const apiKey = await kv.get('config:whatsapp_api_key');
const phoneId = await kv.get('config:whatsapp_phone_id');

console.log('API Key length:', apiKey?.length);
console.log('Phone ID:', phoneId);
```

### Errores Comunes

#### "WhatsApp API no configurada"

**Causa:** No hay credenciales válidas

**Solución:**
1. Ve a "Configuración WhatsApp"
2. Introduce Phone Number ID y Token
3. Guarda

#### "Phone Number ID incorrecto"

**Causa:** Estás usando un número de teléfono en lugar del Phone Number ID

**Solución:**
1. Ve a Meta Business Suite
2. Busca "Phone Number ID" (número largo como `106540852500791`)
3. Cópialo y pégalo en la configuración

#### "Invalid access token"

**Causa:** Token expirado o inválido

**Solución:**
1. Genera un Token de Acceso PERMANENTE desde Meta
2. Debe tener 200+ caracteres
3. Actualízalo en la configuración

---

## 📊 Métricas de Testing

### Cobertura de Pruebas

- ✅ Validación de entrada de datos
- ✅ Formateo de números
- ✅ Validación de Phone Number ID
- ✅ Integración con WhatsApp API
- ✅ Manejo de errores
- ✅ UI/UX del panel de testing
- ⏳ Integración con Email (próximamente)
- ⏳ Tests de carga (próximamente)

### Tests Implementados

```
tests/
├── e2e/
│   └── create-pedido.spec.ts (35 tests)
├── integration/
│   ├── whatsapp.spec.ts (25+ tests)
│   └── email.spec.ts (15+ tests)
├── unit/
│   └── helpers.spec.ts (10+ tests)
├── manual/
│   └── testing-guide.md (27 procedimientos)
└── test-config.ts
```

**Total: 85+ tests automatizados + 27 procedimientos manuales**

---

## 🚀 Mejores Prácticas

### 1. Antes de Desplegar a Producción

- [ ] Ejecutar `npm run test` (todos los tests pasan)
- [ ] Ejecutar `npm run test:integration`
- [ ] Ejecutar `npm run test:e2e`
- [ ] Pruebas manuales de funcionalidades críticas
- [ ] Verificar que WhatsApp está configurado con token permanente
- [ ] Ocultar/proteger Panel de Pruebas

### 2. Durante el Desarrollo

- ✅ Usar Panel de Pruebas para validación rápida
- ✅ Ejecutar tests relevantes antes de cada commit
- ✅ Agregar tests para cada nueva funcionalidad
- ✅ Documentar casos de prueba específicos

### 3. Seguridad

- ⚠️ El Panel de Pruebas NO debe estar accesible en producción sin autenticación
- ⚠️ No compartir tokens de acceso en código
- ⚠️ Rotar tokens periódicamente
- ⚠️ Usar variables de entorno para datos sensibles

---

## 📞 Números de Contacto para Testing

### WhatsApp

**Número de Prueba:** `+15558327331`
- Usar para todas las pruebas de envío
- Debe estar registrado en Meta como "número de prueba"
- Perfecto para desarrollo y staging

### Email

**Email de Prueba:** `pruebas@sistema-camareros.com`
- Usar para pruebas de email
- Configurar para recibir notificaciones de prueba

---

## 🎓 Recursos Adicionales

- [Guía de Testing Manual](/tests/manual/testing-guide.md)
- [Documentación de WhatsApp](/WHATSAPP_SETUP.md)
- [Documentación de Email](/EMAIL_SETUP.md)
- [Arquitectura del Sistema](/ARCHITECTURE.md)

---

## ✅ Checklist de Configuración de Testing

- [ ] Número de prueba `+15558327331` registrado en WhatsApp Business API
- [ ] Panel de Pruebas accesible desde la UI
- [ ] Tests automatizados ejecutándose correctamente
- [ ] Documentación de pruebas leída y comprendida
- [ ] Credenciales de WhatsApp configuradas (opcional para testing)
- [ ] Al menos un proveedor de email configurado (opcional)

---

## 📝 Notas Finales

- El número `+15558327331` es **solo para desarrollo y testing**
- En producción, usa números reales de tus camareros
- El Panel de Pruebas está diseñado para facilitar el desarrollo
- Ejecuta las pruebas regularmente para detectar regresiones temprano

**¡Happy Testing! 🧪**
