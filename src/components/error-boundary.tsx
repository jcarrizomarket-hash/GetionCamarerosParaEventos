import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logErrorWithContext, type ErrorContext } from '../src/utils/error-handler';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional section name for better error context (e.g. 'Dashboard', 'Pedidos') */
  name?: string;
  fallback?: ReactNode | ((error: Error, reset: () => void, ctx: ErrorContext | null) => ReactNode);
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorContext: ErrorContext | null;
}

/**
 * Error Boundary para capturar errores de renderizado en React
 * Muestra un UI alternativo en lugar de un pantalla en blanco
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorContext: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const ctx = logErrorWithContext(error, this.props.name ?? 'ErrorBoundary', {
      componentStack: errorInfo.componentStack ?? undefined,
    });
    this.setState({ errorContext: ctx });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorContext: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const { error, errorContext } = this.state;

      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(error, this.handleReset, errorContext);
        }
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={error}
          errorContext={errorContext}
          onRetry={this.handleReset}
          section={this.props.name}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  errorContext: ErrorContext | null;
  onRetry: () => void;
  section?: string;
}

/**
 * Componente de fallback reutilizable para mostrar errores con detalles y botón de reintento
 */
export function ErrorFallback({ error, errorContext, onRetry, section }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8 bg-red-50 border border-red-200 rounded-lg">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold text-red-700 mb-2">
        {section ? `Error en ${section}` : 'Algo salió mal'}
      </h2>
      <p className="text-red-600 text-sm mb-4 text-center max-w-md">
        {error.message || 'Ha ocurrido un error inesperado.'}
      </p>
      {errorContext && (
        <p className="text-red-400 text-xs mb-4 font-mono">
          ID: {errorContext.errorId} · {errorContext.category}
        </p>
      )}
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}

export default ErrorBoundary;
