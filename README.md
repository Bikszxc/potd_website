# Pinya of The Dead - Website & CMS

A high-impact landing page and CMS for the "Pinya of The Dead" Project Zomboid server.

## Tech Stack
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth)
- **Language:** TypeScript

## Setup Instructions

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Supabase Setup:**
    - Create a new Supabase project.
    - Run the SQL commands found in `supabase/schema.sql` in your Supabase SQL Editor to create the tables and policies.
    - Go to **Project Settings > API** and copy your `URL` and `anon` public key.

3.  **Environment Variables:**
    - Open `.env.local` and replace the placeholder values with your actual Supabase credentials:
      ```env
      NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
      ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

5.  **Access Admin Panel:**
    - Go to `http://localhost:3000/admin/login`
    - Note: You need to create a user in Supabase Auth first. The current RLS policies allow any authenticated user to create posts/events. In a production environment, you should add an `is_admin` check to the RLS policies or Middleware.

## Features
- **Public Interface:** Hero section, Narrative scroll (Zig-zag), Comms Hub (Announcements, Patch Notes, Events).
- **Admin Dashboard:** Secure login, Create Posts (Announcements/Patch Notes), Create Events (Storyline/Side Events).
- **Design:** "Tactical Grunge" theme with custom Tailwind configuration.