export type AuthUser = { email: string; password: string; name: string; organization: string };

export const ADMIN_EMAIL = 'owusueddie1@gmail.com';
export const ADMIN_PASSWORD = 'pintogee12';
export const JWT_SECRET = 'aura-demo-secret';

export const users = new Map<string, AuthUser>();
export const attempts = new Map<string, number>();

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string) {
  return password.trim().length >= 8;
}
