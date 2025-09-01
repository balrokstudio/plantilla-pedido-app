-- Create product options table (configurable by admin)
CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'product_type', 'zone_option_1', etc.
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers/orders table
CREATE TABLE IF NOT EXISTS customer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lastname TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products in each order table
CREATE TABLE IF NOT EXISTS product_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_request_id UUID REFERENCES customer_requests(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  zone_option_1 TEXT DEFAULT 'Ninguna',
  zone_option_2 TEXT DEFAULT 'Ninguna',
  zone_option_3 TEXT DEFAULT 'Ninguna',
  zone_option_4 TEXT DEFAULT 'Ninguna',
  zone_option_5 TEXT DEFAULT 'Ninguna',
  heel_height TEXT DEFAULT 'Ninguna',
  posterior_wedge TEXT DEFAULT 'No',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system configuration table
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to product_options (read-only for clients)
CREATE POLICY "Allow public read access to active product options" ON product_options
  FOR SELECT USING (is_active = true);

-- Create policies for customer_requests (public can insert, no read/update/delete)
CREATE POLICY "Allow public insert to customer requests" ON customer_requests
  FOR INSERT WITH CHECK (true);

-- Create policies for product_requests (public can insert, no read/update/delete)
CREATE POLICY "Allow public insert to product requests" ON product_requests
  FOR INSERT WITH CHECK (true);

-- Admin policies will be added when authentication is implemented
-- For now, we'll allow full access for development
CREATE POLICY "Allow all operations on product_options for development" ON product_options
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on customer_requests for development" ON customer_requests
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on product_requests for development" ON product_requests
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on app_settings for development" ON app_settings
  FOR ALL USING (true) WITH CHECK (true);
