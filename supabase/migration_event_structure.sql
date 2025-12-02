-- Rename description to content (since it holds the main body)
ALTER TABLE events RENAME COLUMN description TO content;

-- Add new description column for the summary
ALTER TABLE events ADD COLUMN description TEXT;
