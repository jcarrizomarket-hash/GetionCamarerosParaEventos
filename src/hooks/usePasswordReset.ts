import { useState } from 'react';
import * as authService from '../utils/authService';
import type { AuthResponse } from '../types/auth';

export function usePasswordReset() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const requestReset = async (email: string): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.forgotPassword(email);
      if (result.success) {
        setSuccess(true);
        startCountdown(60);
      } else {
        setError(result.error || 'Error al enviar el correo');
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
    setCountdown(0);
  };

  return { isLoading, error, success, countdown, requestReset, reset };
}
