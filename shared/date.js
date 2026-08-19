export const UZ_OFFSET_HOURS = 5;
export const UZ_OFFSET_MINUTES = UZ_OFFSET_HOURS * 60;
export const UZ_OFFSET_MS = UZ_OFFSET_MINUTES * 60 * 1000;

export const pad2 = (n) => String(n).padStart(2, "0");

const WEEKDAYS_UZ = [
  "Yakshanba",
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
];

const ymdRe = /^(\d{4})-(\d{2})-(\d{2})$/;
const dmyRe = /^(\d{2})-(\d{2})-(\d{4})$/;
const ymdHmRe = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/;
const dmyHmRe = /^(\d{2})-(\d{2})-(\d{4})[ T](\d{2}):(\d{2})/;
const hmRe = /^(\d{1,2}):(\d{2})/;

const groupThousands = (num) =>
  String(num).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const parseYMDParts = (value) => {
  const m = String(value || "").match(ymdRe);
  if (!m) return null;
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    yearStr: m[1],
    monthStr: m[2],
    dayStr: m[3],
  };
};

const parseDMYParts = (value) => {
  const m = String(value || "").match(dmyRe);
  if (!m) return null;
  return {
    year: Number(m[3]),
    month: Number(m[2]),
    day: Number(m[1]),
    yearStr: m[3],
    monthStr: m[2],
    dayStr: m[1],
  };
};

const parseHMParts = (value) => {
  const m = String(value || "")
    .trim()
    .match(hmRe);
  if (!m) return { hour: 0, minute: 0, hourStr: "00", minuteStr: "00" };
  return {
    hour: Number(m[1]),
    minute: Number(m[2]),
    hourStr: pad2(Number(m[1])),
    minuteStr: pad2(Number(m[2])),
  };
};

const isValidDateObj = (d) => d instanceof Date && !Number.isNaN(d.getTime());

const buildUtcDate = (year, month, day, hour = 0, minute = 0, second = 0) => {
  const d = new Date(Date.UTC(year, month - 1, day, hour, minute, second, 0));
  return isValidDateObj(d) ? d : null;
};

export const parseUzDateTimeToUtcDate = (dateStr, timeStr = "00:00") => {
  const p = parseYMDParts(dateStr) || parseDMYParts(dateStr);
  if (!p) return null;

  const hm = parseHMParts(timeStr);
  if (
    !Number.isFinite(hm.hour) ||
    !Number.isFinite(hm.minute) ||
    hm.hour < 0 ||
    hm.hour > 23 ||
    hm.minute < 0 ||
    hm.minute > 59
  ) {
    return null;
  }

  return buildUtcDate(
    p.year,
    p.month,
    p.day,
    hm.hour - UZ_OFFSET_HOURS,
    hm.minute,
    0,
  );
};

const parseFlexibleToInstant = (value) => {
  if (!value && value !== 0) return null;

  if (value instanceof Date) {
    return isValidDateObj(value) ? new Date(value.getTime()) : null;
  }

  if (typeof value === "number") {
    const d = new Date(value);
    return isValidDateObj(d) ? d : null;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  const hasExplicitTimezone = /[zZ]$/.test(raw) || /[+-]\d{2}:\d{2}$/.test(raw);

  if (hasExplicitTimezone) {
    const d = new Date(raw);
    return isValidDateObj(d) ? d : null;
  }

  let m = raw.match(ymdHmRe);
  if (m)
    return parseUzDateTimeToUtcDate(
      `${m[1]}-${m[2]}-${m[3]}`,
      `${m[4]}:${m[5]}`,
    );

  m = raw.match(dmyHmRe);
  if (m)
    return parseUzDateTimeToUtcDate(
      `${m[3]}-${m[2]}-${m[1]}`,
      `${m[4]}:${m[5]}`,
    );

  const d = new Date(raw);
  return isValidDateObj(d) ? d : null;
};

const getUzPartsFromInstant = (value = new Date()) => {
  const d = parseFlexibleToInstant(value);
  if (!d) return null;

  const shifted = new Date(d.getTime() + UZ_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
    weekday: shifted.getUTCDay(),
    yearStr: String(shifted.getUTCFullYear()),
    monthStr: pad2(shifted.getUTCMonth() + 1),
    dayStr: pad2(shifted.getUTCDate()),
    hourStr: pad2(shifted.getUTCHours()),
    minuteStr: pad2(shifted.getUTCMinutes()),
    secondStr: pad2(shifted.getUTCSeconds()),
  };
};

export const formatYMD = (value = new Date()) => {
  const p = getUzPartsFromInstant(value);
  return p ? `${p.yearStr}-${p.monthStr}-${p.dayStr}` : "";
};

export const formatHM = (value = new Date()) => {
  const p = getUzPartsFromInstant(value);
  return p ? `${p.hourStr}:${p.minuteStr}` : "";
};

export const isoToday = () => formatYMD(new Date());

export const buildNowSlot = () => ({
  slotDate: formatYMD(new Date()),
  slotTime: formatHM(new Date()),
});

export const diffMinutes = (future, now = new Date()) => {
  const a = parseFlexibleToInstant(future);
  const b = parseFlexibleToInstant(now);
  if (!a || !b) return null;
  return Math.round((a.getTime() - b.getTime()) / 60000);
};

export const addMinutes = (value, mins) => {
  const d = parseFlexibleToInstant(value);
  if (!d) return null;
  return new Date(d.getTime() + Number(mins || 0) * 60 * 1000);
};

export const addDays = (value, days) => {
  const d = parseFlexibleToInstant(value);
  if (!d) return null;
  return new Date(d.getTime() + Number(days || 0) * 24 * 60 * 60 * 1000);
};

export const dayToUtcMs = (dateStr, fallback = 0) => {
  const p = parseYMDParts(dateStr) || parseDMYParts(dateStr);
  if (!p) return Number(fallback || 0);
  return Date.UTC(p.year, p.month - 1, p.day, 0, 0, 0, 0);
};

export const addDaysYMD = (dateStr, days) => {
  const ms = dayToUtcMs(dateStr);
  if (!ms) return "";
  return formatYMD(new Date(ms + Number(days || 0) * 24 * 60 * 60 * 1000));
};

export const slotDateTimeToUtcMs = (slotDate, slotTime, fallback = 0) => {
  const d = parseUzDateTimeToUtcDate(slotDate, slotTime);
  return d ? d.getTime() : Number(fallback || 0);
};

export const nowUtc = () => new Date();

export const getUzNowParts = (value = new Date()) =>
  getUzPartsFromInstant(value);

export const getUzNow = () => {
  const p = getUzPartsFromInstant(new Date());
  if (!p) return new Date();
  return new Date(
    Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second, 0),
  );
};

export const formatUzDayKey = (value = new Date()) => formatYMD(value);
export const formatTashkentDayKey = formatUzDayKey;

export const formatDMY = (value) => {
  if (!value && value !== 0) return "—";

  const ymd = parseYMDParts(value);
  if (ymd) return `${ymd.dayStr}-${ymd.monthStr}-${ymd.yearStr}`;

  const dmy = parseDMYParts(value);
  if (dmy) return `${dmy.dayStr}-${dmy.monthStr}-${dmy.yearStr}`;

  const p = getUzPartsFromInstant(value);
  return p ? `${p.dayStr}-${p.monthStr}-${p.yearStr}` : "—";
};

export const formatUzDate = (value) => {
  const out = formatDMY(value);
  return out === "—" ? "" : out;
};

export const formatUzTime = (value) => {
  const hm = parseHMParts(value);
  if (
    typeof value === "string" &&
    hm.hourStr === "00" &&
    hm.minuteStr === "00" &&
    !hmRe.test(String(value).trim())
  ) {
    const p = getUzPartsFromInstant(value);
    return p ? `${p.hourStr}:${p.minuteStr}` : "";
  }
  return `${hm.hourStr}:${hm.minuteStr}`;
};

export const formatDateTimeDMY = (date, time) => {
  if (!date && date !== 0) return "—";

  if (time !== undefined && time !== null && String(time).trim() !== "") {
    const d = parseUzDateTimeToUtcDate(date, time);
    const p = getUzPartsFromInstant(d);
    return p
      ? `${p.dayStr}-${p.monthStr}-${p.yearStr} ${p.hourStr}:${p.minuteStr}`
      : "—";
  }

  const p = getUzPartsFromInstant(date);
  return p
    ? `${p.dayStr}-${p.monthStr}-${p.yearStr} ${p.hourStr}:${p.minuteStr}`
    : "—";
};

export const formatDateTimeISO = (value) => formatDateTimeDMY(value);

export const formatAnyDateTimeDMY = (value) => {
  const out = formatDateTimeDMY(value);
  return out === "—" ? "" : out;
};

export const formatWeekdayDMY = (value) => {
  if (!value && value !== 0) return "";

  const ymd = parseYMDParts(value);
  if (ymd) {
    const d = buildUtcDate(ymd.year, ymd.month, ymd.day, 0, 0, 0);
    return `${ymd.dayStr}-${ymd.monthStr}-${ymd.yearStr}, ${WEEKDAYS_UZ[d.getUTCDay()]}`;
  }

  const dmy = parseDMYParts(value);
  if (dmy) {
    const d = buildUtcDate(dmy.year, dmy.month, dmy.day, 0, 0, 0);
    return `${dmy.dayStr}-${dmy.monthStr}-${dmy.yearStr}, ${WEEKDAYS_UZ[d.getUTCDay()]}`;
  }

  const p = getUzPartsFromInstant(value);
  return p
    ? `${p.dayStr}-${p.monthStr}-${p.yearStr}, ${WEEKDAYS_UZ[p.weekday]}`
    : "";
};

export const formatTime24FromISO = (value) => {
  const p = getUzPartsFromInstant(value);
  return p ? `${p.hourStr}:${p.minuteStr}` : "—";
};

export const formatDMY_DOT_FromISO = (value) => formatDMY(value);

export const formatDateTimeDMY_DOT_FromISO = (value) =>
  formatDateTimeDMY(value);

export const formatDateTimeDMY_DOT_WithDot = (value) =>
  formatDateTimeDMY(value);

export const formatMoneyPlain = (value) => {
  const num = Number(value || 0);
  const sign = num < 0 ? "-" : "";
  const abs = Math.abs(Math.trunc(num));
  return `${sign}${groupThousands(abs)}`;
};

export const formatMoney = (value, suffix = "so‘m") => {
  return `${formatMoneyPlain(value)} ${suffix}`;
};

export const formatMoneyUzs = (value) => formatMoney(value, "so'm");

export const buildReminderMoments = ({ slotDate, slotTime }) => {
  const appointmentUtc = parseUzDateTimeToUtcDate(slotDate, slotTime);
  if (!appointmentUtc) return null;

  const sameDay0700Utc = parseUzDateTimeToUtcDate(slotDate, "07:00");
  if (!sameDay0700Utc) return null;

  const items = [
    {
      reminderType: "BEFORE_10_DAYS",
      scheduledFor: addDays(sameDay0700Utc, -10),
    },
    {
      reminderType: "BEFORE_7_DAYS",
      scheduledFor: addDays(sameDay0700Utc, -7),
    },
    {
      reminderType: "BEFORE_5_DAYS",
      scheduledFor: addDays(sameDay0700Utc, -5),
    },
    {
      reminderType: "BEFORE_3_DAYS",
      scheduledFor: addDays(sameDay0700Utc, -3),
    },
    {
      reminderType: "BEFORE_1_DAY",
      scheduledFor: addDays(sameDay0700Utc, -1),
    },
    {
      reminderType: "SAME_DAY_0700",
      scheduledFor: sameDay0700Utc,
    },
    {
      reminderType: "BEFORE_3_HOURS",
      scheduledFor: addMinutes(appointmentUtc, -180),
    },
  ];

  return items;
};

export const isWithinGraceWindow = (scheduledFor, now = new Date()) => {
  const graceMinutes = Number(
    (typeof process !== "undefined" &&
      process.env?.TELEGRAM_REMINDER_GRACE_MINUTES) ||
      15,
  );
  const when = parseFlexibleToInstant(scheduledFor);
  const current = parseFlexibleToInstant(now);
  if (!when || !current) return false;
  const diffMs = current.getTime() - when.getTime();
  return diffMs >= 0 && diffMs <= graceMinutes * 60 * 1000;
};

export const isFutureWithinReminderRange = ({ slotDate, slotTime }) => {
  const appointmentUtc = parseUzDateTimeToUtcDate(slotDate, slotTime);
  if (!appointmentUtc) return false;

  const now = new Date();
  const diffMs = appointmentUtc.getTime() - now.getTime();

  return diffMs >= -6 * 60 * 60 * 1000 && diffMs <= 11 * 24 * 60 * 60 * 1000;
};
