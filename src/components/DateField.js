import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';

export default function DateField({ label, value, onChange, error, placeholder = 'AAAA-MM-DD' }) {
  const handleChange = (text) => {
    // Solo permitir dígitos y formatear automáticamente como AAAA-MM-DD
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4 && digits.length <= 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    }
    onChange(formatted);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#929292"
        style={[styles.input, error && styles.invalid]}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        maxLength={10}
        keyboardType="numeric"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 7,
    color: colors.black,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.black,
  },
  invalid: { borderColor: colors.error },
  error: { color: colors.error, fontSize: 12, marginTop: 5 },
});
