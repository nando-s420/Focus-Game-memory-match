-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- (If you already created the table before, use migration.sql instead — it updates
-- your existing table in place without losing data.)

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_type text not null default 'memory',
  difficulty text not null default 'hard',
  moves integer not null,
  time_seconds integer not null,
  note text default '',
  completed_at timestamptz not null default now(),

  -- Sanity checks on the data a round can save. These don't make cheating
  -- impossible (that would need a server-side timer), but they close the
  -- obvious version of it: an attempt can't claim fewer moves than the
  -- number of pairs it says it solved, and can't claim to have taken zero time.
  constraint attempts_difficulty_valid check (difficulty in ('easy', 'hard')),
  constraint attempts_time_positive check (time_seconds > 0),
  constraint attempts_moves_valid check (
    (difficulty = 'easy' and moves >= 6) or
    (difficulty = 'hard' and moves >= 8)
  )
);

-- Row Level Security: every user can only see/edit/delete their own rows.
alter table public.attempts enable row level security;

create policy "Users can read their own attempts"
  on public.attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own attempts"
  on public.attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own attempts"
  on public.attempts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own attempts"
  on public.attempts for delete
  using (auth.uid() = user_id);

create index if not exists attempts_user_id_idx on public.attempts (user_id);
