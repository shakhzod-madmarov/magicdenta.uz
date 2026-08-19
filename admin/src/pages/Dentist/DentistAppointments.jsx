import axios from "axios";
import { toast } from "react-toastify";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { DentistContext } from "../../context/DentistContext";
import {
  formatDMY,
  formatWeekdayDMY,
  formatMoney,
  isoToday,
  parseUzDateTimeToUtcDate,
  addDaysYMD,
} from "../../../../shared/date.js";
import WalkInModal from "../../components/WalkInModal";
import ManualBookingModal from "../../components/ManualBookingModal";
import RescheduleModal from "../../components/RescheduleModal";
import TelegramPatientConnectModal from "../../components/TelegramPatientConnectModal.jsx";
import ToothChartPicker, { parseToothChartFromText } from "../../components/ToothChartPicker";
import { useAppointmentsDayPagination } from "../../hooks/useAppointmentsDayPagination";
import { normalizeText } from "../../utils/text";
import {
  IMAGE_INPUT_ACCEPT_ATTR,
  createImagePreviewItems,
  getImageFileError,
  humanizeImageUploadMessage,
  revokePreviewItems,
} from "../../utils/imageUpload";

const filterAcceptedImageFiles = (pickedFiles, { maxBytes }) => {
  const accepted = [];
  const rejectedMessages = [];

  (pickedFiles || []).forEach((file) => {
    const imageError = getImageFileError(file, { maxBytes });
    if (imageError) {
      rejectedMessages.push(`${file?.name || "Fayl"}: ${imageError}`);
      return;
    }
    accepted.push(file);
  });

  return { accepted, rejectedMessages };
};

const queueStatusLabelMap = {
  WAITING: "Kutilmoqda",
  CALLED: "Chaqirildi",
  IN_PROGRESS: "Qabulda",
  DONE: "Yakunlandi",
  MISSED: "Kelmadi",
  CANCELLED: "Bekor qilindi",
};

const getQueueStatusLabel = (status) =>
  queueStatusLabelMap[String(status || "").trim()] || status || "Noma'lum";

const ORTHO_QUEUE_STATUS_ORDER = {
  IN_PROGRESS: 0,
  CALLED: 1,
  WAITING: 2,
  MISSED: 3,
  CANCELLED: 4,
  DONE: 5,
};

const sortOrthodontistQueueItems = (items = []) =>
  [...items].sort((a, b) => {
    const statusA = String(a?.status || "").trim();
    const statusB = String(b?.status || "").trim();

    const rankA = ORTHO_QUEUE_STATUS_ORDER[statusA] ?? 99;
    const rankB = ORTHO_QUEUE_STATUS_ORDER[statusB] ?? 99;

    if (rankA !== rankB) return rankA - rankB;

    const isClosedA = ["DONE", "MISSED", "CANCELLED"].includes(statusA);
    const isClosedB = ["DONE", "MISSED", "CANCELLED"].includes(statusB);

    if (isClosedA && isClosedB) {
      const timeA = new Date(
        a?.doneAt ||
          a?.missedAt ||
          a?.cancelledAt ||
          a?.updatedAt ||
          a?.createdAt ||
          0,
      ).getTime();
      const timeB = new Date(
        b?.doneAt ||
          b?.missedAt ||
          b?.cancelledAt ||
          b?.updatedAt ||
          b?.createdAt ||
          0,
      ).getTime();

      return timeB - timeA;
    }

    return Number(a?.queueNo || 0) - Number(b?.queueNo || 0);
  });

const ORTHO_FOLLOW_UP_OPTIONS = [
  { value: 3, label: "3 kun" },
  { value: 7, label: "7 kun" },
  { value: 10, label: "10 kun" },
  { value: 15, label: "15 kun" },
];
const pad2 = (n) => String(n).padStart(2, "0");
const digitsOnly = (v) => String(v ?? "").replace(/\D/g, "");

const createOrthodontistBellPlayer = () => {
  if (typeof window === "undefined") {
    return {
      unlock: async () => {},
      play: async () => {},
    };
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return {
      unlock: async () => {},
      play: async () => {},
    };
  }

  let ctx = null;
  let master = null;
  let initialized = false;

  const ensureContext = () => {
    if (!ctx || ctx.state === "closed") {
      ctx = new AudioCtx();
      master = null;
      initialized = false;
    }
    return ctx;
  };

  const createImpulseResponse = (audioCtx, seconds = 1.6, decay = 2.4) => {
    const length = Math.floor(audioCtx.sampleRate * seconds);
    const impulse = audioCtx.createBuffer(2, length, audioCtx.sampleRate);

    for (let channel = 0; channel < 2; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        const t = i / length;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
      }
    }

    return impulse;
  };

  const ensureMasterChain = (audioCtx) => {
    if (initialized && master) {
      return master;
    }

    const output = audioCtx.createGain();
    const compressor = audioCtx.createDynamicsCompressor();
    const lowpass = audioCtx.createBiquadFilter();
    const convolver = audioCtx.createConvolver();
    const dry = audioCtx.createGain();
    const wet = audioCtx.createGain();

    output.gain.value = 0.92;

    compressor.threshold.value = -18;
    compressor.knee.value = 20;
    compressor.ratio.value = 2.5;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.2;

    lowpass.type = "lowpass";
    lowpass.frequency.value = 4700;
    lowpass.Q.value = 0.45;

    convolver.buffer = createImpulseResponse(audioCtx);

    dry.gain.value = 0.88;
    wet.gain.value = 0.2;

    output.connect(dry);
    output.connect(convolver);

    convolver.connect(wet);

    dry.connect(compressor);
    wet.connect(compressor);

    compressor.connect(lowpass);
    lowpass.connect(audioCtx.destination);

    master = output;
    initialized = true;

    return master;
  };

  const unlock = async () => {
    try {
      const audioCtx = ensureContext();
      ensureMasterChain(audioCtx);

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
    } catch (error) {
      console.warn("Orthodontist bell unlock failed:", error);
    }
  };

  const scheduleBellPartial = ({
    audioCtx,
    destination,
    frequency,
    start,
    duration,
    gainValue,
    type = "sine",
    detune = 0,
  }) => {
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.detune.setValueAtTime(detune, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(gainValue, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(gainValue * 0.48, 0.0002),
      start + 0.16,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(destination);

    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  };

  const scheduleStrikeNoise = ({
    audioCtx,
    destination,
    start,
    intensity = 1,
  }) => {
    const bufferSize = Math.max(1, Math.floor(audioCtx.sampleRate * 0.03));
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.8);
    }

    const source = audioCtx.createBufferSource();
    const bandpass = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    source.buffer = buffer;

    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(2300, start);
    bandpass.Q.value = 1.0;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.012 * intensity, start + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.045);

    source.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(destination);

    source.start(start);
    source.stop(start + 0.05);
  };

  const scheduleSingleBellStrike = ({
    audioCtx,
    destination,
    start,
    rootFrequency,
    intensity = 1,
  }) => {
    scheduleStrikeNoise({
      audioCtx,
      destination,
      start,
      intensity,
    });

    scheduleBellPartial({
      audioCtx,
      destination,
      start,
      frequency: rootFrequency,
      duration: 1.9,
      gainValue: 0.07 * intensity,
      type: "sine",
      detune: 0,
    });

    scheduleBellPartial({
      audioCtx,
      destination,
      start,
      frequency: rootFrequency * 2,
      duration: 1.55,
      gainValue: 0.042 * intensity,
      type: "triangle",
      detune: 3,
    });

    scheduleBellPartial({
      audioCtx,
      destination,
      start,
      frequency: rootFrequency * 2.72,
      duration: 1.12,
      gainValue: 0.02 * intensity,
      type: "sine",
      detune: -4,
    });

    scheduleBellPartial({
      audioCtx,
      destination,
      start,
      frequency: rootFrequency * 4.08,
      duration: 0.92,
      gainValue: 0.009 * intensity,
      type: "triangle",
      detune: 6,
    });
  };

  const play = async () => {
    try {
      const audioCtx = ensureContext();
      const destination = ensureMasterChain(audioCtx);

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      const now = audioCtx.currentTime + 0.015;

      scheduleSingleBellStrike({
        audioCtx,
        destination,
        start: now,
        rootFrequency: 1046.5,
        intensity: 1,
      });

      scheduleSingleBellStrike({
        audioCtx,
        destination,
        start: now + 0.46,
        rootFrequency: 1318.5,
        intensity: 0.8,
      });
    } catch (error) {
      console.warn("Orthodontist bell play failed:", error);
    }
  };

  return { unlock, play };
};

const formatTime24 = (t) => {
  if (!t) return "";
  const s = String(t).trim();

  if (/^\d{2}:\d{2}$/.test(s)) return s;

  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m) {
    let hh = Number(m[1]);
    const mm = Number(m[2]);
    const ap = m[3].toUpperCase();
    if (ap === "AM") {
      if (hh === 12) hh = 0;
    } else {
      if (hh !== 12) hh += 12;
    }
    return `${pad2(hh)}:${pad2(mm)}`;
  }

  if (/^\d{1,2}:\d{2}/.test(s)) {
    const parts = s.split(":");
    const hh = pad2(Number(parts[0]));
    const mm = pad2(Number(String(parts[1]).slice(0, 2)));
    return `${hh}:${mm}`;
  }

  return s;
};

const createdFromLabel = (v) => {
  if (v === "DENTIST") return ["Stomatolog yozgan", "text-blue-700 bg-blue-50"];
  if (v === "ADMIN") return ["Admin yozgan", "text-purple-700 bg-purple-50"];
  return ["Bemor yozgan", "text-gray-700 bg-gray-100"];
};

const getDebt = (a) => {
  const fin = a?.financial || null;
  if (!fin) return 0;
  if (fin.debt !== undefined) return Math.max(0, Number(fin.debt || 0));
  return Math.max(0, Number(fin.amount || 0) - Number(fin.paidAmount || 0));
};

const timeDigitsToNormalized = (digits) => {
  if (/^\d{2}:\d{2}$/.test(String(digits).trim())) {
    return String(digits).trim();
  }
  const d = digitsOnly(digits).slice(0, 4);
  if (d.length !== 4) return "";
  const hh = Number(d.slice(0, 2));
  const mm = Number(d.slice(2, 4));
  return `${pad2(hh)}:${pad2(mm)}`;
};

const validateTimeDigits = (digits) => {
  const d = digitsOnly(digits).slice(0, 4);
  if (!d) return "";
  if (d.length < 4) return "Vaqtni 4 ta raqam bilan kiriting (masalan 1830).";
  const hh = Number(d.slice(0, 2));
  const mm = Number(d.slice(2, 4));
  if (hh < 0 || hh > 23) return "Soat 00–23 oralig‘ida bo‘lishi kerak";
  if (mm < 0 || mm > 59) return "Daqiqa 00–59 oralig‘ida bo‘lishi kerak";
  return "";
};

const computeDerivedStatus = ({ a }) => {
  const isCancelled = Boolean(a?.cancelled || a?.status === "CANCELLED");
  if (isCancelled) return { key: "CANCELLED", minsLeft: null };

  if (a?.status === "DONE") return { key: "DONE", minsLeft: null };
  if (a?.status === "IN_PROGRESS")
    return { key: "IN_PROGRESS", minsLeft: null };
  if (a?.status === "MISSED") return { key: "MISSED", minsLeft: null };

  return { key: "WAITING", minsLeft: null };
};

const statusBadge = (derived, a) => {
  const key = derived.key;

  if (key === "CANCELLED") {
    return ["Bekor qilingan", "bg-red-50 text-red-700 ring-red-200"];
  }

  if (key === "MISSED" || key === "MISSED_UI") {
    return ["Kelmagan", "bg-orange-50 text-orange-700 ring-orange-200"];
  }

  if (key === "IN_PROGRESS") {
    return ["Qabul qilinmoqda", "bg-blue-50 text-blue-700 ring-blue-200"];
  }

  if (key === "DONE") {
    const requested = Number(a?.financial?.requestedPaidNow || 0);

    if (requested > 0) {
      return [
        "Yakunlangan (to‘lov kutilmoqda)",
        "bg-blue-50 text-blue-700 ring-blue-200",
      ];
    }

    if (a?.financial?.paymentStatus === "PAID") {
      return [
        "Yakunlangan (to‘langan)",
        "bg-green-50 text-green-700 ring-green-200",
      ];
    }

    return [
      "Yakunlangan (qarz bor)",
      "bg-green-50 text-green-700 ring-green-200",
    ];
  }

  return ["Kutilmoqda", "bg-yellow-50 text-yellow-800 ring-yellow-200"];
};

const PayInModal = ({ open, onClose, appointment, onSubmitPay }) => {
  const [payAmount, setPayAmount] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => {
      setPayAmount("");
      setErr("");
      setSaving(false);
    }, 0);

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      clearTimeout(id);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  const fin = appointment?.financial || null;
  const debt = getDebt(appointment);
  const payNum = Number(digitsOnly(payAmount) || 0);

  const patientObj = appointment?.userData || appointment?.userId || {};
  const name = patientObj?.name || "Bemor";

  const invalid = !digitsOnly(payAmount) || payNum <= 0 || payNum > debt;

  const handleSubmit = async () => {
    if (saving) return;
    if (invalid) {
      if (!digitsOnly(payAmount)) setErr("To‘lov summasini kiriting.");
      else if (payNum <= 0) setErr("To‘lov 0 dan katta bo‘lishi kerak.");
      else if (payNum > debt)
        setErr("To‘lov qarzdan katta bo‘lishi mumkin emas.");
      return;
    }

    try {
      setSaving(true);
      const res = await onSubmitPay({
        appointmentId: appointment?._id,
        payAmount: payNum,
      });

      if (res?.ok === false) {
        setErr(res.message || "Xatolik yuz berdi");
        return;
      }

      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-primary">
              To‘lov qo‘shish
            </h3>
            <p className="text-sm text-gray-600 mt-1">{name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDMY(appointment?.slotDate)} •{" "}
              {formatTime24(appointment?.slotTime)}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-3 py-2 text-sm rounded-xl border hover:bg-gray-50"
          >
            Yopish
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Narx</span>
              <span className="font-semibold">
                {fin ? formatMoney(fin.amount) : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To‘langan</span>
              <span className="font-semibold text-green-700">
                {fin ? formatMoney(fin.paidAmount) : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Qarz</span>
              <span className="font-semibold text-red-600">
                {formatMoney(debt)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Hozir olingan summa *
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={payAmount}
              onChange={(e) => {
                setErr("");
                setPayAmount(digitsOnly(e.target.value));
              }}
              className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="Masalan: 50000"
            />

            {digitsOnly(payAmount) && !err && (
              <p className="text-xs mt-1">
                {payNum === debt && (
                  <span className="text-green-600 font-medium">
                    Qarz to‘liq yopiladi
                  </span>
                )}

                {payNum < debt && payNum > 0 && (
                  <span className="text-gray-600">
                    <b>{formatMoney(payNum)}</b> olinadi, qolgan qarz:{" "}
                    <b className="text-red-600">{formatMoney(debt - payNum)}</b>
                  </span>
                )}

                {payNum > debt && (
                  <span className="text-red-600 font-medium">
                    Kiritilgan summa qarzdan katta
                  </span>
                )}
              </p>
            )}

            {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl border hover:bg-white text-sm disabled:opacity-60"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleSubmit}
              disabled={invalid || saving}
              className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                invalid || saving ? "bg-gray-300 text-gray-600" : "bg-primary text-white"
              }`}
            >
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutModal = ({
  open,
  onClose,
  onSubmit,
  appointment,
  templates = [],
  backendUrl,
  dToken,
}) => {
  const fin = appointment?.financial || null;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    diagnosis: "",
    teeth: "",
    procedures: "",
    nextStep: "",
    medicines: "",
    notes: "",
    templateId: "",
    nextVisitDate: "",
    nextVisitTimeDigits: "",
    amount: "",
    paidNow: "0",
  });

  const [toothChartItems, setToothChartItems] = useState([]);
  const [xrays, setXrays] = useState([]);
  const [xrayPreviews, setXrayPreviews] = useState([]);
  const [inlineError, setInlineError] = useState("");
  const [timeError, setTimeError] = useState("");

  const todayStr = isoToday();

  // ── Weekly Schedule calendar state ─────────────────────────────────────────
  const [calendarStartDate, setCalendarStartDate] = useState(todayStr);
  const [scheduleData, setScheduleData] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // ── Keyboard Listener (Esc key) ───────────────────────────────────────────
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  // ── Reset Form when Modal Opens or Appointment Changes ─────────────────────
  useEffect(() => {
    if (!open || !appointment) return;

    const preAmount =
      fin?.amount !== undefined && fin?.amount !== null
        ? String(fin.amount)
        : "";

    setCalendarStartDate(todayStr);

    setForm({
      diagnosis: "",
      teeth: "",
      procedures: "",
      nextStep: "",
      medicines: "",
      notes: "",
      templateId: "",
      nextVisitDate: "",
      nextVisitTimeDigits: "",
      amount: digitsOnly(preAmount),
      paidNow: "0",
    });
    setToothChartItems([]);
    setXrays([]);
    setXrayPreviews([]);
    setInlineError("");
    setTimeError("");
    setSaving(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment?._id]);

  useEffect(() => {
    return () => {
      revokePreviewItems(xrayPreviews);
    };
  }, [xrayPreviews]);

  // Fetch 7-day schedule whenever calendarStartDate or open changes
  useEffect(() => {
    if (!open || !calendarStartDate || !dToken) {
      setScheduleData(null);
      return;
    }
    let cancelled = false;
    setLoadingSchedule(true);
    axios
      .get(`${backendUrl || ""}/api/dentist/calendar-availability`, {
        params: { fromDate: calendarStartDate, days: 7 },
        headers: { dtoken: dToken },
      })
      .then(({ data }) => {
        if (!cancelled && data.success) {
          setScheduleData(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingSchedule(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, calendarStartDate, backendUrl, dToken]);

  if (!open) return null;

  const amountNum = Number(digitsOnly(form.amount) || 0);
  const paidNum = Number(digitsOnly(form.paidNow) || 0);
  const remaining = Math.max(0, amountNum - paidNum);

  const nextDateFilled = Boolean(String(form.nextVisitDate || "").trim());
  const nextTimeFilled = Boolean(String(form.nextVisitTimeDigits || "").trim());
  const nextVisitIncomplete =
    (nextDateFilled && !nextTimeFilled) || (!nextDateFilled && nextTimeFilled);

  const invalid =
    !String(form.diagnosis || "").trim() ||
    digitsOnly(form.amount) === "" ||
    amountNum < 0 ||
    paidNum < 0 ||
    paidNum > amountNum ||
    nextVisitIncomplete ||
    Boolean(timeError);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInlineError("");

    if (name === "amount" || name === "paidNow") {
      setForm((p) => ({ ...p, [name]: digitsOnly(value) }));
      return;
    }

    if (name === "nextVisitTimeDigits") {
      const d = digitsOnly(value).slice(0, 4);
      const err = validateTimeDigits(d);
      setTimeError(err);
      setForm((p) => ({ ...p, nextVisitTimeDigits: d }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const applyTemplate = (templateId) => {
    const selected = (Array.isArray(templates) ? templates : []).find(
      (item) => String(item?._id || "") === String(templateId || ""),
    );

    setForm((prev) => ({
      ...prev,
      templateId: templateId || "",
      diagnosis: selected?.diagnosis || prev.diagnosis,
      teeth: selected?.teeth || prev.teeth,
      procedures: selected?.procedures || prev.procedures,
      nextStep: selected?.nextStep || prev.nextStep,
      medicines: selected?.medicines || prev.medicines,
      notes: selected?.notes || prev.notes,
      amount: selected?.price ? String(selected.price) : prev.amount,
    }));

    if (selected?.teeth) {
      setToothChartItems(parseToothChartFromText(selected.teeth));
    } else {
      setToothChartItems([]);
    }
  };

  const handleSubmit = async () => {
    if (saving) return;
    if (nextVisitIncomplete) {
      setInlineError(
        "Keyingi ko‘rik uchun sana va vaqt ikkalasi ham to‘ldirilishi kerak.",
      );
      return;
    }
    if (timeError) return;

    if (form.nextVisitTimeDigits && form.nextVisitTimeDigits.length < 4) {
      setInlineError("Vaqtni 4 ta raqam bilan kiriting (masalan 1830).");
      return;
    }

    if (
      !String(form.diagnosis || "").trim() ||
      digitsOnly(form.amount) === "" ||
      paidNum > amountNum
    ) {
      setInlineError("Iltimos, majburiy maydonlarni to‘g‘ri to‘ldiring.");
      return;
    }

    const nextVisitTime = form.nextVisitTimeDigits
      ? timeDigitsToNormalized(form.nextVisitTimeDigits)
      : "";

    const hasNextDate = Boolean(form.nextVisitDate);
    const hasNextTime = Boolean(nextVisitTime);

    if (hasNextDate && hasNextTime) {
      const candidate = parseUzDateTimeToUtcDate(
        form.nextVisitDate,
        nextVisitTime,
      );

      if (!candidate || Number.isNaN(candidate.getTime())) {
        setInlineError("Keyingi ko‘rik sanasi yoki vaqti noto‘g‘ri.");
        return;
      }

      if (candidate.getTime() <= Date.now()) {
        setInlineError(
          "Keyingi ko‘rik sanasi va vaqti hozirgi vaqtdan KEYIN bo‘lishi kerak.",
        );
        return;
      }
    }

    let finalProcedures = form.procedures.trim();
    const toothDetails = toothChartItems
      .map((info) => `${info.toothNumber} - ${info.procedureLabel || "Tekshirildi"}${info.notes ? ` (${info.notes})` : ""}`)
      .join(", ");
    if (toothDetails) {
      if (finalProcedures) {
        finalProcedures = `${toothDetails}\n${finalProcedures}`;
      } else {
        finalProcedures = toothDetails;
      }
    }

    const result = await onSubmit({
      appointmentId: appointment?._id,
      diagnosis: form.diagnosis.trim(),
      teeth: (form.teeth || "").trim(),
      procedures: finalProcedures,
      nextStep: (form.nextStep || "").trim(),
      medicines: (form.medicines || "").trim(),
      notes: (form.notes || "").trim(),
      templateId: form.templateId || "",
      nextVisitDate: form.nextVisitDate || "",
      nextVisitTime,
      amount: amountNum,
      paidNow: paidNum,
      xrays,
    });

    if (result?.ok === false) {
      setInlineError(result.message || "Xatolik yuz berdi");
      return;
    }
  };

  const patientObj = appointment?.userData || appointment?.userId || {};
  const headerName = patientObj?.name || "Bemor";
  const headerPhone = patientObj?.phone || "";

  // WEEKDAYS translation map for local day names
  const WEEKDAYS = {
    uz: ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"],
    ru: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    tg: ["Якшанбе", "Душанбе", "Сешанбе", "Чоршанбе", "Панҷшанбе", "Ҷумъа", "Шанбе"]
  };
  const lang = localStorage.getItem("language") || "uz";

  const isoToWeekdayLocal = (iso = "") => {
    if (!iso) return "";
    const parts = iso.split("-").map(Number);
    if (parts.length !== 3) return "";
    const [y, m, d] = parts;
    const date = new Date(Date.UTC(y, m - 1, d));
    const dayIndex = date.getUTCDay();
    return (WEEKDAYS[lang] || WEEKDAYS.uz)[dayIndex];
  };

  const isoToDMY = (iso = "") => {
    if (!iso) return "";
    const parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-3 py-3 sm:px-4 sm:py-4"
    >
      <div
        className="min-h-full flex items-start sm:items-center justify-center"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden">
          <div className="p-5 sm:p-6 border-b flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-primary">
                Qabulni yakunlash
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {headerName} {headerPhone ? `• ${headerPhone}` : ""}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDMY(appointment?.slotDate)} • {formatTime24(appointment?.slotTime)}
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-2 text-sm rounded-xl border hover:bg-gray-50"
            >
              Yopish
            </button>
          </div>

          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3 space-y-4">
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1 text-amber-950">
                      Shablon (ixtiyoriy)
                    </label>
                    <select
                      name="templateId"
                      value={form.templateId}
                      onChange={(e) => applyTemplate(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
                    >
                      <option value="">Shablon tanlang</option>
                      {(Array.isArray(templates) ? templates : []).map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-xs text-amber-900/70 sm:max-w-48">
                    Shablon tanlansa, diagnoz va klinik maydonlar avtomatik to‘ladi.
                  </div>
                </div>

                {Array.isArray(templates) &&
                  templates.filter((t) => t.isFavorite).length > 0 && (
                    <div className="pt-1 border-t border-amber-200/60">
                      <div className="text-xs font-semibold text-amber-900 mb-1.5 flex items-center gap-1">
                        <span>Tezkor tanlov:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {templates
                          .filter((t) => t.isFavorite)
                          .map((item) => {
                            const isSelected =
                              String(form.templateId) === String(item._id);
                            return (
                              <button
                                key={item._id}
                                type="button"
                                onClick={() =>
                                  applyTemplate(isSelected ? "" : item._id)
                                }
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition shadow-2xs border ${
                                  isSelected
                                    ? "bg-amber-600 border-amber-700 text-white shadow-xs font-semibold"
                                    : "bg-white border-amber-300/80 text-amber-950 hover:bg-amber-100 hover:border-amber-400"
                                }`}
                              >
                                <span>{item.title}</span>
                                {Number(item.price) > 0 && (
                                  <span className={`text-[10px] ${isSelected ? "text-amber-100" : "text-amber-700"}`}>
                                    • {Number(item.price).toLocaleString()} so'm
                                  </span>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Diagnos *
                </label>
                <textarea
                  name="diagnosis"
                  value={form.diagnosis}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>

              <div className="space-y-4">
                <ToothChartPicker
                  value={toothChartItems}
                  onChange={(newItems) => {
                    setToothChartItems(newItems);
                    setForm((p) => ({
                      ...p,
                      teeth: newItems.map((i) => i.toothNumber).join(", "),
                    }));
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Bajarilgan ishlar
                </label>
                <textarea
                  name="procedures"
                  value={form.procedures}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Keyingi qadam
                </label>
                <textarea
                  name="nextStep"
                  value={form.nextStep}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Dorilar</label>
                <textarea
                  name="medicines"
                  value={form.medicines}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Eslatma</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* ─── Next visit: 7-day Weekly Schedule Calendar picker ───────────── */}
              <div className="space-y-4 pt-2 border-t">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Keyingi ko'rik uchun sana va vaqt (ixtiyoriy)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Taqvimdan mos kun va bo'sh vaqtni tanlang. Hozirgi band vaqtlar ko'rinadi.
                  </p>
                </div>

                {/* Selected Slot Summary Badge */}
                {form.nextVisitDate && form.nextVisitTimeDigits ? (
                  <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 text-xs text-primary font-bold">
                    <span>
                      ✓ Tanlangan uchrashuv: {isoToDMY(form.nextVisitDate)} ({isoToWeekdayLocal(form.nextVisitDate)}) soat {form.nextVisitTimeDigits}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          nextVisitDate: "",
                          nextVisitTimeDigits: "",
                        }));
                      }}
                      className="text-red-500 hover:text-red-700 font-extrabold text-[10px] uppercase ml-3"
                    >
                      O'chirish
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 italic">
                    Uchrashuv vaqti tanlanmagan
                  </div>
                )}

                {/* Date Week Changer Selector & Week Nav Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Haftani boshlash sanasi
                    </label>
                    <input
                      type="date"
                      value={calendarStartDate}
                      min={todayStr}
                      onChange={(e) => setCalendarStartDate(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto pt-4 sm:pt-0">
                    <button
                      type="button"
                      disabled={calendarStartDate <= todayStr}
                      onClick={() => {
                        const prevWeek = addDaysYMD(calendarStartDate, -7);
                        setCalendarStartDate(prevWeek < todayStr ? todayStr : prevWeek);
                      }}
                      className="flex-1 sm:flex-none border rounded-xl px-3 py-2 text-xs font-bold bg-white text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all"
                    >
                      ⬅ Oldingi hafta
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCalendarStartDate(addDaysYMD(calendarStartDate, 7));
                      }}
                      className="flex-1 sm:flex-none border rounded-xl px-3 py-2 text-xs font-bold bg-white text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                    >
                      Keyingi hafta ➡
                    </button>
                  </div>
                </div>

                {/* Horizontal Weekly Schedule Grid */}
                <div className="border rounded-2xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700">Taqvim bandlik jadvali (7 kun)</span>
                    <div className="flex gap-3 text-[10px] font-semibold">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Bo'sh</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" /> Band</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" /> O'tgan</span>
                    </div>
                  </div>

                  {loadingSchedule ? (
                    <div className="py-16 text-center text-xs text-gray-400 font-bold">Jadval yuklanmoqda...</div>
                  ) : !scheduleData?.availability || scheduleData.availability.length === 0 ? (
                    <div className="py-16 text-center text-xs text-gray-400 font-bold">Jadval ma'lumotlari mavjud emas</div>
                  ) : (
                    <div className="overflow-x-auto pb-2 -mx-1 px-1">
                      <div className="flex gap-3 min-w-max">
                        {scheduleData.availability.map((day) => {
                          const daySlots = day.slots || [];
                          const isDaySelected = form.nextVisitDate === day.date;
                          const weekdayName = isoToWeekdayLocal(day.date);
                          const displayDateStr = isoToDMY(day.date).slice(0, 5); // DD-MM

                          // Count free slots
                          const freeCount = daySlots.filter((s) => s.available).length;

                          return (
                            <div
                              key={day.date}
                              className={`w-32 flex flex-col rounded-2xl border p-2 transition shrink-0 ${
                                isDaySelected
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              {/* Day Header */}
                              <div className="text-center pb-2 mb-2 border-b border-slate-100">
                                <p className="text-xs font-black text-slate-800 capitalize">
                                  {weekdayName}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                  {displayDateStr}
                                </p>
                                <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-full mt-1.5 ${
                                  freeCount > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                                }`}>
                                  {freeCount} bo'sh
                                </span>
                              </div>

                              {/* Day Slots List */}
                              <div className="space-y-1 max-h-[220px] overflow-y-auto pr-0.5">
                                {daySlots.map((slot) => {
                                  const isFree = slot.available;
                                  const app = slot.appointment;
                                  const isSelected = form.nextVisitDate === day.date && form.nextVisitTimeDigits === slot.time;

                                  return (
                                    <button
                                      key={slot.time}
                                      type="button"
                                      disabled={!isFree}
                                      onClick={() => {
                                        setForm((prev) => ({
                                          ...prev,
                                          nextVisitDate: isSelected ? "" : day.date,
                                          nextVisitTimeDigits: isSelected ? "" : slot.time,
                                        }));
                                        setTimeError("");
                                      }}
                                      title={!isFree && app ? `Band: ${app.patient?.name || "Bemor"}` : slot.time}
                                      className={`w-full py-1.5 rounded-lg text-[10px] font-extrabold border transition flex flex-col items-center justify-center
                                        ${isSelected
                                          ? "bg-primary text-white border-primary shadow scale-105"
                                          : isFree
                                          ? "bg-emerald-50 border-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                          : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                                        }`}
                                    >
                                      <span>{slot.time}</span>
                                      {!isFree && app && (
                                        <span className="text-[8px] text-slate-400 font-normal truncate max-w-full px-0.5 mt-0.5">
                                          {app.patient?.name ? app.patient.name.split(" ")[0] : "—"}
                                        </span>
                                      )}
                                    </button>
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

                {nextVisitIncomplete && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">
                    Keyingi ko'rik uchun sana va vaqt ikkalasi ham tanlangan bo'lishi kerak.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  XRAY / suratlar (ixtiyoriy)
                </label>
                <input
                  type="file"
                  accept={IMAGE_INPUT_ACCEPT_ATTR}
                  multiple
                  onChange={async (e) => {
                    const picked = Array.from(e.target.files || []);
                    const { accepted, rejectedMessages } = filterAcceptedImageFiles(
                      picked,
                      { maxBytes: 10 * 1024 * 1024 },
                    );

                    setXrays(accepted);
                    revokePreviewItems(xrayPreviews);
                    setXrayPreviews(await createImagePreviewItems(accepted));
                    if (rejectedMessages.length) {
                      toast.error(humanizeImageUploadMessage(rejectedMessages[0]));
                    }
                  }}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                />
                {xrayPreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {xrayPreviews.map((item) => (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                      >
                        {item.url ? (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="h-24 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-24 items-center justify-center px-2 text-center text-xs text-gray-500">
                            Ko‘rinish tayyor emas
                          </div>
                        )}
                        <p className="truncate px-2 py-1 text-[11px] text-gray-600">
                          {item.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {xrays.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    Tanlangan fayllar: {xrays.length}
                  </p>
                )}
              </div>

              {inlineError && (
                <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl px-3 py-2 text-sm">
                  {inlineError}
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="border rounded-2xl p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">To‘lov ma’lumotlari</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, paidNow: p.amount || "0" }))}
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      ✓ To'liq to'lash
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, paidNow: "0" }))}
                      className="text-[11px] font-bold text-red-600 hover:underline"
                    >
                      To'lanmagan
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium">Umumiy narx *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
                      placeholder="Masalan: 150000"
                    />
                    {digitsOnly(form.amount) === "" && (
                      <p className="text-xs text-red-600 mt-1">Umumiy narx majburiy</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Hozir olingan (ixtiyoriy)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="paidNow"
                      value={form.paidNow}
                      onChange={handleChange}
                      className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
                      placeholder="Masalan: 50000"
                    />
                  </div>

                  {paidNum > amountNum && (
                    <p className="text-xs text-red-600 font-semibold">
                      Hozir olingan summa umumiy narxdan katta bo‘lishi mumkin emas
                    </p>
                  )}

                  <div className="pt-2 border-t space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Umumiy</span>
                      <span className="font-semibold">{formatMoney(amountNum)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Hozir</span>
                      <span className="font-semibold text-green-700">
                        {formatMoney(paidNum)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Qarz</span>
                      <span className="font-semibold text-red-600">
                        {formatMoney(remaining)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl border hover:bg-white text-sm disabled:opacity-60"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={invalid || saving}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60"
                >
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrthodontistStartModal = () => null;

const OrthodontistCompleteModal = ({ open, onClose, item, onSubmit }) => {
  const [followUpDays, setFollowUpDays] = useState(
    item?.followUpDays ? String(item.followUpDays) : "",
  );
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [inlineError, setInlineError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    if (!open || !item) return;
    setFollowUpDays(item?.followUpDays ? String(item.followUpDays) : "");
    setFiles([]);
    setFilePreviews([]);
    setInlineError("");
    setSaving(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?._id]);

  useEffect(() => {
    return () => {
      revokePreviewItems(filePreviews);
    };
  }, [filePreviews]);

  if (!open || !item) return null;

  const patientName = item?.patientId?.name || "Bemor";
  const purposeLabel = item?.visitPurposeLabel || "Ortodont nazorat";

  const buildPreviewDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + Number(days || 0));

    if (d.getDay() === 0) {
      d.setDate(d.getDate() + 1);
    }

    return formatDMY(d);
  };

  const handleSubmit = async () => {
    if (saving) return;
    const selected = Number(followUpDays || 0);

    if (![3, 7, 10, 15].includes(selected)) {
      setInlineError("Qabulni tugatishdan oldin 3, 7, 10 yoki 15 kunni tanlang.");
      return;
    }

    try {
      setSaving(true);
      const result = await onSubmit({
        id: item._id,
        followUpDays: selected,
        files,
      });

      if (result?.ok === false) {
        setInlineError(result.message || "Xatolik yuz berdi");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-3 py-3 sm:px-4 sm:py-4"
    >
      <div
        className="min-h-full flex items-start sm:items-center justify-center"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
          <div className="p-5 border-b flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-primary">
                Ortodont qabulini tugatish
              </h2>
              <p className="text-sm text-gray-600 mt-1">{patientName}</p>
              <p className="text-xs text-gray-500 mt-1">{purposeLabel}</p>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-2 text-sm rounded-xl border hover:bg-gray-50"
            >
              Yopish
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">
                Keyingi nazorat intervali *
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ORTHO_FOLLOW_UP_OPTIONS.map((option) => {
                  const active = Number(followUpDays || 0) === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFollowUpDays(String(option.value));
                        setInlineError("");
                      }}
                      className={`px-3 py-3 rounded-xl border text-left transition ${
                        active
                          ? "bg-primary text-white border-primary"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-sm font-semibold">
                        {option.label}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          active ? "text-white/90" : "text-gray-500"
                        }`}
                      >
                        Taxminiy sana: {buildPreviewDate(option.value)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Jarayon rasmlari (ixtiyoriy)
              </label>

              <input
                type="file"
                multiple
                accept={IMAGE_INPUT_ACCEPT_ATTR}
                onChange={async (e) => {
                  const { accepted, rejectedMessages } = filterAcceptedImageFiles(
                    Array.from(e.target.files || []),
                    { maxBytes: 50 * 1024 * 1024 },
                  );
                  setFiles(accepted);
                  setFilePreviews(await createImagePreviewItems(accepted));
                  if (rejectedMessages.length) {
                    toast.error(humanizeImageUploadMessage(rejectedMessages[0]));
                  }
                }}
                className="block w-full text-sm"
              />

              {filePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {filePreviews.map((item) => (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                    >
                      {item.url ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="h-24 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-24 items-center justify-center px-2 text-center text-xs text-gray-500">
                          Ko‘rinish tayyor emas
                        </div>
                      )}
                      <p className="truncate px-2 py-1 text-[11px] text-gray-600">
                        {item.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {files.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  Tanlandi: {files.length} ta fayl
                </div>
              )}
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-900">
              Qabul tugatilganda follow-up tanlanadi va kerak bo‘lsa jarayon
              rasmlari shu yerning o‘zida yuklanadi.
            </div>

            {inlineError && (
              <p className="text-sm text-red-600 font-medium">{inlineError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-xl border hover:bg-gray-50 text-sm disabled:opacity-60"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60"
              >
                {saving ? "Saqlanmoqda..." : "Tugatildi"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DentistAppointments = () => {
  const {
    backendUrl,
    dToken,
    profile,
    appointments,
    templates,
    loadAppointments,
    checkoutVisit,
    payAppointmentDebt,
    lookupPatient,
    assignWalkIn,
    createPatient,
  } = useContext(DentistContext);

  const [walkInOpen, setWalkInOpen] = useState(false);
  const [manualBookingOpen, setManualBookingOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPatientId = searchParams.get("userId") || "";

  const isOrthodontist =
    Array.isArray(profile?.speciality) &&
    profile.speciality.some((x) => /ortodont|orthodont/i.test(String(x)));

  const [filter, setFilter] = useState("ALL");
  const [customDate, setCustomDate] = useState("");
  const [search, setSearch] = useState("");

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState(null);

  const [payOpen, setPayOpen] = useState(false);
  const [payAppointment, setPayAppointment] = useState(null);
  const [startingAppointmentId, setStartingAppointmentId] = useState("");
  const [rescheduleModalApp, setRescheduleModalApp] = useState(null);

  const [live, setLive] = useState({
    state: "AVAILABLE",
    currentAppointmentId: null,
    lastFinishedAt: 0,
    next: null,
  });

  const [tgQrOpen, setTgQrOpen] = useState(false);
  const [tgQrLink, setTgQrLink] = useState("");
  const [tgQrPatient, setTgQrPatient] = useState(null);

  const showTelegramQrForPatient = useCallback(async (patientObj) => {
    if (!patientObj?._id || !dToken) return;
    try {
      const { data: checkData } = await axios.get(
        `${backendUrl || ""}/api/dentist/patients/${patientObj._id}/telegram-check`,
        { headers: { dtoken: dToken } }
      );
      if (checkData?.success && checkData?.linked) return;
    } catch { /* ignore */ }
    try {
      const { data: linkData } = await axios.post(
        `${backendUrl || ""}/api/dentist/patients/${patientObj._id}/telegram-link`,
        {},
        { headers: { dtoken: dToken } }
      );
      if (linkData?.success && linkData?.deepLink) {
        setTgQrPatient(patientObj);
        setTgQrLink(linkData.deepLink);
        setTgQrOpen(true);
      }
    } catch { /* ignore */ }
  }, [backendUrl, dToken]);

  const today = isoToday();

  useEffect(() => {
    if (!dToken) return;
    loadAppointments();
  }, [dToken]);

  useEffect(() => {
    if (!dToken) return;

    const loadWork = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/dentist/work-status`, {
          headers: { dtoken: dToken },
        });
        const data = await res.json().catch(() => null);
        if (data?.success) {
          setLive((p) => ({
            ...p,
            ...(data.status || {}),
            lastFinishedAt: Number(data.status?.lastFinishedAt || 0),
          }));
        }
      } catch {
        // ignore
      }
    };

    loadWork();
    const t = setInterval(loadWork, 15000);
    return () => clearInterval(t);
  }, [backendUrl, dToken]);

  const startWork = useCallback(
    async (appointmentId, appointmentObj) => {
      if (!dToken) {
        alert("Token yo'q. Qayta login qiling.");
        return;
      }

      try {
        setStartingAppointmentId(String(appointmentId));
        const res = await fetch(`${backendUrl}/api/dentist/visit/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            dtoken: dToken,
          },
          body: JSON.stringify({ appointmentId }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          alert(data?.message || `Server xatoligi (${res.status})`);
          return;
        }

        if (!data?.success) {
          alert(data?.message || "Xatolik");
          return;
        }

        setLive((p) => ({
          ...p,
          state: "BUSY",
          currentAppointmentId: appointmentId,
        }));

        await loadAppointments();

        if (appointmentObj) {
          const patient = appointmentObj?.userData || appointmentObj?.userId;
          if (patient?._id) {
            await showTelegramQrForPatient(patient).catch(() => {});
          }
        }
      } catch {
        alert("Serverga ulanib bo'lmadi (network xatosi)");
      } finally {
        setStartingAppointmentId("");
      }
    },
    [backendUrl, dToken, loadAppointments, showTelegramQrForPatient],
  );

  const filtered = useMemo(() => {
    let list = Array.isArray(appointments) ? [...appointments] : [];

    // Live Orthodontic queue items for today are displayed in the top Ortho Queue section.
    // Filter them out from the bottom regular appointment list to avoid showing duplicates on both queues.
    if (isOrthodontist) {
      list = list.filter(
        (a) =>
          !(
            a.appointmentType === "ORTHODONTIC" &&
            a.slotDate === today &&
            ["WAITING", "IN_PROGRESS", "CALLED"].includes(String(a.status || ""))
          ),
      );
    }

    const withDerived = list.map((a) => ({
      a,
      derived: computeDerivedStatus({ a }),
    }));

    const pick = (pred) => withDerived.filter(pred).map((x) => x.a);

    if (filter === "TODAY") list = pick((x) => x.a.slotDate === today);
    else if (filter === "CANCELLED")
      list = pick((x) => x.derived.key === "CANCELLED");
    else if (filter === "MISSED")
      list = pick((x) => x.derived.key === "MISSED");
    else if (filter === "DONE") list = pick((x) => x.derived.key === "DONE");
    else if (filter === "PAID")
      list = pick((x) => {
        const a = x.a;
        if (x.derived.key !== "DONE") return false;
        const paid = Number(a.financial?.paidAmount || 0);
        return paid > 0;
      });
    else if (filter === "DEBT")
      list = pick((x) => {
        const a = x.a;
        if (x.derived.key === "CANCELLED") return false;

        const requested = Number(a?.financial?.requestedPaidNow || 0);
        if (requested > 0) return false;

        return getDebt(a) > 0;
      });
    else if (filter === "PENDING")
      list = pick(
        (x) => x.derived.key === "WAITING" || x.derived.key === "IN_PROGRESS",
      );
    else list = withDerived.map((x) => x.a);

    if (selectedPatientId) {
      list = list.filter(
        (a) => String(a.userId?._id || a.userId) === String(selectedPatientId),
      );
    }

    if (customDate) list = list.filter((a) => a.slotDate === customDate);

    if (search.trim()) {
      const term = search.toLowerCase();
      const digits = term.replace(/\D/g, "");
      const normTerm = normalizeText(term);

      list = list.filter((a) => {
        const patientObj = a.userData || a.userId || {};
        const rawName = patientObj?.name || "";
        const nameLc = rawName.toLowerCase();
        const nameNorm = normalizeText(rawName);
        const phone = (patientObj?.phone || "").replace(/\D/g, "");

        return (
          nameLc.includes(term) ||
          (normTerm && nameNorm.includes(normTerm)) ||
          (digits && phone.includes(digits))
        );
      });
    }

    return list;
  }, [appointments, filter, customDate, search, today, selectedPatientId, isOrthodontist]);

  const {
    groups: grouped,
    page,
    totalPages,
    nextPage,
    prevPage,
    resetPage,
  } = useAppointmentsDayPagination({
    list: filtered,
    todayYMD: today,
    perPageDays: 3,
    pinInProgress: true,
    getStatus: (a) => a?.status,
    getDate: (a) => a?.slotDate,
    getTime: (a) => a?.slotTime,
    sortItems: (x, y) => {
      const xActive = x?.status === "WAITING";
      const yActive = y?.status === "WAITING";

      if (xActive && !yActive) return -1;
      if (!xActive && yActive) return 1;

      if (xActive && yActive) {
        if (x?.isWalkIn && !y?.isWalkIn) return -1;
        if (!x?.isWalkIn && y?.isWalkIn) return 1;
      }

      const timeX = new Date(x?.createdAt || x?.date || 0).getTime();
      const timeY = new Date(y?.createdAt || y?.date || 0).getTime();
      return timeY - timeX;
    },
  });

  const submitCheckout = async (payload) => {
    const res = await checkoutVisit(payload);
    if (res?.ok === false)
      return { ok: false, message: res.message || "Xatolik" };
    const patient = activeAppointment?.userData || activeAppointment?.userId;
    setCheckoutOpen(false);
    setActiveAppointment(null);
    await loadAppointments();
    if (patient?._id) {
      await showTelegramQrForPatient(patient).catch(() => {});
    }
    return { ok: true };
  };

  const submitPayIn = async ({ appointmentId, payAmount }) => {
    if (typeof payAppointmentDebt !== "function") {
      return { ok: false, message: "payAppointmentDebt() topilmadi" };
    }
    const res = await payAppointmentDebt({ appointmentId, payAmount });
    if (res?.ok === false)
      return { ok: false, message: res.message || "Xatolik" };
    await loadAppointments();
    return { ok: true };
  };

  const clearPatientFilter = () => setSearchParams({});

  const countAll = appointments?.length || 0;
  const countFiltered = filtered.length;

  const totalDebt = useMemo(() => {
    return filtered.reduce((sum, a) => sum + getDebt(a), 0);
  }, [filtered]);

  useEffect(() => {
    resetPage();
  }, [filter, customDate, search, selectedPatientId]);

  const [orthoQueue, setOrthoQueue] = useState(null);
  const [orthoQueueLoading, setOrthoQueueLoading] = useState(false);
  const [orthoStartModalOpen, setOrthoStartModalOpen] = useState(false);
  const [orthoCompleteModalOpen, setOrthoCompleteModalOpen] = useState(false);
  const [selectedOrthoQueueItem, setSelectedOrthoQueueItem] = useState(null);

  const orthoQueueIndex = useMemo(() => {
    const byAppointmentId = new Map();
    const byPatientDayKey = new Map();
    const items = Array.isArray(orthoQueue?.snapshot?.items)
      ? orthoQueue.snapshot.items
      : [];

    for (const item of items) {
      const appointmentId = String(
        item?.appointmentId?._id || item?.appointmentId || "",
      );
      const patientId = String(item?.patientId?._id || item?.patientId || "");
      const dayKey = String(item?.dayKey || orthoQueue?.dayKey || "");

      if (appointmentId && !byAppointmentId.has(appointmentId)) {
        byAppointmentId.set(appointmentId, item);
      }

      if (
        patientId &&
        dayKey &&
        !byPatientDayKey.has(`${patientId}:${dayKey}`)
      ) {
        byPatientDayKey.set(`${patientId}:${dayKey}`, item);
      }
    }

    return { byAppointmentId, byPatientDayKey };
  }, [orthoQueue]);

  const orthoQueueDisplayItems = useMemo(() => {
    const items = Array.isArray(orthoQueue?.snapshot?.items)
      ? orthoQueue.snapshot.items
      : [];

    return sortOrthodontistQueueItems(items);
  }, [orthoQueue]);

  const orthoQueueActiveCount = useMemo(() => {
    return orthoQueueDisplayItems.filter(
      (item) =>
        !["DONE", "MISSED", "CANCELLED"].includes(
          String(item?.status || "").trim(),
        ),
    ).length;
  }, [orthoQueueDisplayItems]);

  const orthoQueueCurrentCardItem = useMemo(() => {
    return (
      orthoQueueDisplayItems.find(
        (item) => String(item?.status || "").trim() === "IN_PROGRESS",
      ) ||
      orthoQueue?.snapshot?.current ||
      null
    );
  }, [orthoQueue, orthoQueueDisplayItems]);

  const orthoQueueNextCardItem = useMemo(() => {
    return (
      orthoQueueDisplayItems.find((item) =>
        ["CALLED", "WAITING"].includes(String(item?.status || "").trim()),
      ) ||
      orthoQueue?.snapshot?.next ||
      null
    );
  }, [orthoQueue, orthoQueueDisplayItems]);

  const getLinkedOrthoQueueItemForAppointment = useCallback(
    (appointment) => {
      if (!isOrthodontist || !appointment) return null;

      const appointmentId = String(appointment?._id || "");
      if (appointmentId && orthoQueueIndex.byAppointmentId.has(appointmentId)) {
        return orthoQueueIndex.byAppointmentId.get(appointmentId) || null;
      }

      const patientId = String(
        appointment?.userData?._id ||
          appointment?.userId?._id ||
          appointment?.userId ||
          "",
      );
      const dayKey = String(appointment?.slotDate || "");

      if (!patientId || !dayKey) return null;

      return (
        orthoQueueIndex.byPatientDayKey.get(`${patientId}:${dayKey}`) || null
      );
    },
    [isOrthodontist, orthoQueueIndex],
  );

  const loadOrthoQueue = useCallback(async () => {
    if (!isOrthodontist || !dToken) return;

    try {
      setOrthoQueueLoading(true);

      const { data } = await axios.get(
        `${backendUrl}/api/dentist/orthodontist-queue`,
        { headers: { dtoken: dToken } },
      );

      if (!data?.success) {
        toast.error(data?.message || "Ortodont navbati yuklanmadi");
        return;
      }

      setOrthoQueue(data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Ortodont navbatini yuklashda xatolik",
      );
    } finally {
      setOrthoQueueLoading(false);
    }
  }, [backendUrl, dToken, isOrthodontist]);

  const [orthoQueueActionId, setOrthoQueueActionId] = useState("");

  const orthoBellRef = useRef(null);

  if (!orthoBellRef.current) {
    orthoBellRef.current = createOrthodontistBellPlayer();
  }

  const updateOrthoQueueStatus = useCallback(
    async (id, status, extra = {}) => {
      try {
        setOrthoQueueActionId(id);

        const { data } = await axios.post(
          `${backendUrl}/api/dentist/orthodontist-queue/${id}/status`,
          { status, ...extra },
          { headers: { dtoken: dToken } },
        );

        if (!data?.success) {
          return { ok: false, message: data?.message || "Navbat yangilanmadi" };
        }

        if (status === "CALLED") {
          await orthoBellRef.current?.play();
        }

        toast.success(data.message || "Navbat yangilandi");
        await loadOrthoQueue();
        if (["IN_PROGRESS", "DONE", "CANCELLED", "MISSED"].includes(status)) {
          await loadAppointments();
        }
        return { ok: true, data };
      } catch (error) {
        return {
          ok: false,
          message:
            error?.response?.data?.message || "Navbatni yangilashda xatolik",
        };
      } finally {
        setOrthoQueueActionId("");
      }
    },
    [backendUrl, dToken, loadAppointments, loadOrthoQueue],
  );

  const submitOrthoStart = useCallback(
    async ({ id }) => {
      const patient = selectedOrthoQueueItem?.patientId;
      const result = await updateOrthoQueueStatus(id, "IN_PROGRESS");

      if (result?.ok) {
        setOrthoStartModalOpen(false);
        setSelectedOrthoQueueItem(null);
        if (patient?._id) {
          await showTelegramQrForPatient(patient).catch(() => {});
        }
      } else if (result?.message) {
        toast.error(humanizeImageUploadMessage(result.message));
      }

      return result;
    },
    [updateOrthoQueueStatus, selectedOrthoQueueItem, showTelegramQrForPatient],
  );

  const completeOrthoQueue = useCallback(
    async ({ id, followUpDays, files = [] }) => {
      try {
        setOrthoQueueActionId(id);

        const fd = new FormData();

        if ([3, 7, 10, 15].includes(Number(followUpDays || 0))) {
          fd.append("followUpDays", String(Number(followUpDays)));
        }

        if (Array.isArray(files)) {
          files.forEach((file) => fd.append("xrays", file));
        }

        const { data } = await axios.post(
          `${backendUrl}/api/dentist/orthodontist-queue/${id}/complete`,
          fd,
          {
            headers: {
              dtoken: dToken,
              "Content-Type": "multipart/form-data",
            },
          },
        );

        if (!data?.success) {
          return { ok: false, message: data?.message || "Qabul tugatilmadi" };
        }

        toast.success(data.message || "Qabul tugatildi");

        if (data?.telegram?.ok === false) {
          if (data?.telegram?.code === "PATIENT_NOT_LINKED") {
            toast.warn(
              "Qabul saqlandi, lekin bemorning Telegram akkaunti ulanmagan.",
            );
          } else if (data?.telegram?.code === "FOLLOW_UP_NOT_SELECTED") {
            toast.warn(
              "Qabul saqlandi, lekin follow-up tanlanmagani uchun Telegram yuborilmadi.",
            );
          } else {
            toast.warn("Qabul saqlandi, lekin Telegram xabari yuborilmadi.");
          }
        }

        const reminderPlanFailed = String(
          data?.entry?.followUpMessageError || "",
        ).includes("REMINDER_PLAN_FAILED");

        const followUpSelected = [3, 7, 10, 15].includes(
          Number(data?.entry?.followUpDays || 0),
        );

        if (
          followUpSelected &&
          (reminderPlanFailed || Number(data?.reminders?.scheduled || 0) === 0)
        ) {
          toast.warn(
            "Qabul saqlandi, lekin follow-up eslatmalari rejalashtirilmadi.",
          );
        }

        const patient = selectedOrthoQueueItem?.patientId;
        setOrthoCompleteModalOpen(false);
        setSelectedOrthoQueueItem(null);
        await loadOrthoQueue();
        await loadAppointments();
        if (patient?._id) {
          await showTelegramQrForPatient(patient).catch(() => {});
        }
        return { ok: true, data };
      } catch (error) {
        return {
          ok: false,
          message:
            humanizeImageUploadMessage(
              error?.response?.data?.message || error?.message,
              "Ortodont qabulini tugatishda xatolik",
            ),
        };
      } finally {
        setOrthoQueueActionId("");
      }
    },
    [backendUrl, dToken, loadAppointments, loadOrthoQueue, selectedOrthoQueueItem, showTelegramQrForPatient],
  );

  const runSimpleOrthoStatus = useCallback(
    async (id, status) => {
      const result = await updateOrthoQueueStatus(id, status);
      if (!result?.ok && result?.message) {
        toast.error(humanizeImageUploadMessage(result.message));
      }
      return result;
    },
    [updateOrthoQueueStatus],
  );

  const convertOrthoQueueToVisit = useCallback(
    async (id, firstVisit = false) => {
      try {
        setOrthoQueueActionId(id);

        const { data } = await axios.post(
          `${backendUrl}/api/dentist/orthodontist-queue/${id}/convert-to-visit`,
          { firstVisit },
          { headers: { dtoken: dToken } },
        );

        if (!data?.success) {
          toast.error(humanizeImageUploadMessage(data?.message, "Oddiy qabul yaratilmadi"));
          return;
        }

        toast.success(
          data?.message ||
            (firstVisit
              ? "Birinchi ko‘rik yaratildi"
              : "Oddiy qabul yaratildi"),
        );

        await loadOrthoQueue();
        await loadAppointments();
      } catch (error) {
        toast.error(
          humanizeImageUploadMessage(
            error?.response?.data?.message || error?.message,
            "Oddiy qabul yaratishda xatolik",
          ),
        );
      } finally {
        setOrthoQueueActionId("");
      }
    },
    [backendUrl, dToken, loadOrthoQueue, loadAppointments],
  );

  useEffect(() => {
    loadOrthoQueue();
  }, [loadOrthoQueue]);

  useEffect(() => {
    const unlockBell = () => {
      orthoBellRef.current?.unlock();
    };

    window.addEventListener("pointerdown", unlockBell, { passive: true });
    window.addEventListener("keydown", unlockBell);

    return () => {
      window.removeEventListener("pointerdown", unlockBell);
      window.removeEventListener("keydown", unlockBell);
    };
  }, []);

  return (
    <main className="w-full flex justify-center px-4 py-6">
      <section className="w-full max-w-7xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              Mening uchrashuvlarim
            </h1>

            <button
              type="button"
              onClick={() => setWalkInOpen(true)}
              className={`mt-2 text-xs sm:text-sm px-3 py-2 rounded-xl font-medium ${
                live.state === "BUSY"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-primary text-white hover:opacity-90"
              }`}
            >
              Jonli qo‘shish
            </button>

            <button
              type="button"
              onClick={() => setManualBookingOpen(true)}
              className="mt-2 ml-2 text-xs sm:text-sm px-3 py-2 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              Rejali uchrashuv yaratish
            </button>

            <p className="text-sm text-gray-500 mt-2">
              Ko‘rsatilmoqda:{" "}
              <span className="font-semibold">{countFiltered}</span> /{" "}
              {countAll}
              {"  "}•{"  "}
              <span className="text-red-600 font-semibold">
                Umumiy qarz: {formatMoney(totalDebt)}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Live holat:{" "}
              <span className="font-semibold">
                {live.state === "BUSY" ? "BAND" : "BO‘SH"}
              </span>
            </p>
          </div>

          {selectedPatientId && (
            <button
              type="button"
              onClick={clearPatientFilter}
              className="text-xs sm:text-sm px-3 py-2 rounded-xl border hover:bg-gray-50 w-fit"
            >
              Barcha bemorlar
            </button>
          )}
        </div>

        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="flex flex-wrap gap-2">
              {[
                ["ALL", "Barchasi"],
                ["TODAY", "Bugun"],
                ["PENDING", "Kutilmoqda"],
                ["DONE", "Ko‘rilgan"],
                ["PAID", "To‘langan"],
                ["DEBT", "Qarz"],
                ["MISSED", "Kelmagan"],
                ["CANCELLED", "Bekor qilingan"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setFilter(key);
                    if (key === "TODAY") setCustomDate(today);
                    else setCustomDate("");
                  }}
                  className={`px-3 py-2 rounded-full text-sm font-medium border transition ${
                    filter === key
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:ml-auto">
              <input
                type="date"
                className="border rounded-xl px-3 py-2 text-sm"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
              <input
                className="border rounded-xl px-3 py-2 text-sm w-full sm:w-80"
                placeholder="Qidirish (ism / telefon)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-gray-600">
            Sahifa: <b>{page}</b> / {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              onClick={prevPage}
              disabled={page <= 1}
              className="px-3 py-2 rounded-xl border text-sm disabled:opacity-50"
            >
              ⬅ Oldingi
            </button>
            <button
              onClick={nextPage}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded-xl border text-sm disabled:opacity-50"
            >
              Keyingi ➡
            </button>
          </div>
        </div>

        {isOrthodontist && (
          <section className="mb-6 bg-white border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Ortodont navbati
                </h2>
                <p className="text-sm text-gray-500">
                  Yagona bugungi navbat: Telegram, jonli qo‘shish va bugungi
                  onlayn yozuvlar shu yerda birlashtiriladi
                </p>
              </div>
              <button
                type="button"
                onClick={loadOrthoQueue}
                className="px-4 py-2 rounded-xl border text-sm font-semibold"
              >
                Yangilash
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Faol navbat
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {orthoQueueActiveCount}
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Hozir qabulda
                </div>
                <div className="mt-2 text-sm font-semibold text-gray-900">
                  {orthoQueueCurrentCardItem?.patientId?.name
                    ? `#${orthoQueueCurrentCardItem.queueNo} — ${orthoQueueCurrentCardItem.patientId.name}`
                    : "Hozircha yo‘q"}
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Keyingi bemor
                </div>
                <div className="mt-2 text-sm font-semibold text-gray-900">
                  {orthoQueueNextCardItem?.patientId?.name
                    ? `#${orthoQueueNextCardItem.queueNo} — ${orthoQueueNextCardItem.patientId.name}`
                    : "Kutilayotgan bemor yo‘q"}
                </div>
              </div>
            </div>
            {orthoQueueLoading ? (
              <div className="mt-4 text-sm text-gray-500">Yuklanmoqda...</div>
            ) : !orthoQueueDisplayItems.length ? (
              <div className="mt-4 text-sm text-gray-500">
                Bugungi ortodont navbati hozircha yo‘q
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {orthoQueueDisplayItems.map((item) => {
                  const busy = orthoQueueActionId === item._id;
                  const patientName = item?.patientId?.name || "Bemor";
                  const patientPhone = item?.patientId?.phone || "";
                  const statusLabel = getQueueStatusLabel(item.status);
                  const isFirstVisitFlow = Boolean(item?.firstVisit);
                  const showQueueStartButton =
                    ["WAITING", "CALLED"].includes(item.status) &&
                    !isFirstVisitFlow;
                  const showQueueCompleteButton =
                    item.status === "IN_PROGRESS" && !isFirstVisitFlow;

                  const firstVisitPanelHint =
                    isFirstVisitFlow && item?.appointmentId
                      ? item.status === "IN_PROGRESS"
                        ? "Birinchi ko‘rik davom etmoqda — yakunlash uchun pastdagi uchrashuvdan Qabulni Tugallash ni bosing"
                        : "Birinchi ko‘rik — boshlash uchun pastdagi uchrashuvlar ro‘yxatidan 'Ishni boshladim' ni bosing"
                      : "";

                  return (
                    <div
                      key={item._id}
                      className="border rounded-2xl p-4 bg-gray-50 space-y-3"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-semibold text-gray-900">
                              #{item.queueNo} — {patientName}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white border text-gray-700">
                              {statusLabel}
                            </span>
                          </div>

                          <div className="mt-2 text-sm text-gray-600 space-y-1">
                            <p>
                              {item?.visitPurposeLabel || "Ortodont nazorat"}
                            </p>

                            {isFirstVisitFlow && (
                              <p className="font-medium text-purple-700">
                                Birinchi ko‘rik oqimi
                              </p>
                            )}

                            {patientPhone && <p>{patientPhone}</p>}

                            {item?.nextPlannedDate && (
                              <p>
                                Keyingi sana: {formatDMY(item.nextPlannedDate)}
                              </p>
                            )}

                            {Array.isArray(item?.progressImages) &&
                              item.progressImages.length > 0 && (
                                <p>Rasmlar: {item.progressImages.length} ta</p>
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!item.appointmentId &&
                          ["WAITING", "CALLED"].includes(item.status) && (
                            <>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  convertOrthoQueueToVisit(item._id, false)
                                }
                                className="px-3 py-2 rounded-xl border text-sm font-semibold disabled:opacity-60"
                              >
                                Oddiy qabul
                              </button>

                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  convertOrthoQueueToVisit(item._id, true)
                                }
                                className="px-3 py-2 rounded-xl border text-sm font-semibold disabled:opacity-60"
                              >
                                Birinchi ko‘rik
                              </button>
                            </>
                          )}

                        {["WAITING", "CALLED"].includes(item.status) && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              runSimpleOrthoStatus(item._id, "CALLED")
                            }
                            className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
                          >
                            Chaqirish
                          </button>
                        )}

                        {showQueueStartButton && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => submitOrthoStart({ id: item._id })}
                            className="px-3 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold disabled:opacity-60"
                          >
                            Qabul boshlandi
                          </button>
                        )}

                        {showQueueCompleteButton && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setSelectedOrthoQueueItem(item);
                              setOrthoCompleteModalOpen(true);
                            }}
                            className="px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60"
                          >
                            Tugatildi
                          </button>
                        )}

                        {firstVisitPanelHint && (
                          <div className="px-3 py-2 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 text-sm font-medium">
                            {firstVisitPanelHint}
                          </div>
                        )}

                        {["WAITING", "CALLED"].includes(item.status) && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              runSimpleOrthoStatus(item._id, "MISSED")
                            }
                            className="px-3 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold disabled:opacity-60"
                          >
                            Kelmadi
                          </button>
                        )}

                        {!["DONE", "MISSED", "CANCELLED"].includes(
                          item.status,
                        ) && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              runSimpleOrthoStatus(item._id, "CANCELLED")
                            }
                            className="px-3 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-60"
                          >
                            Bekor qilish
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
        {countFiltered === 0 ? (
          <div className="bg-white border rounded-2xl p-10 text-center text-gray-500">
            Uchrashuvlar topilmadi
          </div>
        ) : (
          <section className="space-y-6">
            {grouped.map((g) => (
              <div key={g.date} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-700">
                    {g.date === "IN_PROGRESS"
                      ? "Qabul qilinmoqda"
                      : formatWeekdayDMY(g.date)}
                  </h2>
                  <span className="text-xs text-gray-500">
                    {g.items.length}
                  </span>
                </div>

                <div className="grid gap-3">
                  {g.items.map((a) => {
                    const derived = computeDerivedStatus({ a });
                    const [statusLabelText, statusCls] = statusBadge(
                      derived,
                      a,
                    );
                    const [fromLabel, fromBadge] = createdFromLabel(
                      a.createdFrom,
                    );

                    const fin = a.financial || null;
                    const debt = getDebt(a);

                    const linkedOrthoItem =
                      getLinkedOrthoQueueItemForAppointment(a);
                    const isLinkedOrthoAppointment = Boolean(linkedOrthoItem);
                    const isOrthoFirstVisit = Boolean(
                      linkedOrthoItem?.firstVisit,
                    );
                    const isOrthoManagedControl =
                      isLinkedOrthoAppointment && !isOrthoFirstVisit;

                    const isCancelled = derived.key === "CANCELLED";
                    const dentistBusy = live.state === "BUSY";
                    const isNext =
                      live?.state === "AVAILABLE" &&
                      live?.next &&
                      String(live.next.appointmentId) === String(a._id);

                    const nextMinutes =
                      isNext && typeof live.next?.minutesLeft === "number"
                        ? live.next.minutesLeft
                        : null;

                    const canStart =
                      !isCancelled &&
                      a.status === "WAITING" &&
                      (!dentistBusy ||
                        String(live.currentAppointmentId) === String(a._id));

                    const canCheckout =
                      !isCancelled && a.status === "IN_PROGRESS";

                    const paymentRequestPending =
                      Number(fin?.requestedPaidNow || 0) > 0;
                    const canPay =
                      !isCancelled && debt > 0 && !paymentRequestPending;

                    const patientObj = a.userData || a.userId || {};
                    const patientName = patientObj?.name || "Noma’lum bemor";
                    const patientPhone = patientObj?.phone || "Telefon yo‘q";
                    const hasInfectiousDiseaseMarker = Boolean(
                      patientObj?.hasInfectiousDiseaseMarker,
                    );

                    return (
                      <article
                        key={a._id}
                        className="bg-white border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate inline-flex items-center gap-1 flex-wrap">
                                  {a.queueNo && (
                                    <span className="text-blue-600 font-extrabold mr-1">
                                      #{a.queueNo}
                                    </span>
                                  )}
                                  <span>{patientName}</span>
                                  {hasInfectiousDiseaseMarker && (
                                    <span
                                      className="text-sm font-bold leading-none text-gray-800"
                                      title="Maxfiy infeksion belgi bor"
                                    >
                                      *
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {patientPhone}
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2 items-center">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs ring-1 ${statusCls}`}
                                  >
                                    {statusLabelText}
                                  </span>

                                  {nextMinutes !== null && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-50 text-gray-700 ring-1 ring-gray-200">
                                      {nextMinutes} daqiqa qoldi
                                    </span>
                                  )}

                                  {dentistBusy && a.status === "WAITING" && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-50 text-gray-700 ring-1 ring-gray-200">
                                      Hozir band — navbat kutmoqda
                                    </span>
                                  )}

                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${fromBadge}`}
                                  >
                                    {fromLabel}
                                  </span>

                                  {a.isWalkIn && (
                                    <span
                                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        a.appointmentType === "ORTHODONTIC"
                                          ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                                          : "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
                                      }`}
                                    >
                                      {a.appointmentType === "ORTHODONTIC"
                                        ? "Ortodont ko'rik"
                                        : "Oddiy ko'rik"}
                                    </span>
                                  )}

                                  {a.rescheduled && (
                                    <span
                                      className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-amber-50 text-amber-800 ring-1 ring-amber-200 cursor-help"
                                      title={
                                        Array.isArray(a.rescheduleHistory) && a.rescheduleHistory.length > 0
                                          ? a.rescheduleHistory
                                              .map(
                                                (h, i) =>
                                                  `#${i + 1}: ${formatWeekdayDMY(h.oldSlotDate)} ${h.oldSlotTime} ➔ ${formatWeekdayDMY(h.newSlotDate)} ${h.newSlotTime} (${h.rescheduledByName || h.rescheduledBy}${h.reason ? ` - "${h.reason}"` : ""})`
                                              )
                                              .join("\n")
                                          : `Ko'chirdi: ${a.rescheduledByName || a.rescheduledBy}`
                                      }
                                    >
                                      🔄 Ko'chirilgan ({a.rescheduledByName || a.rescheduledBy})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                              <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-500">Vaqt</p>
                                <p className="font-semibold">
                                  {formatTime24(a.slotTime)}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-500">Narx</p>
                                <p className="font-semibold">
                                  {fin ? formatMoney(fin.amount) : "—"}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-500">
                                  To‘langan
                                </p>
                                <p className="font-semibold text-green-700">
                                  {fin ? formatMoney(fin.paidAmount) : "—"}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-500">Qarz</p>
                                <p className="font-semibold text-red-600">
                                  {fin ? formatMoney(debt) : "—"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col gap-2 sm:items-end">
                            {canStart && (
                              <button
                                onClick={() => startWork(a._id, a)}
                                disabled={startingAppointmentId === String(a._id)}
                                className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60"
                              >
                                {startingAppointmentId === String(a._id) ? "Boshlanmoqda..." : "Ishni boshladim"}
                              </button>
                            )}

                            {!canStart &&
                              a.status === "WAITING" &&
                              !isCancelled && (
                                <button
                                  disabled
                                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-600 text-sm font-semibold cursor-not-allowed"
                                  title={
                                    dentistBusy
                                      ? "Dentist hozir band"
                                      : "Hozircha boshlash mumkin emas"
                                  }
                                >
                                  Ishni boshladim
                                </button>
                              )}

                            {a.status === "WAITING" && !isCancelled && (
                              <button
                                type="button"
                                onClick={() => setRescheduleModalApp(a)}
                                className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-sm font-semibold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"
                              >
                                🔄 Vaqtini ko'chirish
                              </button>
                            )}

                            {canCheckout && (
                              <button
                                onClick={() => {
                                  setActiveAppointment(a);
                                  setCheckoutOpen(true);
                                }}
                                disabled={checkoutOpen || payOpen || Boolean(startingAppointmentId)}
                                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60"
                              >
                                Qabulni tugatish
                              </button>
                            )}

                            {canPay && (
                              <button
                                onClick={() => {
                                  setPayAppointment(a);
                                  setPayOpen(true);
                                }}
                                disabled={checkoutOpen || payOpen}
                                className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50 disabled:opacity-60"
                              >
                                To‘lov qo‘shish
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                navigator.clipboard?.writeText(
                                  patientObj?.phone || "",
                                )
                              }
                              className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
                            >
                              Telefonni nusxa olish
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )}
      </section>

      <CheckoutModal
        open={checkoutOpen}
        appointment={activeAppointment}
        templates={templates}
        backendUrl={backendUrl}
        dToken={dToken}
        onClose={() => {
          setCheckoutOpen(false);
          setActiveAppointment(null);
        }}
        onSubmit={submitCheckout}
      />

      <OrthodontistStartModal
        key={`ortho-start:${selectedOrthoQueueItem?._id || "none"}:${orthoStartModalOpen ? "open" : "closed"}`}
        open={orthoStartModalOpen}
        item={selectedOrthoQueueItem}
        onClose={() => {
          setOrthoStartModalOpen(false);
          setSelectedOrthoQueueItem(null);
        }}
        onSubmit={submitOrthoStart}
      />

      <OrthodontistCompleteModal
        key={`ortho-complete:${selectedOrthoQueueItem?._id || "none"}:${orthoCompleteModalOpen ? "open" : "closed"}`}
        open={orthoCompleteModalOpen}
        item={selectedOrthoQueueItem}
        onClose={() => {
          setOrthoCompleteModalOpen(false);
          setSelectedOrthoQueueItem(null);
        }}
        onSubmit={completeOrthoQueue}
      />

      <PayInModal
        open={payOpen}
        appointment={payAppointment}
        onClose={() => {
          setPayOpen(false);
          setPayAppointment(null);
        }}
        onSubmitPay={submitPayIn}
      />
      {walkInOpen && (
        <WalkInModal
          dentist={{ _id: profile?._id, name: profile?.name || "Stomatolog" }}
          isBusy={live.state === "BUSY"}
          onClose={() => setWalkInOpen(false)}
          lookupPatientFn={lookupPatient}
          createPatientFn={createPatient}
          onSubmit={async (payload) => {
            const res = await assignWalkIn(payload);
            if (res?.success) {
              await loadAppointments();
            }
            return res;
          }}
        />
      )}
      <ManualBookingModal
        open={manualBookingOpen}
        onClose={() => setManualBookingOpen(false)}
        onSubmit={async () => {
          await loadAppointments();
        }}
      />

      {tgQrOpen && (
        <TelegramPatientConnectModal
          open={tgQrOpen}
          onClose={() => setTgQrOpen(false)}
          link={tgQrLink}
          patient={tgQrPatient}
          title="Bemor Telegramga ulanishi"
        />
      )}

      {rescheduleModalApp && (
        <RescheduleModal
          open={Boolean(rescheduleModalApp)}
          appointment={rescheduleModalApp}
          onClose={() => setRescheduleModalApp(null)}
          onSuccess={() => loadAppointments()}
          isDentist={true}
        />
      )}
    </main>
  );
};

export default DentistAppointments;
