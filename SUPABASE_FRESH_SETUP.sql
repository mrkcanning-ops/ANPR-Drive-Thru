-- Fresh Supabase Setup - Run this to reset everything
-- Copy and paste this entire script into Supabase SQL editor

-- Drop existing tables if they exist (CAREFUL: this deletes all data)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS vehicle_customers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Create vehicles table
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate TEXT NOT NULL UNIQUE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  colour TEXT NOT NULL,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  phone TEXT,
  loyalty_points INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vehicle_customers junction table
CREATE TABLE vehicle_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'shared',
  primary_driver BOOLEAN DEFAULT false,
  added_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(vehicle_id, customer_id)
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number INTEGER UNIQUE DEFAULT 1001,
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'completed')),
  items JSONB DEFAULT '[]',
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_vehicle_customers_vehicle_id ON vehicle_customers(vehicle_id);
CREATE INDEX idx_vehicle_customers_customer_id ON vehicle_customers(customer_id);
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_customer_name ON orders(customer_name);

-- Insert vehicles
INSERT INTO vehicles (plate, make, model, colour, year) VALUES
  ('AB12 CDE', 'Ford', 'Focus', 'Blue', 2020),
  ('CD45 EFG', 'Audi', 'A3', 'Red', 2021),
  ('EF78 GHI', 'BMW', '3 Series', 'Silver', 2019),
  ('GH01 IJK', 'Volkswagen', 'Golf', 'Black', 2022),
  ('IJ23 KLM', 'Toyota', 'Corolla', 'White', 2023);

-- Insert customers
INSERT INTO customers (name, email, phone, loyalty_points, preferences) VALUES
  ('John Smith', 'john@example.com', '07700111111', 240, '{"oatMilk": true}'),
  ('Sarah Jones', 'sarah@example.com', '07700222222', 180, '{"oatMilk": false}'),
  ('Mike Brown', 'mike@example.com', '07700333333', 95, '{"oatMilk": true}'),
  ('Emma Davis', 'emma@example.com', '07700444444', 320, '{"oatMilk": false}'),
  ('Jane Smith', 'jane@example.com', '07700555555', 150, '{"oatMilk": true}'),
  ('Tom Johnson', 'tom@example.com', '07700666666', 95, '{"oatMilk": false}');

-- Link customers to vehicles
INSERT INTO vehicle_customers (vehicle_id, customer_id, relationship, primary_driver) VALUES
  ((SELECT id FROM vehicles WHERE plate = 'AB12 CDE'), (SELECT id FROM customers WHERE name = 'John Smith'), 'primary', true),
  ((SELECT id FROM vehicles WHERE plate = 'AB12 CDE'), (SELECT id FROM customers WHERE name = 'Jane Smith'), 'family', false),
  ((SELECT id FROM vehicles WHERE plate = 'AB12 CDE'), (SELECT id FROM customers WHERE name = 'Tom Johnson'), 'shared', false),
  ((SELECT id FROM vehicles WHERE plate = 'CD45 EFG'), (SELECT id FROM customers WHERE name = 'Sarah Jones'), 'primary', true);

-- Insert sample orders
INSERT INTO orders (order_number, customer_name, status, items, total_price) VALUES
  (1001, 'John Smith', 'pending', '[{"name": "Large Latte", "price": 4.50, "qty": 1}, {"name": "Bacon Roll", "price": 3.20, "qty": 1}]', 7.70),
  (1002, 'Sarah Jones', 'preparing', '[{"name": "Cappuccino", "price": 4.00, "qty": 1}, {"name": "Croissant", "price": 2.50, "qty": 1}]', 6.50),
  (1003, 'Mike Brown', 'completed', '[{"name": "Americano", "price": 3.00, "qty": 2}]', 6.00);
