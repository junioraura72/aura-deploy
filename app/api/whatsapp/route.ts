import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('AURA agents loaded: Elsie, Architect | Gemini key:', !!process.env.GEMINI_API_KEY);
  if (!process.env.GEMINI_API_KEY) {
    console.error('CRITICAL: GEMINI_API_KEY missing in Netlify env vars');
    throw new Error('GEMINI_API_KEY not configured');
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
  const { message } = await req.json().catch(() => ({ message: '' }));
  const text = String(message || '').trim().toLowerCase();
  const prompt = `You are Elsie, AURA's WhatsApp assistant. Answer the user's request concisely and helpfully. User request: ${text || 'status, briefing, or credits'}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 180 }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Elsie: I can help with status, briefing, or credits.';

    return NextResponse.json({ reply, command: text, fallback: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('Gemini call failed:', message, stack);
    return NextResponse.json({
      reply: 'Error: Gemini API failed. Check GEMINI_API_KEY in Netlify env vars and redeploy with clear cache.',
      command: text,
      fallback: true
    }, { status: 502 });
  }
}
