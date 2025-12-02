-- Add image_url to posts
ALTER TABLE posts ADD COLUMN image_url TEXT;

-- Add image_url to events
ALTER TABLE events ADD COLUMN image_url TEXT;
