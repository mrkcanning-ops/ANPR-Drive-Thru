import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

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
    
    // For RLC-811A: Try GetAuthorization command
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
    
    // Extract token from JSON response
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

// Get snapshot from FLV stream using FFmpeg
async function getSnapshotFromFLV(ip: string, token: string): Promise<Buffer | null> {
  let tempFile: string | null = null;
  
  try {
    console.log('Attempting to extract frame from FLV stream');
    
    const flvUrl = `http://${ip}:80/flv?token=${encodeURIComponent(token)}`;
    console.log('FLV URL (first 80 chars):', flvUrl.substring(0, 80));
    
    // Use temp file for output
    tempFile = path.join('/tmp', `snapshot_${Date.now()}.jpg`);
    
    // FFmpeg: capture single frame from FLV stream
    // Don't use -rtsp_transport for HTTP URLs
    const command = `ffmpeg -timeout 3000000 -i "${flvUrl}" -vframes 1 -y "${tempFile}"`;
    
    console.log('Running FFmpeg...');
    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 8000, maxBuffer: 10 * 1024 * 1024 });
      console.log('FFmpeg stderr (first 300 chars):', (stderr || stdout || 'no output').substring(0, 300));
    } catch (execError) {
      const error = execError as any;
      console.log('FFmpeg stderr:', error.stderr ? error.stderr.substring(0, 300) : 'no stderr');
      console.log('FFmpeg stdout:', error.stdout ? error.stdout.substring(0, 300) : 'no stdout');
      console.log('FFmpeg command:', error.cmd || 'unknown');
    }
    
    // Check if file was created
    try {
      const stats = await fs.stat(tempFile);
      if (stats.size > 0) {
        console.log('✓ Got snapshot from FLV stream:', stats.size, 'bytes');
        const buffer = await fs.readFile(tempFile);
        return buffer;
      }
    } catch (statErr) {
      console.log('Snapshot file not created or empty');
    }
    
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.log('FLV snapshot outer error:', errMsg.substring(0, 150));
  } finally {
    // Clean up temp file
    if (tempFile) {
      try {
        await fs.unlink(tempFile);
      } catch (e) {
        // Ignore
      }
    }
  }
  
  return null;
}

// Get snapshot using various methods
async function getSnapshot(ip: string, token: string, channel: string, username: string, password: string): Promise<Buffer | null> {
  // Try FFmpeg/FLV first (most reliable for Reolink)
  let buffer = await getSnapshotFromFLV(ip, token);
  if (buffer) return buffer;
  
  // Fallback: Try HTTP endpoints (in case this model supports them)
  console.log('FLV approach failed, trying HTTP endpoints');
  
  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  const endpoints = [
    `http://${ip}:80/cgi-bin/api.cgi?cmd=Snap&channel=${channel}`,
    `http://${ip}:80/cgi-bin/snapshot.cgi?channel=${channel}`,
    `http://${ip}:80/snapshot.jpg`,
  ];
  
  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Basic ${auth}` },
        timeout: 5000,
      });
      
      const buf = await response.arrayBuffer();
      if (buf.byteLength > 1000 && buf.byteLength[0] === 0xFF && buf.byteLength[1] === 0xD8) {
        console.log('✓ Got JPEG via HTTP');
        return Buffer.from(buf);
      }
    } catch (e) {
      // Continue
    }
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

    // Get snapshot (tries FLV/FFmpeg first, then HTTP endpoints)
    const buffer = await getSnapshot(cameraIp, token, channel, username, password);
    
    if (!buffer) {
      console.error('Failed to get snapshot from camera');
      return NextResponse.json(
        { error: 'Failed to get camera snapshot' },
        { status: 500 }
      );
    }

    // Verify it's JPEG
    const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8;
    if (!isJpeg) {
      console.warn('Warning: Response may not be valid JPEG');
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
