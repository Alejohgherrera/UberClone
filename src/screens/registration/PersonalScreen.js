import { useRef } from 'react';
import TextField from '../../components/TextField';
import SelectField from '../../components/SelectField';
import PhotoPicker from '../../components/PhotoPicker';
import DateField from '../../components/DateField';
import PrimaryButton from '../../components/PrimaryButton';
import FormLayout from './FormLayout';
import { useRegistration } from '../../context/RegistrationContext';
import { genders, languages } from '../../data/options';
import { hasErrors } from '../../utils/validators';

function eighteenYearsAgo() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date;
}

export default function PersonalScreen({ navigation }) {
  const {
    personal,
    password,
    hasSession,
    tabErrors,
    updatePersonal,
    updatePassword,
    markAttempted,
    getVisibleErrors,
  } = useRegistration();
  const scrollRef = useRef(null);
  const errors = getVisibleErrors(1);

  const handleContinue = () => {
    if (hasErrors(tabErrors[0])) {
      markAttempted(1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    navigation.navigate('Vehiculo');
  };

  return (
    <FormLayout scrollRef={scrollRef}>
      <PhotoPicker
        label="Foto de perfil"
        value={personal.photo}
        onChange={(v) => updatePersonal('photo', v)}
        error={errors.photo}
      />
      <TextField
        label="Nombre completo"
        placeholder="Ej. María González"
        value={personal.name}
        onChangeText={(v) => updatePersonal('name', v)}
        error={errors.name}
        autoCapitalize="words"
        maxLength={50}
      />
      <TextField
        label="Documento de identidad"
        placeholder="Solo números"
        value={personal.document}
        onChangeText={(v) => updatePersonal('document', v.replace(/\D/g, ''))}
        error={errors.document}
        keyboardType="number-pad"
        maxLength={10}
      />
      <TextField
        label="Número de celular"
        placeholder="3001234567"
        value={personal.phone}
        onChangeText={(v) => updatePersonal('phone', v.replace(/\D/g, ''))}
        error={errors.phone}
        keyboardType="phone-pad"
        maxLength={10}
      />
      <DateField
        label="Fecha de nacimiento"
        value={personal.birthDate}
        onChange={(v) => updatePersonal('birthDate', v)}
        error={errors.birthDate}
        minimumDate={new Date(1940, 0, 1)}
        maximumDate={eighteenYearsAgo()}
      />
      <SelectField
        label="Género"
        value={personal.gender}
        options={genders}
        placeholder="Selecciona una opción"
        onChange={(v) => updatePersonal('gender', v)}
        error={errors.gender}
      />
      <TextField
        label="Correo electrónico"
        placeholder="nombre@correo.com"
        value={personal.email}
        onChangeText={(v) => updatePersonal('email', v.trim())}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {!hasSession && (
        <TextField
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChangeText={updatePassword}
          error={errors.password}
          secureTextEntry
          autoCapitalize="none"
        />
      )}
      <SelectField
        label="Idioma"
        value={personal.language}
        options={languages}
        placeholder="Selecciona tu idioma"
        onChange={(v) => updatePersonal('language', v)}
      />

      <PrimaryButton label="Continuar con vehículo →" onPress={handleContinue} />
    </FormLayout>
  );
}
