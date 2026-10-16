-- OPTIONAL: run the 30-day cleanup every day, even if nobody submits or logs in.
-- The app already cleans up after each inquiry and on admin login, so this is a backup.
-- If "create extension" fails, enable "pg_cron" in Dashboard → Database → Extensions
-- (or Integrations → Cron), then run only the cron.schedule line.

create extension if not exists pg_cron with schema pg_catalog;

-- 03:00 Philippine time = 19:00 UTC. Scheduling the same name again replaces the job.
select cron.schedule('purge-expired-inquiries', '0 19 * * *', 'select public.purge_expired_data()');
