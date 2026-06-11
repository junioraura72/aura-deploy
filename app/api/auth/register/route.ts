import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { attempts, findUser, isValidEmail, isValidPassword, normalizeEmail, saveUser } from '../../../lib/authStore';

export async function POST(req: Request) {
  const { email, password, name, organization } = await req.json();
  const ip = req.headers.get('x-forwarded-for') || 'local';
  const count = (attempts.get(ip) || 0) + 1;
  attempts.set(ip, count);
  if (count > 8) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const safeEmail = normalizeEmail(String(email || ''));
  const safePassword = String(password || '');
  const safeName = String(name || '').trim();

  if (!isValidEmail(safeEmail) || !isValidPassword(safePassword) || !safeName) {
    return NextResponse.json({ error: 'Use a valid email, a password of at least 8 characters, and a name.' }, { status: 400 });
  }
  if (await findUser(safeEmail)) {
    return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
  }

  const hash = await bcrypt.hash(safePassword, 10);
  await saveUser({ email: safeEmail, password: hash, name: safeName, organization: String(organization || 'Unknown').trim() });
  return NextResponse.json({ ok: true, email: safeEmail });
}
