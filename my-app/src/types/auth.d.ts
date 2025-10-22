export interface AuthError {
  code?: string;
  message: string;
  status?: number;
}

export interface AuthContext {
  error: AuthError;
}

export interface VerificationError extends Error {
  message: string;
  code?: string;
  status?: number;
}