import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Professional SVG Icons for the 5 Specialties
const OrthoIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7M7 18h2" />
    <circle cx="7" cy="6" r="2" fill="currentColor" />
    <circle cx="17" cy="6" r="2" fill="currentColor" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

const TherapyIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const OrthopedicIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const AestheticIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const SurgeryIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const options = [
  {
    id: "ortho",
    label: "Tishlar egriligi yoki noto‘g‘ri tishlash",
    desc: "Breketlar yoki shaffof elaynerlar orqali tishlar qatorini tekislash",
    Icon: OrthoIcon,
    iconBg: "from-[#403D88] to-[#91008D]",
    speciality: "Ortodontiya",
    slug: "ortodontiya",
    estTime: "6 - 14 oy",
    badge: "ORTODONTIYA",
  },
  {
    id: "caries",
    label: "Tish og‘rig‘i, karies yoki plomba tushishi",
    desc: "Og‘riqsiz karies davolash, tishni saqlab qolish va nanokompozit restavratsiya",
    Icon: TherapyIcon,
    iconBg: "from-[#0F3040] to-[#403D88]",
    speciality: "Terapevtik stomatologiya",
    slug: "terapevtik-stomatologiya",
    estTime: "5 kundan 2-3 haftagacha",
    badge: "TERAPEVTIK DAVOLASH",
  },
  {
    id: "ortho_crown",
    label: "Tish sinishi, yemirilishi yoki qoplama zarurati",
    desc: "Mustahkam nemis sirkoniy qoplamalari va anatomik tish tiklash",
    Icon: OrthopedicIcon,
    iconBg: "from-[#92003A] to-[#91008D]",
    speciality: "Ortopedik stomatologiya",
    slug: "ortopedik-stomatologiya",
    estTime: "Kamida 1-2 haftadan bir necha oygacha",
    badge: "DENTAL ORTHOPEDICS",
  },
  {
    id: "aesthetic",
    label: "Gollivud tabassumi va estetik vinirlar",
    desc: "Estetik vinirlar o‘rnatish, tabassum dizayni va emalni mustahkamlash",
    Icon: AestheticIcon,
    iconBg: "from-[#91008D] to-[#403D88]",
    speciality: "Estetik stomatologiya",
    slug: "estetik-stomatologiya",
    estTime: "2 - 3 seans",
    badge: "ESTETIK STOMATOLOGIYA",
  },
  {
    id: "surgery",
    label: "Aql tishi (8-tish) og‘rig‘i yoki jarrohlik muolajasi",
    desc: "Atravmatik va shishsiz aql tishini olish hamda og‘riqsiz milk jarrohligi",
    Icon: SurgeryIcon,
    iconBg: "from-[#92003A] to-[#0F3040]",
    speciality: "Stomatologiya Jarrohligi",
    slug: "jarrohlik-stomatologiyasi",
    estTime: "10 daqiqadan 30+ daqiqagacha",
    badge: "JARROHLIK",
  },
];

const SmileQuiz = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();

  return (
    <section className="my-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-[#0F3040] via-[#1E1733] to-[#321E48] rounded-[40px] p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden border border-[#403D88]/40 shadow-2xl">
        
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#92003A]/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#403D88]/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] text-slate-200 border border-white/15 text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#91008D] animate-pulse" />
            ONLAYN KLINIK TASHXIS TESTI
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4">
            Qaysi muolaja sizga to‘g‘ri keladi?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-10 max-w-2xl mx-auto font-normal">
            Quyidagi variantlardan o‘zingizga mos holatni tanlang va mutaxassis tavsiyasi hamda davolanish vaqtini bir zumda bilib oling.
          </p>

          {/* 5 Specialty Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left mb-10">
            {options.map((opt) => {
              const isSelected = selectedOption?.id === opt.id;
              const { Icon } = opt;

              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedOption(opt)}
                  className={`p-6 sm:p-7 rounded-[28px] border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? "bg-white text-[#0F3040] border-white shadow-2xl scale-[1.03]"
                      : "bg-white/[0.06] hover:bg-white/[0.10] text-white border-white/10 hover:border-[#403D88]/60 hover:-translate-y-1"
                  }`}
                >
                  <div>
                    {/* Top Row: Professional SVG Badge + Specialty Pill */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${opt.iconBg} p-2.5 flex items-center justify-center shadow-md border border-white/20`}>
                        <Icon />
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full ${
                          isSelected
                            ? "bg-[#403D88]/10 text-[#403D88]"
                            : "bg-white/10 text-slate-300 border border-white/10"
                        }`}
                      >
                        {opt.badge}
                      </span>
                    </div>

                    {/* Label & Description */}
                    <h3
                      className={`text-base font-black leading-snug mb-2 ${
                        isSelected ? "text-[#0F3040]" : "text-white"
                      }`}
                    >
                      {opt.label}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed font-normal ${
                        isSelected ? "text-slate-600" : "text-slate-300"
                      }`}
                    >
                      {opt.desc}
                    </p>
                  </div>

                  {/* Bottom Duration & Checkmark Indicator */}
                  <div className={`mt-5 pt-4 border-t flex items-center justify-between ${
                    isSelected ? "border-slate-100" : "border-white/10"
                  }`}>
                    <span
                      className={`text-[11px] font-bold ${
                        isSelected ? "text-[#92003A]" : "text-slate-300"
                      }`}
                    >
                      ⏱ {opt.estTime}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-[#92003A] to-[#91008D] text-white shadow-sm scale-110"
                          : "border border-white/25 text-transparent group-hover:border-white/50"
                      }`}
                    >
                      ✓
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Option Result Action Banner */}
          {selectedOption && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-left shadow-2xl animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#E8D5F5] block">
                  TAVSIYA ETILGAN MUTAXASSISLIK
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  {selectedOption.speciality}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 font-normal">
                  Taxminiy muddat: <strong className="text-white">{selectedOption.estTime}</strong>. Bosh shifokor qabuliga onlayn yoziling.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => navigate(`/services/${selectedOption.slug}`)}
                  className="w-full md:w-auto px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Xizmat haqida batafsil
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/appointment")}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white font-black text-xs uppercase tracking-wider rounded-full shadow-lg transition-all active:scale-95 cursor-pointer text-center"
                >
                  Qabulga yozilish →
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default SmileQuiz;
