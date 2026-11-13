import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from './SessionContext';
import { getActiveTrip } from '../services/tripService';

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const { driver } = useSession();
  const [activeTrip, setActiveTrip] = useState(null);
  const driverId = driver?.id;

  useEffect(() => {
    if (!driverId) {
      setActiveTrip(null);
      return;
    }

    getActiveTrip(driverId)
      .then(setActiveTrip)
      .catch((error) => console.warn('No se pudo cargar el viaje activo:', error.message));
  }, [driverId]);

  return (
    <TripContext.Provider value={{ activeTrip, setActiveTrip }}>{children}</TripContext.Provider>
  );
}

export function useTrip() {
  return useContext(TripContext);
}
