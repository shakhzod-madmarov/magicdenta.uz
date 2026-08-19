import { assets } from "../assets/assets";
import { NavLink } from "react-router-dom";
import { useState, useEffect, useContext, useRef } from "react";
import { createPortal } from "react-dom";
import { AppContext } from "../context/AppContext";
import profilePic from "../assets/profile_pic.png";

const Nav = () => {
  const { token, setToken, userData } = useContext(AppContext);
  const [showMenu, setShowMenu] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const lang = localStorage.getItem("language") || "uz";

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const t = {
    uz: {
      home: "Bosh sahifa",
      dentists: "Stomatologlar",
      about: "Biz haqimizda",
      contact: "Aloqa",
      selectLang: "Tilni tanlang:",
      login: "Akkauntga kirish",
      logout: "Akkauntdan chiqish",
      myProfile: "Mening akkauntim",
      myAppointments: "Uchrashuvlarim",
      myTreatments: "Davolash tarixi",
    },
    ru: {
      home: "Главная",
      dentists: "Стоматологи",
      about: "О клинике",
      contact: "Контакты",
      selectLang: "Выберите язык:",
      login: "Войти в аккаунт",
      logout: "Выйти из аккаунта",
      myProfile: "Мой профиль",
      myAppointments: "Мои записи",
      myTreatments: "История лечения",
    },
    en: {
      home: "Home",
      dentists: "Dentists",
      about: "About Us",
      contact: "Contact",
      selectLang: "Choose language:",
      login: "Sign In",
      logout: "Log Out",
      myProfile: "My Profile",
      myAppointments: "My Appointments",
      myTreatments: "Treatment History",
    },
  }[lang] || {
    home: "Bosh sahifa",
    dentists: "Stomatologlar",
    about: "Biz haqimizda",
    contact: "Aloqa",
    selectLang: "Tilni tanlang:",
    login: "Akkauntga kirish",
    logout: "Akkauntdan chiqish",
    myProfile: "Mening akkauntim",
    myAppointments: "Uchrashuvlarim",
    myTreatments: "Davolash tarixi",
  };

  const navItems = [
    { name: t.home, path: "/" },
    { name: t.dentists, path: "/dentists" },
    { name: t.about, path: "/about" },
    { name: t.contact, path: "/contact" },
  ];

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
              className="h-8 sm:h-10 w-auto cursor-pointer object-contain transition-transform group-hover:scale-[1.02]"
              src={assets.logo}
              alt="Magic Denta"
            />
          </NavLink>

          {/* Desktop Nav Pills */}
          <ul className="hidden lg:flex items-center bg-slate-100/90 rounded-full p-1 gap-1 font-medium border border-slate-200/80 shadow-xs">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `rounded-full px-5 py-2 text-xs xl:text-sm font-extrabold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#403D88] to-[#321E48] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
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
                    alt="Akkaunt rasmi"
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = profilePic;
                    }}
                  />
                  <span className="text-xs font-bold text-slate-800 hidden sm:block max-w-[110px] truncate">
                    {userData?.name?.split(" ")[0] || "Akkaunt"}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                      profileOpen ? "rotate-180 text-slate-900" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Container with seamless invisible hover bridge */}
                <div
                  className={`absolute right-0 top-full pt-2 w-56 z-50 transition-all duration-150 origin-top-right ${
                    profileOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <ul className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl py-2 overflow-hidden">
                    <NavLink to="/myprofile" onClick={() => setProfileOpen(false)}>
                      <li className="px-4 py-2.5 hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center gap-2.5 transition-colors">
                        <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {t.myProfile}
                      </li>
                    </NavLink>
                    <NavLink to="/myappointments" onClick={() => setProfileOpen(false)}>
                      <li className="px-4 py-2.5 hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center gap-2.5 transition-colors">
                        <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {t.myAppointments}
                      </li>
                    </NavLink>
                    <NavLink to="/my-treatments" onClick={() => setProfileOpen(false)}>
                      <li className="px-4 py-2.5 hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center gap-2.5 transition-colors">
                        <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        {t.myTreatments}
                      </li>
                    </NavLink>
                    <div className="h-px bg-slate-100 mx-3 my-1" />
                    <li
                      className="px-4 py-2.5 hover:bg-red-50 text-xs font-bold text-red-600 cursor-pointer flex items-center gap-2.5 transition-colors"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      {t.logout}
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <NavLink to="/login">
                <button className="bg-gradient-to-r from-[#92003A] to-[#91008D] text-white text-xs font-black px-6 py-2.5 rounded-full hover:shadow-glow-wine active:scale-95 transition-all shadow-md cursor-pointer tracking-wide">
                  {t.login}
                </button>
              </NavLink>
            )}
          </div>

          {/* Mobile menu trigger + compact user avatar */}
          <div className="flex items-center gap-2 md:hidden">
            {token && (
              <NavLink
                to="/myprofile"
                className="flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 active:scale-95 transition"
                title={t.myProfile}
              >
                <img
                  src={
                    userData?.image
                      ? String(userData.image).startsWith("blob:")
                        ? userData.image
                        : `${import.meta.env.VITE_BACKEND_URL}${userData.image}`
                      : profilePic
                  }
                  alt="Akkaunt rasmi"
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  onError={(e) => {
                    e.currentTarget.src = profilePic;
                  }}
                />
                <span className="text-[11px] font-bold text-slate-800 max-w-[70px] truncate">
                  {userData?.name?.split(" ")[0] || "Profil"}
                </span>
              </NavLink>
            )}

            <button
              onClick={() => setShowMenu(true)}
              className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-200 active:scale-95 transition"
              aria-label="Menyuni ochish"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen Mobile Drawer using React Portal (100% Solid Pure White, No Background Bleeding) */}
      {showMenu &&
        createPortal(
          <div
            id="mobile-nav-portal"
            style={{ backgroundColor: "#ffffff", opacity: 1, zIndex: 999999 }}
            className="fixed inset-0 w-screen h-screen bg-white text-slate-900 flex flex-col justify-between p-6 sm:p-8 lg:hidden overflow-y-auto"
          >
            {/* Header & Main Nav */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <img src={assets.logo} alt="Magic Denta" className="h-8 sm:h-9 w-auto object-contain" />
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center hover:bg-slate-200 transition cursor-pointer"
                  aria-label="Menyuni yopish"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Logged in User Badge */}
              {token && (
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center gap-3.5 shadow-md">
                  <img
                    src={
                      userData?.image
                        ? String(userData.image).startsWith("blob:")
                          ? userData.image
                          : `${import.meta.env.VITE_BACKEND_URL}${userData.image}`
                        : profilePic
                    }
                    alt="Akkaunt rasmi"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = profilePic;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-sm text-white truncate">
                      {userData?.name || "Bemor"}
                    </h4>
                    <span className="text-xs text-slate-300 block truncate">
                      {userData?.phone || "Magic Denta Bemor Akkaunti"}
                    </span>
                  </div>
                </div>
              )}

              {/* Nav Links */}
              <ul className="flex flex-col gap-2 mt-4">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => setShowMenu(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-[#403D88] to-[#321E48] text-white shadow-md"
                            : "text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/60"
                        }`
                      }
                    >
                      <span>{item.name}</span>
                      <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </NavLink>
                  </li>
                ))}
              </ul>

              {/* Dedicated Mobile Patient Cabinet Links */}
              {token && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                    Shaxsiy kabinet
                  </span>
                  <ul className="flex flex-col gap-2">
                    <li>
                      <NavLink
                        to="/myprofile"
                        onClick={() => setShowMenu(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                            isActive
                              ? "bg-primary text-white shadow-sm"
                              : "text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-100"
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          <span>{t.myProfile}</span>
                        </div>
                        <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/myappointments"
                        onClick={() => setShowMenu(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                            isActive
                              ? "bg-primary text-white shadow-sm"
                              : "text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-100"
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span>{t.myAppointments}</span>
                        </div>
                        <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/my-treatments"
                        onClick={() => setShowMenu(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                            isActive
                              ? "bg-primary text-white shadow-sm"
                              : "text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-100"
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          <span>{t.myTreatments}</span>
                        </div>
                        <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </NavLink>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom Actions in Drawer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3 mt-4">
              <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-700">{t.selectLang}</span>
                <select
                  value={lang}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    localStorage.setItem("language", newLang);
                    localStorage.setItem("medinson.desktop.language", newLang);
                    localStorage.setItem("medinson:language", newLang);
                    window.location.reload();
                  }}
                  className="bg-white text-slate-900 text-xs font-bold rounded-xl px-3 py-1.5 outline-none border border-slate-200 cursor-pointer"
                >
                  <option value="uz">O'zbekcha (UZ)</option>
                  <option value="ru">Русский (RU)</option>
                  <option value="en">English (EN)</option>
                </select>
              </div>

              {token ? (
                <button
                  onClick={() => {
                    logout();
                    setShowMenu(false);
                  }}
                  className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-2xl text-center text-sm hover:bg-red-100 flex items-center justify-center gap-2 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  <span>{t.logout}</span>
                </button>
              ) : (
                <NavLink to="/login" onClick={() => setShowMenu(false)}>
                  <button className="w-full py-3.5 bg-slate-900 hover:bg-brandPlum text-white font-bold rounded-2xl text-center text-sm shadow-md transition">
                    {t.login}
                  </button>
                </NavLink>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Nav;
