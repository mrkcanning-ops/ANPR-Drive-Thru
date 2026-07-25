# CoffeeHub Dashboard - Project Structure

## Directory Layout

```
anpr-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Dashboard home page
│   │   ├── orders/
│   │   │   └── page.tsx        # Orders management
│   │   ├── menu/
│   │   │   └── page.tsx        # Menu management
│   │   ├── analytics/
│   │   │   └── page.tsx        # Analytics & reports
│   │   ├── team/
│   │   │   └── page.tsx        # Team management
│   │   ├── settings/
│   │   │   └── page.tsx        # Settings page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── DashboardHeader.tsx # Page header
│   │   ├── StatCard.tsx        # Statistics card
│   │   ├── OrderCard.tsx       # Order display card
│   │   ├── ActiveOrdersList.tsx # Orders list
│   │   └── AnalyticsChart.tsx  # Chart component
│   └── lib/
│       └── supabase.ts         # Supabase client & types
├── public/                      # Static assets
├── .env.local                  # Environment variables (local)
├── .env.production             # Production variables (Vercel)
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind CSS config
├── postcss.config.mjs          # PostCSS config
├── eslint.config.mjs           # ESLint config
├── SUPABASE_SETUP.md           # Database setup guide
├── DEPLOYMENT_GUIDE.md         # Vercel deployment guide
└── README.md                   # Project overview
```

## Key Features

### Dashboard (/)
- Real-time order statistics
- Active orders display
- Top items analytics
- Service station status
- Revenue tracking
- Real-time updates via Supabase subscriptions

### Orders (/orders)
- View all orders
- Filter by status
- Order details and timeline
- Order management interface

### Menu (/menu)
- Menu item management
- Category filtering
- Price management
- Item availability toggle
- Edit/delete operations

### Analytics (/analytics)
- Daily/weekly/monthly trends
- Revenue analysis
- Peak hour identification
- Customer satisfaction metrics
- Custom report generation

### Team (/team)
- Staff management
- Shift scheduling
- Status tracking
- Role assignment

### Settings (/settings)
- Shop configuration
- Business hours
- Regional settings
- Contact information

## Technology Stack

- **Frontend**: React 19 with Next.js 16
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime WebSockets
- **Deployment**: Vercel
- **Language**: TypeScript

## Color Scheme

The dashboard uses a professional green theme:

- **Primary**: Emerald-600 (`#059669`)
- **Hover**: Emerald-700 (`#047857`)
- **Light**: Emerald-50 (`#f0fdf4`)
- **Accent**: Emerald-500 (`#10b981`)
- **Text**: Gray-900 (`#111827`)
- **Background**: Gray-50 (`#f9fafb`)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Database Schema

### Orders Table
- `id`: UUID (primary key)
- `order_number`: Serial number
- `customer_name`: Customer name
- `status`: pending|preparing|ready|completed
- `items`: Array of item names
- `total_price`: Decimal amount
- `created_at`: Timestamp
- `completed_at`: Timestamp (nullable)

### Menu Items Table
- `id`: UUID (primary key)
- `name`: Item name
- `category`: Item category
- `price`: Decimal price
- `description`: Item description
- `available`: Boolean availability
- `created_at`: Timestamp

### Daily Stats Table
- `id`: UUID (primary key)
- `date`: Date
- `total_orders`: Integer count
- `total_revenue`: Decimal amount
- `average_order_value`: Decimal amount
- `peak_hour`: String time

### Team Members Table
- `id`: UUID (primary key)
- `name`: Staff member name
- `role`: Job role
- `email`: Email address
- `shift`: morning|afternoon|night
- `status`: active|break|inactive
- `phone`: Contact number
- `hired_date`: Employment date

## Git Workflow

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/anpr-dashboard.git

# Create a new branch for features
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "Add feature description"

# Push to GitHub
git push origin feature/feature-name

# Create Pull Request on GitHub
```

## Environment Variables

### Local Development (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Production (Vercel)
Set the same variables in Vercel project settings.

## Performance Considerations

- Real-time subscriptions use WebSockets for live updates
- Database indexes on frequently queried fields
- Static assets cached by Vercel CDN
- Client-side caching for improved performance

## Security

- Environment variables never exposed to frontend (except NEXT_PUBLIC_*)
- Supabase RLS policies enforce data access rules
- Input validation on all forms
- CORS properly configured

## Future Enhancements

- [ ] Customer profiles and history
- [ ] Payment integration (Stripe)
- [ ] Mobile app (React Native)
- [ ] SMS notifications for orders
- [ ] Loyalty program tracking
- [ ] Inventory management
- [ ] Employee scheduling
- [ ] Multi-location support
