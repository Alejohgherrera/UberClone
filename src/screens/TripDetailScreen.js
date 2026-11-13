import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { formatDateTime } from '../utils/dates';
import { CATEGORY_LABELS, PAYMENT_LABELS, PAYMENT_STATUS_LABELS, formatCOP } from '../utils/format';
import { colors } from '../theme/colors';
 
function Row({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}
 
const toLatLng = (point) => ({ latitude: point.lat, longitude: point.lng });
 
export default function TripDetailScreen({ route }) {
  const { trip } = route.params;
  const path = (trip.route ?? []).map(([latitude, longitude]) => ({ latitude, longitude }));
  const coordinates = path.length ? path : [toLatLng(trip.origin), toLatLng(trip.destination)];
 
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: (trip.origin.lat + trip.destination.lat) / 2,
          longitude: (trip.origin.lng + trip.destination.lng) / 2,
          latitudeDelta: Math.abs(trip.origin.lat - trip.destination.lat) * 1.8 + 0.01,
          longitudeDelta: Math.abs(trip.origin.lng - trip.destination.lng) * 1.8 + 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        <Marker coordinate={toLatLng(trip.origin)} pinColor="green" />
        <Marker coordinate={toLatLng(trip.destination)} />
        <Polyline coordinates={coordinates} strokeWidth={4} strokeColor={colors.blue} />
      </MapView>
 
      <Text style={styles.date}>{formatDateTime(trip.createdAt)}</Text>
      <Text style={styles.route}>
        {trip.origin.address} → {trip.destination.address}
      </Text>
 
      <View style={styles.card}>
        <Row label="Categoría" value={CATEGORY_LABELS[trip.category]} />
        <Row label="Distancia" value={`${trip.distanceKm} km`} />
        <Row label="Duración" value={`${Math.round(trip.durationMin)} min`} />
        <Row label="Pasajero" value={trip.passengerName || '—'} />
        <Row label="Calificación" value={trip.rating ? `★ ${trip.rating}` : 'Sin calificación'} />
      </View>
 
      <View style={styles.card}>
        <Row label="Tarifa" value={formatCOP(trip.fare)} />
        <Row
          label={`Comisión (${Math.round((trip.commissionRate ?? 0) * 100)}%)`}
          value={`- ${formatCOP(trip.commission)}`}
        />
        <Row label="Propina" value={formatCOP(trip.tip)} />
        <Row label="Ganancia neta" value={formatCOP(trip.driverEarnings)} bold />
        <Row label="Método de pago" value={PAYMENT_LABELS[trip.paymentMethod]} />
        <Row label="Estado del pago" value={PAYMENT_STATUS_LABELS[trip.paymentStatus] ?? 'Sin cobrar'} />
      </View>
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  content: { padding: 16, backgroundColor: colors.background },
  map: { height: 220, borderRadius: 14, marginBottom: 14 },
  date: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  route: { fontSize: 16, fontWeight: '800', color: colors.black, marginTop: 4, marginBottom: 14 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  rowLabel: { fontSize: 14, color: colors.muted },
  rowValue: { fontSize: 14, color: colors.black, flexShrink: 1, textAlign: 'right' },
  bold: { fontWeight: '800', color: colors.black },
});