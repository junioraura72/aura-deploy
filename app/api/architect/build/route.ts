import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { feature } = await req.json();
  return NextResponse.json({ message: `Feature ${feature} queued for build.` });
}
