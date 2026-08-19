/**
 * Shared date formatting utilities for MedInson Klinika.
 * All dates displayed as DD-MM-YYYY, HH:mm (24-hour, locale-independent).
 */

/**
 * Format an ISO date string or Date object to "DD-MM-YYYY, HH:mm".
 * Returns "-" for null/undefined/invalid input.
 */
export function formatDate(input) {
  if (!input) return "-";
  try {
    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) return String(input);
    const dd  = String(d.getDate()).padStart(2, "0");
    const mm  = String(d.getMonth() + 1).padStart(2, "0");
    const yy  = d.getFullYear();
    const hh  = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}-${mm}-${yy}, ${hh}:${min}`;
  } catch {
    return String(input);
  }
}

/**
 * Format an ISO date string or Date object to "DD-MM-YYYY" (date only).
 * Returns "-" for null/undefined/invalid input.
 */
export function formatDateShort(input) {
  if (!input) return "-";
  try {
    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) return String(input);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}-${mm}-${yy}`;
  } catch {
    return String(input);
  }
}

/**
 * Format an ISO date string to "HH:mm" time only (24-hour).
 */
export function formatTime(input) {
  if (!input) return "-";
  try {
    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) return String(input);
    const hh  = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${min}`;
  } catch {
    return String(input);
  }
}

/**
 * Returns today's date as "DD-MM-YYYY".
 */
export function todayFormatted() {
  return formatDateShort(new Date());
}
