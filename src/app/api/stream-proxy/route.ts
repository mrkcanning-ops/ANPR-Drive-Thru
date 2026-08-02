import { NextRequest, NextResponse } from 'next/server';

/**
 * Stream Proxy API - Proxies go2rtc stream.html for mobile/remote access
 * 
 * For production deployment (Vercel):
 * 1. Set NEXT_PUBLIC_GO2RTC_URL to a publicly accessible go2rtc instance
 * 2. Options:
 *    - Use ngrok: ngrok http 1984 (then set NEXT_PUBLIC_GO2RTC_URL=https://your-ngrok-url)
 *    - Use a public go2rtc server
 *    - Use a reverse proxy with SSL termination
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
      const errorText = await response.text().catch(() => '');
      console.error('[Stream Proxy] go2rtc error:', response.status, errorText.slice(0, 200));
      
      // Provide helpful error message for remote deployment
      const isRemote = request.headers.get('host')?.includes('vercel') || 
                       !request.headers.get('host')?.includes('localhost');
      
      const errorMessage = isRemote && go2rtcUrl.includes('192.168')
        ? `Camera not accessible remotely. For Vercel/remote access, use: ngrok http 1984 to create a tunnel, then set NEXT_PUBLIC_GO2RTC_URL to the ngrok URL`
        : `go2rtc returned ${response.status}`;
      
      return NextResponse.json(
        { error: errorMessage, status: response.status },
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Stream Proxy] Error:', errorMsg);
    
    const isRemote = request.headers.get('host')?.includes('vercel') ||
                     !request.headers.get('host')?.includes('localhost');
    const go2rtcUrl = process.env.NEXT_PUBLIC_GO2RTC_URL || 'http://localhost:1984';
    
    const message = isRemote && go2rtcUrl.includes('192.168')
      ? 'Camera stream unavailable on remote access. Local IP addresses are not accessible from the internet. Set up an ngrok tunnel or public go2rtc URL.'
      : `Stream proxy error: ${errorMsg}`;
    
    return NextResponse.json(
      { error: message },
      { status: 503 }
    );
  }
}
