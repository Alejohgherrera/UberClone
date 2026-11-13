import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentDriver, updateDriverAvailability } from '../services/driverService';
import { setPreference } from '../services/preferences';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [driver, setDriver] = useState(null);
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshDriver = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setHasSession(Boolean(data.session));

      const current = data.session ? await getCurrentDriver() : null;
      setDriver(current);
      if (current) setPreference('language', current.language);
      return current;
    } catch (error) {
      console.warn('Error cargando la sesión:', error.message);
      setDriver(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDriver();

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setDriver(null);
        setHasSession(false);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error('Correo o contraseña incorrectos.');
    await refreshDriver();
  };

  const signOut = async () => {
    if (driver) await updateDriverAvailability(driver.id, false).catch(() => {});
    await setPreference('lastAvailability', false);
    await supabase.auth.signOut();
  };

  const value = { driver, hasSession, loading, refreshDriver, signIn, signOut };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
