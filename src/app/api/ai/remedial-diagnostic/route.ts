import { NextRequest, NextResponse } from 'next/server';
import { generateRemedialAnalysis } from '@/lib/gemini/client';
import { MOCK_TELEMETRY } from '@/lib/supabase/mockData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { classroomName = 'Kelas 4B SDN Nusantara 01', telemetry = MOCK_TELEMETRY } = body;

    const analysis = await generateRemedialAnalysis(classroomName, telemetry);
    return NextResponse.json(analysis);
  } catch (err: any) {
    console.error('Error in /api/ai/remedial-diagnostic:', err);
    return NextResponse.json(
      { error: err.message || 'Gagal menghasilkan analisis remedial.' },
      { status: 500 }
    );
  }
}
