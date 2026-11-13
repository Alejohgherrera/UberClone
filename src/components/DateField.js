import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { parseDate } from '../utils/validators';
import { colors } from '../theme/colors';

function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function DateField({ label, value, onChange, error, minimumDate, maximumDate }) {
  const [visible, setVisible] = useState(false);
  const selected = parseDate(value) || maximumDate || minimumDate || new Date();

  const handleValueChange = (event, date) => {
    if (Platform.OS === 'android') setVisible(false);
    if (date) onChange(formatDate(date));
  };

  const picker = (
    <DateTimePicker
      value={selected}
      mode="date"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      onValueChange={handleValueChange}
      onDismiss={() => setVisible(false)}
      locale="es-CO"
      themeVariant="light"
      textColor={colors.black}
    />
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={[styles.input, error && styles.invalid]} onPress={() => setVisible(true)}>
        <Text style={value ? styles.value : styles.placeholder}>{value || 'Selecciona una fecha'}</Text>
        <Text style={styles.icon}>📅</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {visible && Platform.OS === 'android' && picker}

      {Platform.OS === 'ios' && (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
          <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
            <Pressable style={styles.sheet}>
              <Text style={styles.sheetTitle}>{label}</Text>
              {picker}
              <Pressable
                style={styles.doneButton}
                onPress={() => {
                  if (!value) onChange(formatDate(selected));
                  setVisible(false);
                }}
              >
                <Text style={styles.doneText}>Listo</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 7, color: colors.black },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  invalid: { borderColor: colors.error },
  value: { fontSize: 16, color: colors.black },
  placeholder: { fontSize: 16, color: '#929292' },
  icon: { fontSize: 18 },
  error: { color: colors.error, fontSize: 12, marginTop: 5 },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    padding: 22,
    paddingBottom: 36,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  sheetTitle: { fontWeight: '700', fontSize: 18, marginBottom: 6, color: colors.black },
  doneButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  doneText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
