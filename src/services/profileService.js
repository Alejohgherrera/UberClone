import { supabase } from '../lib/supabase';

const BUCKET = 'driver-files';

export async function getDriverDetails(driverId) {
  const { data, error } = await supabase
    .from('drivers')
    .select(
      `full_name, phone, email, language, mercado_pago_email, photo_path,
       vehicles(category, plate, make, model, year, color, capacity, photo_path),
       driver_documents(license_number, license_expiry, license_photo_path,
         soat_expiry, soat_photo_path, revision_expiry, revision_photo_path)`
    )
    .eq('id', driverId)
    .single();

  if (error) throw error;
  return data;
}

export async function getPhotoUrls(paths) {
  const validPaths = paths.filter(Boolean);
  if (!validPaths.length) return {};

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(validPaths, 3600);
  if (error) throw error;

  const urls = {};
  data.forEach((item) => {
    if (item.signedUrl) urls[item.path] = item.signedUrl;
  });
  return urls;
}

export async function updateDriverProfile(driverId, changes) {
  const { error } = await supabase.from('drivers').update(changes).eq('id', driverId);
  if (error) throw error;
}
