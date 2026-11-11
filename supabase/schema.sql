create table public.drivers (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  document_number text not null unique,
  phone text not null,
  birth_date date not null,
  gender text not null,
  email text not null unique,
  language text not null default 'Español',
  photo_path text,
  mercado_pago_email text not null,
  terms_accepted_at timestamptz not null,
  approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected')),
  is_available boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.vehicles (
  driver_id uuid primary key references public.drivers (id) on delete cascade,
  category text not null check (category in ('Económico', 'Comfort', 'XL', 'Premium')),
  plate text not null unique,
  make text not null,
  model text not null,
  year int not null check (year between 1990 and 2100),
  color text not null,
  capacity int not null check (capacity between 1 and 8),
  photo_path text
);

create table public.driver_documents (
  driver_id uuid primary key references public.drivers (id) on delete cascade,
  license_number text not null,
  license_photo_path text,
  license_expiry date not null,
  soat_photo_path text,
  soat_expiry date not null,
  revision_photo_path text,
  revision_expiry date
);

create table public.driver_locations (
  driver_id uuid primary key references public.drivers (id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  heading double precision default 0,
  speed double precision default 0,
  updated_at timestamptz not null default now()
);

create table public.ride_requests (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references public.drivers (id) on delete set null,
  passenger_name text,
  pickup_address text not null,
  dropoff_address text not null,
  fare numeric(12, 2),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Seguridad: cada conductor solo ve y edita lo suyo
alter table public.drivers enable row level security;
alter table public.vehicles enable row level security;
alter table public.driver_documents enable row level security;
alter table public.driver_locations enable row level security;
alter table public.ride_requests enable row level security;

create policy "drivers_select_own" on public.drivers
  for select to authenticated using (id = auth.uid());

create policy "drivers_insert_own" on public.drivers
  for insert to authenticated
  with check (id = auth.uid() and approval_status = 'pending' and is_available = false);

create policy "drivers_update_own" on public.drivers
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and (is_available = false or approval_status = 'approved'));

-- El conductor no puede aprobarse a sí mismo
revoke update on public.drivers from authenticated;
grant update (
  id, full_name, document_number, phone, birth_date, gender, email, language,
  photo_path, mercado_pago_email, terms_accepted_at, is_available
) on public.drivers to authenticated;

create policy "vehicles_own" on public.vehicles
  for all to authenticated
  using (driver_id = auth.uid()) with check (driver_id = auth.uid());

create policy "documents_own" on public.driver_documents
  for all to authenticated
  using (driver_id = auth.uid()) with check (driver_id = auth.uid());

create policy "locations_own" on public.driver_locations
  for all to authenticated
  using (driver_id = auth.uid()) with check (driver_id = auth.uid());

create policy "rides_select_own" on public.ride_requests
  for select to authenticated using (driver_id = auth.uid());

create policy "rides_update_own" on public.ride_requests
  for update to authenticated
  using (driver_id = auth.uid()) with check (driver_id = auth.uid());

-- Realtime para que el conductor reciba solicitudes al instante
alter publication supabase_realtime add table public.ride_requests;

-- Bucket privado para fotos y documentos (carpeta = id del conductor)
insert into storage.buckets (id, name, public)
values ('driver-files', 'driver-files', false)
on conflict (id) do nothing;

create policy "files_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'driver-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "files_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'driver-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "files_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'driver-files' and (storage.foldername(name))[1] = auth.uid()::text);
