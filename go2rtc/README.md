# go2rtc Setup Guide

This directory contains the go2rtc configuration for converting the Reolink RTSP stream to WebRTC for browser playback.

## Quick Start

### 1. Start go2rtc
```bash
cd go2rtc
./start.bat
```

This will:
- Download `go2rtc.exe` if not present (~20MB)
- Read configuration from `go2rtc.yaml`
- Start the server on `http://localhost:1984`
- Convert RTSP stream to WebRTC

### 2. Verify it's running
```
http://localhost:1984/
```
Should show the go2rtc web UI with the "reolink" stream listed.

### 3. Run the dashboard
In another terminal:
```bash
npm run dev
```

The camera feed should now display as a live WebRTC stream.

## Configuration

**go2rtc.yaml** contains:
- **streams**: RTSP source from your Reolink camera at `192.168.0.92:554`
- **api**: HTTP API on port 1984 with CORS enabled
- **webrtc**: WebRTC candidates for NAT traversal

### Changing Camera IP/Credentials
Edit `go2rtc.yaml`:
```yaml
streams:
  reolink:
    url: rtsp://admin:your_password@192.168.0.92:554/h264Preview_01_main
```

## How It Works

```
Reolink Camera (RTSP:554)
    ↓
go2rtc (proxy)
    ↓
WebRTC → Browser (low latency live video)
    ↓
Canvas frame grab → ANPR processing (0.5fps)
```

## Troubleshooting

### "Connection Failed" in dashboard
- [ ] Check go2rtc is running: `http://localhost:1984/`
- [ ] Check camera is reachable: `ping 192.168.0.92`
- [ ] Check camera credentials in `go2rtc.yaml`
- [ ] Check firewall allows port 1984

### Poor video quality
- The RTSP source stream quality is limited by the camera
- Adjust camera settings via web interface at `http://192.168.0.92`

### ANPR not working
- Check frame extraction in browser console
- ANPR triggers every 2 seconds (configurable in `page.tsx`)
- Verify Plate Recognizer API key in `.env.local`

## Manual Download

If auto-download fails:
1. Visit: https://github.com/AlexxIT/go2rtc/releases/tag/v1.9.1
2. Download `go2rtc_win64.exe`
3. Place in this directory as `go2rtc.exe`
4. Run `start.bat`
