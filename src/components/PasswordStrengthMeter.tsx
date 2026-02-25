import React, { useEffect } from 'react';
import { usePasswordStrength } from '../hooks/usePasswordStrength';

interface PasswordStrengthMeterProps {
  password: string;
}

const REQUIREMENTS = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Al menos 1 letra mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Al menos 1 letra minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Al menos 1 número', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Al menos 1 carácter especial (!@#$%^&*)', test: (p: string) => /[!@#$%^&*]/.test(p) },
];

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { strength, checkStrength, getStrengthLabel, getStrengthColor } = usePasswordStrength();

  useEffect(() => {
    checkStrength(password);
  }, [password, checkStrength]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strength}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-600 w-20 text-right">{getStrengthLabel()}</span>
      </div>
      <ul className="space-y-1">
        {REQUIREMENTS.map(({ label, test }) => {
          const met = test(password);
          return (
            <li key={label} className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="font-bold">{met ? '✓' : '✗'}</span>
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
