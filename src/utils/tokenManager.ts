import { encrypt, decrypt } from './encryptionUtils';

const AUTH_TOKEN_KEY = 'auth_token';

export function saveToken(token: string, rememberMe?: boolean): void {
  const encrypted = encrypt(token);
  if (rememberMe) {
    localStorage.setItem(AUTH_TOKEN_KEY, encrypted);
  } else {
    localStorage.setItem(AUTH_TOKEN_KEY, encrypted);
  }
}

export function getToken(): string | null {
  const raw = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!raw) return null;
  const decrypted = decrypt(raw);
  return decrypted || null;
}

export function removeToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getTokenPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = getTokenPayload(token);
  if (!payload?.exp) return true;
  return Math.floor(Date.now() / 1000) >= payload.exp;
}
