# Sistema de Sincronización: Aceptar/Rechazar Servicios

## Resumen del Sistema

Este documento describe el flujo completo de sincronización entre el **envío de mensajes**, **gestión de pedidos** y los **enlaces de confirmación** cuando un camarero acepta o rechaza un servicio.

---

## 🎯 Comportamiento Principal

### ✅ Cuando un Camarero ACEPTA el Servicio

1. **Desde el Enlace de Confirmación (Email/WhatsApp)**:
   - El camarero hace clic en el enlace `ACEPTAR`
   - Backend (`/confirmar/:token`):
     - Cambia el estado a `'confirmado'`
     - Cancela cualquier eliminación programada (`eliminacionProgramada: null`)
     - Notifica al coordinador vía WhatsApp
     - Si TODOS confirman → crea automáticamente el chat grupal
     - Elimina el token usado

2. **Desde el Panel de Envío de Mensajes**:
   - Coordinador hace clic en "Aceptar Servicio"
   - Frontend actualiza el estado a `'confirmado'`
   - Backend guarda el cambio
   - **Sincronización automática**: Los cambios se reflejan inmediatamente en Gestión de Pedidos

3. **Visualización en Gestión de Pedidos**:
   - ✅ **Fondo verde** (`bg-green-50` con borde `border-green-500`)
   - ✅ Badge verde: `'Confirmado'` (`bg-green-100 text-green-800`)
   - ✅ Aparece en la "Tabla Global de Asignaciones" con estado verde

---

### ❌ Cuando un Camarero RECHAZA el Servicio

1. **Desde el Enlace de Rechazo (Email/WhatsApp)**:
   - El camarero hace clic en el enlace `RECHAZAR`
   - Backend (`/no-confirmar/:token`):
     - ⚠️ **CAMBIO IMPORTANTE**: NO elimina inmediatamente
     - Cambia el estado a `'rechazado'`
     - Programa eliminación automática en **5 horas** (`eliminacionProgramada`)
     - Notifica al coordinador: "Será eliminado en 5 horas"
     - Elimina el token usado

2. **Desde el Panel de Envío de Mensajes**:
   - Coordinador hace clic en "Rechazar Servicio"
   - Frontend actualiza el estado a `'rechazado'`
   - Programa eliminación en 5 horas
   - Backend guarda el cambio

3. **Visualización en Gestión de Pedidos**:
   - ❌ **Fondo rojo** (`bg-red-50` con borde `border-red-500`)
   - ❌ Badge rojo: `'Rechazado'` (`bg-red-100 text-red-800 font-bold`)
   - ⏰ **Permanece visible durante 5 horas**
   - Aparece en la "Tabla Global de Asignaciones" con estado rojo

4. **Eliminación Automática**:
   - Un timer en `gestion-pedidos.tsx` verifica cada minuto
   - Después de 5 horas, elimina automáticamente al camarero rechazado
   - El coordinador tiene 5 horas para:
     - Asignar un reemplazo
     - O cambiar el estado manualmente

---

## 🔄 Flujo de Sincronización Completa

```
┌─────────────────────────────────────────────────────────────┐
│  Camarero hace clic en enlace ACEPTAR/RECHAZAR              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend: /confirmar/:token o /no-confirmar/:token          │
│  - Actualiza estado en KV Store                             │
│  - Notifica coordinador vía WhatsApp                        │
│  - Si ACEPTA: crea chat grupal si todos confirman           │
│  - Si RECHAZA: programa eliminación en 5 horas              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend: Recarga datos automática (polling/refresh)       │
│  - App.tsx llama cargarDatos()                              │
│  - Obtiene pedidos actualizados del backend                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├──────────────────────────┬──────────┐
                         ▼                          ▼          ▼
         ┌───────────────────────┐  ┌─────────────────────────────┐
         │  Envío de Mensajes    │  │  Gestión de Pedidos         │
         │  - Muestra estado     │  │  - Tabla global actualizada │
         │  - Verde/Rojo visual  │  │  - Verde=Confirmado         │
         └───────────────────────┘  │  - Rojo=Rechazado           │
                                     │  - Timer elimina después    │
                                     │    de 5 horas               │
                                     └─────────────────────────────┘
```

---

## 🎨 Códigos de Color por Estado

| Estado        | Color de Fondo | Color de Badge      | Borde               | Descripción                          |
|---------------|----------------|---------------------|---------------------|--------------------------------------|
| **Confirmado**| `bg-green-50`  | `bg-green-100`      | `border-green-500`  | ✅ Camarero confirmó asistencia      |
| **Enviado**   | `bg-orange-50` | `bg-orange-100`     | `border-orange-500` | ⏳ Mensaje enviado, esperando resp. |
| **Rechazado** | `bg-red-50`    | `bg-red-100`        | `border-red-500`    | ❌ Rechazó, se elimina en 5h         |
| **Pendiente** | `bg-white`     | `bg-gray-100`       | `border-gray-300`   | ⚪ Sin enviar aún                    |
| **Faltante**  | `bg-white`     | `bg-red-50`         | `border-red-100`    | 🔴 Vacante sin asignar               |

---

## 📊 Tabla Global de Asignaciones

### Características Principales:

1. **Alternancia de Colores por Evento**:
   - Eventos pares: `bg-gray-50`
   - Eventos impares: `bg-blue-50/30`
   - Faltantes siempre en blanco: `bg-white`

2. **Identificación de Segundos Turnos**:
   - Badge morado: `2º Turno` (`bg-purple-100 text-purple-700`)

3. **Edición de Hora de Salida Individual**:
   - Cada camarero tiene su propia hora de salida editable
   - Se guarda automáticamente con debounce de 1 segundo
   - Calcula y muestra horas trabajadas en tiempo real

4. **Estados Visuales**:
   - ✅ Confirmado: Badge verde
   - ⏳ Enviado: Badge amarillo/naranja
   - ❌ Rechazado: Badge rojo (bold)
   - ⚪ Pendiente: Badge gris
   - 🔴 Vacante: Texto rojo italic

---

## 🔧 Funcionalidades de Testing

### Para Verificar Sincronización:

1. **Test de Aceptación**:
   ```
   1. Crear un pedido
   2. Asignar camareros
   3. Enviar mensaje
   4. Hacer clic en enlace ACEPTAR
   5. Verificar que aparece en VERDE en Gestión de Pedidos
   6. Verificar que el estado es 'Confirmado' en ambas vistas
   ```

2. **Test de Rechazo**:
   ```
   1. Crear un pedido
   2. Asignar camareros
   3. Enviar mensaje
   4. Hacer clic en enlace RECHAZAR
   5. Verificar que aparece en ROJO en Gestión de Pedidos
   6. Verificar que el estado es 'Rechazado'
   7. Esperar 5 horas (o cambiar timer para testing)
   8. Verificar que se elimina automáticamente
   ```

3. **Test de Chat Grupal Automático**:
   ```
   1. Crear pedido con múltiples camareros
   2. Hacer que TODOS acepten el servicio
   3. Verificar que se crea el chat grupal automáticamente
   4. Verificar notificación al coordinador
   ```

---

## 🚨 Cambios Importantes Implementados

### ✅ Corrección del Endpoint `/no-confirmar/:token`

**ANTES** (Comportamiento inconsistente):
```typescript
// Eliminaba inmediatamente al camarero
const asignaciones = pedido.asignaciones.filter(a => a.camareroId !== camareroId);
```

**DESPUÉS** (Comportamiento consistente):
```typescript
// Marca como rechazado y programa eliminación en 5 horas
const asignaciones = pedido.asignaciones.map(a => 
  a.camareroId === camareroId ? { 
    ...a, 
    estado: 'rechazado',
    eliminacionProgramada: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString()
  } : a
);
```

**Beneficios**:
- ✅ Consistencia: Todos los rechazos se manejan igual (5 horas de espera)
- ✅ Tiempo de reacción: Coordinador tiene 5 horas para encontrar reemplazo
- ✅ Visibilidad: El camarero rechazado sigue visible en rojo
- ✅ Control: Puede cancelarse manualmente antes de las 5 horas

---

## 📝 Notas Técnicas

### Timer de Eliminación:
```typescript
// Se ejecuta cada minuto en gestion-pedidos.tsx
useEffect(() => {
  const verificarEliminaciones = async () => {
    const ahora = new Date();
    // Revisa cada asignación rechazada
    // Si ahora >= eliminacionProgramada → ELIMINA
  };
  
  const intervalo = setInterval(verificarEliminaciones, 60000); // 60 segundos
  verificarEliminaciones(); // Ejecutar inmediatamente al montar
  
  return () => clearInterval(intervalo);
}, [uniquePedidos, baseUrl, publicAnonKey, cargarDatos]);
```

### Estructura de Asignación:
```typescript
interface Asignacion {
  camareroId: string;
  camareroNombre: string;
  camareroNumero: number;
  estado: '' | 'enviado' | 'confirmado' | 'rechazado';
  turno: 1 | 2;
  horaEntrada: string;
  horaSalida: string;
  eliminacionProgramada?: string; // ISO 8601 timestamp
}
```

---

## ✅ Checklist de Sincronización

- [x] Enlace ACEPTAR → Estado 'confirmado' en backend
- [x] Enlace RECHAZAR → Estado 'rechazado' con timer de 5 horas
- [x] Gestión de Pedidos muestra confirmados en VERDE
- [x] Gestión de Pedidos muestra rechazados en ROJO
- [x] Rechazados se eliminan automáticamente después de 5 horas
- [x] Tabla Global sincronizada con estados actualizados
- [x] Vista de detalle de pedido sincronizada
- [x] Envío de Mensajes sincronizado con Gestión de Pedidos
- [x] Chat grupal se crea automáticamente cuando todos confirman
- [x] Notificaciones por WhatsApp al coordinador

---

## 🎉 Resultado Final

El sistema ahora está completamente sincronizado:

1. ✅ **Aceptar Servicio** → Verde en toda la interfaz
2. ❌ **Rechazar Servicio** → Rojo en toda la interfaz + eliminación automática en 5 horas
3. 🔄 **Sincronización automática** entre Envío de Mensajes y Gestión de Pedidos
4. 💬 **Chat grupal automático** cuando todos confirman
5. 📱 **Notificaciones en tiempo real** al coordinador

---

**Versión**: 1.0.0  
**Fecha**: 2026-02-18  
**Estado**: ✅ Completado y Testeado
