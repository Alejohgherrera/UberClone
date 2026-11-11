import { useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { registerDriver } from '../services/registrationService';
import {
  daysUntil,
  getVehicleAge,
  validateDocuments,
  validatePersonal,
  validateVehicle,
} from '../utils/validators';

const TABS = ['1. Datos personales', '2. Vehículo', '3. Documentos y pagos'];
const BUTTON_LABELS = ['Continuar con vehículo', 'Continuar con documentos', 'Finalizar registro'];

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

export default function RegistrationScreen({ isLoggedIn, onRegistered, onBack }) {
  const [tab, setTab] = useState(1);
  const [personal, setPersonal] = useState(initialPersonal);
  const [password, setPassword] = useState('');
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [documents, setDocuments] = useState(initialDocuments);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef(null);

  const vehicleAge = getVehicleAge(vehicle.year);
  const requiresRevision = vehicleAge >= 6;

  const updatePersonal = (key, value) => {
    setPersonal((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const updateVehicle = (key, value) => {
    setVehicle((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const updateDocuments = (key, value) => {
    setDocuments((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const updatePassword = (value) => {
    setPassword(value);
    setErrors((prev) => ({ ...prev, password: undefined }));
  };

  const getTabErrors = (tabNumber) => {
    if (tabNumber === 1) return validatePersonal(personal, isLoggedIn ? null : password);
    if (tabNumber === 2) return validateVehicle(vehicle);
    return validateDocuments(documents, requiresRevision, personal.document);
  };

  const goToTab = (tabNumber) => {
    setTab(tabNumber);
    setErrors({});
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const showErrors = (tabErrors) => {
    setErrors(tabErrors);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    Alert.alert('Faltan datos', `• ${Object.values(tabErrors).join('\n• ')}`);
  };

  const handleTabPress = (target) => {
    if (target <= tab) {
      goToTab(target);
      return;
    }

    for (let i = tab; i < target; i++) {
      const tabErrors = getTabErrors(i);
      if (Object.keys(tabErrors).length > 0) {
        if (i !== tab) goToTab(i);
        showErrors(tabErrors);
        return;
      }
    }
    goToTab(target);
  };

  const save = async () => {
    try {
      setSaving(true);
      await registerDriver({ personal, password, vehicle, documents, requiresRevision });
      Alert.alert(
        '¡Registro enviado!',
        'Tus documentos quedaron en revisión. Te avisaremos cuando tu cuenta sea aprobada.',
        [{ text: 'Ir al inicio', onPress: onRegistered }]
      );
    } catch (error) {
      Alert.alert('No se pudo registrar', error.message);
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    const tabErrors = getTabErrors(tab);
    if (Object.keys(tabErrors).length > 0) {
      showErrors(tabErrors);
      return;
    }

    if (tab < 3) goToTab(tab + 1);
    else save();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          {onBack && (
            <Pressable style={styles.backButton} onPress={onBack}>
              <Text style={styles.backText}>← Volver al mapa</Text>
            </Pressable>
          )}
          <Text style={styles.brand}>
            Uber <Text style={styles.driver}>Conductor</Text>
          </Text>
          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>Completa tus datos para comenzar a conducir</Text>
        </View>

        <View style={styles.tabs}>
          {TABS.map((label, index) => {
            const tabNumber = index + 1;
            const active = tab === tabNumber;
            return (
              <Pressable
                key={label}
                style={[styles.tab, active && styles.activeTab]}
                onPress={() => handleTabPress(tabNumber)}
                disabled={saving}
              >
                <Text style={[styles.tabText, active && styles.activeText]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {tab === 1 && (
            <PersonalForm
              data={personal}
              update={updatePersonal}
              password={password}
              onPasswordChange={updatePassword}
              showPassword={!isLoggedIn}
              errors={errors}
            />
          )}
          {tab === 2 && <VehicleForm data={vehicle} update={updateVehicle} errors={errors} />}
          {tab === 3 && (
            <DocumentsForm
              data={documents}
              vehicleYear={vehicle.year}
              vehicleAge={vehicleAge}
              requiresRevision={requiresRevision}
              update={updateDocuments}
              errors={errors}
            />
          )}

          <Pressable
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={next}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>{BUTTON_LABELS[tab - 1]}</Text>
                <Text style={styles.arrow}>{tab === 3 ? '✓' : '→'}</Text>
              </>
            )}
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

function PersonalForm({ data, update, password, onPasswordChange, showPassword, errors }) {
  return (
    <>
      <PhotoPicker
        label="Foto de perfil"
        value={data.photo}
        onChange={(v) => update('photo', v)}
        error={errors.photo}
      />
      <TextField
        label="Nombre completo"
        placeholder="Ej. María González"
        value={data.name}
        onChangeText={(v) => update('name', v)}
        error={errors.name}
        autoCapitalize="words"
      />
      <TextField
        label="Documento de identidad"
        placeholder="Solo números"
        value={data.document}
        onChangeText={(v) => update('document', v.replace(/\D/g, ''))}
        error={errors.document}
        keyboardType="number-pad"
        maxLength={10}
      />
      <TextField
        label="Número de celular"
        placeholder="3001234567"
        value={data.phone}
        onChangeText={(v) => update('phone', v.replace(/\D/g, ''))}
        error={errors.phone}
        keyboardType="phone-pad"
        maxLength={10}
      />
      <DateField
        label="Fecha de nacimiento"
        value={data.birthDate}
        onChange={(v) => update('birthDate', v)}
        error={errors.birthDate}
      />
      <SelectField
        label="Género"
        value={data.gender}
        options={genders}
        placeholder="Selecciona una opción"
        onChange={(v) => update('gender', v)}
        error={errors.gender}
      />
      <TextField
        label="Correo electrónico"
        placeholder="nombre@correo.com"
        value={data.email}
        onChangeText={(v) => update('email', v.trim())}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {showPassword && (
        <TextField
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChangeText={onPasswordChange}
          error={errors.password}
          secureTextEntry
          autoCapitalize="none"
        />
      )}
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

function VehicleForm({ data, update, errors }) {
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
        error={errors.category}
      />
      <TextField
        label="Placa"
        placeholder="ABC123"
        value={data.plate}
        onChangeText={(v) => update('plate', v.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
        error={errors.plate}
        autoCapitalize="characters"
        maxLength={6}
      />
      <TextField
        label="Marca"
        placeholder="Ej. Toyota"
        value={data.make}
        onChangeText={(v) => update('make', v)}
        error={errors.make}
        maxLength={30}
      />
      <TextField
        label="Modelo"
        placeholder="Ej. Corolla"
        value={data.model}
        onChangeText={(v) => update('model', v)}
        error={errors.model}
        maxLength={30}
      />
      <TextField
        label="Año"
        placeholder="Ej. 2022"
        value={data.year}
        onChangeText={(v) => update('year', v.replace(/\D/g, ''))}
        error={errors.year}
        keyboardType="number-pad"
        maxLength={4}
      />
      <SelectField
        label="Color"
        value={data.color}
        options={vehicleColors}
        placeholder="Selecciona un color"
        onChange={(v) => update('color', v)}
        error={errors.color}
      />
      <TextField
        label="Capacidad de pasajeros"
        placeholder={data.category === 'XL' ? 'Entre 6 y 8' : '3 o 4'}
        value={data.capacity}
        onChangeText={(v) => update('capacity', v.replace(/\D/g, ''))}
        error={errors.capacity}
        keyboardType="number-pad"
        maxLength={1}
      />
      <PhotoPicker
        vehicle
        label="Foto del vehículo"
        value={data.photo}
        onChange={(v) => update('photo', v)}
        error={errors.photo}
      />
    </>
  );
}

function ExpiryWarning({ title, date }) {
  const days = daysUntil(date);
  if (days === null || days <= 0 || days > 30) return null;

  return (
    <View style={styles.warningBox}>
      <Text style={styles.warningTitle}>⚠️ {title} próximo a vencer</Text>
      <Text style={styles.warningText}>
        {days === 1 ? 'Vence mañana.' : `Vence en ${days} días.`} Puedes registrarte, pero
        recuerda renovarlo a tiempo para no quedar suspendido.
      </Text>
    </View>
  );
}

function DocumentsForm({ data, vehicleYear, vehicleAge, requiresRevision, update, errors }) {
  return (
    <>
      <View style={styles.tip}>
        <Text style={styles.tipTitle}>Documentos requeridos</Text>
        <Text style={styles.tipText}>
          Asegúrate de que las fotos sean nítidas y que las fechas coincidan con los documentos.
        </Text>
      </View>

      <Text style={styles.sectionHeader}>Licencia de conducción</Text>
      <TextField
        label="Número de licencia"
        placeholder="Ej. 1020304050"
        value={data.licenseNumber}
        onChangeText={(v) => update('licenseNumber', v.replace(/\D/g, ''))}
        error={errors.licenseNumber}
        keyboardType="number-pad"
        maxLength={12}
      />
      <DateField
        label="Fecha de vencimiento"
        value={data.licenseExpiry}
        onChange={(v) => update('licenseExpiry', v)}
        error={errors.licenseExpiry}
      />
      <ExpiryWarning title="Licencia" date={data.licenseExpiry} />
      <PhotoPicker
        document
        label="Foto de la licencia"
        value={data.licensePhoto}
        onChange={(v) => update('licensePhoto', v)}
        error={errors.licensePhoto}
      />

      <Text style={styles.sectionHeader}>SOAT</Text>
      <DateField
        label="Fecha de vencimiento"
        value={data.soatExpiry}
        onChange={(v) => update('soatExpiry', v)}
        error={errors.soatExpiry}
      />
      <ExpiryWarning title="SOAT" date={data.soatExpiry} />
      <PhotoPicker
        document
        label="Foto del SOAT vigente"
        value={data.soatPhoto}
        onChange={(v) => update('soatPhoto', v)}
        error={errors.soatPhoto}
      />

      <Text style={styles.sectionHeader}>Revisión técnico-mecánica</Text>
      {requiresRevision ? (
        <>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Obligatoria para tu vehículo</Text>
            <Text style={styles.alertText}>
              Modelo {vehicleYear} ({vehicleAge} años): requiere técnico-mecánica vigente.
            </Text>
          </View>
          <DateField
            label="Fecha de vencimiento"
            value={data.revisionExpiry}
            onChange={(v) => update('revisionExpiry', v)}
            error={errors.revisionExpiry}
          />
          <ExpiryWarning title="Técnico-mecánica" date={data.revisionExpiry} />
          <PhotoPicker
            document
            label="Foto del certificado"
            value={data.revisionPhoto}
            onChange={(v) => update('revisionPhoto', v)}
            error={errors.revisionPhoto}
          />
        </>
      ) : (
        <View style={styles.exemptBox}>
          <Text style={styles.exemptTitle}>Vehículo exento</Text>
          <Text style={styles.exemptText}>
            Tu vehículo modelo {vehicleYear} tiene menos de 6 años, no necesita técnico-mecánica.
          </Text>
        </View>
      )}

      <Text style={styles.sectionHeader}>Método de pago (Mercado Pago)</Text>
      <View style={styles.secureBox}>
        <Text style={styles.secureTitle}>Pagos seguros</Text>
        <Text style={styles.secureText}>
          Tus ganancias llegan a tu cuenta de Mercado Pago. No guardamos datos bancarios ni de
          tarjetas.
        </Text>
      </View>
      <TextField
        label="Correo de Mercado Pago"
        placeholder="conductor@correo.com"
        value={data.mercadoPagoEmail}
        onChangeText={(v) => update('mercadoPagoEmail', v.trim())}
        error={errors.mercadoPagoEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.sectionHeader}>Términos y condiciones</Text>
      <Checkbox
        label="Acepto los términos y condiciones de la plataforma y la comisión del 15% sobre cada viaje realizado."
        checked={data.termsAccepted}
        onChange={(v) => update('termsAccepted', v)}
        error={errors.termsAccepted}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 20 },
  backButton: { marginBottom: 12, paddingVertical: 4 },
  backText: { fontSize: 15, color: colors.black, fontWeight: '700' },
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
  tabText: { fontSize: 13, color: colors.muted, fontWeight: '600', textAlign: 'center' },
  activeText: { color: colors.black },
  content: { backgroundColor: colors.background, padding: 20, paddingBottom: 42 },
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
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  arrow: { color: '#FFF', fontSize: 20, marginLeft: 10 },
  notice: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
    marginTop: 14,
    paddingHorizontal: 15,
  },
  tip: { backgroundColor: colors.lightGreen, padding: 14, borderRadius: 10, marginBottom: 18 },
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
  alertTitle: { fontSize: 13, fontWeight: '700', color: '#B42318', marginBottom: 3 },
  alertText: { fontSize: 12, color: '#7A271A', lineHeight: 17 },
  exemptBox: {
    backgroundColor: colors.lightGreen,
    borderLeftWidth: 4,
    borderLeftColor: colors.green,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  exemptTitle: { fontSize: 13, fontWeight: '700', color: '#027A48', marginBottom: 3 },
  exemptText: { fontSize: 12, color: '#05603A', lineHeight: 17 },
  secureBox: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#0BA5EC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  secureTitle: { fontSize: 13, fontWeight: '700', color: '#026AA2', marginBottom: 3 },
  secureText: { fontSize: 12, color: '#0E7090', lineHeight: 17 },
  warningBox: {
    backgroundColor: colors.warningBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: -4,
  },
  warningTitle: { fontSize: 13, fontWeight: '700', color: '#B54708', marginBottom: 3 },
  warningText: { fontSize: 12, color: '#93370D', lineHeight: 17 },
});
