alter table public.quizzes add column if not exists notify_on_attempt boolean not null default false;
alter table public.attempts add column if not exists notification_status text, add column if not exists notification_provider_id text, add column if not exists notification_error text;
