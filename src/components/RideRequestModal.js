import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function RideRequestModal({
  visible,
  request,
  onAccept,
  onDecline,
}) {
  if (!request) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Encabezado con tarifa y tiempo de recogida */}
          <View style={styles.topRow}>
            <View>
              <Text style={styles.categoryBadge}>UberX • Aceptación inmediata</Text>
              <Text style={styles.fare}>
                {request.fare || '$14.200 COP'}
              </Text>
            </View>
            <View style={styles.etaBadge}>
              <Text style={styles.etaText}>
                {request.eta || '4 min'}
              </Text>
              <Text style={styles.etaSub}>a {request.distance || '1.1 km'}</Text>
            </View>
          </View>

          {/* Datos del pasajero */}
          <View style={styles.passengerRow}>
            <View style={styles.passengerAvatar}>
              <Text style={styles.avatarLetter}>
                {request.passengerName ? request.passengerName.charAt(0) : 'P'}
              </Text>
            </View>
            <View style={styles.passengerInfo}>
              <Text style={styles.passengerName}>
                {request.passengerName || 'Pasajero Uber'}
              </Text>
              <Text style={styles.passengerRating}>
                ★ {request.rating || '4.95'} • Pago en efectivo o tarjeta
              </Text>
            </View>
          </View>

          {/* Dirección de recogida y destino */}
          <View style={styles.routeBox}>
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: colors.green }]} />
              <View style={styles.routeTextWrap}>
                <Text style={styles.routeLabel}>Punto de recogida</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>
                  {request.pickupAddress || 'Calle 72 # 10-34, Chapinero'}
                </Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: colors.black }]} />
              <View style={styles.routeTextWrap}>
                <Text style={styles.routeLabel}>Destino</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>
                  {request.dropoffAddress || 'Centro Comercial Andino, Bogotá'}
                </Text>
              </View>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionsRow}>
            <Pressable style={styles.declineBtn} onPress={onDecline}>
              <Text style={styles.declineText}>Rechazar</Text>
            </Pressable>

            <Pressable style={styles.acceptBtn} onPress={onAccept}>
              <Text style={styles.acceptText}>ACEPTAR VIAJE</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryBadge: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  fare: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.black,
    marginTop: 2,
  },
  etaBadge: {
    backgroundColor: colors.lightGreen,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  etaText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.darkGreen,
  },
  etaSub: {
    fontSize: 11,
    color: colors.darkGreen,
    fontWeight: '600',
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16,
  },
  passengerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  passengerInfo: {
    flex: 1,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.black,
  },
  passengerRating: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  routeBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  routeLine: {
    width: 2,
    height: 14,
    backgroundColor: '#D0D5DD',
    marginLeft: 4,
    marginVertical: 3,
  },
  routeTextWrap: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  routeAddress: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.black,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  declineText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.muted,
  },
  acceptBtn: {
    flex: 2,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
});

