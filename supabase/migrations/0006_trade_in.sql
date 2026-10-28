-- INVECS redesign concept: optional trade-in details on inquiries.
-- Run once in Supabase: SQL Editor → New query → paste → Run.
-- Run it BEFORE pushing the code that saves trade-ins. The old live form keeps
-- working, because every new column is empty unless a trade-in is given.
--
-- Trade-in details are part of the inquiry row, so the 30-day cleanup deletes them too.

alter table public.inquiries
  add column if not exists trade_in_make text,
  add column if not exists trade_in_model text,
  add column if not exists trade_in_year smallint,
  add column if not exists trade_in_mileage_km integer,
  add column if not exists trade_in_notes text,
  -- All or nothing: make, model and year come together; mileage and notes only with them.
  add constraint inquiries_trade_in_complete check (
    (trade_in_make is null) = (trade_in_model is null)
    and (trade_in_make is null) = (trade_in_year is null)
    and (trade_in_make is not null or (trade_in_mileage_km is null and trade_in_notes is null))
  ),
  add constraint inquiries_trade_in_values check (
    char_length(trade_in_make) between 1 and 40
    and char_length(trade_in_model) between 1 and 60
    and char_length(trade_in_notes) <= 300
    and trade_in_year between 1980 and 2100
    and trade_in_mileage_km between 0 and 1000000
  );
