import { useNavigate } from "react-router-dom";
import { useContext, useRef, useState, useEffect, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import profilePic from "../assets/profile_pic.png";

const TopDentists = () => {
  const navigate = useNavigate();
  const { dentists, backendUrl } = useContext(AppContext);
  const railRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      tag: "SHIFOKORLARIMIZ",
      heading: "Malakali Mutaxassislarimiz",
      desc: "Magic Denta shifokorlari bilan tanishing va qulay vaqtga qabulga yoziling.",
      headDocTag: "KLINIKA BOSH SHIFOKORI",
      book: "Qabulga yozilish",
      experience: "yillik tajriba",
      viewProfile: "Profilni ko‘rish",
    },
    ru: {
      tag: "НАШИ СПЕЦИАЛИСТЫ",
      heading: "Квалифицированные врачи",
      desc: "Познакомьтесь с нашими врачами и запишитесь на удобное время приема.",
      headDocTag: "ГЛАВНЫЙ ВРАЧ КЛИНИКИ",
      book: "Записаться на прием",
      experience: "лет опыта",
      viewProfile: "Профиль врача",
    },
    en: {
      tag: "OUR SPECIALISTS",
      heading: "Qualified Dentists",
      desc: "Meet our dedicated dentists and book your consultation with confidence.",
      headDocTag: "HEAD CHIEF DENTIST",
      book: "Book Appointment",
      experience: "years experience",
      viewProfile: "View Profile",
    },
  }[lang] || {
    tag: "SHIFOKORLARIMIZ",
    heading: "Malakali Mutaxassislarimiz",
    desc: "Magic Denta shifokorlari bilan tanishing va qulay vaqtga qabulga yoziling.",
    headDocTag: "KLINIKA BOSH SHIFOKORI",
    book: "Qabulga yozilish",
    experience: "yillik tajriba",
    viewProfile: "Profilni ko‘rish",
  };

  const allDentists = useMemo(
    () => (Array.isArray(dentists) ? dentists.filter(Boolean) : []),
    [dentists],
  );

  const isSingleDoctor = allDentists.length === 1;
  const singleDoctor = allDentists[0];

  const railItems = useMemo(() => {
    if (allDentists.length === 0) return [];
    let repeated = [];
    while (repeated.length < 8) {
      repeated = [...repeated, ...allDentists];
    }
    return repeated;
  }, [allDentists]);

  useEffect(() => {
    if (isSingleDoctor || allDentists.length === 0) return undefined;

    const el = railRef.current;
    if (!el) return undefined;

    const speed = 0.45;
    let rafId;
    let running = true;

    const step = () => {
      if (!running) return;

      if (!paused) {
        el.scrollLeft += speed;
        const half = el.scrollWidth / 2;

        if (el.scrollLeft >= half) {
          el.scrollLeft -= half;
        }
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    const pause = () => setPaused(true);
    const resume = () => setPaused(false);

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume, { passive: true });

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, [allDentists, isSingleDoctor, paused]);

  return (
    <section className="my-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-black tracking-widest text-[#403D88] uppercase block mb-2">
          {t.tag}
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0F3040] leading-tight tracking-tight">
          {t.heading}
        </h2>
        <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
          {t.desc}
        </p>
      </div>

      {/* Case 1: Single Dentist Setup (Featured Chief Specialist Showcase Card) */}
      {isSingleDoctor && singleDoctor && (
        <div className="max-w-4xl mx-auto bg-white rounded-[36px] border border-slate-200/90 shadow-card-clean hover:shadow-card-hover p-6 sm:p-10 transition-all grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
          {/* Doctor Image */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[280px] aspect-[4/5] rounded-[28px] overflow-hidden bg-gradient-to-br from-[#0F3040] to-[#321E48] border border-[#403D88]/30 shadow-lg relative group">
              <img
                src={
                  singleDoctor.image
                    ? String(singleDoctor.image).startsWith("http")
                      ? singleDoctor.image
                      : `${backendUrl}${singleDoctor.image}`
                    : profilePic
                }
                alt={singleDoctor.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = profilePic;
                }}
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0F3040]/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-black tracking-wider uppercase">
                {t.headDocTag}
              </div>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-600">
                  Qabulga ochiq (08:00 – 20:00)
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0F3040]">
                {singleDoctor.name}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-[#92003A] mt-0.5">
                {singleDoctor.degree || "Stomatolog-Ortoped, Ortodont"}
                {singleDoctor.experience ? ` • ${singleDoctor.experience} ${t.experience}` : ""}
              </p>
            </div>

            {singleDoctor.about && (
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                {singleDoctor.about}
              </p>
            )}

            {/* Specialties Badges */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                Yo‘nalishlar:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(singleDoctor.speciality) ? singleDoctor.speciality : [singleDoctor.speciality]).map((sp, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-bold text-[#0F3040]"
                  >
                    {sp}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Booking CTA */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/appointment/${singleDoctor._id}`)}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {t.book} →
              </button>
              <button
                type="button"
                onClick={() => navigate("/contact")}
                className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#0F3040] text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Konsultatsiya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case 2: Multi-Dentist Setup (Smooth Infinite Carousel) */}
      {!isSingleDoctor && allDentists.length > 1 && (
        <div
          ref={railRef}
          className="flex gap-6 overflow-x-auto no-scrollbar py-4 px-2"
          style={{ scrollBehavior: "auto" }}
        >
          {railItems.map((item, index) => (
            <div
              key={`${item._id}-${index}`}
              onClick={() => {
                navigate(`/appointment/${item._id}`);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-[280px] sm:w-[300px] shrink-0 bg-white rounded-[32px] p-5 border border-slate-200/80 shadow-card-clean hover:shadow-card-hover hover:border-[#403D88]/40 hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col justify-between group text-left"
            >
              <div>
                <div className="w-full aspect-square rounded-[24px] overflow-hidden bg-gradient-to-br from-[#0F3040] to-[#321E48] mb-4 relative">
                  <img
                    src={
                      item.image
                        ? String(item.image).startsWith("http")
                          ? item.image
                          : `${backendUrl}${item.image}`
                        : profilePic
                    }
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = profilePic;
                    }}
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#0F3040]/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                    {Array.isArray(item.speciality) ? item.speciality[0] : item.speciality}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-emerald-600">Qabulga ochiq</span>
                </div>

                <h3 className="font-black text-lg text-[#0F3040] group-hover:text-[#92003A] transition-colors leading-snug">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {item.degree || "Stomatolog"}
                  {item.experience ? ` • ${item.experience} yil` : ""}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#403D88]">
                <span>{t.book}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fallback when no dentists are in the DB yet */}
      {allDentists.length === 0 && (
        <div className="bg-white rounded-[32px] p-10 border border-slate-200/80 shadow-sm text-center max-w-lg mx-auto">
          <div className="text-3xl mb-2">🩺</div>
          <h3 className="text-lg font-black text-[#0F3040] mb-1">
            Magic Denta Shifokorlar Qabuli
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Shifokor qabuliga to‘g‘ridan-to‘g‘ri onlayn yoziling yoki telefon orqali konsultatsiya oling.
          </p>
          <button
            type="button"
            onClick={() => navigate("/contact")}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#92003A] to-[#91008D] text-white text-xs font-black uppercase tracking-wider shadow-md"
          >
            Bog‘lanish: +998 91 289 15 14
          </button>
        </div>
      )}
    </section>
  );
};

export default TopDentists;
