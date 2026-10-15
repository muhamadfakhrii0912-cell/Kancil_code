import { NextRequest, NextResponse } from 'next/server';
import { generateAILevel } from '@/lib/gemini/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teacherPrompt, targetConcept = 'loops', difficulty = 'medium' } = body;

    if (!teacherPrompt) {
      return NextResponse.json(
        { error: 'Prompt kebutuhan level wajib diisi oleh guru.' },
        { status: 400 }
      );
    }

    const generatedLevel = await generateAILevel(teacherPrompt, targetConcept, difficulty);
    return NextResponse.json(generatedLevel);
  } catch (err: any) {
    console.error('Error in /api/ai/generate-level:', err);
    return NextResponse.json(
      { error: err.message || 'Gagal merancang level AI.' },
      { status: 500 }
    );
  }
}
