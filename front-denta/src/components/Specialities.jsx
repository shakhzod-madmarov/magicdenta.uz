import { specialityData } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Specialities = () => {
  const navigate = useNavigate();
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      tag: "XIZMATLAR VA YO‘NALISHLAR",
      heading: "Bizning mutaxassisliklarimiz",
      desc: "Zamonaviy raqamli stomatologiya, tajribali shifokorlar va kafolatlangan professional tish parvarishi.",
      view: "Batafsil",
    },
    ru: {
      tag: "НАПРАВЛЕНИЯ И УСЛУГИ",
      heading: "Наши направления",
      desc: "Современная цифровая стоматология, опытные врачи и надежное лечение зубов.",
      view: "Подробнее",
    },
    en: {
      tag: "TREATMENTS & SERVICES",
      heading: "Our Specialties",
      desc: "Modern digital dentistry, experienced specialists, and guaranteed premium dental care.",
      view: "Learn more",
    },
  }[lang] || {
    tag: "XIZMATLAR VA YO‘NALISHLAR",
    heading: "Bizning mutaxassisliklarimiz",
    desc: "Zamonaviy raqamli stomatologiya, tajribali shifokorlar va kafolatlangan professional tish parvarishi.",
    view: "Batafsil",
  };

  const descriptions = {
    "Ayol stomatolog": {
      uz: "Ayollar va qizlar uchun qulay hamda alohida xotirjam qabul.",
      ru: "Деликатный и комфортный прием для женщин и девушек.",
      en: "Comfortable and personalized consultations for female patients.",
    },
    "Terapevtik stomatologiya": {
      uz: "Kariesni og‘riqsiz davolash va sifatli plombalash.",
      ru: "Безболезненное лечение кариеса и пломбирование.",
      en: "Pain-free caries treatment and durable fillings.",
    },
    "Terapevtik stomatologiy": {
      uz: "Kariesni og‘riqsiz davolash va sifatli plombalash.",
      ru: "Безболезненное лечение кариеса и пломбирование.",
      en: "Pain-free caries treatment and durable fillings.",
    },
    "Ortodontiya": {
      uz: "Tishlar qatorini zamonaviy breketlar bilan tekislash.",
      ru: "Выравнивание зубов современными брекетами.",
      en: "Teeth straightening with modern braces.",
    },
    "Ortopedik stomatologiya": {
      uz: "Sirkoniy qoplamalar, vinirlar va sifatli protezlar.",
      ru: "Циркониевые коронки, виниры и протезирование.",
      en: "Zirconia crowns, veneers, and prosthetics.",
    },
    "Stomatologiya Jarrohligi": {
      uz: "Aql tishlarini og‘riqsiz olish va jarrohlik amaliyoti.",
      ru: "Безболезненное удаление зубов и хирургия.",
      en: "Gentle tooth extractions and oral surgery.",
    },
    "Bolalar stomatologiyasi": {
      uz: "Kichkintoylar uchun qo‘rquvsiz va og‘riqsiz tish davolash.",
      ru: "Лечение зубов для детей без страха и боли.",
      en: "Fear-free and friendly dental care for children.",
    },
    "Implantologiya": {
      uz: "Yo‘qotilgan tishlarni mustahkam implant bilan tiklash.",
      ru: "Надежная имплантация и восстановление зубов.",
      en: "Permanent restoration with premium implants.",
    },
    "Estetik stomatologiya": {
      uz: "Tabassum dizayni va tishlarni xavfsiz oqartirish.",
      ru: "Дизайн улыбки и безопасное отбеливание.",
      en: "Smile design and professional whitening.",
    },
  };

  const handleClick = (speciality) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/dentists/${encodeURIComponent(speciality)}`);
  };

  return (
    <section
      id="specialities"
      className="my-20 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto"
    >
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
          {t.tag}
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
          {t.heading}
        </h2>
        <p className="text-slate-500 mt-3 text-sm sm:text-base leading-relaxed">
          {t.desc}
        </p>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {specialityData.map((item, index) => {
          const displayTitle = item.displayName?.[lang] || item.speciality;
          const badgeText = item.badge?.[lang] || "STOMATOLOGIYA";
          const descText =
            descriptions[item.speciality]?.[lang] ||
            "Professional stomatologiya xizmati.";

          return (
            <li
              key={index}
              onClick={() => handleClick(item.speciality)}
              className="bg-white rounded-[30px] p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Header row with badge & arrow */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-extrabold px-3 py-1 bg-slate-100 text-slate-700 rounded-full uppercase tracking-wider">
                    {badgeText}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-all text-slate-500 shadow-sm">
                    <svg
                      className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
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

                {/* 3D Visual Hero */}
                <div className="w-24 h-24 mx-auto my-3 rounded-[24px] overflow-hidden bg-[#0D1117] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 border border-slate-800">
                  <img
                    src={item.image}
                    alt={displayTitle}
                    loading="lazy"
                    width="96"
                    height="96"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 text-center leading-snug mb-2 group-hover:text-black transition-colors">
                  {displayTitle}
                </h3>

                {/* Short, clear, understandable description */}
                <p className="text-slate-500 text-xs sm:text-sm text-center leading-relaxed mb-4 px-1 min-h-[38px] flex items-center justify-center">
                  {descText}
                </p>
              </div>

              {/* Action Button */}
              <div className="w-full py-2.5 rounded-xl bg-slate-50 group-hover:bg-slate-900 group-hover:text-white text-slate-700 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm">
                <span>{t.view}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default Specialities;
