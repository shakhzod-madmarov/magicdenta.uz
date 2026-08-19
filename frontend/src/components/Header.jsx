import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      badge: "MAGIC DENTA • DENTAL ORTHOPEDICS",
      heading: "Har bir tabassumda yuksak go‘zallik va mukammal ishonch",
      desc: "Zamonaviy raqamli ortodontiya, professional tish davolash va individual yondashuv. Biz sizga xalqaro standartlar asosida xavfsiz va og‘riqsiz stomatologik xizmatlarni taqdim etamiz.",
      book: "Qabulga yozilish",
      doctors: "Shifokorlarimiz",
      stat1Val: "100%",
      stat1Lab: "Og‘riqsiz muolaja",
      stat2Val: "3D",
      stat2Lab: "Raqamli tashxis",
      stat3Val: "08:00-20:00",
      stat3Lab: "Dush – Shanba",
    },
    ru: {
      badge: "MAGIC DENTA • DENTAL ORTHOPEDICS",
      heading: "Красота, точность и безупречная уверенность в каждой улыбке",
      desc: "Передовая цифровая ортодонтия, надежное лечение зубов и индивидуальный подход. Высокие международные стандарты безболезненной стоматологии.",
      book: "Записаться на прием",
      doctors: "Наши врачи",
      stat1Val: "100%",
      stat1Lab: "Без боли и страха",
      stat2Val: "3D",
      stat2Lab: "Цифровая точность",
      stat3Val: "08:00-20:00",
      stat3Lab: "Пн – Сб (Вс: вых)",
    },
    en: {
      badge: "MAGIC DENTA • DENTAL ORTHOPEDICS",
      heading: "Elegance, Precision & Absolute Confidence in Every Smile",
      desc: "Next-generation digital orthodontics, gentle dental care, and bespoke smile restorations delivered with uncompromising clinical excellence.",
      book: "Book Appointment",
      doctors: "Our Specialists",
      stat1Val: "100%",
      stat1Lab: "Pain-Free Care",
      stat2Val: "3D",
      stat2Lab: "Digital Scanning",
      stat3Val: "08:00-20:00",
      stat3Lab: "Mon – Sat",
    },
  }[lang] || {
    badge: "MAGIC DENTA • DENTAL ORTHOPEDICS",
    heading: "Har bir tabassumda yuksak go‘zallik va mukammal ishonch",
    desc: "Zamonaviy raqamli ortodontiya, professional tish davolash va individual yondashuv. Biz sizga xalqaro standartlar asosida xavfsiz va og‘riqsiz stomatologik xizmatlarni taqdim etamiz.",
    book: "Qabulga yozilish",
    doctors: "Shifokorlarimiz",
    stat1Val: "100%",
    stat1Lab: "Og‘riqsiz muolaja",
    stat2Val: "3D",
    stat2Lab: "Raqamli tashxis",
    stat3Val: "24/7",
    stat3Lab: "Onlayn yozilish",
  };

  const headerPhoto = assets.header_doctor || assets.header_img;

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════
           MAGIC DENTA LUXURY HERO
           Cinematic High-Tech Blend
        ═══════════════════════════════════ */

        .mdh-hero {
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          width: 100vw;
          min-height: calc(100dvh - 65px);
          overflow: hidden;
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #0F3040 0%, #1B1833 45%, #321E48 100%);
        }

        /* Ambient glowing background orbs */
        .mdh-glow-orb-1 {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(64, 61, 136, 0.28) 0%, rgba(15, 48, 64, 0) 70%);
          top: -150px;
          left: -100px;
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
        }

        .mdh-glow-orb-2 {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(146, 0, 58, 0.22) 0%, rgba(145, 0, 141, 0.1) 40%, rgba(50, 30, 72, 0) 70%);
          bottom: -100px;
          left: 25%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 1;
        }

        /* Doctor photo desktop overlay */
        .mdh-hero__photo {
          display: none;
        }

        @media (min-width: 1024px) {
          .mdh-hero__photo {
            display: block;
            position: absolute;
            top: 0;
            right: 0;
            width: 54%;
            height: 100%;
            z-index: 2;
          }

          .mdh-hero__photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center 15%;
            display: block;
            filter: brightness(0.95) contrast(1.05);
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
                rgba(15, 48, 64, 0.98) 6%,
                rgba(15, 48, 64, 0.90) 14%,
                rgba(15, 48, 64, 0.75) 24%,
                rgba(15, 48, 64, 0.50) 38%,
                rgba(15, 48, 64, 0.25) 54%,
                rgba(15, 48, 64, 0.05) 75%,
                rgba(15, 48, 64, 0.00) 90%
              ),
              linear-gradient(
                to top,
                rgba(15, 48, 64, 0.95) 0%,
                rgba(15, 48, 64, 0.40) 18%,
                transparent            35%
              ),
              linear-gradient(
                to bottom,
                rgba(15, 48, 64, 0.60) 0%,
                transparent            22%
              );
          }
        }

        .mdh-hero__inner {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 80rem;
          margin: 0 auto;
          padding: 4.5rem 1.5rem 4rem;
          display: flex;
          align-items: center;
          min-height: calc(100dvh - 65px);
        }

        @media (min-width: 640px) {
          .mdh-hero__inner { padding: 4.5rem 2rem 4rem; }
        }
        @media (min-width: 1024px) {
          .mdh-hero__inner { padding: 3.5rem 3rem; }
        }
      `}</style>

      <header className="mdh-hero" role="banner">
        {/* Glow ambient meshes */}
        <div className="mdh-glow-orb-1" aria-hidden="true" />
        <div className="mdh-glow-orb-2" aria-hidden="true" />

        {/* Doctor Photo (Desktop right side) */}
        <div className="mdh-hero__photo">
          <img
            src={headerPhoto}
            alt="Magic Denta mutaxassisi"
            fetchPriority="high"
            width="960"
            height="800"
          />
        </div>

        <div className="mdh-hero__inner">
          <div className="w-full lg:max-w-[55%] flex flex-col gap-6 text-white text-left">
            {/* High-tech sub-badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#403D88]/30 border border-[#403D88]/60 backdrop-blur-md w-fit shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#91008D] animate-pulse" />
              <span className="text-[11px] sm:text-xs font-black tracking-widest text-slate-200 uppercase">
                {t.badge}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
              {t.heading}
            </h1>

            {/* Description */}
            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-normal">
              {t.desc}
            </p>

            {/* Mobile Doctor Image Showcase */}
            <div className="block lg:hidden w-full h-[250px] rounded-3xl overflow-hidden relative border border-[#403D88]/40 shadow-2xl my-2">
              <img
                src={headerPhoto}
                alt="Magic Denta mutaxassisi"
                className="w-full h-full object-cover object-top"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F3040]/90 via-transparent to-transparent" />
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#specialities"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-[#92003A] via-[#91008D] to-[#403D88] text-white text-sm sm:text-base font-extrabold shadow-glow-wine hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                <span>{t.book}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              <button
                type="button"
                onClick={() => navigate("/dentists")}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white text-sm sm:text-base font-bold active:scale-95 transition-all duration-200"
              >
                <span>{t.doctors}</span>
              </button>
            </div>

            {/* Clinical Trust Stat Chips */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10 max-w-lg">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs">
                <div className="text-xl sm:text-2xl font-black text-white">{t.stat1Val}</div>
                <div className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-0.5">{t.stat1Lab}</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs">
                <div className="text-xl sm:text-2xl font-black text-white">{t.stat2Val}</div>
                <div className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-0.5">{t.stat2Lab}</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs">
                <div className="text-xl sm:text-2xl font-black text-white">{t.stat3Val}</div>
                <div className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-0.5">{t.stat3Lab}</div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
