import { NextRequest, NextResponse } from 'next/server';

/**
 * Camera Snapshot API - Returns JPEG image for ANPR processing
 * Fetches frame from go2rtc HTTP proxy instead of executing ffmpeg
 * This makes it compatible with serverless environments like Vercel
 */
export async function GET(request: NextRequest) {
  const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });

  try {
    const go2rtcUrl = process.env.NEXT_PUBLIC_GO2RTC_URL || 'http://192.168.0.52:1984';
    const frameUrl = `${go2rtcUrl}/api/frame.jpeg?src=reolink`;

    console.log(`[CAMERA-DEBUG ${timestamp}] ========== SNAPSHOT REQUEST ==========`);
    console.log(`[CAMERA-DEBUG ${timestamp}] Fetching frame from go2rtc: ${frameUrl}`);

    // Fetch JPEG frame from go2rtc HTTP endpoint
    const response = await fetch(frameUrl, {
      method: 'GET',
      timeout: 10000,
    });

    if (!response.ok) {
      console.error(`[CAMERA-DEBUG ${timestamp}] go2rtc returned status ${response.status}`);
      throw new Error(`go2rtc returned ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    console.log(`[CAMERA-DEBUG ${timestamp}] Successfully fetched frame from go2rtc, size: ${imageBuffer.length} bytes`);
    console.log(`[CAMERA-DEBUG ${timestamp}] Returning JPEG blob`);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.error(`[CAMERA-DEBUG ${timestamp}] ERROR fetching snapshot:`, error instanceof Error ? error.message : error);

    return NextResponse.json(
      { error: 'Failed to capture camera snapshot', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

