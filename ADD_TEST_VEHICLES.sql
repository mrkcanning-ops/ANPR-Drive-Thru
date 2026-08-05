-- Add test vehicles for ANPR detection testing
-- Run this in Supabase SQL editor to populate vehicles with real detected plates

-- Clear existing test data (optional - remove if you want to keep old data)
DELETE FROM vehicles WHERE plate IN ('as52rxz', 'a552rxz', 'AB12CDE');

-- Insert test vehicles with plates detected by your camera
INSERT INTO vehicles (id, plate, make, model, year, colour, image_url)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'as52rxz',
    'Mercedes',
    'Sprinter',
    2022,
    'White',
    NULL
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'a552rxz',
    'Ford',
    'Transit',
    2021,
    'Gray',
    NULL
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    'AB12CDE',
    'Tesla',
    'Model 3',
    2023,
    'Black',
    NULL
  );

-- Optional: Link vehicles to customer for full dashboard experience
-- Uncomment and adjust if you have customer records
/*
INSERT INTO vehicle_customers (vehicle_id, customer_id)
SELECT '550e8400-e29b-41d4-a716-446655440001'::uuid, id FROM customers LIMIT 1;
*/

SELECT 'Test vehicles added successfully' AS status;
