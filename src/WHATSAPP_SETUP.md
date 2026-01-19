# 📱 Configuración de WhatsApp Business API

Esta guía te ayudará a configurar la integración de WhatsApp Business API con tu aplicación de gestión de camareros.

## 🎯 ¿Por qué configurar WhatsApp Business API?

Con la API configurada, podrás:
- ✅ **Enviar mensajes automáticamente** sin abrir WhatsApp Web
- ✅ **Notificaciones automáticas** al coordinador cuando un camarero confirma/rechaza
- ✅ **Mayor velocidad** en el envío masivo de mensajes
- ✅ **Registro completo** de todos los mensajes enviados

Si **NO** configuras la API, la aplicación seguirá funcionando con **WhatsApp Web** como alternativa (se abrirá el navegador para enviar cada mensaje).

---

## 📋 Pasos para Configurar WhatsApp Business API

### **Paso 1: Crear una cuenta de Meta for Developers**

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Inicia sesión con tu cuenta de Facebook/Meta
3. Si no tienes cuenta, créala siguiendo las instrucciones

### **Paso 2: Crear una aplicación en Meta**

1. En el panel de Meta for Developers, haz clic en **"Mis Apps"** → **"Crear App"**
2. Selecciona el tipo **"Business"**
3. Completa los datos:
   - **Nombre de la app**: "Gestión Camareros" (o el nombre que prefieras)
   - **Email de contacto**: Tu email
   - **Cuenta de negocio**: Crea una o selecciona una existente
4. Haz clic en **"Crear App"**

### **Paso 3: Agregar WhatsApp al proyecto**

1. En el panel de tu aplicación, busca **"WhatsApp"** en los productos disponibles
2. Haz clic en **"Configurar"**
3. Selecciona o crea una **Cuenta de WhatsApp Business**

### **Paso 4: Configurar el número de teléfono**

1. En la sección de WhatsApp, ve a **"Configuración" → "Números de teléfono"**
2. Meta te proporciona un **número de prueba temporal** para hacer tests
3. Para producción, necesitarás **verificar tu propio número**:
   - Haz clic en **"Agregar número de teléfono"**
   - Sigue el proceso de verificación (recibirás un SMS/llamada)
   - **IMPORTANTE**: Este número será el que envíe los mensajes

### **Paso 5: Obtener las credenciales**

#### 🔑 **WHATSAPP_PHONE_ID**

1. En la sección de WhatsApp → **"Números de teléfono"**
2. Haz clic en tu número verificado
3. Copia el **"Phone number ID"** (ejemplo: `123456789012345`)

#### 🔐 **WHATSAPP_API_KEY** (Access Token)

Hay dos tipos de tokens:

**A) Token Temporal (para pruebas - válido 24 horas):**
1. En WhatsApp → **"Configuración"** → **"API Setup"**
2. Copia el **"Temporary access token"**

**B) Token Permanente (para producción - RECOMENDADO):**
1. Ve a **"Configuración" → "Básica"** de tu app
2. Copia el **"App ID"** y el **"App Secret"**
3. Genera un token de sistema siguiendo estos pasos:
   - Ve a **"Configuración del negocio"** → **"Tokens de acceso del sistema"**
   - Crea un nuevo token con permisos de **WhatsApp Business Management**
   - **GUARDA ESTE TOKEN** - Solo se muestra una vez

### **Paso 6: Configurar en Supabase**

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. En el panel lateral, ve a **"Project Settings" → "Edge Functions" → "Secrets"**
3. Agrega las siguientes variables:

```
WHATSAPP_API_KEY = tu_token_de_acceso_permanente
WHATSAPP_PHONE_ID = tu_phone_id_del_paso_5
```

4. Haz clic en **"Save"** para guardar

### **Paso 7: Verificar la configuración**

1. Vuelve a tu aplicación
2. Ve a **"Pedidos" → "Entrada de Pedidos" → "Envío de Mensaje"**
3. La aplicación verificará automáticamente si la API está configurada
4. Verás un mensaje indicando el estado de la configuración

---

## 🧪 Prueba de la integración

### **Con número de prueba de Meta (gratis):**

1. Meta te da **5 números de prueba** para recibir mensajes
2. Agrega tu número personal como número de prueba:
   - En WhatsApp → **"Configuración"** → **"Números de prueba"**
   - Haz clic en **"Agregar número de prueba"**
   - Introduce tu número personal (con código de país: +34...)
3. Envía un mensaje de prueba desde la aplicación
4. Deberías recibir el mensaje en tu WhatsApp personal

### **Limitaciones del número de prueba:**
- Solo puede enviar mensajes a **máximo 5 números de prueba registrados**
- No se pueden enviar mensajes a números no registrados
- Es ideal para desarrollo y pruebas

### **Para producción (envío ilimitado):**
- Necesitas **verificar tu número de negocio**
- Completar el proceso de **Business Verification** de Meta
- Una vez aprobado, podrás enviar mensajes a cualquier número

---

## 🔍 Verificación de estado

En la aplicación verás uno de estos mensajes:

### ✅ **Configuración Correcta:**
```
WhatsApp Business API configurada correctamente
```
→ Puedes usar el botón **"Enviar Automáticamente"**

### ⚠️ **No configurada:**
```
WhatsApp API no configurada. Se usará WhatsApp Web como alternativa.
```
→ El botón **"Enviar por WhatsApp"** abrirá WhatsApp Web

---

## 📞 Funcionalidades con la API configurada

### **1. Envío automático a camareros**
- Mensajes con información del evento
- Enlaces de confirmación/rechazo incluidos
- Estado actualizado a "enviado" automáticamente

### **2. Confirmación automática**
- Camarero hace clic en **"✅ CONFIRMO"**
- Estado cambia a **"confirmado"** (verde)
- Coordinador recibe notificación automática

### **3. Rechazo automático**
- Camarero hace clic en **"❌ NO CONFIRMO"**
- Es eliminado automáticamente de la lista
- Coordinador recibe alerta de acción requerida

---

## 🛟 Solución de problemas

### **Error: "WhatsApp API no configurada"**
- Verifica que hayas agregado las variables en Supabase
- Asegúrate de que los nombres sean exactamente: `WHATSAPP_API_KEY` y `WHATSAPP_PHONE_ID`

### **Error: "Invalid access token"**
- El token temporal (24h) puede haber expirado
- Genera un token permanente siguiendo el Paso 5B

### **Error: "Message not sent"**
- Verifica que el número de destino esté en formato correcto (sin espacios ni guiones)
- Si usas número de prueba, verifica que el destinatario esté registrado
- Revisa los logs del servidor en Supabase

### **Los mensajes se envían pero no llegan**
- Verifica que el número de destino tenga WhatsApp activo
- Asegúrate de que el número de destino haya aceptado los términos de WhatsApp Business
- Revisa el registro de mensajes en el panel de Meta

---

## 📚 Recursos adicionales

- [Documentación oficial de WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Guía de inicio rápido](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Preguntas frecuentes](https://developers.facebook.com/docs/whatsapp/faq)
- [Plantillas de mensajes](https://developers.facebook.com/docs/whatsapp/message-templates)

---

## 💰 Costos

### **Gratis:**
- Números de prueba
- Primeros 1,000 mensajes al mes (conversaciones de servicio)

### **De pago:**
- Conversaciones adicionales según [tarifas de Meta](https://developers.facebook.com/docs/whatsapp/pricing)
- El costo varía según el país de destino
- España: ~€0.03 por conversación

---

## ✅ Checklist de configuración

- [ ] Cuenta de Meta for Developers creada
- [ ] Aplicación de negocio creada en Meta
- [ ] WhatsApp agregado a la aplicación
- [ ] Número de teléfono verificado
- [ ] WHATSAPP_PHONE_ID obtenido
- [ ] WHATSAPP_API_KEY (token permanente) obtenido
- [ ] Variables agregadas en Supabase
- [ ] Prueba exitosa enviando mensaje de prueba
- [ ] Coordinador recibe notificaciones correctamente

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu sistema de envío automático de WhatsApp estará funcionando al 100%.

Si tienes problemas, revisa los logs del servidor en:
**Supabase → Edge Functions → Logs**
