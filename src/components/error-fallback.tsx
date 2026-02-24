import React, { FC } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  section?: string;
  onReset: () => void;
}

/**
 * Fallback UI para mostrar cuando hay error
 */
export const ErrorFallback: FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  section,
  onReset,
}) => {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          <AlertTriangle className="w-12 h-12 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Algo salió mal
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-center">
          {section
            ? `Se produjo un error en la sección de ${section}`
            : 'Se produjo un error inesperado'}
        </p>

        {/* Error Details (Development Only) */}
        {isDevelopment && error && (
          <div className="bg-gray-100 rounded p-3 space-y-2">
            <p className="font-mono text-sm font-semibold text-gray-900">
              {error.name}: {error.message}
            </p>
            {errorInfo?.componentStack && (
              <details className="cursor-pointer">
                <summary className="text-xs text-gray-600 hover:text-gray-900">
                  Stack trace
                </summary>
                <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-40">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <button
            onClick={onReset}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>

          <button
            onClick={() => {
              onReset();
              window.location.href = '/';
            }}
            className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </button>

          {isDevelopment && (
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-semibold text-sm"
            >
              Recargar página
            </button>
          )}
        </div>

        {/* Support */}
        <div className="bg-blue-50 rounded p-3 text-sm text-gray-600">
          <p>
            Si el problema persiste, por favor contacta al equipo de soporte.
          </p>
          <a
            href="mailto:soporte@example.com"
            className="text-blue-600 hover:underline font-semibold"
          >
            soporte@example.com
          </a>
        </div>

        {/* Error ID for support */}
        {isDevelopment && (
          <div className="text-xs text-gray-400 text-center pt-2">
            Error ID: {Date.now()}
          </div>
        )}
      </div>
    </div>
  );
};
