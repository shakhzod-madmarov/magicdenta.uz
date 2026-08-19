import { specialityData } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Specialities = () => {
  const navigate = useNavigate();
  const lang = localStorage.getItem("language") || "uz";
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const t = {
    uz: {
      tag: "5 TA ASOSIY IXTISOSLASHUV",
      heading: "Bizning davolash yo‘nalishlarimiz",
      desc: "Magic Denta 5 ta asosiy stomatologik yo‘nalishga chuqur ixtisoslashgan. Har bir xizmat bo‘yicha batafsil ma’lumot oling.",
      view: "Xizmat haqida batafsil",
    },
    ru: {
      tag: "5 КЛЮЧЕВЫХ СПЕЦИАЛИЗАЦИЙ",
      heading: "Направления лечения",
      desc: "Клиника Magic Denta глубоко сфокусирована на 5 основных стоматологических направлениях.",
      view: "Подробнее об услуге",
    },
    en: {
      tag: "5 CORE CLINICAL SPECIALTIES",
      heading: "Our Specialized Disciplines",
      desc: "Magic Denta is deeply dedicated to 5 elite clinical specialties powered by master clinicians.",
      view: "Explore Specialty",
    },
  }[lang] || {
    tag: "5 TA ASOSIY IXTISOSLASHUV",
    heading: "Bizning davolash yo‘nalishlarimiz",
    desc: "Magic Denta 5 ta asosiy stomatologik yo‘nalishga chuqur ixtisoslashgan. Har bir xizmat bo‘yicha batafsil ma’lumot oling.",
    view: "Xizmat haqida batafsil",
  };

  const descriptions = {
    "Ortodontiya": {
      uz: "Tishlar qatorini eng so'nggi avlod metall/keramik breketlar va shaffof elaynerlar bilan tekislash.",
      ru: "Выравнивание зубного ряда передовыми брекет-системами и прозрачными элайнерами.",
      en: "Precision tooth alignment with state-of-the-art bracket systems and clear aligners.",
    },
    "Terapevtik stomatologiya": {
      uz: "Karies va asoratlarni mikroskop ostida mutlaqo og‘riqsiz davolash va estetik plombalash.",
      ru: "Безболезненное микроскопическое лечение кариеса и прочная эстетическая реставрация.",
      en: "Microscopic pain-free caries care and high-durability aesthetic tooth restoration.",
    },
    "Ortopedik stomatologiya": {
      uz: "Sirkoniy qoplamalar, E-max vinirlar va zamonaviy raqamli protezlash.",
      ru: "Циркониевые коронки, ультратонкие виниры E-max и анатомическое протезирование.",
      en: "Zirconia crowns, ultra-thin E-max veneers, and advanced digital prosthetics.",
    },
    "Estetik stomatologiya": {
      uz: "Mukammal gollivud tabassum dizayni va emalga zararsiz professional oqartirish.",
      ru: "Комплексный дизайн идеальной улыбки и безопасное лазерное отбеливание.",
      en: "Digital Hollywood smile design and enamel-safe clinical whitening systems.",
    },
    "Stomatologiya Jarrohligi": {
      uz: "Aql tishlarini nozik va xavfsiz olish hamda zamonaviy jarrohlik muolajalari.",
      ru: "Атравматичное удаление зубов мудрости и щадящая хирургия полости рта.",
      en: "Atraumatic wisdom tooth extractions and precision surgical procedures.",
    },
    "Jarrohlik stomatologiyasi": {
      uz: "Aql tishlarini nozik va xavfsiz olish hamda zamonaviy jarrohlik muolajalari.",
      ru: "Атравматичное удаление зубов мудрости и щадящая хирургия полости рта.",
      en: "Atraumatic wisdom tooth extractions and precision surgical procedures.",
    },
  };

  const slugMap = {
    "Ortodontiya": "ortodontiya",
    "Terapevtik stomatologiya": "terapevtik-stomatologiya",
    "Ortopedik stomatologiya": "ortopedik-stomatologiya",
    "Estetik stomatologiya": "estetik-stomatologiya",
    "Stomatologiya Jarrohligi": "jarrohlik-stomatologiyasi",
    "Jarrohlik stomatologiyasi": "jarrohlik-stomatologiyasi"
  };

  const handleClick = (speciality) => {
    const slug = slugMap[speciality] || "ortodontiya";
    navigate(`/services/${slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section id="specialities" className="my-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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

      {/* 5 Core Specialties 3D Interactive Tiles */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
        {specialityData.map((item, index) => {
          const displayTitle = item.displayName?.[lang] || item.speciality;
          const descText =
            descriptions[item.speciality]?.[lang] ||
            descriptions[item.speciality]?.uz ||
            "";
          const badgeText = item.badge?.[lang] || item.badge?.uz || "MUTAXASSISLIK";
          const isHovered = hoveredIdx === index;

          return (
            <li
              key={index}
              onMouseEnter={() => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => handleClick(item.speciality)}
              style={{
                transform: isHovered
                  ? "translateY(-10px) scale(1.025)"
                  : "translateY(0) scale(1)",
                boxShadow: isHovered
                  ? "0 22px 40px -12px rgba(64, 61, 136, 0.22), 0 1px 3px rgba(0,0,0,0.05)"
                  : "0 4px 20px -2px rgba(0,0,0,0.05)",
                borderColor: isHovered ? "rgba(64, 61, 136, 0.45)" : "rgba(226, 232, 240, 0.85)",
              }}
              className="bg-white rounded-[32px] p-6 border transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
              {/* Top ambient color stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0F3040] via-[#403D88] to-[#92003A] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div>
                {/* Header badge & arrow */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black px-3 py-1 bg-[#403D88]/10 text-[#403D88] rounded-full uppercase tracking-wider">
                    {badgeText}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#0F3040] group-hover:text-white flex items-center justify-center transition-all text-slate-500 shadow-xs">
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 19L19 5m0 0H9m10 0v10"
                      />
                    </svg>
                  </div>
                </div>

                {/* 3D Visual Box */}
                <div className="w-28 h-28 mx-auto my-3 rounded-[26px] overflow-hidden bg-gradient-to-br from-[#0F3040] to-[#321E48] flex items-center justify-center shadow-lg group-hover:scale-108 transition-transform duration-300 border border-[#403D88]/30">
                  <img
                    src={item.image}
                    alt={displayTitle}
                    loading="lazy"
                    width="112"
                    height="112"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title */}
                <h3 className="font-black text-base text-[#0F3040] text-center leading-snug mb-2 group-hover:text-[#92003A] transition-colors">
                  {displayTitle}
                </h3>

                {/* Description */}
                <p className="text-slate-600 text-xs text-center leading-relaxed mb-4 px-1 min-h-[44px] flex items-center justify-center font-normal">
                  {descText}
                </p>
              </div>

              {/* Action button */}
              <div className="w-full py-3 rounded-2xl bg-slate-100 group-hover:bg-gradient-to-r group-hover:from-[#92003A] group-hover:to-[#91008D] group-hover:text-white text-slate-700 text-xs font-black transition-all text-center flex items-center justify-center gap-2 shadow-xs group-hover:shadow-glow-wine">
                <span>{t.view}</span>
                <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default Specialities;
