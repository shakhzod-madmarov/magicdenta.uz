import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      heading: "Har bir tabassumda go‘zallik va yuksak ishonch",
      desc: "Magic Denta — Specializing in Dental Orthopedics. Siz va yaqinlaringiz uchun qulay, og‘riqsiz va professional tish parvarishi, ortodontiya va mukammal tabassum xizmatlari.",
      book: "Qabulga yozilish",
      doctors: "Shifokorlarimiz",
    },
    ru: {
      heading: "Красота и уверенность в каждой улыбке",
      desc: "Magic Denta — Specializing in Dental Orthopedics. Комфортная, надежная и безболезненная забота о здоровье ваших зубов, исправление прикуса и создание безупречной улыбки.",
      book: "Записаться на прием",
      doctors: "Наши врачи",
    },
    en: {
      heading: "Beauty & Confidence in Every Smile",
      desc: "Magic Denta — Specializing in Dental Orthopedics. Gentle, pain-free dental treatments, advanced orthodontics, and personalized care for the entire family.",
      book: "Book Appointment",
      doctors: "Our Specialists",
    },
  }[lang] || {
    heading: "Har bir tabassumda go‘zallik va yuksak ishonch",
    desc: "Magic Denta — Specializing in Dental Orthopedics. Siz va yaqinlaringiz uchun qulay, og‘riqsiz va professional tish parvarishi, ortodontiya va mukammal tabassum xizmatlari.",
    book: "Qabulga yozilish",
    doctors: "Shifokorlarimiz",
  };

  const headerPhoto = assets.header_doctor || assets.header_img;

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════
           MAGIC DENTA HERO  —  100dvh
           Cinematic Blend
        ═══════════════════════════════════ */

        .mdh-hero {
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          width: 100vw;
          min-height: 100dvh;
          overflow: hidden;
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #0F3040 0%, #1A132B 50%, #321E48 100%);
        }

        /* ── Doctor Photo — Desktop: absolute right half ── */
        .mdh-hero__photo {
          display: none;
        }

        @media (min-width: 1024px) {
          .mdh-hero__photo {
            display: block;
            position: absolute;
            top: 0;
            right: 0;
            width: 55%;
            height: 100%;
            z-index: 0;
          }

          .mdh-hero__photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center 14%;
            display: block;
            filter: brightness(0.92) saturate(0.9);
          }

          /*
            Multi-layer gradient overlay
            Base tone: #0f1011 = rgb(15, 48, 64)
          */
          .mdh-hero__photo::after {
            content: '';
            position: absolute;
            inset: 0;
            pointer-events: none;
            background:
              linear-gradient(
                to right,
                rgb(15, 48, 64)        0%,
                rgba(15,48,64, 0.98)   5%,
                rgba(15,48,64, 0.92)  10%,
                rgba(15,48,64, 0.84)  16%,
                rgba(15,48,64, 0.72)  23%,
                rgba(15,48,64, 0.58)  31%,
                rgba(15,48,64, 0.42)  40%,
                rgba(15,48,64, 0.28)  50%,
                rgba(15,48,64, 0.16)  60%,
                rgba(15,48,64, 0.06)  72%,
                rgba(15,48,64, 0.00)  85%
              ),
              linear-gradient(
                to top,
                rgba(10, 10, 10, 0.92)  0%,
                rgba(10, 10, 10, 0.60) 14%,
                rgba(10, 10, 10, 0.20) 28%,
                transparent            44%
              ),
              linear-gradient(
                to bottom,
                rgba(10, 10, 10, 0.50)  0%,
                rgba(10, 10, 10, 0.15) 12%,
                transparent            24%
              );
          }
        }

        /* ── Content Wrapper ── */
        .mdh-hero__inner {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 80rem;
          margin: 0 auto;
          padding: 5.5rem 1.5rem 4rem;
          display: flex;
          align-items: center;
          min-height: 100dvh;
        }

        @media (min-width: 640px) {
          .mdh-hero__inner { padding: 5.5rem 2rem 4rem; }
        }
        @media (min-width: 1024px) {
          .mdh-hero__inner { padding: 4.5rem 3rem; }
        }

        /* ── Left Content ── */
        .mdh-hero__content {
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 1.6rem;
        }

        @media (min-width: 1024px) {
          .mdh-hero__content { max-width: 50%; }
        }

        /* Heading */
        .mdh-heading {
          font-size: clamp(2.3rem, 4.6vw, 3.8rem);
          font-weight: 900;
          line-height: 1.14;
          letter-spacing: -0.025em;
          color: #FFFFFF;
          text-shadow: 0 2px 24px rgba(0,0,0,0.4);
        }

        /* Description */
        .mdh-desc {
          font-size: clamp(0.92rem, 1.25vw, 1.05rem);
          line-height: 1.75;
          color: rgba(242, 242, 242, 0.85);
          max-width: 35rem;
        }

        /* Buttons */
        .mdh-btn-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.9rem;
          align-items: center;
        }

        .mdh-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 2.2rem;
          background: linear-gradient(135deg, #92003A 0%, #91008D 100%);
          color: #FFFFFF;
          font-weight: 800;
          font-size: 0.95rem;
          border-radius: 9999px;
          box-shadow: 0 8px 24px rgba(146, 0, 58, 0.25);
          border: none;
          text-decoration: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .mdh-btn-primary:hover {
          background: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(146, 0, 58, 0.4);
        }
        .mdh-btn-primary:active { transform: scale(0.97); }

        .mdh-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 2.2rem;
          background: rgba(255,255,255,0.06);
          color: #F2F2F2;
          font-weight: 700;
          font-size: 0.95rem;
          border-radius: 9999px;
          border: 1.5px solid rgba(64, 61, 136, 0.4);
          backdrop-filter: blur(8px);
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }
        .mdh-btn-secondary:hover {
          background: rgba(255,255,255,0.14);
          border-color: #EAE4D5;
          transform: translateY(-2px);
        }
        .mdh-btn-secondary:active { transform: scale(0.97); }

        /* Mobile image */
        .mdh-mobile-img {
          display: block;
          width: 100%;
          height: 240px;
          border-radius: 1.5rem;
          overflow: hidden;
          position: relative;
          border: 1.5px solid rgba(64, 61, 136, 0.2);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }
        .mdh-mobile-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 15%;
        }
        .mdh-mobile-img::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15,48,64,0.88) 0%, transparent 60%);
        }
        @media (min-width: 1024px) {
          .mdh-mobile-img { display: none; }
        }

        /* Ambient luxury warm orbs */
        .mdh-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 1;
        }
        .mdh-orb-a {
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(64, 61, 136, 0.12) 0%, transparent 70%);
          top: -100px; left: -100px;
        }
        .mdh-orb-b {
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(146, 0, 58, 0.08) 0%, transparent 70%);
          bottom: 40px; left: 30%;
        }
      `}</style>

      <header className="mdh-hero" role="banner">
        {/* Ambient glow orbs */}
        <div className="mdh-orb mdh-orb-a" aria-hidden="true" />
        <div className="mdh-orb mdh-orb-b" aria-hidden="true" />

        {/* Right half: full-height doctor photo — desktop only */}
        <div className="mdh-hero__photo">
          <img
            src={headerPhoto}
            alt="Magic Denta stomatologiya shifokori"
            fetchPriority="high"
            width="960"
            height="800"
          />
        </div>

        {/* Content */}
        <div className="mdh-hero__inner">
          <div className="mdh-hero__content">
            {/* Heading */}
            <h1 className="mdh-heading">{t.heading}</h1>

            {/* Description */}
            <p className="mdh-desc">{t.desc}</p>

            {/* Mobile doctor image */}
            <div className="mdh-mobile-img">
              <img
                src={headerPhoto}
                alt="Magic Denta stomatologiya shifokori"
                fetchPriority="high"
                width="480"
                height="320"
              />
            </div>

            {/* CTA Buttons */}
            <div className="mdh-btn-row">
              <a href="#specialities" className="mdh-btn-primary" aria-label={t.book}>
                {t.book}
              </a>
              <button
                type="button"
                onClick={() => navigate("/dentists")}
                className="mdh-btn-secondary"
                aria-label={t.doctors}
              >
                {t.doctors}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
