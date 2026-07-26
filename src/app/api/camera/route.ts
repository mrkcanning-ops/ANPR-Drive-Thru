import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cameraIp = process.env.NEXT_PUBLIC_CAMERA_IP;
    const username = process.env.NEXT_PUBLIC_CAMERA_USERNAME;
    const password = process.env.NEXT_PUBLIC_CAMERA_PASSWORD;
    const port = process.env.NEXT_PUBLIC_CAMERA_PORT || '80';
    const channel = process.env.NEXT_PUBLIC_CAMERA_CHANNEL || '0';

    if (!cameraIp) {
      return NextResponse.json(
        { error: 'Camera not configured' },
        { status: 500 }
      );
    }

    // Construct the camera stream URL
    const cameraUrl = `http://${username}:${password}@${cameraIp}:${port}/cgi-bin/mjpeg?channel=${channel}`;

    // Fetch the MJPEG stream from the camera
    const response = await fetch(cameraUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Camera returned status ${response.status}` },
        { status: response.status }
      );
    }

    // Return the stream with proper headers
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'multipart/x-mixed-replace; boundary=--myboundary',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Camera proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to camera' },
      { status: 500 }
    );
  }
}
