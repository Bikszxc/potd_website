CREATE TABLE IF NOT EXISTS player_blacklist (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  reason TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_player_blacklist_username ON player_blacklist(username);
