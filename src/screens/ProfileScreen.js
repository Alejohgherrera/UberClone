import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import TextField from '../components/TextField';
import SelectField from '../components/SelectField';
import PrimaryButton from '../components/PrimaryButton';
import { useSession } from '../context/SessionContext';
import { getDriverDetails, getPhotoUrls, updateDriverProfile } from '../services/profileService';
import { setPreference } from '../services/preferences';
import { daysUntil } from '../utils/validators';
import { languages } from '../data/options';
import { colors } from '../theme/colors';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function validateProfile(form) {
  const errors = {};
  const name = form.name.trim().replace(/\s+/g, ' ');

  if (!/^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ ]{3,50}$/.test(name)) errors.name = 'Nombre: solo letras y espacios.';
  else if (name.split(' ').length < 2) errors.name = 'Ingresa nombre y apellido.';

  if (!/^3\d{9}$/.test(form.phone)) errors.phone = 'Celular: 10 dígitos y debe empezar por 3.';

  if (!EMAIL_REGEX.test(form.mercadoPagoEmail)) {
    errors.mercadoPagoEmail = 'Correo no válido: sin tildes, ñ ni espacios.';
  }

  return errors;
}

function getExpiryStatus(date) {
  const days = daysUntil(date);
  if (days === null) return { label: 'Sin fecha', color: colors.muted };
  if (days <= 0) return { label: 'Vencido', color: colors.error };
  if (days <= 30) return { label: `Vence en ${days} días`, color: colors.warning };
  return { label: 'Vigente', color: colors.darkGreen };
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
  );
}

function DocumentItem({ title, number, expiry, photoUrl, onOpenPhoto }) {
  const status = getExpiryStatus(expiry);

  return (
    <View style={styles.document}>
      <Pressable onPress={() => photoUrl && onOpenPhoto(photoUrl)}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbEmpty]}>
            <Text>📄</Text>
          </View>
        )}
      </Pressable>
      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle}>{title}</Text>
        {number ? <Text style={styles.documentText}>N.º {number}</Text> : null}
        <Text style={styles.documentText}>Vence: {expiry || '—'}</Text>
        <Text style={[styles.documentStatus, { color: status.color }]}>{status.label}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { driver, refreshDriver, signOut } = useSession();
  const [details, setDetails] = useState(null);
  const [photos, setPhotos] = useState({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', mercadoPagoEmail: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [openPhoto, setOpenPhoto] = useState(null);
  const driverId = driver?.id;

  const loadProfile = async () => {
    try {
      const data = await getDriverDetails(driverId);
      const docs = data.driver_documents ?? {};
      setDetails(data);
      setForm({
        name: data.full_name,
        phone: data.phone,
        mercadoPagoEmail: data.mercado_pago_email,
      });
      setPhotos(
        await getPhotoUrls([
          data.photo_path,
          data.vehicles?.photo_path,
          docs.license_photo_path,
          docs.soat_photo_path,
          docs.revision_photo_path,
        ])
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar tu perfil.');
    }
  };

  useEffect(() => {
    if (driverId) loadProfile();
  }, [driverId]);

  if (!driver) return null;

  if (!details) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.black} />
      </View>
    );
  }

  const vehicle = details.vehicles ?? {};
  const docs = details.driver_documents ?? {};

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const cancelEdit = () => {
    setForm({
      name: details.full_name,
      phone: details.phone,
      mercadoPagoEmail: details.mercado_pago_email,
    });
    setErrors({});
    setEditing(false);
  };

  const saveProfile = async () => {
    const formErrors = validateProfile(form);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      setSaving(true);
      await updateDriverProfile(driverId, {
        full_name: form.name.trim().replace(/\s+/g, ' '),
        phone: form.phone,
        mercado_pago_email: form.mercadoPagoEmail.toLowerCase(),
      });
      await refreshDriver();
      await loadProfile();
      setEditing(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const changeLanguage = async (language) => {
    try {
      await updateDriverProfile(driverId, { language });
      await setPreference('language', language);
      await refreshDriver();
      setDetails((prev) => ({ ...prev, language }));
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el idioma.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {photos[details.photo_path] ? (
          <Image source={{ uri: photos[details.photo_path] }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarEmpty]}>
            <Text style={styles.avatarText}>{details.full_name.charAt(0)}</Text>
          </View>
        )}
        <Text style={styles.name}>{details.full_name}</Text>
        <Text style={styles.email}>{details.email}</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.section}>Datos personales</Text>
        {!editing && (
          <Pressable onPress={() => setEditing(true)}>
            <Text style={styles.editLink}>Editar</Text>
          </Pressable>
        )}
      </View>

      {editing ? (
        <>
          <TextField
            label="Nombre completo"
            value={form.name}
            onChangeText={(v) => updateForm('name', v)}
            error={errors.name}
            autoCapitalize="words"
            maxLength={50}
          />
          <TextField
            label="Número de celular"
            value={form.phone}
            onChangeText={(v) => updateForm('phone', v.replace(/\D/g, ''))}
            error={errors.phone}
            keyboardType="phone-pad"
            maxLength={10}
          />
          <TextField
            label="Correo de Mercado Pago"
            value={form.mercadoPagoEmail}
            onChangeText={(v) => updateForm('mercadoPagoEmail', v.trim())}
            error={errors.mercadoPagoEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PrimaryButton label="Guardar cambios" onPress={saveProfile} loading={saving} />
          <Pressable style={styles.cancel} onPress={cancelEdit} disabled={saving}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.card}>
          <InfoRow label="Nombre" value={details.full_name} />
          <InfoRow label="Celular" value={details.phone} />
          <InfoRow label="Mercado Pago" value={details.mercado_pago_email} />
        </View>
      )}

      <Text style={styles.section}>Vehículo</Text>
      <View style={styles.card}>
        {photos[vehicle.photo_path] && (
          <Pressable onPress={() => setOpenPhoto(photos[vehicle.photo_path])}>
            <Image source={{ uri: photos[vehicle.photo_path] }} style={styles.vehiclePhoto} />
          </Pressable>
        )}
        <InfoRow label="Vehículo" value={`${vehicle.make} ${vehicle.model} ${vehicle.year}`} />
        <InfoRow label="Placa" value={vehicle.plate} />
        <InfoRow label="Color" value={vehicle.color} />
        <InfoRow label="Categoría" value={vehicle.category} />
        <InfoRow label="Capacidad" value={`${vehicle.capacity} pasajeros`} />
      </View>

      <Text style={styles.section}>Documentos</Text>
      <View style={styles.card}>
        <DocumentItem
          title="Licencia de conducción"
          number={docs.license_number}
          expiry={docs.license_expiry}
          photoUrl={photos[docs.license_photo_path]}
          onOpenPhoto={setOpenPhoto}
        />
        <DocumentItem
          title="SOAT"
          expiry={docs.soat_expiry}
          photoUrl={photos[docs.soat_photo_path]}
          onOpenPhoto={setOpenPhoto}
        />
        {docs.revision_expiry ? (
          <DocumentItem
            title="Revisión técnico-mecánica"
            expiry={docs.revision_expiry}
            photoUrl={photos[docs.revision_photo_path]}
            onOpenPhoto={setOpenPhoto}
          />
        ) : (
          <Text style={styles.exempt}>Vehículo exento de revisión técnico-mecánica.</Text>
        )}
      </View>

      <Text style={styles.section}>Configuración</Text>
      <SelectField
        label="Idioma"
        value={details.language}
        options={languages}
        placeholder="Selecciona tu idioma"
        onChange={changeLanguage}
      />

      <PrimaryButton label="Cerrar sesión" onPress={signOut} style={styles.logout} />

      <Modal visible={Boolean(openPhoto)} transparent animationType="fade">
        <Pressable style={styles.photoOverlay} onPress={() => setOpenPhoto(null)}>
          {openPhoto && <Image source={{ uri: openPhoto }} style={styles.photoFull} />}
          <Text style={styles.photoClose}>Toca para cerrar</Text>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: 12 },
  avatar: { width: 84, height: 84, borderRadius: 42 },
  avatarEmpty: { backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: 32, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: colors.black, marginTop: 10 },
  email: { fontSize: 13, color: colors.muted, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { fontSize: 16, fontWeight: '700', color: colors.black, marginTop: 16, marginBottom: 10 },
  editLink: { fontSize: 14, fontWeight: '700', color: colors.blue, marginTop: 6 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  rowLabel: { color: colors.muted, fontSize: 14 },
  rowValue: { color: colors.black, fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  vehiclePhoto: { height: 150, borderRadius: 10, marginTop: 14, marginBottom: 4 },
  document: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  thumb: { width: 64, height: 64, borderRadius: 8, marginRight: 12 },
  thumbEmpty: { backgroundColor: '#F2F2F2', alignItems: 'center', justifyContent: 'center' },
  documentInfo: { flex: 1 },
  documentTitle: { fontSize: 14, fontWeight: '800', color: colors.black },
  documentText: { fontSize: 12, color: colors.muted, marginTop: 2 },
  documentStatus: { fontSize: 12, fontWeight: '800', marginTop: 4 },
  exempt: { fontSize: 13, color: colors.muted, paddingVertical: 12 },
  cancel: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { color: colors.muted, fontWeight: '700' },
  logout: { backgroundColor: colors.error, marginTop: 24 },
  photoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  photoFull: { width: '100%', height: '70%', resizeMode: 'contain' },
  photoClose: { color: '#FFF', marginTop: 16 },
});
