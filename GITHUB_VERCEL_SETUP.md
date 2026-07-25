# GitHub & Vercel Integration Guide

## GitHub Setup

### 1. Initialize Git Repository

```bash
cd anpr-dashboard
git init
git add .
git commit -m "Initial commit: CoffeeHub dashboard"
```

### 2. Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `anpr-dashboard`
3. Description: `Drive-through coffee shop dashboard with Supabase`
4. Choose Public or Private
5. Click "Create repository"

### 3. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/anpr-dashboard.git
git branch -M main
git push -u origin main
```

## Vercel Integration

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Select your GitHub repository
5. Click "Import"

### 2. Environment Variables

In Vercel project settings, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Deploy

Click "Deploy" - your dashboard will be live in 2-3 minutes!

Your URL: `https://anpr-dashboard.vercel.app`

## GitHub Actions (Optional CI/CD)

Create `.github/workflows/lint.yml`:

```yaml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
```

## Automatic Deployments

Every push to `main` automatically deploys to production:

```bash
# Make changes
git add .
git commit -m "Update dashboard"
git push origin main

# Wait 1-2 minutes, Vercel will deploy automatically
```

## Rollback a Deployment

In Vercel dashboard:
1. Go to "Deployments"
2. Find the previous working deployment
3. Click "..." → "Promote to Production"

## Monitor Deployments

1. Vercel Dashboard → Deployments tab
2. View build logs and status
3. Check Function Logs for errors
4. Monitor Analytics for performance

## Custom Domain

1. Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., coffeehub-dashboard.com)
3. Update DNS records
4. SSL certificate auto-generated

## Performance Monitoring

- Vercel Analytics: Dashboard → Analytics
- Monitor First Contentful Paint (FCP)
- Track page load times
- Monitor database query performance

## Troubleshooting

### Build Failed
- Check build logs in Vercel
- Ensure all dependencies are installed
- Verify TypeScript compilation
- Check environment variables

### Performance Issues
- Check Supabase query performance
- Monitor database connections
- Verify indexes are set up
- Use Vercel Analytics

### Real-time Not Working
- Verify Supabase real-time is enabled
- Check WebSocket connections
- Monitor browser console for errors

## Security Best Practices

1. Never commit `.env.local`
2. Keep secrets in Vercel Environment Variables
3. Enable Vercel Protected Branches
4. Require pull request reviews
5. Enable branch protection rules

## Team Collaboration

### Adding Collaborators to GitHub

1. Repository → Settings → Collaborators
2. Add team members
3. Set permissions (write/admin)

### Adding Collaborators to Vercel

1. Project Settings → Members
2. Invite team members
3. Set access level

## Cost Optimization

- Vercel Free: 100GB bandwidth/month
- Supabase Free: 500MB database + 2GB bandwidth
- Upgrade only when needed
- Monitor usage in both dashboards

## Backup Strategy

1. GitHub: Automatic backup of code
2. Supabase: Enable daily automated backups
3. Export data weekly
4. Test backup restoration monthly
