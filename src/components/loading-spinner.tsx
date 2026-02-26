import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<LoadingSpinnerProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

export function LoadingSpinner({ size = 'md', label, className = '' }: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
      role="status"
      aria-label={label ?? 'Cargando...'}
    >
      <Loader2 className={`animate-spin text-primary ${SIZE_CLASSES[size]}`} />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}

export default LoadingSpinner;
