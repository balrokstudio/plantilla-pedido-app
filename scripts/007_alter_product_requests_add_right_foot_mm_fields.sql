-- Add millimeter fields for right foot wedges to product_requests
ALTER TABLE product_requests
  ADD COLUMN IF NOT EXISTS anterior_wedge_mm TEXT,
  ADD COLUMN IF NOT EXISTS posterior_wedge_mm TEXT;
