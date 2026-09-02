-- Run this ONLY if you already ran the original schema.sql and have a live
-- attempts table with data in it (e.g. your test account's rounds).
-- This updates it in place — nothing is dropped or lost.
--
-- Supabase → SQL Editor → New query → paste this → Run.

alter table public.attempts
  add column if not exists difficulty text not null default 'hard';

-- Backfill safety: anything inserted before this migration was always the
-- 8-pair board, so defaulting existing rows to 'hard' above is accurate.

alter table public.attempts
  add constraint attempts_difficulty_valid check (difficulty in ('easy', 'hard'));

alter table public.attempts
  add constraint attempts_time_positive check (time_seconds > 0);

alter table public.attempts
  add constraint attempts_moves_valid check (
    (difficulty = 'easy' and moves >= 6) or
    (difficulty = 'hard' and moves >= 8)
  );
