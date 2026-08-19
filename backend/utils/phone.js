export const normalizeDigits = (v = "") => v.toString().replace(/\D/g, "");

export const normalizePhone = (raw = "") => {
  let digits = normalizeDigits(raw);

  if (digits.length === 9) digits = "998" + digits;

  if (!(digits.length === 12 && digits.startsWith("998"))) return null;

  return "+" + digits;
};
