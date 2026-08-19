import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../components/Seo";
import { assets, specialityData } from "../assets/assets";

const About = () => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      seoTitle: "Biz haqimizda | Magic Denta Stomatologiya Markazi",
      seoDesc: "Magic Denta — Zamonaviy stomatologiya klinikasi. Sifatli davolash, og‘riqsiz muolajalar va samimiy g‘amxo‘rlik.",
      badge: "MAGIC DENTA STOMATOLOGIYA KLINIKASI",
      heroTitle: "Tabassumingiz — bizning eng oliy san’atimiz",
      heroDesc: "Biz stomatologiyani shunchaki davolash emas, balki sifatli ashyolar, mutlaq og‘riqsizlik va samimiy insoniy g‘amxo‘rlikning mukammal uyg‘unligi sifatida quramiz.",
      btnBook: "Qabulga yozilish",
      btnServices: "Xizmatlarimiz bilan tanishish",
      
      stat1Val: "15+",
      stat1Lbl: "Yillik professional tajriba",
      stat2Val: "10,000+",
      stat2Lbl: "Mamnun va sog‘lom bemorlar",
      stat3Val: "100%",
      stat3Lbl: "Og‘riqsiz va xavfsiz muolaja",
      stat4Val: "08:00 – 20:00",
      stat4Lbl: "Dush – Shanba (Yakshanba dam)",

      clinicAddress: "Bobur shoh koʻchasi, 1B",

      pillarsTag: "BIZNING FALSAFAMIZ",
      pillarsTitle: "Har bir tabassum ortida ishonch va sifat yotadi",
      pillarsDesc: "Magic Denta har bir bemorga o‘z oila a’zosidek e’tibor qaratadi va yuqori tibbiy standartlarga amal qiladi.",
      
      p1Title: "Aniq va To‘g‘ri Tashxis",
      p1Desc: "Har bir muolaja chuqur ko‘rik va mutaxassisning individual yondashuvi asosida xatosiz rejalashtiriladi.",
      
      p2Title: "Mutlaqo Og‘riqsiz Muolaja",
      p2Desc: "Innovatsion anestetik vositalar va muloyim shifokor yondashuvi evaziga muolajalar butunlay qo‘rquvsiz o‘tadi.",
      
      p3Title: "100% Sterillik va Xavfsizlik",
      p3Desc: "Ko‘p bosqichli avtoklav sterilizatsiyasi va qat’iy gigiyenik nazorat — har bir bemor salomatligi kafolati.",
      
      p4Title: "Shaffof va Halol Xizmat",
      p4Desc: "Hech qanday yashirin to‘lovlarsiz. Davolash rejasi, barcha narxlar va muddatlar muolajadan oldin ochiq kelishiladi.",

      journeyTag: "DAVOLANISH BOSQICHLARI",
      journeyTitle: "Sizning sog‘lom tabassum sari 4 qadamingiz",
      journeyDesc: "Magic Denta’da siz uchun har bir qadam tushunarli, tez va qulay tashkil etilgan.",
      
      step1Num: "01",
      step1Title: "Samimiy qabul & ko‘rik",
      step1Desc: "Shifokor sizning barcha xohishlaringizni tinglaydi va tishlar holatini to‘liq baholaydi.",
      
      step2Num: "02",
      step2Title: "Individual davolash rejasi",
      step2Desc: "Sizga mos davolash usullari, optimal muddat va aniq narxlar batafsil tushuntirib beriladi.",
      
      step3Num: "03",
      step3Title: "Nozik va sifatli muolaja",
      step3Desc: "Oliy toifali shifokorlarimiz zamonaviy materiallar bilan tishingizni og‘riqsiz va go‘zal holatda tiklaydi.",
      
      step4Num: "04",
      step4Title: "Doimiy g‘amxo‘rlik va kafolat",
      step4Desc: "Muolajadan so‘ng natija mustahkamlanadi, profilaktik tavsiyalar beriladi va shifokor nazorati davom etadi.",

      techTag: "ZAMONAVIY QULAYLIKLAR",
      techTitle: "Klinikamizning qulayliklari va standartlari",
      techDesc: "Biz faqat sinovdan o‘tgan sifatli stomatologik materiallar va zamonaviy uskunalardan foydalanamiz.",
      t1: "Sifatli Sirkoniy va Estetik Vinirlar",
      t2: "Zamonaviy Anesteziya va Og‘riqsiz Tizim",
      t3: "Ortodontik Breketlar va Shaffof Elaynerlar",
      t4: "Avtomatlashtirilgan shaxsiy bemor kabineti",

      specsTag: "ASOSIY YO‘NALISHLAR",
      specsTitle: "Klinikamizning asosiy xizmatlari",
      specsDesc: "Terapevtik stomatologiyadan tortib, ortodontiya va ortopedik sirkoniy qoplamalargacha.",
      viewAll: "Barcha xizmatlar",

      bannerTag: "QABULGA YOZILISH",
      bannerTitle: "Bugunoq yangi, nurli tabassum sari qadam tashlang",
      bannerDesc: "Magic Denta shifokorlari sizni qabul qilishga doim tayyor. Hoziroq qulay vaqtni tanlang.",
      bannerBtn1: "Qabulga yozilish →",
      bannerBtn2: "Biz bilan bog‘lanish",
    },
    ru: {
      seoTitle: "О нас | Стоматологический центр Magic Denta",
      seoDesc: "Magic Denta — современная стоматологическая клиника в Андижане. Качественное лечение, забота и процедуры без боли.",
      badge: "СТОМАТОЛОГИЧЕСКИЙ ЦЕНТР MAGIC DENTA",
      heroTitle: "Ваша улыбка — наше главное искусство",
      heroDesc: "Мы создаем стоматологию не просто как лечение, а как гармонию качественных материалов, абсолютной безболезненности и искренней заботы о каждом человеке.",
      btnBook: "Записаться на прием",
      btnServices: "Познакомиться с услугами",
      
      stat1Val: "15+",
      stat1Lbl: "Лет профессионального опыта",
      stat2Val: "10,000+",
      stat2Lbl: "Счастливых и здоровых улыбок",
      stat3Val: "100%",
      stat3Lbl: "Безболезненное лечение",
      stat4Val: "08:00 – 20:00",
      stat4Lbl: "Пн – Сб (Вс выходной)",

      clinicAddress: "г. Андижан, проспект Бабура, 1B",

      pillarsTag: "НАША ФИЛОСОФИЯ",
      pillarsTitle: "За каждой улыбкой стоят доверие и качество",
      pillarsDesc: "В Magic Denta мы относимся к каждому пациенту как к члену семьи, соблюдая высокие медицинские стандарты.",
      
      p1Title: "Точный диагноз и осмотр",
      p1Desc: "Внимательный клинический осмотр позволяет безошибочно спланировать каждый шаг лечения.",
      
      p2Title: "Абсолютно без боли",
      p2Desc: "Инновационная анестезия и бережные методики гарантируют спокойствие и комфорт во время приема.",
      
      p3Title: "100% Стерильность и безопасность",
      p3Desc: "Автоклавная обработка инструментов и строгий контроль — залог вашей абсолютной безопасности.",
      
      p4Title: "Прозрачность и честность",
      p4Desc: "Никаких скрытых платежей. План лечения, точная стоимость и сроки согласуются до начала процедур.",

      journeyTag: "ЭТАПЫ ЛЕЧЕНИЯ",
      journeyTitle: "Ваши 4 шага к безупречной улыбке",
      journeyDesc: "Мы делаем каждый шаг лечения понятным, комфортным и предсказуемым.",
      
      step1Num: "01",
      step1Title: "Теплый прием и осмотр",
      step1Desc: "Врач внимательно выслушает ваши пожелания и проведет полный осмотр состояния зубов.",
      
      step2Num: "02",
      step2Title: "Индивидуальный план лечения",
      step2Desc: "Подробное объяснение процедур, выбор оптимальных материалов и фиксированная стоимость.",
      
      step3Num: "03",
      step3Title: "Бережное и качественное лечение",
      step3Desc: "Опытные специалисты аккуратно и безболезненно восстановят здоровье и эстетику ваших зубов.",
      
      step4Num: "04",
      step4Title: "Результат, гарантия и уход",
      step4Desc: "Персональные рекомендации по уходу и долгосрочное наблюдение за здоровьем улыбки.",

      techTag: "ОСНАЩЕНИЕ",
      techTitle: "Удобство и стандарты клиники",
      techDesc: "Мы используем только качественные стоматологические материалы и проверенное оборудование.",
      t1: "Премиальный диоксид циркония и виниры",
      t2: "Современная безболезненная анестезия",
      t3: "Брекеты и прозрачные элайнеры",
      t4: "Автоматизированный личный кабинет пациента",

      specsTag: "НАПРАВЛЕНИЯ",
      specsTitle: "Наши основные услуги",
      specsDesc: "От бережного лечения кариеса до надежной ортодонтии и циркониевых коронок.",
      viewAll: "Все услуги",

      bannerTag: "ЗАПИСЬ НА ПРИЕМ",
      bannerTitle: "Сделайте шаг к здоровой улыбке уже сегодня",
      bannerDesc: "Врачи Magic Denta готовы помочь вам в любое удобное время. Запишитесь на прием прямо сейчас.",
      bannerBtn1: "Записаться на прием →",
      bannerBtn2: "Связаться с нами",
    },
    en: {
      seoTitle: "About Us | Magic Denta Specialized Clinic",
      seoDesc: "Magic Denta is a modern dental clinic specializing in Dental Orthopedics offering gentle pain-free care and trusted clinical treatments.",
      badge: "MAGIC DENTA CLINICAL CENTER",
      heroTitle: "Your Smile Is Our Greatest Masterpiece",
      heroDesc: "We build modern dentistry as a seamless harmony of quality materials, painless clinical precision, and genuine human warmth.",
      btnBook: "Book Appointment",
      btnServices: "Explore Services",
      
      stat1Val: "15+",
      stat1Lbl: "Years Clinical Experience",
      stat2Val: "10,000+",
      stat2Lbl: "Delighted & Healthy Patients",
      stat3Val: "100%",
      stat3Lbl: "Pain-Free Gentle Care",
      stat4Val: "08:00 – 20:00",
      stat4Lbl: "Mon – Sat (Sun Closed)",

      clinicAddress: "1B Babur Avenue, Andijan",

      pillarsTag: "OUR PHILOSOPHY",
      pillarsTitle: "Behind Every Smile Lies Trust and Excellence",
      pillarsDesc: "At Magic Denta, we treat every patient like family, adhering strictly to high medical standards.",
      
      p1Title: "Accurate Diagnosis & Exam",
      p1Desc: "Comprehensive clinical evaluation ensures precise treatment planning for every patient.",
      
      p2Title: "100% Pain-Free Care",
      p2Desc: "Advanced anesthesia and gentle techniques ensure a completely relaxed, fear-free appointment.",
      
      p3Title: "100% Sterile & Safe",
      p3Desc: "Hospital-grade autoclave sterilization and strict hygienic protocols for your complete safety.",
      
      p4Title: "Transparent & Honest Care",
      p4Desc: "Zero hidden costs. Comprehensive treatment plans, timelines, and fees agreed upon upfront.",

      journeyTag: "TREATMENT JOURNEY",
      journeyTitle: "Your 4 Steps to a Perfect Smile",
      journeyDesc: "We make your entire dental journey clear, comforting, and effortless.",
      
      step1Num: "01",
      step1Title: "Welcoming Exam & Consultation",
      step1Desc: "Our specialist listens to your concerns and conducts a thorough oral examination.",
      
      step2Num: "02",
      step2Title: "Custom Treatment Plan",
      step2Desc: "Transparent procedures, flexible schedules, and fixed pricing agreed upon beforehand.",
      
      step3Num: "03",
      step3Title: "Gentle & Expert Treatment",
      step3Desc: "Top-tier specialists restore your oral health with state-of-the-art restorative materials.",
      
      step4Num: "04",
      step4Title: "Flawless Results & Aftercare",
      step4Desc: "Personalized hygiene guidance and dedicated follow-up care to keep your smile glowing.",

      techTag: "INFRASTRUCTURE",
      techTitle: "Modern Clinic Standards",
      techDesc: "We utilize proven dental materials and modern clinical instruments.",
      t1: "Premium Zirconia & Aesthetic Veneers",
      t2: "Advanced Pain-Free Anesthesia Systems",
      t3: "Orthodontic Brackets & Clear Aligners",
      t4: "Automated Patient Portal & Notifications",

      specsTag: "SPECIALTIES",
      specsTitle: "Core Clinical Specialties",
      specsDesc: "From therapeutic restorations to orthodontics and high-durability Zirconia crowns.",
      viewAll: "All Services",

      bannerTag: "APPOINTMENT",
      bannerTitle: "Take the first step toward a radiant smile today",
      bannerDesc: "Magic Denta specialists are ready to welcome you. Book your visit or contact us directly.",
      bannerBtn1: "Book Appointment →",
      bannerBtn2: "Contact Us",
    },
  }[lang] || {
    seoTitle: "Biz haqimizda | Magic Denta",
    seoDesc: "Magic Denta — Zamonaviy stomatologiya klinikasi.",
    badge: "MAGIC DENTA STOMATOLOGIYA KLINIKASI",
    heroTitle: "Tabassumingiz — bizning eng oliy san’atimiz",
    heroDesc: "Biz stomatologiyani sifatli ashyolar, mutlaq og‘riqsizlik va samimiy g‘amxo‘rlik uyg‘unligi sifatida quramiz.",
    btnBook: "Qabulga yozilish",
    btnServices: "Xizmatlarimiz bilan tanishish",
    stat1Val: "15+",
    stat1Lbl: "Yillik tajriba",
    stat2Val: "10,000+",
    stat2Lbl: "Mamnun bemorlar",
    stat3Val: "100%",
    stat3Lbl: "Og‘riqsiz muolaja",
    stat4Val: "08:00 – 20:00",
    stat4Lbl: "Dush – Shanba",
    clinicAddress: "Bobur shoh koʻchasi, 1B",
    pillarsTag: "BIZNING FALSAFAMIZ",
    pillarsTitle: "Har bir tabassum ortida ishonch va sifat yotadi",
    pillarsDesc: "Magic Denta har bir bemorga o‘z oila a’zosidek e’tibor qaratadi.",
    p1Title: "Aniq va To‘g‘ri Tashxis",
    p1Desc: "Har bir muolaja chuqur ko‘rik asosida xatosiz rejalashtiriladi.",
    p2Title: "Mutlaqo Og‘riqsiz Muolaja",
    p2Desc: "Innovatsion anestetik vositalar bilan muolajalar qulay o‘tadi.",
    p3Title: "100% Sterillik va Xavfsizlik",
    p3Desc: "Xalqaro avtoklav sterilizatsiyasi va qat’iy nazorat.",
    p4Title: "Shaffof va Halol Xizmat",
    p4Desc: "Barcha narxlar va muddatlar muolajadan oldin ochiq kelishiladi.",
    journeyTag: "DAVOLANISH BOSQICHLARI",
    journeyTitle: "Sizning sog‘lom tabassum sari 4 qadamingiz",
    journeyDesc: "Magic Denta’da har bir qadam tushunarli va qulay.",
    step1Num: "01",
    step1Title: "Samimiy qabul & ko‘rik",
    step1Desc: "Shifokor tishlar holatini to‘liq baholaydi.",
    step2Num: "02",
    step2Title: "Individual davolash rejasi",
    step2Desc: "Davolash usullari va aniq narxlar kelishiladi.",
    step3Num: "03",
    step3Title: "Nozik va sifatli muolaja",
    step3Desc: "Oliy toifali shifokorlarimiz tishingizni og‘riqsiz tiklaydi.",
    step4Num: "04",
    step4Title: "Doimiy g‘amxo‘rlik va kafolat",
    step4Desc: "Profilaktik tavsiyalar va shifokor nazorati.",
    techTag: "ZAMONAVIY QULAYLIKLAR",
    techTitle: "Klinikamizning qulayliklari va jihozlari",
    techDesc: "Biz faqat sifatli stomatologik materiallardan foydalanamiz.",
    t1: "Sifatli Sirkoniy va Vinirlar",
    t2: "Zamonaviy Anesteziya va Og‘riqsiz Tizim",
    t3: "Breketlar va elaynerlar",
    t4: "Avtomatlashtirilgan bemor kabineti",
    specsTag: "MUTAXASSISLIKLAR",
    specsTitle: "Klinikamizning asosiy xizmatlari",
    specsDesc: "Barcha asosiy davolash yo‘nalishlarimiz.",
    viewAll: "Barchasini ko‘rish",
    bannerTag: "QABULGA YOZILISH",
    bannerTitle: "Bugunoq yangi, nurli tabassum sari qadam tashlang",
    bannerDesc: "Magic Denta shifokorlari sizni qabul qilishga tayyor.",
    bannerBtn1: "Qabulga yozilish →",
    bannerBtn2: "Bog‘lanish",
  };

  const pillars = [
    {
      title: t.p1Title,
      desc: t.p1Desc,
      iconBg: "from-[#0F3040] to-[#403D88]",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: t.p2Title,
      desc: t.p2Desc,
      iconBg: "from-[#92003A] to-[#91008D]",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: t.p3Title,
      desc: t.p3Desc,
      iconBg: "from-emerald-700 to-teal-800",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: t.p4Title,
      desc: t.p4Desc,
      iconBg: "from-[#403D88] to-[#1E1733]",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const steps = [
    { num: t.step1Num, title: t.step1Title, desc: t.step1Desc },
    { num: t.step2Num, title: t.step2Title, desc: t.step2Desc },
    { num: t.step3Num, title: t.step3Title, desc: t.step3Desc },
    { num: t.step4Num, title: t.step4Title, desc: t.step4Desc },
  ];

  const carouselItems = useMemo(() => [...specialityData, ...specialityData], []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return undefined;

    const speed = 0.6;
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
  }, [paused]);

  const handleNavigate = (slug) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/services/${slug}`);
  };

  return (
    <div className="bg-[#F8F9FD] min-h-screen text-[#0F3040] py-4">
      <Seo
        title={t.seoTitle}
        description={t.seoDesc}
        canonicalPath="/about"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": ["Dentist", "MedicalBusiness", "LocalBusiness"],
          name: "Magic Denta",
          url: "https://magicdenta.uz/about",
          logo: "https://magicdenta.uz/logo.png",
          image: "https://magicdenta.uz/logo.png",
          telephone: ["+998912891514", "+998905429303"],
          email: "magicdenta.uz@gmail.com",
          priceRange: "10000 UZS - 1400000 UZS",
          openingHours: "Mo-Sa 08:00-20:00",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Bobur shoh koʻchasi, 1B",
            addressLocality: "Andijon",
            addressRegion: "Andijon",
            postalCode: "170126",
            addressCountry: "UZ"
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 40.749296,
            longitude: 72.360242
          },
          hasMap: "https://yandex.uz/maps/-/CTsybHos",
          sameAs: [
            "https://yandex.uz/maps/-/CTsybHos",
            "https://www.instagram.com/magic.denta/",
            "https://t.me/+998912891514"
          ]
        }}
      />

      <main className="text-left">
        {/* ═══════════════════════════════════════════
            SECTION 1: HERO HEADER & CLINIC PORTRAIT
        ═══════════════════════════════════════════ */}
        <section className="pt-6 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Creative Narrative */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#403D88]/20 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#91008D] animate-pulse"></span>
                  <span className="text-[11px] font-black tracking-wider text-[#403D88] uppercase">
                    {t.badge}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.12] tracking-tight text-[#0F3040]">
                  {t.heroTitle}
                </h1>

                <p className="text-base sm:text-lg leading-relaxed text-slate-600 max-w-2xl font-normal">
                  {t.heroDesc}
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <button
                    onClick={() => navigate("/appointment")}
                    className="px-8 py-4 bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white font-black text-xs uppercase tracking-wider rounded-full transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <span>{t.btnBook}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigate("/services")}
                    className="px-8 py-4 bg-white hover:bg-slate-50 text-[#0F3040] font-bold text-xs uppercase tracking-wider rounded-full transition-all border border-slate-200 shadow-xs active:scale-95 cursor-pointer"
                  >
                    {t.btnServices}
                  </button>
                </div>

                {/* 4 Quick Stat Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200/80">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card-clean hover:-translate-y-1 transition-transform">
                    <p className="text-2xl font-black text-[#0F3040]">{t.stat1Val}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1 leading-tight">{t.stat1Lbl}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card-clean hover:-translate-y-1 transition-transform">
                    <p className="text-2xl font-black text-[#92003A]">{t.stat2Val}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1 leading-tight">{t.stat2Lbl}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card-clean hover:-translate-y-1 transition-transform">
                    <p className="text-2xl font-black text-emerald-600">{t.stat3Val}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1 leading-tight">{t.stat3Lbl}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card-clean hover:-translate-y-1 transition-transform">
                    <p className="text-2xl font-black text-[#403D88]">{t.stat4Val}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1 leading-tight">{t.stat4Lbl}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Framed 3D Building Photo */}
              <div className="lg:col-span-5">
                <div className="rounded-[36px] bg-gradient-to-br from-[#0F3040] via-[#1E1733] to-[#321E48] p-3 border border-[#403D88]/30 shadow-2xl relative group hover:-translate-y-2 transition-all duration-500">
                  <div className="relative h-[380px] sm:h-[450px] w-full rounded-[28px] overflow-hidden bg-slate-900 shadow-inner">
                    <img
                      src={assets.about_img}
                      alt="Magic Denta klinikasi"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Bottom floating badge */}
                    <div className="absolute bottom-4 left-4 right-4 bg-[#0F3040]/90 backdrop-blur-md rounded-2xl p-4 text-white flex items-center gap-3.5 border border-white/20 shadow-xl">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#92003A] to-[#91008D] flex items-center justify-center shrink-0 shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="truncate">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">Magic Denta Markazi</p>
                        <p className="text-xs font-bold text-white truncate">{t.clinicAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 2: 4 CLINICAL PILLARS
        ═══════════════════════════════════════════ */}
        <section className="py-20 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-black text-[#403D88] uppercase tracking-widest block mb-2">
                {t.pillarsTag}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0F3040] tracking-tight leading-tight">
                {t.pillarsTitle}
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 font-normal">
                {t.pillarsDesc}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-[30px] bg-[#F8F9FD] p-7 border border-slate-200/80 shadow-card-clean hover:shadow-2xl hover:-translate-y-2 hover:border-[#403D88]/40 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center mb-6 shadow-md border border-white/20 group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-[#0F3040] mb-2.5">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600 font-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 3: 4-STEP PATIENT JOURNEY
        ═══════════════════════════════════════════ */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-[40px] bg-white border border-slate-200/90 p-8 sm:p-14 shadow-card-clean">
              <div className="text-left max-w-2xl mb-12">
                <span className="text-xs font-black text-[#403D88] uppercase tracking-widest block mb-2">
                  {t.journeyTag}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#0F3040] tracking-tight leading-tight">
                  {t.journeyTitle}
                </h2>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 font-normal">
                  {t.journeyDesc}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-6 sm:p-7 rounded-[28px] bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-3xl font-black text-slate-300 group-hover:text-[#92003A] transition-colors block mb-4">
                        {step.num}
                      </span>
                      <h3 className="text-base font-black text-[#0F3040] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-600 font-normal">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 4: 3D SPECIALTIES MARQUEE
        ═══════════════════════════════════════════ */}
        <section className="py-20 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div className="max-w-2xl text-left">
                <span className="text-xs font-black text-[#403D88] uppercase tracking-widest block mb-2">
                  {t.specsTag}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F3040]">
                  {t.specsTitle}
                </h2>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 font-normal">
                  {t.specsDesc}
                </p>
              </div>

              <Link
                to="/services"
                className="px-6 py-3 bg-[#0F3040] hover:bg-[#321E48] text-white text-xs font-black uppercase tracking-wider rounded-full transition shadow-sm self-start sm:self-auto cursor-pointer"
              >
                {t.viewAll}
              </Link>
            </div>

            <div className="overflow-hidden relative mt-8">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />

              <ul
                ref={carouselRef}
                className="flex gap-5 overflow-x-auto px-1 py-4 cursor-grab active:cursor-grabbing scrollbar-none"
                style={{
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
              >
                {carouselItems.map((item, index) => {
                  const displayTitle = item.displayName?.[lang] || item.speciality;
                  return (
                    <li
                      key={`${item.slug}-${index}`}
                      className="w-[16rem] shrink-0"
                    >
                      <button
                        type="button"
                        onClick={() => handleNavigate(item.slug)}
                        className="group flex min-h-[240px] w-full flex-col items-center justify-between rounded-[30px] border border-slate-200/90 bg-[#F8F9FD] p-6 text-center shadow-card-clean transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-white hover:border-[#403D88]/40 cursor-pointer"
                      >
                        <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-[#0F3040] to-[#321E48] p-1 flex items-center justify-center shadow-md overflow-hidden group-hover:scale-110 transition-transform duration-300">
                          <img
                            src={item.image}
                            alt={displayTitle}
                            className="w-full h-full object-cover rounded-[18px]"
                          />
                        </div>

                        <h3 className="mt-4 text-sm font-black leading-tight text-[#0F3040] group-hover:text-[#92003A] transition-colors">
                          {displayTitle}
                        </h3>

                        <span className="text-[11px] font-black uppercase tracking-wider text-[#403D88] group-hover:text-[#91008D] mt-2 flex items-center gap-1 transition-colors">
                          <span>Batafsil ko‘rish</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 5: MODERN EQUIPMENT & COMFORT
        ═══════════════════════════════════════════ */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-[40px] bg-gradient-to-br from-[#0F3040] via-[#1E1733] to-[#321E48] text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden border border-[#403D88]/40">
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#92003A]/20 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#403D88]/25 blur-3xl pointer-events-none" />

              <div className="relative z-10 grid gap-10 lg:grid-cols-12 items-center">
                <div className="lg:col-span-6 space-y-4 text-left">
                  <span className="text-xs font-black uppercase tracking-widest text-[#E8D5F5]">
                    {t.techTag}
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                    {t.techTitle}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                    {t.techDesc}
                  </p>
                </div>

                <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[t.t1, t.t2, t.t3, t.t4].map((tech, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-sm flex items-start gap-3 hover:bg-white/[0.12] transition-all"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-200 text-left leading-snug">
                        {tech}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 6: CALL TO ACTION BANNER
        ═══════════════════════════════════════════ */}
        <section id="contact-section" className="pb-20 pt-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[40px] bg-gradient-to-r from-[#92003A] via-[#5C1A4A] to-[#321E48] px-8 py-12 text-white shadow-glow-wine sm:px-14 sm:py-16 border border-white/20">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl text-left space-y-3">
                  <span className="text-xs font-black uppercase tracking-widest text-[#E8D5F5]">
                    {t.bannerTag}
                  </span>
                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl leading-tight text-white">
                    {t.bannerTitle}
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-200 sm:text-base font-normal">
                    {t.bannerDesc}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row shrink-0">
                  <Link
                    to="/appointment"
                    className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-xs sm:text-sm font-black uppercase tracking-wider text-[#0F3040] transition hover:bg-slate-100 shadow-md active:scale-95 cursor-pointer"
                  >
                    {t.bannerBtn1}
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-4 text-xs sm:text-sm font-black uppercase tracking-wider text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95 cursor-pointer"
                  >
                    {t.bannerBtn2}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
