interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-4',
};

/**
 * Spinner de carga reutilizable
 */
export function LoadingSpinner({ size = 'md', message, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${SIZE_CLASSES[size]} border-blue-200 border-t-blue-600 rounded-full animate-spin`}
        role="status"
        aria-label="Cargando..."
      />
      {message && (
        <p className="text-gray-500 text-sm">{message}</p>
      )}
    </div>
  );
}

export default LoadingSpinner;
