import React from 'react';

interface SocialLoginButtonsProps {
  onSocialLogin: (provider: string) => Promise<void>;
  isLoading?: boolean;
}

const PROVIDERS = [
  { id: 'google', label: 'Google', colorClass: 'bg-red-500 hover:bg-red-600' },
  { id: 'facebook', label: 'Facebook', colorClass: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'microsoft', label: 'Microsoft', colorClass: 'bg-gray-700 hover:bg-gray-800' },
];

export default function SocialLoginButtons({ onSocialLogin, isLoading = false }: SocialLoginButtonsProps) {
  return (
    <div className="space-y-2">
      {PROVIDERS.map(({ id, label, colorClass }) => (
        <button
          key={id}
          type="button"
          disabled={isLoading}
          onClick={() => onSocialLogin(id)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorClass}`}
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : null}
          Continuar con {label}
        </button>
      ))}
    </div>
  );
}
