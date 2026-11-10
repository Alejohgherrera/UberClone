import { useState } from 'react';
import HomeScreen from '../screens/HomeScreen';
import RegistrationScreen from '../screens/RegistrationScreen';

/**
 * Navegador principal de la aplicación UberClone para conductores.
 * Flujo de usuario:
 * 1. Inicia en el Registro (RegistrationScreen) para crear la cuenta y subir documentos.
 * 2. Al completar el registro, avanza a la pantalla principal del conductor (HomeScreen).
 */
export default function AppNavigator() {
  const [currentScreen, setCurrentScreen] = useState('Registration');

  if (currentScreen === 'Registration') {
    return (
      <RegistrationScreen
        onNavigateToHome={() => setCurrentScreen('Home')}
      />
    );
  }

  return (
    <HomeScreen
      onNavigateToRegistration={() => setCurrentScreen('Registration')}
    />
  );
}
