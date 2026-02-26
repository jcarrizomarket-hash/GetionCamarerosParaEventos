interface ApiErrorDisplayProps {
  error: string | null | undefined;
  onRetry?: () => void;
  className?: string;
}

/**
 * Componente para mostrar errores de la API de forma amigable
 */
export function ApiErrorDisplay({ error, onRetry, className = '' }: ApiErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className={`flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <span className="text-red-500 text-xl flex-shrink-0">❌</span>
      <div className="flex-1 min-w-0">
        <p className="text-red-700 text-sm font-medium">Error</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-red-700 underline hover:text-red-900 transition-colors"
          >
            Intentar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}

export default ApiErrorDisplay;
