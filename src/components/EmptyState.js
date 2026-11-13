import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function EmptyState({ icon, title, text }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  icon: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '800', color: colors.black, textAlign: 'center' },
  text: { fontSize: 14, color: colors.muted, marginTop: 6, textAlign: 'center' },
});
