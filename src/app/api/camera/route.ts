import { NextRequest, NextResponse } from 'next/server';

/**
 * Camera API - Returns WebRTC connection info
 * The actual streaming is handled by go2rtc
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'ok',
      streaming: {
        type: 'webrtc',
        url: 'http://localhost:1984/api/streams/reolink/webrtc',
        provider: 'go2rtc',
      },
      camera: {
        ip: process.env.NEXT_PUBLIC_CAMERA_IP || '192.168.0.92',
        model: 'Reolink RLC-811A',
        rtsp: 'rtsp://admin:reolink123@192.168.0.92:554/h264Preview_01_main',
      },
    });
  } catch (error) {
    console.error('[Camera] Error:', error);
    return NextResponse.json({ error: 'Camera error' }, { status: 500 });
  }
}

