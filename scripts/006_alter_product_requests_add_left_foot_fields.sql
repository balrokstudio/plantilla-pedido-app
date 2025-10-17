-- Add left foot configuration columns to product_requests
ALTER TABLE product_requests
  ADD COLUMN IF NOT EXISTS anterior_wedge_left TEXT,
  ADD COLUMN IF NOT EXISTS anterior_wedge_left_mm TEXT,
  ADD COLUMN IF NOT EXISTS midfoot_arch_left TEXT,
  ADD COLUMN IF NOT EXISTS rearfoot_calcaneus_left TEXT,
  ADD COLUMN IF NOT EXISTS heel_raise_left_mm TEXT,
  ADD COLUMN IF NOT EXISTS posterior_wedge_left TEXT,
  ADD COLUMN IF NOT EXISTS posterior_wedge_left_mm TEXT;
