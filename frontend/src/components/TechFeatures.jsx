const TechFeatures = () => {
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      tag: "AFZALLIKLARIMIZ",
      heading: "Nega aynan Magic Denta?",
      desc: "Biz har bir bemorga individual yondashuv, raqamli aniqlik va xalqaro sifat standartlarini kafolatlaymiz.",
      f1Title: "3D Raqamli Tashxis",
      f1Desc: "Eng so'nggi avlod 3D tomografiya va raqamli skanerlash orqali 100% aniq va xatosiz tashxis qo'yish.",
      f2Title: "Mutlaqo Og‘riqsiz Muolaja",
      f2Desc: "Zamonaviy innovatsion anesteziya va muloyim muolaja usullari orqali xotirjam va qulay davolanish tajribasi.",
      f3Title: "Xalqaro Sterillik Standarti",
      f3Desc: "Ko'p bosqichli avtoklav sterilizatsiyasi va qat'iy nazorat ostidagi 100% xavfsiz va toza gigiyenik muhit.",
      f4Title: "Smart Telegram Servis",
      f4Desc: "Uchrashuvlarni qulay bron qilish, Telegram orqali avtomatik eslatmalar va shaxsiy bemor kabineti.",
    },
    ru: {
      tag: "НАШИ ПРЕИМУЩЕСТВА",
      heading: "Почему Magic Denta?",
      desc: "Мы гарантируем индивидуальный подход, цифровую точность и международные стандарты безопасности для каждого пациента.",
      f1Title: "3D Цифровая диагностика",
      f1Desc: "3D томография нового поколения и цифровое сканирование для безошибочного планирования лечения.",
      f2Title: "Лечение без боли и страха",
      f2Desc: "Инновационная анестезия и бережные методики для максимального комфорта и спокойствия во время приема.",
      f3Title: "Международный стандарт стерильности",
      f3Desc: "Многоступенчатая автоклавная стерилизация и строжайший контроль инфекционной безопасности.",
      f4Title: "Smart Telegram сервис",
      f4Desc: "Быстрая онлайн-запись, мгновенные напоминания в Telegram и удобный личный кабинет пациента.",
    },
    en: {
      tag: "OUR ADVANTAGES",
      heading: "Why Choose Magic Denta?",
      desc: "We ensure personalized patient care, digital precision, and international clinical safety standards.",
      f1Title: "3D Digital Diagnostics",
      f1Desc: "Next-generation 3D tomography and precision digital scanning for flawless treatment planning.",
      f2Title: "100% Pain-Free Care",
      f2Desc: "Innovative anesthesia and gentle treatment techniques ensuring a serene, stress-free experience.",
      f3Title: "Strict Sterility Standards",
      f3Desc: "Multi-stage autoclave sterilization and uncompromising hygienic protocols for your peace of mind.",
      f4Title: "Smart Telegram Sync",
      f4Desc: "Instant appointment booking, automated Telegram visit reminders, and personalized patient portal.",
    },
  }[lang] || {
    tag: "AFZALLIKLARIMIZ",
    heading: "Nega aynan Magic Denta?",
    desc: "Biz har bir bemorga individual yondashuv, raqamli aniqlik va xalqaro sifat standartlarini kafolatlaymiz.",
    f1Title: "3D Raqamli Tashxis",
    f1Desc: "Eng so'nggi avlod 3D tomografiya va raqamli skanerlash orqali 100% aniq tashxis.",
    f2Title: "Mutlaqo Og‘riqsiz Muolaja",
    f2Desc: "Zamonaviy innovatsion anesteziya orqali xotirjam va qulay davolanish tajribasi.",
    f3Title: "Xalqaro Sterillik Standarti",
    f3Desc: "Ko'p bosqichli avtoklav sterilizatsiyasi va 100% xavfsiz muhit.",
    f4Title: "Smart Telegram Servis",
    f4Desc: "Uchrashuvlarni qulay bron qilish va Telegram orqali avtomatik eslatmalar.",
  };

  const features = [
    {
      icon: (
        <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      title: t.f1Title,
      desc: t.f1Desc,
      glow: "hover:border-emerald-500/50 hover:shadow-neon-emerald",
      badge: "3D DIAGNOSTICS",
    },
    {
      icon: (
        <svg className="w-7 h-7 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t.f2Title,
      desc: t.f2Desc,
      glow: "hover:border-cyan-500/50 hover:shadow-neon-cyan",
      badge: "PAIN-FREE TECH",
    },
    {
      icon: (
        <svg className="w-7 h-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t.f3Title,
      desc: t.f3Desc,
      glow: "hover:border-teal-500/50 hover:shadow-neon-emerald",
      badge: "STERILITY 100%",
    },
    {
      icon: (
        <svg className="w-7 h-7 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: t.f4Title,
      desc: t.f4Desc,
      glow: "hover:border-sky-500/50 hover:shadow-neon-cyan",
      badge: "SMART SYNC",
    },
  ];

  return (
    <section className="my-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-bold text-pink-400 uppercase tracking-widest block mb-2">
          {t.tag}
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
          {t.heading}
        </h2>
        <p className="text-slate-400 mt-4 text-sm sm:text-base leading-relaxed">
          {t.desc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <article
            key={i}
            className={`tech-glass-card rounded-[28px] p-7 flex flex-col justify-between group transition-all duration-300 ${f.glow}`}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center transition-transform group-hover:scale-110">
                  {f.icon}
                </div>
                <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                  {f.badge}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white mb-3 tracking-tight group-hover:text-purple-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
            
            <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 transition-colors">
                Magic Denta Standard
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TechFeatures;
