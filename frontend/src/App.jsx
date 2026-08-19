import { useEffect } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyAppointments from "./pages/MyAppointments";
import Dentists from "./pages/Dentists";
import Login from "./pages/Login";
import MyProfile from "./pages/MyProfile";
import Appointment from "./pages/Appointment";
import Footer from "./components/Footer";
import Nav from "./components/Nav";
import MyTreatments from "./pages/MyTreatments";
import QueueDisplay from "./pages/QueueDisplay";
import ServiceLanding from "./pages/ServiceLanding";
import Services from "./pages/Services";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const loc = useLocation();
  const isQueue = loc.pathname === "/queue-display";

  useEffect(() => {
    const handleCopy = (e) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
      const text = selection.toString();
      if (text && e.clipboardData) {
        e.clipboardData.setData("text/plain", text);
        e.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, []);

  if (isQueue) {
    return (
      <>
        <ToastContainer />
        <Routes>
          <Route path="/queue-display" element={<QueueDisplay />} />
        </Routes>
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer />
      <Nav />
      <div className="flex-grow mx-4 sm:mx-[10%]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/myappointments" element={<MyAppointments />} />
          <Route path="/dentists" element={<Navigate to="/services" replace />} />
          <Route path="/dentists/:speciality" element={<Navigate to="/services" replace />} />
          <Route path="/services" element={<Services />} />
          <Route path="/xizmatlar" element={<Services />} />
          <Route path="/services/:serviceSlug" element={<ServiceLanding />} />
          <Route path="/xizmatlar/:serviceSlug" element={<ServiceLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/myprofile" element={<MyProfile />} />
          <Route path="/appointment/:dentistId" element={<Appointment />} />
          <Route path="/my-treatments" element={<MyTreatments />} />
        </Routes>
      </div>
      <Footer />

      {/* Floating Telegram & WhatsApp Quick Contact Glass Group */}
      <div className="fixed bottom-6 right-7 z-50 flex flex-col gap-3 items-center">
        {/* Telegram Glass Button */}
        <a
          href="https://t.me/+998912891514"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegram"
          title="Telegram: +998 91 289 15 14"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-xl border border-white/20 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group"
        >
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.2-.02-.08.02-1.3 0.83-3.68 2.44-.35.24-.67.36-.96.35-.32-.01-.94-.18-1.4-.33-.56-.18-1.01-.28-0.97-.6.02-.17.26-.34.7-.52 2.76-1.2 4.6-2 5.53-2.4 2.64-1.1 3.19-1.28 3.55-1.28.08 0 .25.02.36.1.1.08.13.18.14.28 0 .06-.01.12-.02.18z"/>
          </svg>
        </a>

        {/* WhatsApp Glass Button */}
        <a
          href="https://wa.me/998912891514?text=Assalomu%20alaykum!%20Magic%20Denta%20stomatologiyasiga%20yozilmoqchi%20edim."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          title="WhatsApp: +998 91 289 15 14"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-xl border border-white/20 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group"
        >
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.102.544 4.076 1.497 5.794L0 24l6.404-1.475A11.926 11.926 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-5.003-1.374l-.36-.214-3.72.857.878-3.617-.234-.37A9.785 9.785 0 012.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z"/>
          </svg>
        </a>
      </div>
    </div>
  );
};

export default App;
