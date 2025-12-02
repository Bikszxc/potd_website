-- Create Sale Config Table (Single Row pattern)
CREATE TABLE sale_config (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  active BOOLEAN DEFAULT FALSE,
  sale_end_date TIMESTAMPTZ,
  sale_header TEXT DEFAULT 'Global Operations Sale',
  sale_color TEXT DEFAULT '#DC2626',
  discount_type TEXT, -- 'percent' or 'fixed'
  discount_value DECIMAL(10, 2)
);

-- Insert default row
INSERT INTO sale_config (id, active) VALUES (1, false);

-- RLS
ALTER TABLE sale_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read sale config" ON sale_config FOR SELECT USING (true);
CREATE POLICY "Admin update sale config" ON sale_config FOR UPDATE USING (auth.role() = 'authenticated');
