import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";

// ── Clean SVG icons (no emojis) ─────────────────────────────────────────────
const Icon = {
  UserPlus:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
  UserEdit:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M20 8l-5 5-2 2h-2v-2l5-5 4-4z"/></svg>,
  Calendar:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  CalEdit:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M13 16l2 2 4-4"/></svg>,
  CalCancel:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Check:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>,
  CreditCard:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  DoctorPlus:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 2a5 5 0 0 1 5 5v2H7V7a5 5 0 0 1 5-5z"/><path d="M7 9v3a5 5 0 0 0 10 0V9"/><line x1="12" y1="16" x2="12" y2="20"/><line x1="10" y1="18" x2="14" y2="18"/><line x1="19" y1="8" x2="19" y2="12"/><line x1="21" y1="10" x2="17" y2="10"/></svg>,
  DoctorEdit:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 2a5 5 0 0 1 5 5v2H7V7a5 5 0 0 1 5-5z"/><path d="M7 9v3a5 5 0 0 0 10 0V9"/><path d="M18 15l3 3-6 6h-3v-3l6-6z"/></svg>,
  Archive:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
  Refresh:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Filter:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Search:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Clock:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  BarChart:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Users:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};

const ACTION_CONFIG = {
  CREATE_PATIENT:       { dot: "bg-blue-500",   IconComp: Icon.UserPlus },
  EDIT_PATIENT:         { dot: "bg-indigo-500", IconComp: Icon.UserEdit },
  BOOK_APPOINTMENT:     { dot: "bg-emerald-500", IconComp: Icon.Calendar },
  EDIT_APPOINTMENT:     { dot: "bg-amber-500",  IconComp: Icon.CalEdit },
  CANCEL_APPOINTMENT:   { dot: "bg-red-500",    IconComp: Icon.CalCancel },
  CHECKOUT_APPOINTMENT: { dot: "bg-teal-500",   IconComp: Icon.Check },
  COLLECT_PAYMENT:      { dot: "bg-purple-500", IconComp: Icon.CreditCard },
  CREATE_DOCTOR:        { dot: "bg-cyan-500",   IconComp: Icon.DoctorPlus },
  EDIT_DOCTOR:          { dot: "bg-sky-500",    IconComp: Icon.DoctorEdit },
  RETIRE_DOCTOR:        { dot: "bg-orange-500", IconComp: Icon.Archive },
  REACTIVATE_DOCTOR:    { dot: "bg-green-500",  IconComp: Icon.Refresh },
  CREATE_WAREHOUSE_ITEM:{ dot: "bg-cyan-600",   IconComp: Icon.UserPlus },
  WAREHOUSE_STOCK_IN:   { dot: "bg-emerald-600", IconComp: Icon.Refresh },
  WAREHOUSE_STOCK_OUT:  { dot: "bg-amber-600",   IconComp: Icon.Archive },
};

const ROLE_CONFIG = {
  admin:        { color: "bg-slate-700 text-white" },
  receptionist: { color: "bg-indigo-600 text-white" },
  dentist:       { color: "bg-teal-600 text-white" },
  cashier:      { color: "bg-violet-600 text-white" },
};

function formatDateTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  // Always display in Uzbekistan time (UTC+5) as DD-MM-YYYY HH:mm (24h)
  const UZ_OFFSET_MS = 5 * 60 * 60 * 1000;
  const local = new Date(d.getTime() + UZ_OFFSET_MS);
  const pad = (n) => String(n).padStart(2, "0");
  const day   = pad(local.getUTCDate());
  const month = pad(local.getUTCMonth() + 1);
  const year  = local.getUTCFullYear();
  const hour  = pad(local.getUTCHours());
  const min   = pad(local.getUTCMinutes());
  return `${day}-${month}-${year} ${hour}:${min}`;
}

function todayISO() { return new Date().toISOString().split("T")[0]; }
function offsetISO(days) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().split("T")[0]; }
function startOfMonthISO() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`; }
function startOfSeasonISO() { const d = new Date(); const m = d.getMonth(); return `${d.getFullYear()}-${String(Math.floor(m/3)*3+1).padStart(2,"0")}-01`; }
function startOfYearISO() { return `${new Date().getFullYear()}-01-01`; }

const T = {
  uz: {
    auditLogsTitle: "Nazorat Jurnali",
    auditLogsDesc: "Xodimlar faoliyatini kuzating va tahlil qiling",
    period: "Davr",
    start: "Boshlanish",
    end: "Tugash",
    apply: "Qo'llash",
    staffType: "Xodim turi",
    actionType: "Harakat turi",
    search: "Qidirish",
    searchPlaceholder: "Bemor ismi, xodim ismi...",
    refresh: "Yangilash",
    clear: "Tozalash",
    actionLog: "Harakatlar jurnali",
    recordCountText: "{count} ta yozuv",
    loading: "Yuklanmoqda...",
    noRecords: "Yozuv topilmadi",
    noRecordsDesc: "Boshqa davr yoki filtr tanlang",
    time: "Vaqt",
    action: "Harakat",
    staff: "Xodim",
    object: "Ob'ekt",
    details: "Tafsilot",
    staffActivity: "Xodimlar faolligi",
    noData: "Ma'lumot yo'q",
    actionStats: "Harakatlar statistikasi",
    all: "Barchasi",
    allTime: "Barcha vaqt",
    selectDate: "Sana tanlash",
    toastLoadError: "Nazorat jurnalini yuklashda xatolik",
    presets: {
      today: "Bugun",
      "3d": "3 kun",
      "7d": "7 kun",
      "30d": "30 kun",
      thismonth: "Shu oy",
      season: "Chorak",
      year: "Yil",
      all: "Barchasi",
      custom: "Sana tanlash",
    },
    roles: {
      admin: "Admin",
      receptionist: "Qabulxona",
      dentist: "stomatolog",
      cashier: "Kassir",
    },
    actions: {
      CREATE_PATIENT: "Bemor qo'shildi",
      EDIT_PATIENT: "Bemor tahrirlandi",
      BOOK_APPOINTMENT: "Uchrashuv rejalashtirildi",
      EDIT_APPOINTMENT: "Uchrashuv tahrirlandi",
      CANCEL_APPOINTMENT: "Uchrashuv bekor qilindi",
      CHECKOUT_APPOINTMENT: "Qabul yakunlandi",
      COLLECT_PAYMENT: "To'lov qabul qilindi",
      CREATE_DOCTOR: "Mutaxassis qo'shildi",
      EDIT_DOCTOR: "Mutaxassis tahrirlandi",
      RETIRE_DOCTOR: "Mutaxassis arxivlandi",
      REACTIVATE_DOCTOR: "Mutaxassis qayta faollandi",
      CREATE_WAREHOUSE_ITEM: "Yangi material qo'shildi",
      WAREHOUSE_STOCK_IN: "Ombor kirimi bajarildi",
      WAREHOUSE_STOCK_OUT: "Ombor chiqimi bajarildi",
    }
  },
  ru: {
    auditLogsTitle: "Журнал аудита",
    auditLogsDesc: "Отслеживайте и анализируйте действия сотрудников",
    period: "Период",
    start: "Начало",
    end: "Конец",
    apply: "Применить",
    staffType: "Тип сотрудника",
    actionType: "Тип действия",
    search: "Поиск",
    searchPlaceholder: "Имя пациента, имя сотрудника...",
    refresh: "Обновить",
    clear: "Очистить",
    actionLog: "Журнал действий",
    recordCountText: "Записей: {count}",
    loading: "Загрузка...",
    noRecords: "Записи не найдены",
    noRecordsDesc: "Выберите другой период или фильтр",
    time: "Время",
    action: "Действие",
    staff: "Сотрудник",
    object: "Объект",
    details: "Детали",
    staffActivity: "Активность сотрудников",
    noData: "Нет данных",
    actionStats: "Статистика действий",
    all: "Все",
    allTime: "Все время",
    selectDate: "Выбрать дату",
    toastLoadError: "Ошибка при загрузке журнала аудита",
    presets: {
      today: "Сегодня",
      "3d": "3 дня",
      "7d": "7 дней",
      "30d": "30 дней",
      thismonth: "Этот месяц",
      season: "Квартал",
      year: "Год",
      all: "Все",
      custom: "Выбрать дату",
    },
    roles: {
      admin: "Админ",
      receptionist: "Ресепшн",
      dentist: "Врач",
      cashier: "Кассир",
    },
    actions: {
      CREATE_PATIENT: "Добавлен пациент",
      EDIT_PATIENT: "Изменен пациент",
      BOOK_APPOINTMENT: "Запланирован прием",
      EDIT_APPOINTMENT: "Изменен прием",
      CANCEL_APPOINTMENT: "Отменен прием",
      CHECKOUT_APPOINTMENT: "Прием завершен",
      COLLECT_PAYMENT: "Принят платеж",
      CREATE_DOCTOR: "Добавлен специалист",
      EDIT_DOCTOR: "Изменен специалист",
      RETIRE_DOCTOR: "Специалист архивирован",
      REACTIVATE_DOCTOR: "Специалист восстановлен",
      CREATE_WAREHOUSE_ITEM: "Добавлен материал на склад",
      WAREHOUSE_STOCK_IN: "Поступление на склад",
      WAREHOUSE_STOCK_OUT: "Расход со склада",
    }
  },
  en: {
    auditLogsTitle: "Audit Logs",
    auditLogsDesc: "Monitor and analyze staff activities",
    period: "Period",
    start: "Start",
    end: "End",
    apply: "Apply",
    staffType: "Staff Type",
    actionType: "Action Type",
    search: "Search",
    searchPlaceholder: "Patient name, staff name...",
    refresh: "Refresh",
    clear: "Clear",
    actionLog: "Activity Log",
    recordCountText: "{count} records",
    loading: "Loading...",
    noRecords: "No records found",
    noRecordsDesc: "Select another period or filter",
    time: "Time",
    action: "Action",
    staff: "Staff",
    object: "Object",
    details: "Details",
    staffActivity: "Staff Activity",
    noData: "No data",
    actionStats: "Action Statistics",
    all: "All",
    allTime: "All time",
    selectDate: "Select Date",
    toastLoadError: "Error loading audit logs",
    presets: {
      today: "Today",
      "3d": "3 days",
      "7d": "7 days",
      "30d": "30 days",
      thismonth: "This month",
      season: "Quarter",
      year: "Year",
      all: "All",
      custom: "Select Date",
    },
    roles: {
      admin: "Admin",
      receptionist: "Receptionist",
      dentist: "Dentist",
      cashier: "Cashier",
    },
    actions: {
      CREATE_PATIENT: "Patient added",
      EDIT_PATIENT: "Patient edited",
      BOOK_APPOINTMENT: "Appointment booked",
      EDIT_APPOINTMENT: "Appointment edited",
      CANCEL_APPOINTMENT: "Appointment cancelled",
      CHECKOUT_APPOINTMENT: "Appointment finished",
      COLLECT_PAYMENT: "Payment collected",
      CREATE_DOCTOR: "Specialist added",
      EDIT_DOCTOR: "Specialist edited",
      RETIRE_DOCTOR: "Specialist archived",
      REACTIVATE_DOCTOR: "Specialist reactivated",
      CREATE_WAREHOUSE_ITEM: "Warehouse material added",
      WAREHOUSE_STOCK_IN: "Warehouse stock received",
      WAREHOUSE_STOCK_OUT: "Warehouse stock issued",
    }
  },
  tg: {
    auditLogsTitle: "Дафтари назорат",
    auditLogsDesc: "Фаъолияти кормандонро назорат ва таҳлил кунед",
    period: "Давра",
    start: "Оғоз",
    end: "Анҷом",
    apply: "Татбиқ кардан",
    staffType: "Намуди корманд",
    actionType: "Намуди амал",
    search: "Ҷустуҷӯ",
    searchPlaceholder: "Номи бемор, номи корманд...",
    refresh: "Навсозӣ",
    clear: "Тоза кардан",
    actionLog: "Дафтари амалиётҳо",
    recordCountText: "{count} сабт",
    loading: "Боргузорӣ...",
    noRecords: "Сабт ёфт нашуд",
    noRecordsDesc: "Давра ё филтри дигарро интихоб кунед",
    time: "Вақт",
    action: "Амал",
    staff: "Корманд",
    object: "Объект",
    details: "Тафсилот",
    staffActivity: "Фаъолияти кормандон",
    noData: "Маълумот нест",
    actionStats: "Омори амалиётҳо",
    all: "Ҳама",
    allTime: "Ҳамаи вақт",
    selectDate: "Интихоби сана",
    toastLoadError: "Хатогӣ ҳангоми боркунии дафтари назорат",
    presets: {
      today: "Имрӯз",
      "3d": "3 рӯз",
      "7d": "7 рӯз",
      "30d": "30 рӯз",
      thismonth: "Ҳамин моҳ",
      season: "Семоҳа",
      year: "Сол",
      all: "Ҳама",
      custom: "Интихоби сана",
    },
    roles: {
      admin: "Мудир",
      receptionist: "Қабулхона",
      dentist: "Духтур",
      cashier: "Хазинадор",
    },
    actions: {
      CREATE_PATIENT: "Бемор илова шуд",
      EDIT_PATIENT: "Бемор таҳрир шуд",
      BOOK_APPOINTMENT: "Қабул ба нақша гирифта шуд",
      EDIT_APPOINTMENT: "Қабул таҳрир шуд",
      CANCEL_APPOINTMENT: "Қабул лағв шуд",
      CHECKOUT_APPOINTMENT: "Қабул анҷом ёфт",
      COLLECT_PAYMENT: "Пардохт қабул шуд",
      CREATE_DOCTOR: "Мутаaxacсис илова шуд",
      EDIT_DOCTOR: "Мутаaxacсис таҳрир шуд",
      RETIRE_DOCTOR: "Мутаaxacсис бойгонӣ шуд",
      REACTIVATE_DOCTOR: "Мутаaxacсис дубора фаъол шуд",
      CREATE_WAREHOUSE_ITEM: "Маводи нав ба анбор илова шуд",
      WAREHOUSE_STOCK_IN: "Воридоти анбор иҷро шуд",
      WAREHOUSE_STOCK_OUT: "Масрафи анбор иҷро шуд",
    }
  }
};

const T_EXTRA = {
  uz: { exportBtn: "Eksport qilish (CSV)", filterOperator: "Xodim bo'yicha" },
  ru: { exportBtn: "Экспорт в CSV", filterOperator: "По сотруднику" },
  en: { exportBtn: "Export to CSV", filterOperator: "By Employee" },
  tg: { exportBtn: "Экспорт ба CSV", filterOperator: "Аз рӯи корманд" }
};

const PRESETS = [
  { key: "today",     labelKey: "today",     from: () => todayISO(),         to: () => todayISO() },
  { key: "3d",        labelKey: "3d",        from: () => offsetISO(-2),      to: () => todayISO() },
  { key: "7d",        labelKey: "7d",        from: () => offsetISO(-6),      to: () => todayISO() },
  { key: "30d",       labelKey: "30d",       from: () => offsetISO(-29),     to: () => todayISO() },
  { key: "thismonth", labelKey: "thismonth", from: () => startOfMonthISO(),  to: () => todayISO() },
  { key: "season",    labelKey: "season",    from: () => startOfSeasonISO(), to: () => todayISO() },
  { key: "year",      labelKey: "year",      from: () => startOfYearISO(),   to: () => todayISO() },
  { key: "all",       labelKey: "all",       from: () => "",                 to: () => "" },
  { key: "custom",    labelKey: "custom",    from: null,                    to: null },
];

export default function AuditLogs() {
  const [lang, setLang] = useState(localStorage.getItem("language") || "uz");
  const t = useMemo(() => ({
    ...(T[lang] || T.uz),
    ...(T_EXTRA[lang] || T_EXTRA.uz)
  }), [lang]);

  useEffect(() => {
    const handler = () => setLang(localStorage.getItem("language") || "uz");
    window.addEventListener("language-change", handler);
    return () => window.removeEventListener("language-change", handler);
  }, []);

  const { getAuditLogs } = useContext(AdminContext);
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(false);

  const [preset, setPreset]     = useState("thismonth");
  const [dateFrom, setDateFrom] = useState(startOfMonthISO());
  const [dateTo, setDateTo]     = useState(todayISO());
  const [showCustom, setShowCustom] = useState(false);

  const [operatorRole, setOperatorRole] = useState("");
  const [action, setAction]             = useState("");
  const [search, setSearch]             = useState("");
  
  // Custom specific employee filter state
  const [selectedOperatorId, setSelectedOperatorId] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { operatorRole, action, search };
      if (preset === "all") {
        // no date filter
      } else if (preset === "custom") {
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo)   params.dateTo   = dateTo;
      } else {
        const p = PRESETS.find(p => p.key === preset);
        if (p) { const f = p.from(); const tVal = p.to(); if (f) params.dateFrom = f; if (tVal) params.dateTo = tVal; }
      }
      const res = await getAuditLogs(params);
      const fetched = res?.logs || [];
      setLogs(fetched);
    } catch { toast.error(t.toastLoadError); }
    finally { setLoading(false); }
  }, [getAuditLogs, preset, dateFrom, dateTo, operatorRole, action, search, t.toastLoadError]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Client-side dynamic specific operator filtering
  const filteredLogs = useMemo(() => {
    if (!selectedOperatorId) return logs;
    return logs.filter(l => l.operatorId === selectedOperatorId);
  }, [logs, selectedOperatorId]);

  // Extract unique operators list from current logs
  const uniqueOperators = useMemo(() => {
    const map = new Map();
    logs.forEach(l => {
      if (l.operatorId && !map.has(l.operatorId)) {
        map.set(l.operatorId, l.operatorName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [logs]);

  const selectPreset = (key) => {
    setPreset(key);
    if (key === "custom") { setShowCustom(true); }
    else {
      setShowCustom(false);
      const p = PRESETS.find(p => p.key === key);
      if (p && p.from) { setDateFrom(p.from()); setDateTo(p.to()); }
      else { setDateFrom(""); setDateTo(""); }
    }
  };

  // Re-calculate statistics reactively based on filtered logs
  const stats = useMemo(() => {
    const s = {};
    filteredLogs.forEach(l => {
      s[l.action] = (s[l.action] || 0) + 1;
    });
    return s;
  }, [filteredLogs]);

  const byStaff = useMemo(() => {
    const m = {};
    filteredLogs.forEach(l => {
      if (!m[l.operatorId]) m[l.operatorId] = { name: l.operatorName, role: l.operatorRole, count: 0, actions: {} };
      m[l.operatorId].count++;
      m[l.operatorId].actions[l.action] = (m[l.operatorId].actions[l.action] || 0) + 1;
    });
    return m;
  }, [filteredLogs]);

  const activeDateLabel = useMemo(() => {
    if (preset === "all") return t.allTime;
    if (preset === "custom") return dateFrom && dateTo ? `${dateFrom} — ${dateTo}` : t.selectDate;
    return t.presets[preset] || preset;
  }, [preset, dateFrom, dateTo, t.allTime, t.selectDate, t.presets]);

  const topStats = useMemo(() =>
    Object.entries(stats).sort(([,a],[,b]) => b - a), [stats]);
  const maxCount = topStats.length ? topStats[0][1] : 1;

  // Export to CSV utility (Excel friendly UTF-8 with BOM)
  const exportToCsv = () => {
    if (filteredLogs.length === 0) return;
    const headers = ["Time/Vaqt", "Action/Harakat", "Staff/Xodim", "Role/Roli", "Object/Ob'ekt", "Details/Batafsil"];
    const rows = filteredLogs.map(l => [
      formatDateTime(l.createdAt),
      t.actions[l.action] || l.action,
      l.operatorName,
      t.roles[l.operatorRole] || l.operatorRole,
      l.targetName || "",
      l.details || ""
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${String(val || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `medinson_audit_logs_${dateFrom || "all"}_to_${dateTo || "all"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionConfig = (act) => {
    const defaultCfg = { label: act, color: "bg-slate-100 text-slate-600 border-slate-100", dot: "bg-slate-400", IconComp: Icon.Filter };
    const staticCfg = ACTION_CONFIG[act];
    if (!staticCfg) return defaultCfg;
    return {
      ...staticCfg,
      label: t.actions[act] || act,
      color: act === "CREATE_PATIENT" ? "bg-blue-50 text-blue-700 border-blue-100" :
             act === "EDIT_PATIENT" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
             act === "BOOK_APPOINTMENT" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
             act === "EDIT_APPOINTMENT" ? "bg-amber-50 text-amber-700 border-amber-100" :
             act === "CANCEL_APPOINTMENT" ? "bg-red-50 text-red-700 border-red-100" :
             act === "CHECKOUT_APPOINTMENT" ? "bg-teal-50 text-teal-700 border-teal-100" :
             act === "COLLECT_PAYMENT" ? "bg-purple-50 text-purple-700 border-purple-100" :
             act === "CREATE_DOCTOR" ? "bg-cyan-50 text-cyan-700 border-cyan-100" :
             act === "EDIT_DOCTOR" ? "bg-sky-50 text-sky-700 border-sky-100" :
             act === "RETIRE_DOCTOR" ? "bg-orange-50 text-orange-700 border-orange-100" :
             act === "REACTIVATE_DOCTOR" ? "bg-green-50 text-green-700 border-green-100" :
             defaultCfg.color
    };
  };

  const getRoleConfig = (role) => {
    const defaultCfg = { label: role, color: "bg-slate-200 text-slate-700" };
    const staticCfg = ROLE_CONFIG[role];
    if (!staticCfg) return defaultCfg;
    return {
      ...staticCfg,
      label: t.roles[role] || role
    };
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t.auditLogsTitle}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t.auditLogsDesc}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium bg-white border border-slate-200 rounded-xl px-3 py-2">
          <Icon.Clock />
          {activeDateLabel}
        </div>
      </div>

      {/* Date Preset Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{t.period}</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(p => (
            <button
              key={p.key}
              onClick={() => selectPreset(p.key)}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                preset === p.key
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.presets[p.labelKey]}
            </button>
          ))}
        </div>

        {/* Custom date picker */}
        {showCustom && (
          <div className="flex flex-wrap gap-3 items-end mt-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">{t.start}</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">{t.end}</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <button onClick={fetchLogs}
              className="h-9 px-4 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition">
              {t.apply}
            </button>
          </div>
        )}
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[130px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">{t.staffType}</label>
            <select value={operatorRole} onChange={e => { setOperatorRole(e.target.value); setSelectedOperatorId(""); }}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300">
              <option value="">{t.all}</option>
              <option value="admin">{t.roles.admin}</option>
              <option value="receptionist">{t.roles.receptionist}</option>
              <option value="dentist">{t.roles.dentist}</option>
              <option value="cashier">{t.roles.cashier}</option>
            </select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">{t.filterOperator}</label>
            <select value={selectedOperatorId} onChange={e => setSelectedOperatorId(e.target.value)}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300">
              <option value="">{t.all}</option>
              {uniqueOperators
                .filter(op => !operatorRole || byStaff[op.id]?.role === operatorRole)
                .map((op) => (
                  <option key={op.id} value={op.id}>{op.name}</option>
                ))}
            </select>
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">{t.actionType}</label>
            <select value={action} onChange={e => setAction(e.target.value)}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300">
              <option value="">{t.all}</option>
              {Object.keys(ACTION_CONFIG).map((k) => (
                <option key={k} value={k}>{t.actions[k] || k}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">{t.search}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon.Search /></span>
              <input type="text" placeholder={t.searchPlaceholder} value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button onClick={fetchLogs}
              className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2">
              <Icon.Refresh />
              {t.refresh}
            </button>
            <button onClick={() => { setOperatorRole(""); setAction(""); setSearch(""); setSelectedOperatorId(""); selectPreset("today"); }}
              className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-lg transition">
              {t.clear}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 mb-5">
        {Object.keys(ACTION_CONFIG).map((key) => {
          const cfg = getActionConfig(key);
          const Ico = cfg.IconComp;
          const isActive = action === key;
          return (
            <button key={key} onClick={() => setAction(isActive ? "" : key)}
              className={`text-left rounded-xl p-3.5 border transition-all hover:shadow-sm ${
                isActive ? "bg-slate-900 border-slate-900 shadow-md" : "bg-white border-slate-200 hover:border-slate-300"
              }`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${
                isActive ? "bg-white/20" : "bg-slate-100"
              }`}>
                <span className={isActive ? "text-white" : "text-slate-500"}><Ico /></span>
              </div>
              <div className={`text-xl font-black mb-0.5 ${isActive ? "text-white" : "text-slate-800"}`}>
                {stats[key] || 0}
              </div>
              <div className={`text-[9px] font-semibold uppercase leading-tight tracking-wide ${
                isActive ? "text-white/70" : "text-slate-400"
              }`}>
                {cfg.label}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Main Log Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-bold text-slate-800 text-sm">{t.actionLog}</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t.recordCountText.replace("{count}", filteredLogs.length)}
                </p>
              </div>
              {filteredLogs.length > 0 && (
                <button
                  onClick={exportToCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                  title="CSV faylga yuklab olish"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  {t.exportBtn}
                </button>
              )}
            </div>
            {loading ? (
              <div className="py-20 text-center text-slate-400 text-sm animate-pulse">
                {t.loading}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Icon.Filter />
                </div>
                <p className="text-slate-500 font-semibold text-sm">{t.noRecords}</p>
                <p className="text-slate-400 text-xs mt-1">{t.noRecordsDesc}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="py-3 px-4 text-left text-[10px] font-bold uppercase text-slate-400 tracking-wider whitespace-nowrap">{t.time}</th>
                      <th className="py-3 px-4 text-left text-[10px] font-bold uppercase text-slate-400 tracking-wider">{t.action}</th>
                      <th className="py-3 px-4 text-left text-[10px] font-bold uppercase text-slate-400 tracking-wider">{t.staff}</th>
                      <th className="py-3 px-4 text-left text-[10px] font-bold uppercase text-slate-400 tracking-wider">{t.object}</th>
                      <th className="py-3 px-4 text-left text-[10px] font-bold uppercase text-slate-400 tracking-wider">{t.details}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredLogs.map((log, i) => {
                      const aCfg = getActionConfig(log.action);
                      const rCfg = getRoleConfig(log.operatorRole);
                      const Ico = aCfg.IconComp;
                      const isCritical = log.action === "CANCEL_APPOINTMENT" || log.action === "RETIRE_DOCTOR";
                      return (
                        <tr key={i} className={`hover:bg-slate-50/50 transition-colors ${
                          isCritical ? "bg-rose-50/20 border-l-4 border-l-rose-500 hover:bg-rose-50/40" : ""
                        }`}>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                              <Icon.Clock />
                              {formatDateTime(log.createdAt)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold border ${aCfg.color}`}>
                              <Ico />
                              {aCfg.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${rCfg.color}`}>
                                {rCfg.label}
                              </span>
                              <span className="text-xs font-semibold text-slate-700">{log.operatorName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600 font-medium max-w-[120px] truncate">
                            {log.targetName || "—"}
                          </td>
                          <td className="py-3 px-4 text-[11px] text-slate-400 max-w-[160px] truncate" title={log.details}>
                            {log.details || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">

          {/* Staff Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Icon.Users />
              <div>
                <h2 className="font-bold text-slate-800 text-sm">{t.staffActivity}</h2>
                <p className="text-[10px] text-slate-400">{activeDateLabel}</p>
              </div>
            </div>
            {Object.keys(byStaff).length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs font-medium">{t.noData}</div>
            ) : (
              <div className="p-4 space-y-2.5">
                {Object.entries(byStaff)
                  .sort(([,a],[,b]) => b.count - a.count)
                  .map(([id, staff]) => {
                    const rCfg = getRoleConfig(staff.role);
                    return (
                      <div key={id} onClick={() => setOperatorRole(operatorRole === staff.role ? "" : staff.role)}
                        className="rounded-xl border border-slate-100 p-3 cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${rCfg.color}`}>{rCfg.label}</span>
                            <span className="text-xs font-bold text-slate-800 truncate">{staff.name}</span>
                          </div>
                          <span className="text-base font-black text-slate-700 shrink-0 ml-2">{staff.count}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(staff.actions).map(([act, cnt]) => {
                            const cfg = getActionConfig(act);
                            return (
                              <span key={act} className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${cfg.color}`}>
                                {cfg.label.split(" ")[0]} ×{cnt}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Stats Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <Icon.BarChart />
              <h2 className="font-bold text-slate-800 text-sm">{t.actionStats}</h2>
            </div>
            <div className="space-y-2.5">
              {topStats.map(([act, cnt]) => {
                const cfg = getActionConfig(act);
                const pct = Math.round((cnt / maxCount) * 100);
                return (
                  <div key={act}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                        <span className="text-[11px] font-medium text-slate-600 truncate">{cfg.label}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 shrink-0 ml-2">{cnt}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${cfg.dot}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {topStats.length === 0 && (
                <p className="text-slate-400 text-xs text-center py-4">{t.noData}</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
