import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cameraIp = process.env.NEXT_PUBLIC_CAMERA_IP;
    const username = process.env.NEXT_PUBLIC_CAMERA_USERNAME;
    const password = process.env.NEXT_PUBLIC_CAMERA_PASSWORD;
    const port = process.env.NEXT_PUBLIC_CAMERA_PORT || '443';
    const channel = process.env.NEXT_PUBLIC_CAMERA_CHANNEL || '0';

    if (!cameraIp) {
      return NextResponse.json(
        { error: 'Camera not configured' },
        { status: 500 }
      );
    }

    // RLC-811A specific endpoints (HTTPS on port 443)
    const protocol = port === '443' ? 'https' : 'http';
    const endpoints = [
      `${protocol}://${username}:${password}@${cameraIp}:${port}/cgi-bin/api.cgi?cmd=Snap&channel=${channel}`,
      `${protocol}://${username}:${password}@${cameraIp}:${port}/cgi-bin/vi?cmd=GetPicture&channel=${channel}`,
      `${protocol}://${username}:${password}@${cameraIp}:${port}/snapshot.jpg`,
      `${protocol}://${username}:${password}@${cameraIp}:${port}/cgi-bin/snapshot.cgi?channel=${channel}`,
    ];

    let response;
    let lastError: Error | null = null;

    for (const snapshotUrl of endpoints) {
      try {
        response = await fetch(snapshotUrl, {
          method: 'GET',
        });

        if (response.ok) {
          // Return the snapshot image with proper headers
          const buffer = await response.arrayBuffer();
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': 'image/jpeg',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`Endpoint failed: ${snapshotUrl.split('@')[1]} - ${lastError.message}`);
        continue;
      }
    }

    console.error('Camera connection failed. Tried all endpoints. Last error:', lastError?.message);
    return NextResponse.json(
      { error: 'Failed to connect to camera at ' + cameraIp },
      { status: 500 }
    );
  } catch (error) {
    console.error('Camera proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to camera' },
      { status: 500 }
    );
  }
}
