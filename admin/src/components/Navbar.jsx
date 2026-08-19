import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { DentistContext } from "../context/DentistContext";

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { dToken, logoutDentist } = useContext(DentistContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const role = aToken ? "Admin" : dToken ? "Stomatolog" : null;

  const logout = () => {
    if (aToken) {
      setAToken("");
      localStorage.removeItem("aToken");
      navigate("/admin-login");
    } else if (dToken) {
      logoutDentist();
      navigate("/admin-login");
    }
  };

  const links = aToken
    ? [
        { to: "/admin-dashboard", label: "Boshqaruv" },
        { to: "/all-appointments", label: "Uchrashuvlar" },
        { to: "/treatments", label: "To‘lovlar" },
        { to: "/all-dentists", label: "Stomatologlar" },
        { to: "/admin-patients", label: "Bemorlar" },
        { to: "/admin-settings", label: "Sozlamalar" },
      ]
    : [
        { to: "/dentist-dashboard", label: "Boshqaruv" },
        { to: "/dentist-appointments", label: "Uchrashuvlar" },
        { to: "/dentist-templates", label: "Shablonlar" },
        { to: "/dentist-patients", label: "Bemorlar" },
        { to: "/dentist-finance", label: "Hisob-kitob" },
        { to: "/dentist-warehouse", label: "Omborxona" },
        { to: "/dentist-profile", label: "Mening hisobim" },
      ];

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
        <div className="flex items-center gap-2">
          <img
            src={assets.logo}
            alt="Magic Denta"
            className="h-10 w-auto object-contain"
          />
        </div>
        <ul className="hidden md:flex items-center gap-3">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? "bg-gradient-to-r from-[#403D88] to-[#321E48] text-white shadow-xs font-bold"
                      : "text-gray-600 hover:text-primary hover:bg-gray-50"
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <select
            value={localStorage.getItem("language") || "uz"}
            onChange={(e) => {
              const lang = e.target.value;
              localStorage.setItem("language", lang);
              localStorage.setItem("medinson.desktop.language", lang);
              localStorage.setItem("medinson:language", lang);
              window.location.reload();
            }}
            className="bg-gray-100 text-gray-800 text-xs sm:text-sm font-medium rounded-full px-2.5 py-1.5 outline-none border border-gray-200 cursor-pointer"
          >
            <option value="uz" className="text-black">UZ</option>
            <option value="ru" className="text-black">RU</option>
            <option value="en" className="text-black">EN</option>
          </select>
          <p className="text-gray-700 text-xs sm:text-sm font-medium bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
            {role}
          </p>
          <button
            onClick={logout}
            className="hidden md:inline-block bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white font-bold text-xs sm:text-sm px-5 py-2 rounded-full shadow transition"
          >
            Chiqish
          </button>
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="md:hidden bg-gray-100 text-gray-700 p-2 rounded-md border hover:bg-gray-200"
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </nav>
      {menuOpen && (
        <section className="md:hidden bg-white shadow-lg border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block w-full px-4 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="mt-2 w-full bg-primary text-white px-4 py-2 rounded-md font-semibold text-sm"
            >
              Chiqish
            </button>
          </div>
        </section>
      )}
    </header>
  );
};

export default Navbar;
