# 🧪 GUÍA DE TEST POST-CORRECCIÓN

**Versión:** 1.0  
**Fecha:** 23 de Febrero de 2026  
**Objetivo:** Verificar que todas las correcciones funcionen correctamente

---

## 📋 TESTS RÁPIDOS (5 minutos)

### 1️⃣ Test de Envío de Servicios

**Ubicación:** Envíos > Envíos Servicios

**Pasos:**
1. Ir a la pestaña "Envíos"
2. Seleccionar sub-pestaña "Envíos Servicios"
3. Seleccionar un evento que tenga camareros asignados
4. Clic en botón "Enviar"
5. Seleccionar tipo de mensaje (Catering/Restauración)
6. Clic en "Enviar Confirmación"

**Resultado esperado:**
- ✅ Mensaje "Mensaje enviado a X camarero(s)"
- ✅ Sin errores 404 en consola
- ✅ Camareros reciben WhatsApp (verificar teléfonos reales)

**Tiempo:** ~2 minutos

---

### 2️⃣ Test de Partes de Servicio

**Ubicación:** Envíos > Partes de Servicios

**Pasos:**
1. Ir a la pestaña "Envíos"
2. Seleccionar sub-pestaña "Partes de Servicios"
3. Clic en "Ver Parte" de cualquier evento
4. Verificar vista previa del parte
5. Clic en "Enviar Parte"

**Resultado esperado:**
- ✅ Mensaje "Parte de servicio enviado correctamente"
- ✅ Sin errores 404 en consola
- ✅ Cliente recibe el parte por WhatsApp/Email

**Tiempo:** ~2 minutos

---

### 3️⃣ Test de Chat Grupal

**Ubicación:** Envíos > Chat Grupal del Evento

**Pasos:**
1. Ir a la pestaña "Envíos"
2. Seleccionar sub-pestaña "Chat Grupal del Evento"
3. Seleccionar un evento
4. Escribir un mensaje de prueba
5. Enviar mensaje
6. Recargar la página
7. Volver al mismo chat

**Resultado esperado:**
- ✅ Mensaje se envía correctamente
- ✅ Mensaje aparece en la conversación
- ✅ **Mensaje persiste después de recargar**
- ✅ Sin errores 404 en consola

**Tiempo:** ~1 minuto

---

## 🔍 TESTS DETALLADOS (15 minutos)

### 🧪 Test A: Envío Grupal con Múltiples Camareros

**Objetivo:** Verificar que los mensajes lleguen a todos los camareros

**Pre-requisitos:**
- Al menos 3 camareros con teléfonos válidos
- 1 evento con los 3 camareros asignados

**Procedimiento:**
1. Crear evento con 3+ camareros asignados
2. Ir a Envíos > Envíos Servicios
3. Enviar mensaje de confirmación
4. Verificar respuesta del servidor

**Validaciones:**
- [ ] Respuesta incluye estadísticas (exitosos/fallidos)
- [ ] Todos los camareros con teléfono válido reciben mensaje
- [ ] Camareros sin teléfono se marcan como fallidos
- [ ] Logs en consola del servidor muestran cada envío

**Criterio de éxito:** Al menos 1 mensaje enviado exitosamente

---

### 🧪 Test B: Parte de Servicio Multi-Canal

**Objetivo:** Verificar envío por WhatsApp y Email simultáneamente

**Pre-requisitos:**
- 1 cliente con teléfono Y email configurados
- WhatsApp configurado
- Email configurado (Resend/SendGrid/Mailgun)

**Procedimiento:**
1. Asegurar que cliente tenga ambos contactos
2. Ir a Envíos > Partes de Servicios
3. Seleccionar evento de ese cliente
4. Enviar parte

**Validaciones:**
- [ ] Respuesta incluye `resultados.whatsapp.enviado: true`
- [ ] Respuesta incluye `resultados.email.enviado: true`
- [ ] Cliente recibe parte por WhatsApp
- [ ] Cliente recibe parte por Email
- [ ] Formato del email es legible (HTML)

**Criterio de éxito:** Parte enviado por al menos 1 canal

---

### 🧪 Test C: Persistencia de Mensajes de Chat

**Objetivo:** Verificar que los mensajes se guardan en el KV store

**Procedimiento:**
1. Abrir Chat Grupal del Evento
2. Seleccionar evento X
3. Enviar mensaje "Test mensaje 1"
4. Enviar mensaje "Test mensaje 2"
5. Cerrar chat
6. Recargar página completa (F5)
7. Volver a abrir chat del evento X

**Validaciones:**
- [ ] Ambos mensajes aparecen
- [ ] Orden correcto (por timestamp)
- [ ] Información completa (sender, content, timestamp)
- [ ] Sin duplicados

**Verificación técnica:**
```javascript
// En consola del navegador después de enviar:
// Debería ver POST a /chat-mensajes con status 200
```

**Criterio de éxito:** Mensajes persisten después de recargar

---

### 🧪 Test D: Formato de Respuestas Estandarizado

**Objetivo:** Verificar consistencia en formato de API

**Procedimiento:**
1. Abrir DevTools (F12) > Network
2. Realizar las siguientes acciones y capturar respuestas:
   - Obtener mensajes de chat: GET `/chat-mensajes/:chatId`
   - Crear mensaje: POST `/chat-mensajes`
   - Obtener chats: GET `/chats/:coordinadorId`

**Validaciones:**
```json
// Todas las respuestas exitosas deben tener:
{
  "success": true,
  "data": [...] // ← SIEMPRE "data", no "mensajes" ni "mensaje"
}
```

**Criterio de éxito:** Todas las respuestas usan propiedad `data`

---

## 🐛 VERIFICACIÓN DE ERRORES CORREGIDOS

### ❌→✅ Error #1: Endpoint faltante

**Test:**
```bash
# En terminal/DevTools Console:
curl -X POST https://[TU-PROJECT-ID].supabase.co/functions/v1/make-server-25b11ac0/enviar-mensaje-grupal \
  -H "Authorization: Bearer [TU-ANON-KEY]" \
  -H "Content-Type: application/json" \
  -d '{"pedidoId": "pedido:123", "mensaje": "Test"}'
```

**Antes:** 404 Not Found  
**Ahora:** 200 OK (o error lógico si no existe pedido)

---

### ❌→✅ Error #2: Chat grupal no guarda

**Test:**
1. Enviar mensaje en chat
2. Verificar en Network que POST a `/chat-mensajes` retorna 200
3. Verificar que GET subsiguiente devuelve el mensaje

**Antes:** 404 en POST a `/chat-evento`  
**Ahora:** 200 OK en POST a `/chat-mensajes`

---

### ❌→✅ Error #3: Parte de servicio no funciona

**Test:**
1. Intentar enviar parte
2. Verificar en Network que POST a `/enviar-parte` retorna 200

**Antes:** 404 Not Found  
**Ahora:** 200 OK con resultados de envío

---

### ❌→✅ Error #4: Endpoints duplicados

**Test:**
```javascript
// En consola del servidor (logs):
// Buscar definiciones de rutas al iniciar
// NO debe haber warnings de "Route already defined"
```

**Antes:** 2 definiciones de `/chat-mensajes/:chatId`  
**Ahora:** 1 sola definición

---

### ❌→✅ Error #5: Formato inconsistente

**Test:** Ver Test D arriba

**Antes:** Algunos endpoints usaban `mensajes`, otros `mensaje`  
**Ahora:** Todos usan `data`

---

## 📊 CHECKLIST DE VALIDACIÓN FINAL

### Funcionalidades Principales
- [ ] ✅ Envío de servicios funciona
- [ ] ✅ Partes de servicio se envían
- [ ] ✅ Chat grupal guarda mensajes
- [ ] ✅ Mensajes persisten al recargar
- [ ] ✅ Sin errores 404 en consola

### Integraciones
- [ ] ✅ WhatsApp envía mensajes
- [ ] ✅ Email envía partes
- [ ] ✅ KV Store guarda datos

### Calidad del Código
- [ ] ✅ Sin endpoints duplicados
- [ ] ✅ Formato de API consistente
- [ ] ✅ Logs detallados en servidor
- [ ] ✅ Manejo de errores correcto

### Experiencia de Usuario
- [ ] ✅ Mensajes de éxito claros
- [ ] ✅ Mensajes de error informativos
- [ ] ✅ UI responde correctamente
- [ ] ✅ Sin retrasos perceptibles

---

## 🚨 PROBLEMAS CONOCIDOS Y SOLUCIONES

### Problema: "WhatsApp no configurado"

**Causa:** Variables de entorno no configuradas  
**Solución:**
```bash
# Verificar en Supabase Dashboard > Settings > Edge Functions
WHATSAPP_API_KEY=tu_api_key
WHATSAPP_PHONE_ID=tu_phone_id
```

### Problema: "Email no se envía"

**Causa:** Proveedor de email no configurado  
**Solución:**
```bash
# Configurar al menos uno:
RESEND_API_KEY=tu_resend_key
# O
SENDGRID_API_KEY=tu_sendgrid_key
# O
MAILGUN_API_KEY=tu_mailgun_key
MAILGUN_DOMAIN=tu_dominio
```

### Problema: "Mensajes no persisten"

**Causa:** Error en POST a `/chat-mensajes`  
**Solución:**
1. Verificar en Network el error exacto
2. Verificar logs del servidor
3. Verificar que el chatId existe

### Problema: "Parte no se visualiza"

**Causa:** Cliente no tiene datos de contacto  
**Solución:** Agregar email o teléfono al cliente

---

## 📈 MÉTRICAS DE ÉXITO

### KPIs de Test
- **Tasa de éxito de envíos:** > 95%
- **Tiempo de respuesta:** < 2 segundos
- **Errores 404:** 0
- **Errores de servidor:** < 1%

### Criterios de Aprobación
Para considerar el test exitoso, deben cumplirse:
- [x] ✅ Los 3 tests rápidos pasan
- [x] ✅ Al menos 3 de los 4 tests detallados pasan
- [x] ✅ Todos los errores verificados están corregidos
- [x] ✅ Checklist de validación > 90% completo

---

## 📞 SOPORTE

Si encuentras algún problema durante el testing:

1. **Revisar logs del servidor:** Supabase Dashboard > Edge Functions > Logs
2. **Revisar consola del navegador:** DevTools > Console
3. **Verificar Network:** DevTools > Network
4. **Consultar documentación:** Leer archivos `/INFORME_ERRORES_EXHAUSTIVO.md` y `/CORRECCIONES_APLICADAS.md`

---

**Happy Testing! 🎉**

Última actualización: 23/02/2026
