# Cloudflare Tunnel Setup - Best Free Solution

## Why Cloudflare Tunnel?
- ✅ Completely free
- ✅ Persistent URL (doesn't change)
- ✅ No bandwidth limits
- ✅ Fast global CDN
- ✅ Professional-grade reliability
- ✅ No manual restarts needed

## Step-by-Step Setup (5 minutes)

### Step 1: Create a Free Cloudflare Account
1. Go to https://dash.cloudflare.com
2. Sign up with email
3. Skip domain registration (we won't need it for tunnel-only access)

### Step 2: Install cloudflared CLI
Choose your OS:

**Windows:**
```bash
# Using PowerShell as Administrator:
choco install cloudflare-warp
# or download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
```

**Mac:**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**Linux:**
```bash
curl -L https://pkg.cloudflare.com/cloudflare-release.key | sudo gpg --yes --dearmor --output /usr/share/keyrings/cloudflare-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/cloudflare-archive-keyring.gpg] https://pkg.cloudflare.com/os/$(lsb_release -cs) $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflare-main.list
sudo apt-get update && sudo apt-get install cloudflared
```

### Step 3: Authenticate with Cloudflare
```bash
cloudflared tunnel login
# Opens browser - click "Authorize" to connect your account
```

### Step 4: Create the Tunnel
```bash
cloudflared tunnel create camera-feed
# Response: Tunnel credentials written to ~/.cloudflared/uuid.json
# Tunnel camera-feed created with id xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Save the tunnel ID somewhere!

### Step 5: Configure the Tunnel
Create file: `~/.cloudflared/config.yml`

```yaml
tunnel: camera-feed
credentials-file: /Users/yourname/.cloudflared/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.json

ingress:
  - hostname: camera-feed.yourusername.cfargotunnel.com
    service: http://localhost:1984
  - service: http_status:404
```

**Note**: Replace `yourusername` with your Cloudflare username (shown in browser after login).

To find your username:
- Go to https://dash.cloudflare.com/login
- After login, check the URL or your account settings
- Or run: `cloudflared tunnel info camera-feed` to see your tunnel details

### Step 6: Run the Tunnel
Keep this running while you use the app:

```bash
cloudflared tunnel run camera-feed
```

You should see:
```
Your quick tunnel has been created! Visit it at:
https://camera-feed-xxxxxxxx.cfargotunnel.com
```

### Step 7: Update Vercel Environment Variables
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add new variable:
   - **Name**: `NEXT_PUBLIC_GO2RTC_URL`
   - **Value**: `https://camera-feed-xxxxxxxx.cfargotunnel.com` (your tunnel URL)
   - **Environments**: Select "Production" (and "Preview" if desired)
5. Click "Save"

### Step 8: Redeploy on Vercel
After saving env vars, Vercel auto-redeploys. Or manually:
1. Go to Deployments tab
2. Click on latest deployment
3. Click three dots → Redeploy

### Step 9: Test!
1. Visit your Vercel app on mobile: `https://anpr-drive-thru.vercel.app`
2. Camera feed should now work! 🎉

## Keeping the Tunnel Running

### Option A: Keep Terminal Open (Simple)
```bash
cloudflared tunnel run camera-feed
```
Leave terminal open while you use the app.

### Option B: Run as Service (Recommended for Long-term)

**Windows (PowerShell as Admin):**
```bash
cloudflared service install
# or
cloudflared service update
cloudflared service start
```

**Mac:**
```bash
sudo cloudflared service install
sudo launchctl start com.cloudflare.cloudflared
```

**Linux:**
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
```

## Troubleshooting

### Tunnel URL not working
- Verify tunnel is running: `cloudflared tunnel run camera-feed`
- Check go2rtc is running on localhost:1984
- Wait 30 seconds for DNS propagation

### Camera still shows "unavailable"
- Redeploy Vercel project after env var change
- Clear browser cache (Ctrl+Shift+Delete)
- Check Vercel function logs for errors

### Permission denied on Windows
- Run PowerShell as Administrator
- Try: `cloudflared service install` (for service mode)

### Find your tunnel URL
```bash
cloudflared tunnel info camera-feed
```

## Advantages over ngrok

| Feature | ngrok Free | Cloudflare Tunnel |
|---------|-----------|------------------|
| URL Changes | Every 2 hours | Never (persistent) |
| Bandwidth | ~100Mbps | Unlimited |
| Speed | Good | Excellent (global CDN) |
| Setup Time | 2 min | 5 min |
| Reliability | Good | Enterprise-grade |
| Cost | Free tier | Free (no limits) |
| Need to Restart | Every 2 hours | Never |
| Best For | Testing | Production |

## Production Setup

Once tunnel is stable, convert to service (runs on startup):

**Windows:**
```bash
# Edit config.yml to use absolute paths, then:
cloudflared service install --config "C:\Users\YourName\.cloudflared\config.yml"
```

**Mac/Linux:**
```bash
sudo nano /etc/systemd/system/cloudflared.service
# Add: ExecStart=/usr/bin/cloudflared tunnel run camera-feed
sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

## Security Notes

- Your tunnel URL is public but unique
- Only exposes port 1984 (go2rtc) to the internet
- Add authentication in go2rtc config if needed
- No firewall port forwarding required

## Monitoring

View tunnel logs:
```bash
cloudflared tunnel logs camera-feed
```

View metrics in Cloudflare dashboard:
- https://dash.cloudflare.com → Tunnels → camera-feed → Metrics

## Next Steps

1. Install cloudflared
2. Run `cloudflared tunnel login`
3. Create tunnel: `cloudflared tunnel create camera-feed`
4. Configure config.yml with tunnel URL
5. Run: `cloudflared tunnel run camera-feed`
6. Get tunnel URL from output
7. Update Vercel env var
8. Test on mobile! 🚀

Questions? Check: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/tunnel-guide/
