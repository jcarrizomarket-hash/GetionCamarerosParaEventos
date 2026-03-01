# 📧 Guía de Configuración de Resend

## ✅ Configuración Completada

Has configurado exitosamente **Resend** como tu proveedor de email.

### 🔑 Variables de Entorno Configuradas

1. **RESEND_API_KEY**: `re_cjvC4yaL_KnHM3JcaiCndB1qJpa2nhWL3`
2. **EMAIL_FROM**: (Ingresa tu dirección de email verificada en Resend)

---

## 📝 Dirección de Email Remitente (EMAIL_FROM)

Para que Resend pueda enviar emails, necesitas usar una dirección de email **verificada** en tu cuenta de Resend.

### **Opciones:**

#### **Opción 1: Usar el dominio de prueba de Resend (más rápido)**
```
onboarding@resend.dev
```
- ✅ **Ventaja**: Funciona de inmediato, no requiere verificación
- ⚠️ **Limitación**: Solo para pruebas, los emails pueden ir a spam

#### **Opción 2: Usar tu propio dominio (recomendado para producción)**
```
no-reply@tudominio.com
```
- ✅ **Ventaja**: Profesional, mejor entregabilidad
- ⚠️ **Requisito**: Debes verificar el dominio en Resend primero

---

## 🚀 Cómo Verificar tu Dominio en Resend

Si quieres usar tu propio dominio (ej: `no-reply@tuempresa.com`):

1. **Ve al Dashboard de Resend**
   - https://resend.com/domains

2. **Haz clic en "Add Domain"**
   - Ingresa tu dominio (ej: `tuempresa.com`)

3. **Configura los registros DNS**
   - Resend te dará registros DNS (SPF, DKIM)
   - Agrégalos en tu proveedor de DNS (GoDaddy, Cloudflare, etc.)

4. **Verifica el dominio**
   - Espera 5-10 minutos
   - Haz clic en "Verify" en Resend

5. **Usa cualquier email de ese dominio**
   - `no-reply@tuempresa.com`
   - `contacto@tuempresa.com`
   - `sistema@tuempresa.com`

---

## 🧪 Cómo Probar que Funciona

### **Paso 1: Verifica la configuración**

1. Abre tu aplicación en el navegador
2. Ve a la sección **"Envío de Parte"** en el menú "Pedidos"
3. Busca el **indicador de estado de email** en la parte superior
4. Deberías ver un mensaje verde:
   ```
   ✅ Email configurado: Resend
   Servicios disponibles: Resend
   Email remitente: [tu email configurado]
   ```

### **Paso 2: Envía un email de prueba**

1. **Selecciona un pedido** de la lista
2. **Haz clic en "Enviar por Email"**
3. **Completa el formulario**:
   - Destinatario: tu email personal (para recibir la prueba)
   - Asunto: (pre-rellenado automáticamente)
   - Mensaje: (opcional, personaliza si quieres)
4. **Haz clic en "Enviar Email"**
5. **Revisa tu bandeja de entrada** (o spam si usas `onboarding@resend.dev`)

---

## 🔍 Verificación en Tiempo Real

### **Consola del Navegador**

Abre la consola del navegador (F12) y busca estos logs:

**Al cargar la página:**
```
📧 Verificando configuración de email...
✅ Email configurado correctamente
```

**Al enviar un email:**
```
📧 Solicitud de envío de email recibida
   Destinatario: ejemplo@correo.com
   Asunto: Parte de Servicio - [Cliente] - [Fecha]
🚀 Usando Resend para enviar email
✅ Email enviado exitosamente con Resend
```

### **Panel de Resend**

1. Ve a https://resend.com/emails
2. Verás todos los emails enviados con su estado:
   - ✅ **Delivered**: Email entregado correctamente
   - ⏳ **Sending**: En proceso de envío
   - ❌ **Failed**: Error en el envío

---

## 🎨 Diseño del Email

Los emails se envían con un diseño profesional que incluye:

- ✅ **Header verde** con título "Parte de Servicio"
- ✅ **Mensaje personalizable** con formato
- ✅ **Parte completo** embebido en HTML
  - Información del cliente
  - Fecha y lugar del evento
  - Tabla de camareros asignados
  - Espacio para firma del responsable
- ✅ **Footer** con información del sistema

---

## ❌ Solución de Problemas

### **Error: "Email no configurado"**

**Causa**: No se encuentra la variable `RESEND_API_KEY`

**Solución**:
1. Verifica que pegaste correctamente la API Key en el modal
2. Reinicia el servidor si es necesario
3. Espera 10-20 segundos para que se actualice

### **Error: "Invalid API key"**

**Causa**: La API Key es incorrecta o expiró

**Solución**:
1. Ve a https://resend.com/api-keys
2. Genera una nueva API Key
3. Actualiza `RESEND_API_KEY` con el nuevo valor

### **Error: "Email address not verified"**

**Causa**: Estás usando un dominio no verificado

**Solución**:
1. **Opción rápida**: Usa `onboarding@resend.dev` en `EMAIL_FROM`
2. **Opción profesional**: Verifica tu dominio siguiendo los pasos arriba

### **Los emails llegan a spam**

**Causa**: Uso de dominio de prueba (`onboarding@resend.dev`)

**Solución**:
1. Verifica tu propio dominio en Resend
2. Configura SPF y DKIM correctamente
3. Usa un email de tu dominio verificado en `EMAIL_FROM`

---

## 📚 Recursos Adicionales

- **Dashboard de Resend**: https://resend.com/overview
- **Documentación**: https://resend.com/docs
- **Estado del servicio**: https://status.resend.com
- **Límites del plan gratuito**: 100 emails/día, 3,000 emails/mes

---

## ✨ Próximos Pasos

1. ✅ Verifica la configuración en la aplicación
2. ✅ Envía un email de prueba
3. ✅ Revisa que llegue correctamente
4. ✅ (Opcional) Configura tu dominio propio
5. ✅ ¡Comienza a usar el sistema de envío de partes!

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:

1. **Revisa los logs en la consola del navegador** (F12)
2. **Verifica el estado en Resend**: https://resend.com/emails
3. **Consulta esta guía** para troubleshooting
4. **Revisa el archivo** `/EMAIL_SETUP.md` para más detalles técnicos

---

**🎉 ¡Tu sistema de email está listo para usarse!**
