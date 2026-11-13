import { Text, View } from 'react-native';
import TextField from '../../components/TextField';
import PhotoPicker from '../../components/PhotoPicker';
import DateField from '../../components/DateField';
import Checkbox from '../../components/Checkbox';
import PrimaryButton from '../../components/PrimaryButton';
import FormLayout from './FormLayout';
import { formStyles } from './styles';
import { useRegistration } from '../../context/RegistrationContext';
import { COMMISSION_RATE } from '../../config/pricing';
import { daysUntil } from '../../utils/validators';

function addYears(years) {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return date;
}

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
}

function ExpiryWarning({ title, date }) {
  const days = daysUntil(date);
  if (days === null || days <= 0 || days > 30) return null;

  return (
    <View style={formStyles.warningBox}>
      <Text style={formStyles.warningTitle}>⚠️ {title} próximo a vencer</Text>
      <Text style={formStyles.warningText}>
        {days === 1 ? 'Vence mañana.' : `Vence en ${days} días.`} Puedes registrarte, pero
        recuerda renovarlo a tiempo para no quedar suspendido.
      </Text>
    </View>
  );
}

export default function DocumentsScreen() {
  const {
    documents,
    vehicle,
    vehicleAge,
    requiresRevision,
    canSubmit,
    saving,
    updateDocuments,
    getVisibleErrors,
    submit,
  } = useRegistration();
  const errors = getVisibleErrors(3);

  return (
    <FormLayout>
      <View style={formStyles.tip}>
        <Text style={formStyles.tipTitle}>Documentos requeridos</Text>
        <Text style={formStyles.tipText}>
          Asegúrate de que las fotos sean nítidas y que las fechas coincidan con los documentos.
        </Text>
      </View>

      <Text style={formStyles.sectionHeader}>Licencia de conducción</Text>
      <TextField
        label="Número de licencia"
        placeholder="Ej. 1020304050"
        value={documents.licenseNumber}
        onChangeText={(v) => updateDocuments('licenseNumber', v.replace(/\D/g, ''))}
        error={errors.licenseNumber}
        keyboardType="number-pad"
        maxLength={12}
      />
      <DateField
        label="Fecha de vencimiento"
        value={documents.licenseExpiry}
        onChange={(v) => updateDocuments('licenseExpiry', v)}
        error={errors.licenseExpiry}
        minimumDate={tomorrow()}
        maximumDate={addYears(10)}
      />
      <ExpiryWarning title="Licencia" date={documents.licenseExpiry} />
      <PhotoPicker
        document
        label="Foto de la licencia"
        value={documents.licensePhoto}
        onChange={(v) => updateDocuments('licensePhoto', v)}
        error={errors.licensePhoto}
      />

      <Text style={formStyles.sectionHeader}>SOAT</Text>
      <DateField
        label="Fecha de vencimiento"
        value={documents.soatExpiry}
        onChange={(v) => updateDocuments('soatExpiry', v)}
        error={errors.soatExpiry}
        minimumDate={tomorrow()}
        maximumDate={addYears(1)}
      />
      <ExpiryWarning title="SOAT" date={documents.soatExpiry} />
      <PhotoPicker
        document
        label="Foto del SOAT vigente"
        value={documents.soatPhoto}
        onChange={(v) => updateDocuments('soatPhoto', v)}
        error={errors.soatPhoto}
      />

      <Text style={formStyles.sectionHeader}>Revisión técnico-mecánica</Text>
      {requiresRevision ? (
        <>
          <View style={formStyles.alertBox}>
            <Text style={formStyles.alertTitle}>Obligatoria para tu vehículo</Text>
            <Text style={formStyles.alertText}>
              Modelo {vehicle.year} ({vehicleAge} años): requiere técnico-mecánica vigente.
            </Text>
          </View>
          <DateField
            label="Fecha de vencimiento"
            value={documents.revisionExpiry}
            onChange={(v) => updateDocuments('revisionExpiry', v)}
            error={errors.revisionExpiry}
            minimumDate={tomorrow()}
            maximumDate={addYears(1)}
          />
          <ExpiryWarning title="Técnico-mecánica" date={documents.revisionExpiry} />
          <PhotoPicker
            document
            label="Foto del certificado"
            value={documents.revisionPhoto}
            onChange={(v) => updateDocuments('revisionPhoto', v)}
            error={errors.revisionPhoto}
          />
        </>
      ) : (
        <View style={formStyles.exemptBox}>
          <Text style={formStyles.exemptTitle}>Vehículo exento</Text>
          <Text style={formStyles.exemptText}>
            Tu vehículo modelo {vehicle.year} tiene menos de 6 años, no necesita técnico-mecánica.
          </Text>
        </View>
      )}

      <Text style={formStyles.sectionHeader}>Método de pago (Mercado Pago)</Text>
      <View style={formStyles.secureBox}>
        <Text style={formStyles.secureTitle}>Pagos seguros</Text>
        <Text style={formStyles.secureText}>
          Tus ganancias llegan a tu cuenta de Mercado Pago. No guardamos datos bancarios ni de
          tarjetas.
        </Text>
      </View>
      <TextField
        label="Correo de Mercado Pago"
        placeholder="conductor@correo.com"
        value={documents.mercadoPagoEmail}
        onChangeText={(v) => updateDocuments('mercadoPagoEmail', v.trim())}
        error={errors.mercadoPagoEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={formStyles.sectionHeader}>Términos y condiciones</Text>
      <Checkbox
        label={`Acepto los términos y condiciones de la plataforma y la comisión del ${COMMISSION_RATE * 100}% sobre cada viaje realizado.`}
        checked={documents.termsAccepted}
        onChange={(v) => updateDocuments('termsAccepted', v)}
        error={errors.termsAccepted}
      />

      <PrimaryButton
        label="Enviar registro"
        onPress={submit}
        disabled={!canSubmit}
        loading={saving}
      />
      <Text style={formStyles.notice}>
        {canSubmit
          ? 'Tu cuenta quedará pendiente hasta que verifiquemos tus documentos.'
          : 'Completa todos los campos de las 3 pestañas para enviar el registro.'}
      </Text>
    </FormLayout>
  );
}
