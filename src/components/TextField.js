import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';

export default function TextField({ label, error, ...props }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#929292"
        style={[styles.input, error && styles.invalid]}
        {...props}
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
