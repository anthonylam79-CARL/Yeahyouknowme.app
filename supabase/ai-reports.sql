create table public.ai_quiz_reports (
  quiz_id text primary key references public.quizzes(id) on delete cascade,
  fingerprint text not null,
  report jsonb,
  based_on integer,
  claimed_at timestamptz not null default now()
);
create table public.ai_monthly_usage (
  month date primary key,
  reserved_calls integer not null default 0 check (reserved_calls >= 0)
);
alter table public.ai_quiz_reports enable row level security;
alter table public.ai_monthly_usage enable row level security;
revoke all on public.ai_quiz_reports, public.ai_monthly_usage from anon, authenticated;
grant all on public.ai_quiz_reports, public.ai_monthly_usage to service_role;
create function public.reserve_ai_quiz_report(p_quiz_id text, p_fingerprint text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare v_month date := date_trunc('month', now() at time zone 'UTC')::date; v_count integer;
begin
  -- Lock the quiz, then the shared monthly counter in a consistent order.
  perform 1 from public.quizzes where id = p_quiz_id and is_premium for update;
  if not found then return false; end if;
  if exists(select 1 from public.ai_quiz_reports where quiz_id = p_quiz_id and claimed_at > now() - interval '30 minutes') then return false; end if;
  insert into public.ai_monthly_usage(month) values(v_month) on conflict do nothing;
  select reserved_calls into v_count from public.ai_monthly_usage where month = v_month for update;
  if v_count >= 1000 then return false; end if;
  update public.ai_monthly_usage set reserved_calls = reserved_calls + 1 where month = v_month;
  insert into public.ai_quiz_reports(quiz_id, fingerprint) values(p_quiz_id, p_fingerprint)
    on conflict(quiz_id) do update set fingerprint = excluded.fingerprint, claimed_at = now(), report = null, based_on = null;
  return true;
end;
$$;
revoke execute on function public.reserve_ai_quiz_report(text,text) from public, anon, authenticated;
grant execute on function public.reserve_ai_quiz_report(text,text) to service_role;
