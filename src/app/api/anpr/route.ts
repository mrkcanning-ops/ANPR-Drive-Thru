import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();
    const apiKey = process.env.NEXT_PUBLIC_PLATE_RECOGNIZER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Plate Recognizer API key not configured' },
        { status: 500 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL required' },
        { status: 400 }
      );
    }

    // Call Plate Recognizer API
    const response = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        upload_url: imageUrl,
      }),
    });

    if (!response.ok) {
      console.error(`Plate Recognizer error: ${response.status}`);
      return NextResponse.json(
        { error: `Plate Recognizer returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract plate information
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
    console.error('ANPR processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process image for ANPR' },
      { status: 500 }
    );
  }
}
