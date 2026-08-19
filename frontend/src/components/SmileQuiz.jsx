import { useState } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    step: 1,
    title: "Sizni qanday stomatologik masala bezovta qilmoqda?",
    subtitle: "Klinik muammoni yoki asosiy maqsadingizni tanlang",
    options: [
      {
        id: "ortho",
        label: "Tishlar egriligi yoki noto‘g‘ri tishlash",
        desc: "Breketlar yoki shaffof elaynerlar orqali tishlar qatorini tekislash",
        icon: "🦷",
        speciality: "Ortodontiya",
        estTime: "6 - 14 oy",
        badge: "ORTODONTIYA",
      },
      {
        id: "caries",
        label: "Tish og‘rig‘i, karies yoki plomba tushishi",
        desc: "Mikroskop ostida mutlaqo og‘riqsiz davolash va estetik plombalash",
        icon: "🩺",
        speciality: "Terapevtik stomatologiya",
        estTime: "1 seans (40-50 daqiqa)",
        badge: "TERAPEVTIK DAVOLASH",
      },
      {
        id: "ortho_crown",
        label: "Tish sinishi, yemirilishi yoki protezlash zarurati",
        desc: "Mustahkam sirkoniy qoplamalar va anatomik tish tiklash",
        icon: "👑",
        speciality: "Ortopedik stomatologiya",
        estTime: "5 - 7 kun",
        badge: "ORTOPEDIK STOMATOLOGIYA",
      },
      {
        id: "aesthetic",
        label: "Gollivud tabassumi, vinirlar yoki tish oqartirish",
        desc: "DSD tabassum dizayni, E-max vinirlar va lazerli oqartirish",
        icon: "✨",
        speciality: "Estetik stomatologiya",
        estTime: "2 - 3 seans",
        badge: "ESTETIK STOMATOLOGIYA",
      },
      {
        id: "surgery",
        label: "Aql tishi (8-tish) og‘rig‘i yoki jarrohlik muolajasi",
        desc: "Atravmatik va shishsiz aql tishini olish hamda milk jarrohligi",
        icon: "⚡",
        speciality: "Jarrohlik stomatologiyasi",
        estTime: "20 - 30 daqiqa",
        badge: "JARROHLIK",
      },
    ],
  },
];

const SmileQuiz = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();

  return (
    <section className="my-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-[#0F3040] via-[#201835] to-[#321E48] rounded-[40px] p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden border border-[#403D88]/40 shadow-2xl">
        
        {/* Glow orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#92003A]/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#403D88]/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left mb-10">
            {questions[0].options.map((opt) => {
              const isSelected = selectedOption?.id === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedOption(opt)}
                  className={`p-6 rounded-[28px] border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? "bg-white text-[#0F3040] border-white shadow-glow-wine scale-[1.02]"
                      : "bg-white/[0.05] hover:bg-white/[0.09] text-white border-white/10 hover:border-[#403D88]/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <span
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                          isSelected
                            ? "bg-[#403D88]/10 text-[#403D88]"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {opt.badge}
                      </span>
                    </div>

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

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold ${
                        isSelected ? "text-[#92003A]" : "text-slate-400"
                      }`}
                    >
                      ⏱ {opt.estTime}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                        isSelected
                          ? "bg-[#92003A] text-white"
                          : "border border-white/20 text-transparent"
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
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[30px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-left shadow-2xl animate-fadeIn">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#91008D] block mb-1">
                  TAVSIYA ETILGAN MUTAXASSISLIK
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white mb-1">
                  {selectedOption.speciality}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  Taxminiy davomiylik: <strong className="text-white">{selectedOption.estTime}</strong>. Oliy toifali shifokorlarimiz qabuliga yoziling.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/dentists/${encodeURIComponent(selectedOption.speciality)}`);
                  }}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white font-black text-xs uppercase tracking-wider rounded-full shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  Shifokor tanlash & Yozilish →
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
