const getLocalDesktopConfig = () => ({
  clinicName: process.env.CLINIC_NAME || "Magic Denta",
  clinicAddress: process.env.CLINIC_ADDRESS || "",
  clinicMapUrl: process.env.CLINIC_MAP_URL || "",
  clinicWebsiteUrl: process.env.CLINIC_WEBSITE_URL || process.env.FRONTEND_BASE_URL || "https://magicdenta.uz",
  clinicPhone: ""
});
import {
  addDaysYMD,
  buildNowSlot,
  parseUzDateTimeToUtcDate,
  slotDateTimeToUtcMs,
  formatUzDate,
  formatUzTime,
  formatMoneyUzs,
} from "../../shared/date.js";

const localTelegramConfig = () => getLocalDesktopConfig();
const normalizeTelegramLanguage1132 = (value = "uz") => {
  const clean = String(value || "uz").slice(0, 2).toLowerCase();
  return ["uz", "ru", "en", "tg"].includes(clean) ? clean : "uz";
};
const telegramLang = (...sources) => {
  // 1. Try active config language setting first (clinic language)
  const config = localTelegramConfig();
  const activeLang = config.appLanguage || config.telegramLanguage || process.env.TELEGRAM_LANGUAGE;
  if (activeLang) return normalizeTelegramLanguage1132(activeLang);

  // 2. Fall back to standard fields on sources if config is not available
  for (const source of sources) {
    if (!source) continue;
    if (typeof source === "string") return normalizeTelegramLanguage1132(source);
    const value = source.telegramLanguage || source.language || source.locale;
    if (value) return normalizeTelegramLanguage1132(value);
  }

  return "uz";
};
const clinicName = () => process.env.CLINIC_NAME || localTelegramConfig().clinicName || "MedInson";
const clinicAddress = () =>
  process.env.CLINIC_ADDRESS || localTelegramConfig().clinicAddress || "";
const clinicPhone = (dentist) =>
  process.env.CLINIC_PHONE ||
  localTelegramConfig().clinicPhone ||
  dentist?.phone ||
  "";
const clinicMapUrl = () => {
  const url = process.env.CLINIC_MAP_URL || localTelegramConfig().clinicMapUrl || "";
  if (!url || url === "https://yandex.uz/maps/-/CPgPeI7q") return "";
  return url;
};
const clinicWebsiteUrl = () =>
  process.env.CLINIC_WEBSITE_URL ||
  process.env.TELEGRAM_FRONTEND_URL ||
  localTelegramConfig().clinicWebsiteUrl ||
  "";

const GENERIC_DENTIST_NAMES = new Set([
  "stomatolog",
  "стоматолог",
  "dentist",
  "doctor",
  "shifokor",
]);

const cleanDentistName = (value = "") => String(value || "").replace(/\bShakhzod\b/gi, "Shaxzod").replace(/\s+/g, " ").trim();

const isGenericDentistName = (value = "") => {
  const clean = cleanDentistName(value).toLowerCase();
  return !clean || GENERIC_DENTIST_NAMES.has(clean);
};

export const formatDentistDisplayName = (dentistOrName = {}) => {
  const config = localTelegramConfig();
  const localName = cleanDentistName(process.env.DENTIST_NAME || process.env.SINGLE_DENTIST_NAME || config.dentistName || "");
  const candidates = typeof dentistOrName === "string"
    ? [dentistOrName, localName]
    : [
        dentistOrName?.dentistName,
        dentistOrName?.doctorName,
        dentistOrName?.doctorFullName,
        dentistOrName?.name,
        localName,
      ];

  for (const candidate of candidates) {
    const clean = cleanDentistName(candidate);
    if (clean && !isGenericDentistName(clean)) return clean;
  }

  return localName && !isGenericDentistName(localName) ? localName : "";
};

const isPublicHttpUrl = (value) => {
  try {
    const url = new URL(String(value || "").trim());

    if (!["http:", "https:"].includes(url.protocol)) return false;

    const host = String(url.hostname || "").toLowerCase();
    const isLocalHost =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.endsWith(".local");

    if (isLocalHost) return false;

    return true;
  } catch {
    return false;
  }
};

const getTelegramFrontendBaseUrl = () =>
  String(
    process.env.CLINIC_WEBSITE_URL ||
      process.env.TELEGRAM_FRONTEND_URL ||
      process.env.FRONTEND_BASE_URL ||
      localTelegramConfig().clinicWebsiteUrl ||
      "",
  ).replace(/\/+$/, "");

export const getPublicTelegramFrontendBaseUrl = () => {
  const frontendBaseUrl = getTelegramFrontendBaseUrl();
  return isPublicHttpUrl(frontendBaseUrl) ? frontendBaseUrl : "";
};

const websiteButtonText = (lang = telegramLang()) => {
  const map = { uz: "🌐 Veb-saytga o‘tish", ru: "🌐 Перейти на сайт", en: "🌐 Open website" };
  return map[normalizeTelegramLanguage1132(lang)] || map.uz;
};

export const buildWebsiteLoginButton = (lang = telegramLang()) => {
  const url = getPublicTelegramFrontendBaseUrl();
  if (!url) return null;
  return { inline_keyboard: [[{ text: websiteButtonText(lang), url }]] };
};

const buildFrontendUrl = (path = "/", query = {}) => {
  const frontendBaseUrl = getPublicTelegramFrontendBaseUrl();
  if (!frontendBaseUrl) return "";
  try {
    const url = new URL(path, frontendBaseUrl + "/");
    Object.entries(query || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
    return url.toString();
  } catch { return ""; }
};

export const buildTelegramProfileConnectButtons = (lang = telegramLang()) => buildWebsiteLoginButton(lang);

const GUEST_WELCOME_TEXT_1139 = {
  uz: { hello: "Assalomu alaykum! 👋", welcome: "Telegram botiga xush kelibsiz.", connect: "Bemor kartangizni ulash uchun klinika xodimidan MedInson dasturidagi QR kodni ko‘rsatishini so‘rang. QR kodni skaner qiling va Telegramda <b>Start</b> tugmasini bosing.", after: "Ulangandan keyin qabul yakuni, to‘lov ma’lumoti, chaqirish xabari va keyingi qabul eslatmalarini shu bot orqali olasiz." },
  ru: { hello: "Здравствуйте! 👋", welcome: "Добро пожаловать в Telegram-бот.", connect: "Чтобы привязать карту пациента, попросите сотрудника клиники показать QR-код в MedInson. Отсканируйте QR-код и нажмите <b>Start</b> в Telegram.", after: "После привязки вы будете получать итоги приёма, оплату, вызов в кабинет и напоминания о следующем приёме." },
  en: { hello: "Hello! 👋", welcome: "Welcome to the Telegram bot.", connect: "To link your patient card, ask the clinic staff to show the QR code in MedInson. Scan it and press <b>Start</b> in Telegram.", after: "After linking, you will receive visit summaries, payment info, call messages, and next appointment reminders here." },
  tg: { hello: "Ассалому алейкум! 👋", welcome: "Ба боти Telegram хуш омадед.", connect: "Барои пайваст кардани корти бемор, аз корманди клиника хоҳиш кунед, ки рамзи QR-ро дар MedInson нишон диҳад. Рамзи QR-ро сканер кунед ва Start-ро дар Telegram пахш кунед.", after: "Пас аз пайвастшавӣ шумо натиҷаҳои қабул, пардохт, даъват ба ҳуҷра ва ёдраскуниҳои қабули навбатиро тавассути ин бот мегиред." },
};

export const buildTelegramGuestWelcomeMessage = (lang = telegramLang()) => {
  const t = GUEST_WELCOME_TEXT_1139[normalizeTelegramLanguage1132(lang)] || GUEST_WELCOME_TEXT_1139.uz;
  return t.hello + "\n\n" + "<b>" + escapeTelegramHtml(clinicName()) + "</b> " + t.welcome + "\n\n" + t.connect + "\n\n" + t.after;
};

export const buildWebsiteHomeButton = (lang = telegramLang()) => buildWebsiteLoginButton(lang);
export const buildAppointmentsButton = (lang = telegramLang()) => buildWebsiteLoginButton(lang);

const REMINDER_TEXT = {
  uz: {
    patient: "Bemor", hello: (name) => `Assalomu alaykum, <b>${name}</b>!`, intro: "Sizga navbatdagi qabul haqida eslatma yubormoqdamiz.", clinic: "Klinika", dentist: "Shifokor", date: "Sana", time: "Vaqt", lastWork: "Oxirgi muolaja", lastWorkMissing: "Oldingi muolaja haqida ma'lumot yo'q", nextStep: "Keyingi reja", nextStepMissing: "Shifokor ko'rigiga asosan keyingi muolaja belgilanadi", notes: "Eslatmalar", debt: "Qarzdorlik", noDebt: "mavjud emas", address: "Manzil", map: "Xaritada ochish", website: "Veb-sayt", please: "Iltimos, belgilangan vaqtda tashrif buyuring.", regards: "Hurmat bilan",
    debtWarning: (debt) => `⚠️ Eslatma: Sizda qolgan qarz ${debt} mavjud.`,
  },
  ru: {
    patient: "Пациент", hello: (name) => `Здравствуйте, <b>${name}</b>!`, intro: "Напоминаем вам о следующем приёме.", clinic: "Клиника", dentist: "Врач", date: "Дата", time: "Время", lastWork: "Последняя процедура", lastWorkMissing: "Информация о предыдущей процедуре не указана", nextStep: "Следующий план", nextStepMissing: "Следующий этап определит врач после осмотра", notes: "Заметки", debt: "Долг", noDebt: "нет", address: "Адрес", map: "Открыть карту", website: "Сайт", please: "Пожалуйста, приходите в назначенное время.", regards: "С уважением",
    debtWarning: (debt) => `⚠️ Напоминание: У вас есть оставшийся долг ${debt}.`,
  },
  en: {
    patient: "Patient", hello: (name) => `Hello, <b>${name}</b>!`, intro: "This is a reminder about your next appointment.", clinic: "Clinic", dentist: "Doctor", date: "Date", time: "Time", lastWork: "Last procedure", lastWorkMissing: "No previous procedure details", nextStep: "Next plan", nextStepMissing: "The doctor will define the next step after examination", notes: "Notes", debt: "Debt", noDebt: "none", address: "Address", map: "Open map", website: "Website", please: "Please arrive at the scheduled time.", regards: "Regards",
    debtWarning: (debt) => `⚠️ Reminder: You have a remaining debt of ${debt}.`,
  },
  tg: {
    patient: "Бемор", hello: (name) => `Ассалому алейкум, <b>${name}</b>!`, intro: "Мо ба шумо қабули навбатиро ёдрас мекунем.", clinic: "Клиника", dentist: "Духтур", date: "Сана", time: "Вақт", lastWork: "Муолиҷаи охирин", lastWorkMissing: "Маълумот дар бораи муолиҷаи охирин мавҷуд нест", nextStep: "Нақшаи навбатӣ", nextStepMissing: "Муолиҷаи навбатиро духтур пас аз муоина муайян мекунад", notes: "Ёддоштҳо", debt: "Қарздорӣ", noDebt: "мавҷуд нест", address: "Суроға", map: "Кушодани харита", website: "Веб-сайт", please: "Лутфан, дар вақти муайяншуда ташриф оред.", regards: "Бо эҳтиром",
    debtWarning: (debt) => `⚠️ Ёдраскунӣ: Шумо қарзи боқимонда ба маблағи ${debt} доред.`,
  },
};

const reminderLang = (...sources) => telegramLang(...sources);

export const buildScheduledReminderMessage = ({
  patient,
  dentist,
  appointment,
  treatment,
  reminderType = "",
}) => {
  const lang = reminderLang(patient, dentist, appointment, treatment);
  const t = REMINDER_TEXT[lang] || REMINDER_TEXT.uz;
  const procedures =
    String(treatment?.procedures || appointment?.treatment || "").trim() ||
    t.lastWorkMissing;

  const nextStep =
    String(treatment?.nextStep || "").trim() ||
    t.nextStepMissing;

  const notes = String(treatment?.notes || appointment?.notes || "").trim();

  const debt = Math.max(
    0,
    Number(
      treatment
        ? Number(treatment.amount || 0) - Number(treatment.paidAmount || 0)
        : appointment?.financial?.debt || 0,
    ),
  );

  const dentistDisplayName = formatDentistDisplayName(dentist);
  const safePatientName = escapeTelegramHtml(patient?.name || t.patient);
  const debtNoticeText = debt > 0 ? `\n${t.debtWarning(formatMoneyUzs(debt))}\n` : "";

  let stageIntro = t.intro;
  if (reminderType === "BEFORE_10_DAYS") {
    stageIntro = lang === "ru" ? "🗓 <b>До вашего приёма осталось 10 дней.</b> Напоминаем о предстоящем осмотре." : "🗓 <b>Qabulingizga 10 kun qoldi.</b> Sizga navbatdagi ko‘rik haqida eslatma yubormoqdamiz.";
  } else if (reminderType === "BEFORE_7_DAYS") {
    stageIntro = lang === "ru" ? "🗓 <b>До вашего приёма осталось 7 дней.</b> Напоминаем о предстоящем осмотре." : "🗓 <b>Qabulingizga 7 kun qoldi.</b> Sizga navbatdagi ko‘rik haqida eslatma yubormoqdamiz.";
  } else if (reminderType === "BEFORE_5_DAYS") {
    stageIntro = lang === "ru" ? "🗓 <b>До вашего приёма осталось 5 дней.</b> Напоминаем о предстоящем осмотре." : "🗓 <b>Qabulingizga 5 kun qoldi.</b> Sizga navbatdagi ko‘rik haqida eslatma yubormoqdamiz.";
  } else if (reminderType === "BEFORE_3_DAYS") {
    stageIntro = lang === "ru" ? "🗓 <b>До вашего приёма осталось 3 дня.</b> Пожалуйста, согласуйте ваши планы." : "🗓 <b>Qabulingizga 3 kun qoldi.</b> Iltimos, rejalaringizni muvofiqlashtiring.";
  } else if (reminderType === "BEFORE_1_DAY") {
    stageIntro = lang === "ru" ? "⏰ <b>Завтра ваш приём!</b> Пожалуйста, приходите вовремя." : "⏰ <b>Ertaga sizning qabulingiz bor!</b> Iltimos, o‘z vaqtida tashrif buyuring.";
  } else if (reminderType === "SAME_DAY_0700") {
    stageIntro = lang === "ru" ? "🔔 <b>Сегодня ваш приём!</b> Ждём вас в нашей клинике." : "🔔 <b>Bugun sizning qabulingiz bor!</b> Sizni klinikamizda kutamiz.";
  } else if (reminderType === "BEFORE_3_HOURS") {
    stageIntro = lang === "ru" ? "⚡️ <b>До приёма осталось 3 часа!</b> Пожалуйста, подготовьтесь к визиту." : "⚡️ <b>Qabulingizga 3 soat qoldi!</b> Iltimos, yo‘lga chiqishga hozirlik ko‘ring.";
  }

  return (
    t.hello(safePatientName) + "\n\n" +
    `${stageIntro}\n\n` +
    `🏥 <b>${t.clinic}:</b> ${escapeTelegramHtml(clinicName())}\n` +
    (dentistDisplayName ? `👨‍⚕️ <b>${t.dentist}:</b> ${escapeTelegramHtml(dentistDisplayName)}\n` : "") +
    `📅 <b>${t.date}:</b> ${formatUzDate(appointment?.slotDate)}\n` +
    `⏰ <b>${t.time}:</b> ${formatUzTime(appointment?.slotTime)}\n\n` +
    `🦷 <b>${t.lastWork}:</b> ${escapeTelegramHtml(procedures)}\n` +
    `➡️ <b>${t.nextStep}:</b> ${escapeTelegramHtml(nextStep)}\n` +
    (notes ? `📝 <b>${t.notes}:</b> ${escapeTelegramHtml(notes)}\n` : "") +
    `💰 <b>${t.debt}:</b> ${debt > 0 ? formatMoneyUzs(debt) : t.noDebt}\n\n` +
    debtNoticeText +
    (clinicAddress() ? `📍 <b>${t.address}:</b>\n${escapeTelegramHtml(clinicName())}\n${escapeTelegramHtml(clinicAddress())}\n` : "") +
    (clinicAddress() && clinicMapUrl() ? `🗺 <a href="${escapeTelegramHtml(clinicMapUrl())}">${t.map}</a>\n` : "") +
    (clinicWebsiteUrl() ? `🌐 <a href="${escapeTelegramHtml(clinicWebsiteUrl())}">${t.website || "Website"}</a>\n` : "") +
    `\n` +
    `${t.please}\n\n${t.regards},\n${escapeTelegramHtml(dentistDisplayName || clinicName())}`
  );
};

const escapeTelegramPatientHtml = (value = "") =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const normalizePatientSummaryText = (value = "") =>
  String(value ?? "").replace(/\s+/g, " ").trim();

const splitPatientSummaryItems = (value = "") => {
  const raw = String(value ?? "").trim();
  if (!raw) return [];

  const normalized = raw
    .replace(/\r/g, "\n")
    .split(/\n+|;|•|\u2022/g)
    .map((item) => item.replace(/^[-–—\s]+/, "").trim())
    .filter(Boolean);

  if (normalized.length > 1) return normalized;
  return [normalizePatientSummaryText(raw)];
};

const patientSummaryBlock = (icon, label, value) => {
  const items = splitPatientSummaryItems(value);
  if (!items.length) return "";

  if (items.length === 1 && items[0].length <= 65) {
    return icon + " <b>" + escapeTelegramPatientHtml(label) + ":</b> " + escapeTelegramPatientHtml(items[0]) + "\n";
  }

  return (
    icon + " <b>" + escapeTelegramPatientHtml(label) + ":</b>\n" +
    items.map((item) => "• " + escapeTelegramPatientHtml(item)).join("\n") +
    "\n"
  );
};

const T_PATIENT = {
  uz: {
    patientFallback: "Bemor", greeting: (name) => `Assalomu alaykum, <b>${name}</b>!`, finished: "Bugungi qabulingiz yakunlandi. Tashrifingiz uchun raxmat.", clinic: "Klinika", dentist: "Shifokor", appointmentDate: "Qabul sanasi", appointmentTime: "Qabul vaqti", visitInfo: "Qabul bo‘yicha ma’lumot", diagnosis: "Diagnos", teeth: "Tishlar", procedures: "Bajarilgan muolajalar", medicines: "Dori-darmonlar", nextStep: "Keyingi tavsiya", noClinicalInfo: "Ma’lumot kiritilmagan.", paymentInfo: "To‘lov ma’lumoti", total: "Umumiy summa", paidNow: "Hozir qabul qilingan to‘lov", totalPaid: "Jami to‘langan", debt: "Qolgan qarz", noDebt: "mavjud emas", status: "Holat", paidStatus: "To‘liq to‘langan", partialStatus: "Qisman to‘langan", unpaidStatus: "To‘lanmagan", debtStatus: "Qarz mavjud", nextAppointment: "Keyingi qabul", nextAppointmentNone: "hozircha belgilanmagan", address: "Manzil", map: "Xaritada ochish", beHealthy: "Tashrifingiz uchun raxmat!", regards: "Hurmat bilan",
    notes: "Eslatmalar", debtWarning: (debt) => `⚠️ Eslatma: Sizda qolgan qarz ${debt} mavjud.`,
  },
  ru: {
    patientFallback: "Пациент", greeting: (name) => `Здравствуйте, <b>${name}</b>!`, finished: "Ваш приём завершён. Спасибо за визит.", clinic: "Клиника", dentist: "Врач", appointmentDate: "Дата приёма", appointmentTime: "Время приёма", visitInfo: "Информация по приёму", diagnosis: "Диагноз", teeth: "Зубы", procedures: "Выполненные процедуры", medicines: "Лекарства", nextStep: "Следующая рекомендация", noClinicalInfo: "Информация не указана.", paymentInfo: "Информация об оплате", total: "Общая сумма", paidNow: "Принятая сейчас оплата", totalPaid: "Всего оплачено", debt: "Остаток долга", noDebt: "нет", status: "Статус", paidStatus: "Полностью оплачено", partialStatus: "Частично оплачено", unpaidStatus: "Не оплачено", debtStatus: "Есть долг", nextAppointment: "Следующий приём", nextAppointmentNone: "пока не назначен", address: "Адрес", map: "Открыть карту", beHealthy: "Спасибо за визит!", regards: "С уважением",
    notes: "Заметки", debtWarning: (debt) => `⚠️ Напоминание: У вас есть оставшийся долг ${debt}.`,
  },
  en: {
    patientFallback: "Patient", greeting: (name) => `Hello, <b>${name}</b>!`, finished: "Your visit is complete. Thank you for coming.", clinic: "Clinic", dentist: "Doctor", appointmentDate: "Appointment date", appointmentTime: "Appointment time", visitInfo: "Visit information", diagnosis: "Diagnosis", teeth: "Teeth", procedures: "Completed procedures", medicines: "Medicines", nextStep: "Next recommendation", noClinicalInfo: "No details entered.", paymentInfo: "Payment information", total: "Total amount", paidNow: "Payment received now", totalPaid: "Total paid", debt: "Remaining debt", noDebt: "none", status: "Status", paidStatus: "Paid in full", partialStatus: "Partially paid", unpaidStatus: "Unpaid", debtStatus: "Debt remains", nextAppointment: "Next appointment", nextAppointmentNone: "not scheduled yet", address: "Address", map: "Open map", beHealthy: "Thank you for your visit!", regards: "Regards",
    notes: "Notes", debtWarning: (debt) => `⚠️ Reminder: You have a remaining debt of ${debt}.`,
  },
  tg: {
    patientFallback: "Бемор", greeting: (name) => `Ассалому алейкум, <b>${name}</b>!`, finished: "Қабули имрӯзаи шумо анҷом ёфт. Ташаккур барои ташрифатон.", clinic: "Клиника", dentist: "Духтур", appointmentDate: "Санаи қабул", appointmentTime: "Вақти қабул", visitInfo: "Маълумоти қабул", diagnosis: "Ташхис", teeth: "Дандонҳо", procedures: "Муолиҷаҳои иҷрошуда", medicines: "Доруворӣ", nextStep: "Тавсияи навбатӣ", noClinicalInfo: "Маълумот ворид карда нашудааст.", paymentInfo: "Маълумоти пардохт", total: "Маблағи умумӣ", paidNow: "Пардохти қабулшуда", totalPaid: "Ҷамъи пардохтшуда", debt: "Қарзи боқимонда", noDebt: "мавҷуд нест", status: "Ҳолат", paidStatus: "Пурра пардохтшуда", partialStatus: "Қисман пардохтшуда", unpaidStatus: "Пардохтнашуда", debtStatus: "Қарздорӣ мавҷуд аст", nextAppointment: "Қабули навбатӣ", nextAppointmentNone: "ҳоло муайян нашудааст", address: "Суроға", map: "Кушодани харита", beHealthy: "Ташаккур барои ташрифатон!", regards: "Бо эҳтиром",
    notes: "Ёддоштҳо", debtWarning: (debt) => `⚠️ Ёдраскунӣ: Шумо қарзи боқимонда ба маблағи ${debt} доред.`,
  },
};

const patientT = (lang = "") => T_PATIENT[normalizeTelegramLanguage1132(lang || telegramLang())] || T_PATIENT.uz;
const htmlValue = (value = "", fallback = "") => {
  const t = patientT();
  const clean = normalizePatientSummaryText(value);
  return escapeTelegramPatientHtml(clean || fallback || t.patientFallback);
};
const patientSummaryLine = (icon, label, value) => {
  const clean = normalizePatientSummaryText(value);
  if (!clean) return "";
  return icon + " <b>" + escapeTelegramPatientHtml(label) + ":</b> " + escapeTelegramPatientHtml(clean) + "\n";
};
const patientPaymentStatusLabel = (status = "", debt = 0, tOverride = null) => {
  const t = tOverride || patientT();
  const clean = String(status || "").toUpperCase();
  if (clean === "PAID" || debt <= 0) return t.paidStatus;
  if (clean === "PARTIAL") return t.partialStatus;
  if (clean === "UNPAID") return t.unpaidStatus;
  return debt > 0 ? t.debtStatus : t.paidStatus;
};
const patientNextAppointmentLine = ({ nextAppointment, treatment }) => {
  const t = patientT();
  if (nextAppointment?.slotDate || nextAppointment?.slotTime) return `📅 <b>${t.nextAppointment}:</b> ${formatUzDate(nextAppointment?.slotDate)}${nextAppointment?.slotTime ? ", " + formatUzTime(nextAppointment.slotTime) : ""}\n`;
  if (treatment?.nextVisitDate || treatment?.nextVisitTime) return `📅 <b>${t.nextAppointment}:</b> ${formatUzDate(treatment?.nextVisitDate)}${treatment?.nextVisitTime ? ", " + formatUzTime(treatment.nextVisitTime) : ""}\n`;
  return `📅 <b>${t.nextAppointment}:</b> ${t.nextAppointmentNone}\n`;
};

export const buildPatientVisitSummaryMessage = ({ patient, dentist, appointment, treatment, payment, nextAppointment }) => {
  const lang = telegramLang(treatment, appointment, patient, dentist);
  const t = patientT(lang);
  const totalAmount = Math.max(0, Number(treatment?.amount || appointment?.financial?.amount || 0));
  const totalPaid = Math.max(0, Number(treatment?.paidAmount || appointment?.financial?.paidAmount || 0));
  const paidNow = Math.max(0, Number(payment?.amount || 0));
  const debt = Math.max(0, totalAmount - totalPaid);
  const dentistDisplayName = formatDentistDisplayName(dentist || treatment?.dentistSnapshot || appointment?.dentistSnapshot || "");
  const patientName = htmlValue(patient?.name, t.patientFallback);
  const clinicalLines =
    patientSummaryLine("🩺", t.diagnosis, treatment?.diagnosis || appointment?.diagnosis) +
    patientSummaryLine("🦷", t.teeth, treatment?.teeth) +
    patientSummaryBlock("✅", t.procedures, treatment?.procedures || appointment?.treatment) +
    patientSummaryBlock("💊", t.medicines, treatment?.medicines) +
    patientSummaryBlock("📝", t.notes, treatment?.notes || appointment?.notes) +
    patientSummaryBlock("➡️", t.nextStep, treatment?.nextStep);
  const debtNoticeText = debt > 0 ? `\n${t.debtWarning(formatMoneyUzs(debt))}\n` : "";
  const paymentLines =
    `💵 <b>${t.total}:</b> ${formatMoneyUzs(totalAmount)}\n` +
    (paidNow > 0 ? `✅ <b>${t.paidNow}:</b> ${formatMoneyUzs(paidNow)}\n` : "") +
    `📌 <b>${t.totalPaid}:</b> ${formatMoneyUzs(totalPaid)}\n` +
    `💰 <b>${t.debt}:</b> ${debt > 0 ? formatMoneyUzs(debt) : t.noDebt}\n` +
    `📋 <b>${t.status}:</b> ${patientPaymentStatusLabel(treatment?.paymentStatus || appointment?.financial?.paymentStatus, debt, t)}\n` +
    debtNoticeText;
  const dateLines =
    (appointment?.slotDate ? `📅 <b>${t.appointmentDate}:</b> ${formatUzDate(appointment.slotDate)}\n` : "") +
    (appointment?.slotTime ? `⏰ <b>${t.appointmentTime}:</b> ${formatUzTime(appointment.slotTime)}\n` : "");
  return (
    t.greeting(patientName) + "\n\n" +
    `${t.finished}\n\n` +
    `🏥 <b>${t.clinic}:</b> ${escapeTelegramPatientHtml(clinicName())}\n` +
    (dentistDisplayName ? `👨‍⚕️ <b>${t.dentist}:</b> ${escapeTelegramPatientHtml(dentistDisplayName)}\n` : "") +
    dateLines +
    `\n🦷 <b>${t.visitInfo}</b>\n` +
    (clinicalLines || `${t.noClinicalInfo}\n`) +
    `\n💳 <b>${t.paymentInfo}</b>\n` +
    paymentLines +
    "\n" + patientNextAppointmentLine({ nextAppointment, treatment }) +
    (clinicAddress() ? `\n📍 <b>${t.address}:</b>\n${escapeTelegramPatientHtml(clinicName())}\n${escapeTelegramPatientHtml(clinicAddress())}\n` : "") +
    (clinicAddress() && clinicMapUrl() ? `🗺 <a href="${escapeTelegramPatientHtml(clinicMapUrl())}">${t.map}</a>\n\n` : "\n") +
    `${t.beHealthy}\n\n${t.regards},\n${escapeTelegramPatientHtml(dentistDisplayName || clinicName())}`
  );
};

export const buildPaymentThankYouMessage = (payload) => buildPatientVisitSummaryMessage(payload);

const DEBT_PAYMENT_T_1134 = {
  uz: {
    title: "Qarz bo'yicha qo'shimcha to'lov qabul qilindi",
    intro: "Avvalgi qabul qarzi bo'yicha to'lovingiz qayd qilindi.",
    appointment: "Qabul",
    paidNow: "Qo'shimcha to'lov",
    total: "Qabul summasi",
    totalPaid: "Jami to'langan",
    debt: "Qolgan qarz",
    noDebt: "mavjud emas",
    status: "Holat",
    noClinical: "Bu xabar faqat qarz to'lovi haqida. Qabul xulosasi qayta yuborilmadi.",
  },
  ru: {
    title: "Принята дополнительная оплата по долгу",
    intro: "Ваш платёж по долгу за прошлый приём сохранён.",
    appointment: "Приём",
    paidNow: "Дополнительная оплата",
    total: "Сумма приёма",
    totalPaid: "Всего оплачено",
    debt: "Остаток долга",
    noDebt: "нет",
    status: "Статус",
    noClinical: "Это сообщение только об оплате долга. Итог приёма повторно не отправлен.",
  },
  en: {
    title: "Additional debt payment received",
    intro: "Your payment toward a previous appointment debt has been recorded.",
    appointment: "Appointment",
    paidNow: "Additional payment",
    total: "Appointment total",
    totalPaid: "Total paid",
    debt: "Remaining debt",
    noDebt: "none",
    status: "Status",
    noClinical: "This message is only about the debt payment. The visit summary was not resent.",
  },
  tg: {
    title: "Пардохти иловагӣ барои қарз қабул шуд",
    intro: "Пардохти шумо барои қарзи қабули қаблӣ ба қайд гирифта шуд.",
    appointment: "Қабул",
    paidNow: "Пардохти иловагӣ",
    total: "Маблағи қабул",
    totalPaid: "Ҷамъи пардохтшуда",
    debt: "Қарзи боқимонда",
    noDebt: "мавҷуд нест",
    status: "Ҳолат",
    noClinical: "Ин паём танҳо дар бораи пардохти қарз аст. Хулосаи қабул дубора фиристода нашуд.",
  },
};

export const buildPatientDebtPaymentMessage = ({ patient, dentist, appointment, treatment, payment }) => {
  const lang = telegramLang(treatment, appointment, patient, dentist);
  const baseT = patientT(lang);
  const t = DEBT_PAYMENT_T_1134[lang] || DEBT_PAYMENT_T_1134.uz;
  const patientName = htmlValue(patient?.name, baseT.patientFallback);
  const dentistDisplayName = formatDentistDisplayName(dentist);
  const paidNow = Math.max(0, Number(payment?.amount || 0));
  const totalAmount = Math.max(0, Number(treatment?.amount || appointment?.financial?.amount || 0));
  const totalPaid = Math.max(0, Number(treatment?.paidAmount || appointment?.financial?.paidAmount || 0));
  const debt = Math.max(0, totalAmount - totalPaid);
  const status = patientPaymentStatusLabel(treatment?.paymentStatus || appointment?.financial?.paymentStatus, debt, baseT);
  const appointmentLine =
    appointment?.slotDate || appointment?.slotTime
      ? `🗓 <b>${escapeTelegramPatientHtml(t.appointment)}:</b> ${escapeTelegramPatientHtml([appointment?.slotDate ? formatUzDate(appointment.slotDate) : "", appointment?.slotTime ? formatUzTime(appointment.slotTime) : ""].filter(Boolean).join(" "))}\n`
      : "";

  return (
    baseT.greeting(patientName) + "\n\n" +
    `✅ <b>${escapeTelegramPatientHtml(t.title)}</b>\n` +
    `${escapeTelegramPatientHtml(t.intro)}\n\n` +
    `🏥 <b>${escapeTelegramPatientHtml(baseT.clinic)}:</b> ${escapeTelegramPatientHtml(clinicName())}\n` +
    (dentistDisplayName ? `👨‍⚕️ <b>${escapeTelegramPatientHtml(baseT.dentist)}:</b> ${escapeTelegramPatientHtml(dentistDisplayName)}\n` : "") +
    appointmentLine +
    `\n💳 <b>${escapeTelegramPatientHtml(t.paidNow)}:</b> ${escapeTelegramPatientHtml(formatMoneyUzs(paidNow))}\n` +
    (totalAmount > 0 ? `💰 <b>${escapeTelegramPatientHtml(t.total)}:</b> ${escapeTelegramPatientHtml(formatMoneyUzs(totalAmount))}\n` : "") +
    `✅ <b>${escapeTelegramPatientHtml(t.totalPaid)}:</b> ${escapeTelegramPatientHtml(formatMoneyUzs(totalPaid))}\n` +
    `⚠️ <b>${escapeTelegramPatientHtml(t.debt)}:</b> ${debt > 0 ? escapeTelegramPatientHtml(formatMoneyUzs(debt)) : escapeTelegramPatientHtml(t.noDebt)}\n` +
    `📋 <b>${escapeTelegramPatientHtml(t.status)}:</b> ${escapeTelegramPatientHtml(status)}\n\n` +
    `<i>${escapeTelegramPatientHtml(t.noClinical)}</i>`
  );
};

export const buildPostPaymentNextAppointmentMessage = ({
  patient,
  dentist,
  nextAppointment,
  treatment,
}) => {
  const lang = telegramLang(treatment, nextAppointment, patient, dentist);
  const t = patientT(lang);
  const procedures = String(treatment?.procedures || "").trim() || t.noClinicalInfo;
  const nextStep = String(treatment?.nextStep || "").trim() || t.nextStepMissing || t.noClinicalInfo;
  const debt = Math.max(0, Number(treatment?.amount || 0) - Number(treatment?.paidAmount || 0));
  const dentistDisplayName = formatDentistDisplayName(dentist);
  const patientName = htmlValue(patient?.name, t.patientFallback);

  return (
    t.greeting(patientName) + "\n\n" +
    `📅 <b>${t.nextAppointment}:</b> ${formatUzDate(nextAppointment?.slotDate)}${nextAppointment?.slotTime ? ", " + formatUzTime(nextAppointment.slotTime) : ""}\n\n` +
    `🏥 <b>${t.clinic}:</b> ${escapeTelegramPatientHtml(clinicName())}\n` +
    (dentistDisplayName ? `👨‍⚕️ <b>${t.dentist}:</b> ${escapeTelegramPatientHtml(dentistDisplayName)}\n` : "") +
    `🦷 <b>${t.procedures}:</b> ${escapeTelegramPatientHtml(procedures)}\n` +
    `➡️ <b>${t.nextStep}:</b> ${escapeTelegramPatientHtml(nextStep)}\n` +
    `💰 <b>${t.debt}:</b> ${debt > 0 ? formatMoneyUzs(debt) : t.noDebt}\n\n` +
    (clinicAddress() ? `📍 <b>${t.address}:</b>\n${escapeTelegramPatientHtml(clinicName())}\n${escapeTelegramPatientHtml(clinicAddress())}\n` : "") +
    (clinicAddress() && clinicMapUrl() ? `🗺 <a href="${escapeTelegramPatientHtml(clinicMapUrl())}">${t.map}</a>\n\n` : "\n") +
    `${t.regards},\n${escapeTelegramPatientHtml(dentistDisplayName || clinicName())}`
  );
};

const ORTHO_FOLLOWUP_T = {
  uz: {
    hello: (name) => `Assalomu alaykum, <b>${name}</b>!`,
    patientFallback: "Bemor",
    thanks: "Bugungi tashrifingiz uchun raxmat.",
    visitType: "Tashrif turi",
    purposeFallback: "Ortodont nazorat",
    doctor: "Shifokor",
    nextCheck: "Keyingi ortodont nazorat",
    withinDays: (n) => `${n} kun ichida`,
    plannedDate: "Rejalashtirilgan sana",
    clinic: "Klinika",
    completionFooter: "Iltimos, nazorat sanasini unutib qo‘ymang. Sizga yana eslatma yuboramiz.",
    regards: "Hurmat bilan",
    interval: "Belgilangan interval",
    days: (n) => `${n} kun`,
    nextCheckDate: "Keyingi nazorat sanasi",
    openMap: "Xaritada ochish",
    pleaseCome: "Iltimos, belgilangan kunda ko‘rikka keling.",
    lead: {
      AFTER_10_SECONDS: "Nazorat qabulingiz tizimga saqlandi.",
      BEFORE_10_DAYS: "Keyingi ortodont nazoratingizga 10 kun qoldi.",
      BEFORE_7_DAYS: "Keyingi ortodont nazoratingizga 7 kun qoldi.",
      BEFORE_5_DAYS: "Keyingi ortodont nazoratingizga 5 kun qoldi.",
      BEFORE_3_DAYS: "Keyingi ortodont nazoratingizga 3 kun qoldi.",
      BEFORE_1_DAY: "Ertaga ortodont nazoratingiz bor.",
      SAME_DAY_0700: "Bugun ortodont nazorat kuningiz.",
      DEFAULT: "Ortodont nazorat eslatmasi.",
    },
  },
  ru: {
    hello: (name) => `Здравствуйте, <b>${name}</b>!`,
    patientFallback: "Пациент",
    thanks: "Спасибо за ваш сегодняшний визит.",
    visitType: "Тип визита",
    purposeFallback: "Ортодонтический контроль",
    doctor: "Врач",
    nextCheck: "Следующий ортодонтический контроль",
    withinDays: (n) => `в течение ${n} дн.`,
    plannedDate: "Запланированная дата",
    clinic: "Клиника",
    completionFooter: "Пожалуйста, не забудьте дату контроля. Мы отправим вам ещё одно напоминание.",
    regards: "С уважением",
    interval: "Установленный интервал",
    days: (n) => `${n} дн.`,
    nextCheckDate: "Дата следующего контроля",
    openMap: "Открыть на карте",
    pleaseCome: "Пожалуйста, приходите на приём в назначенный день.",
    lead: {
      AFTER_10_SECONDS: "Ваш контрольный приём сохранён в системе.",
      BEFORE_10_DAYS: "До следующего ортодонтического контроля осталось 10 дней.",
      BEFORE_7_DAYS: "До следующего ортодонтического контроля осталось 7 дней.",
      BEFORE_5_DAYS: "До следующего ортодонтического контроля осталось 5 дней.",
      BEFORE_3_DAYS: "До следующего ортодонтического контроля осталось 3 дня.",
      BEFORE_1_DAY: "Завтра у вас ортодонтический контроль.",
      SAME_DAY_0700: "Сегодня день вашего ортодонтического контроля.",
      DEFAULT: "Напоминание об ортодонтическом контроле.",
    },
  },
  en: {
    hello: (name) => `Hello, <b>${name}</b>!`,
    patientFallback: "Patient",
    thanks: "Thank you for your visit today.",
    visitType: "Visit type",
    purposeFallback: "Orthodontic check-up",
    doctor: "Doctor",
    nextCheck: "Next orthodontic check-up",
    withinDays: (n) => `within ${n} days`,
    plannedDate: "Planned date",
    clinic: "Clinic",
    completionFooter: "Please don't forget your check-up date. We'll send you another reminder.",
    regards: "Best regards",
    interval: "Set interval",
    days: (n) => `${n} days`,
    nextCheckDate: "Next check-up date",
    openMap: "Open in map",
    pleaseCome: "Please come for your appointment on the scheduled day.",
    lead: {
      AFTER_10_SECONDS: "Your check-up appointment has been saved in the system.",
      BEFORE_10_DAYS: "10 days left until your next orthodontic check-up.",
      BEFORE_7_DAYS: "7 days left until your next orthodontic check-up.",
      BEFORE_3_DAYS: "3 days left until your next orthodontic check-up.",
      BEFORE_1_DAY: "You have an orthodontic check-up tomorrow.",
      SAME_DAY_0700: "Today is your orthodontic check-up day.",
      DEFAULT: "Orthodontic check-up reminder.",
    },
  },
  tg: {
    hello: (name) => `Ассалому алейкум, <b>${name}</b>!`,
    patientFallback: "Бемор",
    thanks: "Ташаккур барои ташрифи имрӯзаатон.",
    visitType: "Намуди ташриф",
    purposeFallback: "Назорати ортодонтӣ",
    doctor: "Духтур",
    nextCheck: "Назорати ортодонтии навбатӣ",
    withinDays: (n) => `дар давоми ${n} рӯз`,
    plannedDate: "Санаи ба нақша гирифташуда",
    clinic: "Клиника",
    completionFooter: "Лутфан, санаи назоратро фаромӯш накунед. Мо ба шумо боз ёдраскунӣ мефиристем.",
    regards: "Бо эҳтиром",
    interval: "Интервали муайяншуда",
    days: (n) => `${n} рӯз`,
    nextCheckDate: "Санаи назорати навбатӣ",
    openMap: "Кушодани харита",
    pleaseCome: "Лутфан, дар рӯзи муайяншуда ба муоина биёед.",
    lead: {
      AFTER_10_SECONDS: "Қабули назоратии шумо дар система захира шуд.",
      BEFORE_10_DAYS: "То назорати ортодонтии навбатии шумо 10 рӯз боқӣ монд.",
      BEFORE_7_DAYS: "То назорати ортодонтии навбатии шумо 7 рӯз боқӣ монд.",
      BEFORE_3_DAYS: "То назорати ортодонтии навбатии шумо 3 рӯз боқӣ монд.",
      BEFORE_1_DAY: "Фардо шумо назорати ортодонтӣ доред.",
      SAME_DAY_0700: "Имрӯз рӯзи назорати ортодонтии шумост.",
      DEFAULT: "Ёдраскунии назорати ортодонтӣ.",
    },
  },
};
const orthoFollowUpT = (lang) => ORTHO_FOLLOWUP_T[normalizeTelegramLanguage1132(lang)] || ORTHO_FOLLOWUP_T.uz;
const getOrthodontistReminderLeadText = (reminderType, lang) => {
  const lead = orthoFollowUpT(lang).lead;
  return lead[String(reminderType || "").trim()] || lead.DEFAULT;
};

export const buildOrthodontistFollowUpCompletionMessage = ({
  patient,
  dentist,
  entry,
  language = "",
}) => {
  const lang = normalizeTelegramLanguage1132(language || telegramLang(patient, dentist));
  const t = orthoFollowUpT(lang);
  const followUpDays = Number(entry?.followUpDays || 0);
  const nextDate = String(entry?.nextPlannedDate || "").trim();
  const purposeLabel =
    String(entry?.visitPurposeLabel || "").trim() || t.purposeFallback;

  const dentistDisplayName = formatDentistDisplayName(dentist);

  return (
    `${t.hello(patient?.name || t.patientFallback)}\n\n` +
    `${t.thanks}\n\n` +
    `🦷 <b>${t.visitType}:</b> ${purposeLabel}\n` +
    (dentistDisplayName ? `👨‍⚕️ <b>${t.doctor}:</b> ${dentistDisplayName}\n` : "") +
    `📆 <b>${t.nextCheck}:</b> ${t.withinDays(followUpDays)}\n` +
    (nextDate
      ? `🗓 <b>${t.plannedDate}:</b> ${formatUzDate(nextDate)}\n`
      : "") +
    `🏥 <b>${t.clinic}:</b> ${clinicName()}\n\n` +
    `${t.completionFooter}\n\n` +
    `${t.regards},\n${dentistDisplayName || clinicName()}`
  );
};

export const buildOrthodontistFollowUpReminderMessage = ({
  patient,
  dentist,
  entry,
  reminderType,
  language = "",
}) => {
  const lang = normalizeTelegramLanguage1132(language || telegramLang(patient, dentist));
  const t = orthoFollowUpT(lang);
  const followUpDays = Number(entry?.followUpDays || 0);
  const nextDate = String(entry?.nextPlannedDate || "").trim();
  const purposeLabel =
    String(entry?.visitPurposeLabel || "").trim() || t.purposeFallback;

  const dentistDisplayName = formatDentistDisplayName(dentist);

  return (
    `${t.hello(patient?.name || t.patientFallback)}\n\n` +
    `${getOrthodontistReminderLeadText(reminderType, lang)}\n\n` +
    `🦷 <b>${t.visitType}:</b> ${purposeLabel}\n` +
    `📆 <b>${t.interval}:</b> ${t.days(followUpDays)}\n` +
    (nextDate
      ? `🗓 <b>${t.nextCheckDate}:</b> ${formatUzDate(nextDate)}\n`
      : "") +
    (dentistDisplayName ? `👨‍⚕️ <b>${t.doctor}:</b> ${dentistDisplayName}\n` : "") +
    `🏥 <b>${t.clinic}:</b> ${clinicName()}\n` +
    (clinicAddress() ? `📍 ${clinicAddress()}\n` : "") +
    (clinicAddress() && clinicMapUrl() ? `🗺 <a href="${clinicMapUrl()}">${t.openMap}</a>\n\n` : "\n") +
    `${t.pleaseCome}\n\n` +
    `${t.regards},\n${dentistDisplayName || clinicName()}`
  );
};
const normalizeTelegramText = (value) =>
  String(value || "")
    .replace(/[‘’`´]/g, "'")
    .trim()
    .toLowerCase();

const QUEUE_T_1141 = {
  uz: {
    patient: "Bemor",
    doctorFallback: "Shifokor",
    yes: "✅ Ha, navbatga yozilmoqchiman",
    no: "❌ Yo‘q",
    sendLocation: "📍 Joylashuv yuborish",
    queueShortcut: "🎟 Navbat olish",
    chooseDentist: "Qaysi shifokor navbatiga yozilmoqchisiz?",
    oneDentist: (name) => `Klinikada hozir bitta shifokor mavjud: <b>${escapeTelegramHtml(name)}</b>.`,
    activeQueue: "faol navbat",
    chooseButton: "Quyidagi tugmalardan birini tanlang:",
    added: "Siz navbatga muvaffaqiyatli qo‘shildingiz.",
    dentist: "Shifokor",
    queueNo: "Navbat raqamingiz",
    ahead: "Oldingizda",
    patientCount: "ta bemor",
    wait: "Taxminiy kutish vaqti",
    minutes: "daqiqa",
    status: "Joriy holat",
    active: "Faol navbat",
    stay: "Iltimos, klinika hududida qoling. Holat o‘zgarsa sizga Telegram orqali xabar beriladi.",
    alreadyWaiting: "Siz bugungi navbatda allaqachon borsiz. Yangi navbat raqami berilmaydi.",
    noQueue: "Siz bugungi navbatda hali yo‘qsiz.",
    start: "Boshlash uchun “✅ Ha, navbatga yozilmoqchiman” tugmasini bosing yoki joylashuvingizni yuboring.",
    missed: "Sizning bugungi navbatingiz <b>KELMADI</b> deb yopilgan.",
    cancelled: "Sizning bugungi navbatingiz <b>BEKOR QILINGAN</b>.",
    requeueHelp: "Agar klinikada bo‘lsangiz, “📍 Joylashuv yuborish” tugmasi orqali joylashuvingizni qayta yuboring. Shunda sizga yangi navbat raqami beriladi.",
    requeueStart: "Yoki qaytadan boshlash uchun “✅ Ha, navbatga yozilmoqchiman” tugmasini bosing.",
    closed: "Sizning bugungi navbatingiz allaqachon yakunlangan.",
    closedNoNew: "Bugungi yakunlangan navbat uchun qayta raqam berilmaydi. Yangi navbat kerak bo‘lsa, klinika xodimiga murojaat qiling.",
    newQueueNeed: "Yangi navbat kerak bo‘lsa, “✅ Ha, navbatga yozilmoqchiman” tugmasini bosing.",
    doctorSelected: (name) => `Shifokor tanlandi: <b>${escapeTelegramHtml(name)}</b>.`,
    sendLocationAfter: "Endi “📍 Joylashuv yuborish” tugmasi orqali joylashuvingizni yuboring.",
    locationAccepted: "Joylashuvingiz qabul qilindi.",
    oldQueue: "Eski navbat",
    newQueue: "Yangi navbat raqamingiz",
    rejoined: "Siz avvalgi holatdan keyin navbatga qayta qo‘shildingiz.",
    tooFar: "Siz hozir klinikadan uzoqroqsiz.",
    distance: "Masofa",
    mustBeNear: "Navbatga qo‘shilish uchun",
    within: "metr ichida bo‘lishingiz kerak",
    tryAgain: "Klinikaga yaqinlashgach joylashuvingizni qayta yuboring.",
    calledTitle: "Navbatingiz chaqirildi",
    calledBody: "Iltimos, qabul xonasiga yaqinlashing.",
    missedTitle: "Bugungi navbatingiz KELMADI deb belgilandi.",
    sendLocationAgain: "Agar siz hali klinikada bo‘lsangiz, joylashuvingizni qayta yuboring va sizga yangi navbat raqami beriladi.",
    hello: "Assalomu alaykum",
    statuses: { WAITING: "KUTILMOQDA", CALLED: "CHAQIRILDI", IN_PROGRESS: "QABULDA", DONE: "YAKUNLANDI", MISSED: "KELMADI", CANCELLED: "BEKOR QILINDI" },
  },
  ru: {
    patient: "Пациент",
    doctorFallback: "Врач",
    yes: "✅ Да, записаться в очередь",
    no: "❌ Нет",
    sendLocation: "📍 Отправить геолокацию",
    queueShortcut: "🎟 Встать в очередь",
    chooseDentist: "К какому врачу вы хотите записаться в очередь?",
    oneDentist: (name) => `В клинике сейчас доступен один врач: <b>${escapeTelegramHtml(name)}</b>.`,
    activeQueue: "активных в очереди",
    chooseButton: "Выберите один из вариантов ниже:",
    added: "Вы успешно добавлены в очередь.",
    dentist: "Врач",
    queueNo: "Ваш номер",
    ahead: "Перед вами",
    patientCount: "пациентов",
    wait: "Примерное ожидание",
    minutes: "мин",
    status: "Текущий статус",
    active: "Активная очередь",
    stay: "Пожалуйста, оставайтесь рядом с клиникой. Если статус изменится, мы сообщим в Telegram.",
    alreadyWaiting: "Вы уже есть в сегодняшней очереди. Новый номер не выдаётся.",
    noQueue: "Сегодня вы ещё не в очереди.",
    start: "Чтобы начать, нажмите “✅ Да, записаться в очередь” или отправьте геолокацию.",
    missed: "Ваша сегодняшняя очередь отмечена как <b>НЕ ПРИШЁЛ</b>.",
    cancelled: "Ваша сегодняшняя очередь была <b>ОТМЕНЕНА</b>.",
    requeueHelp: "Если вы в клинике, повторно отправьте геолокацию. Вам будет выдан новый номер очереди.",
    requeueStart: "Или начните заново, нажав “✅ Да, записаться в очередь”.",
    closed: "Ваша сегодняшняя очередь уже завершена.",
    closedNoNew: "Для уже завершённой очереди новый номер сегодня не выдаётся. Если нужна новая очередь, обратитесь к сотруднику клиники.",
    newQueueNeed: "Если нужна новая очередь, нажмите “✅ Да, записаться в очередь”.",
    doctorSelected: (name) => `Врач выбран: <b>${escapeTelegramHtml(name)}</b>.`,
    sendLocationAfter: "Теперь отправьте геолокацию кнопкой “📍 Отправить геолокацию”.",
    locationAccepted: "Геолокация получена.",
    oldQueue: "Старый номер",
    newQueue: "Новый номер очереди",
    rejoined: "Вы повторно добавлены в очередь после предыдущего статуса.",
    tooFar: "Вы сейчас далеко от клиники.",
    distance: "Расстояние",
    mustBeNear: "Чтобы встать в очередь",
    within: "метров от клиники",
    tryAgain: "Подойдите ближе к клинике и отправьте геолокацию ещё раз.",
    calledTitle: "Ваша очередь вызвана",
    calledBody: "Пожалуйста, подойдите к кабинету приёма.",
    missedTitle: "Ваша сегодняшняя очередь отмечена как НЕ ПРИШЁЛ.",
    sendLocationAgain: "Если вы всё ещё в клинике, отправьте геолокацию ещё раз, и вам будет выдан новый номер очереди.",
    hello: "Здравствуйте",
    statuses: { WAITING: "ОЖИДАЕТ", CALLED: "ВЫЗВАН", IN_PROGRESS: "НА ПРИЁМЕ", DONE: "ЗАВЕРШЕНО", MISSED: "НЕ ПРИШЁЛ", CANCELLED: "ОТМЕНЕНО" },
  },
  en: {
    patient: "Patient",
    doctorFallback: "Doctor",
    yes: "✅ Yes, join queue",
    no: "❌ No",
    sendLocation: "📍 Send location",
    queueShortcut: "🎟 Join queue",
    chooseDentist: "Which doctor's queue would you like to join?",
    oneDentist: (name) => `One doctor is currently available: <b>${escapeTelegramHtml(name)}</b>.`,
    activeQueue: "active in queue",
    chooseButton: "Choose one of the buttons below:",
    added: "You have successfully joined the queue.",
    dentist: "Doctor",
    queueNo: "Your queue number",
    ahead: "Ahead of you",
    patientCount: "patients",
    wait: "Estimated waiting time",
    minutes: "min",
    status: "Current status",
    active: "Active queue",
    stay: "Please stay near the clinic. We will notify you in Telegram if the status changes.",
    alreadyWaiting: "You are already in today’s queue. A new queue number will not be issued.",
    noQueue: "You are not in today’s queue yet.",
    start: "To start, press “✅ Yes, join queue” or send your location.",
    missed: "Your queue for today was marked as <b>MISSED</b>.",
    cancelled: "Your queue for today was <b>CANCELLED</b>.",
    requeueHelp: "If you are still at the clinic, send your location again. A new queue number will be issued.",
    requeueStart: "Or start again by pressing “✅ Yes, join queue”.",
    closed: "Your queue for today has already been completed.",
    closedNoNew: "A new number is not issued for a completed queue today. Please contact clinic staff if you need a new queue.",
    newQueueNeed: "If you need a new queue, press “✅ Yes, join queue”.",
    doctorSelected: (name) => `Doctor selected: <b>${escapeTelegramHtml(name)}</b>.`,
    sendLocationAfter: "Now send your location using the “📍 Send location” button.",
    locationAccepted: "Your location was received.",
    oldQueue: "Old queue",
    newQueue: "New queue number",
    rejoined: "You have rejoined the queue after the previous status.",
    tooFar: "You are currently too far from the clinic.",
    distance: "Distance",
    mustBeNear: "To join the queue",
    within: "meters from the clinic",
    tryAgain: "Move closer to the clinic and send your location again.",
    calledTitle: "Your queue has been called",
    calledBody: "Please come closer to the treatment room.",
    missedTitle: "Your queue for today was marked as MISSED.",
    sendLocationAgain: "If you are still at the clinic, send your location again and a new queue number will be issued.",
    hello: "Hello",
    statuses: { WAITING: "WAITING", CALLED: "CALLED", IN_PROGRESS: "IN PROGRESS", DONE: "COMPLETED", MISSED: "MISSED", CANCELLED: "CANCELLED" },
  },
  tg: {
    patient: "Бемор",
    doctorFallback: "Духтур",
    yes: "✅ Ҳа, мехоҳам ба навбат нависам",
    no: "❌ Не",
    sendLocation: "📍 Фиристодани ҷойгиршавӣ",
    queueShortcut: "🎟 Гирифтани навбат",
    chooseDentist: "Ба навбати кадом духтур навишта шудан мехоҳед?",
    oneDentist: (name) => `Дар клиника ҳозир як духтур дастрас аст: <b>${escapeTelegramHtml(name)}</b>.`,
    activeQueue: "навбати фаъол",
    chooseButton: "Яке аз тугмаҳои зеринро интихоб кунед:",
    added: "Шумо бомуваффақият ба навбат илова шудед.",
    dentist: "Духтур",
    queueNo: "Рақами навбати шумо",
    ahead: "Пеш аз шумо",
    minutes: "дақиқа",
    status: "Ҳолати ҷорӣ",
    active: "Навбати фаъол",
    stay: "Лутфан, дар ҳудуди клиника бимонед. Агар ҳолат тағйир ёбад, ба шумо тавассути Telegram хабар дода мешавад.",
    alreadyWaiting: "Шумо аллакай дар навбати имрӯза ҳастед. Рақами нави навбат дода намешавад.",
    noQueue: "Шумо ҳоло дар навбати имрӯза нестед.",
    start: "Барои оғоз кардан тугмаи “✅ Ҳа, мехоҳам ба навбат нависам”-ро пахш кунед ё ҷойгиршавии худро фиристед.",
    missed: "Навбати имрӯзаи шумо ҳамчун <b>НАОМАД</b> баста шудааст.",
    cancelled: "Навбати имрӯзаи шумо <b>БЕКОР КАРДА ШУД</b>.",
    requeueHelp: "Агар шумо дар клиника бошед, тавассути тугмаи “📍 Фиристодани ҷойгиршавӣ” ҷойгиршавии худро дубора фиристед. Ба шумо рақами нави навбат дода мешавад.",
    requeueStart: "Ё барои аз нав оғоз кардан тугмаи “✅ Ҳа, мехоҳам ба навбат нависам”-ро пахш кунед.",
    closed: "Навбати имрӯзаи шумо аллакай анҷом ёфтааст.",
    closedNoNew: "Барои навбати анҷомёфтаи имрӯз рақами нав дода намешавад. Агар навбати нав лозим бошад, ба корманди клиника муроҷиат кунед.",
    newQueueNeed: "Агар навбати нав лозим бошад, тугмаи “✅ Ҳа, мехоҳам ба навбат нависам”-ро пахш кунед.",
    doctorSelected: (name) => `Духтур интихоб шуд: <b>${escapeTelegramHtml(name)}</b>.`,
    sendLocationAfter: "Акнун ҷойгиршавии худро тавассути тугмаи “📍 Фиристодани ҷойгиршавӣ” фиристед.",
    locationAccepted: "Ҷойгиршавии шумо қабул шуд.",
    oldQueue: "Навбати кӯҳна",
    newQueue: "Рақами нави навбати шумо",
    rejoined: "Шумо пас аз ҳолати қаблӣ дубора ба навбат илова шудед.",
    tooFar: "Шумо ҳоло аз клиника дур ҳастед.",
    distance: "Масофа",
    mustBeNear: "Барои илова шудан ба навбат",
    within: "метр наздик будан лозим аст",
    tryAgain: "Пас аз наздик шудан ба клиника ҷойгиршавии худро дубора фиристед.",
    calledTitle: "Навбати шумо даъват шуд",
    calledBody: "Лутфан, ба ҳуҷраи қабул наздик шавед.",
    missedTitle: "Навбати имрӯзаи шумо ҳамчун НАОМАД қайд шуд.",
    sendLocationAgain: "Агар шумо то ҳол дар клиника бошед, ҷойгиршавии худро дубора фиристед ва ба шумо рақами нави навбат дода мешавад.",
    hello: "Ассалому алейкум",
    statuses: { WAITING: "ИНТИЗОР", CALLED: "ДАЪВАТ ШУД", IN_PROGRESS: "ДАР ҚАБУЛ", DONE: "АНҶОМ ЁФТ", MISSED: "НАОМАД", CANCELLED: "БЕКОР ШУД" },
  },
};

export const queueText1141 = (...sources) => QUEUE_T_1141[normalizeTelegramLanguage1132(telegramLang(...sources))] || QUEUE_T_1141.uz;

export const buildOrthodontistQueueStartKeyboard = (lang = telegramLang()) => {
  const t = queueText1141(lang);
  return { keyboard: [[{ text: t.yes }], [{ text: t.no }]], resize_keyboard: true, one_time_keyboard: true };
};

export const buildOrthodontistMissedRetryKeyboard = (lang = telegramLang()) => {
  const t = queueText1141(lang);
  return { keyboard: [[{ text: t.sendLocation, request_location: true }], [{ text: t.yes }], [{ text: t.no }]], resize_keyboard: true, one_time_keyboard: false };
};

export const formatOrthodontistDentistChoiceLabel = (dentist, lang = telegramLang()) => {
  const t = queueText1141(lang);
  return "👨‍⚕️ " + (String(dentist?.name || t.doctorFallback).trim() || t.doctorFallback);
};

export const buildOrthodontistDentistChoiceKeyboard = (dentists = [], lang = telegramLang()) => ({
  keyboard: dentists.map((dentist) => [{ text: formatOrthodontistDentistChoiceLabel(dentist, lang) }]),
  resize_keyboard: true,
  one_time_keyboard: true,
});

export const findOrthodontistDentistChoiceFromText = (text, dentists = [], lang = telegramLang()) => {
  const value = normalizeTelegramText(text);
  return dentists.find((dentist, index) => {
    const label = normalizeTelegramText(formatOrthodontistDentistChoiceLabel(dentist, lang));
    const name = normalizeTelegramText(dentist?.name || "");
    return value === label || value === name || value === String(index + 1);
  }) || null;
};

export const isOrthodontistQueueIntentYes = (text) => {
  const value = normalizeTelegramText(text);
  return [
    "✅ ha, navbatga yozilmoqchiman", "✅ ha, navbat olmoqchiman", "ha", "xa", "navbat", "navbat olmoqchiman", "navbatga yozilmoqchiman", "yozilmoqchiman",
    "✅ да, записаться в очередь", "✅ да, хочу в очередь", "да", "хочу в очередь", "встать в очередь", "очередь",
    "✅ yes, join queue", "yes", "join queue", "queue", "🎟 navbat olish", "🎟 встать в очередь", "🎟 join queue", "/queue", "/ortodont_queue",
    "ortodont navbati", "🦷 ortodont navbati", "🦷 ortodont navbati / breket tortish navbati",
  ].includes(value);
};

export const isOrthodontistQueueShortcut = (text) => {
  const value = normalizeTelegramText(text);
  return ["🎟 navbat olish", "🎟 встать в очередь", "🎟 join queue", "/queue", "/ortodont_queue", "ortodont navbati", "🦷 ortodont navbati", "🦷 ortodont navbati / breket tortish navbati"].includes(value);
};

export const isOrthodontistQueueIntentNo = (text) => {
  const value = normalizeTelegramText(text);
  return ["❌ yo‘q", "❌ yo'q", "yo‘q", "yo'q", "yoq", "no", "❌ no", "нет", "❌ нет"].includes(value);
};

export const getOrthodontVisitPurposeLabel = (purpose = "", lang = telegramLang()) => {
  const language = normalizeTelegramLanguage1132(lang);
  const found = ORTHO_PURPOSES.find((item) => item.code === String(purpose || ""));
  return found?.labels?.[language] || found?.labels?.uz || queueText1141(lang).queueShortcut.replace(/^🎟\s*/, "");
};

export const buildTelegramMainReplyKeyboard = (lang = telegramLang()) => {
  const config = localTelegramConfig();
  const orthoEnabled = config.telegramOrthodontistQueueEnabled !== false && config.telegramOrthodontistQueueEnabled !== "false";
  if (!orthoEnabled) {
    return { remove_keyboard: true };
  }
  const t = queueText1141(lang);
  return { keyboard: [[{ text: t.queueShortcut }]], resize_keyboard: true, one_time_keyboard: false };
};

export const buildTelegramLocationReplyKeyboard = (lang = telegramLang()) => {
  const t = queueText1141(lang);
  return { keyboard: [[{ text: t.sendLocation, request_location: true }]], resize_keyboard: true, one_time_keyboard: false };
};

export const buildClosedQueueMessage = ({ patientName, status, language = telegramLang() }) => {
  const t = queueText1141(language);
  const statusLabel = getQueueStatusUzLabel(status, language);
  const isDone = String(status || "").trim() === "DONE";
  const isCancelled = String(status || "").trim() === "CANCELLED";
  return t.hello + ", <b>" + escapeTelegramHtml(patientName || t.patient) + "</b>!\n\n" +
    (isDone ? t.closed : isCancelled ? t.cancelled : t.closed) +
    "\n📌 <b>" + t.status + ":</b> " + statusLabel + "\n\n" +
    (isDone ? t.closedNoNew : t.requeueHelp);
};

export const buildTooFarQueueMessage = ({ distanceMeters, nearMeters, language = telegramLang() }) => {
  const t = queueText1141(language);
  return t.tooFar + "\n\n📏 " + t.distance + ": " + distanceMeters + " m\n✅ " + t.mustBeNear + ": " + nearMeters + " " + t.within + ".\n\n" + t.tryAgain;
};

export const buildOrthodontistQueueMessage = ({ patientName, dentistName, entry, aheadCount = 0, totalActive = 0, estimatedWaitMinutes = 0, language = telegramLang() }) => {
  const t = queueText1141(language, entry);
  const statusLabel = getQueueStatusUzLabel(entry?.status, language);
  const dentistDisplayName = formatDentistDisplayName(dentistName);
  const already = ["WAITING", "CALLED", "IN_PROGRESS"].includes(String(entry?.status || "").trim()) ? "\n" + t.alreadyWaiting + "\n" : "";
  return t.hello + ", <b>" + escapeTelegramHtml(patientName || t.patient) + "</b>!\n\n✅ " + t.added + "\n" + already + "\n" +
    (dentistDisplayName ? "👨‍⚕️ <b>" + t.dentist + ":</b> " + escapeTelegramHtml(dentistDisplayName) + "\n" : "") +
    "🎟 <b>" + t.queueNo + ":</b> #" + (entry?.queueNo || "-") +
    "\n👥 <b>" + t.ahead + ":</b> " + aheadCount + " " + t.patientCount +
    "\n⏱ <b>" + t.wait + ":</b> ~" + estimatedWaitMinutes + " " + t.minutes +
    "\n📍 <b>" + t.status + ":</b> " + statusLabel +
    "\n📊 <b>" + t.active + ":</b> " + totalActive + "\n\n📍 " + t.stay;
};

export const parseOrthodontistVisitPurposeFromText = (text, lang = telegramLang()) => {
  const value = normalizeTelegramText(text);
  const language = normalizeTelegramLanguage1132(lang);
  const found = ORTHO_PURPOSES.find((item) => item.aliases.some((alias) => normalizeTelegramText(alias) === value));
  if (!found) return null;
  return { code: found.code, label: found.labels?.[language] || found.labels?.uz || "Navbat", firstVisit: found.firstVisit };
};

const queueStatusFallbackMap = { WAITING: "WAITING", CALLED: "CALLED", IN_PROGRESS: "IN_PROGRESS", DONE: "DONE", MISSED: "MISSED", CANCELLED: "CANCELLED" };
export const getQueueStatusUzLabel = (status, language = telegramLang()) => {
  const t = queueText1141(language);
  return t.statuses?.[String(status || "").trim()] || queueStatusFallbackMap[String(status || "").trim()] || status || "UNKNOWN";
};

export const buildOrthodontistRejoinedMessage = ({ patientName, dentistName, oldQueueNo, newQueueNo, aheadCount = 0, estimatedWaitMinutes = 0, language = telegramLang() }) => {
  const t = queueText1141(language);
  const dentistDisplayName = formatDentistDisplayName(dentistName);
  return t.hello + ", <b>" + escapeTelegramHtml(patientName || t.patient) + "</b>!\n\n✅ " + t.rejoined + "\n\n" +
    (dentistDisplayName ? "👨‍⚕️ <b>" + t.dentist + ":</b> " + escapeTelegramHtml(dentistDisplayName) + "\n" : "") +
    (oldQueueNo ? "♻️ <b>" + t.oldQueue + ":</b> #" + oldQueueNo + "\n" : "") +
    "🎟 <b>" + t.newQueue + ":</b> #" + (newQueueNo || "-") +
    "\n👥 <b>" + t.ahead + ":</b> " + aheadCount + " " + t.patientCount +
    "\n⏱ <b>" + t.wait + ":</b> ~" + estimatedWaitMinutes + " " + t.minutes + "\n\n📍 " + t.stay;
};

export const buildOrthodontistCalledMessage = ({ patientName, dentistName, entry, language = telegramLang() }) => {
  const t = queueText1141(language, entry);
  const dentistDisplayName = formatDentistDisplayName(dentistName);
  return t.hello + ", <b>" + escapeTelegramHtml(patientName || t.patient) + "</b>!\n\n🔔 <b>" + t.calledTitle + "</b>\n" + t.calledBody + "\n\n" +
    "🎟 <b>" + t.queueNo + ":</b> #" + (entry?.queueNo || "-") + "\n" +
    (dentistDisplayName ? "👨‍⚕️ <b>" + t.dentist + ":</b> " + escapeTelegramHtml(dentistDisplayName) + "\n" : "") +
    "🏥 <b>" + t.status + ":</b> " + getQueueStatusUzLabel(entry?.status, language);
};

export const buildOrthodontistMissedMessage = ({ patientName, dentistName, entry, language = telegramLang() }) => {
  const t = queueText1141(language, entry);
  const dentistDisplayName = formatDentistDisplayName(dentistName);
  return t.hello + ", <b>" + escapeTelegramHtml(patientName || t.patient) + "</b>!\n\n⚠️ <b>" + t.missedTitle + "</b>\n\n" +
    t.sendLocationAgain + "\n\n🎟 <b>" + t.oldQueue + ":</b> #" + (entry?.queueNo || "-") + "\n" +
    (dentistDisplayName ? "👨‍⚕️ <b>" + t.dentist + ":</b> " + escapeTelegramHtml(dentistDisplayName) + "\n" : "") +
    "🏥 <b>" + t.active + ":</b> " + escapeTelegramHtml(clinicName());
};

const PATIENT_CALL_TEXT_1133 = {
  uz: {
    hello: (name) => "Assalomu alaykum, <b>" + name + "</b>!",
    title: "Siz qabulga chaqirildingiz.",
    body: "Iltimos, qabul xonasiga yaqinlashing.",
    clinic: "Klinika",
    dentist: "Shifokor",
    date: "Sana",
    time: "Vaqt",
    queue: "Navbat",
  },
  ru: {
    hello: (name) => "Здравствуйте, <b>" + name + "</b>!",
    title: "Вас пригласили на приём.",
    body: "Пожалуйста, подойдите к кабинету приёма.",
    clinic: "Клиника",
    dentist: "Врач",
    date: "Дата",
    time: "Время",
    queue: "Очередь",
  },
  en: {
    hello: (name) => "Hello, <b>" + name + "</b>!",
    title: "You have been called for your appointment.",
    body: "Please come closer to the treatment room.",
    clinic: "Clinic",
    dentist: "Doctor",
    date: "Date",
    time: "Time",
    queue: "Queue",
  },
  tg: {
    hello: (name) => "Ассалому алейкум, <b>" + name + "</b>!",
    title: "Шуморо ба қабул даъват карданд.",
    body: "Лутфан, ба ҳуҷраи қабул наздик шавед.",
    clinic: "Клиника",
    dentist: "Духтур",
    date: "Сана",
    time: "Вақт",
    queue: "Навбат",
  },
};

export const buildPatientAppointmentCalledMessage = ({ patient, dentist, appointment } = {}) => {
  const lang = telegramLang(appointment, patient, dentist);
  const t = PATIENT_CALL_TEXT_1133[lang] || PATIENT_CALL_TEXT_1133.uz;
  const patientName = escapeTelegramHtml(patient?.name || t.queue);
  const dentistDisplayName = formatDentistDisplayName(dentist || appointment?.dentistSnapshot || "");
  const queueNo = appointment?.queueNo || appointment?.liveQueueNo || appointment?.queueNumber || "";

  return (
    t.hello(patientName) + "\n\n" +
    "🔔 <b>" + escapeTelegramHtml(t.title) + "</b>\n" +
    escapeTelegramHtml(t.body) + "\n\n" +
    "🏥 <b>" + escapeTelegramHtml(t.clinic) + ":</b> " + escapeTelegramHtml(clinicName()) + "\n" +
    (dentistDisplayName ? "👨‍⚕️ <b>" + escapeTelegramHtml(t.dentist) + ":</b> " + escapeTelegramHtml(dentistDisplayName) + "\n" : "") +
    (appointment?.slotDate ? "📅 <b>" + escapeTelegramHtml(t.date) + ":</b> " + escapeTelegramHtml(formatUzDate(appointment.slotDate)) + "\n" : "") +
    (appointment?.slotTime ? "⏰ <b>" + escapeTelegramHtml(t.time) + ":</b> " + escapeTelegramHtml(formatUzTime(appointment.slotTime)) + "\n" : "") +
    (queueNo ? "🎟 <b>" + escapeTelegramHtml(t.queue) + ":</b> #" + escapeTelegramHtml(queueNo) + "\n" : "")
  );
};

const CLINIC_TEXT_1132 = {
  uz: {
    statuses: { WAITING: "Kutilmoqda", IN_PROGRESS: "Qabulda", DONE: "Yakunlandi", MISSED: "Kelmagan", CANCELLED: "Bekor qilingan" },
    titles: {
      CLINIC_APPOINTMENT_CREATED: "🔔 YANGI QABUL QO‘SHILDI",
      CLINIC_APPOINTMENT_UPDATED: "🔔 MA’LUMOT YANGILANDI",
      CLINIC_APPOINTMENT_CANCELLED: "🔔 QABUL BEKOR QILINDI",
      CLINIC_APPOINTMENT_FINISHED: "🔔 QABUL YAKUNLANDI",
      CLINIC_DAILY_SUMMARY: "📅 Bugungi qabullar"
    },
    defaultTitle: "📌 Qabul xabarnomasi",
    calledTitle: "🔔 BEMOR CHAQIRILDI",
    patient: "Bemor",
    phone: "Telefon",
    dentist: "Shifokor",
    date: "Sana",
    time: "Vaqt",
    status: "Holat",
    total: "Umumiy",
    paidNow: "Hozir to‘landi",
    paidTotal: "Jami to‘langan",
    debt: "Qarz",
    footer: "MedInson Dentist Tizimi",
    testTitle: "Telegram test xabari muvaffaqiyatli yuborildi.",
    testBody: "Agar ushbu xabar kelgan bo‘lsa, klinika Telegram sozlamalari ishlayapti."
  },
  ru: {
    statuses: { WAITING: "Ожидает", IN_PROGRESS: "На приёме", DONE: "Завершено", MISSED: "Не пришёл", CANCELLED: "Отменено" },
    titles: {
      CLINIC_APPOINTMENT_CREATED: "🔔 ДОБАВЛЕН НОВЫЙ ПРИЁМ",
      CLINIC_APPOINTMENT_UPDATED: "🔔 ДАННЫЕ ОБНОВЛЕНЫ",
      CLINIC_APPOINTMENT_CANCELLED: "🔔 ПРИЁМ ОТМЕНЁН",
      CLINIC_APPOINTMENT_FINISHED: "🔔 ПРИЁМ ЗАВЕРШЕН",
      CLINIC_DAILY_SUMMARY: "📅 Приёмы на сегодня"
    },
    defaultTitle: "📌 Уведомление о приёме",
    calledTitle: "🔔 ПАЦИЕНТ ВЫЗВАН",
    patient: "Пациент",
    phone: "Телефон",
    dentist: "Врач",
    date: "Дата",
    time: "Время",
    status: "Статус",
    total: "Общая сумма",
    paidNow: "Оплачено сейчас",
    paidTotal: "Всего оплачено",
    debt: "Долг",
    footer: "Система MedInson Dentist",
    testTitle: "Тестовое сообщение Telegram успешно отправлено.",
    testBody: "Если это сообщение пришло, настройки Telegram клиники работают."
  },
  en: {
    statuses: { WAITING: "Waiting", IN_PROGRESS: "In appointment", DONE: "Completed", MISSED: "Missed", CANCELLED: "Cancelled" },
    titles: {
      CLINIC_APPOINTMENT_CREATED: "🔔 NEW APPOINTMENT CREATED",
      CLINIC_APPOINTMENT_UPDATED: "🔔 APPOINTMENT DETAILS UPDATED",
      CLINIC_APPOINTMENT_CANCELLED: "🔔 APPOINTMENT CANCELLED",
      CLINIC_APPOINTMENT_FINISHED: "🔔 VISIT COMPLETED",
      CLINIC_DAILY_SUMMARY: "📅 Today’s appointments"
    },
    defaultTitle: "📌 Appointment notification",
    calledTitle: "🔔 PATIENT CALLED",
    patient: "Patient",
    phone: "Phone",
    dentist: "Doctor",
    date: "Date",
    time: "Time",
    status: "Status",
    total: "Total",
    paidNow: "Paid now",
    paidTotal: "Total paid",
    debt: "Debt",
    footer: "MedInson Dentist System",
    testTitle: "Telegram test message was sent successfully.",
    testBody: "If you received this message, the clinic Telegram settings are working."
  },
  tg: {
    statuses: { WAITING: "Интизор", IN_PROGRESS: "Дар қабул", DONE: "Анҷом ёфт", MISSED: "Наомад", CANCELLED: "Бекор шуд" },
    titles: {
      CLINIC_APPOINTMENT_CREATED: "🔔 ҚАБУЛИ НАВ ИЛОВА ШУД",
      CLINIC_APPOINTMENT_UPDATED: "🔔 МАЪЛУМОТ НАВСОЗӢ ШУД",
      CLINIC_APPOINTMENT_CANCELLED: "🔔 ҚАБУЛ БЕКОР ШУД",
      CLINIC_APPOINTMENT_FINISHED: "🔔 ҚАБУЛ АНҶОМ ЁФТ",
      CLINIC_DAILY_SUMMARY: "📅 Қабулҳои имрӯза"
    },
    defaultTitle: "📌 Огоҳиномаи қабул",
    calledTitle: "🔔 БЕМОР ДАЪВАТ ШУД",
    patient: "Бемор",
    phone: "Телефон",
    dentist: "Духтур",
    date: "Сана",
    time: "Вақт",
    status: "Ҳолат",
    total: "Маблағи умумӣ",
    paidNow: "Пардохти ҷорӣ",
    paidTotal: "Ҷамъи пардохтшуда",
    debt: "Қарз",
    footer: "Системаи MedInson Dentist",
    testTitle: "Паёми санҷишии Telegram бомуваффақият фиристода шуд.",
    testBody: "Агар ин паём омада бошад, танзимоти Telegram-и клиника кор мекунанд."
  },
};
const clinicText1132 = (lang = "") => CLINIC_TEXT_1132[normalizeTelegramLanguage1132(lang || telegramLang())] || CLINIC_TEXT_1132.uz;

const escapeTelegramHtml = (value = "") =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const appointmentStatusLabel = (status, t = clinicText1132()) => t.statuses[String(status || "").trim()] || String(status || "Noma’lum");

export const buildTelegramTestClinicMessage = ({ language = "" } = {}) => {
  const t = clinicText1132(language);
  return `✅ <b>${escapeTelegramHtml(clinicName())}</b> ${t.testTitle}\n\n${t.testBody}`;
};

// ─── Admin-side event message builders ────────────────────────────────────────
// These builders produce messages for the CLINIC's own Telegram chat (admin chat).
// Language is always the clinic-configured language (telegramLanguage), not the
// patient's language (that is handled by patient-facing builders above).

const ADMIN_EVENT_T = {
  uz: {
    visitStarted: "🟢 Qabul boshlandi",
    visitCompleted: "✅ Qabul yakunlandi",
    infoUpdated: "✏️ Ma'lumot yangilandi",
    debtPaymentReceived: "💳 Qarz to'lovi qabul qilindi",
    patientCalled: "🔔 Bemor chaqirildi",
    patient: "Bemor",
    phone: "Telefon",
    dentist: "Shifokor",
    date: "Sana",
    time: "Vaqt",
    total: "Umumiy summa",
    paid: "To'langan",
    paidNow: "Hozir to'landi",
    debt: "Qolgan qarz",
    noDebt: "Qarz yo'q",
    status: "Holat",
    oldAmount: "Eski summa",
    newAmount: "Yangi summa",
    reason: "Sabab",
    nextVisit: "Keyingi qabul",
    footer: "MedInson avtomatik xabarnomasi.",
    statuses: { WAITING: "Kutilmoqda", CALLED: "Chaqirildi", IN_PROGRESS: "Qabulda", DONE: "Yakunlandi", MISSED: "Kelmadi", CANCELLED: "Bekor qilingan" },
    payStatuses: { PAID: "✅ To'liq to'langan", PARTIAL: "⚠️ Qisman to'langan", UNPAID: "❌ To'lanmagan" },
  },
  ru: {
    visitStarted: "🟢 Приём начат",
    visitCompleted: "✅ Приём завершён",
    infoUpdated: "✏️ Данные обновлены",
    debtPaymentReceived: "💳 Платёж по долгу принят",
    patientCalled: "🔔 Пациент вызван",
    patient: "Пациент",
    phone: "Телефон",
    dentist: "Врач",
    date: "Дата",
    time: "Время",
    total: "Общая сумма",
    paid: "Оплачено",
    paidNow: "Оплачено сейчас",
    debt: "Остаток долга",
    noDebt: "Без долга",
    status: "Статус",
    oldAmount: "Старая сумма",
    newAmount: "Новая сумма",
    reason: "Причина",
    nextVisit: "Следующий приём",
    footer: "Автоматическое уведомление MedInson.",
    statuses: { WAITING: "Ожидает", CALLED: "Вызван", IN_PROGRESS: "На приёме", DONE: "Завершено", MISSED: "Не пришёл", CANCELLED: "Отменено" },
    payStatuses: { PAID: "✅ Полностью оплачено", PARTIAL: "⚠️ Частично оплачено", UNPAID: "❌ Не оплачено" },
  },
  en: {
    visitStarted: "🟢 Visit started",
    visitCompleted: "✅ Visit completed",
    infoUpdated: "✏️ Information updated",
    debtPaymentReceived: "💳 Debt payment received",
    patientCalled: "🔔 Patient called",
    patient: "Patient",
    phone: "Phone",
    dentist: "Doctor",
    date: "Date",
    time: "Time",
    total: "Total amount",
    paid: "Paid",
    paidNow: "Paid now",
    debt: "Remaining debt",
    noDebt: "No debt",
    status: "Status",
    oldAmount: "Old amount",
    newAmount: "New amount",
    reason: "Reason",
    nextVisit: "Next appointment",
    footer: "Automatic MedInson notification.",
    statuses: { WAITING: "Waiting", CALLED: "Called", IN_PROGRESS: "In appointment", DONE: "Completed", MISSED: "Missed", CANCELLED: "Cancelled" },
    payStatuses: { PAID: "✅ Fully paid", PARTIAL: "⚠️ Partially paid", UNPAID: "❌ Unpaid" },
  },
  tg: {
    visitStarted: "🟢 Қабул оғоз шуд",
    visitCompleted: "✅ Қабул анҷом ёфт",
    infoUpdated: "✏️ Маълумот навсозӣ шуд",
    debtPaymentReceived: "💳 Пардохти қарз қабул шуд",
    patientCalled: "🔔 Бемор даъват шуд",
    patient: "Бемор",
    phone: "Телефон",
    dentist: "Духтур",
    date: "Сана",
    time: "Вақт",
    total: "Маблағи умумӣ",
    paid: "Пардохтшуда",
    paidNow: "Пардохти ҷорӣ",
    debt: "Қарзи боқимонда",
    noDebt: "Қарз нест",
    status: "Ҳолат",
    oldAmount: "Маблағи кӯҳна",
    newAmount: "Маблағи нав",
    reason: "Сабаб",
    nextVisit: "Қабули навбатӣ",
    footer: "Огоҳиномаи худкори MedInson.",
    statuses: { WAITING: "Интизор", CALLED: "Даъват шуд", IN_PROGRESS: "Дар қабул", DONE: "Анҷом ёфт", MISSED: "Наомад", CANCELLED: "Бекор шуд" },
    payStatuses: { PAID: "✅ Пурра пардохтшуда", PARTIAL: "⚠️ Қисман пардохтшуда", UNPAID: "❌ Пардохтнашуда" },
  },
};

const adminEventT = () => ADMIN_EVENT_T[normalizeTelegramLanguage1132(telegramLang())] || ADMIN_EVENT_T.uz;

/**
 * Admin chat: "visit started" — sent immediately when dentist presses Start.
 */
export const buildClinicVisitStartedMessage = ({ patient, dentist, appointment } = {}) => {
  const t = adminEventT();
  const dentistDisplayName = formatDentistDisplayName(dentist);
  return (
    `${t.visitStarted}\n\n` +
    `👤 <b>${t.patient}:</b> ${escapeTelegramHtml(patient?.name || "—")}\n` +
    (patient?.phone ? `📞 <b>${t.phone}:</b> ${escapeTelegramHtml(patient.phone)}\n` : "") +
    (dentistDisplayName ? `👨‍⚕️ <b>${t.dentist}:</b> ${escapeTelegramHtml(dentistDisplayName)}\n` : "") +
    (appointment?.slotDate ? `📅 <b>${t.date}:</b> ${escapeTelegramHtml(formatUzDate(appointment.slotDate))}\n` : "") +
    (appointment?.slotTime ? `⏰ <b>${t.time}:</b> ${escapeTelegramHtml(formatUzTime(appointment.slotTime))}\n` : "") +
    `\n<i>${t.footer}</i>`
  );
};

/**
 * Admin chat: "patient called" — sent when the dentist calls the patient in.
 */
export const buildClinicPatientCalledMessage = ({ patient, dentist, appointment } = {}) => {
  const t = adminEventT();
  const dentistDisplayName = formatDentistDisplayName(dentist);
  return (
    `${t.patientCalled}\n\n` +
    `👤 <b>${t.patient}:</b> ${escapeTelegramHtml(patient?.name || "—")}\n` +
    (patient?.phone ? `📞 <b>${t.phone}:</b> ${escapeTelegramHtml(patient.phone)}\n` : "") +
    (dentistDisplayName ? `👨‍⚕️ <b>${t.dentist}:</b> ${escapeTelegramHtml(dentistDisplayName)}\n` : "") +
    (appointment?.slotDate ? `📅 <b>${t.date}:</b> ${escapeTelegramHtml(formatUzDate(appointment.slotDate))}\n` : "") +
    (appointment?.slotTime ? `⏰ <b>${t.time}:</b> ${escapeTelegramHtml(formatUzTime(appointment.slotTime))}\n` : "") +
    `\n<i>${t.footer}</i>`
  );
};

/**
 * Admin chat: "visit completed" — sent immediately when dentist finishes checkout.
 * Includes payment summary and next appointment info if available.
 */
export const buildClinicVisitCompletedMessage = ({ patient, dentist, appointment, treatment, nextAppointment } = {}) => {
  const t = adminEventT();
  const dentistDisplayName = formatDentistDisplayName(dentist);
  const totalAmount = Math.max(0, Number(treatment?.amount ?? appointment?.financial?.amount ?? 0));
  const paidAmount = Math.max(0, Number(treatment?.paidAmount ?? appointment?.financial?.paidAmount ?? 0));
  const debtAmount = Math.max(0, totalAmount - paidAmount);
  const payStatusKey = String(treatment?.paymentStatus || (debtAmount <= 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "UNPAID"));
  const payStatusLabel = t.payStatuses[payStatusKey] || payStatusKey;

  const nextVisitLine = (nextAppointment?.slotDate)
    ? `📅 <b>${t.nextVisit}:</b> ${escapeTelegramHtml(formatUzDate(nextAppointment.slotDate))}${nextAppointment.slotTime ? " " + escapeTelegramHtml(formatUzTime(nextAppointment.slotTime)) : ""}\n`
    : (treatment?.nextVisitDate ? `📅 <b>${t.nextVisit}:</b> ${escapeTelegramHtml(formatUzDate(treatment.nextVisitDate))}${treatment.nextVisitTime ? " " + escapeTelegramHtml(formatUzTime(treatment.nextVisitTime)) : ""}\n` : "");

  return (
    `${t.visitCompleted}\n\n` +
    `👤 <b>${t.patient}:</b> ${escapeTelegramHtml(patient?.name || "—")}\n` +
    (patient?.phone ? `📞 <b>${t.phone}:</b> ${escapeTelegramHtml(patient.phone)}\n` : "") +
    (dentistDisplayName ? `👨‍⚕️ <b>${t.dentist}:</b> ${escapeTelegramHtml(dentistDisplayName)}\n` : "") +
    (appointment?.slotDate ? `📅 <b>${t.date}:</b> ${escapeTelegramHtml(formatUzDate(appointment.slotDate))}\n` : "") +
    (appointment?.slotTime ? `⏰ <b>${t.time}:</b> ${escapeTelegramHtml(formatUzTime(appointment.slotTime))}\n` : "") +
    (totalAmount > 0 ? `💰 <b>${t.total}:</b> ${escapeTelegramHtml(formatMoneyUzs(totalAmount))}\n` : "") +
    (paidAmount > 0 ? `✅ <b>${t.paid}:</b> ${escapeTelegramHtml(formatMoneyUzs(paidAmount))}\n` : "") +
    (debtAmount > 0 ? `⚠️ <b>${t.debt}:</b> ${escapeTelegramHtml(formatMoneyUzs(debtAmount))}\n` : `✅ <b>${t.debt}:</b> ${t.noDebt}\n`) +
    `📋 <b>${t.status}:</b> ${escapeTelegramHtml(payStatusLabel)}\n` +
    (nextVisitLine ? `\n${nextVisitLine}` : "") +
    `\n<i>${t.footer}</i>`
  );
};

/**
 * Admin chat: "info updated" — sent immediately when dentist edits the amount.
 */
export const buildClinicInfoUpdatedMessage = ({ patient, dentist, appointment, oldAmount, newAmount, reason } = {}) => {
  const t = adminEventT();
  const dentistDisplayName = formatDentistDisplayName(dentist);
  return (
    `${t.infoUpdated}\n\n` +
    `👤 <b>${t.patient}:</b> ${escapeTelegramHtml(patient?.name || "—")}\n` +
    (patient?.phone ? `📞 <b>${t.phone}:</b> ${escapeTelegramHtml(patient.phone)}\n` : "") +
    (dentistDisplayName ? `👨‍⚕️ <b>${t.dentist}:</b> ${escapeTelegramHtml(dentistDisplayName)}\n` : "") +
    (appointment?.slotDate ? `📅 <b>${t.date}:</b> ${escapeTelegramHtml(formatUzDate(appointment.slotDate))}\n` : "") +
    `💵 <b>${t.oldAmount}:</b> ${escapeTelegramHtml(formatMoneyUzs(Math.max(0, Number(oldAmount || 0))))}\n` +
    `💰 <b>${t.newAmount}:</b> ${escapeTelegramHtml(formatMoneyUzs(Math.max(0, Number(newAmount || 0))))}\n` +
    (reason ? `📝 <b>${t.reason}:</b> ${escapeTelegramHtml(reason)}\n` : "") +
    `\n<i>${t.footer}</i>`
  );
};

/**
 * Admin chat: "debt payment received" — sent immediately when a debt payment is accepted.
 */
export const buildClinicDebtPaymentReceivedMessage = ({ patient, dentist, appointment, paidNow, totalAmount, totalPaid, debt } = {}) => {
  const t = adminEventT();
  const dentistDisplayName = formatDentistDisplayName(dentist);
  const safeDebt = Math.max(0, Number(debt ?? 0));
  const payStatusLabel = safeDebt <= 0 ? t.payStatuses.PAID : t.payStatuses.PARTIAL;
  return (
    `${t.debtPaymentReceived}\n\n` +
    `👤 <b>${t.patient}:</b> ${escapeTelegramHtml(patient?.name || "—")}\n` +
    (patient?.phone ? `📞 <b>${t.phone}:</b> ${escapeTelegramHtml(patient.phone)}\n` : "") +
    (dentistDisplayName ? `👨‍⚕️ <b>${t.dentist}:</b> ${escapeTelegramHtml(dentistDisplayName)}\n` : "") +
    (appointment?.slotDate ? `📅 <b>${t.date}:</b> ${escapeTelegramHtml(formatUzDate(appointment.slotDate))}\n` : "") +
    `\n💳 <b>${t.paidNow}:</b> ${escapeTelegramHtml(formatMoneyUzs(Math.max(0, Number(paidNow || 0))))}\n` +
    (totalAmount > 0 ? `💰 <b>${t.total}:</b> ${escapeTelegramHtml(formatMoneyUzs(Math.max(0, Number(totalAmount || 0))))}\n` : "") +
    (totalPaid > 0 ? `✅ <b>${t.paid}:</b> ${escapeTelegramHtml(formatMoneyUzs(Math.max(0, Number(totalPaid || 0))))}\n` : "") +
    `⚠️ <b>${t.debt}:</b> ${safeDebt > 0 ? escapeTelegramHtml(formatMoneyUzs(safeDebt)) : t.noDebt}\n` +
    `📋 <b>${t.status}:</b> ${escapeTelegramHtml(payStatusLabel)}\n` +
    `\n<i>${t.footer}</i>`
  );
};

export const buildClinicAppointmentEventMessage = ({ eventType, patient, dentist, appointment, treatment, payment } = {}) => {
  // CLINIC notification → the CLINIC's own configured language (telegramLanguage,
  // kept in sync with the app language by the LanguageSwitcher), NOT the patient's
  // per-chat language. Previously this resolved patient-first via
  // telegramLang(treatment, appointment, patient, dentist), so the dentist's
  // notification inherited the patient's (or a stale) language and showed Russian
  // regardless of the chosen app language. The PATIENT still receives their own
  // language via the patient-facing builders (buildPatientAppointmentCalledMessage,
  // reminder/thank-you builders), which keep passing the patient as a source.
  const lang = telegramLang();
  const t = clinicText1132(lang);
  const totalAmount = Math.max(0, Number(treatment?.amount ?? appointment?.financial?.amount ?? 0));
  const paidAmount = Math.max(0, Number(treatment?.paidAmount ?? appointment?.financial?.paidAmount ?? appointment?.financial?.paid ?? 0));
  const debtAmount = Math.max(0, Number(totalAmount - paidAmount || appointment?.financial?.debt || 0));
  const paidNow = Math.max(0, Number(payment?.amount || 0));

  const dentistDisplayName = formatDentistDisplayName(dentist);
  const clinicTitle1133 =
    eventType === "CLINIC_APPOINTMENT_UPDATED" &&
    String(appointment?.status || "").toUpperCase() === "WAITING" &&
    appointment?.calledAt
      ? (t.calledTitle || t.titles[eventType] || t.defaultTitle)
      : (t.titles[eventType] || t.defaultTitle);

  return (
    `${clinicTitle1133}\n\n` +
    `👤 <b>${t.patient}:</b> ${escapeTelegramHtml(patient?.name || "—")}\n` +
    (patient?.phone ? `📞 <b>${t.phone}:</b> ${escapeTelegramHtml(patient.phone)}\n` : "") +
    (dentistDisplayName ? `👨‍⚕️ <b>${t.dentist}:</b> ${escapeTelegramHtml(dentistDisplayName)}\n` : "") +
    `📅 <b>${t.date}:</b> ${escapeTelegramHtml(formatUzDate(appointment?.slotDate))}\n` +
    `⏰ <b>${t.time}:</b> ${escapeTelegramHtml(formatUzTime(appointment?.slotTime))}\n` +
    `📌 <b>${t.status}:</b> ${escapeTelegramHtml(appointmentStatusLabel(appointment?.status, t))}\n` +
    (totalAmount > 0 ? `💰 <b>${t.total}:</b> ${escapeTelegramHtml(formatMoneyUzs(totalAmount))}\n` : "") +
    (paidNow > 0 ? `✅ <b>${t.paidNow}:</b> ${escapeTelegramHtml(formatMoneyUzs(paidNow))}\n` : "") +
    (paidAmount > 0 ? `💳 <b>${t.paidTotal}:</b> ${escapeTelegramHtml(formatMoneyUzs(paidAmount))}\n` : "") +
    (debtAmount > 0 ? `⚠️ <b>${t.debt}:</b> ${escapeTelegramHtml(formatMoneyUzs(debtAmount))}\n` : "") +
    `\n<i>${t.footer}</i>`
  );
};


const APPOINTMENT_MANUAL_REMINDER_TEXT_1101 = {
  uz: {
    greeting: (name) => 'Assalomu alaykum, <b>' + name + '</b>!',
    title: 'Qabul eslatmasi',
    body: 'Siz uchun klinikada qabul vaqti belgilangan. Iltimos, vaqtida yetib keling.',
    clinic: 'Klinika', dentist: 'Shifokor', date: 'Sana', time: 'Vaqt', address: 'Manzil', map: 'Xaritada ochish', website: 'Veb-sayt', phone: 'Telefon', status: 'Holat', footer: 'Agar kela olmasangiz, klinika bilan bog‘laning.'
  },
  ru: {
    greeting: (name) => 'Здравствуйте, <b>' + name + '</b>!',
    title: 'Напоминание о приёме',
    body: 'Для вас назначен приём в клинике. Пожалуйста, приходите вовремя.',
    clinic: 'Клиника', dentist: 'Врач', date: 'Дата', time: 'Время', address: 'Адрес', map: 'Открыть карту', website: 'Сайт', phone: 'Телефон', status: 'Статус', footer: 'Если вы не сможете прийти, пожалуйста, свяжитесь с клиникой.'
  },
  en: {
    greeting: (name) => 'Hello, <b>' + name + '</b>!',
    title: 'Appointment reminder',
    body: 'You have an appointment scheduled at the clinic. Please arrive on time.',
    clinic: 'Clinic', dentist: 'Doctor', date: 'Date', time: 'Time', address: 'Address', map: 'Open map', website: 'Website', phone: 'Phone', status: 'Status', footer: 'Please contact the clinic if you cannot come.'
  },
  tg: {
    greeting: (name) => 'Ассалому алейкум, <b>' + name + '</b>!',
    title: 'Ёдраскунии қабул',
    body: 'Барои шумо дар клиника вақти қабул муайян шудааст. Лутфан, сари вақт ҳозир шавед.',
    clinic: 'Клиника', dentist: 'Духтур', date: 'Сана', time: 'Вақт', address: 'Суроға', map: 'Кушодани харита', website: 'Веб-сайт', phone: 'Телефон', status: 'Ҳолат', footer: 'Агар ташриф оварда натавонед, лутфан бо клиника тамос гиред.'
  },
};

export const buildAppointmentManualReminderMessage = ({ patient, dentist, appointment, language = '' } = {}) => {
  const lang = normalizeTelegramLanguage1132(language || telegramLang(appointment, patient, dentist));
  const t = APPOINTMENT_MANUAL_REMINDER_TEXT_1101[lang] || APPOINTMENT_MANUAL_REMINDER_TEXT_1101.uz;
  const patientName = escapeTelegramHtml(patient?.name || t.clinic);
  const dentistDisplayName = formatDentistDisplayName(dentist || appointment?.dentistSnapshot || '');
  return (
    t.greeting(patientName) + '\n\n' +
    '🔔 <b>' + escapeTelegramHtml(t.title) + '</b>\n' +
    escapeTelegramHtml(t.body) + '\n\n' +
    '🏥 <b>' + escapeTelegramHtml(t.clinic) + ':</b> ' + escapeTelegramHtml(clinicName()) + '\n' +
    (dentistDisplayName ? '👨‍⚕️ <b>' + escapeTelegramHtml(t.dentist) + ':</b> ' + escapeTelegramHtml(dentistDisplayName) + '\n' : '') +
    (appointment?.slotDate ? '📅 <b>' + escapeTelegramHtml(t.date) + ':</b> ' + escapeTelegramHtml(formatUzDate(appointment.slotDate)) + '\n' : '') +
    (appointment?.slotTime ? '⏰ <b>' + escapeTelegramHtml(t.time) + ':</b> ' + escapeTelegramHtml(formatUzTime(appointment.slotTime)) + '\n' : '') +
    (appointment?.status ? '📌 <b>' + escapeTelegramHtml(t.status) + ':</b> ' + escapeTelegramHtml(appointmentStatusLabel(appointment.status, clinicText1132(lang))) + '\n' : '') +
    (clinicAddress() ? '\n📍 <b>' + escapeTelegramHtml(t.address) + ':</b>\n' + escapeTelegramHtml(clinicAddress()) + '\n' : '') +
    (clinicAddress() && clinicMapUrl() ? '🗺 <a href="' + escapeTelegramHtml(clinicMapUrl()) + '">' + escapeTelegramHtml(t.map) + '</a>\n' : '') +
    (clinicWebsiteUrl() ? '🌐 <a href="' + escapeTelegramHtml(clinicWebsiteUrl()) + '">' + escapeTelegramHtml(t.website || 'Website') + '</a>\n' : '') +
    '\n' +
    escapeTelegramHtml(t.footer)
  );
};

const CLINIC_DAILY_SUMMARY_TEXT_1101 = {
  uz: { title: 'Klinika kunlik hisobot', date: 'Sana', total: 'Jami qabul', completed: 'Yakunlangan', walkIns: 'Jonli navbat', cancelled: 'Bekor qilingan', missed: 'Kelmagan', expected: 'Kutilgan tushum', earned: 'Bajarilgan ish summasi', received: 'Qabul qilingan to‘lov', debt: 'Qolgan qarz', telegram: 'Telegram ulangan', upcoming: 'Kutilayotgan qabullar', patient: 'Bemor', time: 'Vaqt', none: 'Qabul yo‘q' },
  ru: { title: 'Ежедневный отчёт клиники', date: 'Дата', total: 'Всего приёмов', completed: 'Завершено', walkIns: 'Живая очередь', cancelled: 'Отменено', missed: 'Не пришли', expected: 'Ожидаемая выручка', earned: 'Сумма выполненных работ', received: 'Получено оплат', debt: 'Остаток долга', telegram: 'Telegram подключён', upcoming: 'Ожидающие приёмы', patient: 'Пациент', time: 'Время', none: 'Приёмов нет' },
  en: { title: 'Clinic daily report', date: 'Date', total: 'Total appointments', completed: 'Completed', walkIns: 'Walk-ins', cancelled: 'Cancelled', missed: 'Missed', expected: 'Expected revenue', earned: 'Completed work amount', received: 'Payments received', debt: 'Remaining debt', telegram: 'Telegram connected', upcoming: 'Upcoming appointments', patient: 'Patient', time: 'Time', none: 'No appointments' },
  tg: { title: 'Ҳисоботи рӯзонаи клиника', date: 'Сана', total: 'Ҷамъи қабулҳо', completed: 'Анҷомёфта', walkIns: 'Навбати зинда', cancelled: 'Бекоршуда', missed: 'Наомада', expected: 'Даромади пешбинишуда', earned: 'Маблағи корҳои иҷрошуда', received: 'Пардохти қабулшуда', debt: 'Қарзи боқимонда', telegram: 'Telegram пайваст шуд', upcoming: 'Қабулҳои интизорӣ', patient: 'Бемор', time: 'Вақт', none: 'Қабул нест' },
};

export const buildClinicDailySummaryMessage = ({ date, summary = {}, appointments = [], language = '' } = {}) => {
  const lang = normalizeTelegramLanguage1132(language || telegramLang());
  const t = CLINIC_DAILY_SUMMARY_TEXT_1101[lang] || CLINIC_DAILY_SUMMARY_TEXT_1101.uz;
  const c = summary.counts || {};
  const r = summary.revenue || {};
  const nextRows = (Array.isArray(appointments) ? appointments : [])
    .filter((item) => ['UPCOMING', 'CALLED', 'IN_PROGRESS'].includes(String(item.statusBucket || '')))
    .sort((a, b) => String(a.slotTime || '').localeCompare(String(b.slotTime || '')))
    .slice(0, 12);
  const appointmentLines = nextRows.length
    ? nextRows.map((item) => '• ' + escapeTelegramHtml(item.slotTime || '—') + ' — ' + escapeTelegramHtml(item.patient?.name || t.patient) + (item.patient?.phone ? ' (' + escapeTelegramHtml(item.patient.phone) + ')' : '')).join('\n')
    : escapeTelegramHtml(t.none);
  return (
    '📊 <b>' + escapeTelegramHtml(t.title) + '</b>\n\n' +
    '📅 <b>' + escapeTelegramHtml(t.date) + ':</b> ' + escapeTelegramHtml(formatUzDate(date)) + '\n' +
    '📌 <b>' + escapeTelegramHtml(t.total) + ':</b> ' + Number(c.totalBooked || 0) + '\n' +
    '✅ <b>' + escapeTelegramHtml(t.completed) + ':</b> ' + Number(c.completed || 0) + '\n' +
    '🚶 <b>' + escapeTelegramHtml(t.walkIns) + ':</b> ' + Number(c.walkInsHandled || 0) + '\n' +
    '🚫 <b>' + escapeTelegramHtml(t.cancelled) + ':</b> ' + Number(c.cancelled || 0) + '\n' +
    '⚠️ <b>' + escapeTelegramHtml(t.missed) + ':</b> ' + Number(c.missed || 0) + '\n' +
    '🔗 <b>' + escapeTelegramHtml(t.telegram) + ':</b> ' + Number(c.telegramLinked || 0) + '\n\n' +
    '💰 <b>' + escapeTelegramHtml(t.expected) + ':</b> ' + escapeTelegramHtml(formatMoneyUzs(r.expectedRevenue || 0)) + '\n' +
    '🦷 <b>' + escapeTelegramHtml(t.earned) + ':</b> ' + escapeTelegramHtml(formatMoneyUzs(r.earnedAmount || 0)) + '\n' +
    '✅ <b>' + escapeTelegramHtml(t.received) + ':</b> ' + escapeTelegramHtml(formatMoneyUzs(r.receivedRevenue || 0)) + '\n' +
    '⚠️ <b>' + escapeTelegramHtml(t.debt) + ':</b> ' + escapeTelegramHtml(formatMoneyUzs(r.remainingDebt || 0)) + '\n\n' +
    '🗓 <b>' + escapeTelegramHtml(t.upcoming) + '</b>\n' + appointmentLines
  );
};

const ORTHO_PURPOSES = [
  {
    code: "REGULAR_CONTROL",
    labels: { uz: "Oddiy ko'rik", ru: "Обычный осмотр", en: "Regular check-up", tg: "Муоинаи оддӣ" },
    firstVisit: false,
    aliases: ["Oddiy ko'rik", "Oddiy korik", "Normal check up", "Обычный осмотр", "Regular check-up", "Regular checkup", "Navbat", "Навбат", "Очередь", "Queue", "Муоинаи оддӣ"],
  },
  {
    code: "BRACES_ADJUSTMENT",
    labels: { uz: "Breket tortish", ru: "Подтяжка брекетов", en: "Braces adjustment", tg: "Танзими брекетҳо" },
    firstVisit: false,
    aliases: ["Breket tortish", "Breket", "Брекеты", "Подтяжка брекетов", "Braces adjustment", "Braces", "Танзими брекетҳо"],
  },
];

export const buildOrthodontistVisitPurposeKeyboard = (lang = telegramLang()) => {
  const language = normalizeTelegramLanguage1132(lang);
  return {
    keyboard: ORTHO_PURPOSES.map((item) => [{ text: item.labels?.[language] || item.labels?.uz || item.code }]),
    resize_keyboard: true,
    one_time_keyboard: true,
  };
};

const PATIENT_BOOKED_TEXT_1133 = {
  uz: {
    hello: (name) => "Assalomu alaykum, <b>" + name + "</b>!",
    title: "Qabulingiz muvaffaqiyatli belgilandi.",
    body: "Siz uchun klinikamizda qabul band qilindi.",
    clinic: "Klinika",
    dentist: "Shifokor",
    date: "Sana",
    time: "Vaqt",
    queue: "Navbat",
    address: "Manzil",
  },
  ru: {
    hello: (name) => "Здравствуйте, <b>" + name + "</b>!",
    title: "Ваша запись успешно подтверждена.",
    body: "Для вас забронировано время в нашей клинике.",
    clinic: "Клиника",
    dentist: "Врач",
    date: "Дата",
    time: "Время",
    queue: "Очередь",
    address: "Адрес",
  },
  en: {
    hello: (name) => "Hello, <b>" + name + "</b>!",
    title: "Your appointment has been successfully booked.",
    body: "A time slot has been reserved for you at our clinic.",
    clinic: "Clinic",
    dentist: "Doctor",
    date: "Date",
    time: "Time",
    queue: "Queue",
    address: "Address",
  },
  tg: {
    hello: (name) => "Ассалому алейкум, <b>" + name + "</b>!",
    title: "Қабули шумо бомуваффақият сабт шуд.",
    body: "Барои шумо дар клиникаи мо вақт банд карда шуд.",
    clinic: "Клиника",
    dentist: "Духтур",
    date: "Сана",
    time: "Вақт",
    queue: "Навбат",
    address: "Суроға",
  },
};

export const buildPatientAppointmentBookedMessage = ({ patient, dentist, appointment } = {}) => {
  const lang = telegramLang(appointment, patient, dentist);
  const t = PATIENT_BOOKED_TEXT_1133[lang] || PATIENT_BOOKED_TEXT_1133.uz;
  const patientName = escapeTelegramHtml(patient?.name || t.queue);
  const dentistDisplayName = formatDentistDisplayName(dentist || appointment?.dentistSnapshot || "");
  const queueNo = appointment?.queueNo || appointment?.liveQueueNo || appointment?.queueNumber || "";

  return (
    t.hello(patientName) + "\n\n" +
    "🎉 <b>" + escapeTelegramHtml(t.title) + "</b>\n" +
    escapeTelegramHtml(t.body) + "\n\n" +
    "🏥 <b>" + escapeTelegramHtml(t.clinic) + ":</b> " + escapeTelegramHtml(clinicName()) + "\n" +
    (dentistDisplayName ? "👨‍⚕️ <b>" + escapeTelegramHtml(t.dentist) + ":</b> " + escapeTelegramHtml(dentistDisplayName) + "\n" : "") +
    (appointment?.slotDate ? "📅 <b>" + escapeTelegramHtml(t.date) + ":</b> " + escapeTelegramHtml(formatUzDate(appointment.slotDate)) + "\n" : "") +
    (appointment?.slotTime ? "⏰ <b>" + escapeTelegramHtml(t.time) + ":</b> " + escapeTelegramHtml(formatUzTime(appointment.slotTime)) + "\n" : "") +
    (queueNo ? "🎟 <b>" + escapeTelegramHtml(t.queue) + ":</b> #" + escapeTelegramHtml(queueNo) + "\n" : "") +
    (clinicAddress() ? "📍 <b>" + escapeTelegramHtml(t.address) + ":</b> " + escapeTelegramHtml(clinicAddress()) + "\n" : "")
  );
};

const DEBT_REMINDER_TEXT = {
  uz: {
    greeting: (name) => `Assalomu alaykum, hurmatli ${name}!`,
    title: 'Qarz to‘lovi haqida eslatma',
    body: (debt) => `Klinikamizdagi muolajalar bo‘yicha sizda jami <b>${debt}</b> qoldiq qarz mavjud.`,
    politeAsk: 'Iltimos, ushbu qarzni to‘lash yoki davolash rejasini aniqlashtirish uchun klinikamiz bilan bog‘lanishingizni yoki tashrif buyurishingizni so‘raymiz.',
    clinic: 'Klinika',
    phone: 'Telefon',
    footer: 'Sog‘ligingizga befarq bo‘lmaganingiz uchun tashakkur!'
  },
  ru: {
    greeting: (name) => `Здравствуйте, уважаемый(ая) ${name}!`,
    title: 'Напоминание о долге',
    body: (debt) => `Сообщаем вам, что у вас имеется задолженность за лечение на сумму <b>${debt}</b>.`,
    politeAsk: 'Пожалуйста, свяжитесь с нашей клиникой или посетите нас для погашения задолженности или уточнения плана лечения.',
    clinic: 'Клиника',
    phone: 'Телефон',
    footer: 'Спасибо, что заботитесь о своем здоровье вместе с нами!'
  },
  en: {
    greeting: (name) => `Hello, dear ${name}!`,
    title: 'Debt payment reminder',
    body: (debt) => `We would like to remind you that you have an outstanding balance of <b>${debt}</b> for your dental treatments.`,
    politeAsk: 'Please contact our clinic or visit us to settle this balance or clarify your treatment plan.',
    clinic: 'Clinic',
    phone: 'Phone',
    footer: 'Thank you for choosing our clinic and taking care of your health!'
  },
  tg: {
    greeting: (name) => `Ассалому алейкум, бемори гиромӣ ${name}!`,
    title: 'Ёдраскунии пардохти қарз',
    body: (debt) => `Ба таваҷҷӯҳи шумо мерасонем, ки барои муолиҷаҳои гирифтаатон дар клиникаи мо <b>${debt}</b> қарзи боқимонда доред.`,
    politeAsk: 'Лутфан, барои пардохти ин маблағ ё дақиқ кардани нақшаи муолиҷа бо клиника тамос гиред ё ба клиникаи мо ташриф оред.',
    clinic: 'Клиника',
    phone: 'Телефон',
    footer: 'Ташаккур, ки ба саломатии худ бепарво нестед!'
  }
};

export const buildDebtReminderMessage = ({ patient, dentist, appointment, debt, language = '' } = {}) => {
  const lang = normalizeTelegramLanguage1132(language || telegramLang(appointment, patient, dentist));
  const t = DEBT_REMINDER_TEXT[lang] || DEBT_REMINDER_TEXT.uz;
  const patientName = escapeTelegramHtml(patient?.name || 'Bemor');
  const targetDebt = debt !== undefined && debt !== null ? debt : (appointment?.debt || appointment?.financial?.debt || 0);
  const debtAmount = formatMoneyUzs(targetDebt);
  const phoneVal = clinicPhone(dentist);

  return (
    t.greeting(patientName) + '\n\n' +
    '💸 <b>' + escapeTelegramHtml(t.title) + '</b>\n' +
    t.body(debtAmount) + '\n\n' +
    t.politeAsk + '\n\n' +
    '🏥 <b>' + escapeTelegramHtml(t.clinic) + ':</b> ' + escapeTelegramHtml(clinicName()) + '\n' +
    (phoneVal ? '📞 <b>' + escapeTelegramHtml(t.phone) + ':</b> ' + escapeTelegramHtml(phoneVal) + '\n' : '') +
    '\n' +
    escapeTelegramHtml(t.footer)
  );
};

// ─── Advance Payment Thank-You Message ────────────────────────────────────────
// Sent to the patient after their advance payment is confirmed by cashier/receptionist.
export const buildAdvancePaymentThankYouMessage = ({
  patientName = "",
  serviceName = "",
  amount = 0,
  queuePosition = null,
  doctorName = "",
  lang = "uz",
}) => {
  const normalizedLang = ["uz", "ru", "en", "tg"].includes(lang) ? lang : "uz";
  const clinic = clinicName();
  const moneyStr = formatMoneyUzs(amount);

  const T_MAP = {
    uz: {
      greeting: (n) => n ? `Hurmatli <b>${escapeTelegramHtml(n)}</b>!` : "Hurmatli bemor!",
      confirm: "✅ To'lovingiz muvaffaqiyatli qabul qilindi!",
      serviceLabel: "Xizmat",
      amountLabel: "To'lov miqdori",
      queueLabel: (pos) => `Navbatingiz: <b>#${pos}</b>`,
      doctorLabel: "Shifokor",
      clinicLabel: "Klinika",
      thanks: "Klinikamizga tashrif buyurganingiz uchun rahmat! Sizni kutamiz \uD83D\uDE4F",
    },
    ru: {
      greeting: (n) => n ? `Уважаемый(ая) <b>${escapeTelegramHtml(n)}</b>!` : "Уважаемый пациент!",
      confirm: "✅ Ваш платёж успешно принят!",
      serviceLabel: "Услуга",
      amountLabel: "Сумма",
      queueLabel: (pos) => `Ваша очередь: <b>#${pos}</b>`,
      doctorLabel: "Врач",
      clinicLabel: "Клиника",
      thanks: "Спасибо, что обратились к нам! Ждём вас \uD83D\uDE4F",
    },
    en: {
      greeting: (n) => n ? `Dear <b>${escapeTelegramHtml(n)}</b>!` : "Dear patient!",
      confirm: "✅ Your payment has been successfully received!",
      serviceLabel: "Service",
      amountLabel: "Amount",
      queueLabel: (pos) => `Your queue number: <b>#${pos}</b>`,
      doctorLabel: "Doctor",
      clinicLabel: "Clinic",
      thanks: "Thank you for choosing us! We look forward to seeing you \uD83D\uDE4F",
    },
    tg: {
      greeting: (n) => n ? `Мӯҳтарам <b>${escapeTelegramHtml(n)}</b>!` : "Мӯҳтарам бемор!",
      confirm: "✅ Пардохти шумо қабул шуд!",
      serviceLabel: "Хидмат",
      amountLabel: "Маблағ",
      queueLabel: (pos) => `Навбати шумо: <b>#${pos}</b>`,
      doctorLabel: "Духтур",
      clinicLabel: "Клиника",
      thanks: "Ташаккур барои муроҷиат! Мунтазири шумоем \uD83D\uDE4F",
    },
  };

  const t = T_MAP[normalizedLang] || T_MAP.uz;

  let msg = t.greeting(patientName) + "\n\n";
  msg += t.confirm + "\n\n";

  if (serviceName) {
    msg += `\uD83E\uDDB7 <b>${escapeTelegramHtml(t.serviceLabel)}:</b> ${escapeTelegramHtml(serviceName)}\n`;
  }
  if (amount > 0) {
    msg += `\uD83D\uDCB0 <b>${escapeTelegramHtml(t.amountLabel)}:</b> ${escapeTelegramHtml(moneyStr)}\n`;
  }
  if (doctorName) {
    msg += `\uD83D\uDC68\u200D\u2695\uFE0F <b>${escapeTelegramHtml(t.doctorLabel)}:</b> ${escapeTelegramHtml(doctorName)}\n`;
  }
  if (queuePosition) {
    msg += `\uD83D\uDD22 ${t.queueLabel(queuePosition)}\n`;
  }
  msg += `\uD83C\uDFE5 <b>${escapeTelegramHtml(t.clinicLabel)}:</b> ${escapeTelegramHtml(clinic)}\n`;
  msg += "\n" + t.thanks;

  return msg;
};

export const buildDoctorPayrollPaidMessage = ({ amount, periodStart, periodEnd, notes, language = 'uz' }) => {
  const normLang = ["uz", "ru", "en", "tg"].includes(language) ? language : "uz";
  const clinic = clinicName();
  const moneyStr = formatMoneyUzs(amount);

  const T_MAP = {
    uz: {
      title: "💰 Oylik / Komissiya to'lovi",
      body: (amount, start, end) => `Sizga <b>${start}</b> dan <b>${end}</b> gacha bo'lgan davr uchun <b>${amount}</b> komissiya to'lovi to'landi.`,
      notes: "Izoh",
      thanks: "Hamkorligingiz uchun tashrif buyurganingiz uchun rahmat!",
    },
    ru: {
      title: "💰 Выплата зарплаты / комиссии",
      body: (amount, start, end) => `Вам выплачена комиссия в размере <b>${amount}</b> за период с <b>${start}</b> по <b>${end}</b>.`,
      notes: "Примечание",
      thanks: "Спасибо за сотрудничество!",
    },
    en: {
      title: "💰 Payroll / Commission Payout",
      body: (amount, start, end) => `Commission of <b>${amount}</b> has been paid to you for the period from <b>${start}</b> to <b>${end}</b>.`,
      notes: "Notes",
      thanks: "Thank you for your cooperation!",
    },
    tg: {
      title: "💰 Пардохти музди меҳнат / комиссия",
      body: (amount, start, end) => `Ба шумо комиссия ба маблағи <b>${amount}</b> барои давраи аз <b>${start}</b> то <b>${end}</b> пардохт карда шуд.`,
      notes: "Эзоҳ",
      thanks: "Ташаккур барои ҳамкорӣ!",
    }
  };

  const t = T_MAP[normLang] || T_MAP.uz;

  let msg = `<b>${t.title}</b>\n\n`;
  msg += t.body(moneyStr, periodStart, periodEnd) + "\n";
  if (notes) {
    msg += `📝 <b>${t.notes}:</b> ${escapeTelegramHtml(notes)}\n`;
  }
  msg += `\n🏥 <b>Klinika:</b> ${escapeTelegramHtml(clinic)}\n\n`;
  msg += t.thanks;

  return msg;
};

export const buildDentistMaterialStockOutMessage = ({ itemName, qty, unit, reason, note, language = 'uz' }) => {
  const normLang = ["uz", "ru", "en", "tg"].includes(language) ? language : "uz";
  const clinic = clinicName();

  const T_MAP = {
    uz: {
      title: "📦 Omborxona: Chiqim",
      item: "Mahsulot",
      qty: "Miqdor",
      reason: "Sabab",
      note: "Izoh",
      body: "Sizning so'rovingizga asosan ombordan mahsulot chiqim qilindi.",
    },
    ru: {
      title: "📦 Склад: Расход",
      item: "Товар",
      qty: "Количество",
      reason: "Причина",
      note: "Примечание",
      body: "По вашему запросу со склада был произведен расход материалов.",
    },
    en: {
      title: "📦 Warehouse: Stock-Out",
      item: "Item",
      qty: "Quantity",
      reason: "Reason",
      note: "Note",
      body: "Materials have been checked out from the warehouse per your request.",
    },
    tg: {
      title: "📦 Анбор: Масраф",
      item: "Маҳсулот",
      qty: "Миқдор",
      reason: "Сабаб",
      note: "Эзоҳ",
      body: "Мувофиқи дархости шумо аз анбор мавод масраф карда шуд.",
    }
  };

  const t = T_MAP[normLang] || T_MAP.uz;

  let msg = `<b>${t.title}</b>\n\n`;
  msg += `${t.body}\n\n`;
  msg += `🔹 <b>${t.item}:</b> ${escapeTelegramHtml(itemName)}\n`;
  msg += `🔹 <b>${t.qty}:</b> ${qty} ${unit}\n`;
  msg += `🔹 <b>${t.reason}:</b> ${escapeTelegramHtml(reason)}\n`;
  if (note) {
    msg += `📝 <b>${t.note}:</b> ${escapeTelegramHtml(note)}\n`;
  }
  msg += `\n🏥 <b>Klinika:</b> ${escapeTelegramHtml(clinic)}`;

  return msg;
};

export const buildDentistArrivedNotificationMessage = ({ patientName, queueNo, isWalkIn, appointmentType, slotTime, note, language = 'uz' }) => {
  const normLang = ["uz", "ru", "en", "tg"].includes(language) ? language : "uz";

  const T_MAP = {
    uz: {
      title: "👥 Yangi bemor navbatda",
      patient: "Bemor",
      type: "Turi",
      walkIn: "Jonli navbat",
      walkInOrtho: "Jonli navbat (Ortodont)",
      walkInNormal: "Jonli navbat (Oddiy qabul)",
      scheduled: "Rejali uchrashuv",
      queueNo: "Navbat raqami",
      time: "Vaqti",
      note: "Izoh",
      alert: "Bemor klinikamizga keldi va qabulni kutmoqda.",
    },
    ru: {
      title: "👥 Новый пациент в очереди",
      patient: "Пациент",
      type: "Тип",
      walkIn: "Живая очередь",
      walkInOrtho: "Живая очередь (Ортодонт)",
      walkInNormal: "Живая очередь (Обычный прием)",
      scheduled: "Запланированный прием",
      queueNo: "Номер очереди",
      time: "Время",
      note: "Примечание",
      alert: "Пациент прибыл в клинику и ожидает приема.",
    },
    en: {
      title: "👥 New Patient in Queue",
      patient: "Patient",
      type: "Type",
      walkIn: "Live Queue",
      walkInOrtho: "Live Queue (Orthodontic)",
      walkInNormal: "Live Queue (Normal Checkup)",
      scheduled: "Scheduled Appointment",
      queueNo: "Queue Number",
      time: "Time",
      note: "Note",
      alert: "The patient has arrived at the clinic and is waiting.",
    },
    tg: {
      title: "👥 Бемори нав дар навбат",
      patient: "Бемор",
      type: "Намуд",
      walkIn: "Навбати зинда",
      walkInOrtho: "Навбати зинда (Ортодонт)",
      walkInNormal: "Навбати зинда (Қабули оддӣ)",
      scheduled: "Қабули нақшавӣ",
      queueNo: "Рақами навбат",
      time: "Вақт",
      note: "Эзоҳ",
      alert: "Бемор ба клиника омад ва интизори қабул аст.",
    }
  };

  const t = T_MAP[normLang] || T_MAP.uz;

  const typeLabel = isWalkIn
    ? appointmentType === "ORTHODONTIC"
      ? t.walkInOrtho
      : appointmentType === "NORMAL"
      ? t.walkInNormal
      : t.walkIn
    : t.scheduled;

  let msg = `<b>${t.title}</b>\n\n`;
  msg += `👤 <b>${t.patient}:</b> ${escapeTelegramHtml(patientName)}\n`;
  msg += `ℹ️ <b>${t.type}:</b> ${typeLabel}\n`;
  if (isWalkIn && queueNo) {
    msg += `🔢 <b>${t.queueNo}:</b> #${queueNo}\n`;
  }
  if (!isWalkIn && slotTime) {
    msg += `🕒 <b>${t.time}:</b> ${slotTime}\n`;
  }
  if (note) {
    msg += `📝 <b>${t.note}:</b> ${escapeTelegramHtml(note)}\n`;
  }
  msg += `\n📢 <i>${t.alert}</i>`;

  return msg;
};

export const buildDentistNewBookingMessage = ({ patientName, slotDate, slotTime, slotDateFormatted, note, createdFrom = "USER", language = "uz" }) => {
  const normLang = ["uz", "ru", "en", "tg"].includes(language) ? language : "uz";

  const sourceLabel = {
    uz: { USER: "Onlayn (sayt orqali)", ADMIN: "Admin tomonidan", DENTIST: "Shifokor tomonidan" },
    ru: { USER: "Онлайн (через сайт)", ADMIN: "Через администратора", DENTIST: "Через врача" },
    en: { USER: "Online (via website)", ADMIN: "By admin", DENTIST: "By dentist" },
    tg: { USER: "Онлайн (тавассути сайт)", ADMIN: "Тавассути маъмур", DENTIST: "Тавассути духтур" },
  };

  const T_MAP = {
    uz: {
      title: "📅 Yangi rejali uchrashuv",
      patient: "Bemor",
      date: "Sana",
      time: "Vaqt",
      source: "Qo'shildi",
      note: "Izoh",
      alert: "Yangi qabul ro'yxatga olindi. Belgilangan kunda kuting.",
    },
    ru: {
      title: "📅 Новая запись на прием",
      patient: "Пациент",
      date: "Дата",
      time: "Время",
      source: "Добавил",
      note: "Примечание",
      alert: "Новая запись принята. Ожидайте в назначенный день.",
    },
    en: {
      title: "📅 New Appointment Booked",
      patient: "Patient",
      date: "Date",
      time: "Time",
      source: "Added by",
      note: "Note",
      alert: "A new appointment has been recorded. Please expect the patient on the scheduled date.",
    },
    tg: {
      title: "📅 Вохӯрии нақшавии нав",
      patient: "Бемор",
      date: "Сана",
      time: "Вақт",
      source: "Иловакарда",
      note: "Эзоҳ",
      alert: "Вохӯрии нав сабт шуд. Интизори рӯзи муқаррар бошед.",
    },
  };

  const t = T_MAP[normLang] || T_MAP.uz;
  const srcMap = sourceLabel[normLang] || sourceLabel.uz;
  const srcKey = ["USER", "ADMIN", "DENTIST"].includes(createdFrom) ? createdFrom : "USER";

  let msg = `<b>${t.title}</b>\n\n`;
  msg += `👤 <b>${t.patient}:</b> ${escapeTelegramHtml(patientName)}\n`;
  msg += `📆 <b>${t.date}:</b> ${escapeTelegramHtml(slotDateFormatted || formatUzDate(slotDate) || slotDate)}\n`;
  msg += `🕒 <b>${t.time}:</b> ${escapeTelegramHtml(formatUzTime(slotTime) || slotTime)}\n`;
  msg += `🔖 <b>${t.source}:</b> ${srcMap[srcKey]}\n`;
  if (note) {
    msg += `📝 <b>${t.note}:</b> ${escapeTelegramHtml(note)}\n`;
  }
  msg += `\n📢 <i>${t.alert}</i>`;

  return msg;
};

export const buildDentistPaymentReceivedMessage = ({ patientName, amount, debt, note, language = 'uz' }) => {
  const normLang = ["uz", "ru", "en", "tg"].includes(language) ? language : "uz";
  const moneyStr = formatMoneyUzs(amount);
  const debtStr = formatMoneyUzs(debt);

  const T_MAP = {
    uz: {
      title: "💳 To'lov qabul qilindi",
      patient: "Bemor",
      amount: "Hozir to'landi",
      debt: "Qolgan qarz",
      note: "Izoh",
      thanks: "To'lov muvaffaqiyatli tasdiqlandi.",
    },
    ru: {
      title: "💳 Платеж получен",
      patient: "Пациент",
      amount: "Оплачено сейчас",
      debt: "Оставшийся долг",
      note: "Примечание",
      thanks: "Платеж успешно подтвержден.",
    },
    en: {
      title: "💳 Payment Received",
      patient: "Patient",
      amount: "Paid now",
      debt: "Remaining debt",
      note: "Note",
      thanks: "Payment verified successfully.",
    },
    tg: {
      title: "💳 Пардохт қабул шуд",
      patient: "Бемор",
      amount: "Пардохти ҷорӣ",
      debt: "Қарзи боқимонда",
      note: "Эзоҳ",
      thanks: "Пардохт бомуваффақият тасдиқ шуд.",
    }
  };

  const t = T_MAP[normLang] || T_MAP.uz;

  let msg = `<b>${t.title}</b>\n\n`;
  msg += `👤 <b>${t.patient}:</b> ${escapeTelegramHtml(patientName)}\n`;
  msg += `💵 <b>${t.amount}:</b> ${moneyStr}\n`;
  msg += `💸 <b>${t.debt}:</b> ${debtStr}\n`;
  if (note) {
    msg += `📝 <b>${t.note}:</b> ${escapeTelegramHtml(note)}\n`;
  }
  msg += `\n📢 <i>${t.thanks}</i>`;

  return msg;
};

export const buildDentistAppointmentRescheduledMessage = ({
  patientName,
  oldSlotDate,
  oldSlotTime,
  newSlotDate,
  newSlotTime,
  rescheduledByName,
  rescheduledByRole = "ADMIN",
  reason = "",
  language = "uz",
}) => {
  const normLang = ["uz", "ru", "en", "tg"].includes(language) ? language : "uz";

  const roleLabels = {
    uz: { ADMIN: "Admin", DENTIST: "Shifokor", USER: "Bemor" },
    ru: { ADMIN: "Администратор", DENTIST: "Врач", USER: "Пациент" },
    en: { ADMIN: "Admin", DENTIST: "Doctor", USER: "Patient" },
    tg: { ADMIN: "Маъмур", DENTIST: "Духтур", USER: "Бемор" },
  };

  const T_MAP = {
    uz: {
      title: "🔄 Qabul vaqti ko'chirildi",
      patient: "Bemor",
      oldTime: "Eski vaqt",
      newTime: "Yangi vaqt",
      by: "Ko'chirdi",
      reason: "Sabab",
      alert: "Qabul vaqti muvaffaqiyatli yangilandi.",
    },
    ru: {
      title: "🔄 Время приема перенесено",
      patient: "Пациент",
      oldTime: "Старое время",
      newTime: "Новое время",
      by: "Перенес",
      reason: "Причина",
      alert: "Время приема успешно обновлено.",
    },
    en: {
      title: "🔄 Appointment Rescheduled",
      patient: "Patient",
      oldTime: "Old time",
      newTime: "New time",
      by: "Rescheduled by",
      reason: "Reason",
      alert: "Appointment time has been successfully updated.",
    },
    tg: {
      title: "🔄 Вақти қабул кӯчонида шуд",
      patient: "Бемор",
      oldTime: "Вақти кӯҳна",
      newTime: "Вақти нав",
      by: "Кӯчонд",
      reason: "Сабаб",
      alert: "Вақти қабул бомуваффақият нав карда шуд.",
    },
  };

  const t = T_MAP[normLang] || T_MAP.uz;
  const roleMap = roleLabels[normLang] || roleLabels.uz;
  const roleStr = roleMap[rescheduledByRole] || rescheduledByRole;

  let msg = `<b>${t.title}</b>\n\n`;
  msg += `👤 <b>${t.patient}:</b> ${escapeTelegramHtml(patientName)}\n`;
  msg += `🗓 <b>${t.oldTime}:</b> ${formatUzDate(oldSlotDate)} ${formatUzTime(oldSlotTime)}\n`;
  msg += `📅 <b>${t.newTime}:</b> ${formatUzDate(newSlotDate)} ${formatUzTime(newSlotTime)}\n`;
  msg += `👤 <b>${t.by}:</b> ${escapeTelegramHtml(rescheduledByName || roleStr)} (${roleStr})\n`;
  if (reason) {
    msg += `📝 <b>${t.reason}:</b> ${escapeTelegramHtml(reason)}\n`;
  }
  msg += `\n📢 <i>${t.alert}</i>`;

  return msg;
};
