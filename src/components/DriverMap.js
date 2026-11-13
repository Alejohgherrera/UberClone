import { memo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
 
// Coordenadas seguras de fallback (centro de Bogotá) únicamente mientras se obtiene el GPS real
const DEFAULT_FALLBACK_REGION = {
  latitude: 4.60971,
  longitude: -74.08175,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};
 
function DriverMap({
  mapRef,
  location,
  isAvailable,
  isLoadingLocation,
  hasPermission,
  onRequestPermission,
  onCenterMap,
}) {
  const insets = useSafeAreaInsets();
  const belowNav = { top: insets.top + 66 };
  const belowPill = { top: insets.top + 116 };
 
  const initialRegion = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }
    : DEFAULT_FALLBACK_REGION;
 
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false} // Usamos nuestro propio marcador de vehículo personalizado
        showsCompass={false}
        showsMyLocationButton={false}
        rotateEnabled={true}
        pitchEnabled={false}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            rotation={location.heading || 0}
            title={isAvailable ? 'Vehículo en línea' : 'Vehículo desconectado'}
          >
            <View style={styles.markerContainer}>
              {/* Anillo de pulso visible cuando está disponible */}
              {isAvailable && <View style={styles.pulseRing} />}
              <View
                style={[
                  styles.vehicleBadge,
                  isAvailable ? styles.vehicleBadgeOnline : styles.vehicleBadgeOffline,
                ]}
              >
                <Text style={styles.carIcon}>🚗</Text>
              </View>
            </View>
          </Marker>
        )}
      </MapView>
 
      {/* Indicador de carga mientras se obtiene la posición satelital */}
      {isLoadingLocation && (
        <View style={[styles.loadingBanner, belowPill]}>
          <ActivityIndicator size="small" color={colors.black} />
          <Text style={styles.loadingText}>Obteniendo tu ubicación GPS...</Text>
        </View>
      )}
 
      {/* Banner de error cuando los permisos son denegados */}
      {hasPermission === false && (
        <View style={[styles.errorBanner, belowPill]}>
          <Text style={styles.errorBannerText}>
            Permisos de ubicación desactivados. No puedes recibir viajes sin ubicación.
          </Text>
          <Pressable style={styles.retryBtn} onPress={onRequestPermission}>
            <Text style={styles.retryBtnText}>Activar GPS</Text>
          </Pressable>
        </View>
      )}
 
      {/* Botón flotante para centrar mapa en ubicación actual */}
      <Pressable
        style={styles.recenterButton}
        onPress={onCenterMap}
        android_ripple={{ color: '#E0E0E0', borderless: true }}
      >
        <Text style={styles.recenterIcon}>🎯</Text>
      </Pressable>
 
      {/* Píldora de estado en la parte superior del mapa */}
      <View style={[styles.topStatusContainer, belowNav]}>
        <View
          style={[
            styles.statusPill,
            isAvailable ? styles.statusPillOnline : styles.statusPillOffline,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isAvailable ? styles.statusDotOnline : styles.statusDotOffline,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isAvailable ? styles.statusTextOnline : styles.statusTextOffline,
            ]}
          >
            {isAvailable ? 'EN LÍNEA • BUSCANDO VIAJES' : 'DESCONECTADO'}
          </Text>
        </View>
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  pulseRing: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(6, 193, 103, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(6, 193, 103, 0.6)',
  },
  vehicleBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 2,
  },
  vehicleBadgeOnline: {
    borderColor: colors.green,
  },
  vehicleBadgeOffline: {
    borderColor: colors.muted,
  },
  carIcon: {
    fontSize: 20,
  },
  topStatusContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 5,
  },
  statusPillOnline: {
    backgroundColor: colors.black,
  },
  statusPillOffline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginRight: 8,
  },
  statusDotOnline: {
    backgroundColor: colors.green,
  },
  statusDotOffline: {
    backgroundColor: '#8E8E93',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextOnline: {
    color: '#FFF',
  },
  statusTextOffline: {
    color: colors.black,
  },
  recenterButton: {
    position: 'absolute',
    right: 18,
    bottom: 240, // Por encima del panel inferior
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recenterIcon: {
    fontSize: 22,
  },
  loadingBanner: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.black,
    fontWeight: '600',
  },
  errorBanner: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FECDCA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 4,
  },
  errorBannerText: {
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: colors.black,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
 
export default memo(DriverMap);
 