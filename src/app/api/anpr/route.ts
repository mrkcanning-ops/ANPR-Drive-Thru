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

    // Fetch the actual JPEG bytes ourselves, server-side, since this
    // Next.js server (unlike Plate Recognizer's cloud) can reach the
    // local go2rtc snapshot endpoint.
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(`Failed to fetch camera snapshot: ${imageResponse.status}`);
      return NextResponse.json(
        { error: `Failed to fetch camera snapshot: ${imageResponse.status}` },
        { status: 502 }
      );
    }
    const imageBuffer = await imageResponse.arrayBuffer();

    // Upload the actual image bytes to Plate Recognizer instead of a URL,
    // since our camera isn't publicly reachable from their servers.
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

    if (!response.ok) {
      console.error(`Plate Recognizer error: ${response.status}`);
      return NextResponse.json(
        { error: `Plate Recognizer returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

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