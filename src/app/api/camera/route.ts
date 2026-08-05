import { NextRequest, NextResponse } from 'next/server';

/**
 * Camera Snapshot API - Returns JPEG image for ANPR processing
 * Fetches frame from go2rtc HTTP proxy instead of executing ffmpeg
 * This makes it compatible with serverless environments like Vercel
 * 
 * IMPORTANT FOR VERCEL DEPLOYMENT:
 * - go2rtc must be exposed via Cloudflare Tunnel for Vercel to access it
 * - Set NEXT_PUBLIC_GO2RTC_URL environment variable to the Cloudflare Tunnel URL
 * - See CLOUDFLARE_TUNNEL_SETUP.md for instructions
 */
export async function GET(request: NextRequest) {
  const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });

  try {
    const go2rtcUrl = process.env.NEXT_PUBLIC_GO2RTC_URL || 'http://192.168.0.52:1984';
    const frameUrl = `${go2rtcUrl}/api/frame.jpeg?src=reolink`;

    console.log(`[CAMERA-DEBUG ${timestamp}] ========== SNAPSHOT REQUEST ==========`);
    console.log(`[CAMERA-DEBUG ${timestamp}] go2rtc URL: ${go2rtcUrl}`);
    console.log(`[CAMERA-DEBUG ${timestamp}] Frame endpoint: ${frameUrl}`);

    // Fetch JPEG frame from go2rtc HTTP endpoint
    const response = await fetch(frameUrl);

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
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[CAMERA-DEBUG ${timestamp}] ERROR fetching snapshot:`, errorMsg);

    // Check if this is a network error (likely Vercel trying to access local network)
    if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('EHOSTUNREACH') || errorMsg.includes('fetch failed')) {
      console.error(`[CAMERA-DEBUG ${timestamp}] ⚠️  Cannot reach go2rtc. For Vercel deployment:`);
      console.error(`[CAMERA-DEBUG ${timestamp}]   1. Set up Cloudflare Tunnel to expose go2rtc`);
      console.error(`[CAMERA-DEBUG ${timestamp}]   2. Update NEXT_PUBLIC_GO2RTC_URL to the Tunnel URL`);
      console.error(`[CAMERA-DEBUG ${timestamp}]   3. See CLOUDFLARE_TUNNEL_SETUP.md for details`);
    }

    return NextResponse.json(
      { 
        error: 'Failed to capture camera snapshot', 
        detail: errorMsg,
        hint: 'For Vercel deployment, go2rtc must be exposed via Cloudflare Tunnel. See CLOUDFLARE_TUNNEL_SETUP.md'
      },
      { status: 500 }
    );
  }
}

