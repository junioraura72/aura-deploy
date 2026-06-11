import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  console.log('GEMINI key loaded:', !!GEMINI_API_KEY);

  const { feature = 'startup' } = await req.json().catch(() => ({}));

  if (!GEMINI_API_KEY) {
    return NextResponse.json({
      message: `Architect task ${feature} queued for build. Gemini key is not configured yet.`,
      fallback: true
    }, { status: 503 });
  }

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
  } catch (error) {
    console.error('Architect Gemini error:', error);
    return NextResponse.json({
      message: `Feature ${feature} queued for build. Gemini is temporarily unavailable.`,
      fallback: true
    }, { status: 502 });
  }
}
