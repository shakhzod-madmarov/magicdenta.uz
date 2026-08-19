import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import profilePic from "../assets/profile_pic.png";

const TopDentists = () => {
  const navigate = useNavigate();
  const { dentists, backendUrl } = useContext(AppContext);
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      tag: "KLINIKA MUTAXASSISI",
      heading: "Magic Denta Bosh Shifokori",
      desc: "Klinikamiz oliy toifali mutaxassisi bilan tanishing va qulay vaqtga onlayn qabulga yoziling.",
      headDocTag: "BOSH SHIFOKOR • ORTOPED-ORTODONT",
      book: "Qabulga yozilish",
      experience: "yillik tajriba",
      consultation: "Konsultatsiya olish",
      openHours: "Qabul vaqti: 08:00 – 20:00 (Dush – Shan)",
      skillsTag: "ASOSIY YO‘NALISHLAR:",
    },
    ru: {
      tag: "СПЕЦИАЛИСТ КЛИНИКИ",
      heading: "Главный врач Magic Denta",
      desc: "Познакомьтесь с ведущим специалистом клиники и запишитесь на прием в удобное для вас время.",
      headDocTag: "ГЛАВНЫЙ ВРАЧ • ОРТОПЕД-ОРТОДОНТ",
      book: "Записаться на прием",
      experience: "лет опыта",
      consultation: "Консультация",
      openHours: "Время приема: 08:00 – 20:00 (Пн – Сб)",
      skillsTag: "ОСНОВНЫЕ НАПРАВЛЕНИЯ:",
    },
    en: {
      tag: "CLINICAL SPECIALIST",
      heading: "Magic Denta Chief Dentist",
      desc: "Meet our head clinical specialist and reserve your consultation at your convenient time.",
      headDocTag: "CHIEF DENTIST • ORTHOPEDICS & ORTHODONTICS",
      book: "Book Appointment",
      experience: "years experience",
      consultation: "Get Consultation",
      openHours: "Working Hours: 08:00 – 20:00 (Mon – Sat)",
      skillsTag: "CORE SPECIALTIES:",
    },
  }[lang] || {
    tag: "KLINIKA MUTAXASSISI",
    heading: "Magic Denta Bosh Shifokori",
    desc: "Klinikamiz oliy toifali mutaxassisi bilan tanishing va qulay vaqtga onlayn qabulga yoziling.",
    headDocTag: "BOSH SHIFOKOR • ORTOPED-ORTODONT",
    book: "Qabulga yozilish",
    experience: "yillik tajriba",
    consultation: "Konsultatsiya olish",
    openHours: "Qabul vaqti: 08:00 – 20:00 (Dush – Shan)",
    skillsTag: "ASOSIY YO‘NALISHLAR:",
  };

  const allDentists = Array.isArray(dentists) ? dentists.filter(Boolean) : [];
  // Strictly display 1 primary dentist on magicdenta.uz
  const chiefDoctor = allDentists.length > 0 ? allDentists[0] : null;

  return (
    <section className="my-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-black tracking-widest text-[#403D88] uppercase block mb-2">
          {t.tag}
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0F3040] leading-tight tracking-tight">
          {t.heading}
        </h2>
        <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
          {t.desc}
        </p>
      </div>

      {chiefDoctor ? (
        <div className="max-w-4xl mx-auto bg-white rounded-[36px] border border-slate-200/90 shadow-card-clean hover:shadow-card-hover p-6 sm:p-10 transition-all grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
          {/* Doctor Image */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[280px] aspect-[4/5] rounded-[28px] overflow-hidden bg-gradient-to-br from-[#0F3040] to-[#321E48] border border-[#403D88]/30 shadow-lg relative group">
              <img
                src={
                  chiefDoctor.image
                    ? String(chiefDoctor.image).startsWith("http")
                      ? chiefDoctor.image
                      : `${backendUrl}${chiefDoctor.image}`
                    : profilePic
                }
                alt={chiefDoctor.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = profilePic;
                }}
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0F3040]/85 backdrop-blur-md border border-white/20 text-white text-[10px] font-black tracking-wider uppercase">
                {t.headDocTag}
              </div>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-600">
                  {t.openHours}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0F3040]">
                {chiefDoctor.name}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-[#92003A] mt-0.5">
                {chiefDoctor.degree || "Stomatolog-Ortoped, Ortodont"}
                {chiefDoctor.experience ? ` • ${chiefDoctor.experience} ${t.experience}` : ""}
              </p>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
              {chiefDoctor.about ||
                "Magic Denta klinikasida individual davolash rejasi, og‘riqsiz muolajalar, breketlar, sirkoniy qoplamalar va estetik tabassum dizayni bo‘yicha yuqori malakali xizmat ko‘rsatadi."}
            </p>

            {/* Specialties Badges */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                {t.skillsTag}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(chiefDoctor.speciality) && chiefDoctor.speciality.length > 0
                  ? chiefDoctor.speciality
                  : ["Ortopedik stomatologiya", "Ortodontiya", "Terapevtik stomatologiya", "Estetik stomatologiya"]
                ).map((sp, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-bold text-[#0F3040]"
                  >
                    {sp}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Booking CTA */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/appointment/${chiefDoctor._id}`)}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {t.book} →
              </button>
              <button
                type="button"
                onClick={() => navigate("/contact")}
                className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#0F3040] text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                {t.consultation}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Clean fallback if DB is loading or empty */
        <div className="max-w-xl mx-auto bg-white rounded-[36px] p-8 border border-slate-200/90 shadow-sm text-center">
          <div className="text-3xl mb-2">🩺</div>
          <h3 className="text-xl font-black text-[#0F3040] mb-2">
            Magic Denta Shifokori Qabuli
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Barcha 5 ta yo‘nalish bo‘yicha professional konsultatsiya va davolanish uchun qabulga yoziling.
          </p>
          <button
            type="button"
            onClick={() => navigate("/contact")}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#92003A] to-[#91008D] text-white text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
          >
            Qabulga yozilish: +998 91 289 15 14
          </button>
        </div>
      )}
    </section>
  );
};

export default TopDentists;
