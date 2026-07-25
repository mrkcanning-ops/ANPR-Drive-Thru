# ANPR Dashboard - Multi-Customer Vehicle Setup Guide

## Step 1: Create Supabase Tables

You need to run the SQL setup script to create the required tables.

### How to run the SQL:

1. **Go to your Supabase Project:** https://app.supabase.com/project/_/sql/new
2. **Paste the entire contents of `SUPABASE_SETUP.sql`** from this project root
3. **Click "Run"**

This will create:
- `vehicles` table - stores vehicle details (plate, make, model, colour, year)
- `customers` table - stores customer info (name, email, phone, loyalty_points)
- `vehicle_customers` table - links customers to vehicles (junction table)
- Sample data for testing

---

## Step 2: Verify the Tables Created

Run this query to confirm tables exist:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

You should see:
- vehicles
- customers
- vehicle_customers

---

## Step 3: Test Locally

1. Your dev server is running at http://localhost:3000
2. Click on a vehicle card (e.g., "AB12 CDE")
3. You should now see:
   - Vehicle details (make, model, colour)
   - Customer cards linked to that vehicle
   - Ability to add/remove customers

---

## Step 4: Deploy to Vercel

Once tables are working locally:

```bash
git push origin main
```

Vercel will automatically redeploy with the new features.

---

## Feature Overview

### When a Vehicle Arrives:
1. ANPR detects registration plate
2. Dashboard shows vehicle details (make, model, colour)
3. All customers linked to that vehicle are displayed as cards
4. Click a customer card to view their profile
5. Use "+ Add" button to add new customers to the vehicle
6. Use "Remove" buttons to unlink customers

### Customer Relationship Types:
- **Primary** - Main driver (👑)
- **Family** - Family member (🚗)
- **Shared** - Shared vehicle

---

## Troubleshooting

**Q: I don't see any customer cards**
A: Make sure you've run the SUPABASE_SETUP.sql script. The tables need to be created first.

**Q: Getting database errors?**
A: Check that both environment variables are set in `.env.local`:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

**Q: Add customer dropdown doesn't show any customers?**
A: Run the SQL script again to insert sample customer data.

---

## Next Steps

After setup:
1. Add your real customers to the `customers` table
2. Link them to vehicles in `vehicle_customers` table
3. Configure ANPR to detect vehicle plates and trigger customer lookup
4. Set up Reolink camera feed integration
