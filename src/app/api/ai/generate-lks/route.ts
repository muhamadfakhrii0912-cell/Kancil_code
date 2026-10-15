import { NextRequest, NextResponse } from 'next/server';
import { generatePrintableLKS } from '@/lib/gemini/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic = 'Petualangan Kancil di Jembatan Buaya', grade = 4, concept = 'Loops & Sequencing' } = body;

    const lksData = await generatePrintableLKS(topic, grade, concept);
    return NextResponse.json(lksData);
  } catch (err: any) {
    console.error('Error in /api/ai/generate-lks:', err);
    return NextResponse.json(
      { error: err.message || 'Gagal merancang LKS Lembar Kerja Siswa.' },
      { status: 500 }
    );
  }
}
