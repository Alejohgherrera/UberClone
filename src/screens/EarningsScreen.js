import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import useEarnings from '../hooks/useEarnings';
import { useSession } from '../context/SessionContext';
import { formatCOP } from '../utils/format';
import { colors } from '../theme/colors';

const PERIODS = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
];

function Row({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

export default function EarningsScreen() {
  const { driver } = useSession();
  const earnings = useEarnings(driver?.id);
  const [period, setPeriod] = useState('today');
  const data = earnings[period];

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={earnings.loading} onRefresh={earnings.reload} />}
    >
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Tu saldo</Text>
        <Text style={[styles.balanceValue, earnings.balance < 0 && styles.negative]}>
          {formatCOP(earnings.balance)}
        </Text>
        <Text style={styles.balanceHint}>
          Ganancias de viajes pagados con Mercado Pago menos las comisiones de viajes en efectivo.
        </Text>
      </View>

      <View style={styles.segment}>
        {PERIODS.map((item) => (
          <Pressable
            key={item.key}
            style={[styles.segmentItem, period === item.key && styles.segmentActive]}
            onPress={() => setPeriod(item.key)}
          >
            <Text style={[styles.segmentText, period === item.key && styles.segmentTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Row label="Viajes" value={data.trips} />
        <Row label="Total facturado" value={formatCOP(data.billed)} />
        <Row label="Comisiones" value={`- ${formatCOP(data.commissions)}`} />
        <Row label="Propinas" value={formatCOP(data.tips)} />
        <Row label="Promedio por viaje" value={formatCOP(data.average)} />
        <Row label="Ganancia neta" value={formatCOP(data.net)} bold />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
  balanceCard: { backgroundColor: colors.black, borderRadius: 16, padding: 20, marginBottom: 18 },
  balanceLabel: { color: '#BDBDBD', fontSize: 13, fontWeight: '600' },
  balanceValue: { color: '#FFF', fontSize: 30, fontWeight: '900', marginTop: 4 },
  negative: { color: '#FF8A80' },
  balanceHint: { color: '#9E9E9E', fontSize: 12, marginTop: 8, lineHeight: 16 },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#ECECEC',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.surface },
  segmentText: { fontWeight: '700', color: colors.muted },
  segmentTextActive: { color: colors.black },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
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
});
