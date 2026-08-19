import { useEffect, useMemo, useRef, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { DentistContext } from "../context/DentistContext";
import TelegramPatientConnectModal from "./TelegramPatientConnectModal.jsx";

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 75, 90, 105, 120];

const digitsOnly = (v) => String(v ?? "").replace(/\D/g, "");
const pad2 = (n) => String(n).padStart(2, "0");

const formatPhoneInput = (value = "") => {
  let d = digitsOnly(value);
  const country = localStorage.getItem("medinson:country") || "UZ";
  if (country === "RU") {
    if (d.startsWith("7") && d.length > 10) d = d.slice(1);
    else if (d.startsWith("8") && d.length > 10) d = d.slice(1);
    d = d.slice(0, 10);
    const a = d.slice(0, 3);
    const b = d.slice(3, 6);
    const c = d.slice(6, 8);
    const e = d.slice(8, 10);
    let out = "+7";
    if (a) out += ` (${a}`;
    if (a.length === 3) out += ")";
    if (b) out += ` ${b}`;
    if (c) out += `-${c}`;
    if (e) out += `-${e}`;
    return out;
  } else if (country === "TJ") {
    if (d.startsWith("992")) d = d.slice(3);
    d = d.slice(0, 9);
    const a = d.slice(0, 2);
    const b = d.slice(2, 5);
    const c = d.slice(5, 9);
    let out = "+992";
    if (a) out += ` (${a}`;
    if (a.length === 2) out += ")";
    if (b) out += ` ${b}`;
    if (c) out += ` ${c}`;
    return out;
  } else {
    if (d.startsWith("998")) d = d.slice(3);
    d = d.slice(0, 9);
    const a = d.slice(0, 2);
    const b = d.slice(2, 5);
    const c = d.slice(5, 7);
    const e = d.slice(7, 9);
    let out = "+998";
    if (a) out += ` (${a}`;
    if (a.length === 2) out += ")";
    if (b) out += ` ${b}`;
    if (c) out += `-${c}`;
    if (e) out += `-${e}`;
    return out;
  }
};

const normalizePhone = (v = "") => {
  const country = localStorage.getItem("medinson:country") || "UZ";
  const d = digitsOnly(v);
  if (country === "RU") {
    if (d.length === 10) return `+7${d}`;
    if (d.length === 11 && (d.startsWith("7") || d.startsWith("8"))) return `+7${d.slice(1)}`;
  } else if (country === "TJ") {
    if (d.length === 9) return `+992${d}`;
    if (d.length === 12 && d.startsWith("992")) return `+${d}`;
  } else {
    if (d.length === 9) return `+998${d}`;
    if (d.length === 12 && d.startsWith("998")) return `+${d}`;
  }
  return "";
};

// Format ISO date YYYY-MM-DD → DD-MM-YYYY for display
const isoToDMY = (iso = "") => {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

const WEEKDAYS = {
  uz: ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"],
  ru: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  tg: ["Якшанбе", "Душанбе", "Сешанбе", "Чоршанбе", "Панҷшанбе", "Ҷумъа", "Шанбе"]
};

const T = {
  uz: {
    roomDoctor: "Shifokor xonasi",
    reception: "Qabulxona",
    modalTitle: "Rejali uchrashuv yaratish",
    modalDesc: "Bemor va vaqtni tanlang. Hozirgi navbat holatini ko'rishingiz mumkin.",
    patientSearchPlaceholder: "Ism, telefon raqami yoki bemor ID...",
    searching: "Qidirilmoqda...",
    patientNotFound: "Bemor topilmadi. Yangi bemor sifatida qo'shish:",
    fullNamePlaceholder: "Ism familiya",
    creating: "Yaratilmoqda...",
    createAndSelect: "✚ Yangi bemor yaratish va tanlash",
    doctorLabel: "Shifokor (mutaxassis)",
    noActiveDoctors: "Faol shifokorlar topilmadi",
    noteLabel: "Izoh (ixtiyoriy)",
    notePlaceholder: "Masalan: bemor qo'ng'iroq qildi, tish og'rig'i bor, birinchi tashrif...",
    dateTimeLabel: "Sana va Bo'sh Vaqtlar",
    startDateLabel: "Boshlanish sanasi",
    selectedLabel: "Tanlangan",
    durationLabel: "Qabul davomiyligi",
    minutesLabel: "daqiqa",
    liveQueueConflictTitle: "Jonli Navbatda Kutish Mavjud",
    liveQueueConflictDesc: "Hozirda shifokor xonasida {count} ta bemor navbatda kutmoqda.",
    longestWaitLabel: "Eng uzoq kutgan bemor: {hours} soat {minutes} daqiqadan beri kutmoqda!",
    waitingPatientsList: "Kutish navbatidagilar:",
    waitedMinutes: "min kutdi",
    scheduleCalendarTitle: "Jadval taqvimi (Bo'sh vaqtni tanlang)",
    free: "Bo'sh",
    busy: "Band",
    loadingSchedule: "Haftalik taqvim yuklanmoqda...",
    selectDoctorPrompt: "Boshlanish sanasini tanlang",
    freeSlotsCount: "{count} bo'sh",
    cancel: "Bekor qilish",
    saveBooking: "✓ Uchrashuvni saqlash",
    saving: "Saqlanmoqda...",
    bookedSlotDetails: "Band slot ma'lumotlari",
    patientName: "Bemor",
    phone: "Tel",
    type: "Turi",
    liveQueueType: "Jonli navbat",
    scheduledType: "Rejali qabul",
    cancelBookingBtn: "Uchrashuvni bekor qilish",
    cancelConfirmPrompt: "🔐 Uchrashuvni bekor qilishni xohlaysizmi?",
    passwordRequired: "Parol kiritilishi shart",
    cancelSuccess: "Uchrashuv bekor qilindi",
    changePatient: "Almashtirish",
    emptyDoctor: "Mutaxassis",
  },
  ru: {
    roomDoctor: "Кабинет врача",
    reception: "Регистратура",
    modalTitle: "Создать запись на прием",
    modalDesc: "Выберите пациента и время. Вы можете просмотреть текущий статус очереди.",
    patientSearchPlaceholder: "Имя, номер телефона или ID пациента...",
    searching: "Поиск...",
    patientNotFound: "Пациент не найден. Добавить как нового:",
    fullNamePlaceholder: "Имя и фамилия",
    creating: "Создание...",
    createAndSelect: "✚ Создать и выбрать нового пациента",
    doctorLabel: "Врач (специалист)",
    noActiveDoctors: "Активные врачи не найдены",
    noteLabel: "Примечание (опционально)",
    notePlaceholder: "Например: пациент звонил, зубная боль, первый визит...",
    dateTimeLabel: "Дата и свободное время",
    startDateLabel: "Дата начала",
    selectedLabel: "Выбрано",
    durationLabel: "Длительность приема",
    minutesLabel: "минут",
    liveQueueConflictTitle: "В живой очереди есть ожидание",
    liveQueueConflictDesc: "В настоящее время в кабинете врача ожидают {count} пациентов.",
    longestWaitLabel: "Самое долгое ожидание: {hours} ч {minutes} мин!",
    waitingPatientsList: "Ожидающие в очереди:",
    waitedMinutes: "мин ожидания",
    scheduleCalendarTitle: "Календарь расписания (выберите свободное время)",
    free: "Свободно",
    busy: "Занято",
    loadingSchedule: "Загрузка календаря...",
    selectDoctorPrompt: "Выберите дату начала",
    freeSlotsCount: "{count} своб.",
    cancel: "Отмена",
    saveBooking: "✓ Сохранить запись",
    saving: "Сохранение...",
    bookedSlotDetails: "Данные занятого слота",
    patientName: "Пациент",
    phone: "Тел",
    type: "Тип",
    liveQueueType: "Живая очередь",
    scheduledType: "Запись на прием",
    cancelBookingBtn: "Отменить запись",
    changePatient: "Изменить",
    emptyDoctor: "Специалист",
  },
  en: {
    roomDoctor: "Doctor Room",
    reception: "Reception",
    modalTitle: "Create Scheduled Appointment",
    modalDesc: "Select patient and time. You can view current queue status.",
    patientSearchPlaceholder: "Name, phone number or patient ID...",
    searching: "Searching...",
    patientNotFound: "Patient not found. Add as new:",
    fullNamePlaceholder: "Full Name",
    creating: "Creating...",
    createAndSelect: "✚ Create & Select New Patient",
    doctorLabel: "Doctor (Specialist)",
    noActiveDoctors: "No active doctors found",
    noteLabel: "Note (Optional)",
    notePlaceholder: "e.g. patient called, toothache, first visit...",
    dateTimeLabel: "Date & Free Slots",
    startDateLabel: "Start Date",
    selectedLabel: "Selected",
    durationLabel: "Duration",
    minutesLabel: "minutes",
    liveQueueConflictTitle: "Live Queue Waiting Exist",
    liveQueueConflictDesc: "Currently there are {count} patients waiting in the queue.",
    longestWaitLabel: "Longest wait: {hours}h {minutes}m waiting!",
    waitingPatientsList: "Patients waiting:",
    waitedMinutes: "min waited",
    scheduleCalendarTitle: "Schedule Calendar (Choose free slot)",
    free: "Free",
    busy: "Busy",
    loadingSchedule: "Loading calendar...",
    selectDoctorPrompt: "Select start date",
    freeSlotsCount: "{count} free",
    cancel: "Cancel",
    saveBooking: "✓ Save Appointment",
    saving: "Saving...",
    bookedSlotDetails: "Booked Slot Details",
    patientName: "Patient",
    phone: "Phone",
    type: "Type",
    liveQueueType: "Live Queue",
    scheduledType: "Scheduled",
    cancelBookingBtn: "Cancel Appointment",
    changePatient: "Change",
    emptyDoctor: "Doctor",
  },
  tg: {
    roomDoctor: "Хонаи духтур",
    reception: "Қабулхона",
    modalTitle: "Иловаи қабули нақшавӣ",
    modalDesc: "Бемор ва вақтро интихоб кунед. Шумо метавонед ҳолати навбатиро бинед.",
    patientSearchPlaceholder: "Ном, рақами телефон ё ID-и бемор...",
    searching: "Ҷустуҷӯ...",
    patientNotFound: "Бемор ёфт нашуд. Илова ҳамчун бемори нав:",
    fullNamePlaceholder: "Ном ва насаб",
    creating: "Сохта истодааст...",
    createAndSelect: "✚ Сохтан ва интихоби бемори нав",
    doctorLabel: "Духтур (мутахассис)",
    noActiveDoctors: "Духтурони фаъол ёфт нашуданд",
    noteLabel: "Қайд (ихтиёрӣ)",
    notePlaceholder: "Масаlan: бемор занг зад, дарди дандон, ташрифи аввал...",
    dateTimeLabel: "Сана ва вақти холӣ",
    startDateLabel: "Санаи оғоз",
    selectedLabel: "Интихобшуда",
    durationLabel: "Давомнокии қабул",
    minutesLabel: "дақиқа",
    liveQueueConflictTitle: "Интизорӣ дар навбати фаврӣ ҳаст",
    liveQueueConflictDesc: "Ҳоло дар хонаи духтур {count} бемор навбатро интизоранд.",
    longestWaitLabel: "Интизории тӯлонитарин: {hours} соат {minutes} дақиқа интизор аст!",
    waitingPatientsList: "Интизорон дар навбат:",
    waitedMinutes: "дақ интизор шуд",
    scheduleCalendarTitle: "Тақвими ҷадвал (вақти холиро интихоб кунед)",
    free: "Холӣ",
    busy: "Банд",
    loadingSchedule: "Ҷадвал боргузорӣ мешавад...",
    selectDoctorPrompt: "Санаи оғозро интихоб кунед",
    freeSlotsCount: "{count} холӣ",
    cancel: "Рад кардан",
    saveBooking: "✓ Захираи вохӯрӣ",
    saving: "Захира шуда истодааст...",
    bookedSlotDetails: "Маълумоти вақти бандшуда",
    patientName: "Бемор",
    phone: "Тел",
    type: "Намуд",
    liveQueueType: "Навбати фаврӣ",
    scheduledType: "Қабули нақшавӣ",
    cancelBookingBtn: "Лағви вохӯрӣ",
    changePatient: "Иваз кардан",
    emptyDoctor: "Мутахассис",
  }
};

const ManualBookingModal = ({
  open,
  onClose,
  onSubmit,
  rescheduleAppointment = null,
}) => {
  const {
    backendUrl,
    dToken,
    profile,
    lookupPatient,
    createPatient,
  } = useContext(DentistContext);

  const authHeader = useMemo(() => ({ headers: { dtoken: dToken } }), [dToken]);

  const [lang, setLang] = useState(localStorage.getItem("language") || "uz");
  const [selectedBusyApp, setSelectedBusyApp] = useState(null);
  const t = T[lang] || T.uz;

  useEffect(() => {
    const handler = () => setLang(localStorage.getItem("language") || "uz");
    window.addEventListener("language-change", handler);
    return () => window.removeEventListener("language-change", handler);
  }, []);

  const isoToWeekdayLocal = (iso = "") => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const dayIndex = date.getUTCDay();
    return (WEEKDAYS[lang] || WEEKDAYS.uz)[dayIndex];
  };

  // Patient state
  const [patientSearch, setPatientSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", phone: "" });
  const [isCreating, setIsCreating] = useState(false);

  // Booking state
  const [calendarStartDate, setCalendarStartDate] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showTelegramConnect, setShowTelegramConnect] = useState(false);
  const [telegramLink, setTelegramLink] = useState("");
  const [telegramTokenHash, setTelegramTokenHash] = useState("");
  const [connectPatient, setConnectPatient] = useState(null);
  const [pendingCloseFn, setPendingCloseFn] = useState(null);

  useEffect(() => {
    if (!telegramLink || !telegramTokenHash || !connectPatient?._id || !showTelegramConnect) return undefined;
    let intervalId = setInterval(async () => {
      try {
        const { data: resp } = await axios.get(
          `${backendUrl}/api/admin/patients/${connectPatient._id}/telegram-check`,
          { headers: { dtoken: dToken } }
        );
        if (resp?.success && resp?.linked) {
          setTelegramLink("");
          setTelegramTokenHash("");
          setShowTelegramConnect(false);
          toast.success("Telegram muvaffaqiyatli ulandi!");
          if (pendingCloseFn) {
            pendingCloseFn();
          }
        }
      } catch (err) {
        console.error("Error polling telegram check status:", err);
      }
    }, 3000);
    return () => clearInterval(intervalId);
  }, [telegramLink, telegramTokenHash, connectPatient?._id, showTelegramConnect, backendUrl, dToken, pendingCloseFn]);

  const handleTelegramModalClose = () => {
    setShowTelegramConnect(false);
    if (pendingCloseFn) {
      pendingCloseFn();
    }
  };

  // Live schedule & queue state
  const [scheduleData, setScheduleData] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const searchDebounceRef = useRef(null);

  const doctorId = profile?._id;
  const lockedDoctorName = profile?.name || "Shifokor xonasi";

  const hasInitializedRef = useRef(false);

  // Initialize defaults on open
  useEffect(() => {
    if (!open) {
      hasInitializedRef.current = false;
      return;
    }
    if (hasInitializedRef.current) return;

    if (rescheduleAppointment) {
      const patientObj = rescheduleAppointment.userData || rescheduleAppointment.userId || null;
      setSelectedPatient(patientObj);
      const dateVal = rescheduleAppointment.slotDate || new Date().toISOString().split("T")[0];
      setCalendarStartDate(dateVal);
      setSelectedDate(dateVal);
      setSelectedTime(rescheduleAppointment.slotTime || "");
      setNote("");
      setSelectedBusyApp(null);
      hasInitializedRef.current = true;
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    setCalendarStartDate(today);
    setSelectedDate(today);
    setSelectedPatient(null);
    setSelectedBusyApp(null);
    setPatientSearch("");
    setSearchResults([]);
    setCreateForm({ name: "", phone: "" });
    setSelectedTime("");
    setDurationMinutes(60);
    setNote("");
    setScheduleData(null);

    hasInitializedRef.current = true;
  }, [open]);

  const backdropRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  // Load schedule availability and queue details (queries 7 days)
  useEffect(() => {
    if (!open || !doctorId || !calendarStartDate) {
      return;
    }

    let active = true;
    const loadSchedule = async () => {
      setLoadingSchedule(true);
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/dentist/calendar-availability`,
          {
            ...authHeader,
            params: { fromDate: calendarStartDate, days: 7 }
          }
        );
        if (active) {
          if (data?.success) {
            setScheduleData(data);
          } else {
            toast.error(data?.message || "Taqvim yuklanmadi");
          }
        }
      } catch (err) {
        console.error("Failed to load schedule:", err);
      } finally {
        if (active) setLoadingSchedule(false);
      }
    };

    loadSchedule();

    return () => {
      active = false;
    };
  }, [open, doctorId, calendarStartDate, backendUrl, authHeader]);

  const handleSearchChange = (val) => {
    setPatientSearch(val);
    clearTimeout(searchDebounceRef.current);
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const d = digitsOnly(val);
        const params = d ? { phone: d } : { name: val };
        const res = await lookupPatient(params);
        if (res?.patients) setSearchResults(res.patients);
        else if (res?.patient) setSearchResults([res.patient]);
        else setSearchResults([]);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectPatient = (p) => {
    setSelectedPatient(p);
    setSearchResults([]);
    setPatientSearch("");
  };

  const handleCreatePatient = async () => {
    const name = createForm.name.trim();
    const phone = normalizePhone(createForm.phone);
    if (!name) {
      toast.error(lang === "tg" ? "Номи бемор ҳатмист" : lang === "ru" ? "Имя пациента обязательно" : lang === "en" ? "Patient name is required" : "Bemor ismi majburiy");
      return;
    }
    if (!phone) {
      const country = localStorage.getItem("medinson:country") || "UZ";
      toast.error(
        country === "RU"
          ? (lang === "ru" ? "Введите номер телефона полностью (+7 (XXX) XXX-XX-XX)" : "Telefon raqamini to'liq kiriting (+7 (XXX) XXX-XX-XX)")
          : country === "TJ"
          ? "Raqamni to'liq kiriting (+992 XX XXX XXXX)"
          : "Telefon raqamini to'liq kiriting (+998 XX XXX-XX-XX)"
      );
      return;
    }

    setIsCreating(true);
    try {
      const today = new Date();
      const dob = `${today.getFullYear() - 30}-01-01`;
      const res = await createPatient({ name, phone, DOB: dob, gender: "Tanlanmagan" });
      if (res?.patient) {
        handleSelectPatient(res.patient);
        toast.success("Bemor yaratildi va tanlandi");
      }
    } catch (e) {
      toast.error(e?.message || "Yaratishda xatolik");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelSlotAppointment = async (appId) => {
    const ok = window.confirm(t.cancelConfirmPrompt || "Uchrashuvni bekor qilishni xohlaysizmi?");
    if (!ok) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/dentist/appointments/${appId}/cancel`,
        {},
        authHeader
      );
      if (data?.success) {
        toast.success(t.cancelSuccess);
        setSelectedBusyApp(null);
        // Reload schedule
        const updated = await axios.get(
          `${backendUrl}/api/dentist/calendar-availability`,
          {
            ...authHeader,
            params: { fromDate: calendarStartDate, days: 7 }
          }
        );
        if (updated?.data?.success) setScheduleData(updated.data);
        onSubmit && onSubmit();
      } else {
        toast.error(data?.message || "Xatolik");
      }
    } catch (err) {
      console.error("Cancel slot error:", err);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error(lang === "tg" ? "Бемор бояд интихоб шавад" : lang === "ru" ? "Пациент должен быть выбран" : lang === "en" ? "Patient must be selected" : "Bemor tanlanishi shart");
      return;
    }
    if (!doctorId) {
      toast.error("Stomatolog aniqlanmadi");
      return;
    }
    if (!selectedDate) {
      toast.error(lang === "tg" ? "Сана бояд интихоб шавад" : lang === "ru" ? "Дата должна быть выбрана" : lang === "en" ? "Date must be selected" : "Sana tanlanishi shart");
      return;
    }
    if (!selectedTime) {
      toast.error(lang === "tg" ? "Вақти қабулро интихоб кунед" : lang === "ru" ? "Выберите время приема" : lang === "en" ? "Select appointment time" : "Qabul vaqtini tanlang");
      return;
    }

    setIsSubmitting(true);

    if (rescheduleAppointment) {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/dentist/appointments/${rescheduleAppointment._id}/reschedule`,
          {
            slotDate: selectedDate,
            slotTime: selectedTime,
            reason: note.trim(),
          },
          authHeader
        );
        if (data?.success) {
          toast.success(data.message || "Qabul vaqti muvaffaqiyatli ko'chirildi!");
          onSubmit && onSubmit();
          onClose();
        } else {
          toast.error(data?.message || "Xatolik yuz berdi");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || "Xatolik yuz berdi");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/dentist/manual-appointments`,
        {
          userId: selectedPatient._id,
          slotDate: selectedDate,
          slotTime: selectedTime,
          durationMinutes,
          note,
        },
        authHeader
      );
      setIsSubmitting(false);
      if (data?.success) {
        toast.success(data.message || "Qabul yaratildi");
        if (selectedPatient && selectedPatient._id) {
          try {
            const { data: resp } = await axios.get(
              `${backendUrl}/api/admin/patients/${selectedPatient._id}/telegram-check`,
              { headers: { dtoken: dToken } }
            );
            if (resp?.success && resp?.linked) {
              onSubmit && onSubmit();
              onClose();
              return;
            }
          } catch (err) {
            console.warn("Error checking telegram status:", err);
          }

          try {
            const { data: linkData } = await axios.post(
              `${backendUrl}/api/admin/patients/${selectedPatient._id}/telegram-link`,
              {},
              { headers: { dtoken: dToken } }
            );
            if (linkData?.success) {
              setConnectPatient(selectedPatient);
              setTelegramLink(linkData.deepLink || "");
              setTelegramTokenHash(linkData.tokenHash || "");
              setShowTelegramConnect(true);
              setPendingCloseFn(() => () => {
                onSubmit && onSubmit();
                onClose();
              });
              return;
            }
          } catch (linkErr) {
            console.warn("Failed to generate telegram link:", linkErr);
          }
        }
        onSubmit && onSubmit();
        onClose();
      } else {
        toast.error(data?.message || "Uchrashuv yaratib bo'lmadi");
      }
    } catch (err) {
      setIsSubmitting(false);
      const msg = err?.response?.data?.message || "Uchrashuv yaratishda xatolik";
      toast.error(msg);
    }
  };

  // Extract queue statistics
  const liveQueue = scheduleData?.liveQueue || { waitingCount: 0, longestWaitMinutes: 0, activePatients: [] };

  const isTodayBooking = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return selectedDate === todayStr;
  }, [selectedDate]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onMouseDown={(e) => {
        if (e.target === backdropRef.current || e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-6xl max-h-[96vh] my-auto flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-primary/5 to-transparent shrink-0">
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-primary/60 uppercase mb-0.5 font-bold">
              {t.roomDoctor}
            </p>
            <h2 className="text-base font-bold text-slate-900">
              {rescheduleAppointment ? "🔄 Qabul vaqtini ko'chirish (Rejali uchrashuv)" : t.modalTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {rescheduleAppointment
                ? `👤 Bemor: ${selectedPatient?.name || "Bemor"} • Hozirgi qabul: ${isoToDMY(rescheduleAppointment.slotDate)} (${rescheduleAppointment.slotTime})`
                : t.modalDesc}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition shrink-0 mt-0.5 font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleBook} className="flex-1 min-h-0 overflow-y-auto flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Left panel: Patient Selection */}
          <div className="w-full lg:w-80 p-5 space-y-5 shrink-0">
            {/* ── 1. BEMOR ── */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">1</span>
                {t.patientName}
              </h3>

              {selectedPatient ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-emerald-800 truncate">{selectedPatient.name}</p>
                    <p className="text-xs text-emerald-600 mt-0.5 font-mono">
                      {selectedPatient.patientId && <span className="mr-2">{selectedPatient.patientId}</span>}
                      {selectedPatient.phone}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(null);
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-red-600 transition px-2 py-1 rounded-lg hover:bg-red-50 shrink-0 ml-2"
                  >
                    {t.changePatient}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative flex gap-2">
                    <input
                      type="text"
                      placeholder={t.patientSearchPlaceholder}
                      value={patientSearch}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full h-10 px-3.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-2.5 text-[10px] text-primary font-semibold animate-pulse">
                        {t.searching}
                      </div>
                    )}
                  </div>

                  {searchResults.length > 0 && (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-lg divide-y divide-slate-50 max-h-40 overflow-y-auto">
                      {searchResults.map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => handleSelectPatient(p)}
                          className="w-full text-left px-4 py-2.5 hover:bg-primary/5 transition flex items-center gap-3"
                        >
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                            {(p.name || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {p.patientId} · {p.phone}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {patientSearch.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                      <p className="text-xs text-slate-500 mb-2">
                        <span className="font-semibold text-slate-700">"{patientSearch}"</span> — {t.patientNotFound}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder={t.fullNamePlaceholder}
                          value={createForm.name}
                          onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                          className="h-9 px-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          placeholder={
                            localStorage.getItem("medinson:country") === "RU"
                              ? "+7 (___) ___-__-__"
                              : localStorage.getItem("medinson:country") === "TJ"
                              ? "+992 (__) ___-____"
                              : "+998 (__) ___-__-__"
                          }
                          value={createForm.phone}
                          onChange={(e) => setCreateForm((f) => ({ ...f, phone: formatPhoneInput(e.target.value) }))}
                          className="h-9 px-3 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-primary"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCreatePatient}
                        disabled={isCreating}
                        className="mt-2 w-full h-9 bg-primary text-white text-xs font-bold rounded-xl transition hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isCreating ? t.creating : t.createAndSelect}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ── 2. SHIFOKOR (Preloaded/Locked) ── */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">2</span>
                {t.doctorLabel}
              </h3>
              <div className="w-full h-10 px-3.5 border border-slate-200 bg-slate-50 rounded-xl text-sm flex items-center font-semibold text-slate-700">
                {lockedDoctorName}
              </div>
            </section>

            {/* ── 3. IZOH ── */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">4</span>
                {t.noteLabel}
              </h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.notePlaceholder}
                rows={4}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition resize-none"
              />
            </section>
          </div>

          {/* Right panel: Date, 7-Day Calendar Picker, and Live Wait Times */}
          <div className="flex-1 p-5 space-y-5 bg-slate-50/50 flex flex-col justify-between overflow-x-hidden">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">3</span>
                {t.dateTimeLabel}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.startDateLabel}</label>
                  <input
                    type="date"
                    value={calendarStartDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      setCalendarStartDate(e.target.value);
                      setSelectedDate(e.target.value);
                      setSelectedTime("");
                      setSelectedBusyApp(null);
                    }}
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                  {selectedDate && (
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      {t.selectedLabel}: {isoToDMY(selectedDate)} ({isoToWeekdayLocal(selectedDate)})
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.durationLabel}</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-sm bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  >
                    {DURATION_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m} {t.minutesLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Queue Conflict & Load Warns */}
              {isTodayBooking && liveQueue.waitingCount > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 space-y-2">
                  <div className="flex items-start gap-2 text-amber-800">
                    <span className="text-sm">⚠️</span>
                    <div>
                      <p className="text-xs font-bold">{t.liveQueueConflictTitle}</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        {t.liveQueueConflictDesc.replace("{count}", liveQueue.waitingCount)}
                      </p>
                      {liveQueue.longestWaitMinutes >= 60 && (
                        <p className="text-[11px] font-bold text-red-600 mt-1">
                          {t.longestWaitLabel.replace("{hours}", Math.floor(liveQueue.longestWaitMinutes / 60)).replace("{minutes}", liveQueue.longestWaitMinutes % 60)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-amber-200/50 pt-2">
                    <p className="font-semibold text-slate-600 mb-1">{t.waitingPatientsList}</p>
                    <div className="max-h-20 overflow-y-auto space-y-1">
                      {liveQueue.activePatients.map((p, idx) => (
                        <div key={p.appointmentId} className="flex justify-between font-mono bg-white/40 px-2 py-0.5 rounded text-[9px]">
                          <span>{idx + 1}. {p.name.slice(0, 15)}</span>
                          <span className="text-red-500 font-bold">{p.waitMinutes} {t.waitedMinutes}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 7-Day Scrollable Week-View Calendar Grid */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {t.scheduleCalendarTitle}
                  </label>
                  <div className="flex gap-2 text-[10px] font-bold">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-md bg-emerald-50 border border-emerald-200 inline-block"></span> {t.free}</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-md bg-slate-100 border border-slate-200 inline-block"></span> {t.busy}</span>
                  </div>
                </div>

                {loadingSchedule ? (
                  <div className="h-72 flex items-center justify-center text-xs text-slate-400 font-semibold animate-pulse border border-dashed rounded-3xl bg-white">
                    {t.loadingSchedule}
                  </div>
                ) : !scheduleData?.availability || scheduleData.availability.length === 0 ? (
                  <div className="h-72 border border-dashed rounded-3xl flex items-center justify-center text-xs text-slate-400 bg-white">
                    {t.selectDoctorPrompt}
                  </div>
                ) : (
                  <div className="overflow-x-auto pb-2 -mx-1 px-1">
                    <div className="flex gap-3 min-w-max">
                      {scheduleData.availability.map((day) => {
                        const daySlots = day.slots || [];
                        const isDaySelected = selectedDate === day.date;
                        const weekdayName = isoToWeekdayLocal(day.date);
                        const displayDateStr = isoToDMY(day.date).slice(0, 5); // DD-MM

                        // Count free slots
                        const freeCount = daySlots.filter(s => s.available).length;

                        return (
                          <div
                            key={day.date}
                            className={[
                              "w-36 flex flex-col rounded-2xl border p-2.5 transition shrink-0",
                              isDaySelected
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            ].join(" ")}
                          >
                            {/* Day Header */}
                            <div className="text-center pb-2 mb-2 border-b border-slate-100">
                              <p className="text-xs font-extrabold text-slate-800 capitalize">
                                {weekdayName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                {displayDateStr}
                              </p>
                              <span className={[
                                "inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1.5",
                                freeCount > 0
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              ].join(" ")}>
                                {t.freeSlotsCount.replace("{count}", freeCount)}
                              </span>
                            </div>

                            {/* Day Slots List */}
                            <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-0.5">
                              {daySlots.map((slot) => {
                                const isFree = slot.available;
                                const app = slot.appointment;
                                const isSelected = selectedDate === day.date && selectedTime === slot.time;
                                const isSelectedBusy = selectedBusyApp?.appointmentId && app?.appointmentId && selectedBusyApp.appointmentId === app.appointmentId;

                                return (
                                  <div key={slot.time} className="relative group">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isFree) {
                                          setSelectedDate(day.date);
                                          setSelectedTime(slot.time);
                                          setSelectedBusyApp(null);
                                        } else if (app) {
                                          setSelectedTime("");
                                          setSelectedBusyApp(app);
                                        }
                                      }}
                                      className={[
                                        "w-full py-2 rounded-lg text-[11px] font-bold border transition flex flex-col items-center justify-center",
                                        isSelected
                                          ? "bg-primary text-white border-primary shadow"
                                          : isSelectedBusy
                                          ? "bg-red-50 border-red-300 text-red-800 ring-2 ring-red-400/20 shadow"
                                          : isFree
                                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                                          : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200/60",
                                      ].join(" ")}
                                    >
                                      <span>{slot.time}</span>
                                      {!isFree && app && (
                                        <span className="text-[8px] text-slate-400 font-normal mt-0.5 truncate max-w-full px-0.5">
                                          {app.patient?.name ? app.patient.name.split(" ")[0] : "—"}
                                        </span>
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Busy Slot Details Card (without BAND SLOT MA'LUMOTLARI title) */}
              {selectedBusyApp && (
                <div className="rounded-2xl border border-red-100 bg-red-50/40 p-3.5 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1 text-xs">
                      <p><span className="text-slate-500 font-medium">{t.patientName}:</span> <span className="font-bold text-slate-900">{selectedBusyApp.patient?.name}</span></p>
                      <p><span className="text-slate-500 font-medium">{t.phone}:</span> <span className="font-semibold text-slate-700 font-mono">{selectedBusyApp.patient?.phone || "—"}</span></p>
                      <p><span className="text-slate-500 font-medium">{t.type}:</span> <span className="font-medium text-slate-600">{selectedBusyApp.isWalkIn ? t.liveQueueType : t.scheduledType}</span></p>
                      {selectedBusyApp.createdByName && (
                        <p>
                          <span className="text-slate-500 font-medium">
                            {lang === "ru"
                              ? "Записан"
                              : lang === "en"
                              ? "Booked by"
                              : lang === "tg"
                              ? "Аз ҷониби"
                              : "Kim yozdi"}
                            :
                          </span>{" "}
                          <span className="font-semibold text-slate-700">
                            {selectedBusyApp.createdByRole === "admin"
                              ? "Super Admin"
                              : selectedBusyApp.createdByRole === "doctor"
                              ? "Shifokor"
                              : selectedBusyApp.createdByRole === "receptionist"
                              ? "Qabulxona"
                              : "Bemor"}{" "}
                            ({selectedBusyApp.createdByName})
                          </span>
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCancelSlotAppointment(selectedBusyApp.appointmentId)}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-sm shrink-0"
                    >
                      {t.cancelBookingBtn}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex gap-2 pt-4 shrink-0 border-t border-slate-200/50 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedPatient || !selectedTime}
                className="flex-1 h-11 bg-primary hover:bg-primary/95 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl text-sm font-bold transition shadow-sm"
              >
                {isSubmitting ? t.saving : rescheduleAppointment ? "🔄 Vaqtini ko'chirish" : t.saveBooking}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showTelegramConnect && (
        <TelegramPatientConnectModal
          open={showTelegramConnect}
          onClose={handleTelegramModalClose}
          link={telegramLink}
          patient={connectPatient}
          title="Bemor Telegramga ulanishi"
        />
      )}
    </div>
  );
};

export default ManualBookingModal;
