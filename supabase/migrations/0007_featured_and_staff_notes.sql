-- INVECS redesign concept: featured cars and private staff notes on inquiries.
-- Run once in Supabase: SQL Editor → New query → paste → Run.
-- Run it BEFORE pushing the code that uses these columns. The current live site
-- keeps working, because both columns have a default.

-- Featured cars appear first in the home page's "Latest arrivals" (up to 3, set by staff).
alter table public.cars
  add column if not exists featured boolean not null default false;

-- Notes only staff can see. The existing admin-only rules on inquiries already cover
-- reading and updating them, and the 30-day cleanup deletes them with the inquiry.
alter table public.inquiries
  add column if not exists staff_notes text not null default ''
    constraint inquiries_staff_notes_length check (char_length(staff_notes) <= 1000);
