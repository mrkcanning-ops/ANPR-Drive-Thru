import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

// Simple in-memory session store for auth tokens
let cachedToken = '';
let tokenExpiry = 0;
const TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get session token from Reolink camera using CGI login
async function getSessionToken(ip: string, username: string, password: string): Promise<string | null> {
  try {
    const now = Date.now();
    
    // Return cached token if still valid
    if (cachedToken && now < tokenExpiry) {
      console.log('Using cached token');
      return cachedToken;
    }
    
    // Try different login request formats
    console.log('Attempting Reolink login');
    
    // Method 1: URL-encoded form data (common for CGI endpoints)
    const loginUrl = `http://${ip}:80/cgi-bin/api.cgi`;
    
    // Reolink expects URL-encoded params for CGI
    const params = new URLSearchParams();
    params.append('cmd', 'Login');
    params.append('username', username);
    params.append('password', password);
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    
    const responseText = await response.text();
    console.log('Login response (first 200 chars):', responseText.substring(0, 200));
    
    if (responseText.includes('"code":0') || responseText.includes('code: 0')) {
      // Try to extract token if present
      const tokenMatch = responseText.match(/"token"\s*:\s*"([^"]+)"/);
      if (tokenMatch && tokenMatch[1]) {
        cachedToken = tokenMatch[1];
        tokenExpiry = now + TOKEN_CACHE_DURATION;
        console.log('Got auth token from response');
        return cachedToken;
      }
    }
    
    // If no token found but status is success, maybe it's using session-based auth
    // Try a placeholder token approach
    if (response.ok) {
      console.log('Login request successful, attempting to use direct credentials');
      // Some cameras use a simple token format
      cachedToken = Buffer.from(`${username}:${password}`).toString('base64');
      tokenExpiry = now + TOKEN_CACHE_DURATION;
      return cachedToken;
    }
    
  } catch (error) {
    console.log('Failed to get auth token:', error instanceof Error ? error.message : error);
  }
  
  return null;
}

// Get snapshot using token  
async function getSnapshotWithToken(ip: string, token: string, channel: string): Promise<Buffer | null> {
  try {
    // Reolink expects token in request with Snap command
    const snapshotUrl = `http://${ip}:80/cgi-bin/api.cgi`;
    console.log('Fetching snapshot with token');
    
    const response = await fetch(snapshotUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        cmd: 'Snap',
        channel: channel,
        token: token,
      }).toString(),
      timeout: 8000,
    });
    
    const buffer = await response.arrayBuffer();
    console.log('Snapshot response size:', buffer.byteLength, 'bytes');
    
    if (buffer.byteLength < 200) {
      // Likely an error message, let's see what it is
      const text = new TextDecoder().decode(buffer);
      console.log('Small response content:', text);
      return null;
    }
    
    // Check if it's JPEG (FFD8) or JSON error
    const firstBytes = new Uint8Array(buffer).slice(0, 10);
    const isJson = firstBytes[0] === 0x5B || firstBytes[0] === 0x7B; // [ or {
    
    if (isJson) {
      const text = new TextDecoder().decode(firstBytes);
      console.log('Received JSON error (not JPEG):', text);
      return null;
    }
    
    const isJpeg = firstBytes[0] === 0xFF && firstBytes[1] === 0xD8;
    if (isJpeg) {
      console.log('✓ Got JPEG snapshot:', buffer.byteLength, 'bytes');
      return Buffer.from(buffer);
    } else {
      console.log('Response is not JPEG. First bytes:', Array.from(firstBytes).map(b => b.toString(16)).join(' '));
      console.log('As text:', new TextDecoder().decode(firstBytes));
      return null;
    }
  } catch (error) {
    console.log('Snapshot fetch error:', error instanceof Error ? error.message : error);
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

    // Get auth token using CGI login
    const token = await getSessionToken(cameraIp, username, password);
    
    if (!token) {
      console.error('Failed to authenticate with camera');
      return NextResponse.json(
        { error: 'Camera authentication failed' },
        { status: 401 }
      );
    }

    // Get snapshot with authenticated token
    const buffer = await getSnapshotWithToken(cameraIp, token, channel);
    
    if (!buffer) {
      console.error('Failed to get snapshot from camera');
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
      // Still try to send it - might be a valid image with odd headers
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
