-- INVECS redesign concept: initial schema, Row Level Security and storage.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
--
-- Security model
--   cars, car_photos, branches : anyone can read; only the admin can write.
--   inquiries                  : anyone can create; only the admin can read/update/delete.
--   admins                     : list of admin user ids; managed from the dashboard only.
-- "Automatically expose new tables" is off for this project, so every table
-- below is granted to the API roles explicitly. RLS then filters the rows.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.body_type as enum ('suv', 'pickup', 'sedan', 'van');
create type public.transmission as enum ('automatic', 'manual');
create type public.fuel as enum ('diesel', 'gasoline', 'hybrid');
create type public.car_status as enum ('available', 'reserved', 'sold');
create type public.inquiry_status as enum ('new', 'contacted', 'closed');
create type public.contact_method as enum ('call', 'viber', 'messenger', 'email');

-- ---------------------------------------------------------------------------
-- Admin check
-- ---------------------------------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- security definer: runs with the owner's rights so it can read public.admins,
-- which has no read policy of its own. Empty search_path blocks hijacking.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.cars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  make text not null check (char_length(make) between 1 and 40),
  model text not null check (char_length(model) between 1 and 60),
  variant text not null default '' check (char_length(variant) <= 60),
  year int not null check (year between 1950 and 2100),
  body_type public.body_type not null,
  transmission public.transmission not null,
  fuel public.fuel not null,
  mileage_km int not null check (mileage_km between 0 and 2000000),
  price_php int not null check (price_php between 1 and 100000000),
  color text not null default '' check (char_length(color) <= 40),
  description text not null default '' check (char_length(description) <= 4000),
  features text[] not null default '{}',
  status public.car_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cars_status_created_idx on public.cars (status, created_at desc);

create table public.car_photos (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars (id) on delete cascade,
  path text not null check (char_length(path) <= 300),
  position int not null default 0,
  alt text not null default '' check (char_length(alt) <= 200),
  credit_name text check (char_length(credit_name) <= 100),
  credit_url text check (credit_url ~ '^https://'),
  created_at timestamptz not null default now()
);

create index car_photos_car_position_idx on public.car_photos (car_id, position);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 80),
  address text not null check (char_length(address) <= 300),
  hours text not null check (char_length(hours) <= 200),
  phone text not null check (char_length(phone) <= 40),
  map_url text check (map_url ~ '^https://'),
  messenger_url text check (messenger_url ~ '^https://'),
  position int not null default 0
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  car_id uuid references public.cars (id) on delete set null,
  name text not null check (char_length(name) between 1 and 80),
  phone text check (char_length(phone) <= 30),
  email text check (char_length(email) <= 254),
  contact_method public.contact_method not null,
  preferred_date date,
  message text not null default '' check (char_length(message) <= 1000),
  status public.inquiry_status not null default 'new',
  created_at timestamptz not null default now(),
  -- We need at least one way to reach the buyer.
  constraint inquiries_has_contact check (phone is not null or email is not null)
);

create index inquiries_created_idx on public.inquiries (created_at desc);

-- Keep cars.updated_at current.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cars_set_updated_at
before update on public.cars
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.cars enable row level security;
alter table public.car_photos enable row level security;
alter table public.branches enable row level security;
alter table public.inquiries enable row level security;

-- admins: a signed-in user may only see their own row (used to check admin status).
create policy "Users can see their own admin row"
  on public.admins for select to authenticated
  using (user_id = (select auth.uid()));

-- cars
create policy "Anyone can read cars"
  on public.cars for select to anon, authenticated
  using (true);
create policy "Admin can add cars"
  on public.cars for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admin can edit cars"
  on public.cars for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin can delete cars"
  on public.cars for delete to authenticated
  using ((select public.is_admin()));

-- car_photos
create policy "Anyone can read car photos"
  on public.car_photos for select to anon, authenticated
  using (true);
create policy "Admin can add car photos"
  on public.car_photos for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admin can edit car photos"
  on public.car_photos for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin can delete car photos"
  on public.car_photos for delete to authenticated
  using ((select public.is_admin()));

-- branches
create policy "Anyone can read branches"
  on public.branches for select to anon, authenticated
  using (true);
create policy "Admin can manage branches"
  on public.branches for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- inquiries: the public can only create new ones, never read them back.
create policy "Anyone can send an inquiry"
  on public.inquiries for insert to anon, authenticated
  with check (status = 'new');
create policy "Admin can read inquiries"
  on public.inquiries for select to authenticated
  using ((select public.is_admin()));
create policy "Admin can update inquiries"
  on public.inquiries for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin can delete inquiries"
  on public.inquiries for delete to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Table privileges (RLS above decides which rows each role sees)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

grant select on public.cars, public.car_photos, public.branches to anon, authenticated;
grant insert, update, delete on public.cars, public.car_photos, public.branches to authenticated;

grant insert on public.inquiries to anon, authenticated;
grant select, update, delete on public.inquiries to authenticated;

grant select on public.admins to authenticated;

-- The server-only secret key (seed script, cleanup jobs) bypasses RLS but still needs privileges.
grant all on public.admins, public.cars, public.car_photos, public.branches, public.inquiries to service_role;

-- ---------------------------------------------------------------------------
-- Storage: car photos
-- Public bucket so photos load fast from the CDN; only the admin can upload.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('car-photos', 'car-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Admin can upload car photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'car-photos' and (select public.is_admin()));
create policy "Admin can update car photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'car-photos' and (select public.is_admin()))
  with check (bucket_id = 'car-photos' and (select public.is_admin()));
create policy "Admin can delete car photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'car-photos' and (select public.is_admin()));
-- Update and delete also need the admin to be able to see the files.
create policy "Admin can list car photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'car-photos' and (select public.is_admin()));
