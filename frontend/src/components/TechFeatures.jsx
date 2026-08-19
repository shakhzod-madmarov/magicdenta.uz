import { useState } from "react";

const TechFeatures = () => {
  const lang = localStorage.getItem("language") || "uz";
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const t = {
    uz: {
      tag: "XALQARO STANDARTLAR VA INNOVATSIYA",
      heading: "Nega aynan Magic Denta?",
      desc: "Biz har bir bemorga oliy toifali shifokorlar tajribasi, raqamli aniqlik va mutlaq xavfsizlikni kafolatlaymiz.",
      f1Title: "Aniq va Muloyim Davolash",
      f1Desc: "Tish to‘qimalarini maksimal asrab qolgan holda chuqur karies va ildiz kanallarini og‘riqsiz va kafolatli davolash.",
      f1Badge: "ANIQ DAVOLASH",
      f2Title: "100% Og‘riqsiz Muolaja",
      f2Desc: "Zamonaviy kompyuterli nozik anesteziya va muloyim muolaja usullari orqali butunlay qo‘rquvsiz va xotirjam davolanish tajribasi.",
      f2Badge: "100% OG‘RIQSIZ",
      f3Title: "100% Sterillik va Xavfsizlik",
      f3Desc: "Barcha tibbiy asboblar maxsus avtoklavda to‘liq sterilizatsiya qilinadi va har bir bemor uchun 100% xavfsiz gigiyenik muhit ta’minlanadi.",
      f3Badge: "100% STERIL",
      f4Title: "Sirkoniy va Tabassum Estetikasi",
      f4Desc: "Nemis sirkoniysi va estetik vinirlar yordamida tabiiy emal yaltiroqligi va mustahkam tabassum yaratiladi.",
      f4Badge: "ESTETIK TABASSUM",
      standard: "MAGIC DENTA STANDARTI",
    },
    ru: {
      tag: "МЕЖДУНАРОДНЫЕ СТАНДАРТЫ И ИННОВАЦИИ",
      heading: "Почему выбирают Magic Denta?",
      desc: "Мы гарантируем индивидуальный подход, безупречную точность и абсолютную безопасность для каждого пациента.",
      f1Title: "Точное и бережное лечение",
      f1Desc: "Бережное лечение кариеса и каналов с максимальным сохранением здоровых тканей зуба.",
      f1Badge: "ТОЧНАЯ ТЕРАПИЯ",
      f2Title: "100% Лечение без боли",
      f2Desc: "Бережная компьютерная анестезия и современные методики для полного комфорта и спокойствия во время приема.",
      f2Badge: "100% БЕЗ БОЛИ",
      f3Title: "100% Стерильность и безопасность",
      f3Desc: "Многоступенчатая автоклавная стерилизация всех инструментов и абсолютная инфекционная безопасность каждого пациента.",
      f3Badge: "100% СТЕРИЛЬНО",
      f4Title: "Цирконий и эстетика",
      f4Desc: "Высокопрочные циркониевые коронки и эстетические виниры для безупречной натуральной улыбки.",
      f4Badge: "ПРЕМИУМ ЭСТЕТИКА",
      standard: "СТАНДАРТ MAGIC DENTA",
    },
    en: {
      tag: "GLOBAL CLINICAL STANDARDS & INNOVATION",
      heading: "Why Choose Magic Denta?",
      desc: "We deliver master clinician expertise, uncompromising precision, and international patient safety protocols.",
      f1Title: "Gentle Precision Care",
      f1Desc: "Gentle root canal therapy and caries treatment prioritizing natural tooth preservation.",
      f1Badge: "PRECISE THERAPY",
      f2Title: "100% Pain-Free Care",
      f2Desc: "Advanced computer-guided anesthesia and gentle techniques ensuring a serene, stress-free clinical visit.",
      f2Badge: "100% PAIN-FREE",
      f3Title: "100% Sterile & Safe",
      f3Desc: "Rigorous autoclave sterilization of all medical instruments ensuring 100% hygiene and patient safety.",
      f3Badge: "100% STERILE",
      f4Title: "Zirconia & Aesthetics",
      f4Desc: "High-durability German Zirconia and aesthetic veneers for breathtaking natural smiles.",
      f4Badge: "PREMIUM SMILE",
      standard: "MAGIC DENTA STANDARD",
    },
  }[lang] || {
    tag: "XALQARO STANDARTLAR VA INNOVATSIYA",
    heading: "Nega aynan Magic Denta?",
    desc: "Biz har bir bemorga oliy toifali shifokorlar tajribasi, raqamli aniqlik va mutlaq xavfsizlikni kafolatlaymiz.",
    f1Title: "Aniq va Muloyim Davolash",
    f1Desc: "Tish to‘qimalarini maksimal asrab qolgan holda chuqur karies va ildiz kanallarini og‘riqsiz va kafolatli davolash.",
    f1Badge: "ANIQ DAVOLASH",
    f2Title: "100% Og‘riqsiz Muolaja",
    f2Desc: "Zamonaviy kompyuterli nozik anesteziya va muloyim muolaja usullari orqali butunlay qo‘rquvsiz va xotirjam davolanish tajribasi.",
    f2Badge: "100% OG‘RIQSIZ",
    f3Title: "100% Sterillik va Xavfsizlik",
    f3Desc: "Barcha tibbiy asboblar maxsus avtoklavda to‘liq sterilizatsiya qilinadi va har bir bemor uchun 100% xavfsiz gigiyenik muhit ta’minlanadi.",
    f3Badge: "100% STERIL",
    f4Title: "Sirkoniy va Tabassum Estetikasi",
    f4Desc: "Nemis sirkoniysi va estetik vinirlar yordamida tabiiy emal yaltiroqligi va mustahkam tabassum yaratiladi.",
    f4Badge: "ESTETIK TABASSUM",
    standard: "MAGIC DENTA STANDARTI",
  };

  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-[#403D88]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      ),
      title: t.f1Title,
      desc: t.f1Desc,
      badge: t.f1Badge,
      accent: "#403D88",
      glowColor: "rgba(64, 61, 136, 0.15)",
    },
    {
      icon: (
        <svg className="w-8 h-8 text-[#92003A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t.f2Title,
      desc: t.f2Desc,
      badge: t.f2Badge,
      accent: "#92003A",
      glowColor: "rgba(146, 0, 58, 0.15)",
    },
    {
      icon: (
        <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t.f3Title,
      desc: t.f3Desc,
      badge: t.f3Badge,
      accent: "#059669",
      glowColor: "rgba(5, 150, 105, 0.15)",
    },
    {
      icon: (
        <svg className="w-8 h-8 text-[#91008D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: t.f4Title,
      desc: t.f4Desc,
      badge: t.f4Badge,
      accent: "#91008D",
      glowColor: "rgba(145, 0, 141, 0.15)",
    },
  ];

  return (
    <section className="my-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-black tracking-widest text-[#403D88] uppercase block mb-3">
          {t.tag}
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0F3040] leading-tight tracking-tight">
          {t.heading}
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-[#92003A] to-[#403D88] mx-auto mt-4 rounded-full" />
        <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed mt-4 font-normal">
          {t.desc}
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {features.map((f, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className="group relative bg-white rounded-[32px] p-8 border border-slate-200/80 shadow-card-clean hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between overflow-hidden text-left"
            style={{
              boxShadow: hoveredIdx === idx ? `0 20px 40px -15px ${f.glowColor}` : undefined
            }}
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] opacity-10 transition-transform duration-500 group-hover:scale-110 pointer-events-none"
              style={{ backgroundColor: f.accent }}
            />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs"
                  style={{ backgroundColor: `${f.accent}15` }}
                >
                  {f.icon}
                </div>
                <span
                  className="text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-full border shadow-2xs"
                  style={{
                    color: f.accent,
                    backgroundColor: `${f.accent}08`,
                    borderColor: `${f.accent}20`
                  }}
                >
                  {f.badge}
                </span>
              </div>

              <h3 className="text-xl font-black text-[#0F3040] mb-3 leading-snug group-hover:text-[#403D88] transition-colors">
                {f.title}
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed font-normal">
                {f.desc}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-wider">
                {t.standard}
              </span>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{ backgroundColor: `${f.accent}20`, color: f.accent }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TechFeatures;
