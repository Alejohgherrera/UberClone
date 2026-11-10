import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DriverMap from '../components/DriverMap';
import AvailabilitySwitch from '../components/AvailabilitySwitch';
import DriverMenuModal from '../components/DriverMenuModal';
import RideRequestModal from '../components/RideRequestModal';
import useDriverLocation from '../hooks/useDriverLocation';
import {
  getCurrentDriverProfile,
  getDriverApprovalStatus,
  setLocalApprovalStatus,
  subscribeToRideRequests,
  updateDriverAvailability,
  updateDriverLocation,
} from '../services/driverService';
import { colors } from '../theme/colors';

export default function HomeScreen({ onNavigateToRegistration }) {
  // 1. Estados solicitados con useState
  const [isAvailable, setIsAvailable] = useState(false);
  const [driverStatus, setDriverStatus] = useState('approved'); // 'approved' | 'pending' | 'rejected'
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeRideRequest, setActiveRideRequest] = useState(null);
  const [driverProfile, setDriverProfile] = useState(getCurrentDriverProfile());

  // Referencia para animar el mapa
  const mapRef = useRef(null);

  // Referencia para cancelar la suscripción de solicitudes
  const rideRequestUnsubRef = useRef(null);

  // 2. Hook personalizado de geolocalización
  const {
    location,
    hasPermission,
    isLoading: isLoadingLocation,
    requestPermissions,
    refreshLocation,
    startTracking,
    stopTracking,
  } = useDriverLocation();

  // Carga inicial del estado de aprobación del conductor desde el servicio
  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getDriverApprovalStatus();
      setDriverStatus(status);
    };
    fetchStatus();
  }, []);

  /**
   * 3. Funciones memorizadas con useCallback
   */

  // Centrar el mapa en las coordenadas actuales
  const handleCenterMap = useCallback(async () => {
    let target = location;
    if (!target) {
      target = await refreshLocation();
    }
    if (target && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: target.latitude,
          longitude: target.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        },
        700
      );
    }
  }, [location, refreshLocation]);

  // Activar Disponibilidad (Ponerse en línea)
  const handleGoOnline = useCallback(async () => {
    try {
      setIsActionLoading(true);

      // Verificación estricta del estado de aprobación
      if (driverStatus !== 'approved') {
        setIsActionLoading(false);
        Alert.alert(
          'Conexión no permitida',
          driverStatus === 'rejected'
            ? 'Tu cuenta de conductor ha sido rechazada por el equipo de revisión. Contacta a soporte para más detalles.'
            : 'Tu cuenta se encuentra en proceso de revisión (Pendiente). Una vez sean aprobados tus documentos podrás ponerte disponible.'
        );
        return;
      }

      // Verificación de permisos de ubicación
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) {
          setIsActionLoading(false);
          Alert.alert(
            'Permiso obligatorio',
            'Debes autorizar el acceso a tu ubicación en tiempo real para recibir viajes.'
          );
          return;
        }
      }

      // Actualizar disponibilidad en Firestore
      await updateDriverAvailability(driverProfile.driverId, true);

      // Iniciar seguimiento periódico en segundo plano y enviar a Firestore
      await startTracking((newCoords) => {
        updateDriverLocation(driverProfile.driverId, newCoords);
      });

      // Suscribirse a solicitudes de viaje en tiempo real
      if (rideRequestUnsubRef.current) {
        rideRequestUnsubRef.current();
      }
      rideRequestUnsubRef.current = subscribeToRideRequests(
        driverProfile.driverId,
        (incomingRequest) => {
          setActiveRideRequest(incomingRequest);
        }
      );

      // Si tenemos ubicación, centramos el mapa automáticamente
      if (location && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          600
        );
      }

      setIsAvailable(true);
      setIsActionLoading(false);
      console.log('[HomeScreen] Conductor ahora está DISPONIBLE.');
    } catch (err) {
      console.error('[HomeScreen] Error al ponerse en línea:', err);
      setIsActionLoading(false);
      Alert.alert('Error', 'No fue posible conectarse. Inténtalo nuevamente.');
    }
  }, [
    driverStatus,
    hasPermission,
    requestPermissions,
    driverProfile.driverId,
    startTracking,
    location,
  ]);

  // Desactivar Disponibilidad (Desconectarse)
  const handleGoOffline = useCallback(async () => {
    try {
      setIsActionLoading(true);

      // 1. Detener inmediatamente el seguimiento de ubicación
      stopTracking();

      // 2. Cancelar la suscripción de solicitudes
      if (rideRequestUnsubRef.current) {
        rideRequestUnsubRef.current();
        rideRequestUnsubRef.current = null;
      }

      // 3. Actualizar disponibilidad a false en Firestore
      await updateDriverAvailability(driverProfile.driverId, false);

      setIsAvailable(false);
      setIsActionLoading(false);
      console.log('[HomeScreen] Conductor ahora está DESCONECTADO.');
    } catch (err) {
      console.error('[HomeScreen] Error al desconectarse:', err);
      setIsActionLoading(false);
    }
  }, [driverProfile.driverId, stopTracking]);

  // Alternar entre Disponible y No Disponible
  const handleToggleAvailability = useCallback(() => {
    if (isAvailable) {
      handleGoOffline();
    } else {
      handleGoOnline();
    }
  }, [isAvailable, handleGoOffline, handleGoOnline]);

  /**
   * 4. useEffect con función de limpieza obligatoria
   * Si el usuario sale de la pantalla o la aplicación se desmonta,
   * se debe garantizar que se detenga el seguimiento de ubicación y se limpien los listeners.
   */
  useEffect(() => {
    return () => {
      console.log('[HomeScreen:Cleanup] Limpiando suscripciones y seguimiento al salir...');
      stopTracking();
      if (rideRequestUnsubRef.current) {
        rideRequestUnsubRef.current();
        rideRequestUnsubRef.current = null;
      }
      // Aseguramos que en Firestore quede desconectado si sale de la app
      updateDriverAvailability(driverProfile.driverId, false);
    };
  }, [driverProfile.driverId, stopTracking]);

  // Cambiar estado de prueba (aprobado/pendiente/rechazado)
  const handleChangeDriverStatus = (newStatus) => {
    setLocalApprovalStatus(newStatus);
    setDriverStatus(newStatus);
    if (newStatus !== 'approved' && isAvailable) {
      handleGoOffline();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* 1. Componente del mapa con vehículo en tiempo real */}
      <DriverMap
        mapRef={mapRef}
        location={location}
        isAvailable={isAvailable}
        isLoadingLocation={isLoadingLocation}
        hasPermission={hasPermission}
        onRequestPermission={requestPermissions}
        onCenterMap={handleCenterMap}
      />

      {/* 2. Barra flotante superior (Menú de perfil e ingresos) */}
      <View style={styles.topNav}>
        <Pressable
          style={styles.circleBtn}
          onPress={() => setMenuVisible(true)}
          android_ripple={{ color: '#DDD', borderless: true }}
        >
          <Text style={styles.menuBurgerIcon}>☰</Text>
        </Pressable>

        <Pressable style={styles.earningsPill} onPress={() => setMenuVisible(true)}>
          <Text style={styles.earningsPillIcon}>💵</Text>
          <Text style={styles.earningsPillText}>$0.00 COP</Text>
        </Pressable>

        <Pressable
          style={styles.circleBtn}
          onPress={() =>
            Alert.alert(
              'Centro de seguridad',
              'Línea de emergencia y asistencia 24/7 de UberClone.'
            )
          }
          android_ripple={{ color: '#DDD', borderless: true }}
        >
          <Text style={styles.shieldIcon}>🛡️</Text>
        </Pressable>
      </View>

      {/* 3. Interruptor y panel inferior Disponible / No disponible */}
      <AvailabilitySwitch
        isAvailable={isAvailable}
        isLoading={isActionLoading}
        onToggle={handleToggleAvailability}
        driverStatus={driverStatus}
      />

      {/* 4. Modal de menú y perfil del conductor */}
      <DriverMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        driverProfile={driverProfile}
        driverStatus={driverStatus}
        onNavigateToRegistration={onNavigateToRegistration}
      />

      {/* 5. Modal preparado para recepción de viajes en tiempo real */}
      <RideRequestModal
        visible={Boolean(activeRideRequest)}
        request={activeRideRequest}
        onAccept={() => {
          Alert.alert(
            '¡Viaje Aceptado!',
            'Navegando a la ruta de recogida del pasajero...'
          );
          setActiveRideRequest(null);
        }}
        onDecline={() => {
          setActiveRideRequest(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  topNav: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 40,
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 15,
  },
  circleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuBurgerIcon: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.black,
  },
  shieldIcon: {
    fontSize: 20,
  },
  earningsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  earningsPillIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  earningsPillText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.black,
  },
});

