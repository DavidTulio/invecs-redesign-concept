-- INVECS redesign concept: real INVECS listings (used with permission, Oct 28, 2026).
-- Run once in Supabase: SQL Editor → New query → paste → Run.
-- Run it BEFORE pushing the code that uses these columns. The current live site
-- keeps working: every change below is optional or relaxes a rule.

-- Hatchbacks (e.g. the Suzuki Swift) get their own body type, so filters stay accurate.
alter type public.body_type add value if not exists 'hatchback' before 'van';

alter table public.cars
  -- Some listings don't state the mileage; the site then shows "Ask us".
  alter column mileage_km drop not null,
  -- The card image (a crop of INVECS's "FOR SALE" poster). Empty → the first photo is used.
  add column if not exists card_photo text
    constraint cars_card_photo_length check (card_photo is null or char_length(card_photo) <= 300),
  -- The price printed in the listing photos. If the real price changes, the car page
  -- automatically says the photos show an earlier price.
  add column if not exists photo_price int
    constraint cars_photo_price_range check (photo_price is null or photo_price between 1 and 100000000);
