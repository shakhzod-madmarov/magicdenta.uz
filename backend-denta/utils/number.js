export const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const digitsToNum = (v, fallback = 0) => {
  const s = String(v ?? "").replace(/\D/g, "");
  if (!s) return fallback;
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
};
