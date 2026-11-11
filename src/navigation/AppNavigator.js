import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import { getCurrentDriver } from '../services/driverService';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';

export default function AppNavigator() {
  const [screen, setScreen] = useState('loading');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const checkDriver = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(Boolean(data.session));
      const driver = await getCurrentDriver();
      setIsRegistered(Boolean(driver));
      setScreen(driver ? 'home' : 'registration');
    } catch (error) {
      console.warn('Error validando la sesión:', error.message);
      setScreen('registration');
    }
  };

  useEffect(() => {
    checkDriver();
  }, []);

  if (screen === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.black} />
      </View>
    );
  }

  if (screen === 'registration') {
    return (
      <RegistrationScreen
        isLoggedIn={isLoggedIn}
        onRegistered={checkDriver}
        onBack={isRegistered ? () => setScreen('home') : null}
      />
    );
  }

  return <HomeScreen onOpenRegistration={() => setScreen('registration')} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
