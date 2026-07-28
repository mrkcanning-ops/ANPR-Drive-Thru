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
    
    // Reolink CGI-based login
    console.log('Attempting CGI login for camera at', ip);
    const loginUrl = `http://${ip}:80/cgi-bin/api.cgi`;
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cmd: 'Login',
        action: 0,
        param: {
          User: {
            userName: username,
            password: password,
          },
        },
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Login response:', JSON.stringify(data).substring(0, 150));
      
      // Check if response is an array (Reolink returns array)
      if (Array.isArray(data) && data.length > 0) {
        const loginResp = data[0];
        if (loginResp.code === 0 && loginResp.status === 200) {
          // Login successful - look for token in response
          if (loginResp.value && loginResp.value.Token) {
            cachedToken = loginResp.value.Token;
            tokenExpiry = now + TOKEN_CACHE_DURATION;
            console.log('Got auth token:', cachedToken.substring(0, 10) + '...');
            return cachedToken;
          }
        } else {
          console.log('Login failed:', loginResp.code, loginResp.status);
        }
      }
    } else {
      console.log('Login request returned:', response.status);
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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cmd: 'Snap',
        action: 0,
        param: {
          channel: parseInt(channel),
        },
        token: token,
      }),
      timeout: 8000,
    });
    
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log('Snapshot response size:', buffer.byteLength, 'bytes');
      
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
        console.log('Got JPEG snapshot:', buffer.byteLength, 'bytes');
        return Buffer.from(buffer);
      } else {
        console.log('Response is not JPEG or JSON. First bytes:', Array.from(firstBytes).map(b => b.toString(16)).join(' '));
      }
    } else {
      console.log('Snapshot request returned:', response.status);
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
