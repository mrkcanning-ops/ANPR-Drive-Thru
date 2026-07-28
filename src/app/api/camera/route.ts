import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

// Create HTTPS agent that ignores self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

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

    // Create HTTP Basic Authentication header
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    
    // Try both HTTP and HTTPS endpoints
    const protocol = port === '443' ? 'https' : 'http';
    const endpoints = [
      // HTTPS endpoints (port 443)
      `https://${cameraIp}:443/cgi-bin/api.cgi?cmd=Snap&channel=${channel}`,
      `https://${cameraIp}:443/cgi-bin/vi?cmd=GetPicture&channel=${channel}`,
      `https://${cameraIp}:443/snapshot.jpg`,
      // HTTP fallback (port 80)
      `http://${cameraIp}:80/cgi-bin/api.cgi?cmd=Snap&channel=${channel}`,
      `http://${cameraIp}:80/cgi-bin/vi?cmd=GetPicture&channel=${channel}`,
      `http://${cameraIp}:80/snapshot.jpg`,
    ];

    let response;
    let lastError: Error | null = null;

    for (const snapshotUrl of endpoints) {
      try {
        const fetchOptions: any = {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
          },
        };

        // Use HTTPS agent for HTTPS URLs
        if (snapshotUrl.startsWith('https')) {
          fetchOptions.agent = httpsAgent;
        }

        response = await fetch(snapshotUrl, fetchOptions);

        if (response.ok) {
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
        console.log(`Endpoint failed: ${snapshotUrl.split('//')[1]?.split(':')[0]}${snapshotUrl.split('//')[1]?.split(':')[1] ? ':' + snapshotUrl.split('//')[1].split(':')[1] : ''} - ${lastError.message}`);
        continue;
      }
    }

    console.error('Camera connection failed. Last error:', lastError?.message);
    return NextResponse.json(
      { error: 'Failed to connect to camera' },
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
