import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Get ffmpeg binary path from ffmpeg-static package
// The path needs to be resolved relative to the application root
let ffmpegPath: string;
try {
  // Get the workspace root directory
  const workspaceRoot = path.resolve(process.cwd());
  // Construct the path to ffmpeg binary in node_modules
  ffmpegPath = path.join(workspaceRoot, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
  
  // Verify the file exists
  if (!fs.existsSync(ffmpegPath)) {
    console.warn(`[Camera] ffmpeg binary not found at ${ffmpegPath}, falling back to system ffmpeg`);
    ffmpegPath = 'ffmpeg';
  }
} catch {
  // Fallback to system ffmpeg if anything goes wrong
  ffmpegPath = 'ffmpeg';
}

/**
 * Camera Snapshot API - Returns JPEG image for ANPR processing
 * Uses ffmpeg to extract a frame from the RTSP stream
 */
export async function GET(request: NextRequest) {
  const tempDir = os.tmpdir();
  const snapshotPath = path.join(tempDir, `snapshot-${Date.now()}.jpg`);

  try {
    const cameraUrl = process.env.NEXT_PUBLIC_CAMERA_RTSP_URL || 
      'rtsp://admin:reolink123@192.168.0.92:554/h264Preview_01_sub';

    console.log('[Camera] Capturing snapshot from RTSP stream using ffmpeg');

    // Use ffmpeg to capture a single frame from RTSP stream
    // -rtsp_transport tcp for better reliability
    // -vframes 1 to capture only one frame
    // -q:v 2 for high quality JPEG
    const command = `"${ffmpegPath}" -rtsp_transport tcp -i "${cameraUrl}" -vframes 1 -q:v 2 "${snapshotPath}"`;
    console.log('[Camera] Executing:', command);

    execSync(command, { 
      stdio: 'pipe',
      timeout: 10000,
      maxBuffer: 10 * 1024 * 1024,
    });

    if (!fs.existsSync(snapshotPath)) {
      throw new Error('ffmpeg failed to capture snapshot');
    }

    const imageBuffer = fs.readFileSync(snapshotPath);
    
    // Clean up temp file
    try {
      fs.unlinkSync(snapshotPath);
    } catch (e) {
      console.error('[Camera] Failed to clean up temp file:', e);
    }

    console.log('[Camera] Snapshot captured successfully, size:', imageBuffer.length);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('[Camera] Error capturing snapshot:', error instanceof Error ? error.message : error);
    
    // Clean up temp file if it exists
    try {
      if (fs.existsSync(snapshotPath)) {
        fs.unlinkSync(snapshotPath);
      }
    } catch (e) {
      // Ignore cleanup errors
    }

    return NextResponse.json(
      { error: 'Failed to capture camera snapshot', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

