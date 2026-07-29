import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // This endpoint acts as a bridge for WebSocket connections
  // Since Next.js doesn't support WebSocket upgrade in standard API routes,
  // we'll return the go2rtc stream info and let the client connect directly
  
  const streamName = request.nextUrl.searchParams.get('stream') || 'reolink';
  
  try {
    // Check if the go2rtc server is running
    const response = await fetch(`http://localhost:1984/api/streams/${streamName}`);
    
    if (!response.ok) {
      return Response.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }
    
    const data = await response.json();
    return Response.json({
      stream: streamName,
      available: true,
      wsUrl: `ws://localhost:1984/ws?src=${streamName}`,
      ...data,
    });
  } catch (error) {
    console.error('[WS Bridge] Error:', error);
    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
