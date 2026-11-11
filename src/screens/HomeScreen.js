import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import DriverMap from '../components/DriverMap';
import AvailabilitySwitch from '../components/AvailabilitySwitch';
import DriverMenuModal from '../components/DriverMenuModal';
import RideRequestModal from '../components/RideRequestModal';
import useDriverLocation from '../hooks/useDriverLocation';
import {
  getCurrentDriver,
  subscribeToRideRequests,
  updateDriverAvailability,
  updateDriverLocation,
  updateRideStatus,
} from '../services/driverService';
import { colors } from '../theme/colors';

export default function HomeScreen({ onOpenRegistration }) {
  const [driver, setDriver] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeRideRequest, setActiveRideRequest] = useState(null);

  const mapRef = useRef(null);
  const unsubscribeRef = useRef(null);

  const {
    location,
    hasPermission,
    isLoading: isLoadingLocation,
    requestPermissions,
    refreshLocation,
    startTracking,
    stopTracking,
  } = useDriverLocation();

  const driverStatus = driver?.approvalStatus ?? 'pending';

  useEffect(() => {
    getCurrentDriver()
      .then(setDriver)
      .catch((error) => Alert.alert('Error', error.message));
  }, []);

  useEffect(() => {
    if (!driver) return;

    return () => {
      stopTracking();
      unsubscribeRef.current?.();
      updateDriverAvailability(driver.id, false).catch(() => {});
    };
  }, [driver, stopTracking]);

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
    if (driverStatus !== 'approved') {
      Alert.alert(
        'Conexión no permitida',
        driverStatus === 'rejected'
          ? 'Tu cuenta fue rechazada. Contacta a soporte.'
          : 'Tu cuenta está en revisión. Podrás conectarte cuando aprueben tus documentos.'
      );
      return;
    }

    if (!hasPermission && !(await requestPermissions())) {
      Alert.alert('Permiso obligatorio', 'Debes permitir tu ubicación para recibir viajes.');
      return;
    }

    await updateDriverAvailability(driver.id, true);
    await startTracking((coords) => updateDriverLocation(driver.id, coords));

    unsubscribeRef.current?.();
    unsubscribeRef.current = subscribeToRideRequests(driver.id, setActiveRideRequest);

    centerMap(location, 0.01);
    setIsAvailable(true);
  };

  const goOffline = async () => {
    stopTracking();
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    await updateDriverAvailability(driver.id, false);
    setIsAvailable(false);
  };

  const handleToggleAvailability = async () => {
    if (!driver) return;
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

  const handleRide = async (status) => {
    const request = activeRideRequest;
    setActiveRideRequest(null);
    try {
      await updateRideStatus(request.id, status);
      if (status === 'accepted') {
        Alert.alert('¡Viaje aceptado!', 'Dirígete al punto de recogida.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el viaje.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DriverMap
        mapRef={mapRef}
        location={location}
        isAvailable={isAvailable}
        isLoadingLocation={isLoadingLocation}
        hasPermission={hasPermission}
        onRequestPermission={requestPermissions}
        onCenterMap={handleCenterMap}
      />

      <View style={styles.topNav}>
        <Pressable style={styles.circleBtn} onPress={() => setMenuVisible(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>

        <Pressable style={styles.earningsPill} onPress={() => setMenuVisible(true)}>
          <Text style={styles.earningsIcon}>💵</Text>
          <Text style={styles.earningsText}>$0 COP</Text>
        </Pressable>

        <Pressable
          style={styles.circleBtn}
          onPress={() => Alert.alert('Centro de seguridad', 'Asistencia 24/7 de UberClone.')}
        >
          <Text style={styles.shieldIcon}>🛡️</Text>
        </Pressable>
      </View>

      <AvailabilitySwitch
        isAvailable={isAvailable}
        isLoading={isActionLoading}
        onToggle={handleToggleAvailability}
        driverStatus={driverStatus}
      />

      <DriverMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        driverProfile={driver}
        driverStatus={driverStatus}
        onNavigateToRegistration={onOpenRegistration}
      />

      <RideRequestModal
        visible={Boolean(activeRideRequest)}
        request={activeRideRequest}
        onAccept={() => handleRide('accepted')}
        onDecline={() => handleRide('rejected')}
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
    top: Platform.OS === 'ios' ? 52 : 40,
    left: 18,
    right: 18,
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
