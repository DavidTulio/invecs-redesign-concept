-- INVECS redesign concept: the showroom's exact street address, from INVECS's own posters.
-- Run once in Supabase: SQL Editor → New query → paste → Run.
-- Data only, no schema change. Run it BEFORE pushing: the site caches the branch details
-- for days, and the next build only shows the new address if the database already has it.

update public.branches
set address = 'Jose Abad Santos Avenue, City of San Fernando, Pampanga (in front of S&R, beside Starbucks)'
where name = 'San Fernando showroom';
