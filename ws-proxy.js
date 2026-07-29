const WebSocket = require('ws');
const http = require('http');

const PORT = 3002;

// Create a simple HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ server });

console.log('[WSProxy] Starting WebSocket proxy on port', PORT);

wss.on('connection', (clientWs, req) => {
  console.log('[WSProxy] Client connected from:', req.socket.remoteAddress);
  
  // Connect to go2rtc
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const src = url.searchParams.get('src') || 'reolink';
  const go2rtcUrl = `ws://127.0.0.1:1984/api/ws?src=${encodeURIComponent(src)}`;
  
  console.log('[WSProxy] Connecting to go2rtc:', go2rtcUrl);
  
  const go2rtcWs = new WebSocket(go2rtcUrl);
  let connected = false;
  
  go2rtcWs.on('open', () => {
    console.log('[WSProxy] ✅ Connected to go2rtc');
    connected = true;
  });
  
  go2rtcWs.on('message', (data) => {
    console.log('[WSProxy] → Forwarding message from go2rtc to client (', data.length, 'bytes )');
    try {
      clientWs.send(data);
    } catch (e) {
      console.error('[WSProxy] Error sending to client:', e.message);
    }
  });
  
  go2rtcWs.on('error', (error) => {
    console.error('[WSProxy] ❌ go2rtc error:', error.message);
    clientWs.close(1011, error.message);
  });
  
  go2rtcWs.on('close', (code, reason) => {
    console.log('[WSProxy] go2rtc connection closed:', code, reason);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close(1000, 'go2rtc closed');
    }
  });
  
  clientWs.on('message', (data) => {
    console.log('[WSProxy] ← Forwarding message from client to go2rtc (', data.length, 'bytes)');
    console.log('[WSProxy] Message content (first 200 chars):', data.toString().slice(0, 200));
    if (connected) {
      try {
        go2rtcWs.send(data);
      } catch (e) {
        console.error('[WSProxy] Error sending to go2rtc:', e.message);
      }
    } else {
      console.warn('[WSProxy] Not connected to go2rtc yet');
    }
  });
  
  clientWs.on('error', (error) => {
    console.error('[WSProxy] ❌ Client error:', error.message);
    go2rtcWs.close();
  });
  
  clientWs.on('close', () => {
    console.log('[WSProxy] Client disconnected');
    go2rtcWs.close();
  });
});

server.listen(PORT, () => {
  console.log('[WSProxy] Ready on ws://localhost:3002');
});
