import { NextRequest, NextResponse } from 'next/server';
import { generateSocraticHint } from '@/lib/gemini/client';
import { SocraticHintRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: SocraticHintRequest = await req.json();

    if (!body.levelId || !body.hintTierRequested) {
      return NextResponse.json(
        { error: 'Parameter levelId dan hintTierRequested wajib diisi.' },
        { status: 400 }
      );
    }

    const result = await generateSocraticHint(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error handling socratic hint:', error);
    return NextResponse.json(
      { error: 'Terjadi kendala pada server AI.' },
      { status: 500 }
    );
  }
}
