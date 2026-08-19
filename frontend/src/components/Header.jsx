import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      badge: "ORTOPEDIK STOMATOLOGIYA VA ESTETIKA",
      heading: "Mukammal tabassum san’ati va professional g‘amxo‘rlik",
      desc: "Magic Denta — zamonaviy ortodontiya, estetik vinirlar, sirkoniy qoplamalar va og‘riqsiz muolajalar markazi.",
      book: "Qabulga yozilish",
      services: "Xizmatlarimiz",
      tag1: "100% Og‘riqsiz",
      tag2: "Oliy Toifali Shifokor",
      tag3: "08:00 – 20:00 (Dush – Shan)",
    },
    ru: {
      badge: "ОРТОПЕДИЧЕСКАЯ СТОМАТОЛОГИЯ И ЭСТЕТИКА",
      heading: "Искусство идеальной улыбки и забота о здоровье",
      desc: "Современная ортодонтия, эстетические виниры, циркониевые коронки и безболезненный комфорт в Magic Denta.",
      book: "Записаться на прием",
      services: "Наши услуги",
      tag1: "100% Без боли",
      tag2: "Высшая категория",
      tag3: "08:00 – 20:00 (Пн – Сб)",
    },
    en: {
      badge: "DENTAL ORTHOPEDICS • CLINIC",
      heading: "The Art of a Perfect Smile & Elite Dental Care",
      desc: "Specialized orthodontics, aesthetic veneers, precision Zirconia crowns, and gentle pain-free comfort.",
      book: "Book Appointment",
      services: "Our Specialties",
      tag1: "Pain-Free Care",
      tag2: "Master Specialist",
      tag3: "08:00 – 20:00 (Mon – Sat)",
    },
  }[lang] || {
    badge: "ORTOPEDIK STOMATOLOGIYA VA ESTETIKA",
    heading: "Mukammal tabassum san’ati va professional g‘amxo‘rlik",
    desc: "Magic Denta — zamonaviy ortodontiya, estetik vinirlar, sirkoniy qoplamalar va og‘riqsiz muolajalar markazi.",
    book: "Qabulga yozilish",
    services: "Xizmatlarimiz",
    tag1: "100% Og‘riqsiz",
    tag2: "Oliy Toifali Shifokor",
    tag3: "08:00 – 20:00 (Dush – Shan)",
  };

  const headerPhoto = assets.header_doctor || assets.header_img;

  return (
    <section className="relative w-full min-h-[75vh] sm:min-h-[82vh] lg:min-h-[86vh] flex items-center bg-[#0F3040] overflow-hidden">
      {/* Full-width Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src={headerPhoto}
          alt="Magic Denta zamonaviy stomatologiya klinikasi"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          width="1920"
          height="1080"
          className="w-full h-full object-cover object-[center_30%] filter brightness-95 contrast-105"
        />

        {/* Seamless Cinematic Gradient Overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(to right, rgba(15, 48, 64, 0.98) 0%, rgba(15, 48, 64, 0.92) 40%, rgba(26, 23, 51, 0.65) 75%, rgba(50, 30, 72, 0.35) 100%),
              linear-gradient(to top, rgba(15, 48, 64, 0.95) 0%, rgba(15, 48, 64, 0.20) 30%, transparent 60%),
              linear-gradient(to bottom, rgba(15, 48, 64, 0.85) 0%, transparent 40%)
            `
          }}
        />
      </div>

      {/* Ambient Glow Orbs */}
      <div
        className="absolute w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full top-[-100px] right-[5%] blur-[90px] sm:blur-[120px] pointer-events-none z-10"
        style={{ background: "radial-gradient(circle, rgba(146, 0, 58, 0.28) 0%, rgba(145, 0, 141, 0.10) 45%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bottom-[-80px] left-[5%] blur-[80px] sm:blur-[100px] pointer-events-none z-10"
        style={{ background: "radial-gradient(circle, rgba(64, 61, 136, 0.32) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl flex flex-col gap-5 sm:gap-6 text-white text-left">
          
          {/* Luxury Sub-Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/[0.12] border border-white/20 backdrop-blur-md w-fit shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#91008D] animate-pulse" aria-hidden="true" />
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-slate-200 uppercase">
              {t.badge}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.12] text-white drop-shadow-sm">
            {t.heading}
          </h1>

          {/* Description */}
          <p className="text-slate-200 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-normal">
            {t.desc}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={() => navigate("/appointment")}
              className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer min-h-[44px]"
            >
              <span>{t.book}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => navigate("/services")}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md text-white text-xs sm:text-sm font-bold active:scale-95 transition-all duration-200 cursor-pointer min-h-[44px]"
            >
              <span>{t.services}</span>
            </button>
          </div>

          {/* Trust Row */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-5 pt-5 sm:pt-6 text-xs font-bold text-slate-200/90 border-t border-white/15">
            <div className="flex items-center gap-1.5">
              <span className="text-[#91008D]" aria-hidden="true">✦</span>
              <span>{t.tag1}</span>
            </div>
            <span className="text-white/25" aria-hidden="true">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#E8D5F5]" aria-hidden="true">✦</span>
              <span>{t.tag2}</span>
            </div>
            <span className="text-white/25" aria-hidden="true">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-300" aria-hidden="true">✦</span>
              <span>{t.tag3}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Header;
