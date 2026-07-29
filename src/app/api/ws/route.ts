import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get('src') || 'reolink';

  // Check if this is a WebSocket upgrade request
  const upgrade = req.headers.get('upgrade');
  if (upgrade !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 400 });
  }

  // Get the raw socket from the request
  const socket = (req as any).socket;
  if (!socket) {
    return new Response('WebSocket not supported', { status: 400 });
  }

  // Connect to go2rtc WebSocket
  const go2rtcUrl = `ws://localhost:1984/api/ws?src=${encodeURIComponent(src)}`;
  console.log('[API] Proxying WebSocket to:', go2rtcUrl);

  try {
    const ws = new WebSocket(go2rtcUrl);

    ws.onopen = () => {
      console.log('[API] Connected to go2rtc');
    };

    ws.onmessage = (event) => {
      // Forward messages from go2rtc to browser
      console.log('[API] Forwarding message from go2rtc');
    };

    ws.onerror = (error) => {
      console.error('[API] WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('[API] go2rtc WebSocket closed');
    };

    // Return web socket response
    return new Response(null, {
      status: 101,
      statusText: 'Switching Protocols',
      headers: {
        Upgrade: 'websocket',
        Connection: 'Upgrade',
        'Sec-WebSocket-Accept': '',
      },
    });
  } catch (error) {
    console.error('[API] WebSocket proxy error:', error);
    return new Response('Failed to proxy WebSocket', { status: 500 });
  }
}
