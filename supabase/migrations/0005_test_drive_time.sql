-- INVECS redesign concept: every inquiry needs a preferred test-drive time.
-- Run once in Supabase: SQL Editor → New query → paste → Run.
-- Run it BEFORE pushing the code that asks for the time.
--
-- The website offers hourly slots from 9:00 AM to 4:00 PM (showroom hours are
-- 8 AM to 6 PM), and the database only accepts those slots.
--
-- The 10:00 default fills in older inquiries (sent before the form asked for a
-- time) and keeps the old live form working until the new code is deployed.
-- The new code always sends the visitor's chosen time.

alter table public.inquiries
  add column if not exists preferred_time time not null default '10:00',
  add constraint inquiries_preferred_time_slot
    check (preferred_time between '09:00' and '16:00'
           and extract(minute from preferred_time) = 0
           and extract(second from preferred_time) = 0);
