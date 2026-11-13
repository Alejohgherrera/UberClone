import { useCallback, useEffect, useState } from 'react';
import { subscribeToTripRequests, updateTripStatus } from '../services/tripService';

const REQUEST_SECONDS = 15;

export default function useTripRequests(driverId, isListening) {
  const [request, setRequest] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(REQUEST_SECONDS);

  useEffect(() => {
    if (!driverId || !isListening) return;

    const unsubscribe = subscribeToTripRequests(driverId, (trip) => {
      setRequest(trip);
      setSecondsLeft(REQUEST_SECONDS);
    });

    return unsubscribe;
  }, [driverId, isListening]);

  const reject = useCallback(async () => {
    if (!request) return;
    const trip = request;
    setRequest(null);
    try {
      await updateTripStatus(trip.id, 'rejected');
    } catch (error) {
      console.warn('No se pudo rechazar el viaje:', error.message);
    }
  }, [request]);

  const accept = useCallback(async () => {
    const trip = request;
    setRequest(null);
    return updateTripStatus(trip.id, 'accepted', { accepted_at: new Date().toISOString() });
  }, [request]);

  useEffect(() => {
    if (!request) return;

    if (secondsLeft <= 0) {
      reject();
      return;
    }

    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [request, secondsLeft, reject]);

  return { request, secondsLeft, totalSeconds: REQUEST_SECONDS, accept, reject };
}
