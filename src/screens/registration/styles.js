import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const box = {
  borderLeftWidth: 4,
  padding: 12,
  borderRadius: 8,
  marginBottom: 16,
};

export const formStyles = StyleSheet.create({
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginTop: 18,
    marginBottom: 12,
  },
  notice: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
    marginTop: 14,
    paddingHorizontal: 15,
  },
  tip: { backgroundColor: colors.lightGreen, padding: 14, borderRadius: 10, marginBottom: 18 },
  tipTitle: { fontWeight: '700', marginBottom: 3 },
  tipText: { color: colors.muted, fontSize: 13 },
  alertBox: { ...box, backgroundColor: '#FEF3F2', borderLeftColor: colors.error },
  alertTitle: { fontSize: 13, fontWeight: '700', color: '#B42318', marginBottom: 3 },
  alertText: { fontSize: 12, color: '#7A271A', lineHeight: 17 },
  exemptBox: { ...box, backgroundColor: colors.lightGreen, borderLeftColor: colors.green },
  exemptTitle: { fontSize: 13, fontWeight: '700', color: '#027A48', marginBottom: 3 },
  exemptText: { fontSize: 12, color: '#05603A', lineHeight: 17 },
  secureBox: { ...box, backgroundColor: '#F0F9FF', borderLeftColor: '#0BA5EC' },
  secureTitle: { fontSize: 13, fontWeight: '700', color: '#026AA2', marginBottom: 3 },
  secureText: { fontSize: 12, color: '#0E7090', lineHeight: 17 },
  warningBox: {
    ...box,
    backgroundColor: colors.warningBg,
    borderLeftColor: colors.warning,
    marginTop: -4,
  },
  warningTitle: { fontSize: 13, fontWeight: '700', color: '#B54708', marginBottom: 3 },
  warningText: { fontSize: 12, color: '#93370D', lineHeight: 17 },
});
