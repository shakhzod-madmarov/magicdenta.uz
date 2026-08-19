import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="w-full bg-white text-slate-900 pt-14 pb-8 px-4 sm:px-6 md:px-16 lg:px-24 border-t border-slate-200 shadow-sm mt-12 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Col 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <img
              src={assets.logo}
              alt="Magic Denta"
              className="h-11 w-auto object-contain"
            />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Magic Denta — Zamonaviy stomatologiya klinikasi. Specializing in Dental Orthopedics. Yuqori sifatli tish davolash, ortodontiya, implantologiya va estetik xizmatlar.
          </p>
          <div className="pt-1">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 shadow-sm">
              24 / 7 Qabul & Konsultatsiya
            </span>
          </div>
        </div>

        {/* Col 2: Contact */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Biz bilan bog‘lanish
          </h3>
          <div className="flex flex-col gap-2.5 text-slate-600 text-sm">
            <a
              href="https://yandex.uz/maps/-/CTsybHos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-slate-900 transition leading-relaxed flex items-center gap-1.5"
              title="Yandex Xaritada ko‘rish (40.749296, 72.360242)"
            >
              <span>Bobur shoh koʻchasi, 1B</span>
            </a>
            <a
              href="tel:+998912891514"
              className="font-bold text-slate-900 hover:text-black transition"
            >
              +998 (91) 289-15-14
            </a>
            <a
              href="tel:+998905429303"
              className="font-bold text-slate-900 hover:text-black transition"
            >
              +998 (90) 542-93-03
            </a>
            <a
              href="mailto:magicdenta.uz@gmail.com"
              className="text-slate-800 hover:text-black font-semibold transition break-all"
            >
              magicdenta.uz@gmail.com
            </a>
          </div>
        </div>

        {/* Col 3: Navigation */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Tezkor havolalar
          </h3>
          <ul className="space-y-2.5 text-slate-600 text-sm font-medium">
            <li>
              <Link to="/" className="hover:text-slate-900 transition">
                Bosh sahifa
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-slate-900 transition">
                Biz haqimizda
              </Link>
            </li>
            <li>
              <Link to="/dentists" className="hover:text-slate-900 transition">
                Stomatologlar
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-slate-900 transition">
                Aloqa & Xarita
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-slate-900 transition">
                Kirish / Ro‘yxatdan o‘tish
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Map */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Bizning manzil
          </h3>
          <div className="w-full h-36 rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative">
            <div style={{ position: "relative", overflow: "hidden" }} className="w-full h-full">
              <a href="https://yandex.uz/maps/org/mega_dental_house_mchj/60243631862/?utm_medium=mapframe&utm_source=maps" style={{ color: "#eee", fontSize: "12px", position: "absolute", top: "0px" }}>Magic Denta Мчж</a>
              <iframe
                src="https://yandex.uz/map-widget/v1/?ll=72.370247%2C40.752538&mode=search&oid=60243631862&ol=biz&z=16.63"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen={true}
                style={{ position: "relative" }}
                title="Magic Denta Yandex Map Footer"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-200 flex flex-col-reverse md:flex-row items-center justify-between gap-4">
        <div className="text-slate-500 text-xs sm:text-sm text-center md:text-left">
          © {new Date().getFullYear()} Magic Denta. Barcha huquqlar himoyalangan.
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
          {/* Telegram */}
          <a
            href="https://t.me/magicdenta"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="inline-flex items-center p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-[#24A1DE] hover:text-white border border-slate-200 transition shadow-sm"
            title="Telegram"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                d="M21 4L3 11.5l4 1.5 1.5 4L21 4z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/998912891514&text=%D0%9E%D0%B1%D1%80%D0%B0%D1%89%D0%B5%D0%BD%D0%B8%D0%B5+%D0%B8%D0%B7+%D0%AF%D0%BD%D0%B4%D0%B5%D0%BA%D1%81+%D0%9A%D0%B0%D1%80%D1%82%0A%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21+%D0%9C%D0%B5%D0%BD%D1%8F+%D0%B7%D0%B0%D0%B8%D0%BD%D1%82%D0%B5%D1%80%D0%B5%D1%81%D0%BE%D0%B2%D0%B0%D0%BB%D0%BE+%D0%B2%D0%B0%D1%88%D0%B5+%D0%BF%D1%80%D0%B5%D0%B4%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="inline-flex items-center p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-[#25D366] hover:text-white border border-slate-200 transition shadow-sm"
            title="WhatsApp"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                d="M21 12A9 9 0 1 0 11.1 21L8 22l1.1-3.2A9 9 0 0 0 21 12z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/magic.denta/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="inline-flex items-center p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-pink-600 hover:text-white border border-slate-200 transition shadow-sm"
            title="Instagram"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                strokeWidth="1.5"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                strokeWidth="1.5"
              />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
            </svg>
          </a>

          {/* Viber */}
          <a
            href="https://viber.click/998912891514"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Viber"
            className="inline-flex items-center p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-purple-600 hover:text-white border border-slate-200 transition shadow-sm"
            title="Viber"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 16.5v2a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.86 19.86 0 01-3.07-8.67A2 2 0 014.11 2h2a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0120 16.5z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
