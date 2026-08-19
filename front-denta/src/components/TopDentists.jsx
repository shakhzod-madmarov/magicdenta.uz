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
      tag: "Mutaxassislar",
      heading: "Eng yaxshi stomatologlar",
      desc: "Tajribali stomatologlarimiz bilan tanishing va mos mutaxassisni tanlab to‘g‘ridan-to‘g‘ri qabulga yoziling.",
      viewAll: "Barchasini ko‘rish",
      book: "Qabulga yozilish",
      cardTag: "Magic Denta mutaxassisi",
    },
    ru: {
      tag: "Специалисты",
      heading: "Лучшие стоматологи",
      desc: "Познакомьтесь с нашими опытными стоматологами и запишитесь на прием напрямую к подходящему специалисту.",
      viewAll: "Посмотреть всех",
      book: "Записаться на прием",
      cardTag: "Специалист Magic Denta",
    },
    en: {
      tag: "Specialists",
      heading: "Top Dentists",
      desc: "Meet our experienced dentists and select the right specialist to book your appointment directly.",
      viewAll: "View all",
      book: "Book appointment",
      cardTag: "Magic Denta Specialist",
    },
  }[lang] || {
    tag: "Mutaxassislar",
    heading: "Eng yaxshi stomatologlar",
    desc: "Tajribali stomatologlarimiz bilan tanishing va mos mutaxassisni tanlab to‘g‘ridan-to‘g‘ri qabulga yoziling.",
    viewAll: "Barchasini ko‘rish",
    book: "Qabulga yozilish",
    cardTag: "Magic Denta mutaxassisi",
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
      className="my-16 px-4 sm:px-8 lg:px-12 bg-slate-50/50 py-16 overflow-hidden border-y border-slate-100"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div className="text-left max-w-2xl space-y-2">
          <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest block">
            {t.tag}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
            {t.heading}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            {t.desc}
          </p>
        </div>
        {/* View all button (Desktop) */}
        <div className="hidden md:block">
          <button
            onClick={() => navigate("/dentists")}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-full hover:bg-slate-50 hover:border-slate-300 transition text-sm shadow-sm"
          >
            {t.viewAll}
          </button>
        </div>
      </div>

      {/* Doctor Cards Rail Slider */}
      <div className="relative max-w-7xl mx-auto w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-slate-50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-slate-50 to-transparent" />

        <ul
          ref={railRef}
          className="flex gap-6 overflow-x-auto scrollbar-none pb-6 px-1 cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {railItems.map((dentist, index) => (
            <li
              key={`${dentist._id}-${index}`}
              className="flex-shrink-0 w-[280px] bg-white border border-slate-100 rounded-[32px] p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Image Box */}
              <div className="aspect-[4/3] w-full rounded-[22px] overflow-hidden bg-gradient-to-tr from-[#EAF3F8] to-[#F0F6FA] border border-slate-100 relative flex items-center justify-center">
                <img
                  src={
                    dentist?.image
                      ? (dentist.image.startsWith("http") ? dentist.image : backendUrl + dentist.image)
                      : "/doctor-placeholder.svg"
                  }
                  alt={dentist?.name || "Stomatolog"}
                  loading="lazy"
                  width="280"
                  height="210"
                  className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/doctor-placeholder.svg";
                  }}
                />
              </div>

              {/* Doctor Details */}
              <div className="pt-4 text-left flex flex-col justify-between flex-grow">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                    {t.cardTag}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-4">
                    {dentist.name}
                  </h3>
                </div>

                {/* Call-to-action */}
                <button
                  type="button"
                  onClick={() => navigate(`/appointment/${dentist._id}`)}
                  aria-label={`${t.book} - ${dentist.name}`}
                  className="w-full py-3 bg-slate-50 hover:bg-slate-900 text-slate-700 hover:text-white font-bold text-xs rounded-2xl flex items-center justify-between px-4 transition-all group/btn"
                >
                  <span>{t.book}</span>
                  <svg className="w-4 h-4 transform group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* View all (Mobile button) */}
        <div className="flex md:hidden items-center justify-center mt-4">
          <button
            onClick={() => navigate("/dentists")}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-full hover:bg-slate-50 transition text-sm shadow-sm"
          >
            {t.viewAll}
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopDentists;
