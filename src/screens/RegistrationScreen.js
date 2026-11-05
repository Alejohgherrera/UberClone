import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import TextField from '../components/TextField';
import SelectField from '../components/SelectField';
import PhotoPicker from '../components/PhotoPicker';
import { categories, colors as vehicleColors, genders, languages } from '../data/options';
import { colors } from '../theme/colors';

const initialPersonal = {
  photo: '',
  name: '',
  document: '',
  phone: '',
  birthDate: '',
  gender: '',
  email: '',
  language: 'Español',
};
const initialVehicle = {
  category: '',
  plate: '',
  make: '',
  model: '',
  year: '',
  color: '',
  capacity: '',
  photo: '',
};

const isAdult = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const birth = new Date(`${date}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 18;
};

export default function RegistrationScreen() {
  const [tab, setTab] = useState(1);
  const [personal, setPersonal] = useState(initialPersonal);
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [errors, setErrors] = useState({});
  const update = (group, key, value) => {
    const setter = group === 'personal' ? setPersonal : setVehicle;
    setter((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const personalErrors = useMemo(
    () => ({
      photo: !personal.photo && 'La foto de perfil es obligatoria.',
      name:
        !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/.test(personal.name) &&
        'Escribe solo letras y espacios (máx. 50).',
      document: !/^\d{6,10}$/.test(personal.document) && 'Debe tener entre 6 y 10 dígitos.',
      phone: !/^\d{10}$/.test(personal.phone) && 'Ingresa 10 dígitos.',
      birthDate: !isAdult(personal.birthDate) && 'Debes ser mayor de 18 años (AAAA-MM-DD).',
      gender: !personal.gender && 'Selecciona una opción.',
      email:
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email) && 'Ingresa un correo válido.',
    }),
    [personal]
  );

  const vehicleErrors = useMemo(
    () => ({
      category: !vehicle.category && 'Selecciona una categoría.',
      plate: !/^[A-Z]{3}\d{3}$/.test(vehicle.plate) && 'Formato válido: ABC123.',
      make: !vehicle.make || vehicle.make.length > 30 ? 'Máximo 30 caracteres.' : '',
      model: !vehicle.model || vehicle.model.length > 30 ? 'Máximo 30 caracteres.' : '',
      year:
        !/^(19|20)\d{2}$/.test(vehicle.year) || Number(vehicle.year) > new Date().getFullYear()
          ? 'Ingresa un año válido.'
          : '',
      color: !vehicle.color && 'Selecciona un color.',
      capacity:
        !/^\d+$/.test(vehicle.capacity) || (vehicle.category === 'XL' && Number(vehicle.capacity) < 6)
          ? vehicle.category === 'XL'
            ? 'XL requiere al menos 6 pasajeros.'
            : 'Ingresa la capacidad.'
          : '',
      photo: !vehicle.photo && 'La foto del vehículo es obligatoria.',
    }),
    [vehicle]
  );

  const next = () => {
    const current = tab === 1 ? personalErrors : vehicleErrors;
    if (Object.values(current).some(Boolean)) {
      setErrors(current);
      return;
    }
    if (tab === 1) setTab(2);
  };

  const err = (key) => errors[key];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>
            Uber <Text style={styles.driver}>Conductor</Text>
          </Text>
          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>
            Completa tus datos para comenzar a conducir
          </Text>
        </View>
        <View style={styles.tabs}>
          <Pressable style={[styles.tab, tab === 1 && styles.activeTab]} onPress={() => setTab(1)}>
            <Text style={[styles.tabText, tab === 1 && styles.activeText]}>1. Datos personales</Text>
          </Pressable>
          <Pressable style={[styles.tab, tab === 2 && styles.activeTab]} onPress={() => setTab(2)}>
            <Text style={[styles.tabText, tab === 2 && styles.activeText]}>2. Vehículo</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {tab === 1 ? (
            <PersonalForm
              data={personal}
              update={(key, value) => update('personal', key, value)}
              error={err}
            />
          ) : (
            <VehicleForm
              data={vehicle}
              update={(key, value) => update('vehicle', key, value)}
              error={err}
            />
          )}
          <Pressable style={styles.button} onPress={next}>
            <Text style={styles.buttonText}>
              {tab === 1 ? 'Continuar' : 'Continuar con documentos'}
            </Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
          {tab === 2 ? (
            <Text style={styles.notice}>
              El siguiente paso será cargar tus documentos y aceptar los términos.
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PersonalForm({ data, update, error }) {
  return (
    <>
      <PhotoPicker
        label="Foto de perfil"
        value={data.photo}
        onChange={(v) => update('photo', v)}
        error={error('photo')}
      />
      <TextField
        label="Nombre completo"
        placeholder="Ej. María González"
        value={data.name}
        onChangeText={(v) => update('name', v)}
        error={error('name')}
        autoCapitalize="words"
      />
      <TextField
        label="Documento de identidad"
        placeholder="Solo números"
        value={data.document}
        onChangeText={(v) => update('document', v.replace(/\D/g, ''))}
        error={error('document')}
        keyboardType="number-pad"
      />
      <TextField
        label="Número de celular"
        placeholder="10 dígitos"
        value={data.phone}
        onChangeText={(v) => update('phone', v.replace(/\D/g, ''))}
        error={error('phone')}
        keyboardType="phone-pad"
      />
      <TextField
        label="Fecha de nacimiento"
        placeholder="AAAA-MM-DD"
        value={data.birthDate}
        onChangeText={(v) => update('birthDate', v)}
        error={error('birthDate')}
      />
      <SelectField
        label="Género"
        value={data.gender}
        options={genders}
        placeholder="Selecciona una opción"
        onChange={(v) => update('gender', v)}
        error={error('gender')}
      />
      <TextField
        label="Correo electrónico"
        placeholder="nombre@correo.com"
        value={data.email}
        onChangeText={(v) => update('email', v)}
        error={error('email')}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <SelectField
        label="Idioma"
        value={data.language}
        options={languages}
        placeholder="Selecciona tu idioma"
        onChange={(v) => update('language', v)}
      />
    </>
  );
}

function VehicleForm({ data, update, error }) {
  return (
    <>
      <View style={styles.tip}>
        <Text style={styles.tipTitle}>Información de tu vehículo</Text>
        <Text style={styles.tipText}>
          Usaremos estos datos para validar tu cuenta.
        </Text>
      </View>
      <SelectField
        label="Categoría"
        value={data.category}
        options={categories}
        placeholder="Selecciona una categoría"
        onChange={(v) => update('category', v)}
        error={error('category')}
      />
      <TextField
        label="Placa"
        placeholder="ABC123"
        value={data.plate}
        onChangeText={(v) => update('plate', v.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
        error={error('plate')}
        autoCapitalize="characters"
      />
      <TextField
        label="Marca"
        placeholder="Ej. Toyota"
        value={data.make}
        onChangeText={(v) => update('make', v)}
        error={error('make')}
      />
      <TextField
        label="Modelo"
        placeholder="Ej. Corolla"
        value={data.model}
        onChangeText={(v) => update('model', v)}
        error={error('model')}
      />
      <TextField
        label="Año"
        placeholder="Ej. 2024"
        value={data.year}
        onChangeText={(v) => update('year', v.replace(/\D/g, ''))}
        error={error('year')}
        keyboardType="number-pad"
      />
      <SelectField
        label="Color"
        value={data.color}
        options={vehicleColors}
        placeholder="Selecciona un color"
        onChange={(v) => update('color', v)}
        error={error('color')}
      />
      <TextField
        label="Capacidad de pasajeros"
        placeholder={data.category === 'XL' ? 'Mínimo 6' : 'Ej. 4'}
        value={data.capacity}
        onChangeText={(v) => update('capacity', v.replace(/\D/g, ''))}
        error={error('capacity')}
        keyboardType="number-pad"
      />
      <PhotoPicker
        vehicle
        label="Foto del vehículo"
        value={data.photo}
        onChange={(v) => update('photo', v)}
        error={error('photo')}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 20 },
  brand: { fontSize: 21, fontWeight: '800', color: colors.black },
  driver: { color: colors.green },
  title: { fontSize: 28, fontWeight: '800', marginTop: 25, color: colors.black },
  subtitle: { color: colors.muted, marginTop: 7, fontSize: 15 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: colors.green },
  tabText: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  activeText: { color: colors.black },
  content: {
    backgroundColor: colors.background,
    padding: 20,
    paddingBottom: 42,
  },
  button: {
    height: 54,
    borderRadius: 10,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 5,
  },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  arrow: { color: '#FFF', fontSize: 22, marginLeft: 10 },
  notice: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
    marginTop: 14,
    paddingHorizontal: 15,
  },
  tip: {
    backgroundColor: '#EAF9F0',
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
  },
  tipTitle: { fontWeight: '700', marginBottom: 3 },
  tipText: { color: colors.muted, fontSize: 13 },
});