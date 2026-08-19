import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import eyesClosed from "../assets/login/eyes-closed.png";
import eyesOpened from "../assets/login/eyes-opened.png";
import { AdminContext } from "../context/AdminContext.jsx";
import { DentistContext } from "../context/DentistContext.jsx";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const AdminDentistLogin = () => {
  const [role, setRole] = useState("Admin"); // "Admin" | "Stomatolog"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { backendUrl, setAToken } = useContext(AdminContext);
  const { setDToken } = useContext(DentistContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Iltimos, barcha maydonlarni to‘ldiring");
      return;
    }

    setSubmitting(true);
    try {
      if (role === "Admin") {
        const { data } = await axios.post(`${backendUrl}/api/admin/login`, {
          email: email.trim(),
          password,
        });

        if (data.success) {
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
          toast.success("Admin boshqaruv tizimiga xush kelibsiz!");
          navigate("/admin-dashboard");
        } else {
          toast.error(data.message || "Kirishda xatolik yuz berdi");
        }
      }

      if (role === "Stomatolog") {
        const { data } = await axios.post(`${backendUrl}/api/dentist/login`, {
          email: email.trim(),
          password,
        });

        if (data.success) {
          localStorage.setItem("dToken", data.token);
          setDToken(data.token);
          toast.success("Shifokor kabinetiga xush kelibsiz!");
          navigate("/dentist-dashboard");
        } else {
          toast.error(data.message || "Kirishda xatolik yuz berdi");
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Server bilan bog‘lanishda xatolik yuz berdi",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0F3040] via-[#1F1732] to-[#321E48] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient glow orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#403D88]/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#92003A]/25 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-white rounded-[36px] shadow-2xl border border-white/20 p-8 sm:p-10 text-center">
          
          {/* Clinic Logo */}
          <div className="flex justify-center mb-6">
            <img
              src={assets.logo}
              alt="Magic Denta"
              className="h-11 sm:h-12 w-auto object-contain"
            />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-black text-[#0F3040] tracking-tight mb-1">
            Boshqaruv Tizimi
          </h1>
          <p className="text-xs text-slate-500 mb-6 font-medium">
            Magic Denta klinikasi xodimlari uchun maxsus portal
          </p>

          {/* Role Switcher Pill Bar */}
          <div className="flex bg-slate-100 p-1.5 rounded-full mb-6 border border-slate-200/80 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setRole("Admin");
                setEmail("");
                setPassword("");
              }}
              className={`flex-1 py-2.5 rounded-full text-xs font-black transition-all duration-200 cursor-pointer ${
                role === "Admin"
                  ? "bg-gradient-to-r from-[#403D88] to-[#321E48] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Klinika Admini
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("Stomatolog");
                setEmail("");
                setPassword("");
              }}
              className={`flex-1 py-2.5 rounded-full text-xs font-black transition-all duration-200 cursor-pointer ${
                role === "Stomatolog"
                  ? "bg-gradient-to-r from-[#403D88] to-[#321E48] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Stomatolog
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Elektron pochta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder={role === "Admin" ? "admin@magicdenta.uz" : "shifokor@magicdenta.uz"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#403D88] focus:ring-4 focus:ring-[#403D88]/10 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Parol
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-12 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#403D88] focus:ring-4 focus:ring-[#403D88]/10 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition"
                  aria-label={showPassword ? "Parolni yashirish" : "Parolni ko‘rsatish"}
                >
                  <img
                    src={showPassword ? eyesOpened : eyesClosed}
                    alt=""
                    className="w-5 h-5 object-contain opacity-70 hover:opacity-100 transition-opacity"
                  />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer mt-2"
            >
              {submitting ? "Tekshirilmoqda..." : `${role} sifatida kirish`}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>© {new Date().getFullYear()} Magic Denta</span>
            <a
              href="https://magicdenta.uz"
              className="text-[#403D88] hover:text-[#92003A] transition"
            >
              Asosiy saytga o‘tish →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminDentistLogin;
