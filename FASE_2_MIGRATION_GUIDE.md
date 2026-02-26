# FASE 2 – Guía de Migración: Context API + useReducer

## Objetivo

Migrar de prop drilling a Context API + `useReducer` para estado global centralizado y mejor arquitectura.

---

## Arquitectura Resultante

```
App.tsx (raíz simple)
  ↓
AppProvider (context/AppContext.tsx)
  ↓
MainLayout (components/layout/MainLayout.tsx)
  ├─ loadAllData (services/dataService.ts)
  │   ├─ loadCamareros() → dispatch SET_CAMAREROS
  │   ├─ loadPedidos()   → dispatch SET_PEDIDOS
  │   ├─ loadCoordinadores() → dispatch SET_COORDINADORES
  │   └─ loadClientes()  → dispatch SET_CLIENTES
  │
  └─ Componentes (sin props de datos)
      ├─ usePedidos()       – acceso directo a pedidos
      ├─ useCamareros()     – acceso directo a camareros
      ├─ useCoordinadores() – acceso directo a coordinadores
      └─ useClientes()      – acceso directo a clientes
```

---

## Timeline de Migración

| Fase | Semana | Tareas |
|------|--------|--------|
| 2a | 1 | ✅ Implementar Context + Reducers (completado) |
| 2b | 2 | Migrar componentes críticos (Pedidos, Camareros, Admin) |
| 2c | 3 | Migrar componentes secundarios (Informes, Envíos, Configuración) |

---

## Ejemplo Práctico de Migración

### ANTES

```typescript
interface CamarerosProps {
  camareros: any[];
  setCamareros: (c: any[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void;
}

export function Camareros({
  camareros,
  setCamareros,
  baseUrl,
  publicAnonKey,
  cargarDatos,
}: CamarerosProps) {
  // ...
}
```

### DESPUÉS

```typescript
import { useCamareros } from '../context/AppContext';

export function Camareros() {
  const { camareros, setCamareros } = useCamareros();
  // Datos accesibles directamente, sin props
}
```

---

## Checklist de Completitud

### Fase 2a (implementada)

- [x] `src/context/AppContext.tsx` – AppState, AppAction, appReducer, AppProvider, hooks
- [x] `src/services/dataService.ts` – loadAllData, loadCamareros, loadPedidos, loadCoordinadores, loadClientes
- [x] `src/components/layout/MainLayout.tsx` – Layout con carga de datos y navegación por tabs
- [x] `src/components/loading-spinner.tsx` – Spinner reutilizable (ya existía)
- [x] `src/App.tsx` – Simplificado a AppProvider + MainLayout

### Fase 2b (pendiente)

- [ ] Migrar `Pedidos` para usar `usePedidos()` en lugar de props
- [ ] Migrar `Camareros` para usar `useCamareros()` en lugar de props
- [ ] Migrar `Admin` para usar `useCoordinadores()` en lugar de props
- [ ] Eliminar props de datos de los componentes migrados

### Fase 2c (pendiente)

- [ ] Migrar `Dashboard` para usar hooks del contexto
- [ ] Migrar `Informes` para usar hooks del contexto
- [ ] Migrar `Envios` para usar hooks del contexto
- [ ] Migrar `Configuracion` para usar hooks del contexto

---

## Hooks Disponibles

| Hook | Datos disponibles |
|------|-------------------|
| `useAppContext()` | `state`, `dispatch` (acceso completo) |
| `usePedidos()` | `pedidos`, `loading`, `setPedidos` |
| `useCamareros()` | `camareros`, `loading`, `setCamareros` |
| `useCoordinadores()` | `coordinadores`, `loading`, `setCoordinadores` |
| `useClientes()` | `clientes`, `loading`, `setClientes` |

---

## Acciones del Reducer

| Acción | Payload | Descripción |
|--------|---------|-------------|
| `SET_LOADING` | `boolean` | Activa/desactiva spinner global |
| `SET_ERROR` | `string \| null` | Establece mensaje de error global |
| `SET_CAMAREROS` | `any[]` | Reemplaza la lista de camareros |
| `SET_PEDIDOS` | `any[]` | Reemplaza la lista de pedidos |
| `SET_COORDINADORES` | `any[]` | Reemplaza la lista de coordinadores |
| `SET_CLIENTES` | `any[]` | Reemplaza la lista de clientes |
| `SET_ALL_DATA` | `AllData` | Reemplaza todos los datos de una vez |

---

## Tips y Mejores Prácticas

1. **Usar hooks especializados** en lugar de `useAppContext()` directamente cuando solo se necesita un tipo de dato.
2. **`cargarDatos()` en MainLayout** se encarga de cargar todos los datos; los componentes hijos no deben hacer fetch de datos que ya están en el contexto.
3. **Cleanup en useEffect** – `MainLayout` usa un flag `cancelled` para evitar actualizaciones de estado tras el desmontaje.
4. **Errores globales** – Si `loadAllData` falla, `MainLayout` muestra un mensaje de error con botón de reintento.
5. **Actualizaciones parciales** – Los componentes pueden despachar `SET_CAMAREROS` (etc.) sin recargar todos los datos si solo modifican un recurso.

---

## Testing Post-Migración

```bash
# Verificar tipos
npx tsc --noEmit

# Ejecutar aplicación en desarrollo
npm run dev

# Verificar en DevTools
# React DevTools → Components → AppProvider → state
# Debería mostrar: camareros[], pedidos[], coordinadores[], clientes[], loading, error
```

### Criterios de Aceptación

- [ ] `npm run build` sin errores
- [ ] `npm run dev` ejecuta sin errores
- [ ] Datos cargan correctamente al inicio
- [ ] No hay `console.error` en DevTools
- [ ] Props de datos eliminadas de los componentes migrados
- [ ] Todos los componentes migrados usan hooks del contexto
