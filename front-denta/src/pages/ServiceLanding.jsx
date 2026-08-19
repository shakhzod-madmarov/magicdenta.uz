import { useParams, useNavigate, Link } from "react-router-dom";
import Seo from "../components/Seo";
import { assets } from "../assets/assets";

const SERVICES_DATA = {
  "breket-davolash": {
    slug: "breket-davolash",
    title: "Breket Qo'yish va Tishlarni Tekislash | Magic Denta",
    metaTitle: "Zamonaviy Breket Qo'yish Narxlari & Ortodontiya | Magic Denta",
    metaDesc: "Eng zamonaviy metall va keramik breketlar hamda shaffof elaynerlar. Oliy toifali ortodont shifokorlar, qulay to'lovlar va 100% kafolatli natija.",
    keywords: "breket, breket narxi, tish tekislash, ortodont, keramik breket, elayner, брекеты, ортодонт",
    badge: "ORTODONTIYA & TISHLARNI TEKISLASH",
    heading: "Zamonaviy Mukammal va To'g'ri Tabassum: Zamonaviy Breket Tizimlari",
    description: "Magic Denta klinikasida tish qatoridagi barcha qiyshiqliklar va tishlash (prikus) nuqsonlari eng so'nggi avlod breket tizimlari orqali mutlaqo og'riqsiz va qisqa muddatda to'g'rilanadi.",
    specialityFilter: "Ortodontiya",
    features: [
      { title: "Metall & Keramik Breketlar", desc: "Mustahkam va estetik ko'rinishdagi xalqaro standartdagi breketlar." },
      { title: "Shaffof Elaynerlar (Kappalar)", desc: "Sezilar-sezilmas, qulay yechiladigan innovatsion ortodontik vositalar." },
      { title: "Individual 3D Davolash Rejasi", desc: "Raqamli skanerlash orqali davolash natijasini oldindan ko'rish imkoniyati." },
      { title: "Moslashuvchan Bo'lib To'lash", desc: "Muolaja to'lovlarini bosqichma-bosqich, qulay shartlarda to'lash imkoniyati." }
    ],
    faqs: [
      { q: "Breket qo'yish narxi qancha?", a: "Breket narxi tanlangan tizim turiga (metall, keramik yoki elayner) va tishlarning holatiga bog'liq. Bepul konsultatsiyada shifokorimiz aniq hisob-kitob qilib beradi." },
      { q: "Breket taqish qancha vaqt davom etadi?", a: "Odatda holatning murakkabligiga qarab 6 oydan 18 oygacha vaqt talab etiladi." },
      { q: "Breket qo'yish og'riqlimi?", a: "O'rnatish jarayoni mutlaqo og'riqsiz o'tadi. Dastlabki bir necha kunlik ko'nikish davrida yengil bosim sezilishi tabiiy." }
    ]
  },
  "tish-implantatsiyasi": {
    slug: "tish-implantatsiyasi",
    title: "Tish Implantatsiyasi va Zirkon Qoplamalar | Magic Denta",
    metaTitle: "Zamonaviy Tish Implant Narxi & Implantatsiya | Magic Denta",
    metaDesc: "Zamonaviy yo'qolgan tishlarni 100% og'riqsiz tiklash. Shveytsariya va Janubiy Koreya implantlari, zirkon qoplamalar va umrlik kafolat.",
    keywords: "tish implant, tish implantatsiya, implant narxi, zirkon tish, tish qo'yish, имплантация зубов, цирконий",
    badge: "IMPLANTOLOGIYA VA PROTEZLASH",
    heading: "Yo'qolgan Tishlarni Butunlay Tiklash: Premium Implantatsiya",
    description: "Magic Denta — xalqaro sertifikatlangan Shveytsariya va Janubiy Koreya implantlari orqali tabiiy tishingizdek mustahkam va ko'rkam tishlarni tiklab beradi.",
    specialityFilter: "Implantologiya",
    features: [
      { title: "99.8% O'rnashish Kafolati", desc: "Yuqori biosmoslashuvchan titan va zirkoniy materiallar." },
      { title: "3D Kompyuter Tomografiyasi", desc: "Implantni mikron aniqlikda o'rnatish uchun raqamli navigatsion rejalashtirish." },
      { title: "Bir Kunlik Implantatsiya", desc: "Ko'plab holatlarda implant o'rnatilgan kuniyoq vaqtinchalik tish qo'yish imkoniyati." },
      { title: "Mutlaqo Og'riqsiz Jarrohlik", desc: "Zamonaviy nozik anesteziya ostida xotirjam va tezkor muolaja." }
    ],
    faqs: [
      { q: "Implant tish qancha vaqt xizmat qiladi?", a: "Sifatli implantlar to'g'ri gigiyenaga amal qilinganda butun umr davomida xizmat qiladi." },
      { q: "Implantatsiya og'riqlimi?", a: "Yo'q, zamonaviy anesteziya yordamida muolaja oddiy plomba qo'yishdan ham osonroq va og'riqsiz o'tadi." },
      { q: "Qanday implant brendlaridan foydalanasiz?", a: "Janubiy Koreya (Osstem, Dentium) va Shveytsariya (Straumann) premium implant tizimlari qo'llaniladi." }
    ]
  },
  "bolalar-stomatologiyasi": {
    slug: "bolalar-stomatologiyasi",
    title: "Bolalar Stomatologiyasi: Qo'rquvsiz va Og'riqsiz | Magic Denta",
    metaTitle: "Zamonaviy Bolalar Tish Shifokori & Klinika | Magic Denta",
    metaDesc: "Zamonaviy bolajonlar tishini mutlaqo qo'rquvsiz, samimiy va og'riqsiz davolash. Sut tishlari kariesi, profilaktika va bolalar ortodontiyasi.",
    keywords: "bolalar stomatologi, bolalar tish shifokori, bolalar tish klinikasi, sut tishi davolash, детская стоматология",
    badge: "BOLALAR STOMATOLOGIYASI",
    heading: "Bolajonlar Uchun Do'stona, Qo'rquvsiz va Og'riqsiz Tish Davolash",
    description: "Magic Denta bolalar shifokorlari maxsus psixologik yondashuv va yumshoq uslublar orqali bolalarda tish davolashga nisbatan qo'rquvni yo'qotadi.",
    specialityFilter: "Pediatrik stomatologiya",
    features: [
      { title: "Do'stona & O'yinli Muhit", desc: "Bolajonlar o'zini qulay va xotirjam his qilishi uchun moslashgan klinika." },
      { title: "Sut Tishlarini Asrab Qolish", desc: "Doimiy tishlarning to'g'ri chiqishi uchun sut tishlarini erta yo'qotmaslik." },
      { title: "Og'riqsiz Gel Anesteziyasi", desc: "Ukoldan oldin yoqimli ta'mli maxsus gel bilan milkni butunlay uxlatish." },
      { title: "Tish Karies Profilaktikasi", desc: "Ftorlash va fissuralarni germetizatsiya qilish orqali tishlarni chirishdan asrash." }
    ],
    faqs: [
      { q: "Bolani birinchi marta qachon stomatologga olib borish kerak?", a: "Birinchi sut tishlari chiqqandan so'ng yoki 1 yoshda profilaktik ko'rikdan o'tish tavsiya etiladi." },
      { q: "Sut tishlarini davolash shartmi?", a: "Albatta, sut tishi ostidagi doimiy tish murtagini zararlanishdan asrash va to'g'ri jag' rivojlanishi uchun sut tishlari davolanishi shart." }
    ]
  },
  "estetik-stomatologiya": {
    slug: "estetik-stomatologiya",
    title: "Estetik Stomatologiya, Vinirlar va Oqartirish | Magic Denta",
    metaTitle: "Zamonaviy Vinirlar & Tish Oqartirish | Magic Denta",
    metaDesc: "Gollivud tabassumi Magic Denta'da. Ultra-yupqa keramik vinirlar, professional tish oqartirish va estetik restavratsiya.",
    keywords: "vinir, tish oqartirish, estetik stomatologiya, gollivud tabassumi, vinirlar narxi, виниры, отбеливание зубов",
    badge: "ESTETIK STOMATOLOGIYA & GOLLIVUD TABASSUMI",
    heading: "Gollivud Tabassumi: Keramik Vinirlar va Professional Tish Oqartirish",
    description: "Tishlaringiz rangi, shakli yoki oraliq masofasini ideal holatga keltirib, o'zingizga bo'lgan ishonchni yangi bosqichga olib chiqing.",
    specialityFilter: "Estetik stomatologiya",
    features: [
      { title: "E-max Keramik Vinirlar", desc: "Tish to'qimasini minimal yo'nish orqali tabiiy va yaltiroq ko'rinish berish." },
      { title: "Laser Professional Oqartirish", desc: "Bir seansda tishlarni 4-8 tongacha emalga zarar yetkazmasdan oqartirish." },
      { title: "Badiiy Tish Restavratsiyasi", desc: "Tish sinishi, darzlari yoki rang o'zgarishlarini nanokompozitlar bilan tiklash." },
      { title: "Digital Smile Design (DSD)", desc: "Yuz tuzilishingizga mos tabassumni avvaldan kompyuterda loyihalash." }
    ],
    faqs: [
      { q: "Vinirlar necha yil xizmat qiladi?", a: "Sifatli E-max keramik vinirlar 15-20 yil va undan ko'proq benuqson xizmat qiladi." },
      { q: "Tish oqartirish emalga zarar bermaydimi?", a: "Klinikamizda qo'llaniladigan professional oqartirish texnologiyasi emalga zarar bermasdan faqat pigmentlarni tozalaydi." }
    ]
  }
};

const ServiceLanding = () => {
  const { serviceSlug } = useParams();
  const navigate = useNavigate();

  const service = SERVICES_DATA[serviceSlug] || SERVICES_DATA["breket-davolash"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "name": service.title,
    "description": service.metaDesc,
    "procedureType": "NonSurgicalProcedure",
    "provider": {
      "@type": ["Dentist", "MedicalBusiness", "LocalBusiness"],
      "name": "Magic Denta",
      "url": "https://magicdenta.uz/",
      "telephone": "+998979908884",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Magic Denta Klinikasi",
        "addressLocality": "Toshkent",
        "addressRegion": "Toshkent",
        "postalCode": "170126",
        "addressCountry": "UZ"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 40.752584,
        "longitude": 72.370230
      }
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": service.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <>
      <Seo
        title={service.metaTitle}
        description={service.metaDesc}
        canonicalPath={`/services/${service.slug}`}
        jsonLd={[jsonLd, faqJsonLd]}
      />

      <article className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6 text-left">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <li>
              <Link to="/" className="hover:text-slate-900 transition">Bosh sahifa</Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/dentists" className="hover:text-slate-900 transition">Xizmatlar</Link>
            </li>
            <li>/</li>
            <li className="text-slate-900 font-bold truncate max-w-xs">{service.badge}</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <header className="bg-slate-900 text-white rounded-[32px] p-8 sm:p-12 relative overflow-hidden shadow-xl mb-12">
          <div className="relative z-10 max-w-3xl space-y-6">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/10 text-amber-300 text-[11px] font-extrabold tracking-wider uppercase border border-white/10">
              {service.badge}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
              {service.heading}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              {service.description}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/dentists/${encodeURIComponent(service.specialityFilter)}`)}
                className="px-8 py-3.5 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition shadow-md active:scale-95 text-sm sm:text-base"
              >
                Shifokor tanlash & Qabulga yozilish
              </button>
              <a
                href="tel:+998979908884"
                className="px-8 py-3.5 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition active:scale-95 text-sm sm:text-base"
              >
                Qo'ng'iroq qilish: +998 (97) 990-88-84
              </a>
            </div>
          </div>
        </header>

        {/* Features & Advantages Grid */}
        <section className="mb-14">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8">
            Nega Magic Denta da davolanish afzal?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {service.features.map((feat, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-900 mb-4">
                  0{idx + 1}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Accordion Section */}
        <section className="mb-14 bg-slate-50 border border-slate-200 rounded-[32px] p-6 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">
            Tez-tez beriladigan savollar (FAQ)
          </h2>
          <div className="space-y-4">
            {service.faqs.map((faq, idx) => (
              <details key={idx} className="group bg-white rounded-2xl p-5 border border-slate-200 cursor-pointer shadow-sm">
                <summary className="font-bold text-slate-900 flex items-center justify-between list-none select-none">
                  <span>{faq.q}</span>
                  <span className="transform group-open:rotate-180 transition-transform duration-200 text-slate-400">
                    ▼
                  </span>
                </summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Location & Booking CTA Banner */}
        <section className="bg-white border border-[#EAE4D5] rounded-[32px] p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
              MAGIC DENTA · 24/7 XIZMAT
            </span>
            <h3 className="text-2xl font-black text-slate-900">
              Sog'lom va go'zal tabassumingizni mutaxassislarga ishonib topshiring
            </h3>
            <p className="text-sm text-slate-600">
              Manzil: Magic Denta Klinikasi (Mo'ljal: Semashka, Toshkent-strit)
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/dentists/${encodeURIComponent(service.specialityFilter)}`)}
            className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition shadow-md active:scale-95 whitespace-nowrap"
          >
            Onlayn qabulga yozilish
          </button>
        </section>
      </article>
    </>
  );
};

export default ServiceLanding;
