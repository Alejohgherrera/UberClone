import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function Checkbox({ label, checked, onChange, error }) {
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.row} onPress={() => onChange(!checked)}>
        <View style={[styles.box, checked && styles.boxChecked]}>
          {checked ? <Text style={styles.check}>✓</Text> : null}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  box: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#B9B9B9',
    borderRadius: 5,
    marginRight: 10,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  boxChecked: { backgroundColor: colors.green, borderColor: colors.green },
  check: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  label: { fontSize: 14, color: colors.black, flex: 1, lineHeight: 20 },
  error: { color: colors.error, fontSize: 12, marginTop: 6, marginLeft: 32 },
});
