-- INVECS redesign concept: general questions from the contact form, and the real showroom details.
-- Run once in Supabase: SQL Editor → New query → paste → Run.
-- Run it BEFORE pushing the code that sends questions. The old live form keeps
-- working, because it always sends a test-drive date and time.
--
-- Before: every inquiry was a test-drive request with a date and time.
-- After: an inquiry is EITHER a test drive (date and time, no topic)
--        OR a question (a topic and a message, no date, time or trade-in).
-- Questions are inquiries too, so the 30-day cleanup deletes them the same way.

-- 1. Questions
alter table public.inquiries
  add column if not exists topic text
    constraint inquiries_topic_values check (topic in ('car', 'service', 'financing', 'other')),
  alter column preferred_date drop not null,
  alter column preferred_time drop not null,
  -- The old 10:00 default would give questions a time; the website always sends one for test drives.
  alter column preferred_time drop default,
  add constraint inquiries_test_drive_or_question check (
    case
      when topic is null then preferred_date is not null and preferred_time is not null
      else preferred_date is null and preferred_time is null and trade_in_make is null
           and char_length(btrim(message)) > 0
    end
  );

-- 2. The showroom's real details, from invecs.ph/contact-us and INVECS (Oct 2026).
--    The street name isn't listed, so the address uses nearby landmarks; the map link finds their Google listing.
update public.branches
set address = 'Near Robinsons Starmills and S&R, San Fernando, Pampanga',
    hours = 'Monday to Saturday, 8:00 AM to 5:00 PM · Closed on Sundays',
    map_url = 'https://www.google.com/maps/search/?api=1&query=Invecs+Auto+Centrum+2MWR%2B6JF+San+Fernando+Pampanga'
where name = 'San Fernando showroom';
