import { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { makeQrSvgDataUrl } from "../utils/qrSvg.js";

const TEXT = {
  uz: {
    title: "Bemor Telegramga ulanishi",
    subtitle: "Bemor yoki ota-ona telefon kamerasi bilan QR kodni skaner qilsin. Bir Telegram akkauntni bir nechta bemor kartasiga ulash mumkin.",
    scan: "QR kodni skaner qiling",
    open: "Telegramda ochish",
    copy: "Havolani nusxalash",
    close: "Yopish",
    patient: "Bemor",
    step1: "1. QR kodni skaner qiling yoki Telegramda oching.",
    step2: "2. Botda Start tugmasini bosing.",
    step3: "3. Magic Denta avtomatik ravishda bemorni Telegram bilan bog‘laydi.",
    help: "Agar ota-ona bir nechta farzand bilan kelsa, har bir bemor kartasida shu jarayonni takrorlang.",
    qrError: "QR kod tayyorlanmadi. Pastdagi havolani oching yoki nusxalang.",
    linkCopied: "Havola nusxalandi!",
  },
  ru: {
    title: "Подключение Telegram пациента",
    subtitle: "Пациент или родитель сканирует QR-код камерой телефона. Один Telegram-аккаунт можно подключить к нескольким картам детей/пациентов.",
    scan: "Отсканируйте QR-код",
    open: "Открыть в Telegram",
    copy: "Скопировать ссылку",
    close: "Закрыть",
    patient: "Пациент",
    step1: "1. Отсканируйте QR-код или откройте ссылку в Telegram.",
    step2: "2. Нажмите Start в боте.",
    step3: "3. Magic Denta автоматически привяжет пациента к Telegram.",
    help: "Если родитель пришёл с несколькими детьми, повторите этот процесс в карточке каждого пациента.",
    qrError: "QR-код не удалось подготовить. Откройте или скопируйте ссылку ниже.",
    linkCopied: "Ссылка скопирована!",
  },
  en: {
    title: "Connect patient Telegram",
    subtitle: "The patient or parent scans the QR code with a phone camera. One Telegram account can be linked to several children/patient cards.",
    scan: "Scan the QR code",
    open: "Open in Telegram",
    copy: "Copy link",
    close: "Close",
    patient: "Patient",
    step1: "1. Scan the QR code or open the link in Telegram.",
    step2: "2. Press Start in the bot.",
    step3: "3. Magic Denta automatically connects this patient to Telegram.",
    help: "If a parent brings several children, repeat this process in each patient card.",
    qrError: "Could not generate QR code. Open or copy the link below.",
    linkCopied: "Link copied!",
  },
  tg: {
    title: "Пайваст кардани Telegram-и бемор",
    subtitle: "Бемор ё волидайн бо камераи телефон рамзи QR-ро сканер кунанд. Як аккаунти Telegram-ро метавон ба якчанд кортҳои кӯдакон/беморон пайваст кард.",
    scan: "Сканер кардани рамзи QR",
    open: "Кушодан дар Telegram",
    copy: "Нусхабардории истинод",
    close: "Пӯшидан",
    patient: "Бемор",
    step1: "1. Рамзи QR-ро сканер кунед ё истинодро дар Telegram кушоед.",
    step2: "2. Дар бот Start-ро пахш кунед.",
    step3: "3. Magic Denta беморро бо Telegram ба таври худкор пайваст мекунад.",
    help: "Агар волидайн бо якчанд кӯдак омада бошад, ин равандро дар корти ҳар як бемор такрор кунед.",
    qrError: "Рамзи QR омода нашуд. Истиноди поёнро кушоед ё нусхабардорӣ кунед.",
    linkCopied: "Истинод нусхабардорӣ шуд!",
  },
};

const getActiveLang = () => {
  if (typeof localStorage === 'undefined') return 'uz';
  const val = localStorage.getItem('language') || 
              localStorage.getItem('medinson.desktop.language') || 
              localStorage.getItem('medinson:language') || 
              'uz';
  return val.slice(0, 2).toLowerCase();
};

const normalizeLang = (value) => {
  const clean = String(value || getActiveLang()).slice(0, 2).toLowerCase();
  return ["uz", "ru", "en", "tg"].includes(clean) ? clean : "uz";
};

const patientName = (patient, t) => String(patient?.name || patient?.fullName || t.patient || "").trim();

const getTgAppDeepLink = (webLink) => {
  if (!webLink) return "";
  try {
    const url = new URL(webLink);
    const domain = url.pathname.replace(/^\//, "");
    const start = url.searchParams.get("start");
    if (domain && start) {
      return `tg://resolve?domain=${domain}&start=${start}`;
    }
  } catch (e) {
    const match = webLink.match(/(?:t\.me|telegram\.me)\/([^/?]+)\?start=(.+)$/i);
    if (match) {
      return `tg://resolve?domain=${match[1]}&start=${match[2]}`;
    }
  }
  return webLink;
};

const TelegramPatientConnectModal = ({ open, onClose, link, patient, language, title = "" }) => {
  const lang = normalizeLang(language);
  const t = TEXT[lang] || TEXT.uz;
  const qrDataUrl = useMemo(() => {
    if (!link) return "";
    try {
      return makeQrSvgDataUrl(link);
    } catch (error) {
      console.warn("telegram qr generate failed:", error?.message || error);
      return "";
    }
  }, [link]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !link) return null;

  const copyLink = async () => {
    try {
      await navigator?.clipboard?.writeText?.(link);
      toast.success(t.linkCopied || "Havola nusxalandi!");
    } catch {
      return;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-6 pb-28 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl mt-10">
        <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
          <div>
            <p className="text-2xl font-bold text-primary">{title || t.title}</p>
            <p className="mt-1 text-sm text-gray-500">{patientName(patient, t)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border px-3 py-1.5 text-lg font-semibold text-gray-500 hover:bg-gray-50"
            aria-label={t.close}
          >
            ×
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[280px,1fr] md:items-center">
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-center">
            <p className="mb-4 text-base font-semibold text-primary">{t.scan}</p>
            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl bg-white p-3 shadow">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Telegram QR" className="h-full w-full object-contain" />
              ) : (
                <p className="px-4 text-xs leading-5 text-amber-700">{t.qrError}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm leading-6 text-gray-700">{t.subtitle}</p>
            <div className="rounded-2xl border bg-gray-50 p-4 text-xs leading-6 text-gray-700">
              <p>{t.step1}</p>
              <p>{t.step2}</p>
              <p>{t.step3}</p>
            </div>
            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">{t.help}</p>
            <div className="break-all rounded-2xl border bg-white p-3 text-xs text-primary">{link}</div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const tgLink = getTgAppDeepLink(link);
                  if (tgLink.startsWith("tg://")) {
                    window.location.href = tgLink;
                  } else {
                    window.open(link, "_blank", "noopener,noreferrer");
                  }
                }}
                className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90 active:scale-95 transition-all"
              >
                {t.open}
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="rounded-xl border bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
              >
                {t.copy}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 active:scale-95 transition-all"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramPatientConnectModal;
