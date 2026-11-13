import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { useSession } from '../context/SessionContext';
import { colors } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await signIn(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.brand}>
          Uber <Text style={styles.driver}>Conductor</Text>
        </Text>
        <Text style={styles.title}>Inicia sesión</Text>

        <TextField
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          error={error}
        />

        <PrimaryButton label="Ingresar" onPress={handleLogin} loading={loading} />

        <Pressable style={styles.link} onPress={() => navigation.navigate('Registro')}>
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate como conductor</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  brand: { fontSize: 21, fontWeight: '800', color: colors.black },
  driver: { color: colors.green },
  title: { fontSize: 28, fontWeight: '800', marginTop: 18, marginBottom: 24, color: colors.black },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: colors.black, fontWeight: '600', textDecorationLine: 'underline' },
});
