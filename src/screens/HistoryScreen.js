import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateField from '../components/DateField';
import EmptyState from '../components/EmptyState';
import { useSession } from '../context/SessionContext';
import { getTripHistory, PAGE_SIZE } from '../services/tripService';
import { formatDateTime, getPeriodRange } from '../utils/dates';
import { CATEGORY_LABELS, PAYMENT_LABELS, PAYMENT_STATUS_LABELS, formatCOP } from '../utils/format';
import { colors } from '../theme/colors';

const PERIODS = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
  { key: 'range', label: 'Rango' },
];

const METHODS = [
  { key: null, label: 'Todos' },
  { key: 'mercadopago', label: 'Mercado Pago' },
  { key: 'cash', label: 'Efectivo' },
];

function Chip({ label, active, onPress }) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function TripItem({ trip, onPress }) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={styles.itemTop}>
        <Text style={styles.itemDate}>{formatDateTime(trip.createdAt)}</Text>
        <Text style={styles.itemStatus}>
          {PAYMENT_STATUS_LABELS[trip.paymentStatus] ?? 'Sin cobrar'}
        </Text>
      </View>
      <Text style={styles.itemRoute} numberOfLines={2}>
        {trip.origin.address} → {trip.destination.address}
      </Text>
      <View style={styles.itemBottom}>
        <Text style={styles.itemMeta}>
          {CATEGORY_LABELS[trip.category]} • {PAYMENT_LABELS[trip.paymentMethod]}
        </Text>
        <View style={styles.itemAmounts}>
          <Text style={styles.itemFare}>{formatCOP(trip.fare)}</Text>
          <Text style={styles.itemNet}>Ganaste {formatCOP(trip.driverEarnings)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function HistoryScreen({ navigation }) {
  const { driver } = useSession();
  const [period, setPeriod] = useState('month');
  const [method, setMethod] = useState(null);
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  const [trips, setTrips] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const range = getPeriodRange(period, rangeFrom, rangeTo);

  const loadPage = async (pageNumber) => {
    if (!driver) return;
    if (!range) {
      setTrips([]);
      return;
    }
    try {
      setLoading(true);
      const result = await getTripHistory(driver.id, {
        ...range,
        paymentMethod: method,
        page: pageNumber,
      });
      setTrips((prev) => (pageNumber === 0 ? result : [...prev, ...result]));
      setHasMore(result.length === PAGE_SIZE);
      setPage(pageNumber);
    } catch (error) {
      console.warn('No se pudo cargar el historial:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPage(0);
    }, [driver?.id, period, method, rangeFrom, rangeTo])
  );

  const handleEndReached = () => {
    if (hasMore && !loading) loadPage(page + 1);
  };

  const header = (
    <View style={styles.filters}>
      <View style={styles.chips}>
        {PERIODS.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            active={period === item.key}
            onPress={() => setPeriod(item.key)}
          />
        ))}
      </View>

      {period === 'range' && (
        <View style={styles.rangeRow}>
          <View style={styles.rangeField}>
            <DateField label="Desde" value={rangeFrom} onChange={setRangeFrom} maximumDate={new Date()} />
          </View>
          <View style={styles.rangeField}>
            <DateField label="Hasta" value={rangeTo} onChange={setRangeTo} maximumDate={new Date()} />
          </View>
        </View>
      )}

      <View style={styles.chips}>
        {METHODS.map((item) => (
          <Chip
            key={item.label}
            label={item.label}
            active={method === item.key}
            onPress={() => setMethod(item.key)}
          />
        ))}
      </View>
    </View>
  );

  let empty = null;
  if (!loading) {
    empty = !range ? (
      <EmptyState icon="📅" title="Elige las fechas" text="Selecciona desde y hasta para ver tus viajes." />
    ) : (
      <EmptyState icon="🧾" title="No hay viajes" text="No tienes viajes con los filtros elegidos." />
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={trips}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TripItem trip={item} onPress={() => navigation.navigate('TripDetail', { trip: item })} />
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ListFooterComponent={loading ? <ActivityIndicator style={styles.loader} /> : null}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.3}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16, flexGrow: 1 },
  filters: { marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.black, borderColor: colors.black },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.black },
  chipTextActive: { color: '#FFF' },
  rangeRow: { flexDirection: 'row', gap: 10 },
  rangeField: { flex: 1 },
  item: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between' },
  itemDate: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  itemStatus: { fontSize: 12, fontWeight: '800', color: colors.darkGreen },
  itemRoute: { fontSize: 14, fontWeight: '700', color: colors.black, marginTop: 6 },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  itemMeta: { fontSize: 12, color: colors.muted, alignSelf: 'flex-end' },
  itemAmounts: { alignItems: 'flex-end' },
  itemFare: { fontSize: 15, fontWeight: '800', color: colors.black },
  itemNet: { fontSize: 12, fontWeight: '700', color: colors.darkGreen },
  loader: { marginVertical: 16 },
});
