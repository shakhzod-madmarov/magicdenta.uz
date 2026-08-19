import { useState, useContext } from "react";
import axios from "axios";
import Seo from "../components/Seo";
import { AppContext } from "../context/AppContext";
import { formatUzPhone, isUzPhoneComplete, handleUzPhonePaste, PHONE_PLACEHOLDER } from "../utils/phone";

const Contact = () => {
  const { backendUrl } = useContext(AppContext);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
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
        newErrors.phone =
          "Telefon formati noto‘g‘ri. Masalan: +998 (XX) XXX-XX-XX";
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
          message: data.message,
        });

        setFormData({
          name: "",
          phone: "",
          email: "",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message: data.message,
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
      "openingHours": "Mo-Su 00:00-23:59"
    }
  };

  return (
    <div className="bg-[#F8F9FD] min-h-screen text-[#0F3040] py-8">
      <Seo
        title="Aloqa | Magic Denta Stomatologiya Klinikasi"
        description="Magic Denta bilan bog'laning. Manzilimiz: Bobur shoh koʻchasi, 1B. 24/7 qabul, professional shifokorlar va tezkor maslahat."
        canonicalPath="/contact"
        jsonLd={jsonLd}
      />

      <header className="text-center pt-8 pb-10">
        <div className="max-w-5xl mx-auto px-4">
          <span className="text-xs font-black tracking-widest text-[#403D88] uppercase block mb-2">
            MAGIC DENTA ALOQA MARKAZI
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 text-[#0F3040]">
            Biz bilan bog‘laning
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-normal">
            Savollaringiz bormi yoki uchrashuv belgilamoqchimisiz? Quyidagi
            shakl orqali bizga yozing yoki to‘g‘ridan-to‘g‘ri klinikamizga tashrif buyuring.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact Info Card */}
        <section className="bg-white rounded-[32px] shadow-card-clean p-6 sm:p-8 border border-slate-200/80 text-left">
          <h2 className="text-2xl font-black text-[#0F3040] mb-6">
            Aloqa ma’lumotlari
          </h2>
          <address className="not-italic text-slate-700 space-y-4 mb-8">
            {/* Address */}
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0F3040] to-[#321E48] text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Klinika manzili</span>
                <span className="font-bold text-[#0F3040] text-base">
                  Bobur shoh koʻchasi, 1B
                </span>
              </div>
            </div>

            {/* Phone 1 */}
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0F3040] to-[#321E48] text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Asosiy aloqa / Konsultatsiya</span>
                <a href="tel:+998912891514" className="hover:text-[#92003A] font-bold text-[#0F3040] text-base transition">
                  +998 (91) 289-15-14
                </a>
              </div>
            </div>

            {/* Phone 2 */}
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0F3040] to-[#321E48] text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Qabulxona & Navbat</span>
                <a href="tel:+998905429303" className="hover:text-[#92003A] font-bold text-[#0F3040] text-base transition">
                  +998 (90) 542-93-03
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0F3040] to-[#321E48] text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Elektron pochta</span>
                <a href="mailto:magicdenta.uz@gmail.com" className="hover:text-[#92003A] font-bold text-[#0F3040] text-base break-all transition">
                  magicdenta.uz@gmail.com
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0F3040] to-[#321E48] text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Ish vaqti</span>
                <span className="font-bold text-[#0F3040] text-base">24 / 7 uzluksiz xizmat</span>
              </div>
            </div>
          </address>

          {/* Social Channels */}
          <div className="mb-6">
            <h3 className="text-sm font-black text-[#0F3040] uppercase tracking-wider mb-3">Ijtimoiy tarmoqlar</h3>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="https://t.me/+998912891514"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-[#24A1DE] hover:text-white text-[#0F3040] transition text-xs font-black shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 4L3 11.5l4 1.5 1.5 4L21 4z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Telegram
              </a>

              <a
                href="https://wa.me/998912891514"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-[#25D366] hover:text-white text-[#0F3040] transition text-xs font-black shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12A9 9 0 1 0 11.1 21L8 22l1.1-3.2A9 9 0 0 0 21 12z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                WhatsApp
              </a>

              <a
                href="https://www.instagram.com/magic.denta/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-gradient-to-r hover:from-[#92003A] hover:to-[#91008D] hover:text-white text-[#0F3040] transition text-xs font-black shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
                Instagram
              </a>
            </div>
          </div>

          {/* Embedded Yandex Map */}
          <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative h-[300px]">
            <div style={{ position: "relative", overflow: "hidden" }} className="w-full h-full">
              <a href="https://yandex.uz/maps/org/stomatologiya/216461525511/?utm_medium=mapframe&utm_source=maps" style={{ color: "#eee", fontSize: "12px", position: "absolute", top: "0px" }}>Magic Denta Stomatologiya</a>
              <iframe
                src="https://yandex.uz/map-widget/v1/?display-text=Stomatologiya%20klinikasi&ll=72.360238%2C40.749405&mode=search&oid=216461525511&ol=biz&z=17"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen={true}
                style={{ position: "relative" }}
                title="Magic Denta Yandex Xarita"
              ></iframe>
            </div>
          </div>
        </section>

        {/* Message Form Card */}
        <section className="bg-white rounded-[32px] shadow-card-clean p-6 sm:p-8 border border-slate-200/80 text-left">
          <h2 className="text-2xl font-black text-[#0F3040] mb-6">
            Xabar yuborish
          </h2>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Ismingiz <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-2xl px-4 py-3.5 border ${
                  errors.name ? "border-red-500" : "border-slate-200"
                } focus:outline-none focus:ring-2 focus:ring-[#403D88] bg-slate-50 text-sm font-medium`}
                placeholder="Ism sharifingizni kiriting"
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
                className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5"
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
                className={`w-full rounded-2xl px-4 py-3.5 border ${
                  errors.phone ? "border-red-500" : "border-slate-200"
                } focus:outline-none focus:ring-2 focus:ring-[#403D88] bg-slate-50 text-sm font-medium`}
              />
              {errors.phone && (
                <p className="text-xs text-red-600 mt-1 font-semibold">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Elektron pochta (ixtiyoriy)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-2xl px-4 py-3.5 border ${
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

            <div>
              <label
                htmlFor="message"
                className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Xabaringiz <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className={`w-full rounded-2xl px-4 py-3.5 border ${
                  errors.message ? "border-red-500" : "border-slate-200"
                } focus:outline-none focus:ring-2 focus:ring-[#403D88] bg-slate-50 text-sm font-medium`}
                placeholder="Savolingiz yoki murojaatingizni yozing..."
              />
              {errors.message && (
                <p className="text-xs text-red-600 mt-1 font-semibold">
                  {errors.message}
                </p>
              )}
            </div>

            {status.message && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold ${
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
              className="w-full py-4 bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Yuborilmoqda..." : "Xabarni yuborish"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Contact;
