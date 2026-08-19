import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import profilePic from "../assets/profile_pic.png";
import {
  formatDMY,
  formatDateTimeISO,
  formatMoney,
} from "../../../shared/date.js";
import Seo from "../components/Seo";

const getPaymentBadge = (status) => {
  switch (status) {
    case "PAID":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          To‘liq to‘langan
        </span>
      );
    case "PARTIAL":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          Qisman to‘langan (qarz bor)
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          To‘lanmagan
        </span>
      );
  }
};

const MyTreatments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/my-treatments`, {
        headers: { token },
      });

      if (data.success) {
        setTreatments(data.treatments || []);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Davolash tarixini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-12 px-4 sm:px-6">
      <Seo title="Mening Muolajalarim | Magic Denta" noindex={true} />
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <span className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1 sm:mb-2">
          SHAXSIY KABINET
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Davolash tarixi
        </h1>
        <p className="text-slate-500 text-xs sm:text-base mt-1.5">
          Amalga oshirilgan barcha stomatologik muolajalar, tashxislar, to‘lovlar va retseptlar
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
          <p className="text-slate-500 font-bold text-sm">Davolash tarixi yuklanmoqda...</p>
        </div>
      ) : treatments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[32px] border border-slate-200/80 shadow-xs px-6">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Hozircha davolash tarixi yo‘q</h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Klinikamizda o‘tkazilgan barcha muolajalar va hisob-kitoblar shu yerda avtomatik saqlanib boradi.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {treatments.map((t) => {
            const total = Number(t.amount || 0);
            const paid = Number(t.paidAmount || 0);
            const debt = t.debt ?? Math.max(0, total - paid);

            return (
              <section
                key={t._id}
                className="bg-white border border-slate-200/90 rounded-[32px] p-6 sm:p-8 shadow-[0_4px_25px_rgb(0,0,0,0.04)] hover:shadow-[0_10px_35px_rgb(0,0,0,0.07)] transition-all duration-300 space-y-6 overflow-hidden"
              >
                {/* Treatment Card Top Banner with Real Doctor Image */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        t.dentistId?.image
                          ? String(t.dentistId.image).startsWith("http") || String(t.dentistId.image).startsWith("blob:")
                            ? t.dentistId.image
                            : `${backendUrl}${t.dentistId.image}`
                          : profilePic
                      }
                      alt={t.dentistId?.name || "Stomatolog"}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-slate-100 bg-slate-100 shadow-sm shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = profilePic;
                      }}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-black text-slate-900">
                          {t.dentistId?.name || "Stomatolog"}
                        </h2>
                        {t.dentistId?.speciality && (
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                            {t.dentistId.speciality}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold mt-1">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDMY(t.appointmentId?.slotDate)}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{t.appointmentId?.slotTime}</span>
                        </span>
                        {t.lastPaidAt && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">
                              Oxirgi to‘lov: {formatDateTimeISO(t.lastPaidAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>{getPaymentBadge(t.paymentStatus)}</div>
                </div>

                {/* Financial Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Umumiy narx
                    </span>
                    <span className="text-lg sm:text-xl font-black text-slate-900">
                      {formatMoney(total)}
                    </span>
                  </div>

                  <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/70">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                      To‘langan summa
                    </span>
                    <span className="text-lg sm:text-xl font-black text-emerald-700">
                      {formatMoney(paid)}
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl border ${debt > 0 ? "bg-red-50/70 border-red-200/70" : "bg-slate-50 border-slate-200/70"}`}>
                    <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${debt > 0 ? "text-red-800" : "text-slate-500"}`}>
                      Qolgan qarz
                    </span>
                    <span className={`text-lg sm:text-xl font-black ${debt > 0 ? "text-red-600" : "text-slate-700"}`}>
                      {formatMoney(debt)}
                    </span>
                  </div>
                </div>

                {/* Clinical Notes & Details with Clean SVG Icons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Diagnosis */}
                  {t.diagnosis && (
                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                      <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Tashxis (Diagnos)</span>
                      </span>
                      <p className="text-sm font-bold text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {t.diagnosis}
                      </p>
                    </div>
                  )}

                  {/* Teeth numbers */}
                  {t.teeth && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span>Ishlangan tish(lar)</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {String(t.teeth)
                          .split(/[,;\s]+/)
                          .filter(Boolean)
                          .map((tooth, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-white border border-slate-300 text-slate-900 font-extrabold text-xs rounded-xl shadow-2xs"
                            >
                              № {tooth}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Procedures */}
                  {t.procedures && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 md:col-span-2">
                      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>Bajarilgan muolajalar</span>
                      </span>
                      <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {t.procedures}
                      </p>
                    </div>
                  )}

                  {/* Next Step */}
                  {t.nextStep && (
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                      <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span>Keyingi qadam / Reja</span>
                      </span>
                      <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {t.nextStep}
                      </p>
                    </div>
                  )}

                  {/* Medicines */}
                  {t.medicines && (
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                      <span className="text-xs font-extrabold text-purple-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span>Tavsiya etilgan dorilar & Retsept</span>
                      </span>
                      <p className="text-sm font-bold text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {t.medicines}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {t.notes && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 md:col-span-2">
                      <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span>Shifokor eslatmasi</span>
                      </span>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {t.notes}
                      </p>
                    </div>
                  )}

                  {/* Next Visit Date */}
                  {t.nextVisitDate && (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 md:col-span-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                            Keyingi ko‘rik sanasi
                          </span>
                          <span className="text-sm font-black text-emerald-800">
                            {formatDMY(t.nextVisitDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payments Timeline */}
                {Array.isArray(t.payments) && t.payments.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-3">
                      To‘lovlar tarixi ({t.payments.length} ta to‘lov)
                    </span>
                    <div className="grid gap-2">
                      {t.payments.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs sm:text-sm bg-slate-50 border border-slate-200/70 rounded-2xl px-4 py-2.5"
                        >
                          <span className="text-slate-600 font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>{formatDateTimeISO(p.paidAt)}</span>
                          </span>
                          <span className="font-black text-emerald-700">
                            +{formatMoney(Number(p.amount || 0))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTreatments;
