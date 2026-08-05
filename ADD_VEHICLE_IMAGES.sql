-- Adds support for storing a chosen still image per vehicle.
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

-- 1. Add the image_url column to the vehicles table (safe to re-run)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create a public storage bucket for the stored vehicle photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-photos', 'vehicle-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Allow anyone with the anon/public key to read, upload, and overwrite vehicle photos.
--    Tighten these policies later if you add authentication.
DROP POLICY IF EXISTS "Public read access for vehicle photos" ON storage.objects;
CREATE POLICY "Public read access for vehicle photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-photos');

DROP POLICY IF EXISTS "Public upload access for vehicle photos" ON storage.objects;
CREATE POLICY "Public upload access for vehicle photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vehicle-photos');

DROP POLICY IF EXISTS "Public update access for vehicle photos" ON storage.objects;
CREATE POLICY "Public update access for vehicle photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vehicle-photos');
