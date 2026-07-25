# 🚀 CoffeeHub Dashboard - Getting Started Guide

Welcome! This guide will walk you through setting up the CoffeeHub drive-through coffee shop dashboard from scratch.

## 📋 Overview

The CoffeeHub Dashboard is a production-ready web application for managing drive-through coffee shop operations. It includes:
- Real-time order tracking
- Menu and inventory management
- Team coordination
- Sales analytics
- Business settings

## 🎯 Setup in 5 Steps

### Step 1: Clone & Install (5 minutes)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/anpr-dashboard.git
cd anpr-dashboard

# Install dependencies
npm install
```

### Step 2: Create Supabase Project (10 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in the details:
   - Name: `coffeehub-dashboard`
   - Password: Choose a strong password
   - Region: Select closest to you
4. Click "Create new project"
5. Wait for project to initialize (2-3 minutes)

### Step 3: Get API Keys (2 minutes)

1. In Supabase, go to **Settings → API**
2. Copy:
   - **Project URL** 
   - **anon public key**
3. Create `.env.local` in project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=paste_your_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_key_here
   ```

### Step 4: Set Up Database (10 minutes)

1. In Supabase, go to **SQL Editor**
2. Copy all SQL from [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
3. Paste into SQL editor and run
4. Wait for success message

### Step 5: Start Developing! (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - your dashboard is ready! 🎉

## 🧭 What's Next?

### Option A: Try It Locally
1. ✅ Dashboard is running on localhost:3000
2. Visit each page: Orders, Menu, Analytics, Team, Settings
3. Test creating orders (they'll appear in real-time!)
4. Explore the features

### Option B: Deploy to Production
1. Follow [GITHUB_VERCEL_SETUP.md](./GITHUB_VERCEL_SETUP.md)
2. Push code to GitHub
3. Connect to Vercel
4. Add environment variables
5. Your dashboard is live on the internet!

## 📚 Documentation

| Guide | Purpose |
|-------|---------|
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Database schema and setup instructions |
| [GITHUB_VERCEL_SETUP.md](./GITHUB_VERCEL_SETUP.md) | GitHub and Vercel integration |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Production deployment steps |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Code organization and architecture |

## 🏗️ Project Structure

```
anpr-dashboard/
├── src/
│   ├── app/              # Pages (Dashboard, Orders, Menu, etc.)
│   ├── components/       # Reusable UI components
│   └── lib/             # Utilities and Supabase client
├── .env.local           # Your API keys (keep secret!)
└── package.json         # Dependencies
```

## 💡 Key Features

### Dashboard Home Page
- Real-time order statistics
- Top selling items
- Service station status
- Revenue tracking

### Orders Page
- View all orders with filters
- Track order status
- Manage order workflow

### Menu Page
- Manage menu items
- Organize by category
- Update prices
- Toggle availability

### Analytics Page
- Daily/weekly trends
- Revenue analysis
- Peak hour identification
- Customer metrics

### Team Page
- Staff management
- Shift tracking
- Status monitoring

### Settings Page
- Shop configuration
- Business hours
- Currency and timezone

## 🛠️ Development Commands

```bash
# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Check for code issues
npm run lint
```

## 🎨 Design & Styling

- **Color Theme**: Professional green (Emerald-600)
- **Responsive**: Mobile-first design
- **Framework**: Tailwind CSS v4
- **Components**: Pre-built, ready to customize

## 🔒 Security Notes

- ✅ API keys are public-safe (anon key only)
- ✅ Database has Row Level Security policies
- ✅ Environment variables protected in Vercel
- ✅ All data encrypted in transit

## 🚀 Performance

- Real-time updates via WebSockets
- Optimized database queries with indexes
- CDN deployment via Vercel
- Automatic image optimization

## ❓ Frequently Asked Questions

### Q: Do I need to know React?
A: Helpful but not required. The components are well-structured and documented.

### Q: Can I customize the design?
A: Absolutely! All styles use Tailwind CSS which is easy to modify.

### Q: How do I add authentication?
A: Supabase Auth integrates easily. See Supabase documentation.

### Q: What about payment processing?
A: You can integrate Stripe or Square. See their documentation.

### Q: How do I scale this?
A: Supabase and Vercel both auto-scale. Just upgrade your plan when needed.

## 🐛 Troubleshooting

### Dashboard shows "No active orders"
- This is normal! Create test data using SQL or the form.
- Orders table might be empty.

### Connection error to Supabase
- Check `.env.local` file exists with correct keys
- Verify Supabase project is active
- Test connection in SQL editor

### Real-time not updating
- Refresh the page
- Check browser console for errors
- Verify Supabase real-time is enabled

## 📞 Getting Help

1. Check the documentation files
2. Search existing issues on GitHub
3. Create a new GitHub issue with details
4. Check Supabase documentation

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)
- [Supabase Guide](https://supabase.com/docs)

## 📈 What You Can Build

- Multi-location support
- Mobile app with React Native
- Payment processing
- Loyalty programs
- Inventory management
- Advanced analytics
- SMS notifications
- Customer portal

## ✨ Next Steps

### Immediate (Today)
1. ✅ Get it running locally
2. ✅ Add test data
3. ✅ Explore all pages

### Short-term (This Week)
1. Deploy to Vercel
2. Customize with your branding
3. Add your menu items
4. Invite team members

### Long-term (This Month)
1. Set up payment processing
2. Add customer notifications
3. Build reporting features
4. Optimize for your workflow

## 🎉 You're All Set!

```bash
npm run dev
```

Visit `http://localhost:3000` and start managing your coffee shop!

---

**Questions?** Check the guides or create a GitHub issue.

**Ready to deploy?** Follow [GITHUB_VERCEL_SETUP.md](./GITHUB_VERCEL_SETUP.md)

Happy coding! ☕
