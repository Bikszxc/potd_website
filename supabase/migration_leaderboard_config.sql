-- Create Leaderboard Config Table
CREATE TABLE leaderboard_config (
  id TEXT PRIMARY KEY, -- 'zombie_kills', 'player_kills', etc.
  enabled BOOLEAN DEFAULT TRUE,
  label TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- Insert default rows
INSERT INTO leaderboard_config (id, enabled, label, display_order) VALUES
  ('zombie_kills', true, 'Undead Slayers', 1),
  ('player_kills', true, 'Most Wanted', 2),
  ('economy', true, 'Tycoons', 3),
  ('factions', true, 'Factions', 4);

-- Enable RLS
ALTER TABLE leaderboard_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read leaderboard config" ON leaderboard_config FOR SELECT USING (true);
CREATE POLICY "Admin update leaderboard config" ON leaderboard_config FOR UPDATE USING (auth.role() = 'authenticated');
