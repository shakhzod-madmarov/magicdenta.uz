import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext";
import Payroll from "./Payroll.jsx";
import Expenses from "./Expenses.jsx";
import Warehouse from "./Warehouse.jsx";

const T = {
  uz: {
    title: "Sozlamalar va Ma’muriyat",
    tabPayroll: "Ish haqi",
    tabExpenses: "Xarajatlar",
    tabWarehouse: "Omborxona",
    tabTelegram: "Telegram Bot",
    tgTitle: "Telegram Bot Sozlamalari",
    tgToken: "Telegram Bot Token",
    tgTokenPh: "Bot tokenini kiriting (masalan: 123456:ABC...)",
    tgUsername: "Telegram Bot Username",
    tgUsernamePh: "Bot usernamesini kiriting (masalan: magicdenta_bot)",
    clinicAddress: "Klinika manzili",
    clinicAddressPh: "Klinika manzilini kiriting...",
    mapLink: "Xarita havolasi (Yandex/Google)",
    mapPh: "Xarita havolasini kiriting...",
    website: "Klinika sayti",
    websitePh: "Sayt havolasini kiriting...",
    latitude: "Klinika Kengligi (Latitude)",
    longitude: "Klinika Uzunligi (Longitude)",
    coordPh: "Koordinata...",
    radius: "Joylashuv radiusi (metr)",
    radiusPh: "Masalan: 100",
    orthoQueue: "Telegram orqali Ortodont navbati yoqilgan",
    saving: "Saqlanmoqda...",
    saveTg: "Saqlash",
    toastTelegramSaved: "Telegram sozlamalari muvaffaqiyatli saqlandi!",
    toastTelegramSaveError: "Sozlamalarni saqlashda xatolik yuz berdi",
    toastError: "Xatolik",
    tgLang: "Telegram bot tili",
    howToTitle: "Telegram botni qanday sozlash kerak?",
    howTo1: "1. Telegramda @BotFather orqali yangi bot yarating va bot tokenini oling.",
    howTo2: "2. Bot tokeni va usernamesini pastdagi maydonlarga kiriting va saqlang.",
    howTo3: "3. Har qanday shifokor va bemor kartasida 'Telegramni ulash' tugmasini bosib, QR kodni skanerlash orqali akkauntlarini botga bog‘lashi mumkin.",
    tabWorkHours: "Ish vaqtlari",
    tabReset: "Ma'lumotlarni tozalash (0)",
    toastScheduleSaved: "Klinika ish vaqti muvaffaqiyatli saqlandi!",
  },
  ru: {
    title: "Настройки и Администрирование",
    tabPayroll: "Зарплата",
    tabExpenses: "Расходы",
    tabWarehouse: "Склад",
    tabTelegram: "Telegram бот",
    tgTitle: "Настройки Telegram бота",
    tgToken: "Токен Telegram бота",
    tgTokenPh: "Введите токен бота (например: 123456:ABC...)",
    tgUsername: "Имя пользователя Telegram бота",
    tgUsernamePh: "Введите юзернейм бота (например: magicdenta_bot)",
    clinicAddress: "Адрес клиники",
    clinicAddressPh: "Введите адрес...",
    mapLink: "Ссылка на карту (Яндекс/Google)",
    mapPh: "Введите ссылку на карту...",
    website: "Сайт клиники",
    websitePh: "Введите ссылку на сайт...",
    latitude: "Широта клиники (Latitude)",
    longitude: "Долгота клиники (Longitude)",
    coordPh: "Координата...",
    radius: "Радиус геозоны (в метрах)",
    radiusPh: "Например: 100",
    orthoQueue: "Очередь к ортодонту через Telegram включена",
    saving: "Сохранение...",
    saveTg: "Сохранить настройки Telegram",
    toastTelegramSaved: "Настройки Telegram успешно сохранены!",
    toastTelegramSaveError: "Ошибка при сохранении настроек",
    toastError: "Ошибка",
    tgLang: "Язык Telegram бота",
    howToTitle: "Как настроить Telegram-бота?",
    howTo1: "1. Создайте нового бота через @BotFather в Telegram и получите токен.",
    howTo2: "2. Введите токен и имя пользователя в поля ниже и сохраните.",
    howTo3: "3. Любой врач или пациент сможет связать свой аккаунт, отсканировав QR-код в своем профиле.",
    tabWorkHours: "Рабочее время",
    toastScheduleSaved: "Рабочее время клиники успешно сохранено!",
  }
};

const IcoPayroll = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IcoExpenses = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const IcoWarehouse = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const IcoSend = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const IcoClock = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IcoTrash = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IcoEyeOpen = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const IcoEyeClosed = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const EyeBtn = ({ open, onToggle }) => (
  <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
    {open ? <IcoEyeClosed /> : <IcoEyeOpen />}
  </button>
);

const SectionHeader = ({ children, color }) => (
  <div className="flex items-center gap-3">
    <div className={`w-1 h-5 rounded-full ${color}`} />
    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{children}</h3>
  </div>
);

export default function Settings() {
  const { backendUrl, aToken } = useContext(AdminContext);

  const [activeTab, setActiveTab] = useState("payroll");
  const [lang, setLang] = useState(localStorage.getItem("language") || "uz");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const t = T[lang] || T.uz;

  // ── Telegram Bot state
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramBotUsername, setTelegramBotUsername] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [clinicAddress, setClinicAddress] = useState("");
  const [clinicMapUrl, setClinicMapUrl] = useState("");
  const [clinicWebsiteUrl, setClinicWebsiteUrl] = useState("");
  const [clinicLatitude, setClinicLatitude] = useState("");
  const [clinicLongitude, setClinicLongitude] = useState("");
  const [telegramQueueRadiusMeters, setTelegramQueueRadiusMeters] = useState("100");
  const [telegramOrthodontistQueueEnabled, setTelegramOrthodontistQueueEnabled] = useState(false);
  const [telegramLanguage, setTelegramLanguage] = useState("uz");

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/settings`, {
        headers: { atoken: aToken }
      });
      if (data?.success) {
        const s = data.settings || {};
        setTelegramBotToken(s.telegramBotToken || "");
        setTelegramBotUsername(s.telegramBotUsername || "");
        setClinicAddress(s.clinicAddress || "");
        setClinicMapUrl(s.clinicMapUrl || "");
        setClinicWebsiteUrl(s.clinicWebsiteUrl || "");
        setClinicLatitude(s.clinicLatitude || "");
        setClinicLongitude(s.clinicLongitude || "");
        setTelegramQueueRadiusMeters(s.telegramQueueRadiusMeters || "100");
        setTelegramOrthodontistQueueEnabled(!!s.telegramOrthodontistQueueEnabled);
        setTelegramLanguage(s.telegramLanguage || "uz");
      }
    } catch (e) {
      console.warn("fetchSettings error:", e);
    }
  };

  useEffect(() => {
    if (aToken) {
      fetchSettings();
    }
  }, [aToken]);

  useEffect(() => {
    const handler = () => setLang(localStorage.getItem("language") || "uz");
    window.addEventListener("language-change", handler);
    return () => window.removeEventListener("language-change", handler);
  }, []);

  const handleUpdateTelegram = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/settings/telegram`, {
        telegramBotToken,
        telegramBotUsername,
        clinicAddress,
        clinicMapUrl,
        clinicWebsiteUrl,
        clinicLatitude,
        clinicLongitude,
        telegramQueueRadiusMeters,
        telegramOrthodontistQueueEnabled,
        telegramLanguage,
      }, {
        headers: { atoken: aToken }
      });
      if (data?.success) {
        toast.success(data.message || t.toastTelegramSaved);
        fetchSettings();
      } else {
        toast.error(data?.message || t.toastError);
      }
    } catch (err) {
      toast.error(t.toastTelegramSaveError);
    } finally {
      setIsLoading(false);
    }
  };

  const TAB_ITEMS = [
    { key: "payroll", Icon: IcoPayroll, label: t.tabPayroll },
    { key: "expenses", Icon: IcoExpenses, label: t.tabExpenses },
    { key: "warehouse", Icon: IcoWarehouse, label: t.tabWarehouse },
    { key: "telegram", Icon: IcoSend, label: t.tabTelegram },
    { key: "workhours", Icon: IcoClock, label: t.tabWorkHours },
  ];

  const card = "bg-white border border-slate-200 rounded-3xl shadow-sm";
  const inputCls = "w-full h-11 px-4 border border-slate-200 rounded-xl outline-none text-slate-800 text-sm focus:border-primary transition-all bg-slate-50/50 focus:bg-white";

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        
        {/* Page title */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-primary rounded-full" />
          <h1 className="text-2xl font-black text-slate-800">{t.title}</h1>
        </div>

        {/* Horizontal Navigation Tabs */}
        <nav className={`w-full ${card} p-1.5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap`}>
          {TAB_ITEMS.map(({ key, Icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
                activeTab === key
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="w-full space-y-4">
          {activeTab === "payroll" && <Payroll />}
          {activeTab === "expenses" && <Expenses />}
          {activeTab === "warehouse" && <Warehouse />}
          {activeTab === "workhours" && <ClinicScheduleEditor />}

          {activeTab === "reset" && (
            <div className={`${card} p-6 space-y-5 border-rose-200 bg-rose-50/20`}>
              <SectionHeader color="bg-rose-500">
                {lang === "ru" ? "Очистка данных системы (Reset 0)" : "Tizim ma'lumotlarini tozalash (Reset 0)"}
              </SectionHeader>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2 text-sm">
                <p className="font-bold">⚠️ {lang === "ru" ? "Внимание! Это действие необратимо." : "Diqqat! Ushbu amal qaytarilmaydi."}</p>
                <p>
                  {lang === "ru"
                    ? "Нажатие этой кнопки полностью удалит всех пациентов, приемы, истории болезней, оплаты и очереди. Аккаунты врачей и их настройки останутся НЕЗАТРОНУТЫМИ."
                    : "Ushbu tugmani bosish barcha bemorlar, qabullar, to'lovlar va navbatlarni to'liq o'chiradi. Shifokorlar akkauntlari va sozlamalari TEGISHMASDAN saqlanadi."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetPatientData}
                disabled={isResetting}
                className="w-full sm:w-auto px-6 h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <IcoTrash />
                <span>
                  {isResetting
                    ? (lang === "ru" ? "Очистка..." : "Tozalanmoqda...")
                    : (lang === "ru" ? "Очистить все данные пациентов (0)" : "Barcha bemorlar ma'lumotlarini tozalash (0)")}
                </span>
              </button>
            </div>
          )}

            {activeTab === "telegram" && (
              <form onSubmit={handleUpdateTelegram} className={`${card} p-6 space-y-5`}>
                <SectionHeader color="bg-sky-500">{t.tgTitle}</SectionHeader>

                {/* Status indicator */}
                <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
                  telegramBotToken && telegramBotUsername
                    ? "bg-green-50/50 border-green-200"
                    : "bg-amber-50/50 border-amber-200"
                }`}>
                  <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                    telegramBotToken && telegramBotUsername ? "bg-green-500" : "bg-amber-500"
                  }`} />
                  <div>
                    <p className={`text-xs font-bold ${
                      telegramBotToken && telegramBotUsername ? "text-green-800" : "text-amber-800"
                    }`}>
                      {telegramBotToken && telegramBotUsername
                        ? `✅ Bot faol: @${telegramBotUsername}`
                        : "⏳ Telegram sozlanmagan. Iltimos, quyida token va bot nomini kiriting."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label={t.tgToken}>
                    <div className="relative">
                      <input
                        type={showToken ? "text" : "password"}
                        value={telegramBotToken}
                        onChange={(e) => setTelegramBotToken(e.target.value)}
                        placeholder={t.tgTokenPh}
                        className={`${inputCls} pr-12 font-mono text-xs`}
                      />
                      <EyeBtn open={showToken} onToggle={() => setShowToken(!showToken)} />
                    </div>
                  </Field>

                  <Field label={t.tgUsername}>
                    <div className="space-y-1">
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-slate-400 font-bold text-sm select-none">@</span>
                        <input
                          type="text"
                          value={telegramBotUsername.replace(/^@/, "")}
                          onChange={(e) => setTelegramBotUsername(e.target.value.replace(/^@/, "").trim())}
                          placeholder="magicdenta_bot"
                          className={`${inputCls} pl-8`}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {lang === "ru"
                          ? "Имя бота в Telegram обязательно оканчивается на _bot (например: magicdenta_bot)"
                          : "Telegram bot usernamesi albatta _bot bilan tugashi kerak (masalan: magicdenta_bot)"}
                      </p>
                    </div>
                  </Field>
                </div>

                <SectionHeader color="bg-indigo-500">Klinika Ma’lumotlari (Botda foydalaniladi)</SectionHeader>

                <Field label={t.clinicAddress}>
                  <input
                    type="text"
                    value={clinicAddress}
                    onChange={(e) => setClinicAddress(e.target.value)}
                    placeholder={t.clinicAddressPh}
                    className={inputCls}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t.mapLink}>
                    <input
                      type="text"
                      value={clinicMapUrl}
                      onChange={(e) => setClinicMapUrl(e.target.value)}
                      placeholder={t.mapPh}
                      className={inputCls}
                    />
                  </Field>
                  <Field label={t.website}>
                    <input
                      type="text"
                      value={clinicWebsiteUrl}
                      onChange={(e) => setClinicWebsiteUrl(e.target.value)}
                      placeholder={t.websitePh}
                      className={inputCls}
                    />
                  </Field>
                  <Field label={t.latitude}>
                    <input
                      type="text"
                      value={clinicLatitude}
                      onChange={(e) => setClinicLatitude(e.target.value)}
                      placeholder={t.coordPh}
                      className={inputCls}
                    />
                  </Field>
                  <Field label={t.longitude}>
                    <input
                      type="text"
                      value={clinicLongitude}
                      onChange={(e) => setClinicLongitude(e.target.value)}
                      placeholder={t.coordPh}
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t.radius}>
                    <input
                      type="text"
                      value={telegramQueueRadiusMeters}
                      onChange={(e) => setTelegramQueueRadiusMeters(e.target.value)}
                      placeholder={t.radiusPh}
                      className={inputCls}
                    />
                  </Field>
                  <Field label={t.tgLang}>
                    <select
                      value={telegramLanguage}
                      onChange={(e) => setTelegramLanguage(e.target.value)}
                      className={inputCls}
                    >
                      <option value="uz">O'zbekcha (UZ)</option>
                      <option value="ru">Русский (RU)</option>
                    </select>
                  </Field>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <input
                    type="checkbox"
                    id="orthoQ"
                    checked={telegramOrthodontistQueueEnabled}
                    onChange={(e) => setTelegramOrthodontistQueueEnabled(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="orthoQ" className="text-xs text-slate-600 leading-relaxed select-none cursor-pointer font-bold">
                    {t.orthoQueue}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold transition shadow-md shadow-sky-500/10 active:scale-98 disabled:opacity-50"
                >
                  {isLoading ? t.saving : t.saveTg}
                </button>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider">{t.howToTitle}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.howTo1}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.howTo2}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.howTo3}</p>
                </div>
              </form>
            )}
        </div>

      </div>
    </main>
  );
}

function ClinicScheduleEditor() {
  const { backendUrl, aToken } = useContext(AdminContext);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem("language") || "uz");

  useEffect(() => {
    const handler = () => setLang(localStorage.getItem("language") || "uz");
    window.addEventListener("language-change", handler);
    return () => window.removeEventListener("language-change", handler);
  }, []);

  const DAYS = lang === "ru"
    ? ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]
    : ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/settings/clinic-schedule`, {
        headers: { atoken: aToken }
      });
      if (data?.success) {
        setSchedule(data.workingSchedule || []);
      }
    } catch (error) {
      toast.error("Ish vaqtini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (aToken) {
      fetchSchedule();
    }
  }, [aToken]);

  const handleToggleOpen = (index) => {
    const next = [...schedule];
    next[index] = { ...next[index], isOpen: !next[index].isOpen };
    setSchedule(next);
  };

  const handleTimeChange = (index, field, value) => {
    const next = [...schedule];
    next[index] = { ...next[index], [field]: value };
    setSchedule(next);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await axios.post(
        `${backendUrl}/api/admin/settings/clinic-schedule`,
        { workingSchedule: schedule },
        { headers: { atoken: aToken } }
      );
      if (data?.success) {
        toast.success(lang === "ru" ? "Рабочее время клиники успешно сохранено!" : "Klinika ish vaqti muvaffaqiyatli saqlandi!");
        fetchSchedule();
      } else {
        toast.error(data?.message || "Xatolik yuz berdi");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center text-slate-500 text-sm">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-5 rounded-full bg-sky-500" />
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          {lang === "ru" ? "Рабочее время клиники" : "Klinika ish vaqti sozlamalari"}
        </h3>
      </div>

      <div className="space-y-4">
        {schedule.map((item, idx) => {
          return (
            <div key={item.day} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`day-${item.day}`}
                  checked={item.isOpen}
                  onChange={() => handleToggleOpen(idx)}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor={`day-${item.day}`} className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                  {DAYS[item.day]}
                </label>
              </div>

              {item.isOpen ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={item.start}
                    onChange={(e) => handleTimeChange(idx, "start", e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-primary"
                  />
                  <span className="text-slate-400">—</span>
                  <input
                    type="time"
                    value={item.end}
                    onChange={(e) => handleTimeChange(idx, "end", e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-primary"
                  />
                </div>
              ) : (
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                  {lang === "ru" ? "Выходной" : "Dam olish kuni"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-12 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold transition shadow-md shadow-sky-500/10 active:scale-98 disabled:opacity-50"
      >
        {saving ? (lang === "ru" ? "Сохранение..." : "Saqlanmoqda...") : (lang === "ru" ? "Сохранить" : "Saqlash")}
      </button>
    </div>
  );
}
