import { supabase } from '../lib/supabase';

export async function getCurrentDriver() {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('drivers')
    .select('id, full_name, email, approval_status, vehicles(make, model, plate, category)')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const vehicle = data.vehicles;
  return {
    id: data.id,
    name: data.full_name,
    email: data.email,
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

export function subscribeToRideRequests(driverId, onNewRequest) {
  const channel = supabase
    .channel(`ride-requests-${driverId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ride_requests',
        filter: `driver_id=eq.${driverId}`,
      },
      ({ new: row }) => {
        if (row.status !== 'pending') return;
        onNewRequest({
          id: row.id,
          passengerName: row.passenger_name,
          pickupAddress: row.pickup_address,
          dropoffAddress: row.dropoff_address,
          fare: row.fare ? `$${Number(row.fare).toLocaleString('es-CO')} COP` : null,
        });
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function updateRideStatus(requestId, status) {
  const { error } = await supabase.from('ride_requests').update({ status }).eq('id', requestId);
  if (error) throw error;
}
