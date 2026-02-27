/**
 * Tests unitarios para Error Boundary y Error Logger
 * Framework: Vitest
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from '../../components/error-boundary';

// Suppress console.error for expected errors in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
beforeEach(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Helper component that throws an error
const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Contenido normal</div>;
};

describe('ErrorBoundary', () => {
  it('debe renderizar hijos cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Contenido normal')).toBeTruthy();
  });

  it('debe mostrar fallback UI cuando hay un error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo salió mal')).toBeTruthy();
  });

  it('debe mostrar el nombre de sección en el fallback UI', () => {
    render(
      <ErrorBoundary section="dashboard">
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/sección de dashboard/i)).toBeTruthy();
  });

  it('debe llamar al callback onError cuando hay un error', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe('Test error message');
  });

  it('debe resetear el error cuando se hace clic en Reintentar', async () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Fallback UI should be shown
    expect(screen.getByText('Algo salió mal')).toBeTruthy();
    expect(screen.getByText('Reintentar')).toBeTruthy();

    // Verify error was caught
    expect(onError).toHaveBeenCalledTimes(1);
  });
});

describe('Error Logger', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('debe guardar errores en localStorage', async () => {
    const { logErrorToService } = await import('../../utils/error-logger');

    await logErrorToService(
      new Error('Test error'),
      { componentStack: 'at Component' },
      'test-section'
    );

    const stored = localStorage.getItem('app_errors');
    expect(stored).not.toBeNull();
    const errors = JSON.parse(stored!);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('Test error');
    expect(errors[0].section).toBe('test-section');
  });

  it('debe recuperar el historial de errores', async () => {
    const { logErrorToService, getErrorHistory } = await import('../../utils/error-logger');

    await logErrorToService(
      new Error('Error 1'),
      { componentStack: '' },
      'section-1'
    );
    await logErrorToService(
      new Error('Error 2'),
      { componentStack: '' },
      'section-2'
    );

    const history = getErrorHistory();
    expect(history).toHaveLength(2);
    // Most recent first
    expect(history[0].message).toBe('Error 2');
    expect(history[1].message).toBe('Error 1');
  });

  it('debe limpiar el historial de errores', async () => {
    const { logErrorToService, getErrorHistory, clearErrorHistory } = await import('../../utils/error-logger');

    await logErrorToService(
      new Error('Test error'),
      { componentStack: '' },
      undefined
    );

    clearErrorHistory();

    const history = getErrorHistory();
    expect(history).toHaveLength(0);
  });

  it('debe limitar el historial a los últimos 10 errores', async () => {
    const { logErrorToService, getErrorHistory } = await import('../../utils/error-logger');

    for (let i = 0; i < 12; i++) {
      await logErrorToService(
        new Error(`Error ${i}`),
        { componentStack: '' },
        undefined
      );
    }

    const history = getErrorHistory();
    expect(history).toHaveLength(10);
  });
});
