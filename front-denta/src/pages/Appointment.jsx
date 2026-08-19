import { useContext, useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Seo from "../components/Seo";
import { formatDMY, dayToUtcMs } from "../../../shared/date.js";

const pad2 = (n) => String(n).padStart(2, "0");

const weekdayNamesUz = [
  "Yakshanba",
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
];

const normalizeAvailability = (rows) => {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((day) => {
      const slotDate = day?.slotDate || day?.date || "";
      const rawSlots = Array.isArray(day?.slots) ? day.slots : [];

      const normalizedSlots = rawSlots
        .map((slot) => {
          if (typeof slot === "string") {
            return { time: slot, available: true };
          }

          if (slot && typeof slot === "object" && slot.time) {
            return {
              time: String(slot.time),
              available: slot.available !== false,
            };
          }

          return null;
        })
        .filter(Boolean);

      const availableSlots = normalizedSlots
        .filter((slot) => slot.available)
        .map((slot) => slot.time);

      return {
        ...day,
        slotDate,
        normalizedSlots,
        availableSlots,
      };
    })
    .filter((day) => day.slotDate);
};

const Appointment = () => {
  const { dentistId } = useParams();
  const { dentists, backendUrl, token } = useContext(AppContext);

  const [selectedDentist, setSelectedDentist] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const found = Array.isArray(dentists)
      ? dentists.find((d) => d._id === dentistId)
      : null;

    setSelectedDentist(found || null);

    if (Array.isArray(dentists) && dentists.length > 0 && !found) {
      setLoading(false);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dentists, dentistId]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDentist) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setSelectedDayIndex(0);
      setSelectedTime("");

      try {
        const { data } = await axios.get(
          `${backendUrl}/api/user/availability`,
          {
            params: { dentistID: dentistId, days: 10 },
          },
        );

        if (data.success) {
          setAvailability(normalizeAvailability(data.availability || []));
        } else {
          setAvailability([]);
          toast.error(data.message || "Vaqtlarni yuklashda xatolik");
        }
      } catch {
        setAvailability([]);
        toast.error("Vaqtlarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [backendUrl, dentistId, selectedDentist]);

  const hasDays = availability.length > 0;

  const selectedDay = useMemo(
    () => (hasDays ? availability[selectedDayIndex] : null),
    [availability, selectedDayIndex, hasDays],
  );

  const formatDayLabel = (slotDate) => {
    const d = new Date(dayToUtcMs(slotDate));
    const dayName = weekdayNamesUz[d.getDay()];
    return `${dayName.slice(0, 2)} ${pad2(d.getDate())}.${pad2(
      d.getMonth() + 1,
    )}`;
  };

  const bookNow = async () => {
    if (!token) {
      toast.error("Avval tizimga kiring");
      return navigate("/login");
    }

    if (!selectedDay || !selectedTime) {
      return toast.error("Sana va vaqtni tanlang");
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        {
          dentistID: dentistId,
          slotDate: selectedDay.slotDate,
          slotTime: selectedTime,
        },
        { headers: { token } },
      );

      if (data.success) {
        toast.success("Uchrashuv muvaffaqiyatli band qilindi");
        navigate("/myappointments");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Band qilishda xatolik");
    }
  };

  if (!selectedDentist && !loading) {
    return (
      <main className="max-w-5xl mx-auto py-16 text-center">
        <p className="text-red-500">Stomatolog topilmadi</p>
      </main>
    );
  }

  const seoTitle = selectedDentist
    ? `Doktor ${selectedDentist.name} | Magic Denta Stomatologiya`
    : "Shifokor qabuli | Magic Denta";

  const seoDescription = selectedDentist
    ? `${selectedDentist.name} — Magic Denta stomatologiya klinikasining tajribali ${
        Array.isArray(selectedDentist.speciality)
          ? selectedDentist.speciality.join(", ")
          : selectedDentist.speciality || "stomatologi"
      }. Qabulga onlayn yozilish va jadval bilan tanishish.`
    : "Magic Denta shifokorlari qabuliga onlayn yozilish.";

  const jsonLd = selectedDentist
    ? {
        "@context": "https://schema.org",
        "@type": "Physician",
        "name": selectedDentist.name,
        "image": selectedDentist.image ? `${backendUrl}${selectedDentist.image}` : undefined,
        "jobTitle": Array.isArray(selectedDentist.speciality)
          ? selectedDentist.speciality.join(", ")
          : selectedDentist.speciality || "Stomatolog",
        "medicalSpecialty": Array.isArray(selectedDentist.speciality)
          ? selectedDentist.speciality.join(", ")
          : selectedDentist.speciality,
        "telephone": "+998XXXXXXXXX",
        "worksFor": {
          "@type": ["Dentist", "MedicalBusiness", "LocalBusiness"],
          "name": "Magic Denta \"МЧЖ\"",
          "url": "https://magicdenta.uz/",
          "telephone": "+998XXXXXXXXX",
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
      }
    : null;

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath={`/appointment/${dentistId}`}
        jsonLd={jsonLd}
      />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <article className="bg-white rounded-[32px] shadow-sm border border-[#EAE4D5] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
          <figure className="bg-[#FAF9F6] flex items-center justify-center p-6 w-full h-full border-r border-[#EAE4D5]">
            <img
              src={
                selectedDentist?.image
                  ? (selectedDentist.image.startsWith("http") ? selectedDentist.image : backendUrl + selectedDentist.image)
                  : "/doctor-placeholder.svg"
              }
              alt={selectedDentist?.name || "Stomatolog"}
              className="w-full h-auto max-h-[520px] object-cover object-center rounded-[24px] bg-slate-100"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/doctor-placeholder.svg";
              }}
            />
          </figure>

          <section className="p-6 sm:p-8 flex flex-col gap-5 text-left">
            <header>
              <span className="text-[10px] font-extrabold text-[#B6B09F] uppercase tracking-wider block mb-1">
                Magic Denta Mutaxassisi
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-black">
                {selectedDentist?.name}
              </h1>
              <p className="text-neutral-500 mt-1 text-sm sm:text-base font-semibold">
                {Array.isArray(selectedDentist?.speciality)
                  ? selectedDentist.speciality.join(", ")
                  : selectedDentist?.speciality || "Stomatolog"}
              </p>
            </header>

            <div className="grid grid-cols-2 gap-4 text-sm bg-[#FAF9F6] p-4 rounded-2xl border border-[#EAE4D5]">
              <div>
                <p className="text-neutral-400 text-xs font-semibold uppercase">Maʼlumoti</p>
                <p className="font-bold text-neutral-800 mt-0.5">
                  {selectedDentist?.degree || "—"}
                </p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs font-semibold uppercase">Tajriba</p>
                <p className="font-bold text-neutral-800 mt-0.5">
                  {selectedDentist?.experience || "—"} yil
                </p>
              </div>
            </div>

            <div>
              <p className="text-neutral-400 text-xs font-semibold uppercase mb-1">Shifokor haqida</p>
              <p className="text-neutral-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {selectedDentist?.about?.trim() ||
                  "Stomatolog haqida ma’lumot kiritilmagan."}
              </p>
            </div>

            <ul className="text-sm text-neutral-600 space-y-1.5 pt-2 border-t border-[#EAE4D5]">
              <li>🕘 Onlayn qabul: 08:00 – 17:00</li>
              <li>☕ Tushlik: 12:00 – 13:00</li>
              <li>📅 Yakshanba: onlayn bron yopiq</li>
              <li className="mt-2 text-neutral-400 text-xs">
                Agar sizga kerakli vaqtda onlayn bron mavjud bo‘lmasa, iltimos,
                klinikamizga qo‘ng‘iroq qilib administrator bilan bog‘laning.
              </li>
            </ul>
          </section>
        </div>
      </article>

      <section className="mt-10 sm:mt-12 bg-white rounded-[32px] shadow-sm p-6 sm:p-8 border border-[#EAE4D5]">
          <h2 className="text-xl sm:text-2xl font-black text-black text-center mb-6">
            Uchrashuv vaqtini tanlang
          </h2>

          {loading ? (
            <p className="text-center text-neutral-500 font-semibold py-8">Yuklanmoqda...</p>
          ) : !hasDays ? (
            <p className="text-center text-neutral-500 max-w-xl mx-auto py-8">
              Hozircha onlayn bo‘sh vaqtlar yo‘q.
            </p>
          ) : (
            <>
              <div className="flex gap-2.5 overflow-x-auto pb-3 justify-start sm:justify-center snap-x snap-mandatory">
                {availability.map((day, idx) => {
                  const isActive = idx === selectedDayIndex;
                  const isDisabled = !day?.availableSlots?.length;

                  return (
                    <button
                      key={day.slotDate}
                      onClick={() => {
                        setSelectedDayIndex(idx);
                        setSelectedTime("");
                      }}
                      className={`shrink-0 snap-start px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all ${
                        isActive
                          ? "bg-black text-white border-black shadow-sm"
                          : "bg-[#FAF9F6] border-[#EAE4D5] text-neutral-700 hover:bg-[#EAE4D5]"
                      } ${isDisabled ? "opacity-60" : ""}`}
                      title={isDisabled ? "Bu kunda bo‘sh vaqt yo‘q" : ""}
                    >
                      {formatDayLabel(day.slotDate)}
                    </button>
                  );
                })}
              </div>

              {!selectedDay?.availableSlots?.length ? (
                <p className="mt-6 text-center text-neutral-500 py-6">
                  Bu kunda onlayn bo‘sh vaqt yo‘q. Boshqa kunni tanlang yoki
                  klinikaga qo‘ng‘iroq qiling.
                </p>
              ) : (
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {selectedDay.availableSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3.5 rounded-2xl border text-sm font-bold transition-all ${
                        selectedTime === time
                          ? "bg-black text-white border-black scale-[1.02] shadow-md"
                          : "bg-white border-[#EAE4D5] hover:bg-[#FAF9F6] text-neutral-800"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}

              {selectedTime && (
                <div className="mt-10 text-center border-t border-[#EAE4D5] pt-8">
                  <p className="text-neutral-700 mb-4 text-sm sm:text-base">
                    Tanlangan vaqt:
                    <br />
                    <strong className="text-black text-lg sm:text-xl font-black">
                      {formatDMY(selectedDay.slotDate)} — {selectedTime}
                    </strong>
                  </p>
                  <button
                    onClick={bookNow}
                    className="w-full sm:w-auto px-12 py-4 rounded-full bg-black text-white font-extrabold hover:bg-neutral-800 transition shadow-md active:scale-95"
                  >
                    Uchrashuvni tasdiqlash
                  </button>
                </div>
              )}
            </>
          )}
        </section>
    </main>
    </>
  );
};

export default Appointment;
