import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  console.log('GEMINI key loaded:', !!GEMINI_API_KEY);

  const { message } = await req.json();
  const text = String(message || '').trim().toLowerCase();

  if (!GEMINI_API_KEY) {
    return NextResponse.json({
      reply: 'Elsie: Gemini is not configured yet. Set GEMINI_API_KEY to enable AI responses.',
      command: text,
      fallback: true
    }, { status: 503 });
  }

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
  } catch (error) {
    console.error('Elsie Gemini error:', error);
    return NextResponse.json({
      reply: 'Elsie: Gemini is unavailable right now, but the deploy path is active.',
      command: text,
      fallback: true
    }, { status: 502 });
  }
}
