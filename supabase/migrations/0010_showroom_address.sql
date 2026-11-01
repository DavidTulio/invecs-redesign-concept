-- INVECS redesign concept: the showroom's exact street address, from INVECS's own posters.
-- Run once in Supabase: SQL Editor → New query → paste → Run.
-- Data only, no schema change, so it can run before or after the code is merged.

update public.branches
set address = 'Jose Abad Santos Avenue, City of San Fernando, Pampanga (in front of S&R, beside Starbucks)'
where name = 'San Fernando showroom';
