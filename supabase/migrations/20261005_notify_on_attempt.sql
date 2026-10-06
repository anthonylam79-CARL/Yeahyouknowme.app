-- "Someone took your quiz" emails. Run once in the Supabase SQL editor.
-- Default is true, but the app also ignores quizzes created before NOTIFY_FROM,
-- and does nothing at all until this column exists.
alter table quizzes add column if not exists notify_on_attempt boolean not null default true;
