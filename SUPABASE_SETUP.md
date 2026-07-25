# CoffeeHub Dashboard - Supabase Setup Guide

## Overview
This guide will help you set up the Supabase database for the CoffeeHub drive-through coffee shop dashboard.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Enter project name: `coffeehub-dashboard`
4. Set a strong database password
5. Select your region (closest to your location)
6. Click "Create new project"

## 2. Get Your API Keys

Once your project is created:
1. Go to **Settings → API**
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Add these to your `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Create Database Tables

Go to **SQL Editor** in Supabase and run the following SQL:

### Orders Table
```sql
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number SERIAL UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed')),
  items TEXT[] NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_created_at_idx ON orders(created_at DESC);
```

### Menu Items Table
```sql
CREATE TABLE menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index
CREATE INDEX menu_items_category_idx ON menu_items(category);
```

### Daily Stats Table
```sql
CREATE TABLE daily_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  average_order_value DECIMAL(10, 2) DEFAULT 0,
  peak_hour VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index
CREATE INDEX daily_stats_date_idx ON daily_stats(date DESC);
```

### Team Members Table
```sql
CREATE TABLE team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  shift VARCHAR(50) DEFAULT 'morning',
  status VARCHAR(50) DEFAULT 'inactive' CHECK (status IN ('active', 'break', 'inactive')),
  phone VARCHAR(20),
  hired_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index
CREATE INDEX team_members_status_idx ON team_members(status);
```

## 4. Enable Row Level Security (RLS)

For each table, enable RLS for security:

1. Go to **Authentication → Policies**
2. For each table (`orders`, `menu_items`, `daily_stats`, `team_members`):
   - Click the table
   - Enable RLS
   - Add a policy to allow public read access (for now):
   ```sql
   CREATE POLICY "Enable read access for all users" ON public.TABLE_NAME
   FOR SELECT USING (true);
   ```

3. For write operations, you can restrict to authenticated users:
   ```sql
   CREATE POLICY "Enable write for authenticated users" ON public.TABLE_NAME
   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   ```

## 5. Enable Real-time Subscriptions

For the dashboard to show real-time updates:

1. Go to **Realtime** in the Supabase dashboard
2. Click on each table and enable broadcasting for:
   - `orders`
   - `team_members`

## 6. Sample Data (Optional)

Insert sample data for testing:

```sql
-- Insert sample menu items
INSERT INTO menu_items (name, category, price, description) VALUES
('Espresso', 'Hot Drinks', 3.50, 'Single shot of espresso'),
('Cappuccino', 'Hot Drinks', 5.00, 'Espresso with steamed milk'),
('Latte', 'Hot Drinks', 5.50, 'Smooth and creamy espresso latte'),
('Iced Coffee', 'Cold Drinks', 4.50, 'Chilled espresso with ice'),
('Cold Brew', 'Cold Drinks', 5.00, 'Smooth cold brew concentrate'),
('Croissant', 'Pastries', 4.00, 'Fresh butter croissant'),
('Muffin', 'Pastries', 3.50, 'Blueberry muffin'),
('Sandwich', 'Food', 8.00, 'Grilled cheese sandwich');

-- Insert sample team members
INSERT INTO team_members (name, role, email, shift, status, phone) VALUES
('Sarah Johnson', 'Barista', 'sarah@coffeehub.com', 'morning', 'active', '+1-555-1001'),
('Mike Chen', 'Barista', 'mike@coffeehub.com', 'afternoon', 'active', '+1-555-1002'),
('Emma Davis', 'Shift Manager', 'emma@coffeehub.com', 'morning', 'active', '+1-555-1003');

-- Insert sample order
INSERT INTO orders (customer_name, status, items, total_price) VALUES
('John Doe', 'preparing', ARRAY['Cappuccino', 'Croissant'], 9.00);
```

## 7. Database Backup

To backup your data:

1. Go to **Settings → Backups**
2. Enable automated daily backups
3. Keep at least 7 days of backups

## Next Steps

1. Your database is now ready!
2. Update your `.env.local` with the API credentials
3. Run `npm run dev` to start the development server
4. The dashboard will connect to your Supabase database

## Troubleshooting

- **Connection Error**: Check that your API URL and key are correct in `.env.local`
- **RLS Policy Error**: Ensure policies are set up correctly for each table
- **Real-time not working**: Verify that real-time is enabled in Supabase dashboard
