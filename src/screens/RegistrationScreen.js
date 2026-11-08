import { useMemo, useRef, useState } from 'react';
import {
  Alert,
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
import DateField from '../components/DateField';
import Checkbox from '../components/Checkbox';
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

const initialDocuments = {
  licenseNumber: '',
  licensePhoto: '',
  licenseExpiry: '',
  soatPhoto: '',
  soatExpiry: '',
  revisionPhoto: '',
  revisionExpiry: '',
  mercadoPagoEmail: '',
  termsAccepted: false,
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

const isFutureDate = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d > today;
};

const getDaysUntil = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function RegistrationScreen() {
  const [tab, setTab] = useState(1);
  const [personal, setPersonal] = useState(initialPersonal);
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [documents, setDocuments] = useState(initialDocuments);
  const [errors, setErrors] = useState({});
  const scrollRef = useRef(null);

  const update = (group, key, value) => {
    const setter =
      group === 'personal'
        ? setPersonal
        : group === 'vehicle'
        ? setVehicle
        : setDocuments;
    setter((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const personalErrors = useMemo(
    () => ({
      photo: !personal.photo ? 'La foto de perfil es obligatoria.' : '',
      name: !personal.name
        ? 'Ingresa tu nombre completo.'
        : !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/.test(personal.name)
        ? 'Nombre: solo letras y espacios (máx. 50).'
        : '',
      document: !personal.document
        ? 'Ingresa tu documento de identidad.'
        : !/^\d{6,10}$/.test(personal.document)
        ? 'Documento: debe tener entre 6 y 10 dígitos.'
        : '',
      phone: !personal.phone
        ? 'Ingresa tu número de celular.'
        : !/^\d{10}$/.test(personal.phone)
        ? 'Celular: ingresa un número de 10 dígitos.'
        : '',
      birthDate: !personal.birthDate
        ? 'Ingresa tu fecha de nacimiento.'
        : !isAdult(personal.birthDate)
        ? 'Debes ser mayor de 18 años (formato AAAA-MM-DD).'
        : '',
      gender: !personal.gender ? 'Selecciona tu género.' : '',
      email: !personal.email
        ? 'Ingresa tu correo electrónico.'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email)
        ? 'Ingresa un correo electrónico válido.'
        : '',
    }),
    [personal]
  );

  const vehicleErrors = useMemo(
    () => ({
      category: !vehicle.category ? 'Selecciona una categoría de vehículo.' : '',
      plate: !vehicle.plate
        ? 'Ingresa la placa del vehículo.'
        : !/^[A-Z]{3}\d{2,3}[A-Z]?$/.test(vehicle.plate)
        ? 'Placa: formato no válido (ej. ABC123 o ABC12D).'
        : '',
      make: !vehicle.make
        ? 'Ingresa la marca del vehículo.'
        : vehicle.make.length > 30
        ? 'Marca: máximo 30 caracteres.'
        : '',
      model: !vehicle.model
        ? 'Ingresa el modelo del vehículo.'
        : vehicle.model.length > 30
        ? 'Modelo: máximo 30 caracteres.'
        : '',
      year: !vehicle.year
        ? 'Ingresa el año del vehículo.'
        : !/^(19|20)\d{2}$/.test(vehicle.year) ||
          Number(vehicle.year) > new Date().getFullYear() + 1
        ? 'Año: ingresa un año de 4 dígitos válido (ej. 2022).'
        : '',
      color: !vehicle.color ? 'Selecciona el color del vehículo.' : '',
      capacity: !vehicle.capacity
        ? 'Ingresa la capacidad de pasajeros.'
        : !/^\d+$/.test(vehicle.capacity)
        ? 'Capacidad: ingresa solo números.'
        : vehicle.category === 'XL' && Number(vehicle.capacity) < 6
        ? 'La categoría XL requiere al menos 6 pasajeros.'
        : '',
      photo: !vehicle.photo ? 'La foto del vehículo es obligatoria.' : '',
    }),
    [vehicle]
  );

  const vehicleYear = Number(vehicle.year);
  const currentYear = new Date().getFullYear();
  const vehicleAge = vehicleYear > 1900 ? currentYear - vehicleYear : 0;
  // En Colombia, los vehículos particulares con 6 o más años de antigüedad requieren técnico-mecánica
  const requiresRevision = vehicleAge >= 6;

  const documentErrors = useMemo(
    () => ({
      licenseNumber: !documents.licenseNumber
        ? 'Ingresa el número de tu licencia de conducción.'
        : !/^\d{6,12}$/.test(documents.licenseNumber)
        ? 'Licencia: debe tener entre 6 y 12 dígitos.'
        : '',
      licensePhoto: !documents.licensePhoto
        ? 'La foto de la licencia de conducción es obligatoria.'
        : '',
      licenseExpiry: !documents.licenseExpiry
        ? 'Ingresa la fecha de vencimiento de la licencia.'
        : !isFutureDate(documents.licenseExpiry)
        ? 'Licencia: la fecha de vencimiento debe ser posterior a hoy (AAAA-MM-DD).'
        : '',
      soatPhoto: !documents.soatPhoto ? 'La foto del SOAT es obligatoria.' : '',
      soatExpiry: !documents.soatExpiry
        ? 'Ingresa la fecha de vencimiento del SOAT.'
        : !isFutureDate(documents.soatExpiry)
        ? 'SOAT: la fecha de vencimiento debe ser posterior a hoy (AAAA-MM-DD).'
        : '',
      revisionPhoto:
        requiresRevision && !documents.revisionPhoto
          ? 'La foto del certificado de revisión técnico-mecánica es obligatoria.'
          : '',
      revisionExpiry:
        requiresRevision && !documents.revisionExpiry
          ? 'Ingresa la fecha de vencimiento de la técnico-mecánica.'
          : requiresRevision && !isFutureDate(documents.revisionExpiry)
          ? 'Técnico-mecánica: la fecha de vencimiento debe ser posterior a hoy (AAAA-MM-DD).'
          : '',
      mercadoPagoEmail: !documents.mercadoPagoEmail
        ? 'Ingresa el correo de tu cuenta de Mercado Pago.'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(documents.mercadoPagoEmail)
        ? 'Mercado Pago: ingresa un correo electrónico válido.'
        : '',
      termsAccepted: !documents.termsAccepted
        ? 'Debes aceptar los términos y la comisión del servicio del 15%.'
        : '',
    }),
    [documents, requiresRevision]
  );

  const handleTabPress = (targetTab) => {
    if (targetTab === tab) return;
    if (targetTab > tab) {
      const current =
        tab === 1 ? personalErrors : tab === 2 ? vehicleErrors : documentErrors;
      const activeErrors = Object.entries(current)
        .map(([_, msg]) => msg)
        .filter(Boolean);

      if (activeErrors.length > 0) {
        setErrors(current);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        Alert.alert(
          'Faltan datos requeridos',
          `Por favor completa la sección actual antes de avanzar:\n\n• ${activeErrors.join('\n• ')}`
        );
        return;
      }
    }
    setTab(targetTab);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const next = () => {
    const current =
      tab === 1 ? personalErrors : tab === 2 ? vehicleErrors : documentErrors;
    const activeErrors = Object.entries(current)
      .map(([_, msg]) => msg)
      .filter(Boolean);

    if (activeErrors.length > 0) {
      setErrors(current);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      Alert.alert(
        'Faltan datos requeridos',
        `Por favor revisa los siguientes campos:\n\n• ${activeErrors.join('\n• ')}`
      );
      return;
    }

    if (tab === 1) {
      setTab(2);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else if (tab === 2) {
      setTab(3);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      Alert.alert(
        '¡Registro completado!',
        'Tu solicitud y documentos han sido enviados exitosamente para revisión. Te notificaremos pronto.'
      );
    }
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
          <Pressable
            style={[styles.tab, tab === 1 && styles.activeTab]}
            onPress={() => handleTabPress(1)}
          >
            <Text style={[styles.tabText, tab === 1 && styles.activeText]}>1. Datos personales</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === 2 && styles.activeTab]}
            onPress={() => handleTabPress(2)}
          >
            <Text style={[styles.tabText, tab === 2 && styles.activeText]}>2. Vehículo</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === 3 && styles.activeTab]}
            onPress={() => handleTabPress(3)}
          >
            <Text style={[styles.tabText, tab === 3 && styles.activeText]}>3. Documentos y pagos</Text>
          </Pressable>
        </View>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {tab === 1 && (
            <PersonalForm
              data={personal}
              update={(key, value) => update('personal', key, value)}
              error={err}
            />
          )}
          {tab === 2 && (
            <VehicleForm
              data={vehicle}
              update={(key, value) => update('vehicle', key, value)}
              error={err}
            />
          )}
          {tab === 3 && (
            <DocumentsForm
              data={documents}
              vehicle={vehicle}
              vehicleAge={vehicleAge}
              requiresRevision={requiresRevision}
              update={(key, value) => update('documents', key, value)}
              error={err}
            />
          )}

          <Pressable style={styles.button} onPress={next}>
            <Text style={styles.buttonText}>
              {tab === 1
                ? 'Continuar con vehículo'
                : tab === 2
                ? 'Continuar con documentos'
                : 'Finalizar registro'}
            </Text>
            <Text style={styles.arrow}>{tab === 3 ? '✓' : '→'}</Text>
          </Pressable>

          {tab === 2 && (
            <Text style={styles.notice}>
              El siguiente paso será cargar tus documentos y configurar tu cuenta de pagos.
            </Text>
          )}
          {tab === 3 && (
            <Text style={styles.notice}>
              Al finalizar, verificaremos tus documentos conforme a las normativas de transporte.
            </Text>
          )}
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
      <DateField
        label="Fecha de nacimiento"
        placeholder="AAAA-MM-DD"
        value={data.birthDate}
        onChange={(v) => update('birthDate', v)}
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
          Usaremos estos datos para validar tu cuenta y categoría de viajes.
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

function DocumentsForm({ data, vehicle, vehicleAge, requiresRevision, update, error }) {
  const soatDays = getDaysUntil(data.soatExpiry);
  const licenseDays = getDaysUntil(data.licenseExpiry);
  const revisionDays = requiresRevision ? getDaysUntil(data.revisionExpiry) : null;

  return (
    <>
      <View style={styles.tip}>
        <Text style={styles.tipTitle}>Documentos requeridos</Text>
        <Text style={styles.tipText}>
          Asegúrate de que las fotos sean nítidas y que las fechas coincidan con los documentos físicos.
        </Text>
      </View>

      <Text style={styles.sectionHeader}>Licencia de conducción</Text>
      <TextField
        label="Número de licencia de conducción"
        placeholder="Ej. 1020304050"
        value={data.licenseNumber}
        onChangeText={(v) => update('licenseNumber', v.replace(/\D/g, ''))}
        error={error('licenseNumber')}
        keyboardType="number-pad"
      />
      <DateField
        label="Fecha de vencimiento de la licencia"
        placeholder="AAAA-MM-DD"
        value={data.licenseExpiry}
        onChange={(v) => update('licenseExpiry', v)}
        error={error('licenseExpiry')}
      />
      {licenseDays !== null && licenseDays > 0 && licenseDays <= 30 && (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Licencia próxima a vencer</Text>
          <Text style={styles.warningText}>
            {licenseDays === 1
              ? 'Tu licencia vence mañana (en 1 día). Podrás registrarte, pero recuerda renovarla oportunamente para mantener tu cuenta activa.'
              : `Tu licencia vence en ${licenseDays} días. Recuerda renovarla a tiempo.`}
          </Text>
        </View>
      )}
      <PhotoPicker
        document
        label="Foto de la licencia de conducción"
        value={data.licensePhoto}
        onChange={(v) => update('licensePhoto', v)}
        error={error('licensePhoto')}
      />

      <Text style={styles.sectionHeader}>SOAT</Text>
      <DateField
        label="Fecha de vencimiento del SOAT"
        placeholder="AAAA-MM-DD"
        value={data.soatExpiry}
        onChange={(v) => update('soatExpiry', v)}
        error={error('soatExpiry')}
      />
      {soatDays !== null && soatDays > 0 && soatDays <= 30 && (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Atención: SOAT próximo a vencer</Text>
          <Text style={styles.warningText}>
            {soatDays === 1
              ? 'Tu SOAT vence mañana (en 1 día). Podrás completar tu registro, pero deberás renovarlo y actualizarlo en las próximas 24 horas para no ser suspendido de la plataforma.'
              : `Tu SOAT vence en ${soatDays} días. Podrás registrarte, pero recuerda renovarlo a tiempo para evitar la interrupción de tus viajes.`}
          </Text>
        </View>
      )}
      <PhotoPicker
        document
        label="Foto del SOAT vigente"
        value={data.soatPhoto}
        onChange={(v) => update('soatPhoto', v)}
        error={error('soatPhoto')}
      />

      <Text style={styles.sectionHeader}>Revisión técnico-mecánica</Text>
      {requiresRevision ? (
        <>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Obligatoria para tu vehículo</Text>
            <Text style={styles.alertText}>
              Vehículo año {vehicle.year || 'antiguo'} ({vehicleAge} años de antigüedad): requiere revisión técnico-mecánica vigente según la regulación de tránsito.
            </Text>
          </View>
          <DateField
            label="Fecha de vencimiento técnico-mecánica"
            placeholder="AAAA-MM-DD"
            value={data.revisionExpiry}
            onChange={(v) => update('revisionExpiry', v)}
            error={error('revisionExpiry')}
          />
          {revisionDays !== null && revisionDays > 0 && revisionDays <= 30 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>⚠️ Técnico-mecánica próxima a vencer</Text>
              <Text style={styles.warningText}>
                {revisionDays === 1
                  ? 'Tu revisión técnico-mecánica vence mañana (en 1 día). Recuerda renovarla antes de su expiración.'
                  : `Tu revisión técnico-mecánica vence en ${revisionDays} días. Recuerda renovarla a tiempo.`}
              </Text>
            </View>
          )}
          <PhotoPicker
            document
            label="Foto del certificado de técnico-mecánica"
            value={data.revisionPhoto}
            onChange={(v) => update('revisionPhoto', v)}
            error={error('revisionPhoto')}
          />
        </>
      ) : (
        <View style={styles.exemptBox}>
          <Text style={styles.exemptTitle}>Vehículo exento de revisión técnico-mecánica</Text>
          <Text style={styles.exemptText}>
            Tu vehículo modelo {vehicle.year || 'reciente'} ({vehicleAge} años de antigüedad) está exento de revisión técnico-mecánica por contar con menos de 6 años de antigüedad.
          </Text>
        </View>
      )}

      <Text style={styles.sectionHeader}>Método de pago (Mercado Pago)</Text>
      <View style={styles.secureBox}>
        <Text style={styles.secureTitle}>Pagos 100% seguros</Text>
        <Text style={styles.secureText}>
          Tus ganancias serán enviadas directamente a tu cuenta de Mercado Pago. Por tu seguridad, no guardamos números de cuenta bancaria ni de tarjeta en la aplicación.
        </Text>
      </View>
      <TextField
        label="Correo de la cuenta de Mercado Pago"
        placeholder="conductor@correo.com"
        value={data.mercadoPagoEmail}
        onChangeText={(v) => update('mercadoPagoEmail', v.trim())}
        error={error('mercadoPagoEmail')}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.sectionHeader}>Aceptación de términos y condiciones</Text>
      <Checkbox
        label="Acepto los términos y condiciones de la plataforma. Tengo conocimiento y acepto la comisión del 15% aplicable sobre el valor de cada viaje realizado."
        checked={data.termsAccepted}
        onChange={(v) => update('termsAccepted', v)}
        error={error('termsAccepted')}
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
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginTop: 18,
    marginBottom: 12,
  },
  button: {
    height: 54,
    borderRadius: 10,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  arrow: { color: '#FFF', fontSize: 20, marginLeft: 10 },
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
  alertBox: {
    backgroundColor: '#FEF3F2',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B42318',
    marginBottom: 3,
  },
  alertText: {
    fontSize: 12,
    color: '#7A271A',
    lineHeight: 17,
  },
  exemptBox: {
    backgroundColor: '#EAF9F0',
    borderLeftWidth: 4,
    borderLeftColor: colors.green,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  exemptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#027A48',
    marginBottom: 3,
  },
  exemptText: {
    fontSize: 12,
    color: '#05603A',
    lineHeight: 17,
  },
  secureBox: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#0BA5EC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  secureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#026AA2',
    marginBottom: 3,
  },
  secureText: {
    fontSize: 12,
    color: '#0E7090',
    lineHeight: 17,
  },
  warningBox: {
    backgroundColor: '#FEF0C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F79009',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: -4,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B54708',
    marginBottom: 3,
  },
  warningText: {
    fontSize: 12,
    color: '#93370D',
    lineHeight: 17,
  },
});
