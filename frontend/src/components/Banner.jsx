import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      badge: "MAGIC DENTA • SOG‘LOM TABASSUM",
      heading: "Sog‘lom va Go‘zal Tabassum Sari Ilk Qadamni Tashlang",
      desc: "Klinikamiz mutaxassislari sizga xalqaro standartlar asosida xavfsiz va mutlaqo og‘riqsiz stomatologik yordam ko‘rsatishga tayyor.",
      book: "Qabulga yozilish",
      services: "Xizmatlar bilan tanishish",
      hours: "Dushanba – Shanba: 08:00 – 20:00 (Yakshanba dam olish)",
      phone: "+998 (91) 289-15-14",
    },
    ru: {
      badge: "MAGIC DENTA • ЗДОРОВАЯ УЛЫБКА",
      heading: "Сделайте первый шаг к здоровой и уверенной улыбке",
      desc: "Наши специалисты готовы предоставить вам бережную и безболезненную помощь по мировым стандартам.",
      book: "Записаться на прием",
      services: "Все наши услуги",
      hours: "Понедельник – Суббота: 08:00 – 20:00 (Воскресенье выходной)",
      phone: "+998 (91) 289-15-14",
    },
    en: {
      badge: "MAGIC DENTA • RADIANT SMILE",
      heading: "Take the First Step Towards Your Confident Smile",
      desc: "Our dental specialists are dedicated to providing painless, gentle, and international-standard oral care.",
      book: "Book Appointment",
      services: "Explore Services",
      hours: "Monday – Saturday: 08:00 – 20:00 (Sunday Closed)",
      phone: "+998 (91) 289-15-14",
    },
  }[lang] || {
    badge: "MAGIC DENTA • SOG‘LOM TABASSUM",
    heading: "Sog‘lom va Go‘zal Tabassum Sari Ilk Qadamni Tashlang",
    desc: "Klinikamiz mutaxassislari sizga xalqaro standartlar asosida xavfsiz va mutlaqo og‘riqsiz stomatologik yordam ko‘rsatishga tayyor.",
    book: "Qabulga yozilish",
    services: "Xizmatlar bilan tanishish",
    hours: "Dushanba – Shanba: 08:00 – 20:00 (Yakshanba dam olish)",
    phone: "+998 (91) 289-15-14",
  };

  return (
    <section className="my-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative bg-gradient-to-br from-[#0F3040] via-[#1E1730] to-[#321E48] rounded-[36px] overflow-hidden p-8 sm:p-14 lg:p-16 border border-[#403D88]/40 shadow-2xl text-center text-white">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#92003A]/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#403D88]/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md text-slate-200 text-[11px] font-black tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#91008D] animate-pulse" />
            {t.badge}
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-white">
            {t.heading}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            {t.desc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/appointment")}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            >
              {t.book} →
            </button>
            <button
              type="button"
              onClick={() => navigate("/services")}
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer"
            >
              {t.services}
            </button>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-semibold">
            <span>🕒 {t.hours}</span>
            <span>•</span>
            <span>📞 {t.phone}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
