import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useSession } from '../context/SessionContext';
import { colors } from '../theme/colors';

const STATUS = {
  approved: {
    icon: '✓',
    title: 'Cuenta verificada',
    text: 'Puedes conectarte y recibir viajes.',
    style: { backgroundColor: '#EAF9F0', borderColor: '#A6F4C5' },
  },
  pending: {
    icon: '⏳',
    title: 'Documentos en revisión',
    text: 'Estamos validando tu SOAT y tu licencia.',
    style: { backgroundColor: '#FEF0C7', borderColor: '#FEDF89' },
  },
  rejected: {
    icon: '✕',
    title: 'Cuenta no aprobada',
    text: 'Contacta a soporte para más detalles.',
    style: { backgroundColor: '#FEF3F2', borderColor: '#FECDCA' },
  },
};

export default function DrawerContent(props) {
  const { driver, signOut } = useSession();
  const status = STATUS[driver?.approvalStatus] ?? STATUS.pending;

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{driver?.name?.charAt(0) ?? 'C'}</Text>
        </View>
        <Text style={styles.name}>{driver?.name}</Text>
        <Text style={styles.vehicle}>{driver?.vehicle}</Text>
        <Text style={styles.category}>{driver?.category}</Text>
      </View>

      <View style={[styles.statusCard, status.style]}>
        <Text style={styles.statusIcon}>{status.icon}</Text>
        <View style={styles.statusTextWrap}>
          <Text style={styles.statusTitle}>{status.title}</Text>
          <Text style={styles.statusText}>{status.text}</Text>
        </View>
      </View>

      <DrawerItemList {...props} />

      <Pressable style={styles.logout} onPress={signOut}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 12 },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  name: { fontSize: 18, fontWeight: '800', color: colors.black },
  vehicle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  category: { fontSize: 12, fontWeight: '700', color: colors.green, marginTop: 4 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  statusIcon: { fontSize: 18, fontWeight: '800', marginRight: 10 },
  statusTextWrap: { flex: 1 },
  statusTitle: { fontSize: 13, fontWeight: '800', color: colors.black },
  statusText: { fontSize: 11, color: colors.muted, marginTop: 2 },
  logout: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logoutText: { color: colors.error, fontWeight: '700', fontSize: 15 },
});
