export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  role?: 'admin' | 'coordinador' | 'camarero';
}

/**
 * Union of all supported user roles.
 * Legacy values ('User', 'Admin') are kept for backward compatibility with
 * existing tokens; new code should use the lowercase domain roles.
 */
export type UserRole = 'admin' | 'coordinador' | 'camarero' | 'User' | 'Admin';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  details?: string[];
  expiresAt?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  signup: (credentials: SignUpCredentials) => Promise<AuthResponse>;
  socialLogin: (provider: string, idToken: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<AuthResponse>;
  resetPassword: (token: string, tempPassword: string, newPassword: string) => Promise<AuthResponse>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResponse>;
}
