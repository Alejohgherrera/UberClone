import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import PrimaryButton from '../components/PrimaryButton';
import { useTrip } from '../context/TripContext';
import useRouteSimulation from '../hooks/useRouteSimulation';
import { getRoute } from '../services/routeService';
import { updateTripStatus } from '../services/tripService';
import { calculateFare } from '../config/pricing';
import { PAYMENT_LABELS, formatCOP } from '../utils/format';
import { colors } from '../theme/colors';
 
async function getCurrentPoint(fallback) {
  try {
    const position =
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { lat: position.coords.latitude, lng: position.coords.longitude };
  } catch {
    return fallback;
  }
}
 
const toLatLng = (point) => ({ latitude: point.lat, longitude: point.lng });
 
const SIMULATE_TRIP = process.env.EXPO_PUBLIC_SIMULATE_TRIP === 'true';
 
export default function TripScreen({ navigation }) {
  const { activeTrip, setActiveTrip } = useTrip();
  const [route, setRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(true);
  const [saving, setSaving] = useState(false);
  const mapRef = useRef(null);
  const { position: carPosition } = useRouteSimulation(route?.coordinates, SIMULATE_TRIP);
 
  const status = activeTrip?.status;
  const goingToPickup = status === 'accepted' || status === 'driver_arriving';
 
  useEffect(() => {
    if (status !== 'accepted') return;
    updateTripStatus(activeTrip.id, 'driver_arriving')
      .then(setActiveTrip)
      .catch((error) => console.warn('No se pudo actualizar el viaje:', error.message));
  }, [status]);
 
  useEffect(() => {
    if (!activeTrip) return;
    let cancelled = false;
 
    const loadRoute = async () => {
      setLoadingRoute(true);
      try {
        const start = goingToPickup
          ? await getCurrentPoint(activeTrip.origin)
          : activeTrip.origin;
        const end = goingToPickup ? activeTrip.origin : activeTrip.destination;
        const result = await getRoute(start, end);
        if (cancelled) return;
 
        setRoute(result);
        mapRef.current?.fitToCoordinates(result.coordinates, {
          edgePadding: { top: 120, right: 50, bottom: 300, left: 50 },
          animated: true,
        });
      } catch (error) {
        if (!cancelled) Alert.alert('Ruta no disponible', error.message);
      } finally {
        if (!cancelled) setLoadingRoute(false);
      }
    };
 
    loadRoute();
    return () => {
      cancelled = true;
    };
  }, [activeTrip?.id, goingToPickup]);
 
  const runAction = async (action) => {
    try {
      setSaving(true);
      await action();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el viaje. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };
 
  const handlePassengerOnBoard = () =>
    runAction(async () => {
      setActiveTrip(await updateTripStatus(activeTrip.id, 'in_progress'));
    });
 
  const handleFinish = () =>
    runAction(async () => {
      const result = calculateFare(activeTrip);
      const routePoints = route?.coordinates.map((point) => [point.latitude, point.longitude]);
 
      const completed = await updateTripStatus(activeTrip.id, 'completed', {
        fare: result.fare,
        commission: result.commission,
        tip: result.tip,
        driver_earnings: result.driverEarnings,
        commission_rate: result.commissionRate,
        completed_at: new Date().toISOString(),
        route: routePoints ?? null,
      });
 
      setActiveTrip(completed);
      navigation.replace('TripSummary');
    });
 
  const handleCancel = () => {
    Alert.alert('Cancelar viaje', '¿Seguro que quieres cancelar este viaje?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: () =>
          runAction(async () => {
            await updateTripStatus(activeTrip.id, 'cancelled');
            setActiveTrip(null);
            navigation.goBack();
          }),
      },
    ]);
  };
 
  if (!activeTrip) return null;
 
  const target = goingToPickup ? activeTrip.origin : activeTrip.destination;
 
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        showsUserLocation={!SIMULATE_TRIP}
        initialRegion={{
          ...toLatLng(target),
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={toLatLng(activeTrip.origin)} title="Recogida" pinColor="green" />
        <Marker coordinate={toLatLng(activeTrip.destination)} title="Destino" />
        {route && (
          <Polyline coordinates={route.coordinates} strokeWidth={5} strokeColor={colors.blue} />
        )}
        {carPosition && (
          <Marker coordinate={carPosition} anchor={{ x: 0.5, y: 0.5 }} title="Tu vehículo">
            <Text style={styles.car}>🚗</Text>
          </Marker>
        )}
      </MapView>
 
      <SafeAreaView style={styles.banner} edges={['top']}>
        <Text style={styles.bannerLabel}>
          {goingToPickup ? 'Ve al punto de recogida' : 'Lleva al pasajero a su destino'}
        </Text>
        <Text style={styles.bannerAddress} numberOfLines={2}>
          {target.address}
        </Text>
        {loadingRoute ? (
          <ActivityIndicator style={styles.bannerLoader} color={colors.black} />
        ) : route ? (
          <Text style={styles.bannerInfo}>
            {route.distanceKm.toFixed(1)} km • {Math.round(route.durationMin)} min
          </Text>
        ) : null}
      </SafeAreaView>
 
      <SafeAreaView style={styles.panel} edges={['bottom']}>
        <Text style={styles.passenger}>{activeTrip.passengerName || 'Pasajero'}</Text>
        <Text style={styles.detail}>
          {PAYMENT_LABELS[activeTrip.paymentMethod]} • Tarifa estimada{' '}
          {formatCOP(calculateFare(activeTrip).fare)}
        </Text>
 
        {goingToPickup ? (
          <>
            <PrimaryButton
              label="Pasajero a bordo"
              onPress={handlePassengerOnBoard}
              loading={saving}
            />
            <Pressable style={styles.cancel} onPress={handleCancel} disabled={saving}>
              <Text style={styles.cancelText}>Cancelar viaje</Text>
            </Pressable>
          </>
        ) : (
          <PrimaryButton
            label="Finalizar viaje"
            onPress={handleFinish}
            loading={saving}
            style={styles.finish}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
 
const card = {
  backgroundColor: colors.surface,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 8,
};
 
const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    ...card,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  bannerLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', marginTop: 8 },
  bannerAddress: { fontSize: 18, fontWeight: '800', color: colors.black, marginTop: 4 },
  bannerInfo: { fontSize: 14, fontWeight: '700', color: colors.darkGreen, marginTop: 6 },
  bannerLoader: { alignSelf: 'flex-start', marginTop: 6 },
  panel: {
    ...card,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  passenger: { fontSize: 18, fontWeight: '800', color: colors.black },
  detail: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: 4 },
  cancel: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { color: colors.error, fontWeight: '700' },
  finish: { backgroundColor: colors.green },
  car: { fontSize: 28 },
});