import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="w-full bg-[#0F3040] text-white pt-14 pb-8 px-4 sm:px-6 lg:px-8 border-t border-[#403D88]/40 shadow-2xl mt-16 overflow-hidden relative">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#403D88]/15 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-[#92003A]/15 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 relative z-10 text-left">
        
        {/* Col 1: Brand & Positioning (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Link to="/" className="inline-block" aria-label="Magic Denta bosh sahifaga qaytish">
            <img
              src={assets.logo_white || assets.logo}
              alt="Magic Denta"
              width="160"
              height="48"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </Link>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-sm">
            Magic Denta — zamonaviy stomatologiya va ortopediya markazi. Zamonaviy ortodontiya, estetik vinirlar, sirkoniy qoplamalar va og‘riqsiz xavfsiz davolash.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/[0.08] text-slate-200 border border-white/15 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#91008D] animate-pulse" aria-hidden="true" />
              Dush – Shanba: 08:00 – 20:00
            </span>
          </div>
        </div>

        {/* Col 2: Services / Mutaxassisliklar (3 cols) */}
        <nav aria-label="Klinik xizmatlar" className="lg:col-span-3 space-y-3">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">
            Klinik xizmatlar
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300 font-medium">
            <li>
              <Link to="/services/ortodontiya" className="hover:text-white hover:underline transition">
                Ortodontiya & Breketlar
              </Link>
            </li>
            <li>
              <Link to="/services/terapevtik-stomatologiya" className="hover:text-white hover:underline transition">
                Terapevtik stomatologiya
              </Link>
            </li>
            <li>
              <Link to="/services/ortopedik-stomatologiya" className="hover:text-white hover:underline transition">
                Ortopediya & Sirkoniy
              </Link>
            </li>
            <li>
              <Link to="/services/estetik-stomatologiya" className="hover:text-white hover:underline transition">
                Estetik vinirlar
              </Link>
            </li>
            <li>
              <Link to="/services/jarrohlik-stomatologiyasi" className="hover:text-white hover:underline transition">
                Stomatologiya jarrohligi
              </Link>
            </li>
          </ul>
        </nav>

        {/* Col 3: Navigation / Tezkor havolalar (2 cols) */}
        <nav aria-label="Tezkor sahifalar" className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">
            Tezkor sahifalar
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300 font-medium">
            <li>
              <Link to="/" className="hover:text-white hover:underline transition">
                Bosh sahifa
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-white hover:underline transition">
                Barcha xizmatlar
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white hover:underline transition">
                Biz haqimizda
              </Link>
            </li>
            <li>
              <Link to="/appointment" className="hover:text-white hover:underline transition text-emerald-300 font-bold">
                Qabulga yozilish
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white hover:underline transition">
                Aloqa & Manzil
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white hover:underline transition">
                Shaxsiy kabinet
              </Link>
            </li>
          </ul>
        </nav>

        {/* Col 4: Direct Contacts & Socials (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">
            Aloqa & Manzil
          </h3>
          <address className="not-italic space-y-2.5 text-xs sm:text-sm text-slate-300">
            <a
              href="https://yandex.uz/maps/-/CTsybHos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition"
              title="Yandex Xaritada ko‘rish"
            >
              <svg className="w-4 h-4 text-[#91008D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Bobur shoh koʻchasi, 1B</span>
            </a>

            <a
              href="tel:+998912891514"
              className="flex items-center gap-2 font-bold text-white hover:text-[#91008D] transition"
            >
              <svg className="w-4 h-4 text-[#91008D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+998 (91) 289-15-14</span>
            </a>

            <a
              href="tel:+998905429303"
              className="flex items-center gap-2 font-bold text-white hover:text-[#91008D] transition"
            >
              <svg className="w-4 h-4 text-[#91008D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+998 (90) 542-93-03</span>
            </a>

            <a
              href="mailto:magicdenta.uz@gmail.com"
              className="flex items-center gap-2 text-slate-300 hover:text-white transition break-all"
            >
              <svg className="w-4 h-4 text-[#91008D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>magicdenta.uz@gmail.com</span>
            </a>
          </address>

          {/* Social icons row */}
          <div className="flex items-center gap-2 pt-2">
            <a
              href="https://t.me/+998912891514"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Magic Denta Telegram kanali"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] text-white hover:bg-[#24A1DE] transition text-xs font-bold border border-white/10"
              title="Telegram"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M21 4L3 11.5l4 1.5 1.5 4L21 4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Telegram</span>
            </a>

            <a
              href="https://www.instagram.com/magic.denta/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Magic Denta Instagram sahifasi"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] text-white hover:bg-gradient-to-tr hover:from-[#92003A] hover:to-[#91008D] transition text-xs font-bold border border-white/10"
              title="Instagram"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
                <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
              </svg>
              <span>Instagram</span>
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10 text-xs text-slate-400">
        <div>
          © {new Date().getFullYear()} Magic Denta. Barcha huquqlar himoyalangan.
        </div>
        <nav aria-label="Quyi havolalar" className="flex items-center gap-6">
          <Link to="/services" className="hover:text-slate-200 transition">Xizmatlar</Link>
          <Link to="/about" className="hover:text-slate-200 transition">Biz haqimizda</Link>
          <Link to="/contact" className="hover:text-slate-200 transition">Aloqa</Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
