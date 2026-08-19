import { useParams, useNavigate, Link } from "react-router-dom";
import Seo from "../components/Seo";
import { assets } from "../assets/assets";

const SERVICES_DATA = {
  "ortodontiya": {
    slug: "ortodontiya",
    title: "Ortodontiya: Breketlar va Shaffof Elaynerlar | Magic Denta",
    metaTitle: "Ortodontiya: Zamonaviy Breketlar & Elaynerlar | Magic Denta",
    metaDesc: "Tishlar qatorini metall va keramik breketlar hamda ko'rinmas elaynerlar orqali tekislash. 100% individual 3D rejalashtirish.",
    keywords: "ortodontiya, breket, elayner, tish tekislash, ortodont andijon, ортодонтия, брекеты",
    badge: "ORTODONTIYA & TISHLARNI TEKISLASH",
    heading: "Mukammal va Tekis Tabassum: Eng So‘nggi Avlod Ortodontiyasi",
    description: "Magic Denta klinikasida tish qatoridagi barcha qiyshiqliklar, tishlash (prikus) nuqsonlari va jag' assimetriyalari ilg'or 3D skanerlash va zamonaviy breket tizimlari orqali tekislanadi.",
    specialityFilter: "Ortodontiya",
    features: [
      { title: "Metall & Keramik Breketlar", desc: "Mustahkam, estetik va ishonchli xalqaro standartdagi breket tizimlari." },
      { title: "Ko'rinmas Shaffof Elaynerlar (Kappalar)", desc: "Sezilar-sezilmas, ovqatlanishda qulay yechiladigan innovatsion ortodontik vositalar." },
      { title: "Individual 3D Davolash Rejasi", desc: "Raqamli skanerlash orqali davolash natijasini oldindan kompyuterda ko'rish." },
      { title: "Moslashuvchan Bo'lib To'lash", desc: "Muolaja to'lovlarini bosqichma-bosqich, qulay shartlarda to'lash imkoniyati." }
    ],
    faqs: [
      { q: "Breket qo'yish narxi qanday belgilanadi?", a: "Breket narxi tanlangan tizim turiga (metall, keramik yoki elayner) va tishlarning holatiga bog'liq. Bepul konsultatsiyada shifokorimiz aniq hisob-kitob qilib beradi." },
      { q: "Breket taqish qancha vaqt davom etadi?", a: "Odatda holatning murakkabligiga qarab 6 oydan 18 oygacha vaqt talab etiladi." },
      { q: "Breket qo'yish og'riqlimi?", a: "O'rnatish jarayoni mutlaqo og'riqsiz o'tadi. Dastlabki bir necha kunlik ko'nikish davrida yengil bosim sezilishi tabiiy." }
    ]
  },
  "terapevtik-stomatologiya": {
    slug: "terapevtik-stomatologiya",
    title: "Terapevtik Stomatologiya va Mikroskopik Davolash | Magic Denta",
    metaTitle: "Terapevtik Stomatologiya: Karies & Ildiz Davolash | Magic Denta",
    metaDesc: "Karies va asoratlarni Carl Zeiss mikroskopi ostida mutlaqo og'riqsiz davolash, tishlarni saqlab qolish va estetik plombalash.",
    keywords: "terapevtik stomatologiya, karies davolash, tish davolash, mikroskop stomatologiya, plomba, терапевтическая стоматология",
    badge: "TERAPEVTIK STOMATOLOGIYA",
    heading: "Mikroskop Ostida Aniq va Mutlaqo Og‘riqsiz Tish Davolash",
    description: "Tish to'qimalarini maksimal darajada asrab qolgan holda chuqur karies, pulpit va periodontitni nemis Carl Zeiss mikroskopi yordamida kafolatli davolaymiz.",
    specialityFilter: "Terapevtik stomatologiya",
    features: [
      { title: "25x Mikroskopik Aniqlik", desc: "Eng mayda yoriqlar va yashirin kanallarni xatosiz ko'rish va tozalash." },
      { title: "Kompyuterli Nozik Anesteziya", desc: "Ukol ignasi og'rig'isiz tezkor va to'liq uyushtirish kafolati." },
      { title: "Badiiy Nanokompozit Restavratsiya", desc: "Tishning tabiiy anatomik shakli va yaltiroqligini mukammal tiklash." },
      { title: "Tishni Saqlab Qolish Falsafasi", desc: "Eng murakkab zararlangan tishlarni ham olishga shoshilmasdan davolaymiz." }
    ],
    faqs: [
      { q: "Plomba necha yil turadi?", a: "Yuqori sifatli nanokompozit materiallarimiz va to'g'ri gigiyena bilan 7-10 yildan ortiq mustahkam xizmat qiladi." },
      { q: "Ildiz kanallarini davolash og'riqlimi?", a: "Zamonaviy innovatsion anesteziya evaziga muolaja davomida bemor hech qanday og'riq sezmaydi." }
    ]
  },
  "ortopedik-stomatologiya": {
    slug: "ortopedik-stomatologiya",
    title: "Ortopedik Stomatologiya: Sirkoniy Qoplamalar va Protezlash | Magic Denta",
    metaTitle: "Ortopedik Stomatologiya & Sirkoniy Tishlar | Magic Denta",
    metaDesc: "Sirkoniy qoplamalar, E-max vinirlar va zamonaviy raqamli protezlash. Yuqori mustahkamlik va anatomik mukammallik.",
    keywords: "ortopediya stomatologiya, sirkoniy tish, tish qoplama, koronka, protez, ортопедическая стоматология, коронки",
    badge: "DENTAL ORTHOPEDICS & PROTEZLASH",
    heading: "Sirkoniy Qoplamalar va Yuqori Aniqlikdagi Raqamli Protezlash",
    description: "Magic Denta — Dental Orthopedics markazi sifatida tishlarni sirkoniy, presslangan keramika va anatomik protezlar orqali to'liq tiklab beradi.",
    specialityFilter: "Ortopedik stomatologiya",
    features: [
      { title: "Yuqori Mustahkam Sirkoniy", desc: "Metallsiz, mutlaqo biologik xavfsiz va yemirilishga chidamli material." },
      { title: "CAD/CAM Raqamli Frezerlash", desc: "Mikron darajadagi aniqlik bilan tayyorlanadigan qoplamalar." },
      { title: "Tabiiy Emal Shaffofligi", desc: "Tabiiy tishdan ajratib bo'lmaydigan estetik va anatomik ko'rinish." },
      { title: "Uzoq Muddatli Kafolat", desc: "Har bir o'rnatilgan ortopedik konstruksiyaga rasmiy klinik kafolat." }
    ],
    faqs: [
      { q: "Sirkoniy qoplama metalldan nimasi bilan yaxshi?", a: "Sirkoniy milkni qoraytirmaydi, allergiya chaqirmaydi, tabiiy shaffoflikka ega va metaldan ancha yengil hamda mustahkam." },
      { q: "Tayyorlanish muddati qancha?", a: "Raqamli laboratoriyamiz tufayli odatda 5-7 ish kunida to'liq tayyor bo'ladi." }
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
    specialityFilter: "Estetik stomatologiya",
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
    description: "Magic Denta tajribali jarrohlari piezo-jarrohlik apparati yordamida eng murakkab aql tishlarini ham hech qanday asoratsiz va shishlarsiz olib tashlaydi.",
    specialityFilter: "Stomatologiya Jarrohligi",
    features: [
      { title: "Piezo-Ultrasonic Jarrohlik", desc: "Suyak va milk to'qimasiga shikast yetkazmasdan faqat kerakli qismni ajratish." },
      { title: "Mutlaqo Og'riqsiz Muolaja", desc: "Kuchli zamonaviy anesteziya ostida xotirjam va tezkor jarayon." },
      { title: "Tezkor Tuzalish Kafolati", desc: "Maxsus tiklanish protokollari evaziga operatsiyadan so'ng shish va noqulaylik bo'lmaydi." },
      { title: "100% Steril Sharoit", desc: "Jarrohlik xonasi Melag Class-B avtoklav sterilizatsiyasi bilan to'liq ta'minlangan." }
    ],
    faqs: [
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
        title={service.metaTitle}
        description={service.metaDesc}
        keywords={service.keywords}
        canonicalPath={`/services/${service.slug}`}
        jsonLd={jsonLd}
      />

      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-[#0F3040] via-[#1E1730] to-[#321E48] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 rounded-[36px] overflow-hidden my-6 border border-[#403D88]/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#92003A]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#403D88]/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] text-slate-200 border border-white/15 text-xs font-black tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#91008D] animate-pulse" />
            {service.badge}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            {service.heading}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl font-normal">
            {service.description}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/dentists/${encodeURIComponent(service.specialityFilter)}`)}
              className="px-8 py-4 bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white font-extrabold rounded-full shadow-lg transition-all active:scale-95 text-sm cursor-pointer"
            >
              Ushbu yo‘nalish shifokorlari →
            </button>
            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-full transition-all text-sm cursor-pointer"
            >
              Bepul konsultatsiya
            </button>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="my-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black text-[#403D88] uppercase tracking-widest block mb-2">
            KLINIK AFZALLIKLAR
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F3040]">
            Nega aynan Magic Denta’da davolanish kerak?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {service.features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-[30px] p-6 border border-slate-200/80 shadow-card-clean hover:shadow-card-hover hover:border-[#403D88]/40 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0F3040] to-[#321E48] text-white flex items-center justify-center font-black text-sm mb-4 shadow-xs">
                  0{i + 1}
                </div>
                <h3 className="text-base font-black text-[#0F3040] mb-2 leading-snug">
                  {f.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                  {f.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Magic Denta Standarti</span>
                <span className="text-emerald-500 font-black">✓</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="my-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="text-center mb-10">
          <span className="text-xs font-black text-[#403D88] uppercase tracking-widest block mb-2">
            KO‘P SO‘RALADIGAN SAVOLLAR
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F3040]">
            Savollaringizga javoblar
          </h2>
        </div>

        <div className="space-y-4">
          {service.faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm"
            >
              <h3 className="text-base font-black text-[#0F3040] mb-2 flex items-center gap-2">
                <span className="text-[#92003A] font-black">Q:</span> {faq.q}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-normal">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="my-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0F3040] to-[#321E48] rounded-[36px] p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="text-left space-y-2 max-w-2xl">
            <span className="text-[10px] font-black tracking-widest text-[#91008D] uppercase block">
              MAGIC DENTA · 08:00 - 20:00 (DUSH - SHAN)
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Sog‘lom va go‘zal tabassum sari birinchi qadamni tashlang
            </h3>
            <p className="text-slate-300 text-sm font-normal">
              Shifokorlarimiz qabuliga o‘zingizga mos vaqtda onlayn yoziling yoki telefon orqali konsultatsiya oling.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => navigate(`/dentists/${encodeURIComponent(service.specialityFilter)}`)}
              className="px-8 py-4 bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white font-black text-xs uppercase tracking-wider rounded-full shadow-lg active:scale-95 transition-all text-center cursor-pointer"
            >
              Shifokorga yozilish
            </button>
            <a
              href="tel:+998912891514"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs uppercase tracking-wider rounded-full active:scale-95 transition-all text-center"
            >
              +998 91 289 15 14
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceLanding;
