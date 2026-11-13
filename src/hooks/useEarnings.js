import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getPaidTrips } from '../services/tripService';
import { startOfMonth, startOfToday, startOfWeek } from '../utils/dates';

function summarize(trips, from) {
  const list = trips.filter((trip) => new Date(trip.completedAt) >= from);
  const total = (key) => list.reduce((sum, trip) => sum + (trip[key] ?? 0), 0);
  const net = total('driverEarnings');

  return {
    trips: list.length,
    billed: total('fare'),
    commissions: total('commission'),
    tips: total('tip'),
    net,
    average: list.length ? Math.round(net / list.length) : 0,
  };
}

export default function useEarnings(driverId) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!driverId) return;
    try {
      setLoading(true);
      setTrips(await getPaidTrips(driverId));
    } catch (error) {
      console.warn('No se pudieron cargar las ganancias:', error.message);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const summary = useMemo(
    () => ({
      today: summarize(trips, startOfToday()),
      week: summarize(trips, startOfWeek()),
      month: summarize(trips, startOfMonth()),
      balance: trips.reduce(
        (sum, trip) =>
          trip.paymentMethod === 'cash' ? sum - trip.commission : sum + trip.driverEarnings,
        0
      ),
    }),
    [trips]
  );

  return { ...summary, loading, reload: load };
}
