import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import PrimaryButton from '../components/PrimaryButton';
import { useTrip } from '../context/TripContext';
import {
  createPaymentLink,
  getTrip,
  subscribeToTrip,
  updateTripStatus,
} from '../services/tripService';
import { formatCOP } from '../utils/format';
import { colors } from '../theme/colors';

const PAYMENT_STATUS = {
  approved: { label: 'Aprobado', color: colors.darkGreen },
  pending: { label: 'Pendiente', color: colors.warning },
  rejected: { label: 'Rechazado', color: colors.error },
  cash: { label: 'Efectivo', color: colors.darkGreen },
};

function Row({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

export default function TripSummaryScreen({ navigation }) {
  const { activeTrip, setActiveTrip } = useTrip();
  const [paying, setPaying] = useState(false);
  const tripId = activeTrip?.id;

  useEffect(() => {
    if (!tripId) return;
    return subscribeToTrip(tripId, setActiveTrip);
  }, [tripId]);

  if (!activeTrip) return null;

  const isPaid = activeTrip.status === 'paid';
  const paymentStatus = PAYMENT_STATUS[activeTrip.paymentStatus];
  const commissionPercent = Math.round((activeTrip.commissionRate ?? 0) * 100);

  const payWithMercadoPago = async () => {
    try {
      setPaying(true);
      const checkoutUrl = await createPaymentLink(activeTrip.id);
      await WebBrowser.openBrowserAsync(checkoutUrl);
      setActiveTrip(await getTrip(activeTrip.id));
    } catch (error) {
      Alert.alert('Mercado Pago', error.message);
    } finally {
      setPaying(false);
    }
  };

  const payWithCash = () => {
    Alert.alert('Cobro en efectivo', '¿Confirmas que recibiste el dinero del pasajero?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, lo recibí',
        onPress: async () => {
          try {
            setPaying(true);
            const paid = await updateTripStatus(activeTrip.id, 'paid', {
              payment_method: 'cash',
              payment_status: 'cash',
            });
            setActiveTrip(paid);
          } catch (error) {
            Alert.alert('Error', 'No se pudo registrar el pago.');
          } finally {
            setPaying(false);
          }
        },
      },
    ]);
  };

  const finish = () => {
    setActiveTrip(null);
    navigation.navigate('Main');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{isPaid ? '¡Viaje cobrado!' : 'Cobro del viaje'}</Text>
        <Text style={styles.subtitle}>
          {activeTrip.origin.address} → {activeTrip.destination.address}
        </Text>

        <View style={styles.card}>
          <Row label="Tarifa" value={formatCOP(activeTrip.fare)} />
          <Row label={`Comisión (${commissionPercent}%)`} value={`- ${formatCOP(activeTrip.commission)}`} />
          <Row label="Propina" value={formatCOP(activeTrip.tip)} />
          <Row label="Tu ganancia neta" value={formatCOP(activeTrip.driverEarnings)} bold />
        </View>

        <View style={styles.card}>
          <Row label="Distancia" value={`${activeTrip.distanceKm} km`} />
          <Row label="Duración" value={`${Math.round(activeTrip.durationMin)} min`} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Estado del pago</Text>
            <Text style={[styles.rowValue, styles.bold, { color: paymentStatus?.color ?? colors.muted }]}>
              {paymentStatus?.label ?? 'Sin cobrar'}
            </Text>
          </View>
        </View>

        {isPaid ? (
          <PrimaryButton label="Volver al inicio" onPress={finish} />
        ) : (
          <>
            <PrimaryButton
              label="Cobrar con Mercado Pago"
              onPress={payWithMercadoPago}
              loading={paying}
              style={styles.mpButton}
            />
            <PrimaryButton label="Cobrar en efectivo" onPress={payWithCash} disabled={paying} />
            {activeTrip.paymentStatus === 'pending' && (
              <Text style={styles.notice}>
                Esperando la confirmación de Mercado Pago. Se actualizará automáticamente.
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: colors.black, marginTop: 8 },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 6, marginBottom: 18 },
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
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  rowLabel: { fontSize: 15, color: colors.muted },
  rowValue: { fontSize: 15, color: colors.black },
  bold: { fontWeight: '800', color: colors.black },
  mpButton: { backgroundColor: '#009EE3' },
  notice: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 14 },
});
