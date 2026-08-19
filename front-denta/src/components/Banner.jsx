import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      tag: "ISHLONCHLI XIZMAT",
      title: "Sog‘lom va go‘zal tabassum sari ishonchli qadam",
      desc: "Magic Denta shifokorlari sizga eng yuqori sifatli va mutlaqo og‘riqsiz davolash xizmatlarini taqdim etadi. O‘zingizga qulay vaqtda qabulga yoziling.",
      bookNow: "Qabulga yozilish",
      viewDocs: "Shifokorlarni ko‘rish",
      whyTitle: "Nega Magic Denta?",
      bullet1: "Mutlaqo og‘riqsiz va xavfsiz muolajalar",
      bullet2: "Oliy toifali va tajribali shifokorlar",
      bullet3: "Sifatli materiallar va mustahkam kafolat",
    },
    ru: {
      tag: "НАДЕЖНЫЙ СЕРВИС",
      title: "Надежный шаг к здоровой и красивой улыбке",
      desc: "Врачи Magic Denta предоставят вам качественное и абсолютно безболезненное лечение. Запишитесь на прием в удобное для вас время.",
      bookNow: "Записаться на прием",
      viewDocs: "Посмотреть врачей",
      whyTitle: "Почему Magic Denta?",
      bullet1: "Абсолютно безболезненное и безопасное лечение",
      bullet2: "Опытные специалисты высшей категории",
      bullet3: "Качественные материалы и надежная гарантия",
    },
    en: {
      tag: "TRUSTED SERVICE",
      title: "A Confident Step Toward a Radiant Healthy Smile",
      desc: "Magic Denta specialists provide gentle, pain-free, and high-quality dental care. Schedule your consultation at your convenience.",
      bookNow: "Book Appointment",
      viewDocs: "View Specialists",
      whyTitle: "Why Magic Denta?",
      bullet1: "100% Pain-free and safe clinical procedures",
      bullet2: "Experienced and certified dental specialists",
      bullet3: "Premium restorative materials and lasting results",
    },
  }[lang] || {
    tag: "ISHLONCHLI XIZMAT",
    title: "Sog‘lom va go‘zal tabassum sari ishonchli qadam",
    desc: "Magic Denta shifokorlari sizga eng yuqori sifatli va mutlaqo og‘riqsiz davolash xizmatlarini taqdim etadi.",
    bookNow: "Qabulga yozilish",
    viewDocs: "Shifokorlarni ko‘rish",
    whyTitle: "Nega Magic Denta?",
    bullet1: "Mutlaqo og‘riqsiz va xavfsiz muolajalar",
    bullet2: "Oliy toifali va tajribali shifokorlar",
    bullet3: "Sifatli materiallar va mustahkam kafolat",
  };

  return (
    <section className="relative w-full bg-gradient-to-r from-[#0F3040] via-[#1F182E] to-[#321E48] text-white py-14 md:py-20 px-4 sm:px-8 lg:px-12 flex items-center justify-center overflow-hidden border-y border-white/10">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/symphony.png')] opacity-5 pointer-events-none" aria-hidden="true"></div>

      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left Side: Call-to-action */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <span className="text-xs font-bold text-pink-300 uppercase tracking-widest block">
            {t.tag}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            {t.title}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            {t.desc}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate("/dentists")}
              aria-label={t.bookNow}
              className="px-8 py-3.5 bg-white text-slate-900 font-bold rounded-2xl shadow-lg hover:bg-slate-100 active:scale-95 transition-all text-sm sm:text-base"
            >
              {t.bookNow}
            </button>
            <button
              type="button"
              onClick={() => navigate("/contact")}
              aria-label={t.viewDocs}
              className="px-8 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 active:scale-95 transition-all text-sm sm:text-base"
            >
              {t.viewDocs}
            </button>
          </div>
        </div>

        {/* Right Side: Benefits Card */}
        <div className="lg:col-span-5">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-8 md:p-10 space-y-6 text-left shadow-2xl">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {t.whyTitle}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-white/10 text-pink-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm sm:text-base font-semibold text-slate-200">
                  {t.bullet1}
                </span>
              </li>
              <li className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-white/10 text-pink-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm sm:text-base font-semibold text-slate-200">
                  {t.bullet2}
                </span>
              </li>
              <li className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-white/10 text-pink-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm sm:text-base font-semibold text-slate-200">
                  {t.bullet3}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
