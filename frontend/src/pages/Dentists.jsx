import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Seo from "../components/Seo";
import profilePic from "../assets/profile_pic.png";

const specialityList = [
  "Ortodontiya",
  "Terapevtik stomatologiya",
  "Ortopedik stomatologiya",
  "Estetik stomatologiya",
  "Stomatologiya Jarrohligi",
];

const Dentists = () => {
  const { speciality: specialityParam } = useParams();
  const navigate = useNavigate();
  const { dentists, backendUrl } = useContext(AppContext);
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      sidebarTitle: "Mutaxassisliklar",
      sidebarDesc: "Barcha yo‘nalishlar bo‘yicha davolash xizmatlari.",
      allDocs: "Barcha yo‘nalishlar",
      cardTag: "MAGIC DENTA BOSH SHIFOKORI",
      cardDesc: "Magic Denta bosh shifokori barcha asosiy stomatologik va ortopedik muolajalarni amalga oshiradi.",
      book: "Qabul vaqtini tanlash",
      heading: "Magic Denta Mutaxassisi Qabuli",
      hours: "Qabul vaqti: 08:00 – 20:00 (Dushanba – Shanba, Yakshanba dam olish)",
      experience: "yillik klinik tajriba",
    },
    ru: {
      sidebarTitle: "Направления",
      sidebarDesc: "Все направления лечения и восстановления.",
      allDocs: "Все направления",
      cardTag: "ГЛАВНЫЙ ВРАЧ MAGIC DENTA",
      cardDesc: "Главный врач клиники Magic Denta проводит прием по всем ключевым стоматологическим и ортопедическим направлениям.",
      book: "Выбрать время приема",
      heading: "Прием специалиста Magic Denta",
      hours: "График приема: 08:00 – 20:00 (Понедельник – Суббота)",
      experience: "лет клинического опыта",
    },
    en: {
      sidebarTitle: "Specialties",
      sidebarDesc: "Comprehensive dental and orthopedic care.",
      allDocs: "All Specialties",
      cardTag: "MAGIC DENTA CHIEF DENTIST",
      cardDesc: "Magic Denta chief clinician leads all primary dental, orthodontic, and orthopedic procedures.",
      book: "Select Appointment Slot",
      heading: "Magic Denta Specialist Care",
      hours: "Hours: 08:00 – 20:00 (Monday – Saturday, Sunday Closed)",
      experience: "years clinical experience",
    },
  }[lang] || {
    sidebarTitle: "Mutaxassisliklar",
    sidebarDesc: "Barcha yo‘nalishlar bo‘yicha davolash xizmatlari.",
    allDocs: "Barcha yo‘nalishlar",
    cardTag: "MAGIC DENTA BOSH SHIFOKORI",
    cardDesc: "Magic Denta bosh shifokori barcha asosiy stomatologik va ortopedik muolajalarni amalga oshiradi.",
    book: "Qabul vaqtini tanlash",
    heading: "Magic Denta Mutaxassisi Qabuli",
    hours: "Qabul vaqti: 08:00 – 20:00 (Dushanba – Shanba, Yakshanba dam olish)",
    experience: "yillik klinik tajriba",
  };

  const decodedParam = specialityParam ? decodeURIComponent(specialityParam) : "";
  const [selectedSpeciality, setSelectedSpeciality] = useState(decodedParam);

  useEffect(() => {
    setSelectedSpeciality(specialityParam ? decodeURIComponent(specialityParam) : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [specialityParam]);

  const allDentists = Array.isArray(dentists) ? dentists.filter(Boolean) : [];
  // Public website showcases 1 primary dentist
  const chiefDoctor = allDentists.length > 0 ? allDentists[0] : null;

  return (
    <div className="bg-[#F8F9FD] min-h-screen text-[#0F3040] py-8">
      <Seo
        title={`${t.heading} | Magic Denta`}
        description="Magic Denta bosh shifokori qabuliga onlayn yoziling. 5 ta asosiy mutaxassislik bo‘yicha xalqaro standartdagi og‘riqsiz muolajalar."
        canonicalPath="/dentists"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Banner Header */}
        <div className="mb-10 text-left">
          <span className="text-xs font-black tracking-widest text-[#403D88] uppercase block mb-2">
            MAGIC DENTA KLINIKASI
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F3040] tracking-tight">
            {t.heading}
          </h1>
          <p className="text-slate-600 text-sm mt-2 font-normal">
            {t.hours}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Specialties filter buttons */}
          <aside className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card-clean space-y-4 text-left">
            <div>
              <h2 className="text-base font-black text-[#0F3040]">
                {t.sidebarTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t.sidebarDesc}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedSpeciality("");
                  navigate("/dentists");
                }}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  !selectedSpeciality
                    ? "bg-[#0F3040] text-white shadow-md"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {t.allDocs}
              </button>

              {specialityList.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => {
                    setSelectedSpeciality(spec);
                    navigate(`/dentists/${encodeURIComponent(spec)}`);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    selectedSpeciality === spec
                      ? "bg-[#0F3040] text-white shadow-md"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/services"
                className="block text-center text-xs font-black text-[#403D88] hover:text-[#92003A] py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
              >
                Barcha 5 ta xizmat haqida batafsil →
              </Link>
            </div>
          </aside>

          {/* Right Column: 1 Featured Chief Dentist Card */}
          <main className="lg:col-span-8">
            {chiefDoctor ? (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-card-clean text-left space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F3040] to-[#321E48] shrink-0 border border-[#403D88]/30 shadow-md">
                    <img
                      src={
                        chiefDoctor.image
                          ? String(chiefDoctor.image).startsWith("http")
                            ? chiefDoctor.image
                            : `${backendUrl}${chiefDoctor.image}`
                          : profilePic
                      }
                      alt={chiefDoctor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = profilePic;
                      }}
                    />
                  </div>

                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <span className="inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#403D88]/10 text-[#403D88]">
                      {t.cardTag}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#0F3040]">
                      {chiefDoctor.name}
                    </h2>
                    <p className="text-xs sm:text-sm font-bold text-[#92003A]">
                      {chiefDoctor.degree || "Stomatolog-Ortoped, Ortodont"}
                      {chiefDoctor.experience ? ` • ${chiefDoctor.experience} ${t.experience}` : ""}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-emerald-600 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Qabulga ochiq (08:00 – 20:00)</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {chiefDoctor.about || t.cardDesc}
                  </p>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                      Muolaja yo‘nalishlari:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(chiefDoctor.speciality) && chiefDoctor.speciality.length > 0
                        ? chiefDoctor.speciality
                        : ["Ortopedik stomatologiya", "Ortodontiya", "Terapevtik stomatologiya", "Estetik stomatologiya"]
                      ).map((sp, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-[#0F3040]"
                        >
                          ✓ {sp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/appointment/${chiefDoctor._id}`)}
                    className="flex-1 py-4 px-8 rounded-2xl bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white text-xs font-black uppercase tracking-wider text-center transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    {t.book} →
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/contact")}
                    className="py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#0F3040] text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer"
                  >
                    Aloqa
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
                <div className="text-3xl mb-3">🩺</div>
                <h3 className="text-lg font-black text-[#0F3040] mb-2">
                  Magic Denta Shifokor Qabuli
                </h3>
                <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
                  Shifokor qabuliga to‘g‘ridan-to‘g‘ri yozilish uchun qo‘ng‘iroq qiling yoki ariza qoldiring.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/contact")}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-[#92003A] to-[#91008D] text-white text-xs font-black uppercase"
                >
                  Konsultatsiya: +998 91 289 15 14
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dentists;
