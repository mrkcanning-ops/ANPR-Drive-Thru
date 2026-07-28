import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Get RTSP snapshot using ffmpeg
async function getRtspSnapshot(rtspUrl: string): Promise<Buffer | null> {
  try {
    // Use OS temp directory
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `snapshot_${Date.now()}.jpg`);
    
    // Execute ffmpeg to grab one frame from RTSP stream
    // -rtsp_transport tcp: Use TCP instead of UDP for more reliable delivery
    // -i: Input RTSP URL
    // -vframes 1: Grab only 1 frame
    // -y: Overwrite output file without asking
    // -timeout 5000000: 5 second timeout
    const command = `ffmpeg -rtsp_transport tcp -i "${rtspUrl}" -vframes 1 -y -q:v 2 "${tempFile}" 2>&1`;
    
    const output = execSync(command, { 
      timeout: 10000,
      stdio: 'pipe'
    }).toString();
    
    if (fs.existsSync(tempFile)) {
      const buffer = fs.readFileSync(tempFile);
      // Clean up temp file
      fs.unlinkSync(tempFile);
      console.log('Got RTSP snapshot:', buffer.length, 'bytes');
      return buffer;
    }
  } catch (error) {
    console.error('FFmpeg error:', error instanceof Error ? error.message : error);
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

    // Try RTSP stream first (most reliable for RLC-811A)
    const channelNum = channel === '0' ? '01' : `0${parseInt(channel) + 1}`;
    const rtspUrl = `rtsp://${username}:${password}@${cameraIp}:554/h264Preview_${channelNum}_main`;
    
    console.log('Attempting RTSP snapshot from:', rtspUrl);
    let buffer = await getRtspSnapshot(rtspUrl);
    
    if (!buffer) {
      // Fallback: try sub stream if main fails
      const rtspUrlSub = `rtsp://${username}:${password}@${cameraIp}:554/h264Preview_${channelNum}_sub`;
      console.log('Main stream failed, trying sub stream:', rtspUrlSub);
      buffer = await getRtspSnapshot(rtspUrlSub);
    }

    if (buffer && buffer.length > 0) {
      // Verify it's JPEG (should start with FFD8)
      const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8;
      if (!isJpeg) {
        console.warn('Warning: Response does not appear to be JPEG. First bytes:', 
          Array.from(buffer.slice(0, 4)).map(b => '0x' + b.toString(16)).join(' '));
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
    }

    console.error('Failed to get snapshot from RTSP streams');
    return NextResponse.json(
      { error: 'Failed to get camera snapshot' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Camera proxy error:', error);
    return NextResponse.json(
      { error: 'Camera error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
