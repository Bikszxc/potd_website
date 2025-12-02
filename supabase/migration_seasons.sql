CREATE TABLE IF NOT EXISTS seasons (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT FALSE,
  final_standings_csv TEXT
);

CREATE TABLE IF NOT EXISTS player_season_snapshots (
  id SERIAL PRIMARY KEY,
  season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
  steam_id TEXT NOT NULL,
  zombie_kills INTEGER DEFAULT 0,
  player_kills INTEGER DEFAULT 0,
  hours_survived FLOAT DEFAULT 0,
  economy_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_season_snapshots_season_steam ON player_season_snapshots(season_id, steam_id);
