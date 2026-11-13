import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCOP } from '../utils/format';
import { colors } from '../theme/colors';

export default function AvailabilitySwitch({
  isAvailable,
  isLoading,
  onToggle,
  driverStatus,
  todayEarnings,
  todayTrips,
}) {
  const isApproved = driverStatus === 'approved';

  return (
    <View style={styles.dockContainer}>
      {/* Indicador de estado de aprobación si no está aprobado */}
      {!isApproved && (
        <View style={styles.pendingNotice}>
          <Text style={styles.pendingNoticeIcon}>⏳</Text>
          <View style={styles.pendingNoticeTextWrap}>
            <Text style={styles.pendingNoticeTitle}>
              {driverStatus === 'rejected'
                ? 'Cuenta rechazada'
                : 'Cuenta en revisión (Pendiente)'}
            </Text>
            <Text style={styles.pendingNoticeSubtitle}>
              {driverStatus === 'rejected'
                ? 'Comunícate con soporte para más información.'
                : 'Tus documentos están siendo validados. No puedes conectarte aún.'}
            </Text>
          </View>
        </View>
      )}

      {/* Tarjeta de métricas rápidas */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Ganancias de hoy</Text>
          <Text style={styles.metricValue}>{formatCOP(todayEarnings)}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Viajes completados</Text>
          <Text style={styles.metricValue}>
            {todayTrips} {todayTrips === 1 ? 'viaje' : 'viajes'}
          </Text>
        </View>
      </View>

      {/* Botón principal Uber de Disponibilidad */}
      <View style={styles.switchRow}>
        <View style={styles.statusDescription}>
          <Text style={styles.statusTitle}>
            {isAvailable ? 'Estás disponible' : 'Estás desconectado'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {isAvailable
              ? 'Sincronizando ubicación y listo para viajes'
              : 'Toca iniciar para conectarte a la red'}
          </Text>
        </View>

        <Pressable
          style={[
            styles.actionButton,
            isAvailable ? styles.btnOnline : styles.btnOffline,
            !isApproved && styles.btnDisabled,
          ]}
          onPress={onToggle}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <View style={styles.btnIndicatorDot} />
              <Text style={styles.actionBtnText}>
                {isAvailable ? 'DESCONECTAR' : 'INICIAR'}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pendingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: '#FEDF89',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  pendingNoticeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  pendingNoticeTextWrap: {
    flex: 1,
  },
  pendingNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B54708',
  },
  pendingNoticeSubtitle: {
    fontSize: 11,
    color: '#7A2E0E',
    marginTop: 2,
    lineHeight: 15,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 14,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#EBEBEB',
  },
  metricLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.black,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusDescription: {
    flex: 1,
    paddingRight: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.black,
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
  actionButton: {
    height: 52,
    paddingHorizontal: 22,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  btnOffline: {
    backgroundColor: colors.blue,
  },
  btnOnline: {
    backgroundColor: colors.error,
  },
  btnDisabled: {
    backgroundColor: '#8E8E93',
    opacity: 0.8,
  },
  btnIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: '#FFF',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});

