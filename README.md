# You Free

Mark the weekends your family has no plans, and see which other families in
your group are free the same day — the app suggests you hang out, and either
side can offer to host or ask for an activity idea. A separate **Golf**
group mode lets friends post when they're free to golf, auto-forms a tee-time
session once two or more overlap, and gives them a group chat to lock in the
course and tee time.

Built with **Next.js (App Router) + Tailwind CSS**, deployed on **Vercel**,
backed by **Supabase** (Postgres, Auth, Realtime).

## Project structure

```
src/app/                Next.js App Router pages
  sign-in/, sign-up/       Auth
  onboarding/family/        Create or join a family
  onboarding/group/          Create or join a group
  (main)/                     Shared nav layout for the 5 core pages:
    free-days/                 Match feed ("You're both free...")
    calendar/                   Mark your family's free dates
    golf/                        Golf: post availability, see tee-time sessions
    groups/                       Manage/join groups, invite codes
    profile/
  match/[id]/               Match detail — host / suggest activity / chat
  golf-session/[id]/         Tee-time session — RSVP / chat
  group/[id]/                 Group roster + invite code
src/
  lib/supabase.ts       Supabase browser client
  providers/             Auth + react-query context providers
  hooks/                  Data-access hooks (one per feature area)
  components/             Shared UI primitives, MonthCalendar, ChatThread
  types/database.ts       Hand-written types mirroring the SQL schema
supabase/migrations/0001_init.sql   Full schema, RLS policies, triggers, seed data
```

## Setup

1. **Install dependencies**:
   ```
   npm install
   ```

2. **Supabase project**: already created — schema, RLS policies, and
   matching/session triggers are live (see `supabase/migrations/0001_init.sql`
   if you ever need to re-apply them to a fresh project).

3. **Environment variables**: copy `.env.example` to `.env` and fill in your
   Supabase project's URL and anon key (Project Settings → API):
   ```
   cp .env.example .env
   ```

4. **Run locally**:
   ```
   npm run dev
   ```
   Opens at `http://localhost:3000`.

## Deploying to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import
   this GitHub repo.
2. Under **Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as your local `.env`).
3. Deploy. Every future push to the connected branch redeploys automatically.

## How matching works

- A family marks a date free on the **Calendar** page → this inserts a row
  into `family_availability`.
- A Postgres trigger checks whether another family in the same group is
  already free that day. If so, it creates (or reuses) a `matches` row, adds
  a `match_participants` row per free family, and opens a `chats` row —
  all automatically, no polling or cron job needed.
- The **Free Days** page reads `matches` for your active family group. Open a
  match to respond (host / suggest an activity / can't make it) and chat.

Golf works the same way: `golf_availability` → trigger → `golf_sessions` +
`golf_session_participants` + a chat, surfaced on the **Golf** page.

## Notes

- You belong to one or more **families** (your household) and one or more
  **groups** (friend circles). A group is either a `family_group` (drives
  the matching feed) or a `golf_group` (drives tee-time coordination).
  Invite people with the invite codes shown on the Groups page.
- Chat is realtime via Supabase Realtime.
