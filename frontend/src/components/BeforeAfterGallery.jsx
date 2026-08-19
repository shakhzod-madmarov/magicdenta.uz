import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import ortodontiyaBefore from "../assets/cases/ortodontiya_before.jpg";
import ortodontiyaAfter from "../assets/cases/ortodontiya_after.jpg";
import ortopediyaBefore from "../assets/cases/ortopediya_before.jpg";
import ortopediyaAfter from "../assets/cases/ortopediya_after.jpg";
import estetikaBefore from "../assets/cases/estetika_before.jpg";
import estetikaAfter from "../assets/cases/estetika_after.jpg";
import terapiyaBefore from "../assets/cases/terapiya_before.jpg";
import terapiyaAfter from "../assets/cases/terapiya_after.jpg";
import jarrohlikBefore from "../assets/cases/jarrohlik_before.jpg";
import jarrohlikAfter from "../assets/cases/jarrohlik_after.jpg";

const casesData = [
  {
    id: "ortodontiya",
    speciality: "Ortodontiya",
    badge: "ORTODONTIYA",
    title: "Tishlar qatorini breket va shaffof elaynerlar orqali tekislash",
    desc: "14 oylik davolanish natijasida chuqur prikus va tishlar egriligi to'liq bartaraf etildi.",
    duration: "14 oy",
    doctor: "Ortodont Mutaxassis",
    beforeLabel: "Davolanishdan oldin",
    afterLabel: "Davolanishdan keyin",
    beforeImg: ortodontiyaBefore,
    afterImg: ortodontiyaAfter,
  },
  {
    id: "ortopediya",
    speciality: "Ortopedik stomatologiya",
    badge: "ORTOPEDIYA",
    title: "Sirkoniy qoplamalar va E-max vinirlar orqali anatomik tiklash",
    desc: "Yemirilgan va rangi xiralashgan tishlar yuqori chidamli sirkoniy qoplamalar bilan estetik tiklandi.",
    duration: "Kamida 1-2 hafta (holatga qarab)",
    doctor: "Ortoped Mutaxassis",
    beforeLabel: "Oldin",
    afterLabel: "Natija",
    beforeImg: ortopediyaBefore,
    afterImg: ortopediyaAfter,
  },
  {
    id: "estetik",
    speciality: "Estetik stomatologiya",
    badge: "ESTETIKA",
    title: "Digital Smile Design: Gollivud tabassumi va lazerli oqartirish",
    desc: "Emalga zarar yetkazmasdan professional oqartirish va 6 dona E-max ultra-yupqa vinir o'rnatildi.",
    duration: "3 seans",
    doctor: "Estet-Stomatolog",
    beforeLabel: "Oldin",
    afterLabel: "Gollivud Tabassumi",
    beforeImg: estetikaBefore,
    afterImg: estetikaAfter,
  },
  {
    id: "terapevtik",
    speciality: "Terapevtik stomatologiya",
    badge: "TERAPIYA",
    title: "Mikroskop ostida chuqur kariesni mutlaqo og'riqsiz davolash",
    desc: "Carl Zeiss mikroskopi yordamida kanal to'liq tozalandi va badiiy nanokompozit bilan plombalandi.",
    duration: "5 kundan 2-3 haftagacha",
    doctor: "Terapevt Stomatolog",
    beforeLabel: "Zararlangan tish",
    afterLabel: "Tiklangan tish",
    beforeImg: terapiyaBefore,
    afterImg: terapiyaAfter,
  },
  {
    id: "jarrohlik",
    speciality: "Jarrohlik stomatologiyasi",
    badge: "JARROHLIK",
    title: "Atravmatik va og'riqsiz aql tishini olish muolajasi",
    desc: "Noqulay o'sgan murakkab 8-tish (aql tishi) piezo-jarrohlik orqali hech qanday shishsiz olindi.",
    duration: "10 daqiqadan 30+ daqiqagacha",
    doctor: "Jarroh Stomatolog",
    beforeLabel: "Muolajadan oldin",
    afterLabel: "Sog'lom tuzalish",
    beforeImg: jarrohlikBefore,
    afterImg: jarrohlikAfter,
  }
];

const BeforeAfterGallery = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let pos = (x / rect.width) * 100;
    if (pos < 5) pos = 5;
    if (pos > 95) pos = 95;
    setSliderPos(pos);
  }, []);

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  const currentCase = casesData[activeTab];

  return (
    <section className="my-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-black tracking-widest text-[#403D88] uppercase block mb-3">
          KLINIK NATIJALAR & NAFOSAT
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0F3040] leading-tight tracking-tight">
          Bemorlarimiz tabassumidagi haqiqiy o‘zgarishlar
        </h2>
        <p className="text-slate-600 mt-4 text-sm sm:text-base leading-relaxed">
          Slayderni suring va Magic Denta shifokorlarining 5 ta asosiy mutaxassislik bo‘yicha amalga oshirgan mukammal davolash natijalarini ko‘ring.
        </p>
      </div>

      {/* Tabs Switcher for 5 Specialties */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
        {casesData.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActiveTab(idx);
              setSliderPos(50);
            }}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer shadow-xs ${
              activeTab === idx
                ? "bg-gradient-to-r from-[#0F3040] to-[#321E48] text-white shadow-md scale-105"
                : "bg-white text-slate-700 border border-slate-200/80 hover:border-[#403D88]/40 hover:bg-slate-50"
            }`}
          >
            {item.speciality}
          </button>
        ))}
      </div>

      {/* Main Interactive Showcase Card */}
      <div className="bg-white rounded-[36px] border border-slate-200/90 shadow-2xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Side: Before/After Interactive Comparison Visual */}
        <div className="lg:col-span-7">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onClick={(e) => handleMove(e.clientX)}
            className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-[28px] overflow-hidden select-none cursor-ew-resize border border-slate-200 shadow-inner group bg-slate-900"
          >
            {/* After Image (Background) */}
            <img
              src={currentCase.afterImg}
              alt="Natija (Keyin)"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <span className="absolute top-4 right-4 z-10 px-3.5 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-[#0F3040]/85 backdrop-blur-md text-white border border-white/20 shadow-md">
              {currentCase.afterLabel} ✨
            </span>

            {/* Before Image (Foreground Clipped) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={currentCase.beforeImg}
                alt="Davolanishdan oldin"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{
                  width: containerRef.current
                    ? `${containerRef.current.offsetWidth}px`
                    : "100%",
                }}
              />
              <span className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-black/75 backdrop-blur-md text-white border border-white/20 shadow-md">
                {currentCase.beforeLabel}
              </span>
            </div>

            {/* Draggable Divider Line & Handle */}
            <div
              className="absolute top-0 bottom-0 z-20 pointer-events-none flex items-center justify-center"
              style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
            >
              <div className="w-1 bg-white h-full shadow-2xl relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-[#92003A] to-[#91008D] text-white flex items-center justify-center shadow-glow-wine border-2 border-white pointer-events-auto cursor-ew-resize">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l-3 3m0 0l3 3m-3-3h16m-3-3l3 3m0 0l-3 3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-600 mt-3 font-semibold">
            👆 Farqni solishtirish uchun markazdagi tugmachani suring
          </p>
        </div>

        {/* Right Side: Case Details & Fast Booking */}
        <div className="lg:col-span-5 text-left flex flex-col justify-between space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#403D88]/10 text-[#403D88] text-[11px] font-black tracking-wider uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-[#91008D] animate-pulse" />
              {currentCase.badge} NATIJASI
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-[#0F3040] leading-tight mb-3">
              {currentCase.title}
            </h3>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
              {currentCase.desc}
            </p>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-6">
              <div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Muolaja muddati</span>
                <span className="text-sm font-black text-[#0F3040] mt-0.5 block">{currentCase.duration}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Yo‘nalish</span>
                <span className="text-sm font-black text-[#92003A] mt-0.5 block">{currentCase.doctor}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/appointment")}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white font-black text-xs uppercase tracking-wider text-center transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Shifokorga yozilish
            </button>
            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#0F3040] font-black text-xs uppercase tracking-wider text-center transition-all cursor-pointer"
            >
              Konsultatsiya
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default BeforeAfterGallery;
