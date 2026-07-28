import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

// Simple in-memory session store for auth tokens
let cachedToken = '';
let tokenExpiry = 0;
const TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get session token from Reolink camera
async function getSessionToken(ip: string, username: string, password: string): Promise<string | null> {
  try {
    const now = Date.now();
    
    // Return cached token if still valid
    if (cachedToken && now < tokenExpiry) {
      console.log('Using cached token');
      return cachedToken;
    }
    
    // Try different login endpoints
    const loginEndpoints = [
      `http://${ip}:80/api/auth/login`,
      `http://${ip}:80/cgi-bin/api.cgi?cmd=GetAuthorization`,
    ];
    
    for (const loginUrl of loginEndpoints) {
      try {
        console.log('Trying login endpoint:', loginUrl);
        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
            clientType: 1,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Login response:', JSON.stringify(data).substring(0, 100));
          
          if (data.token) {
            cachedToken = data.token;
            tokenExpiry = now + TOKEN_CACHE_DURATION;
            console.log('Got auth token:', cachedToken.substring(0, 10) + '...');
            return data.token;
          }
        } else {
          console.log('Login endpoint returned:', response.status);
        }
      } catch (e) {
        console.log('Endpoint error:', e instanceof Error ? e.message : e);
      }
    }
    
    console.log('No login endpoint worked, trying simple token');
    // Fallback: try to use a hardcoded approach or check if camera uses direct token from another source
  } catch (error) {
    console.log('Failed to get auth token:', error instanceof Error ? error.message : error);
  }
  
  return null;
}

// Try to get snapshot with HTTP Basic Auth (no token needed)
async function getSnapshotWithBasicAuth(ip: string, username: string, password: string, channel: string): Promise<Buffer | null> {
  try {
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    
    // Try various Reolink snapshot endpoints
    const endpoints = [
      `http://${ip}:80/cgi-bin/api.cgi?cmd=Snap&channel=${channel}`,
      `http://${ip}:80/cgi-bin/vi?cmd=GetPicture&channel=${channel}`,  
      `http://${ip}:80/webcam.jpg`,
      `http://${ip}:80/snapshot.jpg`,
      `http://${ip}:80/cgi-bin/snapshot.cgi?channel=${channel}`,
    ];
    
    for (const url of endpoints) {
      try {
        console.log('Trying snapshot endpoint:', url);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
          },
          timeout: 5000,
        });
        
        const contentType = response.headers.get('content-type');
        console.log(`${url} returned ${response.status}, content-type: ${contentType}`);
        
        // Log first bytes of response to see what we're getting
        const buffer = await response.arrayBuffer();
        const firstBytes = new Uint8Array(buffer).slice(0, 200);
        const text = new TextDecoder('utf-8', { fatal: false }).decode(firstBytes);
        console.log(`Response content (first 150 chars): ${text.substring(0, 150)}`);
        
        if (response.ok && contentType?.includes('image/jpeg')) {
          console.log('Got JPEG snapshot from:', url, buffer.byteLength, 'bytes');
          return Buffer.from(buffer);
        }
      } catch (e) {
        console.log('Endpoint error:', url, e instanceof Error ? e.message : e);
      }
    }
  } catch (error) {
    console.log('Basic auth snapshot error:', error instanceof Error ? error.message : error);
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

    // Try to get snapshot with Basic Auth (no token needed)
    const buffer = await getSnapshotWithBasicAuth(cameraIp, username, password, channel);
    
    if (!buffer) {
      console.error('Failed to get snapshot from any endpoint');
      return NextResponse.json(
        { error: 'Failed to get camera snapshot' },
        { status: 500 }
      );
    }

    // Verify it's JPEG (should start with FFD8)
    const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8;
    if (!isJpeg) {
      console.warn('Response does not appear to be JPEG. First bytes:', 
        Array.from(buffer.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' '));
      console.warn('First 50 chars:', buffer.toString('utf8', 0, Math.min(50, buffer.length)));
    }

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
  } catch (error) {
    console.error('Camera proxy error:', error);
    return NextResponse.json(
      { error: 'Camera error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
