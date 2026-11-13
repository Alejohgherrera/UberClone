import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { calculateFare } from '../config/pricing';
import { CATEGORY_LABELS, PAYMENT_LABELS, formatCOP } from '../utils/format';
import { colors } from '../theme/colors';

export default function RideRequestModal({ trip, secondsLeft, totalSeconds, onAccept, onReject }) {
  if (!trip) return null;

  const estimate = calculateFare(trip);
  const progress = `${(secondsLeft / totalSeconds) * 100}%`;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onReject}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.timerTrack}>
            <View style={[styles.timerBar, { width: progress }]} />
          </View>
          <Text style={styles.timerText}>Tienes {secondsLeft} s para responder</Text>

          <View style={styles.topRow}>
            <View>
              <Text style={styles.category}>
                {CATEGORY_LABELS[trip.category]} • {PAYMENT_LABELS[trip.paymentMethod]}
              </Text>
              <Text style={styles.fare}>{formatCOP(estimate.fare)}</Text>
              <Text style={styles.earnings}>Ganas {formatCOP(estimate.driverEarnings)}</Text>
            </View>
            <View style={styles.etaBadge}>
              <Text style={styles.etaText}>{Math.round(trip.durationMin)} min</Text>
              <Text style={styles.etaSub}>{trip.distanceKm} km</Text>
            </View>
          </View>

          <Text style={styles.passenger}>{trip.passengerName || 'Pasajero'}</Text>

          <View style={styles.routeBox}>
            <View style={styles.routeItem}>
              <View style={[styles.dot, { backgroundColor: colors.green }]} />
              <View style={styles.routeTextWrap}>
                <Text style={styles.routeLabel}>Recogida</Text>
                <Text style={styles.address} numberOfLines={1}>{trip.origin?.address}</Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeItem}>
              <View style={[styles.dot, { backgroundColor: colors.black }]} />
              <View style={styles.routeTextWrap}>
                <Text style={styles.routeLabel}>Destino</Text>
                <Text style={styles.address} numberOfLines={1}>{trip.destination?.address}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.rejectBtn} onPress={onReject}>
              <Text style={styles.rejectText}>Rechazar</Text>
            </Pressable>
            <Pressable style={styles.acceptBtn} onPress={onAccept}>
              <Text style={styles.acceptText}>ACEPTAR</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 24,
  },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 20 },
  timerTrack: { height: 6, borderRadius: 3, backgroundColor: '#EEE', overflow: 'hidden' },
  timerBar: { height: 6, backgroundColor: colors.green },
  timerText: { fontSize: 12, color: colors.muted, marginTop: 6, marginBottom: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  category: { fontSize: 12, color: colors.muted, fontWeight: '700', textTransform: 'uppercase' },
  fare: { fontSize: 26, fontWeight: '900', color: colors.black, marginTop: 2 },
  earnings: { fontSize: 13, fontWeight: '700', color: colors.darkGreen, marginTop: 2 },
  etaBadge: {
    backgroundColor: colors.lightGreen,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  etaText: { fontSize: 16, fontWeight: '800', color: colors.darkGreen },
  etaSub: { fontSize: 11, fontWeight: '600', color: colors.darkGreen },
  passenger: { fontSize: 16, fontWeight: '800', color: colors.black, marginBottom: 12 },
  routeBox: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12, marginBottom: 20 },
  routeItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  routeLine: { width: 2, height: 14, backgroundColor: '#D0D5DD', marginLeft: 4, marginVertical: 3 },
  routeTextWrap: { flex: 1 },
  routeLabel: { fontSize: 10, color: colors.muted, fontWeight: '700', textTransform: 'uppercase' },
  address: { fontSize: 13, fontWeight: '700', color: colors.black },
  actions: { flexDirection: 'row', gap: 12 },
  rejectBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: { fontSize: 15, fontWeight: '700', color: colors.muted },
  acceptBtn: {
    flex: 2,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
});
