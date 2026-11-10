import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

/**
 * Hook personalizado para manejar la geolocalización del conductor en tiempo real.
 *
 * Utiliza:
 * - useState: para almacenar coordenadas actuales, estado de permisos, errores y estados de carga.
 * - useEffect: para solicitar permisos y obtener la posición inicial con su respectiva función de limpieza.
 * - useCallback: para memorizar las funciones de solicitud de permisos y seguimiento.
 */
export default function useDriverLocation() {
  const [location, setLocation] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  // Referencia para almacenar la suscripción de watchPositionAsync y evitar fugas de memoria o múltiples watchers
  const locationSubscriptionRef = useRef(null);

  /**
   * Solicita permisos de ubicación al usuario.
   */
  const requestPermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);

      if (!granted) {
        setErrorMsg('Permiso de ubicación denegado. Actívalo en los ajustes de tu dispositivo para recibir viajes.');
        setIsLoading(false);
        return false;
      }

      // Obtener posición actual inicial una vez otorgado el permiso
      const currentPos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (currentPos?.coords) {
        setLocation({
          latitude: currentPos.coords.latitude,
          longitude: currentPos.coords.longitude,
          heading: currentPos.coords.heading ?? 0,
          speed: currentPos.coords.speed ?? 0,
          accuracy: currentPos.coords.accuracy ?? 0,
        });
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      console.warn('[useDriverLocation] Error al solicitar permisos o ubicación:', err);
      setErrorMsg('No fue posible obtener tu ubicación actual. Revisa que el GPS esté activado.');
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Refresca la posición actual del conductor de forma manual (ej. al centrar el mapa).
   */
  const refreshLocation = useCallback(async () => {
    try {
      if (hasPermission === false) {
        const granted = await requestPermissions();
        if (!granted) return null;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (pos?.coords) {
        const newCoords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          heading: pos.coords.heading ?? 0,
          speed: pos.coords.speed ?? 0,
          accuracy: pos.coords.accuracy ?? 0,
        };
        setLocation(newCoords);
        return newCoords;
      }
      return null;
    } catch (err) {
      console.warn('[useDriverLocation] Error al refrescar posición:', err);
      return null;
    }
  }, [hasPermission, requestPermissions]);

  /**
   * Detiene el seguimiento periódico de ubicación.
   * Cancela la suscripción activa.
   */
  const stopTracking = useCallback(() => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
      console.log('[useDriverLocation] Seguimiento de ubicación detenido.');
    }
    setIsTracking(false);
  }, []);

  /**
   * Inicia el seguimiento continuo de ubicación en segundo plano/tiempo real.
   * Ejecuta un callback cada vez que el conductor se desplaza o pasan algunos segundos.
   *
   * @param {(coords: { latitude: number, longitude: number, heading?: number, speed?: number }) => void} onLocationUpdate
   */
  const startTracking = useCallback(
    async (onLocationUpdate) => {
      try {
        // Detener cualquier seguimiento previo para evitar duplicados
        stopTracking();

        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          const granted = await requestPermissions();
          if (!granted) return;
        }

        setIsTracking(true);

        // Suscribirse a cambios de posición usando watchPositionAsync
        // Actualiza cada 4 segundos o si el conductor se mueve 5 metros
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 4000,
            distanceInterval: 5,
          },
          (newPos) => {
            if (newPos?.coords) {
              const updated = {
                latitude: newPos.coords.latitude,
                longitude: newPos.coords.longitude,
                heading: newPos.coords.heading ?? 0,
                speed: newPos.coords.speed ?? 0,
                accuracy: newPos.coords.accuracy ?? 0,
              };

              // Actualiza estado interno del hook
              setLocation(updated);

              // Notifica al callback externo (ej. para enviar a Firestore)
              if (onLocationUpdate) {
                onLocationUpdate(updated);
              }
            }
          }
        );

        locationSubscriptionRef.current = subscription;
        console.log('[useDriverLocation] Seguimiento de ubicación iniciado exitosamente.');
      } catch (err) {
        console.warn('[useDriverLocation] Error al iniciar watchPositionAsync:', err);
        setIsTracking(false);
      }
    },
    [requestPermissions, stopTracking]
  );

  /**
   * useEffect con función de limpieza obligatoria.
   * Se ejecuta al montar el componente para obtener permisos iniciales,
   * y limpia cualquier suscripción activa al desmontarse para prevenir fugas de memoria.
   */
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (isMounted) {
        await requestPermissions();
      }
    };

    init();

    return () => {
      isMounted = false;
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
        console.log('[useDriverLocation:Cleanup] Suscripción de ubicación liberada.');
      }
    };
  }, [requestPermissions]);

  return {
    location,
    hasPermission,
    isLoading,
    errorMsg,
    isTracking,
    requestPermissions,
    refreshLocation,
    startTracking,
    stopTracking,
  };
}

