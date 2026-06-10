import { NextResponse } from 'next/server';

const replies: Record<string, string> = {
  status: 'Elsie: All core systems are online and treasury is ready for demo activity.',
  briefing: 'Elsie: Briefing ready: pipeline is healthy, revenue is up, and risk remains low.',
  credits: 'Elsie: You have 12 demo credits remaining for this session.'
};

export async function POST(req: Request) {
  const { message } = await req.json();
  const text = String(message || '').trim().toLowerCase();
  const reply = replies[text] || 'Elsie: I can help with status, briefing, or credits.';
  return NextResponse.json({ reply, command: text });
}
