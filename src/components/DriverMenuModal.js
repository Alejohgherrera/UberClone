import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function DriverMenuModal({
  visible,
  onClose,
  driverProfile,
  driverStatus,
  onNavigateToRegistration,
}) {
  const isApproved = driverStatus === 'approved';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Encabezado del perfil del conductor */}
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {driverProfile?.name?.charAt(0) || 'A'}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.driverName}>
                {driverProfile?.name || 'Conductor'}
              </Text>
              <Text style={styles.driverVehicle}>
                {driverProfile?.vehicle || 'Vehículo registrado'}
              </Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>★ 4.96 • UberX</Text>
              </View>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          {/* Tarjeta de estado de cuenta (Solo lectura, informada por la plataforma) */}
          <View
            style={[
              styles.accountStatusCard,
              isApproved
                ? styles.statusCardApproved
                : driverStatus === 'rejected'
                ? styles.statusCardRejected
                : styles.statusCardPending,
            ]}
          >
            <Text style={styles.statusCardIcon}>
              {isApproved ? '✓' : driverStatus === 'rejected' ? '✕' : '⏳'}
            </Text>
            <View style={styles.statusCardTextWrap}>
              <Text style={styles.statusCardTitle}>
                {isApproved
                  ? 'Cuenta verificada y activa'
                  : driverStatus === 'rejected'
                  ? 'Cuenta no aprobada'
                  : 'Documentos en revisión'}
              </Text>
              <Text style={styles.statusCardDesc}>
                {isApproved
                  ? 'Tus documentos han sido aprobados. Puedes conectarte y recibir viajes.'
                  : driverStatus === 'rejected'
                  ? 'Tu solicitud fue rechazada. Contacta a soporte para más detalles.'
                  : 'El equipo de soporte está validando tu SOAT y licencia de conducción.'}
              </Text>
            </View>
          </View>

          {/* Opciones del menú */}
          <View style={styles.menuList}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                onClose();
                if (onNavigateToRegistration) onNavigateToRegistration();
              }}
            >
              <Text style={styles.menuIcon}>📝</Text>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuTitle}>Ver mis Documentos</Text>
                <Text style={styles.menuSubtitle}>Revisar licencia, SOAT y vehículo</Text>
              </View>
              <Text style={styles.menuArrow}>→</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={onClose}>
              <Text style={styles.menuIcon}>💳</Text>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuTitle}>Billetera y Pagos</Text>
                <Text style={styles.menuSubtitle}>Mercado Pago vinculado</Text>
              </View>
              <Text style={styles.menuArrow}>→</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={onClose}>
              <Text style={styles.menuIcon}>🛡️</Text>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuTitle}>Seguridad y Soporte</Text>
                <Text style={styles.menuSubtitle}>Línea directa de asistencia</Text>
              </View>
              <Text style={styles.menuArrow}>→</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.black,
  },
  driverVehicle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  ratingBadge: {
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.green,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  accountStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  statusCardApproved: {
    backgroundColor: '#EAF9F0',
    borderColor: '#A6F4C5',
  },
  statusCardPending: {
    backgroundColor: '#FEF0C7',
    borderColor: '#FEDF89',
  },
  statusCardRejected: {
    backgroundColor: '#FEF3F2',
    borderColor: '#FECDCA',
  },
  statusCardIcon: {
    fontSize: 20,
    marginRight: 12,
    fontWeight: '800',
  },
  statusCardTextWrap: {
    flex: 1,
  },
  statusCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.black,
  },
  statusCardDesc: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 15,
  },
  menuList: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F4',
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.black,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 18,
    color: colors.muted,
  },
});
