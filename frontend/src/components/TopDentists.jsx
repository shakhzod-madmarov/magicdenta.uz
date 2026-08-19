import { useNavigate } from "react-router-dom";
import { useContext, useRef, useState, useEffect, useMemo } from "react";
import { AppContext } from "../context/AppContext";

const TopDentists = () => {
  const navigate = useNavigate();
  const { dentists, backendUrl } = useContext(AppContext);
  const railRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      tag: "MUTAXASSISLAR",
      heading: "Eng yaxshi stomatologlar",
      desc: "Tajribali shifokorlarimiz bilan tanishing va mos mutaxassisni tanlab to‘g‘ridan-to‘g‘ri qabulga yoziling.",
      viewAll: "Barchasini ko‘rish",
      book: "Qabulga yozilish",
      cardTag: "Magic Denta Mutaxassisi",
    },
    ru: {
      tag: "СПЕЦИАЛИСТЫ",
      heading: "Лучшие стоматологи",
      desc: "Познакомьтесь с нашими опытными врачами и запишитесь на прием напрямую к подходящему специалисту.",
      viewAll: "Посмотреть всех",
      book: "Записаться на прием",
      cardTag: "Специалист Magic Denta",
    },
    en: {
      tag: "OUR SPECIALISTS",
      heading: "Top Dentists",
      desc: "Meet our experienced dentists and select the right specialist to book your appointment directly.",
      viewAll: "View All Specialists",
      book: "Book Appointment",
      cardTag: "Magic Denta Specialist",
    },
  }[lang] || {
    tag: "MUTAXASSISLAR",
    heading: "Eng yaxshi stomatologlar",
    desc: "Tajribali shifokorlarimiz bilan tanishing va mos mutaxassisni tanlab to‘g‘ridan-to‘g‘ri qabulga yoziling.",
    viewAll: "Barchasini ko‘rish",
    book: "Qabulga yozilish",
    cardTag: "Magic Denta Mutaxassisi",
  };

  const allDentists = useMemo(
    () => (Array.isArray(dentists) ? dentists.filter(Boolean) : []),
    [dentists],
  );

  const useRail = allDentists.length > 0;
  const railItems = useMemo(() => {
    if (allDentists.length === 0) return [];
    let repeated = [];
    while (repeated.length < 8) {
      repeated = [...repeated, ...allDentists];
    }
    return repeated;
  }, [allDentists]);

  useEffect(() => {
    if (!useRail) return undefined;

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
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, [useRail, paused]);

  if (!allDentists.length) return null;

  return (
    <section
      id="top-dentists"
      className="my-24 px-4 sm:px-8 lg:px-12 bg-white py-20 overflow-hidden border-y border-slate-200/80 shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div className="text-left max-w-2xl space-y-2">
          <span className="text-xs font-black tracking-widest text-[#403D88] uppercase block">
            {t.tag}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[#0F3040] leading-tight tracking-tight">
            {t.heading}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {t.desc}
          </p>
        </div>
        <div className="hidden md:block">
          <button
            onClick={() => navigate("/dentists")}
            className="px-7 py-3 bg-slate-100 hover:bg-[#0F3040] hover:text-white text-[#0F3040] font-black rounded-full transition-all text-xs uppercase tracking-wider shadow-xs cursor-pointer"
          >
            {t.viewAll}
          </button>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent" />

        <ul
          ref={railRef}
          className="flex gap-6 overflow-x-auto scrollbar-none pb-6 px-1 cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {railItems.map((dentist, index) => (
            <li
              key={`${dentist._id}-${index}`}
              className="flex-shrink-0 w-[290px] bg-[#F8F9FD] border border-slate-200/90 rounded-[32px] p-5 shadow-card-clean hover:shadow-card-hover hover:border-[#403D88]/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="aspect-[4/3] w-full rounded-[24px] overflow-hidden bg-gradient-to-tr from-[#0F3040]/10 to-[#321E48]/10 border border-slate-200/80 relative flex items-center justify-center">
                <img
                  src={
                    dentist?.image
                      ? (dentist.image.startsWith("http") ? dentist.image : backendUrl + dentist.image)
                      : "/doctor-placeholder.svg"
                  }
                  alt={dentist?.name || "Stomatolog"}
                  loading="lazy"
                  width="290"
                  height="217"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/doctor-placeholder.svg";
                  }}
                />
              </div>

              <div className="pt-4 text-left flex flex-col justify-between flex-grow">
                <div>
                  <span className="text-[10px] font-black text-[#403D88] uppercase tracking-wider block mb-1">
                    {t.cardTag}
                  </span>
                  <h3 className="text-lg font-black text-[#0F3040] line-clamp-1 mb-4">
                    {dentist.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/appointment/${dentist._id}`)}
                  aria-label={`${t.book} - ${dentist.name}`}
                  className="w-full py-3.5 bg-white hover:bg-gradient-to-r hover:from-[#92003A] hover:to-[#91008D] hover:text-white text-[#0F3040] border border-slate-200/80 hover:border-transparent font-black text-xs rounded-2xl flex items-center justify-between px-4 transition-all group/btn shadow-xs hover:shadow-glow-wine cursor-pointer"
                >
                  <span>{t.book}</span>
                  <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex md:hidden items-center justify-center mt-4">
          <button
            onClick={() => navigate("/dentists")}
            className="px-6 py-3 bg-[#0F3040] text-white font-black rounded-full transition text-xs uppercase tracking-wider shadow-sm"
          >
            {t.viewAll}
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopDentists;
