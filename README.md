# You Free

Mark the weekends your family has no plans, and see which other families in
your group are free the same day — the app suggests you hang out, and either
side can offer to host or ask for an activity idea. A separate **Golf**
group mode lets friends post when they're free to golf, auto-forms a tee-time
session once two or more overlap, and gives them a group chat to lock in the
course and tee time.

Built with **Expo (React Native) + Expo Router** and **Supabase** (Postgres,
Auth, Realtime).

## Project structure

```
app/                  Expo Router screens (file-based routing)
  (auth)/              Sign in / sign up
  (onboarding)/         Create or join a family, then a group
  (tabs)/                Free Days feed, Calendar, Golf, Groups, Profile
  match/[id].tsx          Match detail — host / suggest activity / chat
  golf-session/[id].tsx    Tee-time session — RSVP / chat
  group/[id].tsx           Group roster + invite code
src/
  lib/supabase.ts       Supabase client
  providers/             Auth + react-query context providers
  hooks/                  Data-access hooks (one per feature area)
  components/             Shared UI primitives + ChatThread
  theme/                  Colors, spacing, typography tokens
  types/database.ts       Hand-written types mirroring the SQL schema
supabase/migrations/0001_init.sql   Full schema, RLS policies, triggers, seed data
```

## Setup

1. **Install dependencies** (already done if you just cloned this):
   ```
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is enough).

3. **Run the schema migration**: open the SQL editor in your Supabase
   project and run the contents of `supabase/migrations/0001_init.sql`.
   This creates every table, the matching/session triggers, row-level
   security policies, and seeds the activity-suggestion list.

4. **Set your environment variables**: copy `.env.example` to `.env` and
   fill in your project's URL and anon key (Project Settings → API):
   ```
   cp .env.example .env
   ```

5. **Run the app**:
   ```
   npx expo start
   ```
   Scan the QR code with Expo Go (iOS/Android), or press `i` / `a` for a
   simulator.

## How matching works

- A family marks a date free on the **Calendar** tab → this inserts a row
  into `family_availability`.
- A Postgres trigger checks whether another family in the same group is
  already free that day. If so, it creates (or reuses) a `matches` row, adds
  a `match_participants` row per free family, and opens a `chats` row —
  all automatically, no polling or cron job needed.
- The **Free Days** tab reads `matches` for your active family group. Open a
  match to respond (host / suggest an activity / can't make it) and chat.

Golf works the same way: `golf_availability` → trigger → `golf_sessions` +
`golf_session_participants` + a chat, surfaced on the **Golf** tab.

## Notes

- You belong to one or more **families** (your household) and one or more
  **groups** (friend circles). A group is either a `family_group` (drives
  the matching feed) or a `golf_group` (drives tee-time coordination).
  Invite people with the invite codes shown on the Groups tab.
- Chat is realtime via Supabase Realtime — make sure the migration's
  `alter publication supabase_realtime add table public.chat_messages;`
  line ran successfully (it's included in `0001_init.sql`).
