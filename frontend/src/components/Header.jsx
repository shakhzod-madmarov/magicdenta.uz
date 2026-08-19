import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      badge: "DENTAL ORTHOPEDICS • STOMATOLOGIYA",
      heading: "Mukammal tabassum san’ati va professional g‘amxo‘rlik",
      desc: "Magic Denta — zamonaviy ortodontiya, estetik vinirlar, sirkoniy qoplamalar va og‘riqsiz muolajalar markazi.",
      book: "Qabulga yozilish",
      services: "Xizmatlarimiz",
      tag1: "100% Og‘riqsiz",
      tag2: "Oliy Toifali Shifokor",
      tag3: "08:00 – 20:00 (Dush – Shan)",
    },
    ru: {
      badge: "DENTAL ORTHOPEDICS • СТОМАТОЛОГИЯ",
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
    badge: "DENTAL ORTHOPEDICS • STOMATOLOGIYA",
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
        /* ═══════════════════════════════════
           MAGIC DENTA SPACIOUS LUXURY HERO
        ═══════════════════════════════════ */

        .mdh-hero {
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          width: 100vw;
          min-height: 82vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #0F3040 0%, #1A1733 50%, #321E48 100%);
        }

        /* Ambient soft background glow */
        .mdh-glow-orb-1 {
          position: absolute;
          width: 650px;
          height: 650px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(64, 61, 136, 0.22) 0%, rgba(15, 48, 64, 0) 70%);
          top: -180px;
          left: -120px;
          filter: blur(90px);
          pointer-events: none;
          z-index: 1;
        }

        .mdh-glow-orb-2 {
          position: absolute;
          width: 550px;
          height: 550px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(146, 0, 58, 0.18) 0%, rgba(145, 0, 141, 0.08) 40%, rgba(50, 30, 72, 0) 70%);
          bottom: -120px;
          left: 30%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 1;
        }

        /* Clinic photo with soft feathering */
        .mdh-hero__photo {
          display: none;
        }

        @media (min-width: 1024px) {
          .mdh-hero__photo {
            display: block;
            position: absolute;
            top: 0;
            right: 0;
            width: 56%;
            height: 100%;
            z-index: 2;
          }

          .mdh-hero__photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center center;
            display: block;
            filter: brightness(0.92) contrast(1.04);
          }

          .mdh-hero__photo::after {
            content: '';
            position: absolute;
            inset: 0;
            pointer-events: none;
            background:
              linear-gradient(
                to right,
                rgb(15, 48, 64)        0%,
                rgba(15, 48, 64, 0.95) 12%,
                rgba(15, 48, 64, 0.80) 24%,
                rgba(15, 48, 64, 0.55) 42%,
                rgba(15, 48, 64, 0.20) 65%,
                rgba(15, 48, 64, 0.00) 88%
              ),
              linear-gradient(
                to top,
                rgba(15, 48, 64, 0.90) 0%,
                rgba(15, 48, 64, 0.30) 20%,
                transparent            40%
              ),
              linear-gradient(
                to bottom,
                rgba(15, 48, 64, 0.50) 0%,
                transparent            20%
              );
          }
        }

        .mdh-hero__inner {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 80rem;
          margin: 0 auto;
          padding: 5rem 1.5rem 5rem;
          display: flex;
          align-items: center;
        }

        @media (min-width: 640px) {
          .mdh-hero__inner { padding: 5.5rem 2.5rem; }
        }
        @media (min-width: 1024px) {
          .mdh-hero__inner { padding: 6rem 3.5rem; }
        }
      `}</style>

      <header className="mdh-hero" role="banner">
        {/* Glow ambient meshes */}
        <div className="mdh-glow-orb-1" aria-hidden="true" />
        <div className="mdh-glow-orb-2" aria-hidden="true" />

        {/* Clinic & Doctor Photo (Desktop right side) */}
        <div className="mdh-hero__photo">
          <img
            src={headerPhoto}
            alt="Magic Denta klinikasi"
            fetchPriority="high"
            width="960"
            height="800"
          />
        </div>

        <div className="mdh-hero__inner">
          <div className="w-full lg:max-w-[54%] flex flex-col gap-6 text-white text-left">
            {/* Subtle luxury sub-badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md w-fit shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#91008D] animate-pulse" />
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-slate-200 uppercase">
                {t.badge}
              </span>
            </div>

            {/* Main Heading with breathing room */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.15] text-white">
              {t.heading}
            </h1>

            {/* Description (clean & concise) */}
            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-normal">
              {t.desc}
            </p>

            {/* Mobile Image */}
            <div className="block lg:hidden w-full h-[220px] rounded-3xl overflow-hidden relative border border-[#403D88]/40 shadow-xl my-2">
              <img
                src={headerPhoto}
                alt="Magic Denta klinikasi"
                className="w-full h-full object-cover"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F3040]/90 via-transparent to-transparent" />
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => navigate("/appointment")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white text-sm font-extrabold shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <span>{t.book}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => navigate("/services")}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white text-sm font-bold active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <span>{t.services}</span>
              </button>
            </div>

            {/* Minimalist Airy Trust Row */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-6 text-xs font-semibold text-slate-300/90 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="text-[#91008D]">✦</span>
                <span>{t.tag1}</span>
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[#403D88]">✦</span>
                <span>{t.tag2}</span>
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400">✦</span>
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
