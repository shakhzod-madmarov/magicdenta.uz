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
      seoTitle: "Biz haqimizda | Magic Denta",
      seoDesc: "Magic Denta — Zamonaviy stomatologiya klinikasi. Sifatli davolash, og‘riqsiz muolajalar va samimiy g‘amxo‘rlik.",
      badge: "MAGIC DENTA STOMATOLOGIYA KLINIKASI",
      heroTitle: "Tabassumingiz — bizning eng oliy san’atimiz",
      heroDesc: "Biz stomatologiyani shunchaki davolash emas, balki sifatli ashyolar, mutlaq og‘riqsizlik va samimiy insoniy g‘amxo‘rlikning mukammal uyg‘unligi sifatida quramiz.",
      btnBook: "Qabulga yozilish",
      btnDoctors: "Shifokorlarimiz bilan tanishish",
      
      stat1Val: "15+",
      stat1Lbl: "Yillik professional tajriba",
      stat2Val: "10,000+",
      stat2Lbl: "Mamnun va sog‘lom bemorlar",
      stat3Val: "100%",
      stat3Lbl: "Og‘riqsiz va xavfsiz muolaja",
      stat4Val: "24/7",
      stat4Lbl: "Onlayn yordam va konsultatsiya",

      clinicAddress: "Magic Denta Klinikasi",

      pillarsTag: "BIZNING FALSAFAMIZ",
      pillarsTitle: "Har bir tabassum ortida ishonch va sifat yotadi",
      pillarsDesc: "Magic Denta har bir bemorga o‘z oila a’zosidek e’tibor qaratadi va yuqori tibbiy standartlarga amal qiladi.",
      
      p1Title: "Aniq va To‘g‘ri Tashxis",
      p1Desc: "Har bir muolaja chuqur ko‘rik va mutaxassisning individual yondashuvi asosida xatosiz rejalashtiriladi.",
      
      p2Title: "Mutlaqo Og‘riqsiz Muolaja",
      p2Desc: "Innovatsion anestetik vositalar va muloyim shifokor yondashuvi evaziga muolajalar butunlay qo‘rquvsiz o‘tadi.",
      
      p3Title: "5 Bosqichli Sterillik",
      p3Desc: "Xalqaro avtoklav sterilizatsiyasi va qat’iy nazorat — har bir bemorimiz salomatligi va xavfsizligi kafolati.",
      
      p4Title: "Shaffof va Halol Xizmat",
      p4Desc: "Hech qanday kutilmagan to‘lovlarsiz. Davolash rejasi, barcha narxlar va muddatlar muolajadan oldin ochiq kelishiladi.",

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

      techTag: "ZAMONAVIY USKUNALAR",
      techTitle: "Klinikamizning qulayliklari va jihozlari",
      techDesc: "Biz faqat sinovdan o‘tgan sifatli stomatologik materiallar va qulay uskunalardan foydalanamiz.",
      t1: "Sifatli Zirkon va E-max Keramika",
      t2: "Zamonaviy Anesteziya va Og‘riqsiz Tizim",
      t3: "Lazerli tish davolash va oqartirish",
      t4: "Avtomatlashtirilgan shaxsiy bemor kabineti",

      specsTag: "MUTAXASSISLIKLAR",
      specsTitle: "Klinikamizning asosiy xizmatlari",
      specsDesc: "Terapevtik stomatologiyadan tortib, implantatsiya va tabassum estetikasigacha.",
      viewAll: "Barchasini ko‘rish",

      bannerTag: "QABULGA YOZILISH",
      bannerTitle: "Bugunoq yangi, nurli tabassum sari qadam tashlang",
      bannerDesc: "Magic Denta shifokorlari sizni qabul qilishga doim tayyor. Hoziroq qulay vaqtni tanlang.",
      bannerBtn1: "Bog‘lanish",
      bannerBtn2: "Shifokorlarni ko‘rish",
    },
    ru: {
      seoTitle: "О нас | Magic Denta",
      seoDesc: "Magic Denta — современная стоматологическая клиника в Андижане. Качественное лечение, забота и процедуры без боли.",
      badge: "СТОМАТОЛОГИЧЕСКИЙ ЦЕНТР MAGIC DENTA",
      heroTitle: "Ваша улыбка — наше главное искусство",
      heroDesc: "Мы создаем стоматологию не просто как лечение, а как гармонию качественных материалов, абсолютной безболезненности и искренней заботы о каждом человеке.",
      btnBook: "Записаться на прием",
      btnDoctors: "Познакомиться с врачами",
      
      stat1Val: "15+",
      stat1Lbl: "Лет профессионального опыта",
      stat2Val: "10,000+",
      stat2Lbl: "Счастливых и здоровых улыбок",
      stat3Val: "100%",
      stat3Lbl: "Безболезненное лечение",
      stat4Val: "24/7",
      stat4Lbl: "Онлайн-запись и консультации",

      clinicAddress: "г. Андижан, ул. Эргаша Ашурова, д. 58 (Ориентир: Семашко, Ташкент-стрит)",

      pillarsTag: "НАША ФИЛОСОФИЯ",
      pillarsTitle: "За каждой улыбкой стоят доверие и качество",
      pillarsDesc: "В Magic Denta мы относимся к каждому пациенту как к члену семьи, соблюдая высокие медицинские стандарты.",
      
      p1Title: "Точный диагноз и осмотр",
      p1Desc: "Внимательный клинический осмотр позволяет безошибочно спланировать каждый шаг лечения.",
      
      p2Title: "Абсолютно без боли",
      p2Desc: "Инновационная анестезия и бережные методики гарантируют спокойствие и комфорт во время приема.",
      
      p3Title: "5-ступенчатая стерилизация",
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
      techTitle: "Удобство и оснащение клиники",
      techDesc: "Мы используем только качественные стоматологические материалы и проверенное оборудование.",
      t1: "Премиальный диоксид циркония и E-max керамика",
      t2: "Современная безболезненная анестезия",
      t3: "Лазерная стоматология и бережное отбеливание",
      t4: "Автоматизированный личный кабинет пациента",

      specsTag: "НАПРАВЛЕНИЯ",
      specsTitle: "Наши основные услуги",
      specsDesc: "От бережного лечения кариеса до надежной имплантации и дизайна улыбки.",
      viewAll: "Посмотреть все",

      bannerTag: "ЗАПИСЬ НА ПРИЕМ",
      bannerTitle: "Сделайте шаг к здоровой улыбке уже сегодня",
      bannerDesc: "Врачи Magic Denta готовы помочь вам в любое удобное время. Запишитесь на прием прямо сейчас.",
      bannerBtn1: "Связаться с нами",
      bannerBtn2: "Наши врачи",
    },
    en: {
      seoTitle: "About Us | Magic Denta",
      seoDesc: "Magic Denta is a modern dental clinic specializing in Dental Orthopedics offering gentle pain-free care and trusted clinical treatments.",
      badge: "MAGIC DENTA CLINICAL CENTER",
      heroTitle: "Your Smile Is Our Greatest Masterpiece",
      heroDesc: "We build modern dentistry as a seamless harmony of quality materials, painless clinical precision, and genuine human warmth.",
      btnBook: "Book Appointment",
      btnDoctors: "Meet Our Dentists",
      
      stat1Val: "15+",
      stat1Lbl: "Years Clinical Experience",
      stat2Val: "10,000+",
      stat2Lbl: "Delighted & Healthy Patients",
      stat3Val: "100%",
      stat3Lbl: "Pain-Free Gentle Care",
      stat4Val: "24/7",
      stat4Lbl: "Online Booking & Support",

      clinicAddress: "Magic Denta Klinikasi",

      pillarsTag: "OUR PHILOSOPHY",
      pillarsTitle: "Behind Every Smile Lies Trust and Excellence",
      pillarsDesc: "At Magic Denta, we treat every patient like family, adhering strictly to high medical standards.",
      
      p1Title: "Accurate Diagnosis & Exam",
      p1Desc: "Comprehensive clinical evaluation ensures precise treatment planning for every patient.",
      
      p2Title: "100% Pain-Free Care",
      p2Desc: "Advanced anesthesia and gentle techniques ensure a completely relaxed, fear-free appointment.",
      
      p3Title: "5-Stage Sterility",
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
      techTitle: "Modern Clinic Equipment",
      techDesc: "We utilize proven dental materials and modern clinical instruments.",
      t1: "Premium Zirconia & E-max All-Ceramic Restorations",
      t2: "Advanced Pain-Free Anesthesia Systems",
      t3: "Laser Dentistry & Gentle Power Whitening",
      t4: "Automated Patient Portal & Telegram Notifications",

      specsTag: "SPECIALTIES",
      specsTitle: "Core Clinical Specialties",
      specsDesc: "From therapeutic restorations to dental implants and complete cosmetic smile transformations.",
      viewAll: "View All",

      bannerTag: "APPOINTMENT",
      bannerTitle: "Take the first step toward a radiant smile today",
      bannerDesc: "Magic Denta specialists are ready to welcome you. Book your visit or contact us directly.",
      bannerBtn1: "Contact Us",
      bannerBtn2: "View Dentists",
    },
  }[lang] || {
    seoTitle: "Biz haqimizda | Magic Denta",
    seoDesc: "Magic Denta — Zamonaviy stomatologiya klinikasi.",
    badge: "MAGIC DENTA STOMATOLOGIYA KLINIKASI",
    heroTitle: "Tabassumingiz — bizning eng oliy san’atimiz",
    heroDesc: "Biz stomatologiyani sifatli ashyolar, mutlaq og‘riqsizlik va samimiy g‘amxo‘rlik uyg‘unligi sifatida quramiz.",
    btnBook: "Qabulga yozilish",
    btnDoctors: "Shifokorlarimiz bilan tanishish",
    stat1Val: "15+",
    stat1Lbl: "Yillik tajriba",
    stat2Val: "10,000+",
    stat2Lbl: "Mamnun bemorlar",
    stat3Val: "100%",
    stat3Lbl: "Og‘riqsiz muolaja",
    stat4Val: "24/7",
    stat4Lbl: "Onlayn yordam",
    clinicAddress: "Magic Denta Klinikasi",
    pillarsTag: "BIZNING FALSAFAMIZ",
    pillarsTitle: "Har bir tabassum ortida ishonch va sifat yotadi",
    pillarsDesc: "Magic Denta har bir bemorga o‘z oila a’zosidek e’tibor qaratadi.",
    p1Title: "Aniq va To‘g‘ri Tashxis",
    p1Desc: "Har bir muolaja chuqur ko‘rik asosida xatosiz rejalashtiriladi.",
    p2Title: "Mutlaqo Og‘riqsiz Muolaja",
    p2Desc: "Innovatsion anestetik vositalar bilan muolajalar qulay o‘tadi.",
    p3Title: "5 Bosqichli Sterillik",
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
    techTag: "ZAMONAVIY USKUNALAR",
    techTitle: "Klinikamizning qulayliklari va jihozlari",
    techDesc: "Biz faqat sifatli stomatologik materiallardan foydalanamiz.",
    t1: "Sifatli Zirkon va E-max Keramika",
    t2: "Zamonaviy Anesteziya va Og‘riqsiz Tizim",
    t3: "Lazerli tish davolash",
    t4: "Avtomatlashtirilgan bemor kabineti",
    specsTag: "MUTAXASSISLIKLAR",
    specsTitle: "Klinikamizning asosiy xizmatlari",
    specsDesc: "Barcha asosiy davolash yo‘nalishlarimiz.",
    viewAll: "Barchasini ko‘rish",
    bannerTag: "QABULGA YOZILISH",
    bannerTitle: "Bugunoq yangi, nurli tabassum sari qadam tashlang",
    bannerDesc: "Magic Denta shifokorlari sizni qabul qilishga tayyor.",
    bannerBtn1: "Bog‘lanish",
    bannerBtn2: "Shifokorlarni ko‘rish",
  };

  const pillars = [
    {
      title: t.p1Title,
      desc: t.p1Desc,
      icon: (
        <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: t.p2Title,
      desc: t.p2Desc,
      icon: (
        <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: t.p3Title,
      desc: t.p3Desc,
      icon: (
        <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: t.p4Title,
      desc: t.p4Desc,
      icon: (
        <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

    const speed = 0.5;
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

  const handleNavigate = (speciality) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/dentists/${encodeURIComponent(speciality)}`);
  };

  return (
    <>
      <Seo
        title={t.seoTitle}
        description={t.seoDesc}
        canonicalPath="/about"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": ["Dentist", "MedicalBusiness", "LocalBusiness"],
          name: "Magic Denta \"МЧЖ\"",
          url: "https://magicdenta.uz/about",
          logo: "https://magicdenta.uz/logo.png",
          image: "https://magicdenta.uz/logo.png",
          telephone: ["+998912891514", "+998905429303"],
          email: "magicdenta.uz@gmail.com",
          priceRange: "10000 UZS - 1400000 UZS",
          openingHours: "Mo-Su 00:00-23:59",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Magic Denta Klinikasi",
            addressLocality: "Toshkent",
            addressRegion: "Toshkent",
            postalCode: "170126",
            addressCountry: "UZ"
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 40.752584,
            longitude: 72.370230
          },
          hasMap: "https://yandex.uz/maps/-/CTgrvSoY",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "43",
            bestRating: "5",
            worstRating: "1"
          },
          sameAs: [
            "https://yandex.uz/maps/-/CTgrvSoY",
            "https://www.instagram.com/magic.denta/",
            "https://www.instagram.com/nodirbek8884/",
            "https://t.me/magicdenta",
            "https://api.whatsapp.com/send/?phone=998979908884",
            "https://viber.click/998979908884"
          ]
        }}
      />

      <main className="text-left py-4">
        {/* ═══════════════════════════════════════════
            SECTION 1: HERO HEADER & CLINIC PORTRAIT
        ═══════════════════════════════════════════ */}
        <section className="pt-8 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Creative Narrative */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                  <span className="text-[11px] font-extrabold tracking-wider text-slate-700 uppercase">
                    {t.badge}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.12] tracking-tight text-slate-900">
                  {t.heroTitle}
                </h1>

                <p className="text-base sm:text-lg leading-relaxed text-slate-600 max-w-2xl">
                  {t.heroDesc}
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <button
                    onClick={() => navigate("/dentists")}
                    className="px-8 py-3.5 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-full transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    <span>{t.btnDoctors}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                  <a
                    href="#contact-section"
                    className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-full transition-all border border-slate-200 active:scale-95"
                  >
                    {t.btnBook}
                  </a>
                </div>

                {/* 4 Quick Stat Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-2xl font-black text-slate-900">{t.stat1Val}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5 leading-tight">{t.stat1Lbl}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-2xl font-black text-slate-900">{t.stat2Val}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5 leading-tight">{t.stat2Lbl}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-2xl font-black text-slate-900">{t.stat3Val}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5 leading-tight">{t.stat3Lbl}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-2xl font-black text-slate-900">{t.stat4Val}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5 leading-tight">{t.stat4Lbl}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Framed Authentic Building Photo */}
              <div className="lg:col-span-5">
                <div className="rounded-[36px] bg-white p-3.5 border border-slate-100 shadow-2xl relative group">
                  <div className="relative h-[360px] sm:h-[430px] w-full rounded-[28px] overflow-hidden bg-slate-100 shadow-inner">
                    <img
                      src={assets.about_img}
                      alt="Magic Denta binosi"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Bottom floating badge */}
                    <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 text-white flex items-center gap-3.5 border border-white/10 shadow-xl">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="truncate">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Magic Denta</p>
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
        <section className="py-16 bg-slate-50/70 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
                {t.pillarsTag}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {t.pillarsTitle}
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-500">
                {t.pillarsDesc}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-[30px] bg-white p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 shadow-sm">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900 mb-2.5">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-500">
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
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-[36px] bg-white border border-slate-100 p-8 sm:p-12 shadow-sm">
              <div className="text-left max-w-2xl mb-12">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
                  {t.journeyTag}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {t.journeyTitle}
                </h2>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-500">
                  {t.journeyDesc}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-[26px] bg-slate-50/70 border border-slate-100 hover:bg-slate-100/80 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-2xl font-black text-slate-300 block mb-4">
                        {step.num}
                      </span>
                      <h3 className="text-base font-black text-slate-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-500">
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
            SECTION 4: 3D SPECIALTIES CAROUSEL
        ═══════════════════════════════════════════ */}
        <section className="py-16 bg-slate-50/70 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div className="max-w-2xl text-left">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
                  {t.specsTag}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                  {t.specsTitle}
                </h2>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-500">
                  {t.specsDesc}
                </p>
              </div>

              <Link
                to="/dentists"
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-800 font-bold rounded-full hover:bg-slate-50 transition text-sm shadow-sm self-start sm:self-auto"
              >
                {t.viewAll}
              </Link>
            </div>

            <div className="overflow-hidden relative mt-6">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-slate-50 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-slate-50 to-transparent" />

              <ul
                ref={carouselRef}
                className="flex gap-5 overflow-x-auto px-1 py-3 cursor-grab active:cursor-grabbing scrollbar-none"
                style={{
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
              >
                {carouselItems.map((item, index) => {
                  const displayTitle = item.displayName?.[lang] || item.speciality;
                  return (
                    <li
                      key={`${item.speciality}-${index}`}
                      className="w-[15rem] shrink-0"
                    >
                      <button
                        type="button"
                        onClick={() => handleNavigate(item.speciality)}
                        className="group flex min-h-[220px] w-full flex-col items-center justify-between rounded-[28px] border border-slate-100 bg-white p-5 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                      >
                        <div className="w-20 h-20 rounded-[22px] bg-[#0D1117] flex items-center justify-center shadow-md overflow-hidden group-hover:scale-105 transition-transform duration-300">
                          <img
                            src={item.image}
                            alt={displayTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <h3 className="mt-4 text-sm font-bold leading-tight text-slate-800 group-hover:text-black transition-colors">
                          {displayTitle}
                        </h3>

                        <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-900 mt-2 flex items-center gap-1 transition-colors">
                          <span>{t.viewAll}</span>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-[36px] bg-slate-900 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="grid gap-10 lg:grid-cols-12 items-center">
                <div className="lg:col-span-6 space-y-4 text-left">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                    {t.techTag}
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                    {t.techTitle}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {t.techDesc}
                  </p>
                </div>

                <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[t.t1, t.t2, t.t3, t.t4].map((tech, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-white/10 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-200 text-left leading-snug">
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
        ══════════════════════════════════════════ */}
        <section id="contact-section" className="pb-16 pt-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[36px] bg-gradient-to-r from-[#0f1011] via-[#141517] to-[#1a1b1e] px-8 py-10 text-white shadow-xl sm:px-12 sm:py-14 border border-white/10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl text-left">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-200/90">
                    {t.bannerTag}
                  </span>
                  <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl leading-tight text-white">
                    {t.bannerTitle}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                    {t.bannerDesc}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100 shadow-md active:scale-95"
                  >
                    {t.bannerBtn1}
                  </Link>
                  <Link
                    to="/dentists"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
                  >
                    {t.bannerBtn2}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default About;
