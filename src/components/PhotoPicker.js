import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';

export default function PhotoPicker({ label, value, onChange, error, vehicle = false, document = false }) {
  const isProfile = !vehicle && !document;

  const options = {
    mediaTypes: ['images'],
    quality: 0.7,
    allowsEditing: isProfile,
    aspect: isProfile ? [1, 1] : undefined,
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Permite el acceso a la cámara en la configuración.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync(options);
    if (!result.canceled) onChange(result.assets[0].uri);
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Permite el acceso a tus fotos en la configuración.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled) onChange(result.assets[0].uri);
  };

  const choosePhoto = () => {
    Alert.alert(label, '¿De dónde quieres tomar la foto?', [
      { text: 'Cámara', onPress: openCamera },
      { text: 'Galería', onPress: openGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  let hint = 'Cámara o galería';
  if (document) hint = 'Foto nítida y legible del documento';
  if (vehicle) hint = 'Debe verse claramente la placa';

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={[styles.box, error && styles.invalid]} onPress={choosePhoto}>
        {value ? (
          <Image source={{ uri: value }} style={styles.preview} />
        ) : (
          <>
            <View style={styles.camera}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
            <Text style={styles.add}>Agregar foto</Text>
            <Text style={styles.hint}>{hint}</Text>
          </>
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 7 },
  box: {
    height: 130,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#B9B9B9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#FCFCFC',
  },
  invalid: { borderColor: colors.error },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  camera: {
    width: 32,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: { fontSize: 16 },
  add: { marginTop: 7, fontSize: 14, fontWeight: '700' },
  hint: { marginTop: 3, fontSize: 12, color: colors.muted },
  error: { color: colors.error, fontSize: 12, marginTop: 5 },
});
