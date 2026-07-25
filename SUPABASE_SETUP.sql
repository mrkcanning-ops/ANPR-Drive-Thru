-- Supabase SQL Setup for Multi-Customer Vehicle Feature
-- Run these queries in your Supabase SQL Editor: https://app.supabase.com/project/_/sql/new

-- 1. Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate TEXT NOT NULL UNIQUE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  colour TEXT NOT NULL,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  loyalty_points INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create vehicle_customers junction table
CREATE TABLE IF NOT EXISTS vehicle_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'shared', -- 'primary', 'family', 'shared'
  primary_driver BOOLEAN DEFAULT false,
  added_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(vehicle_id, customer_id)
);

-- 4. Insert sample vehicles
INSERT INTO vehicles (plate, make, model, colour, year) 
VALUES
  ('AB12 CDE', 'Ford', 'Focus', 'Blue', 2020),
  ('CD45 EFG', 'Audi', 'A3', 'Red', 2021),
  ('EF78 GHI', 'BMW', '3 Series', 'Silver', 2019),
  ('GH01 IJK', 'Volkswagen', 'Golf', 'Black', 2022),
  ('IJ23 KLM', 'Toyota', 'Corolla', 'White', 2023)
ON CONFLICT (plate) DO NOTHING;

-- 5. Insert sample customers
INSERT INTO customers (name, email, phone, loyalty_points, preferences)
VALUES
  ('John Smith', 'john@example.com', '07700111111', 240, '{"oatMilk": true, "sugarless": false}'),
  ('Sarah Jones', 'sarah@example.com', '07700222222', 180, '{"oatMilk": false, "sugarless": true}'),
  ('Mike Brown', 'mike@example.com', '07700333333', 95, '{"oatMilk": true, "sugarless": true}'),
  ('Emma Davis', 'emma@example.com', '07700444444', 320, '{"oatMilk": false, "sugarless": false}'),
  ('Jane Smith', 'jane@example.com', '07700555555', 150, '{"oatMilk": true, "sugarless": false}'),
  ('Tom Johnson', 'tom@example.com', '07700666666', 95, '{"oatMilk": false, "sugarless": false}')
ON CONFLICT (name) DO NOTHING;

-- 6. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vehicle_customers_vehicle_id ON vehicle_customers(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_customers_customer_id ON vehicle_customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- 7. Link customers to vehicles (Step-by-step approach for reliability)

-- Link John Smith to AB12 CDE (primary driver)
INSERT INTO vehicle_customers (vehicle_id, customer_id, relationship, primary_driver)
SELECT (SELECT id FROM vehicles WHERE plate = 'AB12 CDE'), (SELECT id FROM customers WHERE name = 'John Smith'), 'primary', true
ON CONFLICT DO NOTHING;

-- Link Jane Smith to AB12 CDE (family)
INSERT INTO vehicle_customers (vehicle_id, customer_id, relationship, primary_driver)
SELECT (SELECT id FROM vehicles WHERE plate = 'AB12 CDE'), (SELECT id FROM customers WHERE name = 'Jane Smith'), 'family', false
ON CONFLICT DO NOTHING;

-- Link Tom Johnson to AB12 CDE (shared)
INSERT INTO vehicle_customers (vehicle_id, customer_id, relationship, primary_driver)
SELECT (SELECT id FROM vehicles WHERE plate = 'AB12 CDE'), (SELECT id FROM customers WHERE name = 'Tom Johnson'), 'shared', false
ON CONFLICT DO NOTHING;

-- Link Sarah Jones to CD45 EFG (primary driver)
INSERT INTO vehicle_customers (vehicle_id, customer_id, relationship, primary_driver)
SELECT (SELECT id FROM vehicles WHERE plate = 'CD45 EFG'), (SELECT id FROM customers WHERE name = 'Sarah Jones'), 'primary', true
ON CONFLICT DO NOTHING;
