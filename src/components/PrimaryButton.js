import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

export default function PrimaryButton({ label, onPress, disabled, loading, style }) {
  return (
    <Pressable
      style={[styles.button, (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.text}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 10,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  disabled: { backgroundColor: '#A3A3A3' },
  text: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
