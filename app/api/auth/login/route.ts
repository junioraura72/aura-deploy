import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET, attempts, findUser, isValidEmail, isValidPassword, normalizeEmail } from '../../../lib/authStore';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const ip = req.headers.get('x-forwarded-for') || 'local';
  const count = (attempts.get(ip) || 0) + 1;
  attempts.set(ip, count);
  if (count > 8) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const safeEmail = normalizeEmail(String(email || ''));
  const safePassword = String(password || '');

  if (!isValidEmail(safeEmail) || !isValidPassword(safePassword)) {
    return NextResponse.json({ error: 'Use a valid email and a password of at least 8 characters.' }, { status: 400 });
  }

  if (safeEmail === ADMIN_EMAIL && safePassword === ADMIN_PASSWORD) {
    const token = jwt.sign({ email: safeEmail, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    return NextResponse.json({ token, email: safeEmail, role: 'admin' });
  }

  const user = await findUser(safeEmail);
  if (!user || !(await bcrypt.compare(safePassword, user.password))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = jwt.sign({ email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
  return NextResponse.json({ token, email: user.email, role: 'user' });
}
