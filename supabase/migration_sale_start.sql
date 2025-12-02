-- Add sale_start_date to sale_config
ALTER TABLE sale_config ADD COLUMN sale_start_date TIMESTAMPTZ DEFAULT NOW();
