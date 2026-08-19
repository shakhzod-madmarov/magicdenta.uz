import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import eyesClosed from "../assets/login/eyes-closed.png";
import eyesOpened from "../assets/login/eyes-opened.png";
import { AdminContext } from "../context/AdminContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import {DentistContext} from "../context/DentistContext.jsx"

const AdminDentistLogin = () => {
  const [role, setRole] = useState("Admin"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { backendUrl, setAToken } = useContext(AdminContext);
  const { setDToken } = useContext(DentistContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (role === "Admin") {
        const { data } = await axios.post(`${backendUrl}/api/admin/login`, {
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
          toast.success("Admin tizimiga muvaffaqiyatli kirdingiz");
          navigate("/admin-dashboard");
        } else {
          toast.error(data.message);
        }
      }

      if (role === "Stomatolog") {
        const { data } = await axios.post(`${backendUrl}/api/dentist/login`, {
          email,
          password,
        });

        if (data.success) {
         localStorage.setItem("dToken", data.token);
         setDToken(data.token);
         toast.success("Stomatolog tizimiga muvaffaqiyatli kirdingiz");
         navigate("/dentist-dashboard");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Server bilan bog‘lanishda xatolik yuz berdi",
      );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-grayLight flex flex-col">
      <section className="w-full py-10 bg-gradient-to-r from-primary to-secondary text-white shadow-sm">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-1">{role} tizimiga kirish</h1>
          <p className="text-sm opacity-90">
            Iltimos, tizimga kirish uchun ma’lumotlaringizni kiriting
          </p>
        </div>
      </section>

      <section className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Elektron pochta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder={`${role.toLowerCase()}@example.com`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-sm"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Parol
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Parolingiz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-3 pr-10 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[34px] hover:scale-110 transition-transform"
                aria-label={
                  showPassword ? "Parolni yashirish" : "Parolni ko‘rsatish"
                }
              >
                <img
                  src={showPassword ? eyesOpened : eyesClosed}
                  alt={
                    showPassword ? "Ko‘rinayotgan parol" : "Yashirilgan parol"
                  }
                  className="w-6 h-6 object-contain"
                />
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-md shadow hover:opacity-95 transition text-sm"
            >
              Tizimga kirish
            </button>
          </form>
          <div className="text-center text-sm text-gray-700 mt-6">
            {role === "Admin" ? (
              <>
                <p>Stomatologlar uchun tizim:</p>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("aToken");
                    localStorage.removeItem("dToken");
                    setRole("Stomatolog");
                    setEmail("");
                    setPassword("");

                  }}
                  className="text-primary font-semibold hover:underline mt-1"
                >
                  Stomatolog tizimiga o‘tish
                </button>
              </>
            ) : (
              <>
                <p>Admin tizimiga qaytish:</p>
                <button
                  type="button"
                  onClick={() => {
                    setRole("Admin");
                    setEmail("");
                    setPassword("");
                  }}
                  className="text-primary font-semibold hover:underline mt-1"
                >
                  Admin tizimiga o‘tish
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminDentistLogin;
