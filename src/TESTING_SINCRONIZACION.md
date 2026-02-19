# 🧪 Guía Rápida de Testing: Sincronización Aceptar/Rechazar

## Objetivo
Verificar que el sistema de aceptación/rechazo de servicios está correctamente sincronizado entre el módulo de envío de mensajes y gestión de pedidos.

---

## ✅ Test 1: Aceptar Servicio

### Pasos:

1. **Crear un Pedido**
   - Ir a "Entrada de Pedidos"
   - Crear un nuevo pedido para hoy o mañana
   - Cantidad de camareros: 2
   - Guardar el pedido

2. **Asignar Camareros**
   - Ir a "Gestión de Pedidos"
   - Seleccionar el pedido creado
   - Asignar 2 camareros diferentes
   - Estado inicial debería ser vacío (gris)

3. **Enviar Mensaje**
   - Ir a "Envío de Mensajes"
   - Seleccionar el evento
   - Seleccionar primer camarero
   - El mensaje se envía automáticamente
   - Estado cambia a "Mensaje Enviado" (naranja)

4. **Simular Aceptación** (2 opciones):
   
   **Opción A: Desde el Panel**
   - En "Envío de Mensajes", hacer clic en "Aceptar Servicio"
   - Verificar mensaje de confirmación en el chat
   
   **Opción B: Desde el Enlace**
   - Copiar el enlace de ACEPTAR del mensaje generado
   - Abrir en nueva pestaña
   - Debería mostrar página de confirmación exitosa

5. **Verificar Sincronización**
   - Ir a "Gestión de Pedidos"
   - **Esperado**: El camarero aparece con:
     - ✅ Fondo verde (`bg-green-50`)
     - ✅ Badge verde: "Confirmado"
     - ✅ Borde verde (`border-green-500`)
   
   - En la "Tabla Global de Asignaciones":
     - ✅ Estado: "Confirmado" (verde)
     - ✅ Visible en la tabla global

6. **Repetir para el segundo camarero**
   - Cuando ambos acepten, verificar creación de chat grupal automático

### ✅ Resultado Esperado:
- Estado "confirmado" visible en TODA la interfaz en VERDE
- Chat grupal creado automáticamente cuando todos confirman
- Coordinador notificado vía WhatsApp (si está configurado)

---

## ❌ Test 2: Rechazar Servicio

### Pasos:

1. **Usar el mismo pedido o crear uno nuevo**
   - Asignar al menos 1 camarero
   - Enviar mensaje

2. **Simular Rechazo** (2 opciones):
   
   **Opción A: Desde el Panel**
   - En "Envío de Mensajes", hacer clic en "Rechazar Servicio"
   - Verificar mensaje de rechazo en el chat
   
   **Opción B: Desde el Enlace**
   - Copiar el enlace de RECHAZAR del mensaje generado
   - Abrir en nueva pestaña
   - Debería mostrar página indicando "eliminación en 5 horas"

3. **Verificar Sincronización Inmediata**
   - Ir a "Gestión de Pedidos"
   - **Esperado**: El camarero aparece con:
     - ❌ Fondo rojo (`bg-red-50`)
     - ❌ Badge rojo: "Rechazado" (en negrita)
     - ❌ Borde rojo (`border-red-500`)
   
   - En la "Tabla Global de Asignaciones":
     - ❌ Estado: "Rechazado" (rojo)
     - ⚠️ Todavía visible (NO eliminado inmediatamente)

4. **Verificar Logs del Backend**
   - Abrir consola del navegador
   - Buscar mensaje: `❌ RECHAZO: Camarero [nombre] rechazó el evento...`
   - Verificar timestamp de `eliminacionProgramada`

5. **Esperar Eliminación Automática** (2 opciones):
   
   **Opción A: Esperar 5 horas** (No recomendado para testing)
   
   **Opción B: Modificar timer temporalmente**
   - En `/components/gestion-pedidos.tsx`, línea 266:
   ```typescript
   // TEMPORAL: Cambiar 5 horas por 1 minuto para testing
   eliminacionProgramada: new Date(Date.now() + 1 * 60 * 1000).toISOString()
   ```
   - Guardar y esperar 1 minuto
   - El camarero debe desaparecer automáticamente

6. **Verificar Eliminación**
   - Después del tiempo programado (5 horas o 1 minuto si se modificó):
     - ✅ El camarero rechazado ya NO aparece en la lista
     - ✅ El slot queda como "Vacante" en la tabla global
     - ✅ Coordinador puede asignar un reemplazo

### ❌ Resultado Esperado:
- Estado "rechazado" visible en TODA la interfaz en ROJO
- Permanece visible durante el periodo programado (5 horas)
- Se elimina automáticamente después
- Coordinador notificado vía WhatsApp (si está configurado)

---

## 🔄 Test 3: Sincronización Entre Módulos

### Pasos:

1. **Dividir pantalla**:
   - Ventana 1: "Envío de Mensajes"
   - Ventana 2: "Gestión de Pedidos"

2. **Realizar cambio en Envío de Mensajes**:
   - Seleccionar un camarero
   - Hacer clic en "Aceptar Servicio"

3. **Verificar actualización en Gestión de Pedidos**:
   - Refrescar la página (o esperar polling automático)
   - ✅ El estado debe actualizarse a verde inmediatamente

4. **Realizar cambio en Gestión de Pedidos**:
   - Cambiar estado de un camarero usando el dropdown
   - Cambiar de "Enviado" a "Confirmado"

5. **Verificar actualización en Envío de Mensajes**:
   - Volver a la pestaña de "Envío de Mensajes"
   - Actualizar la vista
   - ✅ El camarero debe aparecer como confirmado (verde)

### 🔄 Resultado Esperado:
- Los cambios se sincronizan bidireccionalmetne
- Ambos módulos muestran el mismo estado
- Sin inconsistencias visuales

---

## 📊 Test 4: Tabla Global de Asignaciones

### Pasos:

1. **Crear múltiples pedidos**:
   - Pedido 1: 3 camareros (2 confirmados, 1 enviado)
   - Pedido 2: 2 camareros (1 confirmado, 1 rechazado)
   - Pedido 3: 4 camareros (todos confirmados)

2. **Verificar Tabla Global**:
   - Ir a "Gestión de Pedidos" (sin seleccionar ningún evento)
   - Verificar la tabla "Estado Global de Asignaciones"

3. **Verificar Colores**:
   - ✅ Confirmados: Verde
   - ⏳ Enviados: Naranja/Amarillo
   - ❌ Rechazados: Rojo
   - ⚪ Pendientes: Gris
   - 🔴 Vacantes: Fondo blanco con texto rojo

4. **Verificar Alternancia de Colores**:
   - Pedidos pares: `bg-gray-50`
   - Pedidos impares: `bg-blue-50/30`
   - Faltantes: `bg-white` (sin color)

5. **Verificar 2º Turno**:
   - Si hay camareros en el segundo turno
   - ✅ Debe aparecer badge morado: "2º Turno"

### 📊 Resultado Esperado:
- Todos los pedidos listados cronológicamente
- Estados correctamente coloreados
- Alternancia de colores por evento
- Identificación clara de segundos turnos

---

## 💬 Test 5: Chat Grupal Automático

### Pasos:

1. **Crear pedido con 3 camareros**
   - Asignar 3 camareros diferentes
   - Enviar mensaje a los 3

2. **Hacer que 2 camareros acepten**
   - Verificar que NO se crea chat grupal aún

3. **Hacer que el 3er camarero acepte**
   - Inmediatamente después de la 3ra confirmación:
     - ✅ Chat grupal creado automáticamente
     - ✅ Visible en "Chat Grupal"
     - ✅ Todos los miembros listados

4. **Verificar Logs del Backend**:
   ```
   ✅ Chat grupal creado automáticamente para pedido: [Cliente]
   🎉 ¡TODOS LOS CAMAREROS HAN CONFIRMADO!
   ```

5. **Verificar Notificación al Coordinador**:
   - Si WhatsApp está configurado:
     - Coordinador debe recibir mensaje:
       "🎉 ¡TODOS LOS CAMAREROS HAN CONFIRMADO!"
       "✅ Chat grupal creado automáticamente"

### 💬 Resultado Esperado:
- Chat se crea solo cuando TODOS confirman
- No se crea si hay rechazos o pendientes
- Coordinador notificado automáticamente

---

## 🐛 Checklist de Bugs Comunes

### Verificar:

- [ ] Estado "confirmado" se muestra en verde (no gris)
- [ ] Estado "rechazado" se muestra en rojo (no se elimina inmediatamente)
- [ ] Los cambios persisten después de refrescar la página
- [ ] No hay warnings de React keys en la consola
- [ ] El timer de eliminación funciona correctamente
- [ ] Chat grupal no se crea si hay rechazos
- [ ] Los colores se mantienen consistentes en todas las vistas
- [ ] La hora de salida individual es editable
- [ ] El cálculo de horas trabajadas es correcto

---

## 📝 Logs Útiles para Depuración

### Backend (Supabase Edge Function):

```
# Confirmación
✅ CONFIRMACIÓN: Camarero [Nombre] confirmó asistencia al evento "[Cliente]"
   Estado actualizado: confirmado
   Asignaciones totales: [N]

# Rechazo
❌ RECHAZO: Camarero [Nombre] rechazó el evento "[Cliente]"
   Estado actualizado: rechazado
   Eliminación programada: [ISO timestamp]

# Actualización de Pedido
📝 Actualizando pedido: pedido:[timestamp]
   Estado asignaciones: [{ num: X, estado: "confirmado" }, ...]
```

### Frontend (Console del Navegador):

```javascript
// Ver todos los pedidos con sus asignaciones
console.table(pedidos.map(p => ({
  cliente: p.cliente,
  asignaciones: p.asignaciones?.length || 0,
  confirmados: p.asignaciones?.filter(a => a.estado === 'confirmado').length || 0,
  rechazados: p.asignaciones?.filter(a => a.estado === 'rechazado').length || 0
})));
```

---

## 🎯 Criterios de Éxito

Para considerar el test exitoso, TODOS estos puntos deben cumplirse:

1. ✅ Aceptar servicio → VERDE en toda la interfaz
2. ❌ Rechazar servicio → ROJO en toda la interfaz
3. ⏰ Rechazados se eliminan automáticamente después de 5 horas
4. 🔄 Sincronización bidireccional entre módulos
5. 📊 Tabla global muestra todos los estados correctamente
6. 💬 Chat grupal se crea automáticamente cuando todos confirman
7. 📱 Notificaciones al coordinador (si está configurado)
8. 🎨 Colores consistentes en todas las vistas
9. ⚙️ Sin errores en consola del navegador
10. 🗄️ Cambios persisten después de refrescar

---

## 🚨 Si Algo Falla

### Problema: Estados no se sincronizan

**Solución**:
1. Verificar que `cargarDatos()` se llama después de cada cambio
2. Revisar logs del backend para ver si la actualización se guardó
3. Verificar que el `baseUrl` y `publicAnonKey` son correctos

### Problema: Colores incorrectos

**Solución**:
1. Verificar que el estado es exactamente: `'confirmado'`, `'enviado'`, `'rechazado'`
2. Revisar clases de Tailwind en `gestion-pedidos.tsx` líneas 907-912

### Problema: No se elimina después de 5 horas

**Solución**:
1. Verificar que el efecto en `gestion-pedidos.tsx` líneas 33-85 está activo
2. Revisar que `eliminacionProgramada` tiene un timestamp ISO válido
3. Para testing, cambiar 5 horas por 1 minuto

### Problema: Chat grupal no se crea

**Solución**:
1. Verificar que TODOS los camareros están en estado `'confirmado'`
2. Revisar logs del backend: `✅ Chat grupal creado automáticamente...`
3. Verificar que no existe un chat previo para ese pedido

---

**Última actualización**: 2026-02-18  
**Versión**: 1.0.0  
**Estado**: ✅ Listo para testing
