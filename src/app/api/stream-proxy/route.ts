import { NextRequest, NextResponse } from 'next/server';

/**
 * Stream Proxy API - Proxies go2rtc stream.html for mobile/remote access
 * Allows mobile devices to access the camera stream via relative URL
 */
export async function GET(request: NextRequest) {
  try {
    const go2rtcUrl = process.env.NEXT_PUBLIC_GO2RTC_URL || 'http://localhost:1984';
    const streamName = 'reolink';
    
    // Fetch the stream.html from go2rtc
    const url = `${go2rtcUrl}/stream.html?src=${streamName}`;
    
    console.log('[Stream Proxy] Proxying to:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      console.error('[Stream Proxy] go2rtc error:', response.status);
      return NextResponse.json(
        { error: `go2rtc returned ${response.status}` },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Return the HTML with appropriate CORS and media headers
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    });
  } catch (error) {
    console.error('[Stream Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Stream proxy error' },
      { status: 500 }
    );
  }
}
