# 🎯 Paso 1: Prueba del Panel de Pruebas

## ⚡ Inicio Rápido (2 minutos)

### 1. Iniciar la Aplicación

```bash
npm run dev
```

Deberías ver algo como:
```
  VITE v5.0.8  ready in 300 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 2. Abrir en el Navegador

Abre: **http://localhost:3000**

### 3. Buscar el Panel de Pruebas

En la barra de navegación superior, verás estas pestañas:

```
Dashboard | Pedidos | Camareros | Coordinadores | Informes | 
Envío Mensaje | Envío Parte | Configuración WhatsApp | [Panel de Pruebas] 🧪
```

**Haz clic en "Panel de Pruebas"** (última pestaña con icono de probeta 🧪)

---

## 🎨 Lo Que Verás

### Interfaz del Panel de Pruebas

```
┌─────────────────────────────────────────────────────────┐
│  🧪 Panel de Testing                                     │
│  Herramientas de prueba para validar la configuración   │
│                                                          │
│  [Ejecutar Todas las Pruebas]  [Limpiar Resultados]    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  WhatsApp  │  Email  │  Resultados              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  [Pestaña WhatsApp Activa]                              │
│                                                          │
│  ┌─ Pruebas de WhatsApp ──────────────────────────┐    │
│  │                                                  │    │
│  │  [Verificar Configuración]                      │    │
│  │  ✅ Configurado correctamente / ⚠️ No configurado    │
│  │                                                  │    │
│  │  [Test: Validación de Phone Number ID]         │    │
│  │  [Test: Formato de Números]                     │    │
│  │                                                  │    │
│  │  Número de Prueba:                              │    │
│  │  [+15558327331            ] [📋 Copiar]        │    │
│  │                                                  │    │
│  │  Mensaje de Prueba:                             │    │
│  │  [🧪 MENSAJE DE PRUEBA                        ] │    │
│  │  [Este es un mensaje de prueba...             ] │    │
│  │  [                                             ] │    │
│  │                                                  │    │
│  │  [Enviar Mensaje de Prueba]                     │    │
│  │                                                  │    │
│  │  ℹ️ Importante: El número debe estar registrado │    │
│  │     como "número de prueba" en WhatsApp API     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─ Información de Configuración ─────────────────┐    │
│  │  WhatsApp                  Email                │    │
│  │  Número: +15558327331     pruebas@sistema.com  │    │
│  │  Limpio: 15558327331      Proveedores: Resend  │    │
│  │  Phone ID: 106540...                            │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Pruebas Que Puedes Ejecutar

### Prueba 1: Ejecutar Todas las Pruebas (10 segundos)

1. **Haz clic en "Ejecutar Todas las Pruebas"** (botón principal)
2. Verás un spinner girando mientras se ejecutan
3. Los resultados aparecerán en tiempo real

**Resultado esperado:**
```
✅ Test Suite - Iniciando batería de pruebas...
✅ Validación Phone ID - Phone Number ID válido: Válido
✅ Validación Phone ID - Número de teléfono con +: Inválido
✅ Formato de Número - Número español 9 dígitos: 34628904614
✅ Formato de Número - Número de prueba: 15558327331
✅ WhatsApp Config - Configurado correctamente desde [fuente]
```

### Prueba 2: Verificar Configuración de WhatsApp (1 segundo)

1. **Haz clic en "Verificar Configuración"**
2. Espera 1 segundo

**Si está configurado:**
```
✅ Configurado desde: configuración guardada (KV store)
```

**Si NO está configurado:**
```
⚠️ WhatsApp no configurado. Se usará WhatsApp Web como alternativa.
```

### Prueba 3: Test de Validación de Phone Number ID (2 segundos)

1. **Haz clic en "Test: Validación de Phone Number ID"**
2. Se ejecutarán 4 casos de prueba automáticamente

**Resultado esperado:**
```
✅ Validación Phone ID - Phone Number ID válido: Válido
✅ Validación Phone ID - Número de teléfono con +: Inválido
✅ Validación Phone ID - Número con espacios: Inválido
✅ Validación Phone ID - Número muy corto: Inválido
```

### Prueba 4: Test de Formato de Números (2 segundos)

1. **Haz clic en "Test: Formato de Números"**
2. Se ejecutarán 4 casos de prueba

**Resultado esperado:**
```
✅ Formato de Número - Número español 9 dígitos: 34628904614
✅ Formato de Número - Número español con +34: 34628904614
✅ Formato de Número - Número USA con formato: 15558327331
✅ Formato de Número - Número de prueba: 15558327331
```

### Prueba 5: Enviar Mensaje de Prueba (3-5 segundos)

⚠️ **IMPORTANTE:** Requiere WhatsApp Business API configurado

1. **Verifica que el número es:** +15558327331
2. **Modifica el mensaje si quieres** (opcional)
3. **Haz clic en "Enviar Mensaje de Prueba"**
4. Espera la respuesta

**Si está configurado y funciona:**
```
✅ Envío WhatsApp - Mensaje enviado exitosamente a +15558327331
```

**Si NO está configurado:**
```
❌ Envío WhatsApp - WhatsApp API no configurada. Por favor, 
   ve a la pestaña "Configuración WhatsApp"...
```

**Si el Phone Number ID es inválido:**
```
❌ Envío WhatsApp - PHONE NUMBER ID INCORRECTO
   Has configurado: "+34628904614"
   
   IMPORTANTE: El "Phone Number ID" NO es un número de teléfono.
   [Instrucciones detalladas...]
```

---

## 📊 Pestaña de Resultados

1. **Haz clic en la pestaña "Resultados"**
2. Verás un historial de las últimas 10 pruebas ejecutadas

**Cada resultado muestra:**
- 🏷️ **Badge** con el tipo de prueba
- ⏰ **Timestamp** (hora de ejecución)
- 📝 **Mensaje** descriptivo
- 🎨 **Color** según el estado:
  - Verde = Éxito ✅
  - Rojo = Error ❌
  - Amarillo = Advertencia ⚠️
- 📂 **Detalles** (click para expandir y ver JSON)

**Ejemplo de resultados:**
```
┌───────────────────────────────────────────────────┐
│ ✅ [WhatsApp Config] 12:34:56                     │
│    Configurado correctamente desde KV store       │
│    📂 Ver detalles ▼                              │
│       {                                           │
│         "configured": true,                       │
│         "source": "KV store"                      │
│       }                                           │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ ✅ [Validación Phone ID] 12:34:58                 │
│    Phone Number ID válido: Válido                 │
│    📂 Ver detalles ▼                              │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ ✅ [Formato de Número] 12:34:59                   │
│    Número español 9 dígitos: 34628904614          │
└───────────────────────────────────────────────────┘
```

---

## 🎯 Checklist de Verificación

Completa estas verificaciones:

### Verificación Visual
- [ ] El Panel de Pruebas aparece en la barra de navegación
- [ ] El icono de probeta 🧪 es visible
- [ ] Al hacer clic, el panel carga sin errores
- [ ] Las tres pestañas son visibles (WhatsApp, Email, Resultados)
- [ ] Los botones son clickeables

### Verificación Funcional
- [ ] "Ejecutar Todas las Pruebas" funciona
- [ ] "Verificar Configuración" responde
- [ ] Tests de validación se ejecutan
- [ ] Los resultados aparecen en tiempo real
- [ ] La pestaña "Resultados" muestra el historial
- [ ] "Limpiar Resultados" funciona

### Verificación de Datos
- [ ] El número +15558327331 está pre-cargado
- [ ] El mensaje de prueba tiene fecha/hora actual
- [ ] La información de configuración es correcta
- [ ] Los detalles expandibles muestran JSON

---

## 🐛 Troubleshooting

### "No puedo ver el Panel de Pruebas"

**Solución:**
1. Asegúrate de que la app está corriendo: `npm run dev`
2. Refresca la página (F5)
3. Revisa la consola del navegador (F12) por errores

### "Los botones no responden"

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que Supabase está configurado correctamente

### "Todos los tests fallan"

**Solución:**
1. Esto es normal si WhatsApp no está configurado
2. Los tests de validación deberían pasar siempre
3. Solo el envío de mensaje real requiere configuración

### "El mensaje dice 'WhatsApp no configurado'"

**Solución:**
1. Esto es normal si no has configurado WhatsApp Business API
2. La aplicación sigue funcionando (usa WhatsApp Web como fallback)
3. Para configurar: sigue `/WHATSAPP_SETUP.md`

---

## ✅ Resultado Esperado

Después de completar el Paso 1, deberías tener:

- ✅ Panel de Pruebas accesible en la UI
- ✅ Interfaz cargando sin errores
- ✅ Tests de validación pasando (al menos 4+)
- ✅ Historial de resultados funcionando
- ✅ Entendimiento de cómo usar el panel

---

## 🎉 ¡Felicitaciones!

Has completado el **Paso 1: Prueba del Panel de Pruebas**.

### Próximos Pasos

**Paso 2:** Lee `QUICK_TEST_GUIDE.md` (1 minuto)

**Paso 3:** Ejecuta la batería completa de tests:
```bash
npm run test:all
```

**Paso 4:** Si quieres WhatsApp real, sigue `WHATSAPP_SETUP.md`

---

## 💡 Tips

- **Usa "Ejecutar Todas las Pruebas"** para una validación rápida completa
- **Revisa la pestaña "Resultados"** para ver el historial detallado
- **Expande los detalles** para debugging si algo falla
- **El botón "Limpiar Resultados"** limpia el historial si se llena

---

**¡Disfruta probando el sistema! 🧪**
