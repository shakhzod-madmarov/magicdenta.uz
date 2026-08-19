import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      tag: "KAFOLATLANGAN SIFAT",
      title: "Sog‘lom va go‘zal tabassum sari ishonchli qadam",
      desc: "Magic Denta shifokorlari sizga eng yuqori sifatli va mutlaqo og‘riqsiz davolash xizmatlarini taqdim etadi. O‘zingizga qulay vaqtda qabulga yoziling.",
      bookNow: "Qabulga yozilish",
      viewDocs: "Biz bilan bog‘lanish",
      whyTitle: "Nega aynan Magic Denta?",
      bullet1: "Mutlaqo og‘riqsiz va xavfsiz muolajalar",
      bullet2: "Oliy toifali va tajribali ortodontlar",
      bullet3: "Sifatli materiallar va mustahkam kafolat",
    },
    ru: {
      tag: "ГАРАНТИРОВАННОЕ КАЧЕСТВО",
      title: "Надежный шаг к здоровой и красивой улыбке",
      desc: "Врачи Magic Denta предоставят вам качественное и абсолютно безболезненное лечение. Запишитесь на прием в удобное для вас время.",
      bookNow: "Записаться на прием",
      viewDocs: "Связаться с нами",
      whyTitle: "Почему Magic Denta?",
      bullet1: "Абсолютно безболезненное и безопасное лечение",
      bullet2: "Опытные специалисты высшей категории",
      bullet3: "Качественные материалы и надежная гарантия",
    },
    en: {
      tag: "GUARANTEED EXCELLENCE",
      title: "A Confident Step Toward a Radiant Healthy Smile",
      desc: "Magic Denta specialists provide gentle, pain-free, and high-quality dental care. Schedule your consultation at your convenience.",
      bookNow: "Book Appointment",
      viewDocs: "Contact Clinic",
      whyTitle: "Why Magic Denta?",
      bullet1: "100% Pain-free and safe clinical procedures",
      bullet2: "Experienced and certified dental specialists",
      bullet3: "Premium restorative materials and lasting results",
    },
  }[lang] || {
    tag: "KAFOLATLANGAN SIFAT",
    title: "Sog‘lom va go‘zal tabassum sari ishonchli qadam",
    desc: "Magic Denta shifokorlari sizga eng yuqori sifatli va mutlaqo og‘riqsiz davolash xizmatlarini taqdim etadi.",
    bookNow: "Qabulga yozilish",
    viewDocs: "Biz bilan bog‘lanish",
    whyTitle: "Nega aynan Magic Denta?",
    bullet1: "Mutlaqo og‘riqsiz va xavfsiz muolajalar",
    bullet2: "Oliy toifali va tajribali ortodontlar",
    bullet3: "Sifatli materiallar va mustahkam kafolat",
  };

  return (
    <section className="relative w-full bg-gradient-to-r from-[#0F3040] via-[#241A38] to-[#321E48] text-white py-16 md:py-24 px-4 sm:px-8 lg:px-12 flex items-center justify-center overflow-hidden border-y border-[#403D88]/40">
      {/* Glow Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#92003A]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#403D88]/25 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left Side: Call-to-action */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <span className="text-xs font-black text-[#91008D] uppercase tracking-widest block">
            {t.tag}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
            {t.title}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            {t.desc}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate("/contact")}
              aria-label={t.bookNow}
              className="px-8 py-4 bg-gradient-to-r from-[#92003A] to-[#91008D] text-white font-extrabold rounded-full shadow-glow-wine hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-sm sm:text-base cursor-pointer"
            >
              {t.bookNow}
            </button>
            <button
              type="button"
              onClick={() => navigate("/contact")}
              aria-label={t.viewDocs}
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white/20 active:scale-95 transition-all text-sm sm:text-base cursor-pointer"
            >
              {t.viewDocs}
            </button>
          </div>
        </div>

        {/* Right Side: Benefits Card */}
        <div className="lg:col-span-5">
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/15 rounded-[32px] p-8 md:p-10 space-y-6 text-left shadow-2xl">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {t.whyTitle}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#403D88]/40 border border-[#403D88] text-[#91008D] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm sm:text-base font-semibold text-slate-200">
                  {t.bullet1}
                </span>
              </li>
              <li className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#403D88]/40 border border-[#403D88] text-[#91008D] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm sm:text-base font-semibold text-slate-200">
                  {t.bullet2}
                </span>
              </li>
              <li className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#403D88]/40 border border-[#403D88] text-[#91008D] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
