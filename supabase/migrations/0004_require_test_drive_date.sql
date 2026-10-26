-- INVECS redesign concept: every inquiry needs a preferred test-drive date.
-- Run once in Supabase: SQL Editor → New query → paste → Run.
--
-- Before: the date was optional, so staff often had to ask for it.
-- After: the website asks for it, and the database refuses inquiries without one.

-- 1. Older inquiries without a date get the day after they were sent
--    (inside the allowed range of inquiries_preferred_date_range).
update public.inquiries
set preferred_date = (created_at at time zone 'Asia/Manila')::date + 1
where preferred_date is null;

-- 2. From now on the date can't be empty.
alter table public.inquiries
  alter column preferred_date set not null;
