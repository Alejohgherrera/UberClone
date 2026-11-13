-- Simula que un pasajero pide un viaje al conductor con el correo indicado.
-- Cambia el correo de la última línea del where por el tuyo.
-- El conductor debe estar aprobado y "Disponible" en la app para verlo.
insert into public.trips (
  driver_id, passenger_name, origin, destination,
  distance_km, duration_min, category, payment_method
)
select
  d.id,
  'Laura Pérez',
  '{"lat": 6.2518, "lng": -75.5636, "address": "Parque Berrío, Medellín"}',
  '{"lat": 6.1977, "lng": -75.5582, "address": "Centro Comercial El Tesoro, Medellín"}',
  8.5,
  22,
  case v.category when 'XL' then 'xl' when 'Premium' then 'premium' else 'economy' end,
  'mercadopago'
from public.drivers d
join public.vehicles v on v.driver_id = d.id
where d.email = 'TU_CORREO@gmail.com'
returning id, driver_id, status, category;
 
tiene menú contextual