drop table if exists public.ride_requests;

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references public.drivers (id) on delete set null,
  passenger_id uuid,
  passenger_name text,
  origin jsonb not null,
  destination jsonb not null,
  distance_km numeric(6, 2),
  duration_min numeric(6, 1),
  category text not null check (category in ('economy', 'xl', 'premium')),
  fare int,
  commission int,
  tip int not null default 0,
  driver_earnings int,
  commission_rate numeric(4, 3),
  payment_method text not null default 'cash'
    check (payment_method in ('mercadopago', 'stripe', 'cash')),
  payment_status text check (payment_status in ('approved', 'pending', 'rejected', 'cash')),
  payment_id text,
  status text not null default 'requested'
    check (status in ('requested', 'accepted', 'rejected', 'driver_arriving', 'in_progress', 'completed', 'paid', 'cancelled')),
  rating int check (rating between 1 and 5),
  route jsonb,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  completed_at timestamptz
);

create index trips_driver_created_idx on public.trips (driver_id, created_at desc);

alter table public.trips enable row level security;

create policy "trips_select_own" on public.trips
  for select to authenticated using (driver_id = auth.uid());

create policy "trips_update_own" on public.trips
  for update to authenticated
  using (driver_id = auth.uid()) with check (driver_id = auth.uid());

alter publication supabase_realtime add table public.trips;

notify pgrst, 'reload schema';
