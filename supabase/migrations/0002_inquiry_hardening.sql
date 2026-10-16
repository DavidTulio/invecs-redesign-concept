-- INVECS redesign concept: inquiry hardening, rate limiting, data retention, branches.
-- Run once in Supabase: SQL Editor → New query → paste → Run.
--
-- Before: anyone with the public key could insert inquiries straight through the API,
-- skipping the CAPTCHA, honeypot and rate limit on the website.
-- After: only our server (secret key) can insert, and only after every check passes.

-- ---------------------------------------------------------------------------
-- 1. Inquiries: no direct inserts from the browser
-- ---------------------------------------------------------------------------
drop policy if exists "Anyone can send an inquiry" on public.inquiries;
revoke insert on public.inquiries from anon, authenticated;

-- Extra safety on the data itself.
alter table public.inquiries
  add constraint inquiries_preferred_date_range
    check (preferred_date is null or preferred_date between (created_at at time zone 'Asia/Manila')::date
                                                       and (created_at at time zone 'Asia/Manila')::date + 120),
  add constraint inquiries_email_format
    check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add constraint inquiries_phone_format
    check (phone is null or phone ~ '^\+639\d{9}$');

-- ---------------------------------------------------------------------------
-- 2. Rate limiting: remember recent attempts per visitor
-- ip_hash is a one-way HMAC of the IP address, so the real IP is never stored.
-- ---------------------------------------------------------------------------
create table public.inquiry_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null check (char_length(ip_hash) = 64),
  created_at timestamptz not null default now()
);

create index inquiry_attempts_ip_time_idx on public.inquiry_attempts (ip_hash, created_at desc);

-- RLS on with no policies: invisible to the public and to signed-in users.
alter table public.inquiry_attempts enable row level security;
grant all on public.inquiry_attempts to service_role;

-- Records an attempt and says whether it is allowed, in one atomic step.
-- The advisory lock stops two simultaneous requests from both slipping under the limit.
create function public.register_inquiry_attempt(
  p_ip_hash text,
  p_max_attempts int default 5,
  p_window interval default interval '10 minutes'
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent int;
begin
  perform pg_advisory_xact_lock(hashtext(p_ip_hash));

  select count(*) into recent
  from public.inquiry_attempts
  where ip_hash = p_ip_hash
    and created_at > now() - p_window;

  if recent >= p_max_attempts then
    return false;
  end if;

  insert into public.inquiry_attempts (ip_hash) values (p_ip_hash);
  return true;
end;
$$;

revoke execute on function public.register_inquiry_attempt(text, int, interval) from public, anon, authenticated;
grant execute on function public.register_inquiry_attempt(text, int, interval) to service_role;

-- ---------------------------------------------------------------------------
-- 3. Privacy: delete inquiries after 30 days, attempts after 1 day
-- Called by the server after each new inquiry and when the admin opens the inbox (Phase 4),
-- and daily by the optional scheduled job in 0003.
-- ---------------------------------------------------------------------------
create function public.purge_expired_data()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.inquiries where created_at < now() - interval '30 days';
  delete from public.inquiry_attempts where created_at < now() - interval '1 day';
$$;

revoke execute on function public.purge_expired_data() from public, anon, authenticated;
grant execute on function public.purge_expired_data() to service_role;

-- ---------------------------------------------------------------------------
-- 4. Branch data (sample hours; address from the dealer's public contact page)
-- ---------------------------------------------------------------------------
alter table public.branches
  add column viber_phone text check (char_length(viber_phone) <= 40),
  add column email text check (char_length(email) <= 254);

insert into public.branches (name, address, hours, phone, viber_phone, email, map_url, messenger_url, position)
values (
  'San Fernando showroom',
  'San Fernando, Pampanga',
  'Monday to Saturday, 8:00 AM to 6:00 PM · Sunday by appointment',
  '+63 920 963 3858',
  '+63 920 963 3858',
  'invecsauto@gmail.com',
  'https://www.google.com/maps/search/?api=1&query=INVECS+Autocentrum+San+Fernando+Pampanga',
  'https://m.me/142362912502027',
  0
);
