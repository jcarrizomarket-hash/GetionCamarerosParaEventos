# 🔄 Ejemplo de Migración: Componente Real

Este documento muestra un ejemplo práctico de cómo migrar un componente existente para usar el nuevo cliente API, tipos TypeScript y helpers.

## 📝 Ejemplo: Componente de Gestión de Pedidos

### ❌ ANTES: Sin Estructura

```typescript
// components/mi-componente.tsx (ANTIGUO)
import { useState } from 'react';

export function MiComponente({ baseUrl, publicAnonKey }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ❌ Fetch directo con código duplicado
  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/pedidos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPedidos(result.data);
      } else {
        alert('Error al cargar pedidos: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };
  
  // ❌ Lógica de cálculo duplicada
  const calcularHorasTrabajadas = (entrada, salida) => {
    const [horaE, minE] = entrada.split(':').map(Number);
    const [horaS, minS] = salida.split(':').map(Number);
    const totalMin = (horaS * 60 + minS) - (horaE * 60 + minE);
    return totalMin / 60;
  };
  
  // ❌ Sin tipos, difícil de mantener
  const crearPedido = async (formData) => {
    try {
      const response = await fetch(`${baseUrl}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        await cargarPedidos();
        return true;
      } else {
        alert('Error: ' + result.error);
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear pedido');
      return false;
    }
  };
  
  return (
    <div>
      {loading && <p>Cargando...</p>}
      {pedidos.map(p => (
        <div key={p.id}>
          <h3>{p.cliente}</h3>
          <p>Horas: {calcularHorasTrabajadas(p.horaEntrada, p.horaSalida)}</p>
        </div>
      ))}
    </div>
  );
}
```

### ✅ DESPUÉS: Con Estructura Moderna

```typescript
// components/mi-componente.tsx (NUEVO)
import { useState, useEffect } from 'react';
import { getPedidos, createPedido } from '../src/api/client';
import { calcularHoras, formatearHoras, formatearFecha } from '../src/utils/helpers';
import type { Pedido } from '../src/types';

// ✅ Props tipadas
interface MiComponenteProps {
  onPedidoCreado?: (pedido: Pedido) => void;
}

export function MiComponente({ onPedidoCreado }: MiComponenteProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Cargar pedidos con cliente API
  const cargarPedidos = async () => {
    setLoading(true);
    setError(null);
    
    const resultado = await getPedidos();
    
    if (resultado.success && resultado.data) {
      setPedidos(resultado.data);
    } else {
      setError(resultado.error || 'Error al cargar pedidos');
    }
    
    setLoading(false);
  };
  
  // ✅ Crear pedido con tipos y validación
  const handleCrearPedido = async (formData: Omit<Pedido, 'id'>) => {
    const resultado = await createPedido(formData);
    
    if (resultado.success && resultado.data) {
      await cargarPedidos();
      onPedidoCreado?.(resultado.data);
      return true;
    } else {
      setError(resultado.error || 'Error al crear pedido');
      return false;
    }
  };
  
  // ✅ Cargar al montar
  useEffect(() => {
    cargarPedidos();
  }, []);
  
  // ✅ UI mejorada con manejo de estados
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        <span className="ml-3 text-gray-600">Cargando pedidos...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">❌ {error}</p>
        <button 
          onClick={cargarPedidos}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Pedidos</h2>
      
      {pedidos.length === 0 ? (
        <p className="text-gray-500">No hay pedidos registrados</p>
      ) : (
        <div className="grid gap-4">
          {pedidos.map(pedido => (
            <div 
              key={pedido.id} 
              className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg">{pedido.cliente}</h3>
              <p className="text-gray-600">{pedido.lugar}</p>
              <p className="text-sm text-gray-500">
                {formatearFecha(pedido.diaEvento)}
              </p>
              
              {/* ✅ Usar helpers para cálculos */}
              {pedido.horaSalida && (
                <p className="text-sm font-medium text-blue-600">
                  Horas: {formatearHoras(
                    calcularHoras(pedido.horaEntrada, pedido.horaSalida)
                  )}
                </p>
              )}
              
              {/* ✅ Información de asignaciones con tipos */}
              <div className="mt-2 flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {pedido.asignaciones.length} camareros
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  {pedido.asignaciones.filter(a => a.estado === 'confirmado').length} confirmados
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🎯 Mejoras Implementadas

### 1. **Types TypeScript** ✅
- Props del componente tipadas con interface
- Estado tipado: `useState<Pedido[]>`
- Parámetros de funciones tipados
- Autocompletado en el IDE
- Detección de errores en tiempo de desarrollo

### 2. **Cliente API Centralizado** ✅
- No más URLs hardcodeadas
- Manejo de errores consistente
- Headers automáticos
- Configuración centralizada
- Fácil de testear y mockear

### 3. **Helpers Reutilizables** ✅
- `calcularHoras()`: Testeado y reutilizable
- `formatearHoras()`: Formato consistente
- `formatearFecha()`: Localización española
- Sin duplicación de código
- Fácil de mantener

### 4. **Mejor UX** ✅
- Estados de loading explícitos
- Manejo de errores visible
- Botón de reintentar
- UI moderna con Tailwind
- Feedback visual claro

### 5. **Mantenibilidad** ✅
- Código más limpio y legible
- Fácil de testear
- Componentes más pequeños
- Separación de responsabilidades

## 🧪 Testing del Componente

### Test Unitario

```typescript
// tests/unit/mi-componente.spec.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MiComponente } from '../../components/mi-componente';
import * as apiClient from '../../src/api/client';

describe('MiComponente', () => {
  it('debe cargar y mostrar pedidos', async () => {
    // Mock del cliente API
    vi.spyOn(apiClient, 'getPedidos').mockResolvedValue({
      success: true,
      data: [
        {
          id: '1',
          cliente: 'Cliente Test',
          lugar: 'Lugar Test',
          // ... resto de campos
        }
      ]
    });
    
    render(<MiComponente />);
    
    // Verificar loading inicial
    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
    
    // Esperar a que cargue
    await waitFor(() => {
      expect(screen.getByText('Cliente Test')).toBeInTheDocument();
    });
  });
  
  it('debe mostrar error cuando falla la carga', async () => {
    // Mock de error
    vi.spyOn(apiClient, 'getPedidos').mockResolvedValue({
      success: false,
      error: 'Error de conexión'
    });
    
    render(<MiComponente />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error de conexión/i)).toBeInTheDocument();
    });
  });
});
```

### Test E2E

```typescript
// tests/e2e/mi-componente.spec.ts
import { test, expect } from '@playwright/test';

test('flujo completo de gestión de pedidos', async ({ page }) => {
  await page.goto('/');
  
  // Navegar al componente
  await page.click('text=Pedidos');
  
  // Esperar a que carguen los datos
  await page.waitForSelector('text=Pedidos');
  
  // Verificar que se muestran pedidos
  const pedidos = page.locator('[class*="grid"]').first();
  await expect(pedidos).toBeVisible();
  
  // Verificar información del pedido
  await expect(page.locator('text=/\\d+ camareros/')).toBeVisible();
  await expect(page.locator('text=/\\d+ confirmados/')).toBeVisible();
});
```

## 📊 Comparación de Código

| Aspecto | Antes ❌ | Después ✅ |
|---------|---------|-----------|
| **Líneas de código** | ~120 | ~100 |
| **Código duplicado** | Alto | Ninguno |
| **Type safety** | No | Completo |
| **Testeable** | Difícil | Fácil |
| **Manejo de errores** | Básico | Robusto |
| **UI feedback** | Mínimo | Completo |
| **Mantenibilidad** | Baja | Alta |

## 🔄 Proceso de Migración Paso a Paso

### Paso 1: Añadir Tipos
```typescript
import type { Pedido } from '../src/types';

interface MiComponenteProps {
  // Definir props
}
```

### Paso 2: Reemplazar Fetch por Cliente API
```typescript
// Antes:
const response = await fetch(`${baseUrl}/pedidos`, ...);

// Después:
const resultado = await getPedidos();
```

### Paso 3: Usar Helpers
```typescript
// Antes:
const [horaE, minE] = entrada.split(':').map(Number);
// ... lógica compleja ...

// Después:
const horas = calcularHoras(entrada, salida);
```

### Paso 4: Mejorar Manejo de Estados
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// UI condicional según estado
if (loading) return <Loading />;
if (error) return <Error mensaje={error} />;
```

### Paso 5: Añadir Tests
```typescript
// Test básico para verificar que no rompiste nada
it('debe renderizar sin errores', () => {
  render(<MiComponente />);
});
```

## 💡 Tips de Migración

1. **Migrar de Uno en Uno**: No intentes migrar todos los componentes a la vez
2. **Tests Primero**: Asegúrate de tener tests antes de refactorizar
3. **Commit Frecuente**: Haz commits pequeños y frecuentes
4. **Probar Manualmente**: Verifica que todo funciona después de cada cambio
5. **Pedir Revisión**: Si trabajas en equipo, pide que revisen tus cambios

## ✅ Checklist de Migración

- [ ] Tipos TypeScript añadidos
- [ ] Cliente API implementado
- [ ] Helpers utilizados para lógica común
- [ ] Manejo de errores mejorado
- [ ] Estados de loading añadidos
- [ ] UI mejorada con feedback visual
- [ ] Tests escritos
- [ ] Código probado manualmente
- [ ] Documentación actualizada
- [ ] Code review completado

## 🎓 Recursos de Aprendizaje

- **TypeScript**: https://www.typescriptlang.org/docs/handbook/intro.html
- **React + TypeScript**: https://react-typescript-cheatsheet.netlify.app/
- **Vitest**: https://vitest.dev/guide/
- **Playwright**: https://playwright.dev/docs/intro

---

**¿Dudas?** Consulta [ARCHITECTURE.md](./ARCHITECTURE.md) o [REFACTOR_GUIDE.md](./REFACTOR_GUIDE.md)
