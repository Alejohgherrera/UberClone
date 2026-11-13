import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import PersonalScreen from '../screens/registration/PersonalScreen';
import VehicleScreen from '../screens/registration/VehicleScreen';
import DocumentsScreen from '../screens/registration/DocumentsScreen';
import { RegistrationProvider, useRegistration } from '../context/RegistrationContext';
import { hasErrors } from '../utils/validators';
import { colors } from '../theme/colors';

const Tab = createMaterialTopTabNavigator();
const ROUTES = ['Personal', 'Vehiculo', 'Documentos'];
const LABELS = ['1. Datos personales', '2. Vehículo', '3. Documentos y pagos'];

function Tabs() {
  const { tabErrors, markAttempted, saving } = useRegistration();

  const blockIfPreviousInvalid = (index) => ({ navigation }) => ({
    tabPress: (event) => {
      for (let i = 0; i < index; i++) {
        if (hasErrors(tabErrors[i])) {
          event.preventDefault();
          markAttempted(i + 1);
          navigation.navigate(ROUTES[i]);
          return;
        }
      }
      if (saving) event.preventDefault();
    },
  });

  const screens = [PersonalScreen, VehicleScreen, DocumentsScreen];

  return (
    <Tab.Navigator
      screenOptions={{
        swipeEnabled: false,
        tabBarActiveTintColor: colors.black,
        tabBarInactiveTintColor: colors.muted,
        tabBarIndicatorStyle: { backgroundColor: colors.green, height: 3 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700', textTransform: 'none' },
        tabBarStyle: { elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
      }}
    >
      {ROUTES.map((name, index) => (
        <Tab.Screen
          key={name}
          name={name}
          component={screens[index]}
          options={{ title: `${hasErrors(tabErrors[index]) ? '' : '✓ '}${LABELS[index]}` }}
          listeners={blockIfPreviousInvalid(index)}
        />
      ))}
    </Tab.Navigator>
  );
}

export default function RegistrationTabs({ navigation }) {
  return (
    <RegistrationProvider>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          {navigation.canGoBack() && (
            <Pressable style={styles.back} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>← Ya tengo cuenta</Text>
            </Pressable>
          )}
          <Text style={styles.brand}>
            Uber <Text style={styles.driver}>Conductor</Text>
          </Text>
          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>Completa tus datos para comenzar a conducir</Text>
        </View>
        <Tabs />
      </SafeAreaView>
    </RegistrationProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  back: { marginBottom: 10, paddingVertical: 4 },
  backText: { fontSize: 15, fontWeight: '700', color: colors.black },
  brand: { fontSize: 21, fontWeight: '800', color: colors.black },
  driver: { color: colors.green },
  title: { fontSize: 28, fontWeight: '800', marginTop: 18, color: colors.black },
  subtitle: { color: colors.muted, marginTop: 6, fontSize: 15 },
});
