import { supabase } from '../lib/supabase';

const ACTIVE_STATUSES = ['accepted', 'driver_arriving', 'in_progress', 'completed'];
export const PAGE_SIZE = 20;

export function mapTrip(row) {
  return {
    id: row.id,
    passengerName: row.passenger_name,
    origin: row.origin,
    destination: row.destination,
    distanceKm: Number(row.distance_km),
    durationMin: Number(row.duration_min),
    category: row.category,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    paymentId: row.payment_id,
    fare: row.fare,
    commission: row.commission,
    commissionRate: row.commission_rate,
    tip: row.tip,
    driverEarnings: row.driver_earnings,
    status: row.status,
    rating: row.rating,
    route: row.route,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

export async function getActiveTrip(driverId) {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('driver_id', driverId)
    .in('status', ACTIVE_STATUSES)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapTrip(data) : null;
}

export async function getTrip(tripId) {
  const { data, error } = await supabase.from('trips').select('*').eq('id', tripId).single();
  if (error) throw error;
  return mapTrip(data);
}

export async function updateTripStatus(tripId, status, extra = {}) {
  const { data, error } = await supabase
    .from('trips')
    .update({ status, ...extra })
    .eq('id', tripId)
    .select()
    .single();

  if (error) throw error;
  return mapTrip(data);
}

export function subscribeToTripRequests(driverId, onRequest) {
  const channel = supabase
    .channel(`trip-requests-${driverId}-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'trips',
        filter: `driver_id=eq.${driverId}`,
      },
      ({ new: row }) => {
        if (row.status === 'requested') onRequest(mapTrip(row));
      }
    )
    .subscribe((status, error) => {
      console.log('[Realtime solicitudes]', status, error?.message ?? '');
    });

  return () => supabase.removeChannel(channel);
}

export function subscribeToTrip(tripId, onChange) {
  const channel = supabase
    .channel(`trip-${tripId}-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'trips',
        filter: `id=eq.${tripId}`,
      },
      ({ new: row }) => onChange(mapTrip(row))
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function createPaymentLink(tripId) {
  const { data, error } = await supabase.functions.invoke('create-payment', {
    body: { tripId },
  });

  if (error) {
    let message = 'No se pudo crear el cobro con Mercado Pago.';
    try {
      const body = await error.context.json();
      if (body?.error) message = body.error;
    } catch {
      // la respuesta no trae JSON
    }
    throw new Error(message);
  }
  return data.checkoutUrl;
}

export async function getPaidTrips(driverId) {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('driver_id', driverId)
    .eq('status', 'paid')
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return data.map(mapTrip);
}

export async function getTripHistory(driverId, { from, to, paymentMethod, page }) {
  let query = supabase
    .from('trips')
    .select('*')
    .eq('driver_id', driverId)
    .in('status', ['completed', 'paid'])
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (from) query = query.gte('created_at', from.toISOString());
  if (to) query = query.lt('created_at', to.toISOString());
  if (paymentMethod) query = query.eq('payment_method', paymentMethod);

  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapTrip);
}
