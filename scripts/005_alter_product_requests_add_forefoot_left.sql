-- Add forefoot_metatarsal_left column to product_requests for left foot configuration
ALTER TABLE product_requests
  ADD COLUMN IF NOT EXISTS forefoot_metatarsal_left TEXT;
