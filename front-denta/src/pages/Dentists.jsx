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
      sidebarDesc: "Klinikadagi xizmatlar bo'yicha shifokorlarni saralang.",
      allDocs: "Barcha stomatologlar",
      cardTag: "MAGIC DENTA MUTAXASSISI",
      cardDesc: "Profil bilan tanishing va hozir ochiq bo'lgan qabul vaqtlaridan birini tanlang.",
      book: "Uchrashuv belgilash",
      noDocs: "Bu mutaxassislik bo‘yicha stomatologlar topilmadi.",
      headingAll: "Hamma Stomatologlar",
      headingSpec: "yo‘nalishi bo‘yicha Stomatologlar",
    },
    ru: {
      sidebarTitle: "Направления",
      sidebarDesc: "Фильтруйте врачей по услугам клиники.",
      allDocs: "Все стоматологи",
      cardTag: "СПЕЦИАЛИСТ MAGIC DENTA",
      cardDesc: "Ознакомьтесь с профилем и выберите одно из доступных значений времени приема.",
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
      cardDesc: "View profile and select one of the currently open appointment times.",
      book: "Book appointment",
      noDocs: "No dentists found for this specialty.",
      headingAll: "All Dentists",
      headingSpec: "Dentists for",
    },
  }[lang] || {
    sidebarTitle: "Yo'nalishlar",
    sidebarDesc: "Klinikadagi xizmatlar bo'yicha shifokorlarni saralang.",
    allDocs: "Barcha stomatologlar",
    cardTag: "MAGIC DENTA MUTAXASSISI",
    cardDesc: "Profil bilan tanishing va hozir ochiq bo'lgan qabul vaqtlaridan birini tanlang.",
    book: "Uchrashuv belgilash",
    noDocs: "Bu mutaxassislik bo‘yicha stomatologlar topilmadi.",
    headingAll: "Hamma Stomatologlar",
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
    if (!spec) navigate("/dentists");
    else navigate(`/dentists/${encodeURIComponent(spec)}`);
  };

  const seoTitle = selectedSpeciality
    ? `${selectedSpeciality} | Magic Denta`
    : "Stomatologlar | Magic Denta";

  const seoDescription = selectedSpeciality
    ? `${selectedSpeciality} yo‘nalishi bo‘yicha stomatologlar va qabul uchun onlayn uchrashuv imkoniyati.`
    : "Magic Denta stomatologlari, mutaxassisliklar va qabul uchun onlayn uchrashuv imkoniyati.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": selectedSpeciality
      ? `${selectedSpeciality} mutaxassisligi bo'yicha stomatologlar`
      : "Magic Denta stomatologlari ro'yxati",
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
      <header className="mb-8 text-left border-b border-[#EAE4D5] pb-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-black leading-tight">
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
          <div className="bg-white p-6 rounded-[28px] border border-[#EAE4D5] shadow-sm lg:sticky lg:top-20 max-h-[400px] lg:max-h-none overflow-y-auto text-left">
            <h2 className="font-black text-xl text-black mb-1">{t.sidebarTitle}</h2>
            <p className="text-xs text-neutral-500 mb-6 leading-relaxed">{t.sidebarDesc}</p>
            <ul className="space-y-2">
              <li
                onClick={() => navigateToSpeciality("")}
                className={`cursor-pointer px-4 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  !selectedSpeciality
                    ? "bg-black text-white shadow-md font-bold"
                    : "text-neutral-700 bg-[#F6F5F2] hover:bg-[#EAE4D5]"
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
                    className={`cursor-pointer px-4 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                      active
                        ? "bg-black text-white shadow-md font-bold"
                        : "text-neutral-700 bg-[#F6F5F2] hover:bg-[#EAE4D5]"
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
            <div className="py-16 text-center bg-white rounded-[28px] border border-[#EAE4D5] shadow-sm">
              <p className="text-neutral-500 font-semibold">
                {t.noDocs}
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDentists.map((dentist) => (
                <li
                  key={dentist._id}
                  className="bg-white rounded-[32px] border border-[#EAE4D5] p-4 sm:p-5 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-[22px] border border-[#B6B09F]/30 bg-gradient-to-tr from-[#EAE4D5] to-[#F2F2F2] relative flex items-center justify-center">
                    <img
                      src={
                        dentist?.image
                          ? (dentist.image.startsWith("http") ? dentist.image : backendUrl + dentist.image)
                          : "/doctor-placeholder.svg"
                      }
                      alt={dentist?.name || "Stomatolog"}
                      className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/doctor-placeholder.svg";
                      }}
                    />
                  </div>

                  <div className="pt-5 text-left flex flex-col justify-between flex-grow">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#B6B09F] uppercase tracking-wider block mb-2">
                        {t.cardTag}
                      </span>
                      <h3 className="text-xl font-black text-neutral-900 mb-2 leading-tight">
                        {dentist.name}
                      </h3>
                      <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                        {t.cardDesc}
                      </p>
                    </div>

                    <Link
                      to={`/appointment/${dentist._id}`}
                      className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded-full text-center transition-all shadow-md active:scale-95 block"
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
