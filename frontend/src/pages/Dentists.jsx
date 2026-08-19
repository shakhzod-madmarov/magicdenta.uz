import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Seo from "../components/Seo";

const specialityList = [
  "Ortodontiya",
  "Terapevtik stomatologiya",
  "Ortopedik stomatologiya",
  "Estetik stomatologiya",
  "Stomatologiya Jarrohligi",
];

const normalize = (s = "") => s.toString().trim().toLowerCase();

const Dentists = () => {
  const { speciality: specialityParam } = useParams();
  const navigate = useNavigate();
  const { dentists, backendUrl } = useContext(AppContext);
  const lang = localStorage.getItem("language") || "uz";

  const t = {
    uz: {
      sidebarTitle: "Yo'nalishlar",
      sidebarDesc: "Klinikadagi mutaxassisliklar bo'yicha shifokorlarni saralang.",
      allDocs: "Barcha stomatologlar",
      cardTag: "MAGIC DENTA MUTAXASSISI",
      cardDesc: "Profil bilan tanishing va qulay qabul vaqtini tanlang.",
      book: "Uchrashuv belgilash",
      noDocs: "Bu mutaxassislik bo‘yicha stomatologlar topilmadi.",
      headingAll: "Barcha Stomatologlar",
      headingSpec: "yo‘nalishi bo‘yicha Stomatologlar",
    },
    ru: {
      sidebarTitle: "Направления",
      sidebarDesc: "Фильтруйте врачей по услугам клиники.",
      allDocs: "Все стоматологи",
      cardTag: "СПЕЦИАЛИСТ MAGIC DENTA",
      cardDesc: "Ознакомьтесь с профилем и выберите удобное время приема.",
      book: "Записаться на прием",
      noDocs: "Стоматологи по этой специальности не найдены.",
      headingAll: "Все стоматологи",
      headingSpec: "Стоматологи по направлению",
    },
    en: {
      sidebarTitle: "Specialties",
      sidebarDesc: "Filter doctors by clinic services.",
      allDocs: "All Dentists",
      cardTag: "MAGIC DENTA SPECIALIST",
      cardDesc: "View profile and select an open consultation slot.",
      book: "Book Appointment",
      noDocs: "No dentists found for this specialty.",
      headingAll: "All Dentists",
      headingSpec: "Dentists for",
    },
  }[lang] || {
    sidebarTitle: "Yo'nalishlar",
    sidebarDesc: "Klinikadagi mutaxassisliklar bo'yicha shifokorlarni saralang.",
    allDocs: "Barcha stomatologlar",
    cardTag: "MAGIC DENTA MUTAXASSISI",
    cardDesc: "Profil bilan tanishing va qulay qabul vaqtini tanlang.",
    book: "Uchrashuv belgilash",
    noDocs: "Bu mutaxassislik bo‘yicha stomatologlar topilmadi.",
    headingAll: "Barcha Stomatologlar",
    headingSpec: "yo‘nalishi bo‘yicha Stomatologlar",
  };

  const decodedParam = specialityParam
    ? decodeURIComponent(specialityParam)
    : "";

  const [selectedSpeciality, setSelectedSpeciality] = useState(decodedParam);
  const [filteredDentists, setFilteredDentists] = useState(dentists || []);

  useEffect(() => {
    const param = specialityParam ? decodeURIComponent(specialityParam) : "";
    setSelectedSpeciality(param);

    if (param) {
      setFilteredDentists(
        (dentists || []).filter((d) => {
          if (!d.speciality) return false;
          const specs = Array.isArray(d.speciality)
            ? d.speciality
            : [d.speciality];
          const paramNorm = normalize(param);
          return specs.some(
            (spec) =>
              normalize(spec).includes(paramNorm) ||
              paramNorm.includes(normalize(spec)),
          );
        }),
      );
    } else {
      setFilteredDentists(dentists || []);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [specialityParam, dentists]);

  const navigateToSpeciality = (spec) => {
    if (normalize(spec) === normalize(selectedSpeciality)) {
      navigate("/dentists");
    } else if (spec) {
      navigate(`/dentists/${encodeURIComponent(spec)}`);
    } else {
      navigate("/dentists");
    }
  };

  const seoTitle = selectedSpeciality
    ? `${selectedSpeciality} | Magic Denta Shifokorlari`
    : "Magic Denta Stomatologlari | Malakali Shifokorlar Ro'yxati";

  const seoDescription = selectedSpeciality
    ? `Magic Denta klinikasida ${selectedSpeciality} bo'yicha tajribali stomatologlar. Shifokorlar bilan tanishing va onlayn qabulga yoziling.`
    : "Magic Denta stomatologiya klinikasi oliy toifali mutaxassislari. Dushanbadan shanbagacha 08:00-20:00 ishlaydigan tajribali stomatologlar qabuliga yoziling.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": seoTitle,
    "description": seoDescription,
    "numberOfItems": (filteredDentists || []).length,
    "itemListElement": (filteredDentists || []).map((d, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Physician",
        "name": d.name,
        "image": d.image ? `${backendUrl}${d.image}` : undefined,
        "medicalSpecialty": Array.isArray(d.speciality) ? d.speciality.join(", ") : d.speciality,
        "url": `https://magicdenta.uz/appointment/${d._id}`
      }
    }))
  };

  const seoCanonicalPath = selectedSpeciality
    ? `/dentists/${encodeURIComponent(selectedSpeciality)}`
    : "/dentists";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath={seoCanonicalPath}
        jsonLd={jsonLd}
      />
      <header className="mb-8 text-left border-b border-slate-200/80 pb-5">
        <span className="text-xs font-black tracking-widest text-[#403D88] uppercase block mb-1">
          MAGIC DENTA KLINIKASI
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F3040] leading-tight">
          {selectedSpeciality
            ? (lang === "uz" 
                ? `${selectedSpeciality} ${t.headingSpec}`
                : lang === "ru"
                  ? `${t.headingSpec} ${selectedSpeciality}`
                  : `${t.headingSpec} ${selectedSpeciality}`)
            : t.headingAll}
        </h1>
      </header>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        <aside className="w-full lg:w-1/4">
          <div className="bg-white p-6 rounded-[30px] border border-slate-200/80 shadow-card-clean lg:sticky lg:top-24 max-h-[400px] lg:max-h-none overflow-y-auto text-left">
            <h2 className="font-black text-lg text-[#0F3040] mb-1">{t.sidebarTitle}</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed font-normal">{t.sidebarDesc}</p>
            <ul className="space-y-2">
              <li
                onClick={() => navigateToSpeciality("")}
                className={`cursor-pointer px-4 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 ${
                  !selectedSpeciality
                    ? "bg-gradient-to-r from-[#403D88] to-[#321E48] text-white shadow-sm"
                    : "text-slate-700 bg-slate-100 hover:bg-slate-200/70"
                }`}
              >
                {t.allDocs}
              </li>
              {specialityList.map((spec) => {
                const active =
                  normalize(selectedSpeciality) === normalize(spec);

                return (
                  <li
                    key={spec}
                    onClick={() => navigateToSpeciality(spec)}
                    className={`cursor-pointer px-4 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-[#403D88] to-[#321E48] text-white shadow-sm"
                        : "text-slate-700 bg-slate-100 hover:bg-slate-200/70"
                    }`}
                  >
                    {spec}
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
        <main className="w-full lg:w-3/4">
          {filteredDentists.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[32px] border border-slate-200/80 shadow-card-clean p-8">
              <div className="w-16 h-16 rounded-full bg-[#403D88]/10 text-[#403D88] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#0F3040] mb-2">{t.noDocs}</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Yangi shifokorlar Magic Denta tizimiga qo'shilmoqda. Tez orada bu sahifada ularning to'liq profillari aks etadi.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDentists.map((dentist) => (
                <li
                  key={dentist._id}
                  className="bg-white rounded-[32px] border border-slate-200/80 p-5 shadow-card-clean hover:shadow-card-hover hover:border-[#403D88]/40 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-[24px] border border-slate-200/80 bg-gradient-to-tr from-[#0F3040]/10 to-[#321E48]/10 relative flex items-center justify-center">
                    <img
                      src={
                        dentist?.image
                          ? (dentist.image.startsWith("http") ? dentist.image : backendUrl + dentist.image)
                          : "/doctor-placeholder.svg"
                      }
                      alt={dentist?.name || "Stomatolog"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/doctor-placeholder.svg";
                      }}
                    />
                  </div>

                  <div className="pt-5 text-left flex flex-col justify-between flex-grow">
                    <div>
                      <span className="text-[10px] font-black text-[#403D88] uppercase tracking-wider block mb-1">
                        {t.cardTag}
                      </span>
                      <h3 className="text-xl font-black text-[#0F3040] mb-2 leading-tight">
                        {dentist.name}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-6 font-normal">
                        {t.cardDesc}
                      </p>
                    </div>

                    <Link
                      to={`/appointment/${dentist._id}`}
                      className="w-full py-3.5 bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white font-black text-xs uppercase tracking-wider rounded-2xl text-center transition-all shadow-md active:scale-95 block"
                    >
                      {t.book}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dentists;
