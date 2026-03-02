# 🚀 INICIO RÁPIDO - Panel de Pruebas

## ⚡ Opción 1: Inicio Automático (Recomendado)

### Linux/Mac:
```bash
chmod +x start-test-panel.sh
./start-test-panel.sh
```

### Windows (PowerShell):
```powershell
npm run dev
```

Luego abre: **http://localhost:5173** y busca la pestaña **"Panel de Pruebas" 🧪**

---

## 📋 Opción 2: Inicio Manual (Paso a Paso)

### 1. Verifica que todo esté instalado
```bash
node -v    # Debe mostrar v18.0.0 o superior
npm -v     # Debe mostrar 8.0.0 o superior
```

### 2. Instala dependencias (si no lo has hecho)
```bash
npm install
```

### 3. Inicia el servidor
```bash
npm run dev
```

Deberías ver:
```
  VITE v5.0.8  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4. Abre en el navegador
```
http://localhost:5173
```

### 5. Navega al Panel de Pruebas
- Busca las pestañas en la parte superior
- Click en **"Panel de Pruebas"** (última pestaña con icono 🧪)

### 6. Ejecuta las pruebas
- Click en **"Ejecutar Todas las Pruebas"**
- Espera 10 segundos
- Revisa los resultados en la pestaña **"Resultados"**

---

## 🎯 ¿Qué verás?

### Panel de Pruebas
El panel tiene 3 pestañas:

#### 📱 Pestaña WhatsApp
- **Verificar Configuración**: Verifica si WhatsApp está configurado
- **Test de Validación**: Prueba el sistema de validación de Phone Number ID
- **Test de Formato**: Prueba el formateo de números telefónicos
- **Enviar Mensaje de Prueba**: Envía un mensaje real a +15558327331

#### 📧 Pestaña Email
- **Verificar Configuración**: Verifica qué proveedor de email está activo
- **Test de Formato**: Prueba validación de emails
- **Enviar Email de Prueba**: Envía un email de prueba

#### 📊 Pestaña Resultados
- Historial de las últimas 10 pruebas
- Estados visuales: ✅ Éxito | ❌ Error | ⚠️ Advertencia
- Detalles expandibles con JSON completo

---

## ✅ Resultados Esperados

### Si WhatsApp está configurado:
```
✅ Test Suite - Iniciando batería de pruebas...
✅ Validación Phone ID - Phone Number ID válido: Válido
✅ Formato de Número - Número español: 34628904614
✅ WhatsApp Config - Configurado correctamente desde KV store
✅ Envío WhatsApp - Mensaje enviado a +15558327331
```

### Si WhatsApp NO está configurado (normal):
```
✅ Test Suite - Iniciando batería de pruebas...
✅ Validación Phone ID - Phone Number ID válido: Válido
✅ Formato de Número - Número español: 34628904614
⚠️ WhatsApp Config - No configurado (usa WhatsApp Web)
```

---

## 🎮 Controles del Panel

| Botón | Acción | Tiempo |
|-------|--------|--------|
| **Ejecutar Todas las Pruebas** | Ejecuta toda la batería de tests | ~10s |
| **Limpiar Resultados** | Limpia el historial de resultados | Inmediato |
| **Verificar Configuración** | Verifica estado de WhatsApp/Email | ~1s |
| **Test: Validación Phone ID** | 4 casos de prueba de validación | ~2s |
| **Test: Formato de Números** | 4 casos de prueba de formato | ~2s |
| **Enviar Mensaje de Prueba** | Envía mensaje real (requiere config) | ~3-5s |

---

## 🔧 Troubleshooting

### ❌ Error: "Cannot GET /"
**Solución:** El servidor no está corriendo. Ejecuta `npm run dev`

### ❌ Error: "Module not found"
**Solución:** Instala dependencias con `npm install`

### ❌ "Panel de Pruebas" no aparece
**Solución:** 
1. Refresca la página (F5)
2. Abre la consola del navegador (F12) y busca errores
3. Verifica que `components/test-panel.tsx` existe

### ⚠️ "WhatsApp no configurado"
**Esto es NORMAL** si no has configurado WhatsApp Business API.
- La aplicación sigue funcionando (usa WhatsApp Web como fallback)
- Para configurar: Lee `WHATSAPP_SETUP.md`

### ❌ "PHONE NUMBER ID INCORRECTO"
Significa que configuraste un número de teléfono en vez del Phone Number ID.

**Solución:** Sigue las instrucciones en la pantalla o lee `WHATSAPP_SETUP.md`

---

## 📚 Documentación Adicional

| Archivo | Descripción | Tiempo |
|---------|-------------|--------|
| `QUICK_TEST_GUIDE.md` | Guía rápida de testing | 2 min |
| `TESTING_SUMMARY.md` | Resumen completo del sistema de tests | 10 min |
| `TESTING_SETUP.md` | Configuración del entorno de testing | 10 min |
| `WHATSAPP_SETUP.md` | Configuración de WhatsApp Business API | 15 min |
| `EMAIL_SETUP.md` | Configuración de Email | 10 min |
| `ARCHITECTURE.md` | Arquitectura del sistema | 15 min |
| `tests/manual/testing-guide.md` | Procedimientos de prueba manual | 30 min |

---

## 🧪 Ejecución de Tests desde Línea de Comandos

Si prefieres ejecutar tests desde la terminal:

### Tests unitarios (rápido - 2s)
```bash
npm run test:unit
```

### Tests de integración (medio - 10s)
```bash
npm run test:integration
```

### Tests E2E con Playwright (lento - 30s)
```bash
npm run test:e2e
```

### Todos los tests
```bash
npm run test:all
```

### Con interfaz visual
```bash
npm run test:ui       # Vitest UI
npm run test:e2e:ui   # Playwright UI
```

---

## ✨ Próximos Pasos

Una vez que hayas probado el Panel de Pruebas:

1. ✅ **Ejecuta** `npm run test:all` para la batería completa
2. ✅ **Explora** la pestaña "Resultados" del panel
3. ✅ **Configura** WhatsApp Business API (opcional) con `WHATSAPP_SETUP.md`
4. ✅ **Configura** Email (opcional) con `EMAIL_SETUP.md`
5. ✅ **Revisa** los logs en la consola del navegador (F12)

### Para Desarrolladores

- Lee `ARCHITECTURE.md` para entender la estructura del sistema
- Consulta `REFACTOR_GUIDE.md` para mejores prácticas
- Revisa `TESTING_SETUP.md` para configurar el entorno de testing

### Para Administradores

- Configura WhatsApp Business API con `WHATSAPP_SETUP.md`
- Configura el servicio de email con `EMAIL_SETUP.md`
- Revisa `EMAIL_SYSTEM_OVERVIEW.md` para el overview del sistema de email

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa la sección **Troubleshooting** arriba
2. Abre la consola del navegador (F12) y busca errores
3. Verifica los logs del servidor en la terminal
4. Consulta `TESTING_SUMMARY.md` para más información

---

**¡Disfruta probando el sistema! 🧪**
