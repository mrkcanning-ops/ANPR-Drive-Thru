# Camera Feed - Remote Access Setup

## Problem
The camera feed works fine on your local network but not when accessing the app from the internet via Vercel because:
- go2rtc is running at `192.168.0.52:1984` (private LAN IP)
- Vercel's servers can't access private IPs
- Mobile devices accessing the Vercel URL can't reach the local camera

## Solutions

### Option 1: Use ngrok (Easiest for Testing)
Perfect for temporary remote access and testing.

```bash
# 1. Download and install ngrok from https://ngrok.com

# 2. Create a tunnel to your go2rtc instance
ngrok http 1984

# 3. Copy the ngrok URL (looks like: https://abc123-def456.ngrok-free.app)

# 4. Add to Vercel environment variables:
# In Vercel dashboard → Settings → Environment Variables:
NEXT_PUBLIC_GO2RTC_URL=https://abc123-def456.ngrok-free.app

# 5. The camera feed will now work on mobile and remote!
```

**Note**: ngrok tunnel URL changes each time. Use `ngrok config add-authtoken YOUR_TOKEN` for persistent URLs (requires paid account).

### Option 2: Use ngrok with Static Subdomain (Recommended)
For persistent tunnels with ngrok Pro.

```bash
# Create an account at https://ngrok.com and upgrade to Pro
# Add authentication token
ngrok config add-authtoken YOUR_AUTH_TOKEN

# Create persistent tunnel with reserved domain
ngrok http --domain=your-static-domain.ngrok.io 1984

# Set in Vercel:
NEXT_PUBLIC_GO2RTC_URL=https://your-static-domain.ngrok.io
```

### Option 3: Use Cloudflare Tunnel (Most Reliable)
Best for production deployments.

```bash
# 1. Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

# 2. Authenticate with Cloudflare
cloudflared tunnel login

# 3. Create a tunnel
cloudflared tunnel create camera-feed

# 4. Route traffic
cloudflared tunnel route dns camera-feed yourdomain.com

# 5. Run the tunnel
cloudflared tunnel run --url http://localhost:1984 camera-feed

# 6. Set in Vercel:
NEXT_PUBLIC_GO2RTC_URL=https://camera-feed.yourdomain.com
```

### Option 4: Reverse Proxy with SSL (Enterprise)
For maximum control and security.

```bash
# Set up nginx/caddy as reverse proxy on your server
# Point external domain to your local server
# Terminate SSL at the proxy
# Route /go2rtc/* to localhost:1984
```

## Environment Variable Setup

### For Local Development
File: `.env.local` (already configured)
```
NEXT_PUBLIC_GO2RTC_URL=http://192.168.0.52:1984
```

### For Vercel (Production)
1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project → Settings → Environment Variables
3. Add new variable:
   - **Key**: `NEXT_PUBLIC_GO2RTC_URL`
   - **Value**: Your public go2rtc URL (ngrok, Cloudflare, etc.)
4. Redeploy the project

## Testing

```bash
# Test if your public URL works
curl https://your-public-url/api/config

# Should return JSON with go2rtc configuration
```

## Troubleshooting

### "Camera Unavailable" Error on Mobile
- Verify the `NEXT_PUBLIC_GO2RTC_URL` is set in Vercel
- Check that the tunnel/proxy is running
- Confirm the URL is publicly accessible: `curl https://your-url/api/config`

### ngrok Tunnel Not Working
- Verify go2rtc is running: `http://localhost:1984/api/config`
- Check ngrok is running: `ngrok http 1984`
- Look for the tunnel URL in ngrok console output

### Slow Camera Feed on Mobile
- Use ngrok with higher bandwidth tier
- Consider Cloudflare tunnel for better performance
- Reduce video bitrate in go2rtc config if available

## Security Notes

- Keep `NEXT_PUBLIC_GO2RTC_URL` in Vercel environment variables (don't commit it)
- Use authentication with tunnels if available
- Monitor tunnel logs for unauthorized access
- Consider restricting access by IP or API key in production

## Performance Tips

- ngrok free tier: ~100Mbps bandwidth, restart every 2 hours
- ngrok paid tier: persistent URLs, static IPs, priority bandwidth
- Cloudflare: Generally fastest, included with Cloudflare Pro
- Keep go2rtc on a stable network connection

## Local vs Remote

| Feature | Local (LAN) | Remote (Vercel + Tunnel) |
|---------|-------------|------------------------|
| Speed | Very fast | Depends on tunnel/connection |
| Setup | No tunnel needed | Need ngrok/Cloudflare |
| Reliability | Very stable | Subject to tunnel uptime |
| Cost | Free | Free (ngrok) to paid (Cloudflare) |

## Next Steps

1. Choose a tunneling solution above
2. Get your public URL
3. Update Vercel environment variables
4. Redeploy the project
5. Test camera feed on mobile via Vercel URL
