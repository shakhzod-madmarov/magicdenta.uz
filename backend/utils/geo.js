const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const getClinicCoordinates = () => {
  const latitude = toNum(process.env.CLINIC_LATITUDE);
  const longitude = toNum(process.env.CLINIC_LONGITUDE);

  if (latitude === null || longitude === null) {
    return null;
  }

  return { latitude, longitude };
};

export const haversineMeters = (a, b) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371000;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
};
