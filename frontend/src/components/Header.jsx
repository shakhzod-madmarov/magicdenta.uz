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
    <>
      <style>{`
        /* ═════════════════════════════════════════════════
           MAGIC DENTA FULL CINEMATIC BACKGROUND HERO
        ═════════════════════════════════════════════════ */

        .mdh-hero {
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          width: 100vw;
          min-height: 85vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          background-color: #0F3040;
        }

        /* Full-width background image */
        .mdh-hero__bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .mdh-hero__bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          display: block;
          filter: brightness(0.95) contrast(1.05);
        }

        /* Seamless cinematic gradient overlays */
        .mdh-hero__bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              to right,
              rgba(15, 48, 64, 0.98) 0%,
              rgba(15, 48, 64, 0.90) 40%,
              rgba(26, 23, 51, 0.60) 70%,
              rgba(50, 30, 72, 0.25) 100%
            ),
            linear-gradient(
              to top,
              rgba(15, 48, 64, 0.95) 0%,
              rgba(15, 48, 64, 0.25) 25%,
              transparent            50%
            ),
            linear-gradient(
              to bottom,
              rgba(15, 48, 64, 0.85) 0%,
              rgba(15, 48, 64, 0.15) 25%,
              transparent            50%
            );
        }

        @media (max-width: 1023px) {
          .mdh-hero__bg::after {
            background: linear-gradient(
              to bottom,
              rgba(15, 48, 64, 0.95) 0%,
              rgba(15, 48, 64, 0.85) 50%,
              rgba(31, 23, 50, 0.90) 100%
            );
          }
        }

        /* Ambient Glow Orbs */
        .mdh-glow-orb-1 {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(146, 0, 58, 0.22) 0%, rgba(145, 0, 141, 0.08) 40%, transparent 70%);
          top: -120px;
          right: 5%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 2;
        }

        .mdh-glow-orb-2 {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(64, 61, 136, 0.28) 0%, transparent 70%);
          bottom: -100px;
          left: 5%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 2;
        }

        .mdh-hero__inner {
          position: relative;
          z-index: 10;
          width: 100%;
          max-w: 80rem;
          margin: 0 auto;
          padding: 6rem 1.5rem 6rem;
        }

        @media (min-width: 640px) {
          .mdh-hero__inner { padding: 6.5rem 2.5rem; }
        }
        @media (min-width: 1024px) {
          .mdh-hero__inner { padding: 7rem 3.5rem; }
        }
      `}</style>

      <header className="mdh-hero" role="banner">
        {/* Full-width Background Image */}
        <div className="mdh-hero__bg">
          <img
            src={headerPhoto}
            alt="Magic Denta klinikasi"
            fetchPriority="high"
          />
        </div>

        {/* Ambient Glows */}
        <div className="mdh-glow-orb-1" aria-hidden="true" />
        <div className="mdh-glow-orb-2" aria-hidden="true" />

        <div className="mdh-hero__inner max-w-7xl">
          <div className="max-w-3xl flex flex-col gap-6 text-white text-left">
            
            {/* Subtle luxury sub-badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.10] border border-white/20 backdrop-blur-md w-fit shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#91008D] animate-pulse" />
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-slate-200 uppercase">
                {t.badge}
              </span>
            </div>

            {/* Main Heading with breathability */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.12] text-white drop-shadow-sm">
              {t.heading}
            </h1>

            {/* Description */}
            <p className="text-slate-200 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-normal">
              {t.desc}
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => navigate("/appointment")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <span>{t.book}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => navigate("/services")}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md text-white text-xs sm:text-sm font-bold active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <span>{t.services}</span>
              </button>
            </div>

            {/* Minimalist Airy Trust Row */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-6 text-xs font-bold text-slate-200/90 border-t border-white/15">
              <div className="flex items-center gap-1.5">
                <span className="text-[#91008D]">✦</span>
                <span>{t.tag1}</span>
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[#E8D5F5]">✦</span>
                <span>{t.tag2}</span>
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-300">✦</span>
                <span>{t.tag3}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
