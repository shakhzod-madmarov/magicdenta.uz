import { useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { AppContext } from "../context/AppContext";
import { formatUzPhone, isUzPhoneComplete, handleUzPhonePaste, PHONE_PLACEHOLDER } from "../utils/phone";

const Contact = () => {
  const { backendUrl } = useContext(AppContext);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "Ortodontiya",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Ism majburiy.";
    if (!formData.phone.trim()) newErrors.phone = "Telefon raqam majburiy.";
    else {
      if (!isUzPhoneComplete(formData.phone))
        newErrors.phone = "Telefon formati noto‘g‘ri. Masalan: +998 (91) 289-15-14";
    }
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Elektron pochta noto‘g‘ri.";
    if (!formData.message.trim()) newErrors.message = "Xabar majburiy.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const formatted = formatUzPhone(value);
      setFormData((p) => ({ ...p, phone: formatted }));
      setErrors((p) => ({ ...p, phone: "" }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
      setErrors((p) => ({ ...p, [name]: "" }));
    }
    setStatus({ type: "", message: "" });
  };

  const handlePhonePaste = (e) =>
    handleUzPhonePaste(e, (formatted) => {
      setFormData((p) => ({ ...p, phone: formatted }));
      setErrors((p) => ({ ...p, phone: "" }));
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/public/contact`,
        formData,
      );

      if (data.success) {
        setStatus({
          type: "success",
          message: data.message || "Xabaringiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog'lanamiz.",
        });

        setFormData({
          name: "",
          phone: "",
          email: "",
          service: "Ortodontiya",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message: data.message || "Xatolik yuz berdi.",
        });
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Xabar yuborilmadi. Iltimos, qayta urinib ko‘ring.";

      setStatus({
        type: "error",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Magic Denta | Aloqa va Manzil",
    "description": "Magic Denta stomatologiya klinikasi bilan bog'lanish, manzil, telefon raqamlari va ish vaqtlari.",
    "url": "https://magicdenta.uz/contact",
    "mainEntity": {
      "@type": "Dentist",
      "name": "Magic Denta",
      "telephone": ["+998912891514", "+998905429303"],
      "email": "magicdenta.uz@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Bobur shoh koʻchasi, 1B",
        "addressLocality": "Andijon",
        "addressRegion": "Andijon",
        "postalCode": "170126",
        "addressCountry": "UZ"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 40.749296,
        "longitude": 72.360242
      },
      "openingHours": "Mo-Sa 08:00-20:00"
    }
  };

  return (
    <div className="bg-[#F8F9FD] min-h-screen text-[#0F3040] py-6 sm:py-10">
      <Seo
        title="Aloqa | Magic Denta Stomatologiya Klinikasi"
        description="Magic Denta bilan bog'laning. Manzilimiz: Bobur shoh koʻchasi, 1B. 08:00-20:00 qabul (Yakshanba dam olish), professional shifokorlar va tezkor maslahat."
        canonicalPath="/contact"
        jsonLd={jsonLd}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Unified Master Contact Card */}
        <section className="bg-white rounded-[36px] shadow-2xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Brand Dark Panel (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0F3040] via-[#1E1733] to-[#321E48] p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#92003A]/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#403D88]/30 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.10] border border-white/20 text-slate-200 text-[10px] font-black tracking-widest uppercase mb-2.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#91008D] animate-pulse" />
                  MAGIC DENTA ALOQA
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Biz bilan bog‘laning
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1.5 leading-relaxed">
                  Savollaringiz bormi yoki qabulga yozilmoqchimisiz? Biz sizga yordam berishdan mamnunmiz.
                </p>
              </div>

              {/* Direct Info List */}
              <div className="space-y-3 pt-1">
                {/* Address */}
                <div className="p-3.5 rounded-2xl bg-white/[0.07] border border-white/15 flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#92003A] to-[#91008D] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Klinika manzili</span>
                    <span className="font-bold text-white text-sm">Bobur shoh koʻchasi, 1B</span>
                  </div>
                </div>

                {/* Phones */}
                <div className="p-3.5 rounded-2xl bg-white/[0.07] border border-white/15 flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#403D88] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Telefon raqamlar</span>
                    <div className="flex flex-wrap items-center gap-x-2.5 text-xs sm:text-sm font-bold text-white">
                      <a href="tel:+998912891514" className="hover:text-emerald-300 transition-colors">+998 (91) 289-15-14</a>
                      <span className="text-white/30">•</span>
                      <a href="tel:+998905429303" className="hover:text-emerald-300 transition-colors">+998 (90) 542-93-03</a>
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="p-3.5 rounded-2xl bg-white/[0.07] border border-white/15 flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Ish jadvali</span>
                    <span className="font-bold text-white text-sm">Dush – Shanba: 08:00 – 20:00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions inside Left Panel */}
            <div className="relative z-10 pt-5 border-t border-white/15 space-y-2.5 mt-5">
              <div className="flex items-center gap-2">
                <a
                  href="https://t.me/+998912891514"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#24A1DE] text-white hover:opacity-90 transition text-xs font-black shadow-xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 4L3 11.5l4 1.5 1.5 4L21 4z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Telegram
                </a>
                <a
                  href="https://www.instagram.com/magic.denta/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#92003A] to-[#91008D] text-white hover:opacity-90 transition text-xs font-black shadow-xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="3" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                  </svg>
                  Instagram
                </a>
              </div>

              <Link
                to="/appointment"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white text-[#0F3040] hover:bg-slate-100 font-black text-xs uppercase tracking-wider transition shadow-sm active:scale-95 cursor-pointer"
              >
                Qabulga onlayn yozilish →
              </Link>
            </div>
          </div>

          {/* Right Column: Contact Message Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-12 text-left bg-white flex flex-col justify-center">
            <div className="mb-5">
              <span className="text-[10px] font-black text-[#403D88] uppercase tracking-widest block mb-1">
                ONLAYN MUROJAAT
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F3040]">
                Shifokorga xabar qoldiring
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
                Savolingiz yoki shikoyatingizni yozing. Administratorimiz sizga tez fursatda javob beradi.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Ismingiz <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full rounded-xl px-4 py-3 border ${
                      errors.name ? "border-red-500" : "border-slate-200"
                    } focus:outline-none focus:ring-2 focus:ring-[#403D88] bg-slate-50 text-sm font-medium`}
                    placeholder="Ism sharifingiz"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 mt-1 font-semibold">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Telefon raqam <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onPaste={handlePhonePaste}
                    maxLength={PHONE_PLACEHOLDER.length}
                    placeholder={PHONE_PLACEHOLDER}
                    className={`w-full rounded-xl px-4 py-3 border ${
                      errors.phone ? "border-red-500" : "border-slate-200"
                    } focus:outline-none focus:ring-2 focus:ring-[#403D88] bg-slate-50 text-sm font-medium`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1 font-semibold">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="service"
                    className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Xizmat yo‘nalishi
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#403D88] bg-slate-50 text-sm font-medium text-slate-800"
                  >
                    <option value="Ortodontiya">Ortodontiya & Breketlar</option>
                    <option value="Terapevtik stomatologiya">Terapevtik davolash</option>
                    <option value="Ortopedik stomatologiya">Ortopediya & Sirkoniy</option>
                    <option value="Estetik stomatologiya">Estetik vinirlar</option>
                    <option value="Stomatologiya Jarrohligi">Stomatologiya jarrohligi</option>
                    <option value="Umumiy konsultatsiya">Umumiy konsultatsiya</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Elektron pochta (ixtiyoriy)
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full rounded-xl px-4 py-3 border ${
                      errors.email ? "border-red-500" : "border-slate-200"
                    } focus:outline-none focus:ring-2 focus:ring-[#403D88] bg-slate-50 text-sm font-medium`}
                    placeholder="misol@gmail.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1 font-semibold">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1"
                >
                  Xabaringiz <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="3"
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full rounded-xl px-4 py-2.5 border ${
                    errors.message ? "border-red-500" : "border-slate-200"
                  } focus:outline-none focus:ring-2 focus:ring-[#403D88] bg-slate-50 text-sm font-medium`}
                  placeholder="Sizni qanday stomatologik masala bezovta qilmoqda?..."
                />
                {errors.message && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">
                    {errors.message}
                  </p>
                )}
              </div>

              {status.message && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold ${
                    status.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Yuborilmoqda..." : "Xabarni yuborish"}
              </button>


            </form>
          </div>

        </section>

        {/* Full-Width Framed Interactive Yandex Map */}
        <div className="rounded-[36px] overflow-hidden bg-white border border-slate-200/90 shadow-2xl p-4 sm:p-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 px-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#403D88] block">Klinika Lokatsiyasi</span>
              <h3 className="text-lg font-black text-[#0F3040]">Bobur shoh koʻchasi, 1B • Andijon</h3>
            </div>
            <a
              href="https://yandex.uz/maps/-/CTsybHos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-[#0F3040] hover:text-white text-[#0F3040] transition text-xs font-bold shadow-xs self-start sm:self-auto cursor-pointer"
            >
              <span>Yandeks Xaritada ochish</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <div className="rounded-[28px] overflow-hidden border border-slate-200 relative h-[360px] sm:h-[400px] w-full">
            <iframe
              src="https://yandex.uz/map-widget/v1/?display-text=Stomatologiya%20klinikasi&ll=72.360238%2C40.749405&mode=search&oid=216461525511&ol=biz&z=17"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen={true}
              title="Magic Denta Yandex Xarita"
              className="w-full h-full"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
