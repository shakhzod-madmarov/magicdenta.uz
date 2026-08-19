import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import profilePic from "../assets/profile_pic.png";
import { formatDMY } from "../../../shared/date.js";

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/my-appointments`,
        { headers: { token } },
      );

      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Uchrashuvlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    document.title = "Mening uchrashuvlarim | Magic Denta";
    const metaRobots = document.querySelector('meta[name="robots"]') || document.createElement("meta");
    metaRobots.name = "robots";
    metaRobots.content = "noindex, nofollow";
    if (!document.head.contains(metaRobots)) {
      document.head.appendChild(metaRobots);
    }
  }, []);

  const handleCancel = async (id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment/${id}`,
        {},
        { headers: { token } },
      );

      if (data.success) {
        toast.success(data.message || "Uchrashuv bekor qilindi");
        fetchAppointments();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Bekor qilishda xatolik");
    }
  };

  const getStatusBadge = (item) => {
    if (item.cancelled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          Bekor qilingan
        </span>
      );
    }
    switch (item.status) {
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Qabul qilinmoqda
          </span>
        );
      case "DONE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Yakunlangan
          </span>
        );
      case "MISSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            Kelmagan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Kutilmoqda
          </span>
        );
    }
  };

  return (
    <main className="max-w-5xl mx-auto py-6 sm:py-12 px-4 sm:px-6">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <span className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1 sm:mb-2">
          SHAXSIY KABINET
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Mening uchrashuvlarim
        </h1>
        <p className="text-slate-500 text-xs sm:text-base mt-1.5">
          Barcha belgilangan qabullar ro‘yxati, shifokorlar va uchrashuv holatlari
        </p>
      </div>

      {/* No-slide Full Width Adaptive Navigation Tabs */}
      <div className="w-full max-w-xl mx-auto mb-8 sm:mb-10">
        <div className="grid grid-cols-3 bg-slate-100/90 p-1 rounded-2xl sm:rounded-full border border-slate-200/70 shadow-xs">
          <NavLink
            to="/myprofile"
            className={({ isActive }) =>
              `py-2 sm:py-2.5 px-1 sm:px-4 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-center ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`
            }
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="truncate">Profil</span>
          </NavLink>
          <NavLink
            to="/myappointments"
            className={({ isActive }) =>
              `py-2 sm:py-2.5 px-1 sm:px-4 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-center ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`
            }
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="truncate">Uchrashuvlar</span>
          </NavLink>
          <NavLink
            to="/my-treatments"
            className={({ isActive }) =>
              `py-2 sm:py-2.5 px-1 sm:px-4 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-center ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`
            }
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="truncate">Davolash</span>
          </NavLink>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-[32px] border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 font-bold text-sm">Uchrashuvlar yuklanmoqda...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[32px] border border-slate-200/80 shadow-xs px-6">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Sizda hozircha uchrashuvlar yo‘q</h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Qabulga yozilish uchun stomatologlarimiz sahifasiga o‘tib, o‘zingizga qulay vaqtni tanlang.
          </p>
          <NavLink
            to="/dentists"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-full shadow-sm transition active:scale-95"
          >
            <span>Shifokor tanlash</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </NavLink>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5">
          {appointments.map((item) => {
            const canCancel = !item.cancelled && item.status === "WAITING";

            return (
              <article
                key={item._id}
                className="bg-white border border-slate-200/90 rounded-[28px] p-5 sm:p-7 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6"
              >
                <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                  <div className="relative shrink-0">
                    <img
                      src={
                        item.dentistData?.image
                          ? `${backendUrl}${item.dentistData.image}`
                          : profilePic
                      }
                      alt={item.dentistData?.name || "Stomatolog"}
                      className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-100 bg-slate-50 shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = profilePic;
                      }}
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base sm:text-xl font-black text-slate-900 truncate">
                        {item.dentistData?.name || "Shifokor"}
                      </h2>
                      {item.dentistData?.speciality && (
                        <span className="text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                          {item.dentistData.speciality}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 sm:px-3 py-1 rounded-xl border border-slate-200/70">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Sana: {formatDMY(item.slotDate)}</span>
                      </span>

                      <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 sm:px-3 py-1 rounded-xl border border-slate-200/70">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Vaqt: {item.slotTime}</span>
                      </span>
                    </div>

                    <div className="pt-1">
                      {item.createdFrom === "DENTIST" ? (
                        <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-blue-100">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Stomatolog tomonidan yozilgan
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-slate-200">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                          </svg>
                          Saytdan yozilgan
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Status & Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  <div>{getStatusBadge(item)}</div>

                  {canCancel && (
                    <button
                      onClick={() => handleCancel(item._id)}
                      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default MyAppointments;
