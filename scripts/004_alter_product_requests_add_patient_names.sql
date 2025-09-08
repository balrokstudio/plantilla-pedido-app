-- Add patient_name and patient_lastname columns to product_requests
ALTER TABLE product_requests
  ADD COLUMN IF NOT EXISTS patient_name TEXT,
  ADD COLUMN IF NOT EXISTS patient_lastname TEXT;
