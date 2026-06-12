import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message } = await req.json().catch(() => ({ message: '' }));
  const text = String(message || '').trim().toLowerCase();
  const prompt = `You are Elsie, AURA's WhatsApp assistant. Answer the user's request concisely and helpfully. User request: ${text || 'status, briefing, or credits'}`;

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 180,
    });

    const reply = completion.choices[0]?.message?.content || 'Elsie: I can help with status, briefing, or credits.';

    return NextResponse.json({ reply, command: text, fallback: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('Groq call failed:', message, stack);
    return NextResponse.json({
      reply: 'Error: Groq API failed. Check GROQ_API_KEY in your environment and redeploy.',
      command: text,
      fallback: true,
    }, { status: 502 });
  }
}
