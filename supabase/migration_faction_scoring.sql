CREATE TABLE IF NOT EXISTS faction_score_config (
  id SERIAL PRIMARY KEY,
  zombie_kill_multiplier FLOAT NOT NULL DEFAULT 3.0,
  player_kill_multiplier FLOAT NOT NULL DEFAULT 10.0,
  economy_multiplier FLOAT NOT NULL DEFAULT 0.02,
  survival_multiplier FLOAT NOT NULL DEFAULT 0.05,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert default row if not exists
INSERT INTO faction_score_config (id, zombie_kill_multiplier, player_kill_multiplier, economy_multiplier, survival_multiplier)
SELECT 1, 3.0, 10.0, 0.02, 0.05
WHERE NOT EXISTS (SELECT 1 FROM faction_score_config WHERE id = 1);
