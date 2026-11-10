/**
 * Servicio de persistencia y comunicación con Firebase Firestore para el Conductor.
 *
 * NOTA DE ARQUITECTURA:
 * La base de datos Firebase aún se encuentra en proceso de configuración.
 * Este servicio implementa el patrón Repository/Adapter:
 * - Define las interfaces y modelos de datos exactos requeridos (colecciones 'driverLocations' y 'drivers').
 * - Deja las funciones listas con la sintaxis de Firebase Firestore para conectarlas inmediatamente al instanciar `db = getFirestore()`.
 * - Opera actualmente en modo local/preparado para no bloquear el desarrollo ni la interfaz.
 */

export const FIRESTORE_COLLECTIONS = {
  DRIVERS: 'drivers',
  DRIVER_LOCATIONS: 'driverLocations',
  RIDE_REQUESTS: 'rideRequests',
};

// Estado local de prueba para simular el perfil del conductor mientras se enlaza la BD
let localDriverProfile = {
  driverId: 'driver_default_123',
  name: 'Alejandro Herrera',
  email: 'conductor@uberclone.com',
  vehicle: 'Toyota Corolla • ABC123',
  approvalStatus: 'approved', // 'approved' | 'pending' | 'rejected'
  availability: false,
};

/**
 * Consulta el estado de aprobación del conductor en Firestore.
 * Regla de negocio: Solamente conductores con 'approved' pueden conectarse.
 *
 * @param {string} driverId
 * @returns {Promise<string>} 'approved' | 'pending' | 'rejected'
 */
export async function getDriverApprovalStatus(driverId = localDriverProfile.driverId) {
  /*
   * =====================================================================
   * PENDIENTE DE INTEGRACIÓN CON FIREBASE:
   * Descomentar al tener inicializado Firebase en src/services/firebase.js:
   *
   * import { doc, getDoc } from 'firebase/firestore';
   * import { db } from './firebase';
   *
   * const docRef = doc(db, FIRESTORE_COLLECTIONS.DRIVERS, driverId);
   * const docSnap = await getDoc(docRef);
   * if (docSnap.exists()) {
   *   return docSnap.data().approvalStatus || 'pending';
   * }
   * return 'pending';
   * =====================================================================
   */
  return localDriverProfile.approvalStatus;
}

/**
 * Permite cambiar el estado de aprobación localmente (útil para pruebas de interfaz de estados 'pending', 'rejected' y 'approved').
 *
 * @param {'approved' | 'pending' | 'rejected'} newStatus
 */
export function setLocalApprovalStatus(newStatus) {
  localDriverProfile.approvalStatus = newStatus;
  console.log(`[driverService] Estado de aprobación cambiado a: ${newStatus}`);
}

/**
 * Obtiene el perfil actual del conductor.
 */
export function getCurrentDriverProfile() {
  return { ...localDriverProfile };
}

/**
 * Actualiza la disponibilidad del conductor ('Disponible' / 'No disponible') en Firestore.
 *
 * @param {string} driverId
 * @param {boolean} isAvailable
 * @returns {Promise<boolean>}
 */
export async function updateDriverAvailability(driverId = localDriverProfile.driverId, isAvailable) {
  /*
   * =====================================================================
   * PENDIENTE DE INTEGRACIÓN CON FIREBASE:
   * Descomentar al tener inicializado Firebase:
   *
   * import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
   * import { db } from './firebase';
   *
   * const driverRef = doc(db, FIRESTORE_COLLECTIONS.DRIVERS, driverId);
   * await updateDoc(driverRef, {
   *   availability: isAvailable,
   *   updatedAt: serverTimestamp(),
   * });
   * =====================================================================
   */
  localDriverProfile.availability = isAvailable;
  console.log(
    `[driverService -> Firestore: drivers/${driverId}] availability = ${isAvailable}`
  );
  return true;
}

/**
 * Actualiza las coordenadas del conductor en tiempo real en la colección 'driverLocations'.
 * Para evitar duplicar registros innecesarios, se utiliza el ID del conductor como clave del documento
 * (equivalente a setDoc con merge en Firestore).
 *
 * @param {string} driverId
 * @param {{ latitude: number, longitude: number, heading?: number, speed?: number }} coords
 * @returns {Promise<boolean>}
 */
export async function updateDriverLocation(driverId = localDriverProfile.driverId, coords) {
  if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
    return false;
  }

  const payload = {
    driverId,
    latitude: coords.latitude,
    longitude: coords.longitude,
    heading: coords.heading ?? 0,
    speed: coords.speed ?? 0,
    updatedAt: new Date().toISOString(),
  };

  /*
   * =====================================================================
   * PENDIENTE DE INTEGRACIÓN CON FIREBASE:
   * Descomentar al tener inicializado Firebase:
   *
   * import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
   * import { db } from './firebase';
   *
   * const locationRef = doc(db, FIRESTORE_COLLECTIONS.DRIVER_LOCATIONS, driverId);
   * await setDoc(locationRef, {
   *   ...payload,
   *   updatedAt: serverTimestamp(),
   * }, { merge: true });
   * =====================================================================
   */
  console.log(
    `[driverService -> Firestore: driverLocations/${driverId}] Coords: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
  );
  return true;
}

/**
 * Escucha solicitudes de viaje en tiempo real dirigidas al conductor cuando está disponible.
 *
 * @param {string} driverId
 * @param {(request: any) => void} onNewRequest
 * @returns {() => void} Función de limpieza para cancelar la suscripción
 */
export function subscribeToRideRequests(driverId = localDriverProfile.driverId, onNewRequest) {
  /*
   * =====================================================================
   * PENDIENTE DE INTEGRACIÓN CON FIREBASE:
   * Descomentar al tener inicializado Firebase:
   *
   * import { collection, query, where, onSnapshot } from 'firebase/firestore';
   * import { db } from './firebase';
   *
   * const q = query(
   *   collection(db, FIRESTORE_COLLECTIONS.RIDE_REQUESTS),
   *   where('driverId', '==', driverId),
   *   where('status', '==', 'pending')
   * );
   * const unsubscribe = onSnapshot(q, (snapshot) => {
   *   snapshot.docChanges().forEach((change) => {
   *     if (change.type === 'added') {
   *       onNewRequest({ id: change.doc.id, ...change.doc.data() });
   *     }
   *   });
   * });
   * return unsubscribe;
   * =====================================================================
   */
  console.log(`[driverService] Suscrito a solicitudes para driver: ${driverId}`);

  // Retorna función de limpieza obligatoria
  return () => {
    console.log(`[driverService] Desuscrito de solicitudes para driver: ${driverId}`);
  };
}

