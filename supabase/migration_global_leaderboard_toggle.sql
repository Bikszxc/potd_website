-- Insert a global status configuration row
INSERT INTO leaderboard_config (id, enabled, label, display_order)
VALUES ('global_status', true, 'Global Leaderboard Status', -1)
ON CONFLICT (id) DO NOTHING;
