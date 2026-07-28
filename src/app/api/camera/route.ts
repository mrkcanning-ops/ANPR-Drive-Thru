import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

// Create HTTPS agent that ignores self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// Simple in-memory session store
let sessionToken = '';
let lastSessionTime = 0;
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

async function getSessionToken(ip: string, username: string, password: string) {
  const now = Date.now();
  
  // Reuse session if still valid
  if (sessionToken && (now - lastSessionTime) < SESSION_TIMEOUT) {
    return sessionToken;
  }

  try {
    // Try to login and get session token
    const loginUrl = `http://${ip}:80/api/auth/login`;
    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      if (data.token) {
        sessionToken = data.token;
        lastSessionTime = now;
        console.log('Got new session token');
        return data.token;
      }
    }
  } catch (error) {
    console.log('Login failed, will try basic auth fallback:', error);
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const cameraIp = process.env.NEXT_PUBLIC_CAMERA_IP;
    const username = process.env.NEXT_PUBLIC_CAMERA_USERNAME;
    const password = process.env.NEXT_PUBLIC_CAMERA_PASSWORD;
    const channel = process.env.NEXT_PUBLIC_CAMERA_CHANNEL || '0';

    if (!cameraIp || !username || !password) {
      return NextResponse.json(
        { error: 'Camera not configured' },
        { status: 500 }
      );
    }

    // Try to get session token first
    const token = await getSessionToken(cameraIp, username, password);

    // Try endpoints with token, then with basic auth
    const endpoints = [
      // With session token (HTTP port 80)
      ...(token ? [
        `http://${cameraIp}:80/cgi-bin/api.cgi?cmd=Snap&channel=${channel}&token=${token}`,
        `http://${cameraIp}:80/cgi-bin/vi?cmd=GetPicture&channel=${channel}&token=${token}`,
        `http://${cameraIp}:80/snapshot.jpg?token=${token}`,
      ] : []),
      // With basic auth (HTTP port 80)
      `http://${cameraIp}:80/cgi-bin/api.cgi?cmd=Snap&channel=${channel}`,
      `http://${cameraIp}:80/cgi-bin/vi?cmd=GetPicture&channel=${channel}`,
      `http://${cameraIp}:80/snapshot.jpg`,
      // HTTPS fallback with basic auth (port 443)
      `https://${cameraIp}:443/cgi-bin/api.cgi?cmd=Snap&channel=${channel}`,
      `https://${cameraIp}:443/cgi-bin/vi?cmd=GetPicture&channel=${channel}`,
      `https://${cameraIp}:443/snapshot.jpg`,
    ];

    const auth = Buffer.from(`${username}:${password}`).toString('base64');
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

        const response = await fetch(snapshotUrl, fetchOptions);

        if (response.ok) {
          const buffer = await response.arrayBuffer();
          
          // Debug: log first 100 bytes to see if it's JPEG or HTML
          const firstBytes = new Uint8Array(buffer.slice(0, 100));
          console.log('Response headers:', response.headers);
          console.log('First bytes:', Array.from(firstBytes).slice(0, 20).map(b => b.toString(16).padStart(2, '0')).join(' '));
          console.log('First text:', new TextDecoder().decode(firstBytes).substring(0, 50));
          
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
