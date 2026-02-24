/**
 * Tests unitarios para ErrorBoundary
 * Framework: Vitest + @testing-library/react
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Componente que lanza un error para tests
function BrokenComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Error de prueba');
  }
  return <div>Componente funcionando</div>;
}

// Suprimir console.error en tests para mantener la salida limpia
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

describe('ErrorBoundary', () => {
  it('debe renderizar hijos cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Componente funcionando')).toBeTruthy();
  });

  it('debe mostrar la UI de error cuando un hijo lanza una excepción', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo salió mal')).toBeTruthy();
    expect(screen.getByText('Error de prueba')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Recargar página' })).toBeTruthy();
  });

  it('debe registrar el error en la consola mediante componentDidCatch', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('debe mostrar el fallback personalizado si se proporciona', () => {
    render(
      <ErrorBoundary fallback={<div>Fallback personalizado</div>}>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Fallback personalizado')).toBeTruthy();
  });

  it('debe llamar a window.location.reload al hacer clic en el botón', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Recargar página' }));
    expect(reloadMock).toHaveBeenCalledOnce();
  });
});
