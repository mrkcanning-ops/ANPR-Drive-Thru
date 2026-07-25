# CoffeeHub Dashboard - Deployment Guide

## Deploy to Vercel

### Prerequisites
- GitHub account with your repository pushed
- Supabase project set up (see SUPABASE_SETUP.md)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/anpr-dashboard.git

# Push to GitHub
git add .
git commit -m "Initial commit: CoffeeHub dashboard"
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New → Project"
3. Select your GitHub repository
4. Click "Import Project"
5. Add Environment Variables:
   - Click "Environment Variables"
   - Add:
     - **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
     - **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anon key

6. Click "Deploy"

Your dashboard will be live at `https://your-project-name.vercel.app`

### Step 3: Automatic Deployments

Every push to main branch will automatically deploy:

```bash
# Make changes and deploy
git add .
git commit -m "Update dashboard"
git push
```

## Environment Variables for Production

Make sure these variables are set in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Domain Setup (Optional)

1. In Vercel dashboard, go to **Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed by Vercel

## Monitoring

- Check deployment status: Vercel dashboard → Deployments
- View logs: Vercel dashboard → Function Logs
- Monitor errors: Vercel dashboard → Monitoring

## Performance Tips

- Images are automatically optimized by Vercel
- Static pages are cached globally
- Database queries are optimized with indexes
- Real-time subscriptions use WebSockets

## Scaling

As your coffee shop grows:
- Supabase automatically scales the database
- Vercel automatically handles increased traffic
- Consider adding caching with Redis
- Set up database backups and monitoring

## Costs

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Supabase**: Free tier includes 500MB database
- Upgrade as needed based on usage
