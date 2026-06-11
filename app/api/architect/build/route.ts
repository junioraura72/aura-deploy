import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('AURA agents loaded: Elsie, Architect | Gemini key:', !!process.env.GEMINI_API_KEY);
  if (!process.env.GEMINI_API_KEY) {
    console.error('CRITICAL: GEMINI_API_KEY missing in Netlify env vars');
    throw new Error('GEMINI_API_KEY not configured');
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
  const { feature = 'startup' } = await req.json().catch(() => ({}));

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `You are Architect. Create a concise build plan for feature "${feature}" on AURA. Return one sentence with the task, expected output, and next action.` }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 120 }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || `Feature ${feature} queued for build.`;

    return NextResponse.json({ message: `Feature ${feature} queued for build.`, summary, fallback: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('Gemini call failed:', message, stack);
    return NextResponse.json({
      message: 'Error: Gemini API failed. Check GEMINI_API_KEY in Netlify env vars and redeploy with clear cache.',
      fallback: true
    }, { status: 502 });
  }
}
