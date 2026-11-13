const ORS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
 
export async function getRoute(from, to) {
  const response = await fetch(ORS_URL, {
    method: 'POST',
    headers: {
      Authorization: process.env.EXPO_PUBLIC_ORS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coordinates: [
        [from.lng, from.lat],
        [to.lng, to.lat],
      ],
    }),
  });
 
  if (!response.ok) {
    throw new Error('No se pudo calcular la ruta. Revisa la llave de OpenRouteService.');
  }
 
  const data = await response.json();
  const feature = data.features[0];
 
  return {
    coordinates: feature.geometry.coordinates.map(([lng, lat]) => ({
      latitude: lat,
      longitude: lng,
    })),
    distanceKm: feature.properties.summary.distance / 1000,
    durationMin: feature.properties.summary.duration / 60,
  };
}
 