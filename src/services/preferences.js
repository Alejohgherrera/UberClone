import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  language: 'pref:language',
  lastAvailability: 'pref:lastAvailability',
};

export async function getPreference(name, fallback) {
  try {
    const value = await AsyncStorage.getItem(KEYS[name]);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export async function setPreference(name, value) {
  try {
    await AsyncStorage.setItem(KEYS[name], JSON.stringify(value));
  } catch (error) {
    console.warn('No se pudo guardar la preferencia:', error.message);
  }
}
