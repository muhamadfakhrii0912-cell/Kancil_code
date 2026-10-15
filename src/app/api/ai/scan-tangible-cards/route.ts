import { NextRequest, NextResponse } from 'next/server';
import { scanTangibleCards } from '@/lib/gemini/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.imageBase64) {
      return NextResponse.json(
        { error: 'Foto kartu fisik (imageBase64) wajib disertakan.' },
        { status: 400 }
      );
    }

    const result = await scanTangibleCards(body.imageBase64);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error scanning tangible cards:', error);
    return NextResponse.json(
      { error: 'Terjadi kendala saat memindai kartu fisik via AI.' },
      { status: 500 }
    );
  }
}
