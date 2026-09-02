-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_type text not null default 'memory',
  moves integer not null,
  time_seconds integer not null,
  note text default '',
  completed_at timestamptz not null default now()
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
