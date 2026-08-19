import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext.jsx";
import { formatMoney, formatDMY } from "@shared/date.js";
import { displayMoney, parseMoney } from "../../utils/moneyInput.js";

const T = {
  uz: {
    title: "Xarajatlar daftari",
    addExpense: "Xarajat qo'shish",
    category: "Kategoriya",
    amount: "Summa (so'm)",
    date: "Sana",
    notes: "Izoh",
    submit: "Qo'shish",
    materials: "Materiallar",
    rent: "Ijara",
    salaries: "Oylik",
    utilities: "Kommunal",
    other: "Boshqa",
    loading: "Yuklanmoqda...",
    noData: "Xarajatlar topilmadi",
    tableNo: "#",
    tableCategory: "Kategoriya",
    tableAmount: "Summa",
    tableDate: "Sana",
    tableNotes: "Izoh",
    tableActions: "Amallar",
    deleteConfirm: "Rostdan ham bu xarajatni o'chirmoqchimisiz?",
    successAdd: "Xarajat qo'shildi",
    successDelete: "Xarajat o'chirildi",
    filterAll: "Barchasi",
    filterToday: "Bugun",
    filterWeek: "Hafta",
    filterMonth: "Oy",
    filteredTotal: "Filtrlangan jami",
    deleteBtn: "O'chirish",
    notesPlaceholder: "Xarajat haqida izoh...",
    amountPlaceholder: "Masalan: 500000",
  },
  ru: {
    title: "Книга расходов",
    addExpense: "Добавить расход",
    category: "Категория",
    amount: "Сумма (сум)",
    date: "Дата",
    notes: "Примечание",
    submit: "Добавить",
    materials: "Материалы",
    rent: "Аренда",
    salaries: "Зарплата",
    utilities: "Коммунальные",
    other: "Другое",
    loading: "Загрузка...",
    noData: "Расходы не найдены",
    tableNo: "#",
    tableCategory: "Категория",
    tableAmount: "Сумма",
    tableDate: "Дата",
    tableNotes: "Примечание",
    tableActions: "Действия",
    deleteConfirm: "Вы уверены, что хотите удалить этот расход?",
    successAdd: "Расход успешно добавлен",
    successDelete: "Расход удален",
    filterAll: "Все",
    filterToday: "Сегодня",
    filterWeek: "Неделя",
    filterMonth: "Месяц",
    filteredTotal: "Отфильтрованный итог",
    deleteBtn: "Удалить",
    notesPlaceholder: "Примечание к расходу...",
    amountPlaceholder: "Например: 500000",
  },
  en: {
    title: "Expenses Book",
    addExpense: "Add Expense",
    category: "Category",
    amount: "Amount (UZS)",
    date: "Date",
    notes: "Notes",
    submit: "Add",
    materials: "Materials",
    rent: "Rent",
    salaries: "Salaries",
    utilities: "Utilities",
    other: "Other",
    loading: "Loading...",
    noData: "Expenses not found",
    tableNo: "#",
    tableCategory: "Category",
    tableAmount: "Amount",
    tableDate: "Date",
    tableNotes: "Notes",
    tableActions: "Actions",
    deleteConfirm: "Are you sure you want to delete this expense?",
    successAdd: "Expense added",
    successDelete: "Expense deleted",
    filterAll: "All",
    filterToday: "Today",
    filterWeek: "Week",
    filterMonth: "Month",
    filteredTotal: "Filtered total",
    deleteBtn: "Delete",
    notesPlaceholder: "Expense description...",
    amountPlaceholder: "E.g. 500000",
  },
  tg: {
    title: "Дафтари хароҷотҳо",
    addExpense: "Иловаи хароҷот",
    category: "Категория",
    amount: "Маблағ (сӯм)",
    date: "Сана",
    notes: "Эзоҳ",
    submit: "Илова кардан",
    materials: "Маводҳо",
    rent: "Иҷора",
    salaries: "Маош",
    utilities: "Коммуналӣ",
    other: "Дигар",
    loading: "Дар ҳоли боргирӣ...",
    noData: "Хароҷотҳо ёфт нашуданд",
    tableNo: "#",
    tableCategory: "Категория",
    tableAmount: "Маблағ",
    tableDate: "Сана",
    tableNotes: "Эзоҳ",
    tableActions: "Амалҳо",
    deleteConfirm: "Оё шумо дар ҳақиқат мехоҳед ин хароҷотро нест кунед?",
    successAdd: "Хароҷот илова шуд",
    successDelete: "Хароҷот нест карда шуд",
    filterAll: "Ҳама",
    filterToday: "Имрӯз",
    filterWeek: "Ҳафта",
    filterMonth: "Моҳ",
    filteredTotal: "Ҷамъи филтршуда",
    deleteBtn: "Нест кардан",
    notesPlaceholder: "Эзоҳи хароҷот...",
    amountPlaceholder: "Масалан: 500000",
  }
};

export default function Expenses() {
  const { backendUrl, aToken } = useContext(AdminContext);
  const [lang, setLang] = useState(localStorage.getItem("language") || "uz");
  const t = T[lang] || T.uz;

  useEffect(() => {
    const handler = () => setLang(localStorage.getItem("language") || "uz");
    window.addEventListener("language-change", handler);
    return () => window.removeEventListener("language-change", handler);
  }, []);

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: "Materiallar",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    note: ""
  });
  const [timeFilter, setTimeFilter] = useState("ALL"); // ALL | TODAY | WEEK | MONTH
  const [passwordConfirmAction, setPasswordConfirmAction] = useState(null);
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");

  const filteredExpenses = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return expenses.filter((item) => {
      if (timeFilter === "ALL") return true;

      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);

      if (timeFilter === "TODAY") {
        return itemDate.getTime() === today.getTime();
      }

      if (timeFilter === "WEEK") {
        const diffTime = Math.abs(today - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }

      if (timeFilter === "MONTH") {
        return (
          itemDate.getFullYear() === today.getFullYear() &&
          itemDate.getMonth() === today.getMonth()
        );
      }
      return true;
    });
  }, [expenses, timeFilter]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [filteredExpenses]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/expenses`, {
        headers: { Authorization: `Bearer ${aToken}` }
      });
      if (data.success) {
        setExpenses(data.expenses || []);
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
    if (aToken) fetchExpenses();
  }, [aToken]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setPasswordConfirmAction(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const requestPasswordConfirmation = (onConfirm) => {
    setPasswordConfirmAction(() => onConfirm);
    setConfirmPasswordVal("");
  };

  const handleVerifyPasswordConfirm = async (e) => {
    e.preventDefault();
    if (!confirmPasswordVal) {
      toast.warning("Parolni kiriting");
      return;
    }
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/verify-password/admin-or-dentist`,
        { password: confirmPasswordVal },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      if (data.success) {
        const action = passwordConfirmAction;
        setPasswordConfirmAction(null);
        setConfirmPasswordVal("");
        if (action) action();
      } else {
        toast.error("Parol noto'g'ri");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      toast.warning("Summa noto'g'ri");
      return;
    }

    requestPasswordConfirmation(async () => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/admin/expenses`,
          form,
          { headers: { Authorization: `Bearer ${aToken}` } }
        );
        if (data.success) {
          toast.success(t.successAdd);
          setForm({
            category: "Materiallar",
            amount: "",
            date: new Date().toISOString().slice(0, 10),
            note: ""
          });
          fetchExpenses();
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        toast.error(err.message);
      }
    });
  };

  const handleDelete = async (id) => {
    requestPasswordConfirmation(async () => {
      try {
        const { data } = await axios.delete(`${backendUrl}/api/admin/expenses/${id}`, {
          headers: { Authorization: `Bearer ${aToken}` }
        });
        if (data.success) {
          toast.success(t.successDelete);
          fetchExpenses();
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        toast.error(err.message);
      }
    });
  };

  // Calculate total spent
  const totalSpent = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-850 tracking-tight">{t.title}</h1>
          <p className="text-sm text-slate-400 font-medium">Jami xarajat: <span className="font-bold text-red-650">{formatMoney(totalSpent)}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Add Expense Form Card */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-md font-bold text-slate-800 border-b pb-2">{t.addExpense}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.category}</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold bg-white cursor-pointer"
              >
                <option value="Materiallar">{t.materials}</option>
                <option value="Ijara">{t.rent}</option>
                <option value="Oylik">{t.salaries}</option>
                <option value="Kommunal">{t.utilities}</option>
                <option value="Boshqa">{t.other}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.amount}</label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={displayMoney(form.amount)}
                onChange={(e) => setForm({ ...form, amount: parseMoney(e.target.value) })}
                placeholder={t.amountPlaceholder}
                className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.date}</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.notes}</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder={t.notesPlaceholder}
                className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm h-20"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-2.5 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all text-sm"
            >
              {t.submit}
            </button>
          </form>
        </div>

        {/* Expenses List Table Card */}
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden lg:col-span-2">
          
          {/* Preset filters */}
          <div className="p-4 bg-slate-50 border-b flex items-center justify-between gap-3 flex-wrap">
            <div className="flex bg-slate-200/60 p-1 rounded-xl">
              {["ALL", "TODAY", "WEEK", "MONTH"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTimeFilter(opt)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                    timeFilter === opt ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {opt === "ALL" ? t.filterAll : opt === "TODAY" ? t.filterToday : opt === "WEEK" ? t.filterWeek : t.filterMonth}
                </button>
              ))}
            </div>
            
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.filteredTotal}</span>
              <span className="text-sm font-black text-slate-850">{formatMoney(filteredTotal)}</span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 font-medium">{t.loading}</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium">{t.noData}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-4 text-center w-12">{t.tableNo}</th>
                    <th className="px-5 py-4">{t.tableCategory}</th>
                    <th className="px-5 py-4 text-right">{t.tableAmount}</th>
                    <th className="px-5 py-4 text-center">{t.tableDate}</th>
                    <th className="px-5 py-4">{t.tableNotes}</th>
                    <th className="px-5 py-4 text-center w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700 text-sm">
                  {filteredExpenses.map((item, index) => {
                    const localCategory = item.category === "Materiallar" ? t.materials :
                                          item.category === "Ijara" ? t.rent :
                                          item.category === "Oylik" ? t.salaries :
                                          item.category === "Kommunal" ? t.utilities : t.other;
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 text-center text-slate-400 font-medium">{index + 1}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.category === "Materiallar" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                            item.category === "Ijara" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                            item.category === "Oylik" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            item.category === "Kommunal" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}>
                            {localCategory}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-slate-800">{formatMoney(item.amount)}</td>
                        <td className="px-5 py-4 text-center text-slate-550 font-medium">
                          {formatDMY(item.date)}
                        </td>
                        <td className="px-5 py-4 text-slate-500 max-w-xs truncate" title={item.note}>{item.note || "-"}</td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-500 hover:text-red-700 active:scale-95 transition-all text-xs font-semibold p-1 hover:bg-red-50 rounded-lg"
                          >
                            {t.deleteBtn}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      {/* ═══ PASSWORD CONFIRM MODAL OVERLAY ═══ */}
      {passwordConfirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={() => setPasswordConfirmAction(null)}>
          <div className="bg-white border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Harakatni tasdiqlash</h3>
              <button
                type="button"
                onClick={() => setPasswordConfirmAction(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleVerifyPasswordConfirm} className="p-5 space-y-4">
              <p className="text-xs font-semibold text-slate-550">
                Xarajatlar daftarini o'zgartirish (qo'shish/o'chirish) uchun administrator parolini kiriting.
              </p>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Parol</label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={confirmPasswordVal}
                  onChange={(e) => setConfirmPasswordVal(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordConfirmAction(null)}
                  className="flex-1 border text-slate-500 font-bold py-2 rounded-xl text-xs hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white font-bold py-2 rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all"
                >
                  Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  </div>
  );
}
