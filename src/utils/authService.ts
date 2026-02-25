import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getToken } from './tokenManager';
import type { LoginCredentials, AuthResponse } from '../types/auth';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;

function getHeaders(authenticated = false): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': publicAnonKey,
    'Authorization': `Bearer ${publicAnonKey}`,
  };
  if (authenticated) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.error || `HTTP ${res.status}` } as T;
  }
  return res.json();
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthResponse>(res);
  } catch (err) {
    return { success: false, error: 'Error de conexión' };
  }
}

export async function socialLogin(provider: string, idToken: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${BASE_URL}/auth/social-login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ provider, idToken }),
    });
    return handleResponse<AuthResponse>(res);
  } catch {
    return { success: false, error: 'Error de conexión' };
  }
}

export async function forgotPassword(email: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse<AuthResponse>(res);
  } catch {
    return { success: false, error: 'Error de conexión' };
  }
}

export async function verifyResetToken(token: string): Promise<{ success: boolean; tempPassword?: string; expiresAt?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/auth/verify-reset-token`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ token }),
    });
    return handleResponse<{ success: boolean; tempPassword?: string; expiresAt?: string }>(res);
  } catch {
    return { success: false };
  }
}

export async function resetPassword(token: string, tempPassword: string, newPassword: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ token, tempPassword, newPassword }),
    });
    return handleResponse<AuthResponse>(res);
  } catch {
    return { success: false, error: 'Error de conexión' };
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse<AuthResponse>(res);
  } catch {
    return { success: false, error: 'Error de conexión' };
  }
}

export async function logout(): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(true),
    });
    return handleResponse<{ success: boolean }>(res);
  } catch {
    return { success: false };
  }
}
