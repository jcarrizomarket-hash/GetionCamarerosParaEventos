# 📧 Sistema de Email Multi-Proveedor - Visión General

## 🎯 Resumen

Tu aplicación ahora cuenta con un **sistema de email genérico e inteligente** que:

- ✅ Detecta automáticamente qué proveedor de email está configurado
- ✅ Funciona con **Resend**, **SendGrid** o **Mailgun** sin cambiar código
- ✅ Permite tener múltiples proveedores configurados (fallback automático)
- ✅ Muestra el estado de configuración en tiempo real
- ✅ Envía emails con diseño profesional y HTML personalizado
- ✅ Soporta copias a coordinadores (CC)

---

## 🏗️ Arquitectura del Sistema

### **Backend (Servidor)**

#### **Función Central: `enviarEmailGenerico()`**

Esta función es el corazón del sistema. Detecta automáticamente qué servicio usar:

```typescript
async function enviarEmailGenerico(params) {
  // 1. Detecta qué servicios están configurados
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
  const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
  
  // 2. Intenta enviar con el primer servicio disponible
  if (resendApiKey) {
    return enviarConResend();
  }
  if (sendgridApiKey) {
    return enviarConSendGrid();
  }
  if (mailgunApiKey) {
    return enviarConMailgun();
  }
  
  // 3. Si no hay ninguno configurado, retorna error
  return { success: false, error: 'No hay servicio configurado' };
}
```

#### **Orden de Prioridad**

1. **Resend** (prioridad 1) - Moderno y fácil de usar
2. **SendGrid** (prioridad 2) - Confiable y robusto
3. **Mailgun** (prioridad 3) - Flexible y potente

#### **Endpoints Disponibles**

- `GET /verificar-email-config` - Verifica qué servicio está configurado
- `POST /enviar-email-parte` - Envía un parte por email

---

### **Frontend (Interfaz de Usuario)**

#### **Componente: `EmailConfigStatus`**

Muestra el estado de configuración en tiempo real:

- 🟢 **Verde**: Servicio configurado correctamente
  - Muestra el proveedor activo
  - Lista todos los servicios disponibles
  - Muestra el email remitente
  
- 🟠 **Ámbar**: No hay servicio configurado
  - Muestra instrucciones para configurar
  - Lista los servicios soportados
  - Enlace a documentación

#### **Componente: `EnvioParte`**

Interfaz completa para enviar partes:

- Selector de pedido
- Botón "Enviar por Email"
- Modal con formulario:
  - Destinatario (requerido)
  - Asunto (pre-rellenado)
  - Mensaje personalizable
  - Opción de copia a coordinador
- Indicador de envío en progreso
- Mensajes de éxito/error

---

## 🔄 Flujo de Funcionamiento

### **1. Al Cargar la Página**

```mermaid
Frontend → Servidor: GET /verificar-email-config
Servidor → Variables: Lee RESEND_API_KEY, SENDGRID_API_KEY, MAILGUN_API_KEY
Servidor → Frontend: { configured: true/false, servicioActivo: "Resend", ... }
Frontend → Usuario: Muestra estado (verde/ámbar)
```

### **2. Al Enviar un Email**

```mermaid
Usuario → Frontend: Completa formulario y hace clic en "Enviar"
Frontend → Servidor: POST /enviar-email-parte con datos del parte
Servidor → enviarEmailGenerico(): Detecta proveedor configurado
enviarEmailGenerico() → Resend/SendGrid/Mailgun: Envía email vía API
Proveedor → Servidor: Respuesta (éxito/error)
Servidor → Frontend: Resultado
Frontend → Usuario: Mensaje de éxito o error
```

---

## 📝 Variables de Entorno

### **Configuración Mínima (un servicio)**

Opción 1: Resend
```
RESEND_API_KEY = re_abc123...
EMAIL_FROM = onboarding@resend.dev
```

Opción 2: SendGrid
```
SENDGRID_API_KEY = SG.abc123...
EMAIL_FROM = tumail@correo.com
```

Opción 3: Mailgun
```
MAILGUN_API_KEY = abc123...
MAILGUN_DOMAIN = tudominio.com
EMAIL_FROM = no-reply@tudominio.com
```

### **Configuración Múltiple (con fallback)**

Si configuras varios servicios, el sistema usará el primero disponible:

```
RESEND_API_KEY = re_abc123...       # ← Se usará este primero
SENDGRID_API_KEY = SG.xyz789...     # ← Fallback si Resend falla
MAILGUN_API_KEY = def456...         # ← Fallback si SendGrid falla
MAILGUN_DOMAIN = tudominio.com
EMAIL_FROM = no-reply@tudominio.com
```

---

## 🎨 Diseño del Email

### **Estructura del Email Enviado**

```
┌─────────────────────────────────────┐
│ 📋 Parte de Servicio                │ ← Header con gradiente verde
│ [Sistema de Gestión de Camareros]  │
├─────────────────────────────────────┤
│                                      │
│ [Mensaje personalizado del usuario] │ ← Mensaje opcional
│                                      │
├─────────────────────────────────────┤
│                                      │
│ [HTML del Parte Completo]           │ ← Parte con todos los detalles
│ - Cliente, Fecha, Lugar              │
│ - Tabla de camareros                 │
│ - Espacio para firma                 │
│                                      │
├─────────────────────────────────────┤
│ Este email fue generado              │ ← Footer
│ automáticamente                      │
└─────────────────────────────────────┘
```

---

## 🧪 Testing y Verificación

### **Paso 1: Verificar Configuración**

1. Recarga la aplicación
2. Ve a "Envío Parte"
3. Observa el banner de estado:
   - ✅ Verde = Configurado correctamente
   - ⚠️ Ámbar = Necesita configuración

### **Paso 2: Probar Envío**

1. Selecciona un pedido
2. Haz clic en "Enviar por Email"
3. Ingresa tu propio email como destinatario
4. Haz clic en "Enviar Email"
5. Verifica que recibas el email

### **Paso 3: Revisar Logs**

En la consola del servidor (Supabase) verás:

```
📧 Solicitud de envío de email recibida
   Destinatario: ejemplo@correo.com
   CC: No
   Asunto: Parte de Servicio - Cliente X - 15/1/2026
   Pedido: Cliente X - 15/1/2026
🚀 Usando Resend para enviar email
✅ Email enviado exitosamente con Resend
```

---

## 🔒 Seguridad

### **API Keys**

- ✅ Todas las API keys se almacenan en **variables de entorno** de Supabase
- ✅ **Nunca** se exponen al frontend
- ✅ Solo el servidor tiene acceso a ellas

### **Validación**

- ✅ Validación de campos requeridos en el frontend
- ✅ Validación de formato de email
- ✅ Manejo de errores robusto

---

## 📊 Monitoring y Debugging

### **Logs del Sistema**

El sistema genera logs detallados:

- `🚀 Usando [Proveedor] para enviar email` - Indica qué servicio se está usando
- `✅ Email enviado exitosamente` - Confirmación de envío
- `❌ Error al enviar con [Proveedor]` - Error específico del proveedor
- `⚠️ No hay ningún servicio configurado` - Falta configuración

### **Panel de Estado**

El componente `EmailConfigStatus` muestra:

- Servicio activo
- Servicios disponibles (si hay múltiples)
- Email remitente configurado
- Instrucciones si no está configurado

---

## 🚀 Ventajas del Sistema

### **1. Flexibilidad**

- Cambia de proveedor sin tocar código
- Usa el proveedor que prefieras (Resend, SendGrid, Mailgun)
- Configura múltiples proveedores para redundancia

### **2. Simplicidad**

- Una sola configuración para todo
- Detección automática del proveedor
- No necesitas preocuparte por la implementación

### **3. Escalabilidad**

- Agregar nuevos proveedores es simple
- Soporta múltiples destinos (to, cc)
- HTML personalizable

### **4. Confiabilidad**

- Fallback automático si un proveedor falla
- Logs detallados para debugging
- Manejo de errores robusto

---

## 🎯 Casos de Uso

### **Caso 1: Enviar Parte al Cliente**

```
1. Seleccionar pedido
2. Clic en "Enviar por Email"
3. Ingresar email del cliente
4. Personalizar mensaje
5. Enviar
```

### **Caso 2: Enviar Parte con Copia al Coordinador**

```
1. Seleccionar pedido
2. Clic en "Enviar por Email"
3. Ingresar email del cliente
4. Marcar "Enviar copia al coordinador"
5. Ingresar email del coordinador
6. Enviar
```

### **Caso 3: Cambiar de Proveedor**

```
1. Ir a Supabase → Project Settings → Secrets
2. Agregar nueva API key (ej: SENDGRID_API_KEY)
3. Recarga la aplicación
4. El sistema automáticamente usará el nuevo proveedor
```

---

## 🔮 Futuras Mejoras

Posibles mejoras que se pueden agregar:

- [ ] Plantillas de email personalizables
- [ ] Historial de emails enviados
- [ ] Programación de envíos
- [ ] Adjuntos adicionales (PDF, Excel)
- [ ] Respuestas automáticas
- [ ] Analytics de apertura y clicks
- [ ] Envío masivo de partes

---

## 📚 Documentación Relacionada

- `EMAIL_SETUP.md` - Guía completa de configuración paso a paso
- `WHATSAPP_SETUP.md` - Configuración de WhatsApp (sistema similar)
- Documentación de Resend: https://resend.com/docs
- Documentación de SendGrid: https://docs.sendgrid.com
- Documentación de Mailgun: https://documentation.mailgun.com

---

## 💡 Tips y Mejores Prácticas

### **✅ DO:**

- Verifica tu dominio para mejor deliverability
- Usa un email profesional como remitente
- Prueba primero con tu propio email
- Monitorea los límites de tu plan
- Lee los logs del servidor para debugging

### **❌ DON'T:**

- No expongas las API keys en el frontend
- No envíes spam (respeta los límites)
- No uses emails no verificados como remitentes
- No ignores los errores del servidor

---

## 🆘 Soporte

Si encuentras problemas:

1. **Verifica la configuración** con el componente de estado
2. **Revisa los logs** del servidor en Supabase
3. **Consulta EMAIL_SETUP.md** para troubleshooting
4. **Verifica las variables** en Supabase Secrets

---

## 🎉 ¡Todo Listo!

Tu sistema de email está completamente funcional y listo para usarse en producción. Solo necesitas configurar al menos un proveedor para empezar a enviar partes por email profesionalmente.

**Próximo paso:** Abre `EMAIL_SETUP.md` y sigue la guía para configurar tu proveedor preferido.
