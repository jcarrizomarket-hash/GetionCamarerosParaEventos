# Panel de Administración - Altas de Personal

## Resumen de Cambios

Se ha reorganizado y mejorado la sección de administración de la aplicación, cambiando la pestaña "Coordinadores" por "Admin" y agregando una nueva funcionalidad de gestión de altas de personal.

## Cambios Principales

### 1. Nueva Pestaña "Admin"
- **Antes**: Pestaña "Coordinadores" con ícono UserPlus
- **Ahora**: Pestaña "Admin" con ícono Shield
- Mejor organización jerárquica y visual

### 2. Nuevo Componente Admin (`/components/admin.tsx`)
El componente Admin incluye dos sub-secciones mediante pestañas:

#### Sub-sección: Coordinadores
- Gestión completa de coordinadores (funcionalidad existente)
- Crear, editar y eliminar coordinadores
- Campos: Nombre, Teléfono, Email
- Interfaz mejorada con mejor diseño visual

#### Sub-sección: Altas ⭐ NUEVA
Sistema completo de visualización y gestión de personal asignado a eventos confirmados.

**Características principales:**

1. **Tabla Detallada de Altas**
   - Fecha (formato español)
   - Día de la semana
   - Cliente
   - Evento
   - Código de Perfil (CAM001, COC001, etc.)
   - Nombre del Perfil (Nombre completo del personal)
   - Estado (Confirmado)
   - Botones de Acción (Alta y Baja)

2. **Sistema de Filtros**
   - Filtro por rango de fechas (Desde/Hasta)
   - Filtro por cliente (búsqueda de texto)
   - Botón "Mostrar/Ocultar Filtros" para mejor UX
   - Botón "Limpiar Filtros"
   - Contador de registros filtrados

3. **Exportación Excel**
   - Generación de archivos .xlsx (Excel real)
   - **Auto-filtros activados en todas las columnas** ✨
   - Ajuste automático del ancho de columnas para mejor legibilidad
   - Respeta los filtros aplicados en la interfaz
   - Descarga automática con nombre descriptivo: `altas_personal_YYYY-MM-DD.xlsx`
   - Nombre de hoja: "Altas Personal"

4. **Acciones sobre el Personal**
   - **Botón Alta** (verde): Preparado para desarrollo futuro, muestra mensaje "En desarrollo"
   - **Botón Baja** (rojo): Preparado para desarrollo futuro, muestra mensaje "En desarrollo"

## Estructura de Datos

### Origen de los datos de Altas
Los datos se generan dinámicamente procesando:
- **Pedidos**: Todos los eventos del sistema
- **Asignaciones**: Personal asignado a cada evento
- **Estado**: Solo se muestran asignaciones con estado "confirmado"
- **Personal**: Se obtiene la información completa del camarero/personal

### Formato de cada registro:
```typescript
{
  id: string,                    // Combinación pedidoId-camareroId
  fecha: string,                 // YYYY-MM-DD
  fechaFormateada: string,       // DD/MM/YYYY
  dia: string,                   // Lunes, Martes, etc.
  cliente: string,               // Nombre del cliente
  evento: string,                // Tipo de evento
  codigoPerfil: string,          // CAM001, COC001, etc.
  nombrePerfil: string,          // Nombre completo
  estado: string,                // 'confirmado'
  turno: string,                 // Turno asignado
  camareroId: string,           // ID del camarero
  pedidoId: string,             // ID del pedido/evento
  estadoAlta: string            // 'activo' por defecto
}
```

## Interfaz de Usuario

### Diseño Visual
- Uso de Tailwind CSS para un diseño moderno y responsivo
- Tablas con hover effects para mejor usabilidad
- Badges de colores para estados (verde para confirmado)
- Botones con iconos de Lucide React
- Panel de filtros colapsable con fondo gris claro
- Separadores y bordes sutiles para mejor organización

### Colores y Estados
- **Verde**: Botón Alta, estado Confirmado
- **Rojo**: Botón Baja, estado Rechazado (cuando aplique)
- **Azul**: Códigos de perfil
- **Gris**: Elementos secundarios y filtros

## Funcionalidades Técnicas

### Memoización y Performance
- Uso de `useMemo` para optimizar cálculos pesados
- Deduplicación de datos automática
- Filtrado eficiente de grandes volúmenes de datos
- Re-renderizado controlado

### Integración con Backend
- Actualización de estados mediante API REST
- Uso correcto de `baseUrl` y `publicAnonKey`
- Función `cargarDatos()` para refrescar datos después de cambios
- Manejo de errores con mensajes al usuario

### Exportación Excel
- Generación de archivos .xlsx (Excel real)
- **Auto-filtros activados en todas las columnas** ✨
- Ajuste automático del ancho de columnas para mejor legibilidad
- Respeta los filtros aplicados en la interfaz
- Descarga automática con nombre descriptivo: `altas_personal_YYYY-MM-DD.xlsx`
- Nombre de hoja: "Altas Personal"

## Archivos Modificados

1. **`/App.tsx`**
   - Importación del nuevo componente `Admin`
   - Cambio de tab "coordinadores" por "admin"
   - Actualización del ícono (Shield en lugar de UserPlus)
   - Paso de props adicionales: `camareros` y `pedidos`

2. **`/components/admin.tsx`** (NUEVO)
   - Componente principal Admin con sub-pestañas
   - Componente CoordinadoresSection (migrado de coordinadores.tsx)
   - Lógica completa de gestión de altas
   - Sistema de filtros y exportación

3. **`/components/coordinadores.tsx`** (Deprecado, mantenido por compatibilidad)
   - El archivo original se mantiene pero ya no se usa
   - Toda la funcionalidad está ahora en admin.tsx

## Próximas Mejoras Sugeridas

1. **Funcionalidad del Botón Alta**
   - Implementar lógica específica según requerimientos
   - Posible conexión con sistema de nóminas o asistencia

2. **Filtros Adicionales**
   - Filtro por tipo de evento
   - Filtro por código de perfil
   - Filtro por estado de alta/baja

3. **Estadísticas de Altas**
   - Dashboard con métricas de altas/bajas
   - Gráficos de tendencias
   - Reportes automáticos

4. **Exportación Avanzada**
   - Formato Excel real (.xlsx) con estilos
   - Múltiples hojas de cálculo
   - Gráficos integrados

5. **Historial de Cambios**
   - Log de altas y bajas
   - Quién realizó cada cambio
   - Timestamp de modificaciones

## Testing

Para probar la nueva funcionalidad:

1. Navegar a la pestaña "Admin"
2. Seleccionar sub-pestaña "Altas"
3. Verificar que se muestran todos los eventos confirmados
4. Probar filtros de fecha y cliente
5. Exportar a Excel y verificar el archivo generado
6. Probar el botón "Baja" (cambia estado a rechazado)
7. Verificar actualización automática de datos

## Notas Importantes

- Solo se muestran asignaciones con estado "confirmado"
- La exportación respeta los filtros aplicados
- El botón "Baja" tiene confirmación para evitar errores
- Los datos se actualizan automáticamente después de cada cambio
- El sistema es completamente responsivo para móviles y tablets

---

**Versión**: 2.2
**Fecha**: 24 de febrero de 2026
**Estado**: ✅ Implementado y Funcional