# Pinya of The Dead - Project Context

## Project Overview
**Pinya of The Dead (POTD)** is a Next.js 14+ web application acting as the official landing page, content management system (CMS), and leaderboard hub for a hardcore Project Zomboid roleplay server.

The project integrates a **Supabase** backend for dynamic content (news, events, donation ranks) and processes local **JSON files** for player leaderboards. It features a distinct "Tactical Grunge" aesthetic (Dark Navy/Yellow) and comprehensive admin tools.

## Tech Stack
*   **Framework:** Next.js 14+ (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4 (configured via CSS), Framer Motion (animations)
*   **Backend:** Supabase (PostgreSQL, Auth, Storage)
*   **UI Components:** Radix UI (Tooltips, Dialogs), Lucide React (Icons), Sonner (Toasts)
*   **Data Fetching:** Server Components & Server Actions

## Directory Structure
*   **`/app`**: Application routes.
    *   `/admin`: CMS Dashboard (protected route).
    *   `/donate`: Donation tiers and sale information.
    *   `/leaderboards`: Player and faction rankings.
    *   `/news`: Blog-style news and event briefings.
*   **`/actions`**: Server Actions for mutations (create/update/delete posts, events, ranks, sales).
*   **`/components`**: Reusable UI components (Hero, Header, LeaderboardView, PlayerInfo, Admin forms).
*   **`/public/players`**: Data source for leaderboards. Structure: `public/players/{username}/{username}.json`.
*   **`/supabase`**: SQL migration files for database schema.
*   **`/types`**: TypeScript definitions (`Post`, `Event`, `Rank`, `Player`, `Faction`).
*   **`/utils`**: Helper functions (Supabase client, Leaderboard data processing).

## Key Features & Workflows

### 1. Content Management System (CMS)
*   **Access:** `/admin/login` -> `/admin/dashboard`
*   **Auth:** Supabase Auth (Middleware protection).
*   **Capabilities:**
    *   **News/Events:** Create, Edit, Delete, Preview (Markdown support).
    *   **Donations:** Manage Ranks (Perks, Prices, Icons), Schedule Global/Specific Sales.
    *   **Leaderboards:** Toggle visibility of specific leaderboard categories.

### 2. Leaderboards System
*   **Data Source:** Reads individual JSON files from `public/players`.
*   **Processing:** Aggregates data server-side in `utils/leaderboard-data.ts`.
*   **Features:**
    *   Categories: Zombie Kills, Player Kills, Economy, Factions.
    *   **Player Profiles:** Detailed modals showing Stats, Skills, Traits (visual icons), and Loadout.
    *   **Steam Integration:** Fetches live avatars using Steam Web API.

### 3. Donation System
*   **Dynamic Pricing:** Ranks fetched from Supabase.
*   **Currency:** Toggle between PHP (default) and USD (auto-calculated).
*   **Sales:** Automated sale banners and price strikethroughs based on `sale_config` and active dates.

## Development Commands
*   `npm run dev`: Start development server.
*   `npm run build`: Build for production.
*   `npm run start`: Start production server.
*   `npm run lint`: Run ESLint.

## Conventions
*   **Design System:**
    *   **Primary:** `#FED405` (Yellow)
    *   **Background:** `#191A30` (Deep Navy)
    *   **Secondary:** `#131426` (Darker Navy)
*   **Markdown:** Used for News content and Event briefings.
*   **Icons:** Use `lucide-react`.
*   **Formatting:** Prettier/ESLint standard.

## Database Schema (Supabase)
*   `posts`: News and Patch Notes.
*   `events`: Scheduled server events.
*   `ranks`: Donation tiers with prices and perks.
*   `sale_config`: Global sale settings (start/end dates, banners).
*   `leaderboard_config`: Toggle states for leaderboard categories.
