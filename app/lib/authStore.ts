import fs from 'fs/promises';
import path from 'path';

export type AuthUser = { email: string; password: string; name: string; organization: string };

export const ADMIN_EMAIL = 'owusueddie1@gmail.com';
export const ADMIN_PASSWORD = 'pintogee12';
export const JWT_SECRET = 'aura-demo-secret';

export const users = new Map<string, AuthUser>();
export const attempts = new Map<string, number>();
export const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string) {
  return password.trim().length >= 8;
}

export async function loadUsers() {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as AuthUser[];

    users.clear();
    parsed.forEach((item) => {
      if (!item?.email) return;
      users.set(normalizeEmail(item.email), { ...item, email: normalizeEmail(item.email) });
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Failed to load users', error);
    }
  }
}

export async function persistUsers() {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(Array.from(users.values()), null, 2), 'utf8');
}

export async function findUser(email: string) {
  await loadUsers();
  return users.get(normalizeEmail(email));
}

export async function saveUser(user: AuthUser) {
  await loadUsers();
  users.set(normalizeEmail(user.email), { ...user, email: normalizeEmail(user.email) });
  await persistUsers();
}
