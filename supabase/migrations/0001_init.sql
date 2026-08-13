-- You Free — initial schema
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh project.

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists pgcrypto;

-- ============================================================================
-- Helpers
-- ============================================================================
create or replace function public.random_code(len int default 8)
returns text
language sql
volatile
as $$
  select upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, len));
$$;

-- ============================================================================
-- Tables
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  phone text,
  created_at timestamptz not null default now()
);

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default public.random_code(8),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.family_members (
  family_id uuid not null references public.families (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (family_id, profile_id)
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('family_group', 'golf_group')),
  invite_code text not null unique default public.random_code(8),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- One row per person who has joined a group. For family_group memberships,
-- family_id identifies which family that person represents in the group.
create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  family_id uuid references public.families (id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (group_id, profile_id)
);

create table public.family_availability (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  family_id uuid not null references public.families (id) on delete cascade,
  date date not null,
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (group_id, family_id, date)
);

create table public.golf_availability (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  time_window text check (time_window in ('morning', 'afternoon', 'evening', 'flexible')) default 'flexible',
  course_preference text,
  created_at timestamptz not null default now(),
  unique (group_id, profile_id, date)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  date date not null,
  status text not null default 'open' check (status in ('open', 'planned', 'declined')),
  created_at timestamptz not null default now(),
  unique (group_id, date)
);

create table public.match_participants (
  match_id uuid not null references public.matches (id) on delete cascade,
  family_id uuid not null references public.families (id) on delete cascade,
  response text not null default 'pending' check (response in ('pending', 'host', 'suggest_activity', 'declined')),
  responded_at timestamptz,
  primary key (match_id, family_id)
);

create table public.activity_suggestions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  created_at timestamptz not null default now()
);

create table public.golf_sessions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  date date not null,
  time_window text,
  course text,
  status text not null default 'proposed' check (status in ('proposed', 'confirmed', 'cancelled')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (group_id, date)
);

create table public.golf_session_participants (
  session_id uuid not null references public.golf_sessions (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'in' check (status in ('in', 'maybe', 'out')),
  joined_at timestamptz not null default now(),
  primary key (session_id, profile_id)
);

create table public.chats (
  id uuid primary key default gen_random_uuid(),
  context_type text not null check (context_type in ('match', 'golf_session')),
  context_id uuid not null,
  created_at timestamptz not null default now(),
  unique (context_type, context_id)
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_chat_id_created_at_idx on public.chat_messages (chat_id, created_at);
create index family_availability_group_date_idx on public.family_availability (group_id, date);
create index golf_availability_group_date_idx on public.golf_availability (group_id, date);

-- ============================================================================
-- Membership helper functions (security definer so RLS policies that call
-- them don't recurse into the tables they themselves query).
-- ============================================================================

create or replace function public.is_group_member(target_group uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.group_members gm
    where gm.group_id = target_group and gm.profile_id = auth.uid()
  );
$$;

create or replace function public.is_family_member(target_family uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.family_members fm
    where fm.family_id = target_family and fm.profile_id = auth.uid()
  );
$$;

create or replace function public.is_match_participant(target_match uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.match_participants mp
    where mp.match_id = target_match and public.is_family_member(mp.family_id)
  );
$$;

create or replace function public.is_golf_session_participant(target_session uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.golf_session_participants gsp
    where gsp.session_id = target_session and gsp.profile_id = auth.uid()
  );
$$;

create or replace function public.is_chat_participant(target_chat uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select case c.context_type
    when 'match' then public.is_match_participant(c.context_id)
    when 'golf_session' then public.is_golf_session_participant(c.context_id)
    else false
  end
  from public.chats c
  where c.id = target_chat;
$$;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Whoever creates a family is automatically its owner.
create or replace function public.handle_new_family()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.created_by is not null then
    insert into public.family_members (family_id, profile_id, role)
    values (new.id, new.created_by, 'owner')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_family_created
  after insert on public.families
  for each row execute function public.handle_new_family();

-- When a family posts a free date, upsert a match against every other family
-- in the group that's free the same day, and make sure a chat exists for it.
create or replace function public.handle_family_availability_insert()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  match_row public.matches;
  other_family uuid;
begin
  select fa.family_id into other_family
  from public.family_availability fa
  where fa.group_id = new.group_id
    and fa.date = new.date
    and fa.family_id <> new.family_id
  limit 1;

  if other_family is null then
    return new;
  end if;

  insert into public.matches (group_id, date)
  values (new.group_id, new.date)
  on conflict (group_id, date) do update set group_id = excluded.group_id
  returning * into match_row;

  insert into public.match_participants (match_id, family_id)
  select match_row.id, fa.family_id
  from public.family_availability fa
  where fa.group_id = new.group_id and fa.date = new.date
  on conflict do nothing;

  insert into public.chats (context_type, context_id)
  values ('match', match_row.id)
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_family_availability_insert
  after insert on public.family_availability
  for each row execute function public.handle_family_availability_insert();

-- Same idea for golf: 2+ golfers free the same day forms a proposed session.
create or replace function public.handle_golf_availability_insert()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  session_row public.golf_sessions;
  other_profile uuid;
begin
  select ga.profile_id into other_profile
  from public.golf_availability ga
  where ga.group_id = new.group_id
    and ga.date = new.date
    and ga.profile_id <> new.profile_id
  limit 1;

  if other_profile is null then
    -- Still track the single golfer as a tentative session of one, so it
    -- shows up on their own golf tab immediately.
    insert into public.golf_sessions (group_id, date, time_window, course)
    values (new.group_id, new.date, new.time_window, new.course_preference)
    on conflict (group_id, date) do nothing
    returning * into session_row;

    if session_row.id is null then
      select * into session_row from public.golf_sessions
      where group_id = new.group_id and date = new.date;
    end if;

    insert into public.golf_session_participants (session_id, profile_id)
    values (session_row.id, new.profile_id)
    on conflict do nothing;

    insert into public.chats (context_type, context_id)
    values ('golf_session', session_row.id)
    on conflict do nothing;

    return new;
  end if;

  insert into public.golf_sessions (group_id, date, time_window, course)
  values (new.group_id, new.date, new.time_window, new.course_preference)
  on conflict (group_id, date) do update set group_id = excluded.group_id
  returning * into session_row;

  insert into public.golf_session_participants (session_id, profile_id)
  select session_row.id, ga.profile_id
  from public.golf_availability ga
  where ga.group_id = new.group_id and ga.date = new.date
  on conflict do nothing;

  insert into public.chats (context_type, context_id)
  values ('golf_session', session_row.id)
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_golf_availability_insert
  after insert on public.golf_availability
  for each row execute function public.handle_golf_availability_insert();

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.family_availability enable row level security;
alter table public.golf_availability enable row level security;
alter table public.matches enable row level security;
alter table public.match_participants enable row level security;
alter table public.activity_suggestions enable row level security;
alter table public.golf_sessions enable row level security;
alter table public.golf_session_participants enable row level security;
alter table public.chats enable row level security;
alter table public.chat_messages enable row level security;

-- profiles: readable by any signed-in user (needed to show names in chats/
-- matches), writable only by the owner.
create policy "profiles are readable by authenticated users" on public.profiles
  for select to authenticated using (true);
create policy "users can update their own profile" on public.profiles
  for update to authenticated using (id = auth.uid());
create policy "users can insert their own profile" on public.profiles
  for insert to authenticated with check (id = auth.uid());

-- families: readable by any signed-in user so a family can be looked up by
-- invite code before joining; membership rows are what actually gate data.
create policy "families are readable by authenticated users" on public.families
  for select to authenticated using (true);
create policy "users can create families" on public.families
  for insert to authenticated with check (created_by = auth.uid());
create policy "family owners can update their family" on public.families
  for update to authenticated using (public.is_family_member(id));

-- family_members: only visible to members of that family; joining inserts
-- your own row.
create policy "family members can see their family's roster" on public.family_members
  for select to authenticated using (public.is_family_member(family_id));
create policy "users can join a family as themselves" on public.family_members
  for insert to authenticated with check (profile_id = auth.uid());
create policy "users can leave a family" on public.family_members
  for delete to authenticated using (profile_id = auth.uid());

-- groups: readable by any signed-in user so a group can be looked up by
-- invite code before joining.
create policy "groups are readable by authenticated users" on public.groups
  for select to authenticated using (true);
create policy "users can create groups" on public.groups
  for insert to authenticated with check (created_by = auth.uid());

-- group_members: only visible to members of that group; joining inserts
-- your own row.
create policy "group members can see the roster" on public.group_members
  for select to authenticated using (public.is_group_member(group_id));
create policy "users can join a group as themselves" on public.group_members
  for insert to authenticated with check (profile_id = auth.uid());
create policy "users can leave a group" on public.group_members
  for delete to authenticated using (profile_id = auth.uid());

-- family_availability: visible to the whole group (that's the point — see
-- who else is free); only your own family can add/remove its free dates.
create policy "group members can see free dates" on public.family_availability
  for select to authenticated using (public.is_group_member(group_id));
create policy "family members can mark their family free" on public.family_availability
  for insert to authenticated
  with check (public.is_family_member(family_id) and public.is_group_member(group_id));
create policy "family members can remove their family's free dates" on public.family_availability
  for delete to authenticated using (public.is_family_member(family_id));

-- golf_availability: visible to the whole golf group; only you can add/
-- remove your own availability.
create policy "group members can see golf availability" on public.golf_availability
  for select to authenticated using (public.is_group_member(group_id));
create policy "users can post their own golf availability" on public.golf_availability
  for insert to authenticated
  with check (profile_id = auth.uid() and public.is_group_member(group_id));
create policy "users can remove their own golf availability" on public.golf_availability
  for delete to authenticated using (profile_id = auth.uid());

-- matches: visible to the whole group; created only by the trigger (no
-- direct insert policy for regular users).
create policy "group members can see matches" on public.matches
  for select to authenticated using (public.is_group_member(group_id));

-- match_participants: visible to the whole group; a family can only update
-- (host / suggest activity / decline) its own row.
create policy "group members can see match participants" on public.match_participants
  for select to authenticated using (
    exists (select 1 from public.matches m where m.id = match_id and public.is_group_member(m.group_id))
  );
create policy "families can respond on their own behalf" on public.match_participants
  for update to authenticated using (public.is_family_member(family_id));

-- activity_suggestions: public read-only reference data.
create policy "activity suggestions are readable by authenticated users" on public.activity_suggestions
  for select to authenticated using (true);

-- golf_sessions: visible to the whole group; created only by the trigger.
create policy "group members can see golf sessions" on public.golf_sessions
  for select to authenticated using (public.is_group_member(group_id));
create policy "group members can update golf sessions" on public.golf_sessions
  for update to authenticated using (public.is_group_member(group_id));

-- golf_session_participants: visible to the whole group; you manage your
-- own RSVP.
create policy "group members can see golf session participants" on public.golf_session_participants
  for select to authenticated using (
    exists (
      select 1 from public.golf_sessions gs
      where gs.id = session_id and public.is_group_member(gs.group_id)
    )
  );
create policy "users can rsvp to a golf session" on public.golf_session_participants
  for insert to authenticated with check (profile_id = auth.uid());
create policy "users can update their own rsvp" on public.golf_session_participants
  for update to authenticated using (profile_id = auth.uid());

-- chats: visible only to participants of the underlying match/session.
create policy "participants can see their chat" on public.chats
  for select to authenticated using (public.is_chat_participant(id));

-- chat_messages: visible/postable only by participants of the underlying
-- match/session; you can only send messages as yourself.
create policy "participants can read chat messages" on public.chat_messages
  for select to authenticated using (public.is_chat_participant(chat_id));
create policy "participants can send chat messages" on public.chat_messages
  for insert to authenticated
  with check (sender_id = auth.uid() and public.is_chat_participant(chat_id));

-- ============================================================================
-- Realtime
-- ============================================================================
-- The app subscribes to new chat_messages rows via Supabase Realtime.
alter publication supabase_realtime add table public.chat_messages;

-- ============================================================================
-- Seed data
-- ============================================================================
insert into public.activity_suggestions (title, description, category) values
  ('Backyard cookout', 'Grill out and let the kids run around together.', 'food'),
  ('Local park meetup', 'Pick a park roughly in the middle and bring a frisbee or ball.', 'outdoor'),
  ('Board game night', 'Everyone brings a favorite game and a snack to share.', 'indoor'),
  ('Pizza and a movie', 'Order pizza, pick a family-friendly movie, keep it low-key.', 'indoor'),
  ('Bowling', 'Book a couple of lanes and split the shoe rental.', 'activity'),
  ('Hiking trail', 'Pick an easy trail that works for the youngest kid in the group.', 'outdoor'),
  ('Pool day', 'Community pool or a family with a backyard pool hosts.', 'outdoor'),
  ('Trampoline park', 'High-energy option that tires the kids out fast.', 'activity');
