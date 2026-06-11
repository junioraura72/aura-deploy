import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    elsie: true,
    architect: true,
    gemini_key: !!process.env.GEMINI_API_KEY
  });
}
