import { supabase } from '../lib/supabase';

const BUCKET = 'driver-files';

async function uploadPhoto(userId, name, uri) {
  if (!uri) return null;

  const body = await fetch(uri).then((res) => res.arrayBuffer());
  const path = `${userId}/${name}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, { contentType: 'image/jpeg', upsert: true });

  if (error) throw error;
  return path;
}

async function getOrCreateUser(email, password) {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user.id;

  const { data: signUp, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  if (!signUp.session) {
    throw new Error('Revisa tu correo para confirmar la cuenta y vuelve a intentarlo.');
  }
  return signUp.user.id;
}

const DUPLICATE_MESSAGES = {
  drivers_document_number_key: 'Ya existe un conductor con ese documento.',
  drivers_email_key: 'Ya existe un conductor con ese correo.',
  vehicles_plate_key: 'Esa placa ya está registrada por otro conductor.',
};

function friendlyError(error) {
  if (error.code === '23505') {
    const key = Object.keys(DUPLICATE_MESSAGES).find((name) => error.message.includes(name));
    return new Error(DUPLICATE_MESSAGES[key] || 'Alguno de los datos ya está registrado.');
  }
  if (error.message?.includes('User already registered')) {
    return new Error('Ese correo ya tiene una cuenta.');
  }
  return error;
}

async function saveDriver({ personal, password, vehicle, documents, requiresRevision }) {
  const userId = await getOrCreateUser(personal.email.trim().toLowerCase(), password);

  const [photoPath, vehiclePhotoPath, licensePath, soatPath, revisionPath] = await Promise.all([
    uploadPhoto(userId, 'perfil', personal.photo),
    uploadPhoto(userId, 'vehiculo', vehicle.photo),
    uploadPhoto(userId, 'licencia', documents.licensePhoto),
    uploadPhoto(userId, 'soat', documents.soatPhoto),
    requiresRevision ? uploadPhoto(userId, 'tecnomecanica', documents.revisionPhoto) : null,
  ]);

  const { error: driverError } = await supabase.from('drivers').upsert({
    id: userId,
    full_name: personal.name.trim(),
    document_number: personal.document,
    phone: personal.phone,
    birth_date: personal.birthDate,
    gender: personal.gender,
    email: personal.email.trim().toLowerCase(),
    language: personal.language,
    photo_path: photoPath,
    mercado_pago_email: documents.mercadoPagoEmail.toLowerCase(),
    terms_accepted_at: new Date().toISOString(),
  });
  if (driverError) throw driverError;

  const { error: vehicleError } = await supabase.from('vehicles').upsert({
    driver_id: userId,
    category: vehicle.category,
    plate: vehicle.plate,
    make: vehicle.make.trim(),
    model: vehicle.model.trim(),
    year: Number(vehicle.year),
    color: vehicle.color,
    capacity: Number(vehicle.capacity),
    photo_path: vehiclePhotoPath,
  });
  if (vehicleError) throw vehicleError;

  const { error: documentsError } = await supabase.from('driver_documents').upsert({
    driver_id: userId,
    license_number: documents.licenseNumber,
    license_photo_path: licensePath,
    license_expiry: documents.licenseExpiry,
    soat_photo_path: soatPath,
    soat_expiry: documents.soatExpiry,
    revision_photo_path: revisionPath,
    revision_expiry: requiresRevision ? documents.revisionExpiry : null,
  });
  if (documentsError) throw documentsError;

  return userId;
}

export async function registerDriver(form) {
  try {
    return await saveDriver(form);
  } catch (error) {
    throw friendlyError(error);
  }
}
