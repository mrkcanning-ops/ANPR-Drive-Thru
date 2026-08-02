-- Create orders table in Supabase
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql/new

-- Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS orders CASCADE;

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number INTEGER UNIQUE,
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'completed')),
  items JSONB DEFAULT '[]'::jsonb,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_customer_name ON orders(customer_name);

-- Insert sample orders (optional - delete if you want)
INSERT INTO orders (order_number, customer_name, status, items, total_price) VALUES
  (1001, 'John Smith', 'pending', '[{"name": "Large Latte", "price": 4.50, "qty": 1}, {"name": "Bacon Roll", "price": 3.20, "qty": 1}]'::jsonb, 7.70),
  (1002, 'Sarah Jones', 'preparing', '[{"name": "Cappuccino", "price": 4.00, "qty": 1}, {"name": "Croissant", "price": 2.50, "qty": 1}]'::jsonb, 6.50),
  (1003, 'Mike Brown', 'completed', '[{"name": "Americano", "price": 3.00, "qty": 2}]'::jsonb, 6.00);
