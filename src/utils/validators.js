const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const TEXT_REGEX = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ0-9 -]{2,30}$/;

const MAX_AGE_BY_CATEGORY = {
  Económico: 15,
  Comfort: 10,
  XL: 10,
  Premium: 6,
};

export function parseDate(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const [year, month, day] = text.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function today() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export function daysUntil(text) {
  const date = parseDate(text);
  if (!date) return null;
  return Math.round((date - today()) / (1000 * 60 * 60 * 24));
}

function getAge(text) {
  const birth = parseDate(text);
  if (!birth) return null;
  const now = today();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function validateExpiry(text, label, maxYears) {
  if (!text) return `Ingresa el vencimiento de ${label}.`;
  const days = daysUntil(text);
  if (days === null) return 'Fecha no válida (AAAA-MM-DD).';
  if (days <= 0) return `${label} debe estar vigente.`;
  if (days > maxYears * 366) return `La fecha de ${label} no es real, revísala.`;
  return null;
}

export function getVehicleAge(year) {
  const value = Number(year);
  return value > 1900 ? new Date().getFullYear() - value : 0;
}

export function validatePersonal(data, password) {
  const errors = {};
  const name = data.name.trim().replace(/\s+/g, ' ');
  const age = getAge(data.birthDate);

  if (!data.photo) errors.photo = 'La foto de perfil es obligatoria.';

  if (!name) errors.name = 'Ingresa tu nombre completo.';
  else if (!/^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ ]{3,50}$/.test(name)) errors.name = 'Nombre: solo letras y espacios.';
  else if (name.split(' ').length < 2) errors.name = 'Ingresa nombre y apellido.';

  if (!data.document) errors.document = 'Ingresa tu documento de identidad.';
  else if (!/^[1-9]\d{5,9}$/.test(data.document)) errors.document = 'Documento: entre 6 y 10 dígitos, sin empezar en 0.';

  if (!data.phone) errors.phone = 'Ingresa tu número de celular.';
  else if (!/^3\d{9}$/.test(data.phone)) errors.phone = 'Celular: 10 dígitos y debe empezar por 3.';

  if (!data.birthDate) errors.birthDate = 'Ingresa tu fecha de nacimiento.';
  else if (age === null) errors.birthDate = 'Fecha no válida (AAAA-MM-DD).';
  else if (age < 18) errors.birthDate = 'Debes ser mayor de 18 años.';
  else if (age > 80) errors.birthDate = 'Revisa tu fecha de nacimiento.';

  if (!data.gender) errors.gender = 'Selecciona tu género.';

  if (!data.email) errors.email = 'Ingresa tu correo electrónico.';
  else if (!EMAIL_REGEX.test(data.email)) errors.email = 'Correo no válido: sin tildes, ñ ni espacios.';

  if (password !== null) {
    if (!password) errors.password = 'Crea una contraseña.';
    else if (password.length < 8) errors.password = 'Mínimo 8 caracteres.';
    else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      errors.password = 'La contraseña debe tener letras y números.';
    }
  }

  return errors;
}

export function validateVehicle(data) {
  const errors = {};
  const capacity = Number(data.capacity);
  const year = Number(data.year);
  const maxAge = MAX_AGE_BY_CATEGORY[data.category];

  if (!data.category) errors.category = 'Selecciona una categoría.';

  if (!data.plate) errors.plate = 'Ingresa la placa.';
  else if (!/^[A-Z]{3}\d{3}$/.test(data.plate)) errors.plate = 'Placa no válida: 3 letras y 3 números (ej. ABC123).';

  if (!data.make.trim()) errors.make = 'Ingresa la marca.';
  else if (!TEXT_REGEX.test(data.make.trim())) errors.make = 'Marca: solo letras y números.';

  if (!data.model.trim()) errors.model = 'Ingresa el modelo.';
  else if (!TEXT_REGEX.test(data.model.trim())) errors.model = 'Modelo: solo letras y números.';

  if (!data.year) errors.year = 'Ingresa el año.';
  else if (year < 1990 || year > new Date().getFullYear() + 1) errors.year = 'Año no válido.';
  else if (maxAge && getVehicleAge(year) > maxAge) {
    errors.year = `Para ${data.category} el vehículo debe tener máximo ${maxAge} años.`;
  }

  if (!data.color) errors.color = 'Selecciona el color.';

  if (!data.capacity) errors.capacity = 'Ingresa la capacidad.';
  else if (data.category === 'XL' && (capacity < 6 || capacity > 8)) {
    errors.capacity = 'XL requiere entre 6 y 8 pasajeros.';
  } else if (data.category !== 'XL' && (capacity < 3 || capacity > 4)) {
    errors.capacity = 'La capacidad debe ser de 3 o 4 pasajeros.';
  }

  if (!data.photo) errors.photo = 'La foto del vehículo es obligatoria.';

  return errors;
}

export function validateDocuments(data, requiresRevision, documentNumber) {
  const errors = {};

  if (!data.licenseNumber) errors.licenseNumber = 'Ingresa el número de licencia.';
  else if (data.licenseNumber !== documentNumber) {
    errors.licenseNumber = 'En Colombia el número de la licencia es tu número de cédula.';
  }

  if (!data.licensePhoto) errors.licensePhoto = 'La foto de la licencia es obligatoria.';

  const licenseError = validateExpiry(data.licenseExpiry, 'la licencia', 10);
  if (licenseError) errors.licenseExpiry = licenseError;

  if (!data.soatPhoto) errors.soatPhoto = 'La foto del SOAT es obligatoria.';

  const soatError = validateExpiry(data.soatExpiry, 'el SOAT', 1);
  if (soatError) errors.soatExpiry = soatError;

  if (requiresRevision) {
    if (!data.revisionPhoto) errors.revisionPhoto = 'La foto de la técnico-mecánica es obligatoria.';
    const revisionError = validateExpiry(data.revisionExpiry, 'la técnico-mecánica', 1);
    if (revisionError) errors.revisionExpiry = revisionError;
  }

  if (!data.mercadoPagoEmail) errors.mercadoPagoEmail = 'Ingresa el correo de Mercado Pago.';
  else if (!EMAIL_REGEX.test(data.mercadoPagoEmail)) errors.mercadoPagoEmail = 'Correo no válido: sin tildes, ñ ni espacios.';

  if (!data.termsAccepted) errors.termsAccepted = 'Debes aceptar los términos y la comisión del 15%.';

  return errors;
}
