import { NextResponse } from 'next/server';
import { mockAIAnalysis } from '../../../lib/mockAI';

export async function POST(req: Request) {
  const { fileName } = await req.json();
  return NextResponse.json(mockAIAnalysis(fileName || 'demo.csv'));
}
