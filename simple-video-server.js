// Ultra-simple MJPEG server using FFmpeg
// Converts RTSP stream to MJPEG HTTP stream

const http = require('http');
const { spawn } = require('child_process');

const CAMERA_RTSP = 'rtsp://admin:reolink123@192.168.0.92:554/h264Preview_01_main';
const PORT = 8080;

let ffmpegProcess = null;

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/video.mjpg') {
    // Set MJPEG headers
    res.writeHead(200, {
      'Content-Type': 'multipart/x-mixed-replace; boundary=--boundary',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // Spawn FFmpeg to stream RTSP as MJPEG
    if (ffmpegProcess) {
      ffmpegProcess.kill();
    }

    ffmpegProcess = spawn('ffmpeg', [
      '-rtsp_transport', 'tcp',
      '-i', CAMERA_RTSP,
      '-f', 'mjpeg',
      '-q:v', '5',      // Quality (lower = better, 2-8 typical)
      '-fps_mode', 'vfr',
      '-',
    ]);

    // Pipe FFmpeg output to response
    ffmpegProcess.stdout.on('data', (chunk) => {
      res.write('--boundary\r\n');
      res.write('Content-Type: image/jpeg\r\n');
      res.write(`Content-Length: ${chunk.length}\r\n\r\n`);
      res.write(chunk);
      res.write('\r\n');
    });

    ffmpegProcess.stderr.on('data', (data) => {
      console.log(`[FFmpeg] ${data}`);
    });

    ffmpegProcess.on('error', (err) => {
      console.error('[FFmpeg] Error:', err);
      res.end();
    });

    req.on('close', () => {
      console.log('[Server] Client disconnected, killing FFmpeg');
      if (ffmpegProcess) {
        ffmpegProcess.kill();
      }
    });

  } else {
    res.writeHead(404);
    res.end('Not found. Try /video.mjpg');
  }
});

server.listen(PORT, () => {
  console.log(`\n[✓] Simple Video Server running on http://localhost:${PORT}/video.mjpg`);
  console.log('[✓] Use this URL in your app:\n');
  console.log(`    <img src="http://localhost:${PORT}/video.mjpg" />\n`);
});
