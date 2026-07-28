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
    
    // Try to get a new token via login
    const loginUrl = `http://${ip}:80/api/auth/login`;
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
      if (data.token) {
        cachedToken = data.token;
        tokenExpiry = now + TOKEN_CACHE_DURATION;
        console.log('Got new auth token');
        return data.token;
      }
    }
  } catch (error) {
    console.log('Failed to get auth token:', error instanceof Error ? error.message : error);
  }
  
  return null;
}

// Get snapshot using Reolink API
async function getSnapshotWithToken(ip: string, token: string, channel: string): Promise<Buffer | null> {
  try {
    const snapshotUrl = `http://${ip}:80/api/snap/shooter?token=${token}&channel=${channel}`;
    console.log('Fetching snapshot from:', snapshotUrl);
    
    const response = await fetch(snapshotUrl, {
      timeout: 8000,
    });
    
    if (response.ok && response.headers.get('content-type')?.includes('image/jpeg')) {
      const buffer = await response.arrayBuffer();
      console.log('Got snapshot via token:', buffer.byteLength, 'bytes');
      return Buffer.from(buffer);
    } else {
      const contentType = response.headers.get('content-type');
      console.log('Snapshot URL returned:', response.status, contentType);
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

    // Get auth token
    const token = await getSessionToken(cameraIp, username, password);
    
    if (!token) {
      console.error('Could not get auth token');
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Get snapshot with token
    let buffer = await getSnapshotWithToken(cameraIp, token, channel);
    
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
