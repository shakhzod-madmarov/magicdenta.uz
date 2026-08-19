import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext.jsx";
import { formatMoney } from "@shared/date.js";
import { displayMoney, parseMoney } from "../../utils/moneyInput.js";
import DualPasswordModal from "../../components/DualPasswordModal.jsx";

const T = {
  uz: {
    title: "Oylik & Komissiya hisoboti",
    dateRange: "Sana oralig'i",
    start: "Boshlanish sanasi",
    end: "Tugash sanasi",
    totalRevenue: "Jami tushum (Kassa)",
    totalCommission: "Jami stomatologlar ulushi",
    totalPaid: "To'langan ish haqi",
    totalUnpaid: "To'lanmagan qoldiq",
    dentist: "Mutaxassis",
    percent: "Foiz",
    treatmentsCount: "Muolajalar soni",
    revenueGenerated: "Tushum (Kassa)",
    commissionShare: "Stomatolog ulushi",
    paidAmount: "To'langan",
    unpaidAmount: "Qoldiq",
    actionPay: "To'lash",
    paidStatus: "To'langan",
    payoutModalTitle: "Ish haqini to'lash",
    payoutAmount: "To'lov summasi (so'm)",
    notes: "Izoh",
    cancel: "Bekor qilish",
    confirm: "Tasdiqlash",
    loading: "Yuklanmoqda...",
    noData: "Ma'lumot topilmadi",
  },
  ru: {
    title: "Отчет по зарплате и комиссиям",
    dateRange: "Диапазон дат",
    start: "Дата начала",
    end: "Дата окончания",
    totalRevenue: "Общая выручка (Касса)",
    totalCommission: "Общая доля врачей",
    totalPaid: "Выплачено зарплаты",
    totalUnpaid: "Невыплаченный остаток",
    dentist: "Специалист",
    percent: "Процент",
    treatmentsCount: "Кол-во процедур",
    revenueGenerated: "Выручка (Касса)",
    commissionShare: "Доля врача",
    paidAmount: "Выплачено",
    unpaidAmount: "Остаток",
    actionPay: "Оплатить",
    paidStatus: "Выплачено",
    payoutModalTitle: "Выплата зарплаты",
    payoutAmount: "Сумма выплаты (сум)",
    notes: "Примечание",
    cancel: "Отмена",
    confirm: "Подтвердить",
    loading: "Загрузка...",
    noData: "Данные не найдены",
  },
  en: {
    title: "Salary & Commission Report",
    dateRange: "Date Range",
    start: "Start Date",
    end: "End Date",
    totalRevenue: "Total Collections (Cash)",
    totalCommission: "Total Dentists Share",
    totalPaid: "Paid Salaries",
    totalUnpaid: "Unpaid Balance",
    dentist: "Specialist",
    percent: "Percent",
    treatmentsCount: "Procedures Count",
    revenueGenerated: "Collections (Cash)",
    commissionShare: "Dentist Share",
    paidAmount: "Paid",
    unpaidAmount: "Balance",
    actionPay: "Pay",
    paidStatus: "Paid",
    payoutModalTitle: "Salary Payout",
    payoutAmount: "Payout Amount (UZS)",
    notes: "Notes",
    cancel: "Cancel",
    confirm: "Confirm",
    loading: "Loading...",
    noData: "Data not found",
  },
  tg: {
    title: "Ҳисоботи маош ва комиссияҳо",
    dateRange: "Давраи таърих",
    start: "Санаи оғоз",
    end: "Санаи анҷом",
    totalRevenue: "Даромади умумӣ (Хазина)",
    totalCommission: "Ҳиссаи умумии духтурон",
    totalPaid: "Маоши пардохтшуда",
    totalUnpaid: "Бақияи пардохтнашуда",
    dentist: "Мутахассис",
    percent: "Физ",
    treatmentsCount: "Миқдори расмиёт",
    revenueGenerated: "Даромад (Хазина)",
    commissionShare: "Ҳиссаи духтур",
    paidAmount: "Пардохтшуда",
    unpaidAmount: "Бақия",
    actionPay: "Пардохт кардан",
    paidStatus: "Пардохтшуда",
    payoutModalTitle: "Пардохти маош",
    payoutAmount: "Маблағи пардохт (сӯм)",
    notes: "Эзоҳ",
    cancel: "Интихобро лағв кунед",
    confirm: "Тасдиқ кардан",
    loading: "Дар ҳоли боргирӣ...",
    noData: "Маълумот ёфт нашуд",
  },
};

export default function Payroll() {
  const { backendUrl, aToken } = useContext(AdminContext);
  const [lang, setLang] = useState(localStorage.getItem("language") || "uz");
  const t = T[lang] || T.uz;

  useEffect(() => {
    const handler = () => setLang(localStorage.getItem("language") || "uz");
    window.addEventListener("language-change", handler);
    return () => window.removeEventListener("language-change", handler);
  }, []);

  const toLocalISOString = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const now = new Date();
  const firstDayStr = toLocalISOString(new Date(now.getFullYear(), now.getMonth(), 1));
  const lastDayStr = toLocalISOString(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const [dates, setDates] = useState({ start: firstDayStr, end: lastDayStr });
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [payoutForm, setPayoutForm] = useState({ amount: "", notes: "" });
  const [dualPasswordAction, setDualPasswordAction] = useState(null);
  const [confirmDentistId, setConfirmDentistId] = useState(null);
  const [unlockedDentistIds, setUnlockedDentistIds] = useState([]);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [tempPercent, setTempPercent] = useState("");

  const handleSavePercent = (dentistId) => {
    const val = Number(tempPercent);
    if (Number.isNaN(val) || val < 0 || val > 100) {
      toast.error("Foiz miqdori 0 dan 100 gacha bo'lishi kerak");
      setEditingDoctorId(null);
      return;
    }
    setEditingDoctorId(null);
    setConfirmDentistId(dentistId);
    setDualPasswordAction(() => async () => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/admin/dentists/${dentistId}/commission`,
          { commissionPercent: val },
          { headers: { Authorization: `Bearer ${aToken}` } }
        );
        if (data.success) {
          toast.success(data.message || "Ish haqi ulushi o'zgartirildi");
          setUnlockedDentistIds(prev => prev.includes(dentistId) ? prev : [...prev, dentistId]);
          setReport(prev => prev.map(item => {
            if (item.dentist._id === dentistId) {
              const updatedDoctor = { ...item.dentist, commissionPercent: val };
              const newCommission = Math.round((item.totalAmount || 0) * val / 100);
              return { ...item, dentist: updatedDoctor, totalCommission: newCommission };
            }
            return item;
          }));
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        toast.error(err.message);
      }
    });
  };

  const handleSelectPreset = (preset) => {
    const today = new Date();
    const todayStr = toLocalISOString(today);
    
    if (preset === "today") {
      setDates({ start: todayStr, end: todayStr });
    } else if (preset === "week") {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      setDates({ start: toLocalISOString(past), end: todayStr });
    } else if (preset === "month") {
      const firstDay = toLocalISOString(new Date(today.getFullYear(), today.getMonth(), 1));
      const lastDay = toLocalISOString(new Date(today.getFullYear(), today.getMonth() + 1, 0));
      setDates({ start: firstDay, end: lastDay });
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/admin/payroll/report?start=${dates.start}&end=${dates.end}`,
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      if (data.success) {
        setReport(data.report || []);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (aToken) fetchReport();
  }, [dates, aToken]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedDoctor(null);
        setDualPasswordAction(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const totalRevenue = report.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalCommission = report.reduce((sum, item) => sum + item.totalCommission, 0);
  const totalPaid = report.reduce((sum, item) => sum + item.totalPaidPayouts, 0);
  const totalUnpaid = report.reduce((sum, item) => sum + Math.max(0, item.totalCommission - item.totalPaidPayouts), 0);

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    if (!payoutForm.amount || Number(payoutForm.amount) <= 0) {
      toast.warning("To'lov summasi noto'g'ri");
      return;
    }

    setConfirmDentistId(selectedDoctor._id);
    setDualPasswordAction(() => async () => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/admin/payroll/payout`,
          {
            dentistId: selectedDoctor._id,
            amount: Number(payoutForm.amount),
            periodStart: dates.start,
            periodEnd: dates.end,
            notes: payoutForm.notes
          },
          { headers: { Authorization: `Bearer ${aToken}` } }
        );

        if (data.success) {
          toast.success(data.message);
          setUnlockedDentistIds(prev => prev.includes(selectedDoctor._id) ? prev : [...prev, selectedDoctor._id]);
          setSelectedDoctor(null);
          setPayoutForm({ amount: "", notes: "" });
          fetchReport();
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        toast.error(err.message);
      }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-850 tracking-tight">{t.title}</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100/85 p-1 rounded-xl border border-slate-200/50">
            {["today", "week", "month"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-black text-slate-600 hover:text-slate-900 hover:bg-white/80 active:scale-95 transition-all"
              >
                {preset === "today" ? "Bugun" : preset === "week" ? "Hafta" : "Oy"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border shadow-sm">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.start}</label>
              <input
                type="date"
                value={dates.start}
                onChange={(e) => setDates({ ...dates, start: e.target.value })}
                className="text-sm font-semibold outline-none text-slate-700 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
              />
            </div>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.end}</label>
              <input
                type="date"
                value={dates.end}
                onChange={(e) => setDates({ ...dates, end: e.target.value })}
                className="text-sm font-semibold outline-none text-slate-700 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: t.totalRevenue, val: totalRevenue, color: "text-slate-800 border-slate-100" },
          { title: t.totalCommission, val: totalCommission, color: "text-blue-600 border-blue-100" },
          { title: t.totalPaid, val: totalPaid, color: "text-emerald-600 border-emerald-100" },
          { title: t.totalUnpaid, val: totalUnpaid, color: "text-amber-600 border-amber-100" },
        ].map((c) => (
          <div key={c.title} className={`bg-white border rounded-2xl p-5 shadow-sm`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{c.title}</p>
            <p className={`text-xl font-black ${c.color}`}>{formatMoney(c.val)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-medium">{t.loading}</div>
        ) : report.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-medium">{t.noData}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">{t.dentist}</th>
                  <th className="px-6 py-4 text-center">{t.percent}</th>
                  <th className="px-6 py-4 text-center">{t.treatmentsCount}</th>
                  <th className="px-6 py-4 text-right">{t.revenueGenerated}</th>
                  <th className="px-6 py-4 text-right">{t.commissionShare}</th>
                  <th className="px-6 py-4 text-right">{t.paidAmount}</th>
                  <th className="px-6 py-4 text-right">{t.unpaidAmount}</th>
                  <th className="px-6 py-4 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700 text-sm">
                {report.map((item) => {
                  const unpaid = Math.max(0, item.totalCommission - item.totalPaidPayouts);
                  const isUnlocked = unlockedDentistIds.includes(item.dentist._id);
                  const triggerUnlock = () => {
                    if (!isUnlocked) {
                      setConfirmDentistId(item.dentist._id);
                      setDualPasswordAction(() => () => {
                        setUnlockedDentistIds(prev => {
                          if (prev.includes(item.dentist._id)) return prev;
                          return [...prev, item.dentist._id];
                        });
                      });
                    }
                  };

                  return (
                    <tr key={item.dentist._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div 
                          className="font-semibold text-slate-800 cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"
                          onClick={triggerUnlock}
                        >
                          {item.dentist.name}
                          {!isUnlocked && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded border border-slate-200 ml-1">
                              🔒 Qulflangan
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{item.dentist.speciality.join(", ")}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {!isUnlocked ? (
                          <div onClick={triggerUnlock} className="filter blur-[6px] select-none cursor-pointer hover:opacity-85 transition-opacity py-1">
                            {item.dentist.commissionPercent}%
                          </div>
                        ) : editingDoctorId === item.dentist._id ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={tempPercent}
                              onChange={(e) => setTempPercent(e.target.value)}
                              onBlur={() => handleSavePercent(item.dentist._id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSavePercent(item.dentist._id);
                                if (e.key === "Escape") setEditingDoctorId(null);
                              }}
                              className="w-16 text-center border rounded px-1 py-0.5 text-sm font-semibold"
                              autoFocus
                            />
                            <span className="text-slate-500">%</span>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingDoctorId(item.dentist._id);
                              setTempPercent(String(item.dentist.commissionPercent || 30));
                            }}
                            className="inline-flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded transition-colors group"
                          >
                            <span>{item.dentist.commissionPercent}%</span>
                            <svg className="w-3 h-3 text-slate-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-600">
                        {!isUnlocked ? (
                          <div onClick={triggerUnlock} className="filter blur-[6px] select-none cursor-pointer hover:opacity-85 transition-opacity py-1">
                            {item.totalTreatments}
                          </div>
                        ) : (
                          item.totalTreatments
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-800">
                        {!isUnlocked ? (
                          <div onClick={triggerUnlock} className="filter blur-[6px] select-none cursor-pointer hover:opacity-85 transition-opacity py-1">
                            {formatMoney(item.totalAmount)}
                          </div>
                        ) : (
                          formatMoney(item.totalAmount)
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-blue-600">
                        {!isUnlocked ? (
                          <div onClick={triggerUnlock} className="filter blur-[6px] select-none cursor-pointer hover:opacity-85 transition-opacity py-1">
                            {formatMoney(item.totalCommission)}
                          </div>
                        ) : (
                          formatMoney(item.totalCommission)
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                        {!isUnlocked ? (
                          <div onClick={triggerUnlock} className="filter blur-[6px] select-none cursor-pointer hover:opacity-85 transition-opacity py-1">
                            {formatMoney(item.totalPaidPayouts)}
                          </div>
                        ) : (
                          formatMoney(item.totalPaidPayouts)
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-amber-600">
                        {!isUnlocked ? (
                          <div onClick={triggerUnlock} className="filter blur-[6px] select-none cursor-pointer hover:opacity-85 transition-opacity py-1">
                            {formatMoney(unpaid)}
                          </div>
                        ) : (
                          formatMoney(unpaid)
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {unpaid > 0 ? (
                          <button
                            onClick={() => {
                              setSelectedDoctor(item.dentist);
                              setPayoutForm({ amount: String(unpaid), notes: "" });
                            }}
                            className="bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all"
                          >
                            {t.actionPay}
                          </button>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold px-3 py-1 rounded-full">
                            {t.paidStatus}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedDoctor(null)}>
          <div className="bg-white border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">{t.payoutModalTitle}</h2>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handlePayoutSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {selectedDoctor.name} ({selectedDoctor.speciality.join(", ")})
                </label>
                <div className="text-sm font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border">
                  Ish haqi ulushi: {selectedDoctor.commissionPercent}%
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t.payoutAmount}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={displayMoney(payoutForm.amount)}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: parseMoney(e.target.value) })}
                  className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t.notes}
                </label>
                <textarea
                  value={payoutForm.notes}
                  onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                  className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-primary rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all"
                >
                  {t.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {dualPasswordAction && (
        <DualPasswordModal
          dentistId={confirmDentistId}
          onConfirm={() => {
            const fn = dualPasswordAction;
            setDualPasswordAction(null);
            setConfirmDentistId(null);
            fn();
          }}
          onCancel={() => {
            setDualPasswordAction(null);
            setConfirmDentistId(null);
          }}
        />
      )}
    </div>
  );
}
