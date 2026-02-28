# 📧 Configuración de Envío de Emails - Sistema Multi-Proveedor

Esta guía te ayudará a configurar el servicio de envío de emails para enviar partes de servicio por correo electrónico.

## 🎯 ¿Por qué configurar el servicio de email?

Con el servicio configurado, podrás:
- ✅ **Enviar partes de servicio por email** con un solo clic
- ✅ **Adjuntar automáticamente** el parte formateado en HTML
- ✅ **Copias a coordinadores** opcionales
- ✅ **Personalizar asunto y mensaje** para cada envío
- ✅ **Registro automático** de todos los emails enviados
- ✅ **Detección automática** del proveedor configurado
- ✅ **Múltiples proveedores** - configura varios y el sistema elegirá automáticamente

## 🚀 Sistema Multi-Proveedor

El sistema detecta automáticamente qué servicio de email está configurado y lo usa sin necesidad de cambiar código. Puedes configurar uno o varios servicios, y el sistema usará el primero disponible en este orden de prioridad:

1. **Resend** (prioridad 1)
2. **SendGrid** (prioridad 2)
3. **Mailgun** (prioridad 3)

---

## 📋 Opciones de Servicios de Email

### **Opción 1: Resend (Recomendado)**

Resend es un servicio moderno y fácil de usar, ideal para aplicaciones.

**Ventajas:**
- ✅ 100 emails gratis al día
- ✅ API simple y rápida
- ✅ Excelente deliverability
- ✅ Configuración en 5 minutos

**Pasos:**

1. **Crear cuenta**
   - Ve a [resend.com](https://resend.com)
   - Regístrate con tu email

2. **Obtener API Key**
   - En el dashboard, ve a "API Keys"
   - Haz clic en "Create API Key"
   - Dale un nombre: "Gestión Camareros"
   - **Copia la API Key** (empieza con `re_...`)

3. **Verificar dominio (opcional)**
   - Para enviar desde tu propio dominio (ej: `no-reply@tuempresa.com`)
   - Ve a "Domains" → "Add Domain"
   - Sigue las instrucciones para verificar tu dominio
   - Si no tienes dominio, usa `onboarding@resend.dev` (limitado)

4. **Configurar en Supabase**
   ```
   RESEND_API_KEY = re_tu_api_key_aqui
   EMAIL_FROM = onboarding@resend.dev  (o tu dominio verificado)
   ```

---

### **Opción 2: SendGrid**

SendGrid es un servicio robusto usado por grandes empresas.

**Ventajas:**
- ✅ 100 emails gratis al día
- ✅ Muy confiable
- ✅ Buenas analíticas

**Pasos:**

1. **Crear cuenta**
   - Ve a [sendgrid.com](https://sendgrid.com)
   - Regístrate gratis

2. **Obtener API Key**
   - Ve a Settings → API Keys
   - Crea una API Key con permisos de "Mail Send"
   - **Copia la API Key** (empieza con `SG.`)

3. **Verificar remitente**
   - Ve a Settings → Sender Authentication
   - Verifica tu email de remitente

4. **Configurar en Supabase**
   ```
   SENDGRID_API_KEY = SG.tu_api_key_aqui
   EMAIL_FROM = tu-email-verificado@correo.com
   ```

---

### **Opción 3: Mailgun**

Mailgun es otra alternativa popular.

**Ventajas:**
- ✅ 5,000 emails gratis al mes (primeros 3 meses)
- ✅ Muy flexible
- ✅ Buena documentación

---

## 🔧 Implementación en el Servidor

Una vez que tengas tu API Key, necesitas descomentar y configurar el código en el servidor.

### **Abrir el archivo del servidor:**
`/supabase/functions/server/index.tsx`

### **Buscar el endpoint:**
Busca la sección `// ============== ENVÍO DE EMAIL ==============`

### **Para Resend:**

Reemplaza el código comentado con:

```typescript
app.post('/make-server-25b11ac0/enviar-email-parte', async (c) => {
  try {
    const { destinatario, cc, asunto, mensaje, parteHTML, pedido } = await c.req.json();
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'onboarding@resend.dev';
    
    if (!resendApiKey) {
      return c.json({ 
        success: false, 
        error: 'Servicio de email no configurado. Por favor, configura RESEND_API_KEY en las variables de entorno.' 
      });
    }

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0;">Parte de Servicio</h2>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
          <p style="color: #374151; line-height: 1.6; white-space: pre-line;">${mensaje}</p>
        </div>
        
        <div style="border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; overflow: hidden;">
          ${parteHTML}
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            Este email fue generado automáticamente desde el sistema de gestión de camareros
          </p>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [destinatario],
        cc: cc ? [cc] : undefined,
        subject: asunto,
        html: emailBody
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Email enviado exitosamente:', result);
      return c.json({ success: true, data: result });
    } else {
      console.log('Error al enviar email:', result);
      return c.json({ success: false, error: result.message || 'Error al enviar email' });
    }
    
  } catch (error) {
    console.log('Error al enviar email:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});
```

---

## 📝 Variables de Entorno en Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Project Settings → Edge Functions → Secrets
3. Agrega las variables según el servicio:

### **Para Resend:**
```
RESEND_API_KEY = re_tu_api_key_aqui
EMAIL_FROM = onboarding@resend.dev
```

### **Para SendGrid:**
```
SENDGRID_API_KEY = SG.tu_api_key_aqui
EMAIL_FROM = tu-email@correo.com
```

4. Haz clic en **"Save"**

---

## ✅ Verificar Configuración

1. Recarga la aplicación
2. Ve a **"Envío Parte"**
3. Selecciona un pedido
4. Haz clic en **"Enviar por Email"**
5. Completa el formulario
6. Haz clic en **"Enviar Email"**

Si todo está configurado correctamente:
- ✅ Verás el mensaje: "✅ Email enviado correctamente"
- ✅ El destinatario recibirá el email con el parte adjunto
- ✅ Si configuraste CC, el coordinador también recibirá una copia

---

## 🛟 Solución de Problemas

### **Error: "Servicio de email no configurado"**
- Verifica que hayas agregado las variables en Supabase
- Asegúrate de que los nombres sean exactos: `RESEND_API_KEY` o `SENDGRID_API_KEY`
- Recarga la aplicación después de agregar las variables

### **Error: "API Key inválida"**
- Verifica que hayas copiado la API Key completa
- Asegúrate de no tener espacios al inicio o final
- Genera una nueva API Key si es necesario

### **El email no llega**
- Revisa la carpeta de spam del destinatario
- Verifica que el email del destinatario sea correcto
- Con Resend sin dominio verificado, solo puedes enviar a emails verificados
- Considera verificar tu dominio para enviar a cualquier email

### **Error: "Domain not verified"** (Resend)
- Si usas un email personalizado, necesitas verificar tu dominio
- Usa `onboarding@resend.dev` temporalmente para pruebas
- Verifica tu dominio siguiendo la guía de Resend

---

## 📊 Límites de los Servicios

### **Resend (Plan Gratuito):**
- 100 emails por día
- 3,000 emails por mes
- Sin límite de destinatarios verificados

### **SendGrid (Plan Gratuito):**
- 100 emails por día
- Sin caducidad del plan gratuito

### **Mailgun (Primeros 3 meses):**
- 5,000 emails por mes
- Después: 1,000 emails por mes gratis

---

## 🎨 Personalización

### **Cambiar el remitente:**
```
EMAIL_FROM = nombre@tudominio.com
```

### **Agregar logo a los emails:**
Modifica el `emailBody` en el código del servidor y agrega:
```html
<img src="https://tudominio.com/logo.png" alt="Logo" style="max-width: 150px;">
```

### **Cambiar colores:**
Modifica los valores hex en los estilos:
```css
background: linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%);
```

---

## 💡 Consejos

- ✅ **Verifica tu dominio** para mejor deliverability
- ✅ **Usa un email profesional** como remitente
- ✅ **Prueba primero** con tu propio email
- ✅ **Monitorea los límites** de tu plan
- ✅ **Considera actualizar** si envías muchos emails

---

## 📚 Recursos

- [Documentación de Resend](https://resend.com/docs)
- [Documentación de SendGrid](https://docs.sendgrid.com/)
- [Documentación de Mailgun](https://documentation.mailgun.com/)
- [Guía de Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## ✅ Checklist de Configuración

- [ ] Cuenta creada en el servicio de email (Resend/SendGrid/Mailgun)
- [ ] API Key obtenida
- [ ] Email de remitente verificado (si aplica)
- [ ] Variables agregadas en Supabase
- [ ] Código del servidor actualizado (descomentado)
- [ ] Aplicación recargada
- [ ] Email de prueba enviado exitosamente
- [ ] Email recibido correctamente

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, podrás enviar partes de servicio por email con solo un clic.

Si necesitas ayuda adicional, consulta la documentación oficial de tu servicio de email elegido.