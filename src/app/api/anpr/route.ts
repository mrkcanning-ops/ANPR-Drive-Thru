import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();
    const apiKey = process.env.NEXT_PUBLIC_PLATE_RECOGNIZER_API_KEY;

    console.log('[ANPR] imageUrl:', imageUrl);
    console.log('[ANPR] apiKey present:', !!apiKey);

    if (!apiKey) {
      return NextResponse.json({ error: 'Plate Recognizer API key not configured' }, { status: 500 });
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    const imageResponse = await fetch(imageUrl);
    console.log('[ANPR] snapshot status:', imageResponse.status, imageResponse.headers.get('content-type'));

    if (!imageResponse.ok) {
      return NextResponse.json(
        {
          error: 'Failed to fetch camera snapshot',
          detail: `Snapshot fetch failed with status ${imageResponse.status}`,
        },
        { status: 502 }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    const formData = new FormData();
    formData.append('upload', new Blob([imageBuffer], { type: 'image/jpeg' }), 'snapshot.jpg');
    formData.append('regions', 'gb');

    const response = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
      },
      body: formData,
    });

    console.log('[ANPR] Plate Recognizer status:', response.status);

    const responseText = await response.text();
    console.log('[ANPR] Plate Recognizer raw response:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Plate Recognizer returned ${response.status}`,
          detail: responseText,
        },
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);

    const detectedPlates = data.results?.map((result: any) => ({
      plate: result.plate,
      confidence: result.confidence,
      dscore: result.dscore,
      vehicle: {
        color: result.vehicle?.color?.[0]?.color,
        type: result.vehicle?.type?.[0]?.type,
      },
      box: result.box,
    })) || [];

    return NextResponse.json({
      success: true,
      plates: detectedPlates,
      rawResponse: data,
    });
  } catch (error) {
    console.error('[ANPR] processing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process image for ANPR',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}