import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
  console.log(`[ANPR-DEBUG ${timestamp}] ========== ANPR REQUEST ==========`);
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_PLATE_RECOGNIZER_API_KEY;
    console.log(`[ANPR-DEBUG ${timestamp}] API Key configured: ${!!apiKey}`);

    if (!apiKey) {
      console.error(`[ANPR-DEBUG ${timestamp}] ERROR: Plate Recognizer API key not configured`);
      return NextResponse.json({ error: 'Plate Recognizer API key not configured' }, { status: 500 });
    }

    const contentType = request.headers.get('content-type') || '';
    console.log(`[ANPR-DEBUG ${timestamp}] Request content-type: ${contentType}`);
    
    let imageBuffer: ArrayBuffer;

    if (contentType.includes('multipart/form-data')) {
      // Image sent directly from the client (avoids a duplicate camera capture)
      console.log(`[ANPR-DEBUG ${timestamp}] Parsing multipart form data...`);
      const incomingForm = await request.formData();
      const file = incomingForm.get('image');
      console.log(`[ANPR-DEBUG ${timestamp}] Form field 'image' retrieved, type: ${file instanceof Blob ? 'Blob' : typeof file}`);
      
      if (!file || !(file instanceof Blob)) {
        console.error(`[ANPR-DEBUG ${timestamp}] ERROR: Image file required or not a Blob`);
        return NextResponse.json({ error: 'Image file required' }, { status: 400 });
      }
      imageBuffer = await file.arrayBuffer();
      console.log(`[ANPR-DEBUG ${timestamp}] Image buffer size from multipart: ${imageBuffer.byteLength} bytes`);
    } else {
      const { imageUrl } = await request.json();
      console.log(`[ANPR-DEBUG ${timestamp}] Legacy path: imageUrl = ${imageUrl}`);

      if (!imageUrl) {
        console.error(`[ANPR-DEBUG ${timestamp}] ERROR: Image URL required`);
        return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
      }

      // Convert relative URL to absolute URL for server-side fetch
      const absoluteUrl = imageUrl.startsWith('http')
        ? imageUrl
        : `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}${imageUrl}`;

      console.log(`[ANPR-DEBUG ${timestamp}] Fetching from absolute URL: ${absoluteUrl}`);
      const imageResponse = await fetch(absoluteUrl);
      console.log(`[ANPR-DEBUG ${timestamp}] Snapshot fetch status: ${imageResponse.status}`);

      if (!imageResponse.ok) {
        console.error(`[ANPR-DEBUG ${timestamp}] ERROR: Snapshot fetch failed with status ${imageResponse.status}`);
        return NextResponse.json(
          {
            error: 'Failed to fetch camera snapshot',
            detail: `Snapshot fetch failed with status ${imageResponse.status}`,
          },
          { status: 502 }
        );
      }

      imageBuffer = await imageResponse.arrayBuffer();
      console.log(`[ANPR-DEBUG ${timestamp}] Image buffer size from URL: ${imageBuffer.byteLength} bytes`);
    }

    console.log(`[ANPR-DEBUG ${timestamp}] Sending image to Plate Recognizer API...`);
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

    console.log(`[ANPR-DEBUG ${timestamp}] Plate Recognizer response status: ${response.status}`);

    const responseText = await response.text();
    console.log(`[ANPR-DEBUG ${timestamp}] Plate Recognizer response (first 500 chars): ${responseText.substring(0, 500)}`);

    if (!response.ok) {
      console.error(`[ANPR-DEBUG ${timestamp}] ERROR: Plate Recognizer returned ${response.status}`);
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
      confidence: result.score, // score field from API response
      dscore: result.dscore,
      vehicle: {
        color: result.vehicle?.color?.[0]?.color,
        type: result.vehicle?.type?.[0]?.type,
      },
      box: result.box,
    })) || [];

    console.log(`[ANPR-DEBUG ${timestamp}] Detected ${detectedPlates.length} plate(s): ${detectedPlates.map((p: any) => p.plate).join(', ')}`);
    console.log(`[ANPR-DEBUG ${timestamp}] ========== ANPR RESPONSE SENT ==========\n`);

    return NextResponse.json({
      success: true,
      plates: detectedPlates,
      rawResponse: data,
    });
  } catch (error) {
    console.error(`[ANPR-DEBUG ${timestamp}] EXCEPTION: ${error instanceof Error ? error.message : error}`);
    console.error(`[ANPR-DEBUG ${timestamp}] ========== ANPR FAILED ==========\n`);
    return NextResponse.json(
      {
        error: 'Failed to process image for ANPR',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}