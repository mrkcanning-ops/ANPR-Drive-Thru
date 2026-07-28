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
    
    // For RLC-811A: Try GetAuthorization command which some models support
    console.log('Attempting GetAuthorization');
    
    const loginUrl = `http://${ip}:80/cgi-bin/api.cgi`;
    const params = new URLSearchParams();
    params.append('cmd', 'GetAuthorization');
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
    console.log('GetAuthorization response (first 150 chars):', responseText.substring(0, 150));
    
    // Extract token from JSON response if present
    const tokenMatch = responseText.match(/"(?:token|sessionID|sid)\s*"?\s*:\s*"([^"]+)"/i);
    if (tokenMatch && tokenMatch[1]) {
      cachedToken = tokenMatch[1];
      tokenExpiry = now + TOKEN_CACHE_DURATION;
      console.log('✓ Extracted token from response');
      return cachedToken;
    }
    
    // Fallback: use credentials as base64 token
    console.log('Using base64-encoded credentials as fallback token');
    cachedToken = Buffer.from(`${username}:${password}`).toString('base64');
    tokenExpiry = now + TOKEN_CACHE_DURATION;
    return cachedToken;
    
  } catch (error) {
    console.log('Failed to get auth token:', error instanceof Error ? error.message : error);
  }
  
  return null;
}

// Get snapshot using various authentication methods
async function getSnapshotWithToken(ip: string, token: string, channel: string, username: string, password: string): Promise<Buffer | null> {
  try {
    console.log('Attempting to get snapshot');
    
    // Method 1: Try with token in query string
    let endpoints = [
      `http://${ip}:80/cgi-bin/api.cgi?cmd=Snap&channel=${channel}&token=${encodeURIComponent(token)}`,
      `http://${ip}:80/snapshot.jpg?token=${encodeURIComponent(token)}`,
    ];
    
    // Try with token first
    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          timeout: 5000,
        });
        
        const buffer = await response.arrayBuffer();
        
        // Check if it's JPEG
        if (buffer.byteLength > 1000) {
          const firstBytes = new Uint8Array(buffer).slice(0, 2);
          if (firstBytes[0] === 0xFF && firstBytes[1] === 0xD8) {
            console.log('✓ Got JPEG via token auth:', buffer.byteLength, 'bytes');
            return Buffer.from(buffer);
          }
        }
      } catch (e) {
        // Continue to next method
      }
    }
    
    // Method 2: Try with HTTP Basic Auth headers (direct snapshot endpoint)
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const basicAuthEndpoints = [
      `http://${ip}:80/cgi-bin/api.cgi?cmd=Snap&channel=${channel}`,
      `http://${ip}:80/cgi-bin/snapshot.cgi?channel=${channel}`,
      `http://${ip}:80/snapshot.jpg`,
      `http://${ip}:80/webcam.jpg`,
    ];
    
    console.log('Trying HTTP Basic Auth');
    for (const url of basicAuthEndpoints) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
          },
          timeout: 5000,
        });
        
        const buffer = await response.arrayBuffer();
        
        if (buffer.byteLength > 1000) {
          const firstBytes = new Uint8Array(buffer).slice(0, 2);
          if (firstBytes[0] === 0xFF && firstBytes[1] === 0xD8) {
            console.log('✓ Got JPEG via Basic Auth:', buffer.byteLength, 'bytes');
            return Buffer.from(buffer);
          }
        }
        
        // Log what we got if it's small
        if (buffer.byteLength < 300) {
          const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
          console.log(`${url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('/') + 20)}: ${buffer.byteLength} bytes, content: ${text.substring(0, 60)}`);
        }
      } catch (e) {
        // Continue
      }
    }
    
    console.log('No valid JPEG snapshot found');
  } catch (error) {
    console.log('Snapshot error:', error instanceof Error ? error.message : error);
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
      console.error('Failed to authenticate with camera');
      return NextResponse.json(
        { error: 'Camera authentication failed' },
        { status: 401 }
      );
    }

    // Get snapshot (tries token-based auth first, then HTTP Basic Auth)
    const buffer = await getSnapshotWithToken(cameraIp, token, channel, username, password);
    
    if (!buffer) {
      console.error('Failed to get snapshot from camera');
      return NextResponse.json(
        { error: 'Failed to get camera snapshot' },
        { status: 500 }
      );
    }

    // Return as JPEG
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
