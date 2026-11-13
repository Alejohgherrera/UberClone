import { useRef } from 'react';
import { Text, View } from 'react-native';
import TextField from '../../components/TextField';
import SelectField from '../../components/SelectField';
import PhotoPicker from '../../components/PhotoPicker';
import PrimaryButton from '../../components/PrimaryButton';
import FormLayout from './FormLayout';
import { formStyles } from './styles';
import { useRegistration } from '../../context/RegistrationContext';
import { categories, colors as vehicleColors } from '../../data/options';
import { hasErrors } from '../../utils/validators';

export default function VehicleScreen({ navigation }) {
  const { vehicle, tabErrors, updateVehicle, markAttempted, getVisibleErrors } = useRegistration();
  const scrollRef = useRef(null);
  const errors = getVisibleErrors(2);

  const handleContinue = () => {
    if (hasErrors(tabErrors[1])) {
      markAttempted(2);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    navigation.navigate('Documentos');
  };

  return (
    <FormLayout scrollRef={scrollRef}>
      <View style={formStyles.tip}>
        <Text style={formStyles.tipTitle}>Información de tu vehículo</Text>
        <Text style={formStyles.tipText}>
          Usaremos estos datos para validar tu cuenta y categoría de viajes.
        </Text>
      </View>
      <SelectField
        label="Categoría"
        value={vehicle.category}
        options={categories}
        placeholder="Selecciona una categoría"
        onChange={(v) => updateVehicle('category', v)}
        error={errors.category}
      />
      <TextField
        label="Placa"
        placeholder="ABC123"
        value={vehicle.plate}
        onChangeText={(v) => updateVehicle('plate', v.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
        error={errors.plate}
        autoCapitalize="characters"
        maxLength={6}
      />
      <TextField
        label="Marca"
        placeholder="Ej. Toyota"
        value={vehicle.make}
        onChangeText={(v) => updateVehicle('make', v)}
        error={errors.make}
        maxLength={30}
      />
      <TextField
        label="Modelo"
        placeholder="Ej. Corolla"
        value={vehicle.model}
        onChangeText={(v) => updateVehicle('model', v)}
        error={errors.model}
        maxLength={30}
      />
      <TextField
        label="Año"
        placeholder="Ej. 2022"
        value={vehicle.year}
        onChangeText={(v) => updateVehicle('year', v.replace(/\D/g, ''))}
        error={errors.year}
        keyboardType="number-pad"
        maxLength={4}
      />
      <SelectField
        label="Color"
        value={vehicle.color}
        options={vehicleColors}
        placeholder="Selecciona un color"
        onChange={(v) => updateVehicle('color', v)}
        error={errors.color}
      />
      <TextField
        label="Capacidad de pasajeros"
        placeholder={vehicle.category === 'XL' ? 'Mínimo 6' : 'Ej. 4'}
        value={vehicle.capacity}
        onChangeText={(v) => updateVehicle('capacity', v.replace(/\D/g, ''))}
        error={errors.capacity}
        keyboardType="number-pad"
        maxLength={1}
      />
      <PhotoPicker
        vehicle
        label="Foto del vehículo"
        value={vehicle.photo}
        onChange={(v) => updateVehicle('photo', v)}
        error={errors.photo}
      />

      <PrimaryButton label="Continuar con documentos →" onPress={handleContinue} />
      <Text style={formStyles.notice}>
        El siguiente paso será cargar tus documentos y configurar tu cuenta de pagos.
      </Text>
    </FormLayout>
  );
}
