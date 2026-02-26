import { AlertCircle, RefreshCw } from 'lucide-react';

interface ApiErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function ApiErrorDisplay({ error, onRetry, className = '' }: ApiErrorDisplayProps) {
  return (
    <div
      className={`flex flex-col items-center gap-3 p-4 rounded-md border border-destructive/30 bg-destructive/10 text-destructive ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{error}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-xs underline opacity-80 hover:opacity-100"
          type="button"
        >
          <RefreshCw className="h-3 w-3" />
          Reintentar
        </button>
      )}
    </div>
  );
}

export default ApiErrorDisplay;
