import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="w-full bg-[#0F3040] text-white pt-16 pb-10 px-4 sm:px-6 md:px-16 lg:px-24 border-t border-[#403D88]/40 shadow-2xl mt-20 overflow-hidden relative">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#403D88]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-[#92003A]/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
        {/* Col 1: Brand Info */}
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-2">
            <img
              src={assets.logo_white || assets.logo}
              alt="Magic Denta"
              className="h-12 sm:h-16 w-auto object-contain"
            />
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Magic Denta — Zamonaviy stomatologiya klinikasi. Specializing in Dental Orthopedics. Yuqori sifatli tish davolash, ortodontiya, sirkoniy qoplamalar va estetik xizmatlar.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/[0.08] text-slate-200 border border-white/15 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#91008D] animate-pulse" />
              Dush – Shanba: 08:00 – 20:00 (Yakshanba: Dam olish)
            </span>
          </div>
        </div>

        {/* Col 2: Contact */}
        <div className="text-left">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
            Biz bilan bog‘lanish
          </h3>
          <div className="flex flex-col gap-3 text-slate-300 text-sm">
            <a
              href="https://yandex.uz/maps/-/CTsybHos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-300 hover:text-white transition leading-relaxed flex items-center gap-2"
              title="Yandex Xaritada ko‘rish (40.749296, 72.360242)"
            >
              <svg className="w-4 h-4 text-[#91008D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Bobur shoh koʻchasi, 1B</span>
            </a>
            <a
              href="tel:+998912891514"
              className="font-bold text-white hover:text-[#91008D] transition flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-[#91008D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +998 (91) 289-15-14
            </a>
            <a
              href="tel:+998905429303"
              className="font-bold text-white hover:text-[#91008D] transition flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-[#91008D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +998 (90) 542-93-03
            </a>
            <a
              href="mailto:magicdenta.uz@gmail.com"
              className="text-slate-300 hover:text-white font-medium transition break-all flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-[#91008D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              magicdenta.uz@gmail.com
            </a>
          </div>
        </div>

        {/* Col 3: Navigation */}
        <div className="text-left">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
            Tezkor havolalar
          </h3>
          <ul className="space-y-2.5 text-slate-300 text-sm font-medium">
            <li>
              <Link to="/" className="hover:text-white transition">
                Bosh sahifa
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition">
                Biz haqimizda
              </Link>
            </li>
            <li>
              <Link to="/dentists" className="hover:text-white transition">
                Stomatologlar
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition">
                Aloqa & Xarita
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white transition">
                Kirish / Ro‘yxatdan o‘tish
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Map */}
        <div className="text-left">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
            Bizning manzil
          </h3>
          <div className="w-full h-36 rounded-2xl overflow-hidden shadow-md border border-white/15 relative">
            <div style={{ position: "relative", overflow: "hidden" }} className="w-full h-full">
              <a href="https://yandex.uz/maps/org/stomatologiya/216461525511/?utm_medium=mapframe&utm_source=maps" style={{ color: "#eee", fontSize: "12px", position: "absolute", top: "0px" }}>Magic Denta Stomatologiya</a>
              <iframe
                src="https://yandex.uz/map-widget/v1/?display-text=Stomatologiya%20klinikasi&ll=72.360238%2C40.749405&mode=search&oid=216461525511&ol=biz&z=17"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen={true}
                style={{ position: "relative" }}
                title="Magic Denta Xarita"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-14 pt-8 border-t border-white/10 flex flex-col-reverse md:flex-row items-center justify-between gap-4 relative z-10">
        <div className="text-slate-400 text-xs sm:text-sm text-center md:text-left">
          © {new Date().getFullYear()} Magic Denta. Barcha huquqlar himoyalangan.
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
          {/* Telegram */}
          <a
            href="https://t.me/+998912891514"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="inline-flex items-center p-3 rounded-full bg-white/[0.06] text-white hover:bg-[#24A1DE] hover:text-white border border-white/10 transition shadow-sm"
            title="Telegram"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 4L3 11.5l4 1.5 1.5 4L21 4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/998912891514"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="inline-flex items-center p-3 rounded-full bg-white/[0.06] text-white hover:bg-[#25D366] hover:text-white border border-white/10 transition shadow-sm"
            title="WhatsApp"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 12A9 9 0 1 0 11.1 21L8 22l1.1-3.2A9 9 0 0 0 21 12z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/magic.denta/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="inline-flex items-center p-3 rounded-full bg-white/[0.06] text-white hover:bg-gradient-to-tr hover:from-[#92003A] hover:to-[#91008D] hover:text-white border border-white/10 transition shadow-sm"
            title="Instagram"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="2" />
              <circle cx="12" cy="12" r="3" strokeWidth="2" />
              <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
