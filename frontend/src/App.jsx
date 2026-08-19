import { useEffect } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyAppointments from "./pages/MyAppointments";
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
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/appointment/:dentistId" element={<Appointment />} />
          <Route path="/my-treatments" element={<MyTreatments />} />
        </Routes>
      </div>
      <Footer />

      {/* Floating Telegram Quick Contact Glass Button */}
      <div className="fixed bottom-6 right-7 z-50 flex flex-col gap-3 items-center">
        <a
          href="https://t.me/+998912891514"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegram"
          title="Telegram: +998 91 289 15 14"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-xl border border-white/20 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group hover:bg-[#24A1DE]"
        >
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.2-.02-.08.02-1.3 0.83-3.68 2.44-.35.24-.67.36-.96.35-.32-.01-.94-.18-1.4-.33-.56-.18-1.01-.28-0.97-.6.02-.17.26-.34.7-.52 2.76-1.2 4.6-2 5.53-2.4 2.64-1.1 3.19-1.28 3.55-1.28.08 0 .25.02.36.1.1.08.13.18.14.28 0 .06-.01.12-.02.18z"/>
          </svg>
        </a>
      </div>
    </div>
  );
};

export default App;
