import { useMemo } from "react";

export const FDI_ADULT_TOOTH_NUMBERS = [
  "18", "17", "16", "15", "14", "13", "12", "11",
  "21", "22", "23", "24", "25", "26", "27", "28",
  "31", "32", "33", "34", "35", "36", "37", "38",
  "41", "42", "43", "44", "45", "46", "47", "48",
];

const FDI_SET = new Set(FDI_ADULT_TOOTH_NUMBERS);

const FDI_TO_US = {
  "18": "1", "17": "2", "16": "3", "15": "4", "14": "5", "13": "6", "12": "7", "11": "8",
  "21": "9", "22": "10", "23": "11", "24": "12", "25": "13", "26": "14", "27": "15", "28": "16",
  "38": "17", "37": "18", "36": "19", "35": "20", "34": "21", "33": "22", "32": "23", "31": "24",
  "41": "25", "42": "26", "43": "27", "44": "28", "45": "29", "46": "30", "47": "31", "48": "32"
};

const getDisplayToothNumber = (toothNumber, isUniversal) => {
  if (isUniversal && FDI_TO_US[toothNumber]) {
    return FDI_TO_US[toothNumber];
  }
  return toothNumber;
};

export const TOOTH_PROCEDURE_OPTIONS = [
  { code: "CHECKED", label: "Tekshirildi" },
  { code: "FIXED", label: "Tuzatildi" },
  { code: "FILLING", label: "Plomba" },
  { code: "CLEANING", label: "Tozalash" },
  { code: "ROOT_CANAL", label: "Kanal davolash" },
  { code: "EXTRACTION", label: "Olib tashlash" },
  { code: "CROWN", label: "Koronka" },
  { code: "ORTHO", label: "Ortodont" },
  { code: "WATCH", label: "Kuzatish" },
];

export const TOOTH_STATUS_OPTIONS = [
  { code: "DONE", label: "Belgilangan", dotClass: "bg-primary" },
  { code: "HEALTHY", label: "Sog‘lom", dotClass: "bg-emerald-500" },
  { code: "TREATED", label: "Davolangan", dotClass: "bg-sky-500" },
  { code: "SUSPICIOUS", label: "Muammo ehtimoli", dotClass: "bg-amber-500" },
  { code: "EXTRACTED", label: "Olingan", dotClass: "bg-slate-500" },
];

const PROCEDURE_LABEL_BY_CODE = TOOTH_PROCEDURE_OPTIONS.reduce((acc, item) => {
  acc[item.code] = item.label;
  return acc;
}, {});

const STATUS_LABEL_BY_CODE = TOOTH_STATUS_OPTIONS.reduce((acc, item) => {
  acc[item.code] = item.label;
  return acc;
}, {});

const normalizeChartItem = (item = {}) => {
  const toothNumber = String(item.toothNumber || "").trim();
  if (!FDI_SET.has(toothNumber)) return null;

  const procedureCode = String(item.procedureCode || "CHECKED").trim().toUpperCase();
  const safeProcedureCode = PROCEDURE_LABEL_BY_CODE[procedureCode] ? procedureCode : "CHECKED";
  const statusCode = String(item.status || "DONE").trim().toUpperCase();
  const safeStatus = STATUS_LABEL_BY_CODE[statusCode] ? statusCode : "DONE";

  return {
    toothNumber,
    procedureCode: safeProcedureCode,
    procedureLabel: PROCEDURE_LABEL_BY_CODE[safeProcedureCode] || item.procedureLabel || "Tekshirildi",
    status: safeStatus,
    statusLabel: STATUS_LABEL_BY_CODE[safeStatus] || "Belgilangan",
    surfaces: Array.isArray(item.surfaces) ? item.surfaces.map(String).filter(Boolean) : [],
    notes: String(item.notes || ""),
    createdAt: item.createdAt || new Date().toISOString(),
  };
};

export const normalizeToothChart = (items = []) => {
  if (!Array.isArray(items)) return [];
  const byTooth = new Map();
  for (const item of items) {
    const normalized = normalizeChartItem(item);
    if (normalized) byTooth.set(normalized.toothNumber, normalized);
  }
  return [...byTooth.values()].sort(
    (a, b) => FDI_ADULT_TOOTH_NUMBERS.indexOf(a.toothNumber) - FDI_ADULT_TOOTH_NUMBERS.indexOf(b.toothNumber),
  );
};

export const parseToothChartFromText = (text = "") => {
  const matches = String(text || "").match(/\b(?:1[1-8]|2[1-8]|3[1-8]|4[1-8])\b/g) || [];
  return normalizeToothChart(
    [...new Set(matches)].map((toothNumber) => ({
      toothNumber,
      procedureCode: "CHECKED",
      procedureLabel: "Tekshirildi",
      status: "DONE",
      surfaces: [],
      notes: "",
      createdAt: new Date().toISOString(),
    })),
  );
};

export const extractToothNumbers = (...values) => {
  const joined = values
    .flatMap((item) => {
      if (Array.isArray(item)) return item;
      if (item === null || item === undefined) return [];
      return [item];
    })
    .map((item) => String(item || ""))
    .join(" ");

  const matches = joined.match(/\b(?:1[1-8]|2[1-8]|3[1-8]|4[1-8])\b/g) || [];
  return [...new Set(matches.filter((item) => FDI_SET.has(String(item))))];
};

export const summarizeToothChart = (items = []) => {
  const normalized = normalizeToothChart(items);
  return normalized.map((item) => `${item.toothNumber} — ${item.procedureLabel || "Tekshirildi"}`).join(", ");
};

const getToothFamily = (toothNumber = "") => {
  const lastDigit = Number(String(toothNumber).slice(-1));
  if ([1, 2].includes(lastDigit)) return "incisor";
  if (lastDigit === 3) return "canine";
  if ([4, 5].includes(lastDigit)) return "premolar";
  return "molar";
};

const createArchLayout = () => {
  const upper = [
    { toothNumber: "18", x: 130, y: 182, rotate: -36, arch: "upper" },
    { toothNumber: "17", x: 182, y: 153, rotate: -28, arch: "upper" },
    { toothNumber: "16", x: 236, y: 128, rotate: -20, arch: "upper" },
    { toothNumber: "15", x: 291, y: 110, rotate: -13, arch: "upper" },
    { toothNumber: "14", x: 347, y: 97, rotate: -8, arch: "upper" },
    { toothNumber: "13", x: 402, y: 87, rotate: -4, arch: "upper" },
    { toothNumber: "12", x: 457, y: 82, rotate: 0, arch: "upper" },
    { toothNumber: "11", x: 511, y: 82, rotate: 4, arch: "upper" },
    { toothNumber: "21", x: 566, y: 82, rotate: -4, arch: "upper" },
    { toothNumber: "22", x: 620, y: 87, rotate: 0, arch: "upper" },
    { toothNumber: "23", x: 675, y: 97, rotate: 4, arch: "upper" },
    { toothNumber: "24", x: 730, y: 110, rotate: 9, arch: "upper" },
    { toothNumber: "25", x: 785, y: 128, rotate: 15, arch: "upper" },
    { toothNumber: "26", x: 838, y: 154, rotate: 23, arch: "upper" },
    { toothNumber: "27", x: 886, y: 184, rotate: 31, arch: "upper" },
    { toothNumber: "28", x: 924, y: 218, rotate: 40, arch: "upper" },
  ];

  const lower = [
    { toothNumber: "48", x: 130, y: 559, rotate: 36, arch: "lower" },
    { toothNumber: "47", x: 182, y: 588, rotate: 28, arch: "lower" },
    { toothNumber: "46", x: 236, y: 613, rotate: 20, arch: "lower" },
    { toothNumber: "45", x: 291, y: 631, rotate: 13, arch: "lower" },
    { toothNumber: "44", x: 347, y: 644, rotate: 8, arch: "lower" },
    { toothNumber: "43", x: 402, y: 654, rotate: 4, arch: "lower" },
    { toothNumber: "42", x: 457, y: 659, rotate: 0, arch: "lower" },
    { toothNumber: "41", x: 511, y: 659, rotate: -4, arch: "lower" },
    { toothNumber: "31", x: 566, y: 659, rotate: 4, arch: "lower" },
    { toothNumber: "32", x: 620, y: 654, rotate: 0, arch: "lower" },
    { toothNumber: "33", x: 675, y: 644, rotate: -4, arch: "lower" },
    { toothNumber: "34", x: 730, y: 631, rotate: -9, arch: "lower" },
    { toothNumber: "35", x: 785, y: 613, rotate: -15, arch: "lower" },
    { toothNumber: "36", x: 838, y: 588, rotate: -23, arch: "lower" },
    { toothNumber: "37", x: 886, y: 559, rotate: -31, arch: "lower" },
    { toothNumber: "38", x: 924, y: 524, rotate: -40, arch: "lower" },
  ];

  return [...upper, ...lower].map((item) => ({
    ...item,
    family: getToothFamily(item.toothNumber),
  }));
};

const TOOTH_LAYOUT = createArchLayout();

const toothPalette = {
  NONE: { border: "#94a3b8", fill: "url(#toothIdleFill)", ring: "transparent", label: "#334155" },
  DONE: { border: "#1d4ed8", fill: "url(#toothMarkedFill)", ring: "#bfdbfe", label: "#0f172a" },
  HEALTHY: { border: "#059669", fill: "url(#toothHealthyFill)", ring: "#a7f3d0", label: "#064e3b" },
  TREATED: { border: "#0284c7", fill: "url(#toothTreatedFill)", ring: "#bae6fd", label: "#0c4a6e" },
  SUSPICIOUS: { border: "#ea580c", fill: "url(#toothSuspiciousFill)", ring: "#fed7aa", label: "#7c2d12" },
  EXTRACTED: { border: "#475569", fill: "url(#toothExtractedFill)", ring: "#cbd5e1", label: "#334155" },
  AI_SUSPECT: { border: "#f97316", fill: "url(#toothAiFill)", ring: "#ffedd5", label: "#9a3412" },
};

const getVisualState = (item, isAiSuggested) => {
  if (item?.status && toothPalette[item.status]) return item.status;
  if (isAiSuggested) return "AI_SUSPECT";
  return item ? "DONE" : "NONE";
};

const crownPathMap = {
  incisor: "M -16 -18 Q -15 -32 -4 -36 Q 0 -37 4 -36 Q 15 -32 16 -18 L 15 10 Q 8 18 0 18 Q -8 18 -15 10 Z",
  canine: "M -15 -12 Q -12 -24 -5 -33 Q 0 -39 5 -33 Q 12 -24 15 -12 L 14 10 Q 7 18 0 18 Q -7 18 -14 10 Z",
  premolar: "M -19 -12 Q -18 -27 -8 -33 Q 0 -36 8 -33 Q 18 -27 19 -12 L 18 10 Q 10 18 0 18 Q -10 18 -18 10 Z",
  molar: "M -22 -10 Q -22 -24 -13 -31 Q -5 -36 0 -35 Q 5 -36 13 -31 Q 22 -24 22 -10 L 20 11 Q 12 18 0 18 Q -12 18 -20 11 Z",
};

const rootPathMap = {
  incisor: "M -10 15 L -6 46 Q -4 59 -8 72 L -3 74 Q 0 61 0 46 Q 0 61 3 74 L 8 72 Q 4 59 6 46 L 10 15 Z",
  canine: "M -8 14 L -4 45 Q -2 58 -4 79 L 0 84 L 4 79 Q 2 58 4 45 L 8 14 Z",
  premolar: "M -13 14 L -10 44 Q -8 58 -12 75 L -6 77 Q -1 61 -1 46 Q -1 61 6 77 L 12 75 Q 8 58 10 44 L 13 14 Z",
  molar: "M -15 14 L -13 36 Q -13 50 -19 72 L -11 74 Q -5 56 -5 42 Q -3 55 0 79 Q 4 55 5 42 Q 5 56 11 74 L 19 72 Q 13 50 13 36 L 15 14 Z",
};

const occlusalMap = {
  incisor: "M -8 -8 Q 0 -12 8 -8 Q 7 -2 0 1 Q -7 -2 -8 -8 Z",
  canine: "M -6 -8 Q 0 -14 6 -8 Q 4 -2 0 0 Q -4 -2 -6 -8 Z",
  premolar: "M -10 -7 Q -4 -12 0 -12 Q 4 -12 10 -7 Q 8 0 0 2 Q -8 0 -10 -7 Z",
  molar: "M -12 -7 Q -8 -14 0 -14 Q 8 -14 12 -7 Q 10 1 0 4 Q -10 1 -12 -7 Z",
};

const TOOTH_I18N = {
  uz: {
    "Tish xaritasi": "Tish xaritasi",
    "Tish ko‘rik xaritasi": "Tish ko‘rik xaritasi",
    "Jag‘ yoylari va tish shakllari yanada tabiiy ko‘rinishda berildi. Tishni bosing va holatini, bajarilgan ishni hamda klinik izohni kiriting.": "Jag‘ yoylari va tish shakllari yanada tabiiy ko‘rinishda berildi. Tishni bosing va holatini, bajarilgan ishni hamda klinik izohni kiriting.",
    "FDI katta yosh tishlari": "Tish raqamlash: 11-48",
    "Tanlangan: {count} ta": "Tanlangan: {count} ta",
    "Yuqori jag‘": "Yuqori jag‘",
    "Pastki jag‘": "Pastki jag‘",
    "Interaktiv xarita": "Interaktiv xarita",
    "Yuqori o‘ng": "Yuqori o‘ng",
    "Yuqori chap": "Yuqori chap",
    "Pastki o‘ng": "Pastki o‘ng",
    "Pastki chap": "Pastki chap",
    "Tanlangan tishlar boʻyicha holat va bajarilgan ish": "Tanlangan tishlar boʻyicha holat va bajarilgan ish",
    "{count} ta tanlangan": "{count} ta tanlangan",
    "O‘chirish": "O‘chirish",
    "Holati": "Holati",
    "Ish turi": "Ish turi",
    "Izoh (ixtiyoriy)": "Izoh (ixtiyoriy)",
    "Masalan: distal yuzasi, milk atrofida sezgir": "Masalan: distal yuzasi, milk atrofida sezgir",
    "Ko‘rsatilgan tishlar": "Ko‘rsatilgan tishlar",
    "Tanlangan tishlar": "Tanlangan tishlar",
    "Tekshirildi": "Tekshirildi",
    "Tuzatildi": "Tuzatildi",
    "Plomba": "Plomba",
    "Tozalash": "Tozalash",
    "Kanal davolash": "Kanal davolash",
    "Olib tashlash": "Olib tashlash",
    "Koronka": "Koronka",
    "Ortodont": "Ortodont",
    "Kuzatish": "Kuzatish",
    "Belgilangan": "Belgilangan",
    "Sog‘lom": "Sog‘lom",
    "Davolangan": "Davolangan",
    "Muammo ehtimoli": "Muammo ehtimoli",
    "Olingan": "Olingan",
  },
  ru: {
    "Tish xaritasi": "Карта зубов",
    "Tish ko‘rik xaritasi": "Карта осмотра зубов",
    "Jag‘ yoylari va tish shakllari yanada tabiiy ko‘rinishda berildi. Tishni bosing va holatini, bajarilgan ishni hamda klinik izohni kiriting.": "Зубные дуги и формы зубов показаны более естественно. Нажмите на зуб и укажите его состояние, выполненную работу и клинический комментарий.",
    "FDI katta yosh tishlari": "Нумерация зубов: 11-48",
    "Tanlangan: {count} ta": "Выбрано: {count}",
    "Yuqori jag‘": "Верхняя челюсть",
    "Pastki jag‘": "Нижняя челюсть",
    "Interaktiv xarita": "Интерактивная карта",
    "Yuqori o‘ng": "Верхняя правая",
    "Yuqori chap": "Верхняя левая",
    "Pastki o‘ng": "Нижняя правая",
    "Pastki chap": "Нижняя левая",
    "Tanlangan tishlar boʻyicha holat va bajarilgan ish": "Состояние и выполненная работа по выбранным зубам",
    "{count} ta tanlangan": "Выбрано: {count}",
    "O‘chirish": "Удалить",
    "Holati": "Статус",
    "Ish turi": "Тип работы",
    "Izoh (ixtiyoriy)": "Примечание (необязательно)",
    "Masalan: distal yuzasi, milk atrofida sezgir": "Например: дистальная поверхность, чувствительность возле десны",
    "Ko‘rsatilgan tishlar": "Показанные зубы",
    "Tanlangan tishlar": "Выбранные зубы",
    "Tekshirildi": "Осмотрен",
    "Tuzatildi": "Исправлено",
    "Plomba": "Пломба",
    "Tozalash": "Чистка",
    "Kanal davolash": "Лечение каналов",
    "Olib tashlash": "Удаление",
    "Koronka": "Коронка",
    "Ortodont": "Ортодонтия",
    "Kuzatish": "Наблюдение",
    "Belgilangan": "Отмечено",
    "Sog‘lom": "Здоровый",
    "Davolangan": "Лечёный",
    "Muammo ehtimoli": "Возможная проблема",
    "Olingan": "Удалён",
  },
};

const normalizeToothLanguage = (language) => {
  const code = String(language || "").slice(0, 2).toLowerCase();
  return ["uz", "ru", "en", "tg"].includes(code) ? code : "uz";
};

const interpolateToothText = (text, params = {}) => String(text ?? "").replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ""));

const ToothShape = ({
  layout,
  item,
  activeVisual,
  onClick,
  readOnly = false,
  showAiBadge = false,
  aiSuggestedLabel = "AI ko‘makchi shubhali deb ko‘rsatdi",
}) => {
  const isUniversal = localStorage.getItem("medinson_tooth_notation") === "universal";
  const displayNo = getDisplayToothNumber(layout.toothNumber, isUniversal);
  const palette = toothPalette[activeVisual] || toothPalette.NONE;
  const family = layout.family || "molar";
  const flipY = layout.arch === "lower" ? -1 : 1;
  const ringRx = family === "molar" ? 28 : family === "premolar" ? 23 : 19;
  const label = item
    ? `${displayNo} — ${item.procedureLabel || "Tekshirildi"}${item.statusLabel ? ` • ${item.statusLabel}` : ""}${item.notes ? ` • ${item.notes}` : ""}`
    : showAiBadge
      ? `${displayNo} — ${aiSuggestedLabel}`
      : `${displayNo}`;

  return (
    <g
      transform={`translate(${layout.x} ${layout.y}) rotate(${layout.rotate}) scale(1 ${flipY})`}
      onClick={readOnly ? undefined : onClick}
      className={readOnly ? "" : "cursor-pointer transition-opacity duration-150 hover:opacity-95"}
      role={readOnly ? undefined : "button"}
      tabIndex={readOnly ? -1 : 0}
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      onKeyDown={(event) => {
        if (readOnly) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      {!readOnly ? <ellipse cx="0" cy="8" rx="34" ry="56" fill="transparent" /> : null}
      <ellipse cx="0" cy="8" rx={ringRx} ry="45" fill={palette.ring} opacity="0.55" />
      <path d={rootPathMap[family] || rootPathMap.molar} fill="url(#toothRootFill)" stroke={palette.border} strokeWidth="1.6" />
      <path d={crownPathMap[family] || crownPathMap.molar} fill={palette.fill} stroke={palette.border} strokeWidth="2.2" />
      <path d={occlusalMap[family] || occlusalMap.molar} fill="none" stroke="rgba(15, 23, 42, 0.12)" strokeWidth="1.3" />
      <path d={crownPathMap[family] || crownPathMap.molar} fill="url(#toothGlossFill)" opacity="0.35" />
      {activeVisual === "EXTRACTED" ? (
        <>
          <line x1="-17" y1="-20" x2="17" y2="55" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <line x1="17" y1="-20" x2="-17" y2="55" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : null}
      <g transform={flipY === -1 ? "scale(1 -1)" : undefined}>
        <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="700" fill={palette.label} pointerEvents="none">{displayNo}</text>
        {showAiBadge ? (
          <>
            <circle cx="18" cy="-20" r="8" fill="#f97316" stroke="#fff" strokeWidth="2" />
            <text x="18" y="-17" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff" pointerEvents="none">AI</text>
          </>
        ) : null}
      </g>
      <title>{label}</title>
    </g>
  );
};

const ToothChartPicker = ({
  value = [],
  onChange,
  suggestedTeeth = [],
  readOnly = false,
  title = "Tish ko‘rik xaritasi",
  description = "Jag‘ yoylari va tish shakllari yanada tabiiy ko‘rinishda berildi. Tishni bosing va holatini, bajarilgan ishni hamda klinik izohni kiriting.",
  defaultStatus = "DONE",
  defaultProcedureCode = "CHECKED",
  defaultNotes = "",
}) => {
  const toothData = useMemo(() => {
    const norm = normalizeToothChart(value);
    const map = new Map();
    norm.forEach((item) => map.set(item.toothNumber, item));
    const sug = new Set(extractToothNumbers(suggestedTeeth));
    return { selected: norm, selectedByNumber: map, suggestedSet: sug };
  }, [value, suggestedTeeth]);
  const { selected, selectedByNumber, suggestedSet } = toothData;

  const lang = normalizeToothLanguage(localStorage.getItem("language") || "uz");
  const isUniversal = localStorage.getItem("medinson_tooth_notation") === "universal";
  const tt = (key, params = {}) => {
    const row = TOOTH_I18N[lang] || TOOTH_I18N.uz;
    return interpolateToothText(row[key] || TOOTH_I18N.uz[key] || key, params);
  };
  const translatedTitle = tt(title);
  const translatedDescription = tt(description);
  const localizedStatusOptions = TOOTH_STATUS_OPTIONS.map((item) => ({ ...item, label: tt(item.label) }));
  const localizedProcedureOptions = TOOTH_PROCEDURE_OPTIONS.map((item) => ({ ...item, label: tt(item.label) }));
  const localizedProcedureLabel = (code, fallback = "") => {
    const item = TOOTH_PROCEDURE_OPTIONS.find((option) => option.code === String(code || "").toUpperCase());
    return item ? tt(item.label) : tt(fallback || "Tekshirildi");
  };
  const safeDefaultStatus = STATUS_LABEL_BY_CODE[String(defaultStatus || "").toUpperCase()] ? String(defaultStatus).toUpperCase() : "DONE";
  const safeDefaultProcedure = PROCEDURE_LABEL_BY_CODE[String(defaultProcedureCode || "").toUpperCase()] ? String(defaultProcedureCode).toUpperCase() : "CHECKED";
  const defaultStatusLabel = STATUS_LABEL_BY_CODE[safeDefaultStatus] || "Belgilangan";
  const defaultProcedureLabel = PROCEDURE_LABEL_BY_CODE[safeDefaultProcedure] || "Tekshirildi";
  const summarizeLocalizedToothChart = (items = []) => normalizeToothChart(items)
    .map((item) => getDisplayToothNumber(item.toothNumber, isUniversal) + " — " + localizedProcedureLabel(item.procedureCode, item.procedureLabel))
    .join(", ");
  const archLabels = {
    upper: { left: tt("Yuqori o‘ng"), right: tt("Yuqori chap") },
    lower: { left: tt("Pastki o‘ng"), right: tt("Pastki chap") },
  };

  const update = (next) => onChange?.(normalizeToothChart(next));

  const toggleTooth = (toothNumber) => {
    if (readOnly) return;
    if (selectedByNumber.has(toothNumber)) {
      update(selected.filter((item) => item.toothNumber !== toothNumber));
      return;
    }

    update([
      ...selected,
      {
        toothNumber,
        procedureCode: suggestedSet.has(toothNumber) ? "WATCH" : safeDefaultProcedure,
        procedureLabel: suggestedSet.has(toothNumber) ? "Kuzatish" : defaultProcedureLabel,
        status: suggestedSet.has(toothNumber) ? "SUSPICIOUS" : safeDefaultStatus,
        statusLabel: suggestedSet.has(toothNumber) ? "Muammo ehtimoli" : defaultStatusLabel,
        surfaces: [],
        notes: suggestedSet.has(toothNumber) ? "AI ko‘makchi shubhali deb belgiladi" : String(defaultNotes || ""),
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const patchTooth = (toothNumber, patch = {}) => {
    if (readOnly) return;
    update(selected.map((item) => {
      if (item.toothNumber !== toothNumber) return item;
      const procedureCode = String(patch.procedureCode || item.procedureCode || "CHECKED").toUpperCase();
      const status = String(patch.status || item.status || "DONE").toUpperCase();
      return {
        ...item,
        ...patch,
        procedureCode,
        procedureLabel: PROCEDURE_LABEL_BY_CODE[procedureCode] || item.procedureLabel || "Tekshirildi",
        status,
        statusLabel: STATUS_LABEL_BY_CODE[status] || item.statusLabel || "Belgilangan",
      };
    }));
  };

  return (
    <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-primary/5 px-4 py-3.5 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{tt("Tish xaritasi")}</p>
            <p className="mt-0.5 text-sm sm:text-base font-semibold text-slate-900">{translatedTitle}</p>
            <p className="mt-0.5 text-xs text-slate-500">{translatedDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {tt("Tanlangan: {count} ta", { count: selected.length })}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {localizedStatusOptions.map((item) => (
            <span key={item.code} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
              <span className={`h-2.5 w-2.5 rounded-full ${item.dotClass}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
          <div className="mb-0 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
            <span>{tt("Yuqori jag‘")}</span>
            <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600 ring-1 ring-slate-200">{tt("Interaktiv xarita")}</span>
            <span>{tt("Pastki jag‘")}</span>
          </div>

          <div className="relative overflow-hidden rounded-b-[20px] bg-slate-50 p-2 sm:p-3">
            <svg viewBox="0 0 1050 760" className="h-auto w-full max-h-[420px]">
            <defs>
              <linearGradient id="gumFillTop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f9d7df" />
                <stop offset="100%" stopColor="#f3b6c4" />
              </linearGradient>
              <linearGradient id="gumFillBottom" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f3b6c4" />
                <stop offset="100%" stopColor="#f9d7df" />
              </linearGradient>
              <linearGradient id="toothIdleFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f8fafc" />
              </linearGradient>
              <linearGradient id="toothMarkedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eff6ff" />
                <stop offset="100%" stopColor="#dbeafe" />
              </linearGradient>
              <linearGradient id="toothHealthyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ecfdf5" />
                <stop offset="100%" stopColor="#d1fae5" />
              </linearGradient>
              <linearGradient id="toothTreatedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f0f9ff" />
                <stop offset="100%" stopColor="#dbeafe" />
              </linearGradient>
              <linearGradient id="toothSuspiciousFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff7ed" />
                <stop offset="100%" stopColor="#ffedd5" />
              </linearGradient>
              <linearGradient id="toothAiFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff7ed" />
                <stop offset="100%" stopColor="#fed7aa" />
              </linearGradient>
              <linearGradient id="toothExtractedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
              <linearGradient id="toothRootFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fffdf7" />
                <stop offset="100%" stopColor="#f8fafc" />
              </linearGradient>
              <linearGradient id="toothGlossFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="35%" stopColor="#ffffff" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.08" />
              </filter>
            </defs>

            <g filter="url(#softShadow)">
              <path d="M 112 292 Q 262 98 525 84 Q 788 98 938 292 L 870 350 Q 755 214 525 206 Q 295 214 180 350 Z" fill="url(#gumFillTop)" opacity="0.9" />
              <path d="M 180 426 Q 295 562 525 570 Q 755 562 870 426 L 938 368 Q 788 562 525 576 Q 262 562 112 368 Z" fill="url(#gumFillBottom)" opacity="0.9" />
              <path d="M 147 254 Q 300 132 525 124 Q 750 132 903 254" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="10" strokeLinecap="round" />
              <path d="M 147 406 Q 300 528 525 536 Q 750 528 903 406" fill="none" stroke="rgba(255,255,255,0.52)" strokeWidth="10" strokeLinecap="round" />
              <path d="M 125 292 Q 275 130 525 118 Q 775 130 925 292" fill="none" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="8" strokeLinecap="round" />
              <path d="M 125 368 Q 275 530 525 542 Q 775 530 925 368" fill="none" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="8" strokeLinecap="round" />
            </g>

            <text x="120" y="72" fontSize="18" fontWeight="600" fill="#64748b">{archLabels.upper.left}</text>
            <text x="810" y="72" fontSize="18" fontWeight="600" fill="#64748b">{archLabels.upper.right}</text>
            <text x="120" y="732" fontSize="18" fontWeight="600" fill="#64748b">{archLabels.lower.left}</text>
            <text x="814" y="732" fontSize="18" fontWeight="600" fill="#64748b">{archLabels.lower.right}</text>

            {TOOTH_LAYOUT.map((layout) => {
              const selectedItem = selectedByNumber.get(layout.toothNumber);
              const isAiSuggested = suggestedSet.has(layout.toothNumber);
              const activeVisual = getVisualState(selectedItem, isAiSuggested);
              return (
                <ToothShape
                  key={layout.toothNumber}
                  layout={layout}
                  item={selectedItem}
                  activeVisual={activeVisual}
                  onClick={() => toggleTooth(layout.toothNumber)}
                  readOnly={readOnly}
                  showAiBadge={isAiSuggested}
                  aiSuggestedLabel={tt("AI ko‘makchi shubhali deb ko‘rsatdi")}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {selected.length > 0 && !readOnly ? (
        <div className="mt-3 space-y-2.5 rounded-[18px] border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-800">{tt("Tanlangan tishlar boʻyicha holat va bajarilgan ish")}</p>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{tt("{count} ta tanlangan", { count: selected.length })}</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {selected.map((item) => (
              <div key={item.toothNumber} className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    Tish {getDisplayToothNumber(item.toothNumber, isUniversal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleTooth(item.toothNumber)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    {tt("O‘chirish")}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500">{tt("Holati")}</label>
                    <select
                      value={item.status || "DONE"}
                      onChange={(e) => patchTooth(item.toothNumber, { status: e.target.value })}
                      className="mt-0.5 h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs"
                    >
                      {localizedStatusOptions.map((option) => (
                        <option key={option.code} value={option.code}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500">{tt("Ish turi")}</label>
                    <select
                      value={item.procedureCode || "CHECKED"}
                      onChange={(e) => patchTooth(item.toothNumber, { procedureCode: e.target.value })}
                      className="mt-0.5 h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs"
                    >
                      {localizedProcedureOptions.map((option) => (
                        <option key={option.code} value={option.code}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="mt-1.5 block text-[10px] font-medium text-gray-500">{tt("Izoh (ixtiyoriy)")}</label>
                <input
                  type="text"
                  value={item.notes || ""}
                  onChange={(e) => patchTooth(item.toothNumber, { notes: e.target.value })}
                  placeholder={tt("Masalan: distal yuzasi, milk atrofida sezgir")}
                  className="mt-0.5 w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
        <b>{readOnly ? tt("Ko‘rsatilgan tishlar") : tt("Tanlangan tishlar")}:</b> {summarizeLocalizedToothChart(selected) || "—"}
      </div>
    </div>
    </div>
  );
};

export default ToothChartPicker;
