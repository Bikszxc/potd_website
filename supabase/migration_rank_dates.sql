-- Add start/end dates to ranks for specific scheduling
ALTER TABLE ranks ADD COLUMN sale_start_date TIMESTAMPTZ;
ALTER TABLE ranks ADD COLUMN sale_end_date TIMESTAMPTZ;
