alter table public.quizzes add column if not exists self_profile integer[];
alter table public.quizzes add column if not exists compatibility_available boolean generated always as (self_profile is not null) stored;
alter table public.quizzes add constraint quiz_profile_valid check (self_profile is null or (array_ndims(self_profile)=1 and array_length(self_profile,1)=20 and array_position(self_profile,null) is null and 0 <= all(self_profile) and 4 >= all(self_profile)));
alter table public.attempts add column if not exists compatibility jsonb;
alter table public.attempts add column if not exists taker_email_status text;
alter table public.attempts add column if not exists taker_email_provider_id text;
