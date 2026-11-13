import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DriverMap from '../components/DriverMap';
import AvailabilitySwitch from '../components/AvailabilitySwitch';
import RideRequestModal from '../components/RideRequestModal';
import useDriverLocation from '../hooks/useDriverLocation';
import useTripRequests from '../hooks/useTripRequests';
import useEarnings from '../hooks/useEarnings';
import { useSession } from '../context/SessionContext';
import { useTrip } from '../context/TripContext';
import { updateDriverAvailability, updateDriverLocation } from '../services/driverService';
import { getPreference, setPreference } from '../services/preferences';
import { formatCOP } from '../utils/format';
import { colors } from '../theme/colors';

export default function HomeScreen({ navigation }) {
  const { driver, refreshDriver } = useSession();
  const { activeTrip, setActiveTrip } = useTrip();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const mapRef = useRef(null);
  const driverId = driver?.id;

  const {
    location,
    hasPermission,
    isLoading: isLoadingLocation,
    requestPermissions,
    refreshLocation,
    startTracking,
    stopTracking,
  } = useDriverLocation();

  const earnings = useEarnings(driverId);

  const { request, secondsLeft, totalSeconds, accept, reject } = useTripRequests(
    driverId,
    isAvailable && !activeTrip
  );

  const centerMap = (target, delta = 0.012) => {
    if (!target || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: target.latitude,
        longitude: target.longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      },
      600
    );
  };

  const handleCenterMap = async () => {
    const target = location ?? (await refreshLocation());
    centerMap(target);
  };

  const goOnline = async () => {
    const current = await refreshDriver();
    const status = current?.approvalStatus;

    if (status !== 'approved') {
      Alert.alert(
        'Conexión no permitida',
        status === 'rejected'
          ? 'Tu cuenta fue rechazada. Contacta a soporte.'
          : 'Tu cuenta está en revisión. Podrás conectarte cuando aprueben tus documentos.'
      );
      return;
    }

    if (!hasPermission && !(await requestPermissions())) {
      Alert.alert('Permiso obligatorio', 'Debes permitir tu ubicación para recibir viajes.');
      return;
    }

    await updateDriverAvailability(driverId, true);
    await startTracking((coords) => updateDriverLocation(driverId, coords));
    centerMap(location, 0.01);
    setIsAvailable(true);
    setPreference('lastAvailability', true);
  };

  const goOffline = async () => {
    stopTracking();
    await updateDriverAvailability(driverId, false);
    setIsAvailable(false);
    setPreference('lastAvailability', false);
  };

  const handleToggleAvailability = async () => {
    try {
      setIsActionLoading(true);
      if (isAvailable) await goOffline();
      else await goOnline();
    } catch (error) {
      Alert.alert('Error', 'No fue posible cambiar tu estado. Inténtalo de nuevo.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAccept = useCallback(async () => {
    try {
      const trip = await accept();
      setActiveTrip(trip);
    } catch (error) {
      Alert.alert('Error', 'No se pudo aceptar el viaje. Puede que ya haya expirado.');
    }
  }, [accept, setActiveTrip]);

  useEffect(() => {
    if (!activeTrip) return;
    if (activeTrip.status === 'completed') navigation.navigate('TripSummary');
    else navigation.navigate('Trip');
  }, [activeTrip?.id]);

  useEffect(() => {
    getPreference('lastAvailability', false).then((wasAvailable) => {
      if (wasAvailable) handleToggleAvailability();
    });
  }, []);

  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  if (!driver) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <DriverMap
        mapRef={mapRef}
        location={location}
        isAvailable={isAvailable}
        isLoadingLocation={isLoadingLocation}
        hasPermission={hasPermission}
        onRequestPermission={requestPermissions}
        onCenterMap={handleCenterMap}
      />

      <SafeAreaView style={styles.topNav} edges={['top']}>
        <Pressable style={styles.circleBtn} onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>

        <Pressable style={styles.earningsPill} onPress={() => navigation.navigate('Ganancias')}>
          <Text style={styles.earningsIcon}>💵</Text>
          <Text style={styles.earningsText}>{formatCOP(earnings.today.net)}</Text>
        </Pressable>

        <Pressable
          style={styles.circleBtn}
          onPress={() => Alert.alert('Centro de seguridad', 'Asistencia 24/7 de UberClone.')}
        >
          <Text style={styles.shieldIcon}>🛡️</Text>
        </Pressable>
      </SafeAreaView>

      <AvailabilitySwitch
        isAvailable={isAvailable}
        isLoading={isActionLoading}
        onToggle={handleToggleAvailability}
        driverStatus={driver.approvalStatus}
        todayEarnings={earnings.today.net}
        todayTrips={earnings.today.trips}
      />

      <RideRequestModal
        trip={request}
        secondsLeft={secondsLeft}
        totalSeconds={totalSeconds}
        onAccept={handleAccept}
        onReject={reject}
      />
    </SafeAreaView>
  );
}

const floating = {
  backgroundColor: colors.surface,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.18,
  shadowRadius: 4,
  elevation: 5,
  borderWidth: 1,
  borderColor: colors.border,
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  topNav: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 15,
  },
  circleBtn: {
    ...floating,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { fontSize: 20, fontWeight: '800', color: colors.black },
  shieldIcon: { fontSize: 20 },
  earningsPill: {
    ...floating,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  earningsIcon: { fontSize: 14, marginRight: 6 },
  earningsText: { fontSize: 14, fontWeight: '800', color: colors.black },
});
