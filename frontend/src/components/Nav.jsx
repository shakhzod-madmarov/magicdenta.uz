import { assets, specialityData } from "../assets/assets";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useContext, useRef } from "react";
import { createPortal } from "react-dom";
import { AppContext } from "../context/AppContext";
import profilePic from "../assets/profile_pic.png";

const Nav = () => {
  const { token, setToken, userData } = useContext(AppContext);
  const [showMenu, setShowMenu] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const servicesRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const lang = localStorage.getItem("language") || "uz";

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
  };

  const handleServicesEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setServicesOpen(true);
  };

  const handleServicesLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setServicesOpen(false);
    }, 250);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const t = {
    uz: {
      home: "Bosh sahifa",
      services: "Xizmatlar",
      dentists: "Stomatologlar",
      about: "Biz haqimizda",
      contact: "Aloqa",
      selectLang: "Tilni tanlang:",
      login: "Akkauntga kirish",
      logout: "Akkauntdan chiqish",
      myProfile: "Mening akkauntim",
      myAppointments: "Uchrashuvlarim",
      myTreatments: "Davolash tarixi",
      allServices: "Barcha 5 ta yo‘nalish",
    },
    ru: {
      home: "Главная",
      services: "Услуги",
      dentists: "Стоматологи",
      about: "О клинике",
      contact: "Контакты",
      selectLang: "Выберите язык:",
      login: "Войти в аккаунт",
      logout: "Выйти из аккаунта",
      myProfile: "Мой профиль",
      myAppointments: "Мои записи",
      myTreatments: "История лечения",
      allServices: "Все 5 направлений",
    },
    en: {
      home: "Home",
      services: "Specialties",
      dentists: "Dentists",
      about: "About Us",
      contact: "Contact",
      selectLang: "Choose language:",
      login: "Sign In",
      logout: "Log Out",
      myProfile: "My Profile",
      myAppointments: "My Appointments",
      myTreatments: "Treatment History",
      allServices: "All 5 Specialties",
    },
  }[lang] || {
    home: "Bosh sahifa",
    services: "Xizmatlar",
    dentists: "Stomatologlar",
    about: "Biz haqimizda",
    contact: "Aloqa",
    selectLang: "Tilni tanlang:",
    login: "Akkauntga kirish",
    logout: "Akkauntdan chiqish",
    myProfile: "Mening akkauntim",
    myAppointments: "Uchrashuvlarim",
    myTreatments: "Davolash tarixi",
    allServices: "Barcha 5 ta yo‘nalish",
  };

  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMenu]);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3 sm:py-3.5">
          {/* Brand Logo */}
          <NavLink to="/" className="flex items-center gap-2 group shrink-0">
            <img
              className="h-10 sm:h-12 md:h-14 w-auto cursor-pointer object-contain transition-transform group-hover:scale-[1.02]"
              src={assets.logo}
              alt="Magic Denta"
            />
          </NavLink>

          {/* Desktop Nav Pills */}
          <ul className="hidden lg:flex items-center bg-slate-100/90 rounded-full p-1 gap-1 font-medium border border-slate-200/80 shadow-xs">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `rounded-full px-5 py-2 text-xs xl:text-sm font-extrabold transition-all duration-200 block ${
                    isActive
                      ? "bg-gradient-to-r from-[#403D88] to-[#321E48] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`
                }
              >
                {t.home}
              </NavLink>
            </li>

            {/* Specialties Dropdown with Seamless Bridge */}
            <li
              ref={servicesRef}
              className="relative"
              onMouseEnter={handleServicesEnter}
              onMouseLeave={handleServicesLeave}
            >
              <button
                type="button"
                onClick={() => setServicesOpen((p) => !p)}
                className={`rounded-full px-5 py-2 text-xs xl:text-sm font-extrabold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  servicesOpen
                    ? "bg-white text-[#0F3040] shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                <span>{t.services}</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    servicesOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Contiguous dropdown container with pt-2 to bridge the hover gap */}
              {servicesOpen && (
                <div
                  onMouseEnter={handleServicesEnter}
                  onMouseLeave={handleServicesLeave}
                  className="absolute top-full left-0 pt-2 w-80 z-50 animate-fadeIn"
                >
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-3 text-left">
                    <span className="text-[10px] font-black text-[#403D88] uppercase tracking-wider px-3 py-1.5 block">
                      {t.allServices}
                    </span>
                    <div className="space-y-1 mt-1">
                      {specialityData.map((item, index) => (
                        <Link
                          key={index}
                          to={`/services/${item.slug || "ortodontiya"}`}
                          onClick={() => setServicesOpen(false)}
                          className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F3040] to-[#321E48] flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#0F3040] group-hover:text-[#92003A] transition-colors block">
                              {item.displayName?.[lang] || item.speciality}
                            </span>
                            <span className="text-[10px] text-slate-600 block">
                              {item.badge?.[lang] || "MUTAXASSISLIK"}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <Link
                        to="/services"
                        onClick={() => setServicesOpen(false)}
                        className="block w-full py-2 text-center text-xs font-extrabold text-[#403D88] hover:text-[#92003A] bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                      >
                        Barcha 5 ta xizmat sahifasi →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </li>

            <li>
              <NavLink
                to="/dentists"
                className={({ isActive }) =>
                  `rounded-full px-5 py-2 text-xs xl:text-sm font-extrabold transition-all duration-200 block ${
                    isActive
                      ? "bg-gradient-to-r from-[#403D88] to-[#321E48] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`
                }
              >
                {t.dentists}
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `rounded-full px-5 py-2 text-xs xl:text-sm font-extrabold transition-all duration-200 block ${
                    isActive
                      ? "bg-gradient-to-r from-[#403D88] to-[#321E48] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`
                }
              >
                {t.about}
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `rounded-full px-5 py-2 text-xs xl:text-sm font-extrabold transition-all duration-200 block ${
                    isActive
                      ? "bg-gradient-to-r from-[#403D88] to-[#321E48] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`
                }
              >
                {t.contact}
              </NavLink>
            </li>
          </ul>

          {/* Desktop Right Group: Language + Account Button */}
          <div className="hidden md:flex items-center gap-3">
            <select
              value={lang}
              onChange={(e) => {
                const newLang = e.target.value;
                localStorage.setItem("language", newLang);
                localStorage.setItem("medinson.desktop.language", newLang);
                localStorage.setItem("medinson:language", newLang);
                window.location.reload();
              }}
              className="bg-slate-100 text-slate-800 text-xs font-bold rounded-full px-3.5 py-2 outline-none border border-slate-200/80 cursor-pointer hover:bg-slate-200/70 transition"
              aria-label="Tilni tanlash"
            >
              <option value="uz">UZ</option>
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>

            {token ? (
              <div
                ref={profileRef}
                className="relative"
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 pl-1.5 pr-3.5 py-1 rounded-full bg-white border border-slate-200 hover:border-slate-400 hover:shadow transition-all cursor-pointer select-none"
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                >
                  <img
                    src={
                      userData?.image
                        ? String(userData.image).startsWith("blob:")
                          ? userData.image
                          : `${import.meta.env.VITE_BACKEND_URL}${userData.image}`
                        : profilePic
                    }
                    alt={userData?.name || "Profil"}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = profilePic;
                    }}
                  />
                  <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                    {userData?.name || "Akkaunt"}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-left animate-fadeIn">
                    <Link
                      to="/myprofile"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#403D88]"
                    >
                      {t.myProfile}
                    </Link>
                    <Link
                      to="/myappointments"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#403D88]"
                    >
                      {t.myAppointments}
                    </Link>
                    <Link
                      to="/my-treatments"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#403D88]"
                    >
                      {t.myTreatments}
                    </Link>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      {t.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <span>{t.login}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <select
              value={lang}
              onChange={(e) => {
                const newLang = e.target.value;
                localStorage.setItem("language", newLang);
                localStorage.setItem("medinson.desktop.language", newLang);
                localStorage.setItem("medinson:language", newLang);
                window.location.reload();
              }}
              className="bg-slate-100 text-slate-800 text-xs font-bold rounded-full px-2.5 py-1.5 outline-none border border-slate-200"
            >
              <option value="uz">UZ</option>
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>

            <button
              type="button"
              onClick={() => setShowMenu(true)}
              className="p-2 rounded-xl bg-slate-100 text-slate-800"
              aria-label="Menyu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {showMenu &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
            <div className="w-[85%] max-w-sm bg-white h-full p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <img src={assets.logo} alt="Magic Denta" className="h-10 w-auto" />
                  <button
                    type="button"
                    onClick={() => setShowMenu(false)}
                    className="p-2 rounded-full bg-slate-100 text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <ul className="space-y-3 mt-6 text-left">
                  <li>
                    <NavLink
                      to="/"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-3 rounded-2xl text-sm font-bold text-slate-800 hover:bg-slate-100"
                    >
                      {t.home}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/dentists"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-3 rounded-2xl text-sm font-bold text-slate-800 hover:bg-slate-100"
                    >
                      {t.dentists}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/about"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-3 rounded-2xl text-sm font-bold text-slate-800 hover:bg-slate-100"
                    >
                      {t.about}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/contact"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-3 rounded-2xl text-sm font-bold text-slate-800 hover:bg-slate-100"
                    >
                      {t.contact}
                    </NavLink>
                  </li>
                </ul>

                <div className="mt-6 pt-4 border-t border-slate-100 text-left">
                  <span className="text-[10px] font-black text-[#403D88] uppercase tracking-wider block mb-2">
                    5 TA ASOSIY MUTAXASSISLIK
                  </span>
                  <div className="space-y-1.5">
                    {specialityData.map((item, idx) => (
                      <Link
                        key={idx}
                        to={`/services/${item.slug || "ortodontiya"}`}
                        onClick={() => setShowMenu(false)}
                        className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        • {item.displayName?.[lang] || item.speciality}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                {token ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      logout();
                    }}
                    className="w-full py-3 bg-red-50 text-red-600 font-bold text-xs rounded-xl"
                  >
                    {t.logout}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      navigate("/login");
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-[#92003A] to-[#91008D] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md"
                  >
                    {t.login}
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Nav;
