# CoffeeHub Drive-Through Dashboard

A modern, real-time dashboard for managing drive-through coffee shop operations. Built with Next.js, React, and Supabase.

## Features

✨ **Real-Time Dashboard**
- Live order tracking with WebSocket updates
- Active orders display with status management
- Revenue tracking and analytics
- Service station status monitoring

📊 **Analytics & Reports**
- Daily order volume trends
- Revenue analytics by category
- Peak hour analysis
- Customer satisfaction metrics

☕ **Menu Management**
- Menu item creation and editing
- Category-based organization
- Price management
- Availability toggling

👥 **Team Management**
- Staff profile management
- Shift scheduling and assignment
- Status tracking (active/break/inactive)
- Role-based access

📋 **Order Management**
- Order creation and tracking
- Status workflow (pending → preparing → ready → completed)
- Customer information tracking
- Order history and analytics

⚙️ **Settings**
- Shop configuration
- Business hours setup
- Regional settings
- Currency and timezone support

## Technology Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Real-time**: Supabase Realtime (WebSockets)
- **Deployment**: [Vercel](https://vercel.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account
- GitHub account (for Vercel deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/anpr-dashboard.git
   cd anpr-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Set up Supabase**
   Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to create your database tables and policies.

5. **Start the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Production Deployment

Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) to deploy to Vercel:
- Push to GitHub
- Connect GitHub repo to Vercel
- Add environment variables
- Deploy

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed file organization and architecture.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
