import { useParams, useNavigate, Link } from "react-router-dom";
import Seo from "../components/Seo";
import { assets } from "../assets/assets";

const SERVICES_DATA = {
  "ortodontiya": {
    slug: "ortodontiya",
    title: "Ortodontiya: Breketlar va Shaffof Elaynerlar | Magic Denta",
    metaTitle: "Ortodontiya: Zamonaviy Breketlar & Elaynerlar | Magic Denta",
    metaDesc: "Tishlar qatorini metall va keramik breketlar hamda ko'rinmas elaynerlar orqali tekislash. 100% individual rejalashtirish.",
    keywords: "ortodontiya, breket, elayner, tish tekislash, ortodont andijon, ортодонтия, брекеты",
    badge: "ORTODONTIYA & TISHLARNI TEKISLASH",
    heading: "Mukammal va Tekis Tabassum: Eng So‘nggi Avlod Ortodontiyasi",
    description: "Magic Denta klinikasida tish qatoridagi barcha qiyshiqliklar, tishlash (prikus) nuqsonlari va jag' assimetriyalari individual ortodontik vositalar orqali tekislanadi.",
    duration: "6 oydan 14 oygacha",
    features: [
      { title: "Metall & Keramik Breketlar", desc: "Mustahkam, estetik va ishonchli xalqaro standartdagi breket tizimlari." },
      { title: "Ko'rinmas Shaffof Elaynerlar (Kappalar)", desc: "Sezilar-sezilmas, ovqatlanishda qulay yechiladigan innovatsion ortodontik vositalar." },
      { title: "Individual Davolash Rejasi", desc: "Raqamli tahlil orqali davolash bosqichlarini oldindan rejalashtirish." },
      { title: "Moslashuvchan Bo'lib To'lash", desc: "Muolaja to'lovlarini bosqichma-bosqich, qulay shartlarda to'lash imkoniyati." }
    ],
    faqs: [
      { q: "Breket qo'yish narxi qanday belgilanadi?", a: "Breket narxi tanlangan tizim turiga (metall, keramik yoki elayner) va tishlarning holatiga bog'liq. Konsultatsiyada shifokorimiz aniq hisob-kitob qilib beradi." },
      { q: "Breket taqish qancha vaqt davom etadi?", a: "Odatda holatning murakkabligiga qarab 6 oydan 14 oygacha vaqt talab etiladi." },
      { q: "Breket qo'yish og'riqlimi?", a: "O'rnatish jarayoni mutlaqo og'riqsiz o'tadi. Dastlabki bir necha kunlik ko'nikish davrida yengil bosim sezilishi tabiiy." }
    ]
  },
  "terapevtik-stomatologiya": {
    slug: "terapevtik-stomatologiya",
    title: "Terapevtik Stomatologiya va Mikroskopik Davolash | Magic Denta",
    metaTitle: "Terapevtik Stomatologiya: Karies & Ildiz Davolash | Magic Denta",
    metaDesc: "Karies va asoratlarni Carl Zeiss mikroskopi ostida og'riqsiz davolash, tishlarni saqlab qolish va estetik plombalash.",
    keywords: "terapevtik stomatologiya, karies davolash, tish davolash, mikroskop stomatologiya, plomba, терапевтическая стоматология",
    badge: "TERAPEVTIK STOMATOLOGIYA",
    heading: "Mikroskop Ostida Aniq va Mutlaqo Og‘riqsiz Tish Davolash",
    description: "Tish to'qimalarini maksimal darajada asrab qolgan holda chuqur karies, pulpit va periodontitni nemis Carl Zeiss mikroskopi yordamida kafolatli davolaymiz. Muolaja muddati og‘iz bo‘shlig‘ining umumiy holatiga qarab 5 kundan 2-3 haftagacha davom etadi.",
    duration: "5 kundan 2-3 haftagacha (og‘iz bo‘shlig‘i holatiga qarab)",
    features: [
      { title: "25x Mikroskopik Aniqlik", desc: "Eng mayda yoriqlar va yashirin kanallarni xatosiz ko'rish va tozalash." },
      { title: "Kompyuterli Nozik Anesteziya", desc: "Ukol ignasi og'rig'isiz tezkor va to'liq uyushtirish kafolati." },
      { title: "Badiiy Nanokompozit Restavratsiya", desc: "Tishning tabiiy anatomik shakli va yaltiroqligini mukammal tiklash." },
      { title: "Tishni Saqlab Qolish Falsafasi", desc: "Eng murakkab zararlangan tishlarni ham olishga shoshilmasdan davolaymiz." }
    ],
    faqs: [
      { q: "Terapiya davolash muddati qancha davom etadi?", a: "Og‘iz bo‘shlig‘i va ildiz kanallarining holatiga qarab 5 kundan 2-3 haftagacha vaqt olishi mumkin." },
      { q: "Plomba necha yil turadi?", a: "Yuqori sifatli nanokompozit materiallarimiz va to'g'ri gigiyena bilan 7-10 yildan ortiq mustahkam xizmat qiladi." },
      { q: "Ildiz kanallarini davolash og'riqlimi?", a: "Zamonaviy innovatsion anesteziya evaziga muolaja davomida bemor hech qanday og'riq sezmaydi." }
    ]
  },
  "ortopedik-stomatologiya": {
    slug: "ortopedik-stomatologiya",
    title: "Ortopedik Stomatologiya: Sirkoniy Qoplamalar va Protezlash | Magic Denta",
    metaTitle: "Ortopedik Stomatologiya & Sirkoniy Tishlar | Magic Denta",
    metaDesc: "Sirkoniy qoplamalar (koronka), E-max vinirlar va zamonaviy protezlash. Umumiy salomatlik va milk holatini to'liq inobatga olgan holda.",
    keywords: "ortopediya stomatologiya, sirkoniy tish, tish qoplama, koronka, protez, ортопедическая стоматология, коронки",
    badge: "DENTAL ORTHOPEDICS & PROTEZLASH",
    heading: "Sirkoniy Qoplamalar (Koronka) va Anatomik Protezlash",
    description: "Magic Denta — Dental Orthopedics markazi sifatida tishlarni sirkoniy va presslangan keramika orqali to'liq tiklab beradi. Qoplama qo‘yish muddati kamida 1-2 haftadan bir necha oygacha davom etadi. Bunda milk va og‘iz bo‘shlig‘i holati bilan birga, bemorning umumiy salomatlik ko‘rsatkichlari (qandli diabet / saxar, gepatit, virusli kasalliklar, qon bosimi) qat'iy inobatga olinadi.",
    duration: "Kamida 1-2 haftadan bir necha oygacha",
    features: [
      { title: "Umumiy Salomatlik Tahlili", desc: "Qandli diabet (saxar), gepatit, virusli kasalliklar va arterial qon bosimi to‘liq tekshirilib, xavfsiz protokol qo‘llaniladi." },
      { title: "Milk & To‘qima Salomatligi", desc: "Qoplama qo‘yishdan oldin milk va og‘iz bo‘shlig‘i to‘liq sog‘lomlashtiriladi." },
      { title: "Yuqori Mustahkam Nemis Sirkoniysi", desc: "Metallsiz, mutlaqo biologik xavfsiz va yemirilishga chidamli premium material." },
      { title: "CAD/CAM Raqamli Frezerlash", desc: "Mikron darajadagi aniqlik bilan tayyorlanadigan qoplamalar va uzoq muddatli kafolat." }
    ],
    faqs: [
      { q: "Qoplama (koronka) qo'yish qancha vaqt oladi?", a: "Holatning murakkabligiga qarab kamida 1-2 haftadan bir necha oygacha davom etishi mumkin. Milk holati va umumiy salomatlik bunga bevosita ta'sir ko'rsatadi." },
      { q: "Qandli diabet yoki qon bosimi bo'lsa qoplama qo'yish mumkinmi?", a: "Ha, lekin biz har bir bemorning umumiy salomatligini (saxar, gepatit, davleniye) batafsil o'rganib, maxsus xavfsiz klinik reja asosida muolaja o'tkazamiz." },
      { q: "Sirkoniy qoplama metalldan nimasi bilan yaxshi?", a: "Sirkoniy milkni qoraytirmaydi, allergiya chaqirmaydi, tabiiy shaffoflikka ega va metaldan ancha yengil hamda mustahkam." }
    ]
  },
  "estetik-stomatologiya": {
    slug: "estetik-stomatologiya",
    title: "Estetik Stomatologiya: E-max Vinirlar va Oqartirish | Magic Denta",
    metaTitle: "Estetik Stomatologiya & Gollivud Tabassumi | Magic Denta",
    metaDesc: "Gollivud tabassumi Magic Denta'da. Ultra-yupqa keramik vinirlar, professional tish oqartirish va estetik restavratsiya.",
    keywords: "estetik stomatologiya, vinir, vinirlar narxi, tish oqartirish, gollivud tabassumi, виниры, отбеливание",
    badge: "ESTETIK STOMATOLOGIYA & SMILE DESIGN",
    heading: "Gollivud Tabassumi: E-max Vinirlar va Lazerli Oqartirish",
    description: "Tishlaringiz rangi, shakli yoki oraliq masofasini ideal holatga keltirib, o'zingizga bo'lgan ishonchni yangi cho'qqiga olib chiqing.",
    duration: "2 - 3 seans",
    features: [
      { title: "E-max Ultra-Yupqa Vinirlar", desc: "Tish to'qimasini minimal yo'nish orqali tabiiy va yaltiroq ko'rinish berish." },
      { title: "Lazerli Xavfsiz Oqartirish", desc: "Bir seansda tishlarni 4-8 tongacha emalga zarar yetkazmasdan oqartirish." },
      { title: "Digital Smile Design (DSD)", desc: "Yuz tuzilishingizga mos tabassumni avvaldan kompyuterda loyihalash." },
      { title: "Emal Himoyasi & Remineralizatsiya", desc: "Muolajadan so'ng tish emalini maxsus mustahkamlovchi minerallar bilan to'yintirish." }
    ],
    faqs: [
      { q: "Vinirlar necha yil xizmat qiladi?", a: "Sifatli E-max keramik vinirlar 15-20 yil va undan ko'proq benuqson xizmat qiladi." },
      { q: "Tish oqartirish emalga zarar bermaydimi?", a: "Klinikamizda qo'llaniladigan professional oqartirish texnologiyasi emalga zarar bermasdan faqat chuqur pigmentlarni tozalaydi." }
    ]
  },
  "jarrohlik-stomatologiyasi": {
    slug: "jarrohlik-stomatologiyasi",
    title: "Jarrohlik Stomatologiyasi va Aql Tishini Olish | Magic Denta",
    metaTitle: "Jarrohlik Stomatologiyasi: Og'riqsiz Operatsiyalar | Magic Denta",
    metaDesc: "Aql tishlarini (8-tish) nozik va og'riqsiz olish, milk plastikasi va og'iz bo'shlig'i jarrohligi.",
    keywords: "jarrohlik stomatologiya, aql tishi olish, tish oldirish, milk operatsiyasi, хирургическая стоматология",
    badge: "STOMATOLOGIYA JARROHLIGI",
    heading: "Atravmatik, Nozik va Xavfsiz Jarrohlik Muolajalari",
    description: "Magic Denta tajribali jarrohlari eng murakkab aql tishlarini va ildizlarni hech qanday asoratsiz va shishlarsiz olib tashlaydi. Jarayon tishning holati va turiga qarab 10 daqiqadan 30+ daqiqagacha davom etadi.",
    duration: "10 daqiqadan 30+ daqiqagacha (tishning holati va turiga qarab)",
    features: [
      { title: "Atravmatik Jarrohlik", desc: "Suyak va milk to'qimasiga shikast yetkazmasdan faqat kerakli qismni ajratish." },
      { title: "Mutlaqo Og'riqsiz Anesteziya", desc: "Kuchli zamonaviy anesteziya ostida xotirjam va tezkor jarayon." },
      { title: "Tezkor Tuzalish Kafolati", desc: "Maxsus tiklanish protokollari evaziga operatsiyadan so'ng shish va noqulaylik bo'lmaydi." },
      { title: "100% Melag Sterillik", desc: "Jarrohlik xonasi Melag avtoklav sterilizatsiyasi bilan to'liq ta'minlangan." }
    ],
    faqs: [
      { q: "Jarrohlik muolajasi qancha vaqt oladi?", a: "Tishning holati, ildizlar tuzilishi va joylashuviga qarab 10 daqiqadan 30+ daqiqagacha davom etishi mumkin." },
      { q: "Aql tishini olish shartmi?", a: "Agar aql tishi noto'g'ri o'sayotgan bo'lsa, yonidagi tishlarni qisayotgan yoki karies chaqirayotgan bo'lsa, uni olish tavsiya etiladi." },
      { q: "Muolajadan keyin qachon ovqatlanish mumkin?", a: "Operatsiyadan 2 soat o'tgach iliq va yumshoq ovqatlar tanovul qilish mumkin." }
    ]
  }
};

const ServiceLanding = () => {
  const { serviceSlug } = useParams();
  const navigate = useNavigate();

  const service = SERVICES_DATA[serviceSlug] || SERVICES_DATA["ortodontiya"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "name": service.title,
    "description": service.metaDesc,
    "provider": {
      "@type": "Dentist",
      "name": "Magic Denta",
      "telephone": ["+998912891514", "+998905429303"],
      "email": "magicdenta.uz@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Bobur shoh koʻchasi, 1B",
        "addressLocality": "Andijon",
        "addressCountry": "UZ"
      }
    }
  };

  return (
    <div className="bg-[#F8F9FD] min-h-screen text-[#0F3040] py-8">
      <Seo
        title={service.title}
        description={service.metaDesc}
        canonicalPath={`/services/${service.slug}`}
        jsonLd={jsonLd}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link to="/" className="hover:text-[#403D88]">Bosh sahifa</Link>
          <span>/</span>
          <Link to="/services" className="hover:text-[#403D88]">Xizmatlar</Link>
          <span>/</span>
          <span className="text-[#92003A]">{service.badge}</span>
        </div>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0F3040] via-[#1A1733] to-[#321E48] text-white rounded-[36px] p-8 sm:p-14 lg:p-16 overflow-hidden border border-[#403D88]/40 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#92003A]/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#403D88]/25 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md text-slate-200 text-xs font-black tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-[#91008D] animate-pulse" />
              {service.badge}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-white">
              {service.heading}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
              {service.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-emerald-300">
                ⏱ Taxminiy muddat: <strong>{service.duration}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/appointment")}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Qabulga yozilish →
              </button>
              <button
                type="button"
                onClick={() => navigate("/services")}
                className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                Barcha xizmatlar
              </button>
            </div>
          </div>
        </section>

        {/* Clinical Features / Highlights Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F3040] text-left">
            Muolajaning muhim jihatlari va klinik standartlar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[28px] p-6 border border-slate-200/90 shadow-card-clean text-left space-y-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-[#403D88]/10 text-[#403D88] flex items-center justify-center font-black text-sm">
                  0{idx + 1}
                </div>
                <h3 className="font-black text-base text-[#0F3040]">
                  {feat.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white rounded-[36px] p-8 sm:p-12 border border-slate-200/90 shadow-card-clean text-left space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F3040]">
            Ko‘p beriladigan savollar
          </h2>
          <div className="space-y-4">
            {service.faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h3 className="font-black text-sm sm:text-base text-[#0F3040]">
                  ❓ {faq.q}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                  💡 {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServiceLanding;
