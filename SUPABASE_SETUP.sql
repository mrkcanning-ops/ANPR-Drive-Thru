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
  name TEXT NOT NULL,
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

-- 4. Create indexes for better query performance
CREATE INDEX idx_vehicle_customers_vehicle_id ON vehicle_customers(vehicle_id);
CREATE INDEX idx_vehicle_customers_customer_id ON vehicle_customers(customer_id);
CREATE INDEX idx_vehicles_plate ON vehicles(plate);

-- 5. Insert sample data for testing
INSERT INTO vehicles (plate, make, model, colour, year) VALUES
  ('AB12 CDE', 'Ford', 'Focus', 'Blue', 2020),
  ('CD45 EFG', 'Audi', 'A3', 'Red', 2021),
  ('EF78 GHI', 'BMW', '3 Series', 'Silver', 2019),
  ('GH01 IJK', 'Volkswagen', 'Golf', 'Black', 2022),
  ('IJ23 KLM', 'Toyota', 'Corolla', 'White', 2023)
ON CONFLICT (plate) DO NOTHING;

INSERT INTO customers (name, email, phone, loyalty_points, preferences) VALUES
  ('John Smith', 'john@example.com', '07700111111', 240, '{"oatMilk": true, "sugarless": false}'),
  ('Sarah Jones', 'sarah@example.com', '07700222222', 180, '{"oatMilk": false, "sugarless": true}'),
  ('Mike Brown', 'mike@example.com', '07700333333', 95, '{"oatMilk": true, "sugarless": true}'),
  ('Emma Davis', 'emma@example.com', '07700444444', 320, '{"oatMilk": false, "sugarless": false}'),
  ('Jane Smith', 'jane@example.com', '07700555555', 150, '{"oatMilk": true, "sugarless": false}'),
  ('Tom Johnson', 'tom@example.com', '07700666666', 95, '{"oatMilk": false, "sugarless": false}')
ON CONFLICT DO NOTHING;

-- Link customers to vehicles
INSERT INTO vehicle_customers (vehicle_id, customer_id, relationship, primary_driver) 
SELECT v.id, c.id, 'primary', true
FROM vehicles v
JOIN customers c ON c.name = 'John Smith'
WHERE v.plate = 'AB12 CDE'
ON CONFLICT DO NOTHING;

INSERT INTO vehicle_customers (vehicle_id, customer_id, relationship, primary_driver)
SELECT v.id, c.id, 'family', false
FROM vehicles v
JOIN customers c ON c.name = 'Jane Smith'
WHERE v.plate = 'AB12 CDE'
ON CONFLICT DO NOTHING;

INSERT INTO vehicle_customers (vehicle_id, customer_id, relationship, primary_driver)
SELECT v.id, c.id, 'primary', true
FROM vehicles v
JOIN customers c ON c.name = 'Sarah Jones'
WHERE v.plate = 'CD45 EFG'
ON CONFLICT DO NOTHING;

INSERT INTO vehicle_customers (vehicle_id, customer_id, relationship, primary_driver)
SELECT v.id, c.id, 'shared', false
FROM vehicles v
JOIN customers c ON c.name = 'Tom Johnson'
WHERE v.plate = 'AB12 CDE'
ON CONFLICT DO NOTHING;
