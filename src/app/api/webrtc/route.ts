export async function POST(req: Request) {
  try {
    console.log('[WebRTC Proxy] Received request');
    const body = await req.json();
    const offerSdp = body.sdp;

    console.log('[WebRTC Proxy] Offer SDP length:', offerSdp?.length);

    if (!offerSdp) {
      console.error('[WebRTC Proxy] Missing SDP');
      return Response.json({ error: 'Missing SDP' }, { status: 400 });
    }

    // Attempt 1: /api/streams/reolink/webrtc
    const url1 = 'http://localhost:1984/api/streams/reolink/webrtc';
    console.log('[WebRTC Proxy] Trying:', url1);
    
    try {
      const response = await fetch(url1, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: offerSdp,
      });

      console.log('[WebRTC Proxy] Response status:', response.status);

      if (response.ok) {
        const answerSdp = await response.text();
        console.log('[WebRTC Proxy] ✅ Success! Answer length:', answerSdp?.length);
        return Response.json({ sdp: answerSdp });
      } else {
        const errorText = await response.text();
        console.log('[WebRTC Proxy] URL 1 failed:', response.status, errorText.slice(0, 100));
      }
    } catch (e) {
      console.error('[WebRTC Proxy] URL 1 error:', e);
    }

    // Attempt 2: /api/stream/reolink
    const url2 = 'http://localhost:1984/api/stream/reolink';
    console.log('[WebRTC Proxy] Trying:', url2);
    
    try {
      const response = await fetch(url2, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: offerSdp,
      });

      console.log('[WebRTC Proxy] Response status:', response.status);

      if (response.ok) {
        const answerSdp = await response.text();
        console.log('[WebRTC Proxy] ✅ Success on URL 2! Answer length:', answerSdp?.length);
        return Response.json({ sdp: answerSdp });
      } else {
        const errorText = await response.text();
        console.log('[WebRTC Proxy] URL 2 failed:', response.status, errorText.slice(0, 100));
      }
    } catch (e) {
      console.error('[WebRTC Proxy] URL 2 error:', e);
    }

    console.error('[WebRTC Proxy] All endpoints failed');
    return Response.json({ error: 'All endpoints failed' }, { status: 500 });
    
  } catch (error) {
    console.error('[WebRTC Proxy] Catch error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
