import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '../utils/logger';

const log = logger.forContext('ErrorBoundary');
const isDev = import.meta.env?.DEV ?? false;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Componente de límite de error que captura errores de React en el árbol de componentes hijos,
 * registra el error y muestra una UI de fallback en lugar de una pantalla en blanco.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    log.error('Error capturado', {
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 bg-red-50 border border-red-200 rounded-lg m-4">
          <div className="text-red-600 text-xl mb-2">⚠️ Algo salió mal</div>
          <p className="text-red-700 text-sm mb-4 text-center max-w-md">
            Se produjo un error inesperado en esta sección.
            {isDev && this.state.error && (
              <span className="block mt-1 font-mono text-xs text-red-500">
                {this.state.error.message}
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
