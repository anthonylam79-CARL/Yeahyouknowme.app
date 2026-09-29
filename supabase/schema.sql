-- Yeah You Know Me — schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) once per project.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- quizzes
-- ─────────────────────────────────────────────────────────────
create table if not exists quizzes (
  id text primary key,                          -- short slug, e.g. 8-char base36
  maker_name text not null,
  audience text not null check (audience in ('Partner', 'BFF', 'Fam')),
  question_ids integer[] not null,               -- indexes into the shared question bank
  answers integer[] not null,                    -- maker's picks, 0-3, same length as question_ids. NEVER exposed to guessers.
  owner_token_hash text not null,                 -- sha256(owner_token), lets the maker fetch full results
  maker_email text,                               -- optional, for notifications
  created_at timestamptz not null default now()
);

-- Public can read question_ids + maker_name + audience (via a view, see below),
-- but answers/owner_token_hash must never be selectable by anon.
alter table quizzes enable row level security;

-- Anyone can insert a new quiz (creating a quiz needs no auth).
create policy "anyone can create a quiz"
  on quizzes for insert
  to anon
  with check (true);

-- No direct anon SELECT on quizzes — reads go through the public_quiz_view below
-- and the /api/results route (service-role only, gated by owner_token).
revoke select on quizzes from anon;

-- A view that exposes only what a guesser needs to play: never the answers.
create or replace view public_quiz_view as
  select id, maker_name, audience, question_ids, created_at
  from quizzes;

grant select on public_quiz_view to anon;

-- ─────────────────────────────────────────────────────────────
-- attempts
-- ─────────────────────────────────────────────────────────────
create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id text not null references quizzes(id) on delete cascade,
  guesser_name text not null,
  guesses integer[] not null,                    -- guesser's picks, same length as quiz.question_ids
  score integer not null,                         -- computed server-side at insert time
  hits boolean[] not null,                        -- per-question correct/incorrect, computed server-side
  age_bracket text check (age_bracket in ('13-17','18-24','25-34','35-44','45+')),
  gender text check (gender in ('Woman','Man','Nonbinary','Prefer not to say')),
  created_at timestamptz not null default now()
);

alter table attempts enable row level security;

-- Attempts are written only by the server (service role), which computes the
-- score itself from the quiz's real answers — never trust a client-submitted score.
revoke insert, select, update, delete on attempts from anon;

create index if not exists attempts_quiz_id_idx on attempts (quiz_id);

-- ─────────────────────────────────────────────────────────────
-- Aggregated, anonymized percentile support (for the demographic ranking
-- feature — see backend-spec.md's "Honesty rule" section: this must only
-- ever be computed from real rows, never estimated client-side).
-- ─────────────────────────────────────────────────────────────
create or replace view bracket_stats as
  select
    age_bracket,
    gender,
    array_length(guesses, 1) as quiz_length,
    count(*) as attempt_count,
    percentile_cont(0.5) within group (order by score::float / nullif(array_length(guesses,1),0)) as median_ratio
  from attempts
  where age_bracket is not null and gender is not null
  group by age_bracket, gender, array_length(guesses, 1);

-- Not exposed to anon directly; the /api/percentile route (service role)
-- reads this and enforces the 100-attempt minimum before returning a number.
