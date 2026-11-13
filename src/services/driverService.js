import { supabase } from '../lib/supabase';

export async function getCurrentDriver() {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('drivers')
    .select('id, full_name, email, phone, language, approval_status, vehicles(make, model, plate, category)')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const vehicle = data.vehicles;
  return {
    id: data.id,
    name: data.full_name,
    email: data.email,
    phone: data.phone,
    language: data.language,
    approvalStatus: data.approval_status,
    category: vehicle?.category ?? '',
    vehicle: vehicle ? `${vehicle.make} ${vehicle.model} • ${vehicle.plate}` : '',
  };
}

export async function updateDriverAvailability(driverId, isAvailable) {
  const { error } = await supabase
    .from('drivers')
    .update({ is_available: isAvailable })
    .eq('id', driverId);

  if (error) throw error;
}

export async function updateDriverLocation(driverId, coords) {
  const { error } = await supabase.from('driver_locations').upsert({
    driver_id: driverId,
    latitude: coords.latitude,
    longitude: coords.longitude,
    heading: coords.heading ?? 0,
    speed: coords.speed ?? 0,
    updated_at: new Date().toISOString(),
  });

  if (error) console.warn('No se pudo enviar la ubicación:', error.message);
}
