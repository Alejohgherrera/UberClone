import { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { registerDriver } from '../services/registrationService';
import { useSession } from './SessionContext';
import {
  getVehicleAge,
  hasErrors,
  validateDocuments,
  validatePersonal,
  validateVehicle,
} from '../utils/validators';

const RegistrationContext = createContext(null);

const initialPersonal = {
  photo: '',
  name: '',
  document: '',
  phone: '',
  birthDate: '',
  gender: '',
  email: '',
  language: 'Español',
};

const initialVehicle = {
  category: '',
  plate: '',
  make: '',
  model: '',
  year: '',
  color: '',
  capacity: '',
  photo: '',
};

const initialDocuments = {
  licenseNumber: '',
  licensePhoto: '',
  licenseExpiry: '',
  soatPhoto: '',
  soatExpiry: '',
  revisionPhoto: '',
  revisionExpiry: '',
  mercadoPagoEmail: '',
  termsAccepted: false,
};

export function RegistrationProvider({ children }) {
  const { hasSession, refreshDriver } = useSession();
  const [personal, setPersonal] = useState(initialPersonal);
  const [password, setPassword] = useState('');
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [documents, setDocuments] = useState(initialDocuments);
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState({});
  const [saving, setSaving] = useState(false);

  const vehicleAge = getVehicleAge(vehicle.year);
  const requiresRevision = vehicleAge >= 6;

  const tabErrors = [
    validatePersonal(personal, hasSession ? null : password),
    validateVehicle(vehicle),
    validateDocuments(documents, requiresRevision),
  ];
  const canSubmit = tabErrors.every((errors) => !hasErrors(errors));

  const touch = (tab, key) => setTouched((prev) => ({ ...prev, [`${tab}.${key}`]: true }));

  const updatePersonal = (key, value) => {
    setPersonal((prev) => ({ ...prev, [key]: value }));
    touch(1, key);
  };

  const updatePassword = (value) => {
    setPassword(value);
    touch(1, 'password');
  };

  const updateVehicle = (key, value) => {
    setVehicle((prev) => ({ ...prev, [key]: value }));
    touch(2, key);
  };

  const updateDocuments = (key, value) => {
    setDocuments((prev) => ({ ...prev, [key]: value }));
    touch(3, key);
  };

  const markAttempted = (tab) => setAttempted((prev) => ({ ...prev, [tab]: true }));

  const getVisibleErrors = (tab) => {
    const errors = tabErrors[tab - 1];
    const visible = {};
    Object.keys(errors).forEach((key) => {
      if (attempted[tab] || touched[`${tab}.${key}`]) visible[key] = errors[key];
    });
    return visible;
  };

  const submit = async () => {
    try {
      setSaving(true);
      await registerDriver({ personal, password, vehicle, documents, requiresRevision });
      Alert.alert(
        '¡Registro enviado!',
        'Tu cuenta quedó pendiente de aprobación. Podrás conectarte cuando sea aprobada.',
        [{ text: 'Ir al inicio', onPress: refreshDriver }]
      );
    } catch (error) {
      Alert.alert('No se pudo registrar', error.message);
    } finally {
      setSaving(false);
    }
  };

  const value = {
    personal,
    password,
    vehicle,
    documents,
    hasSession,
    saving,
    vehicleAge,
    requiresRevision,
    tabErrors,
    canSubmit,
    updatePersonal,
    updatePassword,
    updateVehicle,
    updateDocuments,
    markAttempted,
    getVisibleErrors,
    submit,
  };

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export function useRegistration() {
  return useContext(RegistrationContext);
}
