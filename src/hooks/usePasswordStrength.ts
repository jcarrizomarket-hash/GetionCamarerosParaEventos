import { useState, useCallback } from 'react';
import { validatePasswordStrength, validatePasswordRequirements } from '../utils/authValidators';

export function usePasswordStrength() {
  const [strength, setStrength] = useState(0);
  const [requirements, setRequirements] = useState<{ valid: boolean; errors: string[] }>({ valid: false, errors: [] });

  const checkStrength = useCallback((password: string) => {
    setStrength(validatePasswordStrength(password));
    setRequirements(validatePasswordRequirements(password));
  }, []);

  const getStrengthLabel = (): string => {
    if (strength < 25) return 'Muy débil';
    if (strength < 50) return 'Débil';
    if (strength < 75) return 'Moderada';
    if (strength < 90) return 'Fuerte';
    return 'Muy fuerte';
  };

  const getStrengthColor = (): string => {
    if (strength < 25) return 'bg-red-500';
    if (strength < 50) return 'bg-orange-500';
    if (strength < 75) return 'bg-yellow-500';
    if (strength < 90) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return { strength, requirements, checkStrength, getStrengthLabel, getStrengthColor };
}
