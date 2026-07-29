# ANPR Dashboard - Startup Guide

## Prerequisites
- Node.js 18+ installed
- Camera: Reolink RLC-811A at 192.168.0.92
- Ports available: 3000 (Next.js), 1984 (go2rtc)

## Quick Start (3 steps)

### Step 1: Start go2rtc (Stream Converter)
Open PowerShell/CMD and run:
```powershell
cd go2rtc
.\start.bat
```

Expected output:
```
[go2rtc] Starting go2rtc on port 1984...
[go2rtc] Camera stream: RTSP from Reolink at 192.168.0.92
[go2rtc] Access WebRTC at: http://localhost:1984/
```

**Keep this terminal open!**

### Step 2: Start Dashboard (in NEW terminal)
Open another PowerShell/CMD and run:
```powershell
npm run dev
```

Expected output:
```
> next dev
  ▲ Next.js 16.2.11
  ▲ Local:        http://localhost:3000
```

**Keep this terminal open!**

### Step 3: Open Dashboard
Navigate to: **http://localhost:3000**

You should see:
- ✅ Live camera feed (WebRTC video stream)
- ✅ Green "Live WebRTC · ANPR 0.5 FPS" badge
- ✅ Vehicle data panel
- ✅ Detected plates section
- ✅ Customer cards

## Troubleshooting

### Camera shows "Connection Failed"
**Check:** 
- [ ] go2rtc is running (`http://localhost:1984/` should work)
- [ ] Camera is online: `ping 192.168.0.92`
- [ ] Firewall allows port 1984

**Solution:**
```powershell
# Check if go2rtc is running
netstat -an | findstr :1984

# If not, restart: cd go2rtc && .\start.bat
```

### "npm run dev" fails
**Check dependencies:**
```powershell
npm install
npm run dev
```

### Port 3000 already in use
```powershell
# Kill process using port 3000
netstat -ano | findstr :3000
# Copy PID and run: taskkill /PID <PID> /F
```

## Architecture

```
┌─────────────────────────────────────────────┐
│  Reolink RLC-811A Camera (192.168.0.92)    │
│  RTSP: rtsp://admin:reolink123@.../main    │
└────────────────┬────────────────────────────┘
                 │ RTSP:554
                 ▼
┌─────────────────────────────────────────────┐
│  go2rtc (localhost:1984)                   │
│  Converts RTSP → WebRTC                    │
│  Command: .\go2rtc.exe -c go2rtc.yaml      │
└────────────────┬────────────────────────────┘
                 │ WebRTC
                 ▼
┌─────────────────────────────────────────────┐
│  Dashboard (localhost:3000)                │
│  • WebRTC Video Stream                     │
│  • Vehicle Data (Supabase)                 │
│  • ANPR Detection (Plate Recognizer API)   │
│  • Frame Capture (Canvas)                  │
└─────────────────────────────────────────────┘
```

## Features

### Live Camera
- **Source**: Reolink RTSP stream
- **Transport**: WebRTC (low latency)
- **Frame Rate**: Continuous
- **Quality**: Limited by camera (1080p/720p)

### ANPR Processing
- **Frequency**: 0.5 FPS (every 2 seconds)
- **Source**: Video canvas frame extraction
- **Service**: Plate Recognizer API
- **Rate Limit**: 429 error handling with backoff

### Vehicle Data
- **Database**: Supabase PostgreSQL
- **Tables**: vehicles, customers, vehicle_customers, orders
- **Features**: Multi-customer support, order tracking

## Ports & URLs

| Service | Port | URL |
|---------|------|-----|
| go2rtc | 1984 | http://localhost:1984/ |
| Dashboard | 3000 | http://localhost:3000/ |
| Camera HTTP | 80 | http://192.168.0.92/ |
| Camera RTSP | 554 | rtsp://192.168.0.92/... |

## Next Steps

1. ✅ Start both services (above)
2. ✅ Verify camera feed appears
3. ⚙️ Adjust camera IP if different: Edit `go2rtc/go2rtc.yaml`
4. ⚙️ Tune ANPR frequency: Edit `src/app/page.tsx` (frameInterval)
5. 📊 Test on tablet (10-12" screen, landscape)

## Support

- **go2rtc Docs**: https://github.com/AlexxIT/go2rtc
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Plate Recognizer**: https://platerecognizer.com/docs/

---

**Status**: ✅ Ready to run!
