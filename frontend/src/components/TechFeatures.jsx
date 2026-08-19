import { useState } from "react";

const TechFeatures = () => {
  const lang = localStorage.getItem("language") || "uz";
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const t = {
    uz: {
      tag: "XALQARO STANDARTLAR & INNOVATSIYA",
      heading: "Nega aynan Magic Denta?",
      desc: "Biz har bir bemorga oliy toifali shifokorlar tajribasi, raqamli aniqlik va mutlaq xavfsizlikni kafolatlaymiz.",
      f1Title: "Aniq va Muloyim Davolash",
      f1Desc: "Tish to‘qimalarini maksimal asrab qolgan holda chuqur karies va ildiz kanallarini og‘riqsiz va kafolatli davolash.",
      f2Title: "100% Og‘riqsiz Muolaja",
      f2Desc: "Zamonaviy kompyuterli nozik anesteziya va muloyim muolaja usullari orqali butunlay qo‘rquvsiz va xotirjam davolanish tajribasi.",
      f3Title: "Nemis Melag Sterilligi",
      f3Desc: "Germaniya Melag avtoklavlari yordamida ko‘p bosqichli sterilizatsiya va 100% xavfsiz gigiyenik muhit kafolatlanadi.",
      f4Title: "Sirkoniy & Gollivud Estetikasi",
      f4Desc: "Nemis sirkoniysi va estetik vinirlar yordamida tabiiy emal yaltiroqligi va mustahkam tabassum yaratiladi.",
    },
    ru: {
      tag: "МЕЖДУНАРОДНЫЕ СТАНДАРТЫ И ИННОВАЦИИ",
      heading: "Почему выбирают Magic Denta?",
      desc: "Мы гарантируем индивидуальный подход, безупречную точность и абсолютную безопасность для каждого пациента.",
      f1Title: "Точное и бережное лечение",
      f1Desc: "Бережное лечение кариеса и каналов с максимальным сохранением здоровых тканей зуба.",
      f2Title: "100% Лечение без боли",
      f2Desc: "Бережная компьютерная анестезия и современные методики для полного комфорта и спокойствия во время приема.",
      f3Title: "Немецкий стандарт стерильности",
      f3Desc: "Многоступенчатая автоклавная стерилизация Melag (Германия) и строжайший контроль инфекционной безопасности.",
      f4Title: "Цирконий и эстетика",
      f4Desc: "Высокопрочные циркониевые коронки и эстетические виниры для безупречной натуральной улыбки.",
    },
    en: {
      tag: "GLOBAL CLINICAL STANDARDS & INNOVATION",
      heading: "Why Choose Magic Denta?",
      desc: "We deliver master clinician expertise, uncompromising precision, and international patient safety protocols.",
      f1Title: "Gentle Precision Care",
      f1Desc: "Gentle root canal therapy and caries treatment prioritizing natural tooth preservation.",
      f2Title: "100% Pain-Free Care",
      f2Desc: "Advanced computer-guided anesthesia and gentle techniques ensuring a serene, stress-free clinical visit.",
      f3Title: "German Melag Sterility",
      f3Desc: "Hospital-grade Melag autoclave sterilization and stringent infection control protocols for total peace of mind.",
      f4Title: "Zirconia & Aesthetics",
      f4Desc: "High-durability German Zirconia and aesthetic veneers for breathtaking natural smiles.",
    },
  }[lang] || {
    tag: "XALQARO STANDARTLAR & INNOVATSIYA",
    heading: "Nega aynan Magic Denta?",
    desc: "Biz har bir bemorga oliy toifali shifokorlar tajribasi, raqamli aniqlik va mutlaq xavfsizlikni kafolatlaymiz.",
    f1Title: "Aniq va Muloyim Davolash",
    f1Desc: "Tish to‘qimalarini maksimal asrab qolgan holda chuqur karies va ildiz kanallarini og‘riqsiz va kafolatli davolash.",
    f2Title: "100% Og‘riqsiz Muolaja",
    f2Desc: "Zamonaviy kompyuterli nozik anesteziya va muloyim muolaja usullari orqali butunlay qo‘rquvsiz va xotirjam davolanish tajribasi.",
    f3Title: "Nemis Melag Sterilligi",
    f3Desc: "Germaniya Melag avtoklavlari yordamida ko‘p bosqichli sterilizatsiya va 100% xavfsiz gigiyenik muhit kafolatlanadi.",
    f4Title: "Sirkoniy & Gollivud Estetikasi",
    f4Desc: "Nemis sirkoniysi va estetik vinirlar yordamida tabiiy emal yaltiroqligi va mustahkam tabassum yaratiladi.",
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
      badge: "PRECISE THERAPY",
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
      badge: "100% PAIN-FREE",
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
      badge: "MELAG STERILITY",
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
      badge: "PREMIUM SMILE",
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
        <p className="text-slate-600 mt-4 text-sm sm:text-base leading-relaxed font-normal">
          {t.desc}
        </p>
      </div>

      {/* 3D Interactive Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {features.map((item, idx) => {
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                transform: isHovered
                  ? "translateY(-8px) scale(1.02)"
                  : "translateY(0) scale(1)",
                boxShadow: isHovered
                  ? `0 20px 35px -10px ${item.glowColor}, 0 1px 3px rgba(0,0,0,0.05)`
                  : "0 4px 20px -2px rgba(0,0,0,0.05)",
                borderColor: isHovered ? item.accent : "rgba(226, 232, 240, 0.8)",
              }}
              className="bg-white rounded-[32px] p-7 border transition-all duration-300 flex flex-col justify-between text-left group relative overflow-hidden cursor-default"
            >
              {/* Top ambient color accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 transition-opacity duration-300"
                style={{
                  backgroundColor: item.accent,
                  opacity: isHovered ? 1 : 0,
                }}
              />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs"
                    style={{
                      backgroundColor: `${item.accent}12`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    className="text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full border"
                    style={{
                      color: item.accent,
                      borderColor: `${item.accent}30`,
                      backgroundColor: `${item.accent}08`,
                    }}
                  >
                    {item.badge}
                  </span>
                </div>

                <h3 className="font-black text-lg text-[#0F3040] leading-snug mb-3 group-hover:text-[#92003A] transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-[#0F3040] transition-colors">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  Magic Denta Standarti
                </span>
                <span className="transform group-hover:translate-x-1 transition-transform text-[#92003A]">
                  ✓
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TechFeatures;
