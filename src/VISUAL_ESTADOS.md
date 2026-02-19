# 🎨 Referencia Visual: Estados y Colores

## Vista Rápida de Estados

Este documento muestra cómo se ve cada estado en la interfaz de usuario.

---

## 📊 Gestión de Pedidos - Vista de Detalle

### Estado: Confirmado ✅
```
┌────────────────────────────────────────────────────────┐
│  🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢           │
│                                                        │
│  👤 Juan Pérez (CAM001)                               │
│                                                        │
│  Turno: 1 | Entrada: 19:00 | Salida: 23:00           │
│                                                        │
│  [ Confirmado ]  🟢                                    │
│                                                        │
└────────────────────────────────────────────────────────┘
```
**Color de fondo**: Verde claro (`#f0fdf4`)  
**Color de borde**: Verde (`#22c55e`)  
**Badge**: Verde con texto verde oscuro

---

### Estado: Rechazado ❌
```
┌────────────────────────────────────────────────────────┐
│  🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴           │
│                                                        │
│  👤 María García (CAM002)                             │
│                                                        │
│  Turno: 1 | Entrada: 19:00 | Salida: 23:00           │
│                                                        │
│  [ RECHAZADO ]  🔴  (Se elimina en 5h)                │
│                                                        │
└────────────────────────────────────────────────────────┘
```
**Color de fondo**: Rojo claro (`#fef2f2`)  
**Color de borde**: Rojo (`#ef4444`)  
**Badge**: Rojo con texto rojo oscuro en **negrita**

---

### Estado: Enviado ⏳
```
┌────────────────────────────────────────────────────────┐
│  🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠           │
│                                                        │
│  👤 Carlos López (CAM003)                             │
│                                                        │
│  Turno: 2 | Entrada: 21:00 | Salida: 01:00           │
│                                                        │
│  [ Mensaje Enviado ]  ⏳                              │
│                                                        │
└────────────────────────────────────────────────────────┘
```
**Color de fondo**: Naranja claro (`#fff7ed`)  
**Color de borde**: Naranja (`#f97316`)  
**Badge**: Naranja con texto naranja oscuro

---

### Estado: Pendiente ⚪
```
┌────────────────────────────────────────────────────────┐
│  ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪           │
│                                                        │
│  👤 Ana Martínez (CAM004)                             │
│                                                        │
│  Turno: 1 | Entrada: 19:00 | Salida: 23:00           │
│                                                        │
│  [ Mensaje sin enviar ]  ⚪                           │
│                                                        │
└────────────────────────────────────────────────────────┘
```
**Color de fondo**: Blanco (`#ffffff`)  
**Color de borde**: Gris claro (`#d1d5db`)  
**Badge**: Gris con texto gris oscuro

---

## 📋 Tabla Global de Asignaciones

### Ejemplo Visual de Tabla:

```
╔═══════════╦═══════════════╦═════════════╦════════╦════════╦═══════╦═════════════════╦═════════════╗
║   Día     ║   Cliente     ║   Lugar     ║ Entrada║ Salida ║ Horas ║   Camarero      ║  Situación  ║
╠═══════════╬═══════════════╬═════════════╬════════╬════════╬═══════╬═════════════════╬═════════════╣
║ 18/02/26  ║ Hotel Ritz    ║ Barcelona   ║ 19:00  ║ 23:00  ║ 4h 0m ║ Juan Pérez      ║ 🟢 Confirmado║
╠═══════════╬═══════════════╬═════════════╬════════╬════════╬═══════╬═════════════════╬═════════════╣
║ 18/02/26  ║ Hotel Ritz    ║ Barcelona   ║ 19:00  ║ 23:00  ║ 4h 0m ║ María García    ║ 🔴 Rechazado ║
╠═══════════╬═══════════════╬═════════════╬════════╬════════╬═══════╬═════════════════╬═════════════╣
║ 19/02/26  ║ Museo MNAC    ║ Barcelona   ║ 20:00  ║ 01:00  ║ 5h 0m ║ Carlos López    ║ 🟠 Enviado   ║
╠═══════════╬═══════════════╬═════════════╬════════╬════════╬═══════╬═════════════════╬═════════════╣
║ 19/02/26  ║ Museo MNAC    ║ Barcelona   ║ 20:00  ║ --:--  ║   -   ║ -- Vacante --   ║ ⚪ Sin Asig  ║
╚═══════════╩═══════════════╩═════════════╩════════╩════════╩═══════╩═════════════════╩═════════════╝
```

### Alternancia de Colores por Evento:

```
Evento 1 (Hotel Ritz):
  🔵 Fila 1: Fondo gris claro (bg-gray-50)
  🔵 Fila 2: Fondo gris claro (bg-gray-50)

Evento 2 (Museo MNAC):
  🔷 Fila 3: Fondo azul claro (bg-blue-50/30)
  🔷 Fila 4: Fondo azul claro (bg-blue-50/30)

Faltantes/Vacantes:
  ⚪ Siempre fondo blanco (bg-white)
```

---

## 💬 Envío de Mensajes - Chat

### Mensaje del Coordinador:
```
┌────────────────────────────────────────────┐
│  Coordinador - 18:45                      │
│  ┌──────────────────────────────────────┐ │
│  │ 🔵 Miércoles, 18 de febrero de 2026  │ │
│  │    Hotel Ritz                        │ │
│  │    Barcelona, Paseo de Gracia 100    │ │
│  │    Hora de inicio: 19:00             │ │
│  │                                      │ │
│  │    Uniforme: CAMISA BLANCA           │ │
│  │                                      │ │
│  │    ✅ ACEPTAR: [enlace]              │ │
│  │    ❌ RECHAZAR: [enlace]             │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

### Respuesta: Aceptado ✅
```
┌────────────────────────────────────────────┐
│                      Juan Pérez - 18:50    │
│           ┌──────────────────────────────┐ │
│           │ ✅ He aceptado el servicio   │ │
│           │                          🟢 │ │
│           └──────────────────────────────┘ │
└────────────────────────────────────────────┘
```

### Respuesta: Rechazado ❌
```
┌────────────────────────────────────────────┐
│                    María García - 18:52    │
│           ┌──────────────────────────────┐ │
│           │ ❌ He rechazado el servicio  │ │
│           │    Seré eliminado en 5h  🔴 │ │
│           └──────────────────────────────┘ │
└────────────────────────────────────────────┘
```

---

## 🎯 Resumen de KPIs (Métricas)

### Panel Superior de Gestión de Pedidos:

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   📅 Eventos │   👥 Necesar │  ✅ Disponib │   ⏳ Enviados│  🟢 Confirmad│  🔴 Faltantes│
│              │              │              │              │              │              │
│      12      │      45      │      38      │      15      │      25      │       5      │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

**Colores de los KPIs**:
- Eventos: Azul (`bg-blue-50`)
- Necesarios: Morado (`bg-purple-50`)
- Disponibles: Gris (`bg-gray-50`)
- Enviados: Naranja (`bg-amber-50`)
- Confirmados: Verde (`bg-green-50`)
- Faltantes: Rojo (`bg-red-50`)

---

## 🔔 Página de Confirmación (Enlace Web)

### Al hacer clic en ACEPTAR:
```
┌────────────────────────────────────────────────────┐
│                                                    │
│                        ✓                           │
│                                                    │
│                   ¡Confirmado!                     │
│                                                    │
│   Has confirmado tu asistencia al evento          │
│   exitosamente.                                   │
│                                                    │
│   El coordinador ha sido notificado de tu         │
│   confirmación.                                   │
│                                                    │
│   Gracias por tu confirmación.                    │
│                                                    │
└────────────────────────────────────────────────────┘
```
**Color**: Verde (`#16a34a`)

---

### Al hacer clic en RECHAZAR:
```
┌────────────────────────────────────────────────────┐
│                                                    │
│                        ✗                           │
│                                                    │
│                  No Confirmado                     │
│                                                    │
│   Has indicado que no podrás asistir al evento.   │
│                                                    │
│   Serás eliminado automáticamente en 5 horas      │
│   si no se toma acción.                           │
│                                                    │
│   El coordinador ha sido notificado para          │
│   buscar un reemplazo.                            │
│                                                    │
│   Gracias por tu respuesta.                       │
│                                                    │
└────────────────────────────────────────────────────┘
```
**Color**: Naranja (`#ea580c`)

---

## 🎨 Paleta de Colores Completa

### Códigos Hex y Tailwind:

| Estado     | Fondo (Tailwind)     | Fondo (Hex)  | Texto (Tailwind)     | Texto (Hex) |
|------------|----------------------|--------------|----------------------|-------------|
| Confirmado | `bg-green-50`        | `#f0fdf4`    | `text-green-800`     | `#166534`   |
| Confirmado (badge) | `bg-green-100` | `#dcfce7`    | `text-green-800`     | `#166534`   |
| Confirmado (borde) | `border-green-500` | -      | -                    | `#22c55e`   |
| | | | | |
| Rechazado  | `bg-red-50`          | `#fef2f2`    | `text-red-800`       | `#991b1b`   |
| Rechazado (badge) | `bg-red-100`    | `#fee2e2`    | `text-red-800`       | `#991b1b`   |
| Rechazado (borde) | `border-red-500` | -         | -                    | `#ef4444`   |
| | | | | |
| Enviado    | `bg-orange-50`       | `#fff7ed`    | `text-orange-800`    | `#9a3412`   |
| Enviado (badge) | `bg-orange-100`  | `#ffedd5`    | `text-orange-800`    | `#9a3412`   |
| Enviado (borde) | `border-orange-500` | -       | -                    | `#f97316`   |
| | | | | |
| Pendiente  | `bg-white`           | `#ffffff`    | `text-gray-800`      | `#1f2937`   |
| Pendiente (badge) | `bg-gray-100`  | `#f3f4f6`    | `text-gray-800`      | `#1f2937`   |
| Pendiente (borde) | `border-gray-300` | -        | -                    | `#d1d5db`   |

---

## 📱 Responsive Design

### Desktop (>1024px):
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
├──────────────┬──────────────────────────────────────────────┤
│  LISTA DE    │  ÁREA DE GESTIÓN                             │
│  EVENTOS     │                                              │
│              │  - Información del evento                    │
│              │  - Lista de camareros asignados              │
│              │  - Estados visuales                          │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### Mobile (<768px):
```
┌─────────────────┐
│ HEADER          │
├─────────────────┤
│ LISTA DE        │
│ EVENTOS         │
│                 │
├─────────────────┤
│ ÁREA DE         │
│ GESTIÓN         │
│                 │
│ (Stacked)       │
│                 │
└─────────────────┘
```

---

## ✨ Animaciones y Transiciones

### Al cambiar de estado:
```
Estado anterior:  ⏳ Enviado (Naranja)
       ↓
   [Transición suave 300ms]
       ↓
Estado nuevo:     ✅ Confirmado (Verde)
```

### Al eliminar un rechazado:
```
Visible:     ❌ Rechazado (Rojo)
       ↓
[Fade out 500ms]
       ↓
Eliminado:   (Ya no aparece)
```

---

## 🔍 Indicadores Visuales Adicionales

### Segundo Turno:
```
Badge morado al lado de la hora de entrada:
[ 2º Turno ] 🟣
```
**Color**: Morado claro (`bg-purple-100 text-purple-700`)

### Tiempo Restante (Rechazados):
```
En hover sobre un rechazado:
"Se eliminará en: 4h 35m"
```

### Número de Confirmados vs. Requeridos:
```
Pedido completo:   ✅ 3/3 confirmados  (Verde)
Pedido incompleto: ⚠️ 2/3 confirmados  (Naranja)
```

---

## 📊 Estados en Diferentes Vistas

### Vista 1: Gestión de Pedidos (Sin selección)
- Calendario con eventos coloreados
- Lista de próximos eventos
- **Tabla Global de Asignaciones** ← Principal

### Vista 2: Gestión de Pedidos (Con selección)
- Detalle del evento
- Lista de camareros asignados con colores
- Dropdown para cambiar estado manualmente

### Vista 3: Envío de Mensajes
- Lista de eventos
- Chat individual con camarero
- Botones de Aceptar/Rechazar

### Vista 4: Chat Grupal
- Solo eventos donde TODOS confirmaron
- Lista de participantes
- Mensajes del grupo

---

**Última actualización**: 2026-02-18  
**Versión**: 1.0.0  
**Propósito**: Referencia visual para desarrollo y testing
