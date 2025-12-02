export type Post = {
  id: number;
  title: string;
  content: string;
  description: string | null;
  category: 'announcement' | 'patch_notes';
  image_url?: string | null;
  created_at: string;
  author_id?: string;
};

export type Event = {
  id: number;
  title: string;
  content: string;
  description: string | null;
  type: 'storyline' | 'side_event';
  image_url?: string | null;
  event_date: string;
  created_at: string;
};

export type Rank = {
  id: number;
  name: string;
  price: number;
  billing_cycle: 'lifetime' | 'monthly';
  color: string;
  icon_name: string;
  weight: number;
  parent_rank_id: number | null;
  perks: string[] | null;
  sale_price: number | null;
  sale_start_date: string | null;
  sale_end_date: string | null;
  created_at: string;
};

export type SaleConfig = {
  id: number;
  active: boolean;
  sale_start_date: string | null;
  sale_end_date: string | null;
  sale_header: string | null;
  sale_color: string | null;
  discount_type: 'percent' | 'fixed' | null;
  discount_value: number | null;
};

export type LeaderboardConfig = {
  id: string;
  enabled: boolean;
  label: string;
  display_order: number;
};

export type FactionScoreConfig = {
  id: number;
  zombie_kill_multiplier: number;
  player_kill_multiplier: number;
  economy_multiplier: number;
  survival_multiplier: number;
};

export type Season = {
  id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  final_standings_csv: string | null;
};

export type PlayerSnapshot = {
  id: number;
  season_id: number;
  steam_id: string;
  zombie_kills: number;
  player_kills: number;
  hours_survived: number;
  economy_earned: number;
};
