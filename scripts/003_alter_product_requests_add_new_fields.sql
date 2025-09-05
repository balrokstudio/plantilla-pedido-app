-- Option B: Add physical columns for new product fields
ALTER TABLE product_requests
  ADD COLUMN IF NOT EXISTS template_color TEXT,
  ADD COLUMN IF NOT EXISTS template_size TEXT,
  ADD COLUMN IF NOT EXISTS forefoot_metatarsal TEXT,
  ADD COLUMN IF NOT EXISTS anterior_wedge TEXT,
  ADD COLUMN IF NOT EXISTS midfoot_arch TEXT,
  ADD COLUMN IF NOT EXISTS midfoot_external_wedge TEXT,
  ADD COLUMN IF NOT EXISTS rearfoot_calcaneus TEXT,
  ADD COLUMN IF NOT EXISTS heel_raise_mm TEXT;

-- Optional: backfill defaults if needed (currently leaving NULLs)
-- UPDATE product_requests SET template_color = '', template_size = '' WHERE template_color IS NULL OR template_size IS NULL;
