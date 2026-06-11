import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/architect/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: 'manual-trigger' })
    });

    const data = await res.json();
    return NextResponse.json({ ok: true, status: res.status, data });
  } catch (err) {
    console.error('Architect trigger failed:', err);
    return NextResponse.json({ ok: false, error: 'Architect trigger failed' }, { status: 500 });
  }
}
