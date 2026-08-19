import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { DentistContext } from "../../context/DentistContext";
import { formatMoney, formatDMY } from "@shared/date.js";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return formatDMY(dateStr);
};

const CATEGORY_LABELS = {
  consumables: "Sarflovchi material",
  instruments: "Uskuna / Jihoz",
  medicines: "Dori-darmon",
  otherCategory: "Boshqa",
};

const formatNumber = (val) => {
  if (val === undefined || val === null || Number.isNaN(val)) return "0";
  return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const toLocalISOString = (date) => {
  const tzoffset = date.getTimezoneOffset() * 60000;
  return (new Date(date - tzoffset)).toISOString().slice(0, 10);
};

const DentistFinance = () => {
  const { backendUrl, dToken } = useContext(DentistContext);
  const authHeader = useMemo(() => ({ headers: { dtoken: dToken } }), [dToken]);

  const today = new Date();
  const firstDayStr = toLocalISOString(new Date(today.getFullYear(), today.getMonth(), 1));
  const lastDayStr = toLocalISOString(new Date(today.getFullYear(), today.getMonth() + 1, 0));

  const [dates, setDates] = useState({ start: firstDayStr, end: lastDayStr });
  const [loading, setLoading] = useState(false);
  const [payouts, setPayouts] = useState([]);
  const [materialLogs, setMaterialLogs] = useState([]);
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalMaterialExpense: 0,
    netPayout: 0,
  });

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

  const fetchFinanceOverview = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/dentist/finance/overview?start=${dates.start}&end=${dates.end}`,
        authHeader
      );
      if (data.success) {
        setPayouts(data.payouts || []);
        setMaterialLogs(data.materialLogs || []);
        setSummary(data.summary || { totalPaid: 0, totalMaterialExpense: 0, netPayout: 0 });
      } else {
        toast.error(data.message || "Moliyaviy ma'lumotlarni yuklashda xatolik");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dToken) fetchFinanceOverview();
  }, [dToken, dates]);

  const card = "bg-white border border-slate-200 rounded-2xl shadow-sm";

  return (
    <main className="w-full min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Title & Date Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-primary rounded-full" />
            <h1 className="text-2xl font-black text-slate-800">Mening hisob-kitobim</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Presets */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
              {["today", "week", "month"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white/80 active:scale-95 transition-all"
                >
                  {preset === "today" ? "Bugun" : preset === "week" ? "Hafta" : "Oy"}
                </button>
              ))}
            </div>

            {/* Custom Pickers */}
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border shadow-sm">
              <div className="px-2">
                <label className="block text-[8px] font-bold text-slate-400 uppercase">Dan</label>
                <input
                  type="date"
                  value={dates.start}
                  onChange={(e) => setDates({ ...dates, start: e.target.value })}
                  className="text-xs font-semibold outline-none text-slate-700 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
                />
              </div>
              <div className="h-5 w-[1px] bg-slate-200" />
              <div className="px-2">
                <label className="block text-[8px] font-bold text-slate-400 uppercase">Gacha</label>
                <input
                  type="date"
                  value={dates.end}
                  onChange={(e) => setDates({ ...dates, end: e.target.value })}
                  className="text-xs font-semibold outline-none text-slate-700 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={fetchFinanceOverview}
              disabled={loading}
              className="px-3 py-2 border rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-slate-500 disabled:opacity-50 text-xs font-bold"
              title="Yangilash"
            >
              {loading ? "..." : "↻"}
            </button>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`${card} p-5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/30`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tushgan Pullar (Maosh)</span>
            <span className="text-2xl font-black text-emerald-600 mt-2 block">{formatMoney(summary.totalPaid)}</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Jami to'langan ish haqilari</span>
            <div className="absolute right-4 bottom-4 text-4xl opacity-10">💰</div>
          </div>

          <div className={`${card} p-5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white to-rose-50/30`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sarflangan Materiallar</span>
            <span className="text-2xl font-black text-rose-500 mt-2 block">{formatMoney(summary.totalMaterialExpense)}</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Olingan sarf materiallari qiymati</span>
            <div className="absolute right-4 bottom-4 text-4xl opacity-10">📉</div>
          </div>

          <div className={`${card} p-5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/30`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sof Foyda (Balans)</span>
            <span className={`text-2xl font-black mt-2 block ${summary.netPayout >= 0 ? "text-indigo-600" : "text-rose-600"}`}>
              {formatMoney(summary.netPayout)}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Oylik minus xarajatlar qoldig'i</span>
            <div className="absolute right-4 bottom-4 text-4xl opacity-10">📊</div>
          </div>
        </div>

        {/* Finance History — two columns */}
        {loading ? (
          <div className={`${card} py-16 text-center text-slate-400 font-medium`}>
            Yuklanmoqda...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Left: Payouts received */}
            <div className="space-y-3">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider pl-1 flex items-center gap-2">
                <span>💰</span> Olingan Oylik &amp; Ish haqilari
              </h2>
              <div className={`${card} overflow-hidden`}>
                {payouts.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-medium">
                    To'lovlar tarixi topilmadi
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="px-4 py-3">Sana</th>
                          <th className="px-4 py-3 text-right">Summa</th>
                          <th className="px-4 py-3">Izoh</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700 text-xs">
                        {payouts.map((p) => (
                          <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                              {formatDate(p.payoutDate || p.createdAt)}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-600">
                              {formatMoney(p.amount)}
                            </td>
                            <td className="px-4 py-3 text-slate-600 italic">
                              {p.notes || "Oylik komissiya to'lovi"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-slate-200">
                        <tr className="bg-emerald-50/40">
                          <td className="px-4 py-3 text-xs font-black text-slate-600">Jami</td>
                          <td className="px-4 py-3 text-right font-black text-emerald-700">{formatMoney(summary.totalPaid)}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Material consumption logged against this dentist */}
            <div className="space-y-3">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider pl-1 flex items-center gap-2">
                <span>📉</span> Sarflangan Materiallar (Xarajat)
              </h2>
              <div className={`${card} overflow-hidden`}>
                {materialLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-medium">
                    Xarajatlar tarixi topilmadi
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="px-4 py-3">Sana</th>
                          <th className="px-4 py-3">Material</th>
                          <th className="px-4 py-3 text-center">Miqdor</th>
                          <th className="px-4 py-3 text-right">Qiymati</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700 text-xs">
                        {materialLogs.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                              {formatDate(log.date || log.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-800">{log.itemId?.name || "O'chirilgan material"}</div>
                              {log.reason && (
                                <div className="text-[10px] text-slate-400">{log.reason}</div>
                              )}
                              {log.itemId?.category && (
                                <div className="text-[10px] text-slate-300 mt-0.5">
                                  {CATEGORY_LABELS[log.itemId.category] || log.itemId.category}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold">
                              {formatNumber(log.qty)}{" "}
                              <span className="text-slate-400 font-normal">{log.itemId?.unit || ""}</span>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-rose-600">
                              {formatMoney(log.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-slate-200">
                        <tr className="bg-rose-50/40">
                          <td colSpan={3} className="px-4 py-3 text-xs font-black text-slate-600">Jami xarajat</td>
                          <td className="px-4 py-3 text-right font-black text-rose-600">{formatMoney(summary.totalMaterialExpense)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
};

export default DentistFinance;
