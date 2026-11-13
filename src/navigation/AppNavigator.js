import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator';
import RegistrationTabs from './RegistrationTabs';
import LoginScreen from '../screens/LoginScreen';
import TripScreen from '../screens/TripScreen';
import TripSummaryScreen from '../screens/TripSummaryScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import { useSession } from '../context/SessionContext';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { driver, hasSession, loading } = useSession();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.black} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {driver ? (
        <>
          <Stack.Screen name="Main" component={DrawerNavigator} />
          <Stack.Screen name="Trip" component={TripScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen
            name="TripSummary"
            component={TripSummaryScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="TripDetail"
            component={TripDetailScreen}
            options={{ headerShown: true, title: 'Detalle del viaje', headerBackTitle: 'Atrás' }}
          />
        </>
      ) : hasSession ? (
        <Stack.Screen name="Registro" component={RegistrationTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registro" component={RegistrationTabs} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
