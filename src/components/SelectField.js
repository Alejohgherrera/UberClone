import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { colors } from '../theme/colors';

export default function SelectField({ label, value, options, placeholder, onChange, error }) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={[styles.select, error && styles.invalid]} onPress={() => setVisible(true)}>
        <Text style={value ? styles.value : styles.placeholder}>{value || placeholder}</Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            {options.map((option) => (
              <Pressable
                key={option}
                style={styles.option}
                onPress={() => {
                  onChange(option);
                  setVisible(false);
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
                {value === option ? <Text style={styles.check}>✓</Text> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
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
  select: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  invalid: { borderColor: colors.error },
  value: { fontSize: 16, color: colors.black },
  placeholder: { fontSize: 16, color: '#929292' },
  chevron: { fontSize: 22, color: colors.muted },
  error: { color: colors.error, fontSize: 12, marginTop: 5 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.38)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    padding: 22,
    paddingBottom: 36,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  sheetTitle: { fontWeight: '700', fontSize: 18, marginBottom: 10 },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionText: { fontSize: 16 },
  check: { color: colors.green, fontWeight: '700' },
});