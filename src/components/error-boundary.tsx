import React, { ReactNode, ErrorInfo } from 'react';
import { ErrorFallback } from './error-fallback';
import { logErrorToService } from '../utils/error-logger';

interface Props {
  children: ReactNode;
  section?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary para atrapar errores en componentes React
 * Muestra fallback UI en caso de error
 */
export class ErrorBoundary extends React.Component<Props, State> {
  private errorTimestamps: number[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Throttle error logging (máximo 5 errores por segundo)
    const now = Date.now();
    this.errorTimestamps = this.errorTimestamps.filter(t => now - t < 1000);

    if (this.errorTimestamps.length < 5) {
      this.errorTimestamps.push(now);

      // Log to service
      logErrorToService(error, errorInfo, this.props.section);

      // Call custom handler if provided
      this.props.onError?.(error, errorInfo);
    }

    // Log to console en desarrollo
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.errorTimestamps = [];
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          section={this.props.section}
          onReset={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}
