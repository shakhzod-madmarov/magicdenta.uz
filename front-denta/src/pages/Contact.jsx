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

  return (
    <>
      <Seo
        title="Aloqa | Magic Denta"
        description="Magic Denta bilan bog‘laning. Professional stomatologiya va ortodontiya xizmatlari. Telefon, Telegram va kontakt forma orqali murojaat qiling."
        canonicalPath="/contact"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": ["Dentist", "MedicalBusiness", "LocalBusiness"],
          name: "Magic Denta",
          url: "https://magicdenta.uz/contact",
          logo: "https://magicdenta.uz/logo.png",
          image: "https://magicdenta.uz/logo.png",
          telephone: ["+998912891514", "+998905429303"],
          email: "magicdenta.uz@gmail.com",
          priceRange: "10000 UZS - 1400000 UZS",
          openingHours: "Mo-Su 00:00-23:59",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Bobur shoh koʻchasi, 1B",
            addressLocality: "Toshkent",
            addressRegion: "Toshkent",
            postalCode: "170126",
            addressCountry: "UZ"
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 40.752584,
            longitude: 72.370230
          },
          hasMap: "https://yandex.uz/maps/-/CTgrvSoY",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "43",
            bestRating: "5",
            worstRating: "1"
          },
          sameAs: [
            "https://yandex.uz/maps/-/CTgrvSoY",
            "https://www.instagram.com/magic.denta/",
            "https://www.instagram.com/nodirbek8884/",
            "https://t.me/magicdenta",
            "https://wa.me/998912891514",
            "https://viber.click/998912891514"
          ]
        }}
      />
      <header className="py-12 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <span className="text-xs font-extrabold text-[#B6B09F] uppercase tracking-widest block mb-2">
            Aloqa markazi
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 text-black">
            Biz bilan bog‘laning
          </h1>
          <p className="text-neutral-600 max-w-3xl mx-auto text-sm sm:text-base leading-relaxed">
            Savollaringiz bormi yoki uchrashuv belgilamoqchimisiz? Quyidagi
            shakl orqali bizga yozing yoki to‘g‘ridan-to‘g‘ri klinikamizga tashrif buyuring.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-white rounded-[32px] shadow-sm p-6 sm:p-8 border border-[#EAE4D5]">
          <h2 className="text-2xl font-black text-black mb-6">
            Aloqa ma’lumotlari
          </h2>
          <address className="not-italic text-neutral-700 space-y-4 mb-8">
            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center shrink-0 border border-[#EAE4D5] text-black">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Manzil</span>
                <span className="font-semibold text-neutral-900">
                  Bobur shoh koʻchasi, 1B
                </span>
              </div>
            </div>

            {/* Phone 1 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center shrink-0 border border-[#EAE4D5] text-black">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Telefon / Konsultatsiya</span>
                <a href="tel:+998912891514" className="hover:text-black font-semibold text-neutral-900">
                  +998 (91) 289-15-14
                </a>
              </div>
            </div>

            {/* Phone 2 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center shrink-0 border border-[#EAE4D5] text-black">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Qabulxona & Bog'lanish</span>
                <a href="tel:+998905429303" className="hover:text-black font-semibold text-neutral-900">
                  +998 (90) 542-93-03
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center shrink-0 border border-[#EAE4D5] text-black">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Email</span>
                <a href="mailto:magicdenta.uz@gmail.com" className="hover:text-black font-semibold text-neutral-900 break-all sm:break-normal">
                  magicdenta.uz@gmail.com
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center shrink-0 border border-[#EAE4D5] text-black">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Ish vaqti</span>
                <span className="font-semibold text-neutral-900">24 / 7 xizmat</span>
              </div>
            </div>
          </address>

          {/* Social Channels */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-black mb-3">Biz ijtimoiy tarmoqlarda</h3>
            <div className="flex flex-wrap gap-2.5">
              {/* Telegram */}
              <a
                href="https://t.me/magicdenta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#F2F2F2] hover:bg-[#EAE4D5] text-black transition border border-[#EAE4D5] text-xs font-bold"
                aria-label="Telegram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 4L3 11.5l4 1.5 1.5 4L21 4z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Telegram
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/998912891514&text=%D0%9E%D0%B1%D1%80%D0%B0%D1%89%D0%B5%D0%BD%D0%B8%D0%B5+%D0%B8%D0%B7+%D0%AF%D0%BD%D0%B4%D0%B5%D0%BA%D1%81+%D0%9A%D0%B0%D1%80%D1%82%0A%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21+%D0%9C%D0%B5%D0%BD%D1%8F+%D0%B7%D0%B0%D0%B8%D0%BD%D1%82%D0%B5%D1%80%D0%B5%D1%81%D0%BE%D0%B2%D0%B0%D0%BB%D0%BE+%D0%B2%D0%B0%D1%88%D0%B5+%D0%BF%D1%80%D0%B5%D0%B4%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#F2F2F2] hover:bg-[#EAE4D5] text-black transition border border-[#EAE4D5] text-xs font-bold"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12A9 9 0 1 0 11.1 21L8 22l1.1-3.2A9 9 0 0 0 21 12z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                WhatsApp
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/magic.denta/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#F2F2F2] hover:bg-[#EAE4D5] text-black transition border border-[#EAE4D5] text-xs font-bold"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
                Instagram
              </a>

              {/* Viber */}
              <a
                href="https://viber.click/998912891514"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#F2F2F2] hover:bg-[#EAE4D5] text-black transition border border-[#EAE4D5] text-xs font-bold"
                aria-label="Viber"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 16.5v2a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.86 19.86 0 01-3.07-8.67A2 2 0 014.11 2h2a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0120 16.5z" />
                </svg>
                Viber
              </a>
            </div>
          </div>

          {/* Embedded Yandex Map Widget */}
          <div className="mt-6 rounded-2xl overflow-hidden border border-[#EAE4D5] shadow-sm relative h-[300px]">
            <div style={{ position: "relative", overflow: "hidden" }} className="w-full h-full">
              <a href="https://yandex.uz/maps/org/stomatologiya/216461525511/?utm_medium=mapframe&utm_source=maps" style={{ color: "#eee", fontSize: "12px", position: "absolute", top: "0px" }}>Magic Denta Stomatologiya</a>
              <a href="https://yandex.uz/maps/10329/andijan/category/dental_clinic/184106132/?utm_medium=mapframe&utm_source=maps" style={{ color: "#eee", fontSize: "12px", position: "absolute", top: "14px" }}>Magic Denta Stomatologiya Klinikasi</a>
              <iframe
                src="https://yandex.uz/map-widget/v1/?display-text=Stomatologiya%20klinikasi&ll=72.360238%2C40.749405&mode=search&oid=216461525511&ol=biz&sctx=ZAAAAAgBEAAaKAoSCWtlwi%2F1FlJAEXo57L5jYERAEhIJ0NA%2FwcWKWj8RVvFG5pE%2FSD8iBgABAgMEBSgKOABA2VBIAWI6cmVhcnI9c2NoZW1lX0xvY2FsL0dlb3VwcGVyL0FkdmVydHMvQ3VzdG9tTWF4YWR2L0VuYWJsZWQ9MWI6cmVhcnI9c2NoZW1lX0xvY2FsL0dlb3VwcGVyL0FkdmVydHMvQ3VzdG9tTWF4YWR2L01heGFkdj0xNWJEcmVhcnI9c2NoZW1lX0xvY2FsL0dlb3VwcGVyL0FkdmVydHMvQ3VzdG9tTWF4YWR2L1JlZ2lvbklkcz1bMSwxMDE3NF1iQHJlYXJyPXNjaGVtZV9Mb2NhbC9HZW91cHBlci9BZHZlcnRzL01heGFkdlRvcE1peC9NYXhhZHZGb3JNaXg9MTBqAnV6nQHNzMw9oAEAqAEAvQHwfftYwgEGh4TzsKYGggIbKChjYXRlZ29yeV9pZDooMTg0MTA2MTMyKSkpigIJMTg0MTA2MTMykgIAmgIMZGVza3RvcC1tYXBz&sll=72.360238%2C40.749405&sspn=0.001632%2C0.000745&text=%7B%22text%22%3A%22Stomatologiya%20klinikasi%22%2C%22what%22%3A%5B%7B%22attr_name%22%3A%22category_id%22%2C%22attr_values%22%3A%5B%22184106132%22%5D%7D%5D%7D&z=19.74"
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

        <section className="bg-white rounded-[32px] shadow-sm p-6 sm:p-8 border border-[#EAE4D5]">
          <h2 className="text-2xl font-black text-black mb-6">
            Xabar yuborish
          </h2>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-neutral-800 mb-1.5"
              >
                Ism <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-2xl px-4 py-3.5 border ${
                  errors.name ? "border-red-500" : "border-[#B6B09F]/40"
                } focus:outline-none focus:ring-2 focus:ring-black bg-[#FAF9F7]`}
                placeholder="Ism sharifingizni kiriting"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-red-600 mt-1">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-neutral-800 mb-1.5"
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
                  errors.phone ? "border-red-500" : "border-[#B6B09F]/40"
                } focus:outline-none focus:ring-2 focus:ring-black bg-[#FAF9F7]`}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {errors.phone && (
                <p id="phone-error" className="text-sm text-red-600 mt-1">
                  {errors.phone}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-neutral-800 mb-1.5"
              >
                Elektron pochta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="misol@gmail.com"
                className={`w-full rounded-2xl px-4 py-3.5 border ${
                  errors.email ? "border-red-500" : "border-[#B6B09F]/40"
                } focus:outline-none focus:ring-2 focus:ring-black bg-[#FAF9F7]`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600 mt-1">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-semibold text-neutral-800 mb-1.5"
              >
                Xabar <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                placeholder="Xabaringizni yozing..."
                className={`w-full rounded-2xl px-4 py-3.5 border ${
                  errors.message ? "border-red-500" : "border-[#B6B09F]/40"
                } focus:outline-none focus:ring-2 focus:ring-black bg-[#FAF9F7] resize-none`}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
              />
              {errors.message && (
                <p id="message-error" className="text-sm text-red-600 mt-1">
                  {errors.message}
                </p>
              )}
            </div>
            {status.message && (
              <p
                className={`text-sm font-medium ${
                  status.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {status.message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-full font-extrabold text-white text-base shadow-md transition-all ${
                loading
                  ? "bg-neutral-400 cursor-not-allowed"
                  : "bg-black hover:bg-neutral-800 active:scale-95"
              }`}
            >
              {loading ? "Yuborilmoqda..." : "Xabarni yuborish"}
            </button>
          </form>
        </section>
      </main>
    </>
  );
};

export default Contact;
