/**
 * Utility for price/money inputs that display formatted like:
 *   100  →  "100"
 *   1000 →  "1 000"
 *   10000→  "10 000"
 *   150000→ "150 000"
 *
 * Usage:
 *   <input
 *     type="text"
 *     inputMode="numeric"
 *     value={displayMoney(rawValue)}
 *     onChange={(e) => setRawValue(parseMoney(e.target.value))}
 *   />
 *   // rawValue is always a plain number (e.g. 150000)
 *   // send rawValue to server, not displayMoney(rawValue)
 */

/**
 * Format a number for display: 150000 → "150 000"
 * Accepts number or string.
 */
export const displayMoney = (value) => {
  const n = String(value ?? "").replace(/\D/g, "");
  if (!n) return "";
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

/**
 * Parse a formatted string back to a plain numeric string: "150 000" → "150000"
 * Always returns a string of digits (or "" if empty).
 */
export const parseMoney = (value) => {
  return String(value ?? "").replace(/\D/g, "");
};

/**
 * onChange handler factory — call this in onChange to update a state
 * that stores a raw numeric string.
 *
 * Example:
 *   onChange={handleMoneyInput(setPrice)}
 */
export const handleMoneyInput = (setter) => (e) => {
  setter(parseMoney(e.target.value));
};
