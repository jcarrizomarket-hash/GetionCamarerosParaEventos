# 🧪 Guía de Testing Manual

Esta guía proporciona instrucciones paso a paso para realizar pruebas manuales completas del sistema de gestión de camareros.

---

## 📋 Pre-requisitos

Antes de comenzar las pruebas, asegúrate de tener:

- ✅ Aplicación corriendo en `http://localhost:3000`
- ✅ Servidor Supabase funcionando
- ✅ Credenciales de WhatsApp configuradas (opcional)
- ✅ Credenciales de Email configuradas (opcional)
- ✅ Número de prueba de WhatsApp: **+15558327331**

---

## 🎯 Pruebas de Configuración

### 1. Verificar Estado de WhatsApp

**Objetivo:** Confirmar que la configuración de WhatsApp se detecta correctamente.

**Pasos:**
1. Ir a `Pedidos` → `Entrada de Pedidos` → `Envío de Mensaje`
2. Buscar el componente de estado de WhatsApp
3. Verificar uno de estos mensajes:
   - ✅ "WhatsApp Business API configurada correctamente"
   - ⚠️ "WhatsApp API no configurada. Se usará WhatsApp Web como alternativa"

**Resultado esperado:**
- El estado debe mostrarse claramente
- Si está configurado, debe indicar la fuente (KV store o variables de entorno)

---

### 2. Verificar Estado de Email

**Objetivo:** Confirmar que al menos un proveedor de email está configurado.

**Pasos:**
1. Buscar el componente de estado de Email
2. Verificar el proveedor detectado (Resend, SendGrid, o Mailgun)

**Resultado esperado:**
- Debe mostrar qué proveedor está activo
- Si ninguno está configurado, debe mostrar advertencia

---

## 📱 Pruebas de WhatsApp

### 3. Validación de Phone Number ID

**Objetivo:** Verificar que el sistema detecta Phone Number IDs inválidos.

**Pasos:**
1. Ir a configuración de WhatsApp
2. Intentar guardar con un número de teléfono (ej: `+34628904614`)
3. Verificar mensaje de error detallado

**Resultado esperado:**
```
❌ PHONE NUMBER ID INCORRECTO

Has configurado: "+34628904614"

❗ IMPORTANTE: El "Phone Number ID" NO es un número de teléfono.

🔧 CÓMO OBTENER EL PHONE NUMBER ID CORRECTO:
[instrucciones detalladas]
```

---

### 4. Envío de Mensaje de Prueba (Con API configurada)

**Objetivo:** Enviar un mensaje de WhatsApp automáticamente.

**Datos de prueba:**
- **Número destinatario:** +15558327331 (número de prueba)
- **Mensaje:** "🧪 Mensaje de prueba del sistema"

**Pasos:**
1. Ir a `Envío de Mensaje`
2. Ingresar el número de prueba: `+15558327331`
3. Escribir el mensaje de prueba
4. Hacer clic en "Enviar Automáticamente"

**Resultado esperado:**
- ✅ Mensaje enviado exitosamente
- El mensaje aparece en WhatsApp del número de prueba
- No se abre WhatsApp Web

**Si falla:**
- Revisar que el Phone Number ID sea correcto
- Verificar que el token sea permanente (200+ caracteres)
- Revisar logs del servidor en Supabase

---

### 5. Envío de Mensaje (Fallback a WhatsApp Web)

**Objetivo:** Verificar que funciona el fallback cuando la API no está configurada.

**Pasos:**
1. Sin configurar WhatsApp API
2. Intentar enviar un mensaje
3. Hacer clic en "Enviar por WhatsApp"

**Resultado esperado:**
- Se abre WhatsApp Web en nueva pestaña
- El mensaje está pre-cargado
- El número de teléfono está formateado correctamente

---

## 📧 Pruebas de Email

### 6. Envío de Email de Confirmación

**Objetivo:** Enviar un email de prueba usando el proveedor configurado.

**Datos de prueba:**
- **Email destinatario:** pruebas@sistema-camareros.com (o tu email de prueba)
- **Asunto:** "🧪 Prueba de Sistema - Confirmación de Servicio"

**Pasos:**
1. Crear un pedido de prueba
2. Asignar un camarero con email válido
3. Enviar notificación por email
4. Revisar bandeja de entrada

**Resultado esperado:**
- ✅ Email recibido
- HTML renderizado correctamente
- Enlaces de confirmación/rechazo funcionan
- Email del remitente correcto

---

## 👥 Pruebas de CRUD

### 7. Crear Camarero de Prueba

**Datos:**
```
Nombre: Juan
Apellido: Pérez Test
Teléfono: +15558327331
Email: juan.test@ejemplo.com
Disponibilidad: Fechas futuras
```

**Pasos:**
1. Ir a `Camareros`
2. Hacer clic en "Nuevo Camarero"
3. Rellenar formulario con datos de prueba
4. Guardar

**Resultado esperado:**
- ✅ Camarero creado con número auto-asignado
- Aparece en la lista
- Datos correctos

---

### 8. Crear Cliente de Prueba

**Datos:**
```
Nombre: Empresa Test S.L.
Contacto: Pedro Martínez
Teléfono: +15558327331
Email: contacto@empresatest.com
```

**Pasos:**
1. Ir a `Clientes`
2. Crear nuevo cliente
3. Guardar

**Resultado esperado:**
- ✅ Cliente creado
- Datos correctos

---

### 9. Crear Coordinador de Prueba

**Datos:**
```
Nombre: Coordinador Test
Teléfono: +15558327331
```

**Pasos:**
1. Ir a `Coordinadores`
2. Crear nuevo coordinador
3. Guardar

**Resultado esperado:**
- ✅ Coordinador creado con número auto-asignado

---

## 📅 Pruebas de Pedidos/Eventos

### 10. Crear Pedido Simple (1 Turno)

**Datos:**
```
Número: TEST-001
Cliente: Empresa Test S.L.
Lugar: Salón de Eventos Test
Ubicación: Calle Prueba, 123, Madrid
Fecha: [Fecha futura, ej: 20/02/2026]
Cantidad de camareros: 5
Hora entrada: 14:00
Hora salida: 22:00
Catering: No
Camisa: Negra
Notas: Pedido de prueba simple
```

**Pasos:**
1. Ir a `Pedidos` → `Entrada de Pedidos`
2. Hacer clic en "Nuevo Pedido"
3. Rellenar formulario
4. Guardar

**Resultado esperado:**
- ✅ Pedido creado
- Aparece en calendario con color correcto
- Total de horas calculado automáticamente (8h)

---

### 11. Crear Pedido con Segundo Turno

**Datos:**
```
Número: TEST-002
Cliente: Empresa Test S.L.
Lugar: Hotel Test
Fecha: [Fecha futura]

TURNO 1:
- Cantidad: 8 camareros
- Entrada: 19:00
- Salida: 02:00

TURNO 2:
- Cantidad: 3 camareros
- Entrada: 23:00
- Salida: 04:00

Catering: Sí
Camisa: Blanca
Notas: Pedido con segundo turno - Prueba
```

**Pasos:**
1. Crear pedido
2. Activar "Segundo turno"
3. Rellenar ambos turnos
4. Guardar

**Resultado esperado:**
- ✅ Pedido con dos turnos creado
- Horas calculadas para ambos turnos
- Se muestra correctamente en gestión de pedidos

---

## 🎯 Pruebas de Asignaciones

### 12. Asignar Camareros a Pedido

**Pasos:**
1. Ir a `Pedidos` → `Gestión de Pedidos`
2. Seleccionar pedido TEST-001
3. Hacer clic en "Asignar Camareros"
4. Seleccionar 5 camareros (incluyendo Juan Pérez Test)
5. Guardar asignaciones

**Resultado esperado:**
- ✅ Camareros asignados
- Estado inicial: "pendiente" (amarillo)
- Aparecen en tabla de "Estado Global de Asignaciones"

---

### 13. Enviar Notificaciones a Camareros Asignados

**Pasos:**
1. Con el pedido TEST-001 asignado
2. Seleccionar camareros a notificar
3. Hacer clic en "Enviar Notificaciones WhatsApp"
4. Confirmar envío

**Resultado esperado:**
- ✅ Mensajes enviados a +15558327331
- Estado cambia a "enviado" (azul)
- Si API no configurada, se abre WhatsApp Web

---

### 14. Confirmar Asistencia (Camarero)

**Pasos:**
1. Abrir el enlace de confirmación del WhatsApp/Email recibido
2. Hacer clic en "✅ CONFIRMO"

**Resultado esperado:**
- ✅ Página de confirmación exitosa
- En Gestión de Pedidos, estado cambia a "confirmado" (verde)
- Coordinador recibe notificación automática (si WhatsApp configurado)

---

### 15. Rechazar Asistencia (Camarero)

**Pasos:**
1. Abrir el enlace de confirmación
2. Hacer clic en "❌ NO CONFIRMO"

**Resultado esperado:**
- ✅ Página de rechazo mostrada
- Camarero eliminado automáticamente de asignaciones
- Coordinador recibe alerta de "ACCIÓN REQUERIDA"

---

## 📊 Pruebas de Informes

### 16. Informe por Cliente

**Pasos:**
1. Ir a `Informes`
2. Seleccionar "Informes por Cliente"
3. Filtrar por "Empresa Test S.L."
4. Seleccionar rango de fechas

**Resultado esperado:**
- ✅ Muestra todos los pedidos de ese cliente
- KPIs calculados correctamente:
  - Total de eventos
  - Total de camareros asignados
  - Total de horas
  - Promedio de camareros por evento

---

### 17. Informe por Camarero

**Pasos:**
1. Ir a `Informes`
2. Seleccionar "Informes por Camarero"
3. Seleccionar "Juan Pérez Test"
4. Seleccionar rango de fechas

**Resultado esperado:**
- ✅ Muestra todos los eventos del camarero
- KPIs:
  - Total de eventos trabajados
  - Total de horas
  - Estado de cada evento (confirmado, pendiente, etc.)

---

## 📤 Pruebas de Exportación

### 18. Exportar a Excel

**Pasos:**
1. En cualquier informe
2. Hacer clic en "Exportar a Excel"

**Resultado esperado:**
- ✅ Descarga archivo .xlsx
- Datos correctos
- Formato legible

---

### 19. Exportar a PDF

**Pasos:**
1. En cualquier informe
2. Hacer clic en "Exportar a PDF"

**Resultado esperado:**
- ✅ Descarga archivo .pdf
- Diseño profesional
- Datos completos

---

## 🔊 Pruebas de Notificaciones

### 20. Señal Sonora para Coordinador

**Pasos:**
1. Como coordinador, estar en Gestión de Pedidos
2. Esperar a que un camarero confirme/rechace (o simular con otro navegador)

**Resultado esperado:**
- ✅ Sonido de notificación reproduce
- Toast/alerta visual aparece
- Datos de la confirmación/rechazo mostrados

---

## 🎨 Pruebas de UI

### 21. Tabla de Estado Global de Asignaciones

**Verificar:**
- ✅ Alternancia de colores (blanco/gris claro)
- ✅ Identificación visual de segundo turno (fondo azul claro)
- ✅ Estados con colores correctos:
  - Pendiente: amarillo
  - Enviado: azul
  - Confirmado: verde
  - Ausente: rojo
- ✅ Responsive (mobile/tablet/desktop)

---

### 22. Calendario de Eventos

**Verificar:**
- ✅ Eventos se muestran en días correctos
- ✅ Colores según estado
- ✅ Navegación entre meses funciona
- ✅ Click en evento muestra detalles

---

## 📱 Pruebas de Responsividad

### 23. Vista Mobile

**Pasos:**
1. Abrir Chrome DevTools
2. Configurar viewport: iPhone 12 (390x844)
3. Navegar por todas las secciones

**Resultado esperado:**
- ✅ Menú adaptado (hamburger/sidebar)
- ✅ Tablas scrolleables horizontalmente
- ✅ Formularios usables
- ✅ Botones accesibles con el pulgar

---

### 24. Vista Tablet

**Pasos:**
1. Configurar viewport: iPad (768x1024)
2. Navegar por todas las secciones

**Resultado esperado:**
- ✅ Layout adaptado
- ✅ Uso eficiente del espacio
- ✅ Navegación fluida

---

## 🐛 Pruebas de Manejo de Errores

### 25. Error de Configuración de WhatsApp

**Pasos:**
1. Configurar Phone Number ID inválido (ej: +34628904614)
2. Intentar enviar mensaje

**Resultado esperado:**
- ❌ Error detallado explicando el problema
- 📝 Instrucciones de cómo obtener el Phone Number ID correcto
- 🔗 Enlaces a documentación

---

### 26. Error de Token Expirado

**Pasos:**
1. Configurar token temporal que ya expiró
2. Intentar enviar mensaje

**Resultado esperado:**
- ❌ Error explicando que el token expiró
- 📝 Instrucciones de cómo generar token permanente

---

### 27. Error de Formulario Incompleto

**Pasos:**
1. Intentar crear pedido sin campos requeridos
2. Intentar guardar

**Resultado esperado:**
- ❌ Validación HTML5
- 📝 Campos requeridos marcados en rojo
- 💬 Mensajes de error claros

---

## ✅ Checklist de Pruebas Completas

Marca cada prueba al completarla:

### Configuración
- [ ] Verificar estado de WhatsApp
- [ ] Verificar estado de Email

### WhatsApp
- [ ] Validación de Phone Number ID
- [ ] Envío de mensaje automático
- [ ] Fallback a WhatsApp Web

### Email
- [ ] Envío de email de confirmación

### CRUD
- [ ] Crear camarero
- [ ] Crear cliente
- [ ] Crear coordinador
- [ ] Crear pedido simple
- [ ] Crear pedido con segundo turno

### Asignaciones
- [ ] Asignar camareros
- [ ] Enviar notificaciones
- [ ] Confirmar asistencia
- [ ] Rechazar asistencia

### Informes
- [ ] Informe por cliente
- [ ] Informe por camarero
- [ ] Exportar a Excel
- [ ] Exportar a PDF

### UI
- [ ] Tabla de asignaciones
- [ ] Calendario
- [ ] Vista mobile
- [ ] Vista tablet

### Errores
- [ ] Error de configuración WhatsApp
- [ ] Error de token expirado
- [ ] Error de formulario

---

## 📝 Notas de Testing

**Número de prueba WhatsApp:** +15558327331
- Este es un número sandbox de Meta
- Debe estar registrado como "número de prueba" en tu configuración de WhatsApp Business API
- Solo puedes enviar a números registrados como "números de prueba" mientras uses el número sandbox

**Eliminación de datos de prueba:**
- Después de completar las pruebas, elimina los datos de prueba creados
- Buscar por "TEST-" en el número de pedido
- Buscar por "Test" en nombres de camareros/clientes

---

## 🚀 Pruebas Automatizadas

Además de las pruebas manuales, ejecuta las pruebas automatizadas:

```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Tests E2E
npm run test:e2e
```

---

## 📞 Reporte de Problemas

Si encuentras algún problema durante las pruebas:

1. **Anota:**
   - Qué prueba estabas ejecutando
   - Pasos exactos para reproducir
   - Resultado esperado vs resultado obtenido
   - Capturas de pantalla
   - Logs de consola/servidor

2. **Revisa:**
   - Logs del servidor en Supabase
   - Consola del navegador (F12)
   - Network tab para ver llamadas API

3. **Documenta:**
   - Crea un issue detallado
   - Incluye toda la información recopilada
