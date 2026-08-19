import { Link, useNavigate } from "react-router-dom";
import Seo from "../components/Seo";
import { specialityData } from "../assets/assets";

const servicesDetails = [
  {
    slug: "ortodontiya",
    speciality: "Ortodontiya",
    badge: "ORTODONTIYA",
    title: {
      uz: "Ortodontiya & Breketlar",
      ru: "Ортодонтия и Брекеты",
      en: "Orthodontics & Aligners"
    },
    desc: {
      uz: "Tishlar qatorini eng so‘nggi avlod metall, keramik breketlar hamda ko‘rinmas shaffof elaynerlar (kappalar) orqali tekislash. 100% individual 3D rejalashtirish.",
      ru: "Исправление прикуса металлическими, керамическими брекетами и прозрачными элайнерами.",
      en: "Precision bite and smile alignment with modern bracket systems and invisible aligners."
    },
    highlights: ["Metall & Keramik Breketlar", "Shaffof Elaynerlar (Kappalar)", "Individual Reja", "Bosqichma-bosqich to‘lov"],
    duration: "6 - 14 oy",
    doctorType: "Ortodont Mutaxassis",
  },
  {
    slug: "terapevtik-stomatologiya",
    speciality: "Terapevtik stomatologiya",
    badge: "TERAPEVTIK DAVOLASH",
    title: {
      uz: "Terapevtik Stomatologiya",
      ru: "Терапевтическая стоматология",
      en: "Therapeutic Dentistry"
    },
    desc: {
      uz: "Chuqur karies, pulpit va ildiz kanallarini Carl Zeiss mikroskopi ostida og‘riqsiz davolash. Og‘iz bo‘shlig‘i va to‘qimalarning holatiga qarab bosqichma-bosqich amalga oshiriladi.",
      ru: "Лечение кариеса и каналов под микроскопом Carl Zeiss без боли с учетом состояния полости рта.",
      en: "Microscopic painless root canal therapy, gentle caries treatment, and tooth restoration."
    },
    highlights: ["25x Mikroskopik Aniqlik", "Og‘iz Bo‘shlig‘iga Mos Reja", "Badiiy Nanokompozit", "Kafolatli Tish Saqlash"],
    duration: "5 kundan 2-3 haftagacha (holatga qarab)",
    doctorType: "Terapevt Stomatolog",
  },
  {
    slug: "ortopedik-stomatologiya",
    speciality: "Ortopedik stomatologiya",
    badge: "DENTAL ORTHOPEDICS",
    title: {
      uz: "Ortopedik Stomatologiya & Sirkoniy Qoplamalar",
      ru: "Ортопедия и Циркониевые Коронки",
      en: "Dental Orthopedics & Crowns"
    },
    desc: {
      uz: "Qoplama (koronka) qo‘yish va protezlash. Milk va og‘iz bo‘shlig‘i holati, shuningdek umumiy salomatlik ko‘rsatkichlari (qandli diabet, gepatit, virusli kasalliklar, qon bosimi) to‘liq inobatga olingan holda individual reja asosida bajariladi.",
      ru: "Установка коронок и протезирование. Сроки от 1-2 недель до нескольких месяцев с учетом состояния десен и общего здоровья (сахарный диабет, гепатит, давление).",
      en: "Crown placement & prosthetics customized to gum health, diabetes, hepatitis, and blood pressure conditions."
    },
    highlights: ["Nemis Sirkoniysi", "Umumiy Salomatlik Tahlili", "Milk & To‘qima Nazorati", "Uzoq Muddatli Kafolat"],
    duration: "Kamida 1-2 haftadan bir necha oygacha",
    doctorType: "Ortoped Mutaxassis",
  },
  {
    slug: "estetik-stomatologiya",
    speciality: "Estetik stomatologiya",
    badge: "ESTETIKA & SMILE DESIGN",
    title: {
      uz: "Estetik Stomatologiya & Vinirlar",
      ru: "Эстетическая стоматология",
      en: "Aesthetic Smile Design"
    },
    desc: {
      uz: "Digital Smile Design orqali yuzingizga mos Gollivud tabassumini yaratish. Ultra-yupqa E-max vinirlar va emalga zararsiz lazerli tish oqartirish.",
      ru: "Голливудская улыбка: тончайшие виниры E-max, дизайн улыбки DSD и безопасное отбеливание.",
      en: "Hollywood Smile transformations, ultra-thin E-max veneers, and laser whitening."
    },
    highlights: ["E-max Yupqa Vinirlar", "DSD Tabassum Dizayni", "Lazerli Oqartirish", "Emal Remineralizatsiyasi"],
    duration: "2 - 3 seans",
    doctorType: "Estet-Stomatolog",
  },
  {
    slug: "jarrohlik-stomatologiyasi",
    speciality: "Stomatologiya Jarrohligi",
    badge: "STOMATOLOGIYA JARROHLIGI",
    title: {
      uz: "Jarrohlik Stomatologiyasi",
      ru: "Хирургическая стоматология",
      en: "Surgical Dentistry"
    },
    desc: {
      uz: "Aql tishlarini (8-tish) va murakkab ildizlarni nozik, atravmatik va og‘riqsiz olish. Muolaja tishning joylashuvi, turi va holatiga qarab amalga oshiriladi.",
      ru: "Атравматичное удаление зубов мудрости без боли. Длительность от 10 минут до 30+ минут в зависимости от сложности и типа зуба.",
      en: "Atraumatic wisdom tooth extractions taking from 10 mins to 30+ mins based on tooth complexity."
    },
    highlights: ["Atravmatik Jarrohlik", "100% Og‘riqsiz Anesteziya", "Tezkor Shishsiz Bitish", "100% Melag Sterillik"],
    duration: "10 daqiqadan 30+ daqiqagacha (tish turiga qarab)",
    doctorType: "Jarroh Stomatolog",
  }
];

const Services = () => {
  const navigate = useNavigate();
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      tag: "KLINIK XIZMATLARIMIZ",
      heading: "Magic Denta 5 ta Asosiy Ixtisoslashgan Yo‘nalishi",
      desc: "Klinikamiz tor doiradagi 5 ta mutaxassislikka ixtisoslashgan bo‘lib, har bir yo‘nalishda bemorning umumiy salomatligi va og‘iz bo‘shlig‘i holati to‘liq inobatga olinadi.",
      learnMore: "Xizmat haqida batafsil →",
      bookDoc: "Qabulga yozilish",
    },
    ru: {
      tag: "НАШИ УСЛУГИ",
      heading: "5 ключевых направлений клиники Magic Denta",
      desc: "Наша клиника сфокусирована на 5 специализированных направлениях высшей квалификации с учетом всех факторов здоровья.",
      learnMore: "Подробнее об услуге →",
      bookDoc: "Записаться на прием",
    },
    en: {
      tag: "OUR CLINICAL SERVICES",
      heading: "Magic Denta's 5 Core Specialized Disciplines",
      desc: "Our clinic is deeply dedicated to 5 elite clinical specialties tailored to individual oral health and medical factors.",
      learnMore: "Detailed Service Info →",
      bookDoc: "Book Consultation",
    }
  }[lang] || {
    tag: "KLINIK XIZMATLARIMIZ",
    heading: "Magic Denta 5 ta Asosiy Ixtisoslashgan Yo‘nalishi",
    desc: "Klinikamiz tor doiradagi 5 ta mutaxassislikka ixtisoslashgan bo‘lib, har bir yo‘nalishda bemorning umumiy salomatligi va og‘iz bo‘shlig‘i holati to‘liq inobatga olinadi.",
    learnMore: "Xizmat haqida batafsil →",
    bookDoc: "Qabulga yozilish",
  };

  return (
    <div className="bg-[#F8F9FD] min-h-screen text-[#0F3040] py-8">
      <Seo
        title="Xizmatlar va Davolash Yo‘nalishlari | Magic Denta"
        description="Magic Denta klinikasi 5 ta asosiy mutaxassislik: Ortodontiya, Terapevtik davolash, Ortopediya & Sirkoniy, Estetik stomatologiya va Jarrohlik."
        canonicalPath="/services"
      />

      {/* Header Banner */}
      <section className="relative bg-gradient-to-br from-[#0F3040] via-[#1E1730] to-[#321E48] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 rounded-[36px] overflow-hidden my-6 border border-[#403D88]/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#92003A]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#403D88]/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] text-slate-200 border border-white/15 text-xs font-black tracking-widest uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#91008D] animate-pulse" />
            {t.tag}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            {t.heading}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            {t.desc}
          </p>
        </div>
      </section>

      {/* 5 Services Deep Showcase Grid */}
      <section className="my-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {servicesDetails.map((s, index) => {
          const specData = specialityData.find(item => item.slug === s.slug) || specialityData[index];
          const isEven = index % 2 === 1;

          return (
            <div
              key={s.slug}
              className={`bg-white rounded-[36px] border border-slate-200/90 shadow-card-clean hover:shadow-card-hover p-6 sm:p-10 transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                isEven ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Left Column: Icon & Badges */}
              <div className="lg:col-span-4 flex flex-col items-center text-center p-6 rounded-[28px] bg-slate-50 border border-slate-200/80">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] bg-gradient-to-br from-[#0F3040] to-[#321E48] p-1 flex items-center justify-center shadow-lg border border-[#403D88]/30 mb-4">
                  <img
                    src={specData?.image}
                    alt=""
                    className="w-full h-full object-cover rounded-[24px]"
                  />
                </div>
                <span className="text-[11px] font-black px-3.5 py-1.5 rounded-full bg-[#403D88]/10 text-[#403D88] uppercase tracking-wider mb-2">
                  {s.badge}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  ⏱ Muddat: <strong className="text-[#0F3040]">{s.duration}</strong>
                </span>
              </div>

              {/* Right Column: Title, Description, Highlights & CTAs */}
              <div className="lg:col-span-8 text-left space-y-4">
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F3040] leading-tight">
                  {s.title[lang] || s.title.uz}
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                  {s.desc[lang] || s.desc.uz}
                </p>

                {/* Highlights chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {s.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200/70 text-[11px] font-bold text-[#0F3040] flex items-center gap-1.5"
                    >
                      <span className="text-emerald-500 font-black text-xs">✓</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                  <Link
                    to={`/services/${s.slug}`}
                    className="px-6 py-3.5 rounded-2xl bg-[#0F3040] hover:bg-[#321E48] text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    {t.learnMore}
                  </Link>
                  <Link
                    to="/appointment"
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    {t.bookDoc}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default Services;
