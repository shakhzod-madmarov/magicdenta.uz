import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext.jsx";
import { formatMoney, formatDateTimeDMY } from "@shared/date.js";
import DualPasswordModal from "../../components/DualPasswordModal.jsx";

const formatNumber = (val) => {
  if (val === undefined || val === null || Number.isNaN(val)) return "0";
  return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const T = {
  uz: {
    title: "Omborxona va Zaxira nazorati",
    tabStock: "Ombor qoldig'i",
    tabLogs: "Harakatlar tarixi",
    addItemBtn: "Yangi material qo'shish",
    loading: "Yuklanmoqda...",
    noData: "Materiallar topilmadi",
    noLogs: "Harakatlar topilmadi",
    itemName: "Material nomi",
    category: "Kategoriya",
    qty: "Miqdor / Qoldiq",
    unit: "O'lchov birligi",
    unitPrice: "Oxirgi sotib olish narxi",
    minQty: "Minimal ogohlantirish miqdori",
    initialQty: "Boshlang'ich miqdor",
    save: "Saqlash",
    cancel: "Bekor qilish",
    search: "Qidirish...",
    lowStock: "Kam qolganlar",
    kirimBtn: "Kirim",
    chiqimBtn: "Chiqim",
    reason: "Sabab / Izoh",
    dentist: "Mas'ul stomatolog",
    operator: "Operator",
    note: "Izoh",
    pricePerUnit: "Dona narxi (so'm)",
    successAdd: "Yangi material ro'yxatga olindi",
    successKirim: "Kirim muvaffaqiyatli bajarildi va xarajatlarga qo'shildi",
    successChiqim: "Chiqim muvaffaqiyatli bajarildi",
    errFillAll: "Iltimos, barcha majburiy maydonlarni to'ldiring",
    statusLow: "Kam qoldi",
    statusOk: "Yetarli",
    consumables: "Sarflovchi material",
    instruments: "Uskuna / Jihoz",
    medicines: "Dori-darmon",
    otherCategory: "Boshqa",
  },
  ru: {
    title: "Склад и управление запасами",
    tabStock: "Остатки на складе",
    tabLogs: "История движения",
    addItemBtn: "Добавить новый материал",
    loading: "Загрузка...",
    noData: "Материалы не найдены",
    noLogs: "Движения не найдены",
    itemName: "Название материала",
    category: "Категория",
    qty: "Кол-во / Остаток",
    unit: "Ед. изм.",
    unitPrice: "Последняя цена покупки",
    minQty: "Минимальный порог предупреждения",
    initialQty: "Начальное количество",
    save: "Сохранить",
    cancel: "Отмена",
    search: "Поиск...",
    lowStock: "Мало на складе",
    kirimBtn: "Приход",
    chiqimBtn: "Расход",
    reason: "Причина / Описание",
    dentist: "Ответственный врач",
    operator: "Оператор",
    note: "Примечание",
    pricePerUnit: "Цена за единицу (сум)",
    successAdd: "Материал успешно зарегистрирован",
    successKirim: "Приход успешно оформлен и добавлен в расходы",
    successChiqim: "Расход успешно оформлен",
    errFillAll: "Пожалуйста, заполните все обязательные поля",
    statusLow: "Мало",
    statusOk: "Достаточно",
    consumables: "Расходный материал",
    instruments: "Инструменты / Оборудование",
    medicines: "Медикаменты",
    otherCategory: "Другое",
  },
  en: {
    title: "Warehouse & Stock Control",
    tabStock: "Stock Balances",
    tabLogs: "Movement History",
    addItemBtn: "Add New Material",
    loading: "Loading...",
    noData: "Materials not found",
    noLogs: "Movements not found",
    itemName: "Material Name",
    category: "Category",
    qty: "Qty / Balance",
    unit: "Unit",
    unitPrice: "Last Purchase Price",
    minQty: "Min Warning Qty",
    initialQty: "Initial Qty",
    save: "Save",
    cancel: "Cancel",
    search: "Search...",
    lowStock: "Low Stock",
    kirimBtn: "Stock In",
    chiqimBtn: "Stock Out",
    reason: "Reason / Info",
    dentist: "Responsible Dentist",
    operator: "Operator",
    note: "Notes",
    pricePerUnit: "Price per Unit (UZS)",
    successAdd: "New material registered",
    successKirim: "Stock-in succeeded and added to expenses",
    successChiqim: "Stock-out succeeded",
    errFillAll: "Please fill all required fields",
    statusLow: "Low",
    statusOk: "Sufficient",
    consumables: "Consumables",
    instruments: "Instruments / Equipment",
    medicines: "Medicines",
    otherCategory: "Other",
  },
  tg: {
    title: "Анбор ва назорати захираҳо",
    tabStock: "Бақияи анбор",
    tabLogs: "Таърихи ҳаракат",
    addItemBtn: "Иловаи маводи нав",
    loading: "Дар ҳоли боргирӣ...",
    noData: "Маводҳо ёфт нашуданд",
    noLogs: "Ҳаракатҳо ёфт нашуданд",
    itemName: "Номи мавод",
    category: "Категория",
    qty: "Миқдор / Бақия",
    unit: "Воҳиди ченкунӣ",
    unitPrice: "Нархи охирини харид",
    minQty: "Миқдори ҳадди ақал",
    initialQty: "Миқдори аввалия",
    save: "Сабт кардан",
    cancel: "Интихобро лағв кунед",
    search: "Ҷустуҷӯ...",
    lowStock: "Кам мондаҳо",
    kirimBtn: "Воридот",
    chiqimBtn: "Хориҷот",
    reason: "Сабаб / Эзоҳ",
    dentist: "Духтури масъул",
    operator: "Оператор",
    note: "Эзоҳ",
    pricePerUnit: "Нархи дона (сӯм)",
    successAdd: "Маводи нав ба қайд гирифта шуд",
    successKirim: "Воридот бомуваффақият иҷро шуд ва ба хароҷот илова гардид",
    successChiqim: "Хориҷот бомуваффақият иҷро шуд",
    errFillAll: "Лутфан ҳамаи майдонҳои ҳатмиро пур кунед",
    statusLow: "Кам монд",
    statusOk: "Кофӣ",
    consumables: "Маводи масрафӣ",
    instruments: "Таҷҳизот / Асбобҳо",
    medicines: "Доруворӣ",
    otherCategory: "Дигар",
  }
};

export default function Warehouse() {
  const { backendUrl, aToken, dentists, getAllDoctors } = useContext(AdminContext);
  const [lang, setLang] = useState(localStorage.getItem("language") || "uz");
  const t = T[lang] || T.uz;

  useEffect(() => {
    const handler = () => setLang(localStorage.getItem("language") || "uz");
    window.addEventListener("language-change", handler);
    return () => window.removeEventListener("language-change", handler);
  }, []);

  const [subTab, setSubTab] = useState("stock"); // stock | logs
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("ALL"); // ALL | TODAY | WEEK | MONTH

  const filteredLogs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return logs.filter((log) => {
      if (timeFilter === "ALL") return true;

      const logDate = new Date(log.date || log.createdAt);
      logDate.setHours(0, 0, 0, 0);

      if (timeFilter === "TODAY") {
        return logDate.getTime() === today.getTime();
      }

      if (timeFilter === "WEEK") {
        const diffTime = Math.abs(today - logDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }

      if (timeFilter === "MONTH") {
        return (
          logDate.getFullYear() === today.getFullYear() &&
          logDate.getMonth() === today.getMonth()
        );
      }
      return true;
    });
  }, [logs, timeFilter]);

  const filteredLogsTotal = useMemo(() => {
    return filteredLogs
      .filter((log) => log.type === "IN")
      .reduce((sum, log) => sum + (log.totalPrice || 0), 0);
  }, [filteredLogs]);

  // Modals
  const [activeModal, setActiveModal] = useState(null); // null | 'add' | 'kirim' | 'chiqim'
  const [selectedItem, setSelectedItem] = useState(null);
  const [passwordConfirmAction, setPasswordConfirmAction] = useState(null);
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");
  const [passwordConfirmType, setPasswordConfirmType] = useState("admin");
  const [dualPasswordAction, setDualPasswordAction] = useState(null); // For Chiqim (admin + dentist)

  // Form states
  const [newItemForm, setNewItemForm] = useState({
    name: "",
    category: "CONSUMABLES",
    unit: "dona",
    minQty: "5",
    initialQty: "0",
    unitPrice: "0"
  });

  const [kirimForm, setKirimForm] = useState({
    qty: "",
    pricePerUnit: "",
    note: ""
  });

  const [chiqimForm, setChiqimForm] = useState({
    qty: "",
    reason: "Olib ketildi / Chiqim qilindi",
    dentistId: "",
    note: ""
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/warehouse/items`, {
        headers: { Authorization: `Bearer ${aToken}` }
      });
      if (data.success) {
        setItems(data.items || []);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/warehouse/logs`, {
        headers: { Authorization: `Bearer ${aToken}` }
      });
      if (data.success) {
        setLogs(data.logs || []);
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
    if (aToken) {
      fetchItems();
      getAllDoctors?.();
    }
  }, [aToken]);

  useEffect(() => {
    if (aToken && subTab === "logs") {
      fetchLogs();
    } else if (aToken && subTab === "stock") {
      fetchItems();
    }
  }, [subTab, aToken]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveModal(null);
        setPasswordConfirmAction(null);
        setDualPasswordAction(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const requestPasswordConfirmation = (onConfirm, type = "admin") => {
    setPasswordConfirmAction(() => onConfirm);
    setConfirmPasswordVal("");
    setPasswordConfirmType(type);
  };

  const handleVerifyPasswordConfirm = async (e) => {
    e.preventDefault();
    if (!confirmPasswordVal) {
      toast.warning("Parolni kiriting");
      return;
    }
    try {
      const endpoint = `${backendUrl}/api/admin/verify-password/admin-or-dentist`;
      const { data } = await axios.post(
        endpoint,
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

  const handleAddNewItem = async (e) => {
    e.preventDefault();
    if (!newItemForm.name || !newItemForm.category || !newItemForm.unit) {
      toast.warning(t.errFillAll);
      return;
    }
    requestPasswordConfirmation(async () => {
      try {
        const { data } = await axios.post(`${backendUrl}/api/admin/warehouse/items`, newItemForm, {
          headers: { Authorization: `Bearer ${aToken}` }
        });
        if (data.success) {
          toast.success(t.successAdd);
          setActiveModal(null);
          setNewItemForm({
            name: "",
            category: "CONSUMABLES",
            unit: "dona",
            minQty: "5",
            initialQty: "0",
            unitPrice: "0"
          });
          fetchItems();
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        toast.error(err.message);
      }
    });
  };

  const handleKirimSubmit = async (e) => {
    e.preventDefault();
    if (!kirimForm.qty || Number(kirimForm.qty) <= 0) {
      toast.warning(t.errFillAll);
      return;
    }
    requestPasswordConfirmation(async () => {
      try {
        const { data } = await axios.post(`${backendUrl}/api/admin/warehouse/items/${selectedItem._id}/stock-in`, kirimForm, {
          headers: { Authorization: `Bearer ${aToken}` }
        });
        if (data.success) {
          toast.success(t.successKirim);
          setActiveModal(null);
          setKirimForm({ qty: "", pricePerUnit: "", note: "" });
          fetchItems();
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        toast.error(err.message);
      }
    });
  };

  const handleChiqimSubmit = async (e) => {
    e.preventDefault();
    if (!chiqimForm.qty || Number(chiqimForm.qty) <= 0) {
      toast.warning(t.errFillAll);
      return;
    }
    // Chiqim requires BOTH admin AND dentist password
    setDualPasswordAction(() => async () => {
      try {
        const { data } = await axios.post(`${backendUrl}/api/admin/warehouse/items/${selectedItem._id}/stock-out`, chiqimForm, {
          headers: { Authorization: `Bearer ${aToken}` }
        });
        if (data.success) {
          toast.success(t.successChiqim);
          setActiveModal(null);
          setChiqimForm({ qty: "", reason: "Olib ketildi / Chiqim qilindi", dentistId: "", note: "" });
          fetchItems();
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        toast.error(err.message);
      }
    });
  };

  // Filters
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case "CONSUMABLES": return t.consumables;
      case "INSTRUMENTS": return t.instruments;
      case "MEDICINES": return t.medicines;
      default: return t.otherCategory;
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "CONSUMABLES": return "bg-sky-50 text-sky-600 border-sky-100";
      case "INSTRUMENTS": return "bg-purple-50 text-purple-600 border-purple-100";
      case "MEDICINES": return "bg-teal-50 text-teal-600 border-teal-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      
      {/* Tab Switcher & Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setSubTab("stock")}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              subTab === "stock"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.tabStock}
          </button>
          <button
            onClick={() => setSubTab("logs")}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              subTab === "logs"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.tabLogs}
          </button>
        </div>

        {subTab === "stock" && (
          <button
            onClick={() => setActiveModal("add")}
            className="bg-primary text-white text-xs font-black px-5 py-2.5 rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
          >
            + {t.addItemBtn}
          </button>
        )}
      </div>

      {/* ── STOCK REGISTRY TAB ── */}
      {subTab === "stock" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
          </div>

          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-medium">{t.loading}</div>
            ) : filteredItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium">{t.noData}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">{t.itemName}</th>
                      <th className="px-6 py-4">{t.category}</th>
                      <th className="px-6 py-4 text-center">{t.qty}</th>
                      <th className="px-6 py-4 text-right">{t.unitPrice}</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 text-sm">
                    {filteredItems.map((item) => {
                      const isLow = item.quantity <= item.minQty;
                      return (
                        <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-800">{item.name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getCategoryColor(item.category)}`}>
                              {getCategoryLabel(item.category)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-slate-900">
                             {formatNumber(item.quantity)} <span className="text-slate-400 font-medium text-xs">{item.unit}</span>
                           </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-600">{formatMoney(item.unitPrice)}</td>
                          <td className="px-6 py-4 text-center">
                            {isLow ? (
                              <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                                {t.statusLow}
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                {t.statusOk}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setActiveModal("kirim");
                                }}
                                className="bg-emerald-50 hover:bg-emerald-500 hover:text-white border border-emerald-200 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                              >
                                {t.kirimBtn}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setActiveModal("chiqim");
                                }}
                                className="bg-amber-50 hover:bg-amber-500 hover:text-white border border-amber-200 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                              >
                                {t.chiqimBtn}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TRANSACTION LOGS TAB ── */}
      {subTab === "logs" && (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          
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
                  {opt === "ALL" ? "Barchasi" : opt === "TODAY" ? "Bugun" : opt === "WEEK" ? "Hafta" : "Oy"}
                </button>
              ))}
            </div>
            
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kirim xarajatlari jami</span>
              <span className="text-sm font-black text-slate-850">{formatMoney(filteredLogsTotal)}</span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 font-medium">{t.loading}</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium">{t.noLogs}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Sana</th>
                    <th className="px-6 py-4">Operatsiya</th>
                    <th className="px-6 py-4">Material</th>
                    <th className="px-6 py-4 text-center">Miqdor</th>
                    <th className="px-6 py-4 text-right">Qiymat</th>
                    <th className="px-6 py-4">Izoh / stomatolog</th>
                    <th className="px-6 py-4">{t.operator}</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700 text-sm">
                  {filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {formatDateTimeDMY(log.date || log.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {log.type === "IN" ? (
                          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                            {t.kirimBtn}
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                            {t.chiqimBtn}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {log.itemId?.name || "O'chirilgan maxsulot"}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-900">
                        {formatNumber(log.qty)} <span className="text-slate-400 font-medium text-xs">{log.itemId?.unit || ""}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {log.type === "IN" ? formatMoney(log.totalPrice) : "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs max-w-xs truncate">
                        {log.type === "OUT" && log.dentistId ? (
                          <span className="font-semibold text-primary">👨‍⚕️ {log.dentistId.name}</span>
                        ) : (
                          log.reason
                        )}
                        {log.note && <div className="text-slate-400 text-[10px] italic mt-0.5">{log.note}</div>}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-semibold text-xs">{log.operatorName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ ADD ITEM MODAL ═══ */}
      {activeModal === "add" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-white border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800">{t.addItemBtn}</h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-xl font-bold">
                &times;
              </button>
            </div>
            <form onSubmit={handleAddNewItem} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.itemName} *</label>
                <input
                  type="text"
                  required
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  placeholder="Masalan: Glove steril..."
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.category} *</label>
                  <select
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white"
                  >
                    <option value="CONSUMABLES">{t.consumables}</option>
                    <option value="INSTRUMENTS">{t.instruments}</option>
                    <option value="MEDICINES">{t.medicines}</option>
                    <option value="OTHER">{t.otherCategory}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.unit} *</label>
                  <input
                    type="text"
                    required
                    value={newItemForm.unit}
                    onChange={(e) => setNewItemForm({ ...newItemForm, unit: e.target.value })}
                    placeholder="dona, quti..."
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.initialQty}</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemForm.initialQty}
                    onChange={(e) => setNewItemForm({ ...newItemForm, initialQty: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.pricePerUnit} (UZS)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemForm.unitPrice}
                    onChange={(e) => setNewItemForm({ ...newItemForm, unitPrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.minQty}</label>
                <input
                  type="number"
                  min="0"
                  value={newItemForm.minQty}
                  onChange={(e) => setNewItemForm({ ...newItemForm, minQty: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ KIRIM (STOCK IN) MODAL ═══ */}
      {activeModal === "kirim" && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-white border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between items-center bg-emerald-50/50">
              <div>
                <h2 className="text-sm font-black text-emerald-800">📥 {t.kirimBtn} — {selectedItem.name}</h2>
                <p className="text-xs text-emerald-600 mt-0.5">Joriy qoldiq: {selectedItem.quantity} {selectedItem.unit}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-xl font-bold">
                &times;
              </button>
            </div>
            <form onSubmit={handleKirimSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.qty} *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0.001"
                      step="any"
                      value={kirimForm.qty}
                      onChange={(e) => setKirimForm({ ...kirimForm, qty: e.target.value })}
                      placeholder="Masalan: 10"
                      className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{selectedItem.unit}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.pricePerUnit} (UZS) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={kirimForm.pricePerUnit}
                    onChange={(e) => setKirimForm({ ...kirimForm, pricePerUnit: e.target.value })}
                    placeholder="Masalan: 50000"
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.note}</label>
                <textarea
                  value={kirimForm.note}
                  onChange={(e) => setKirimForm({ ...kirimForm, note: e.target.value })}
                  placeholder="Xarid haqida qo'shimcha ma'lumotlar..."
                  rows="2"
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white resize-none"
                />
              </div>

              <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block tracking-wide">Sof xarajat</span>
                <span className="text-lg font-black text-emerald-600 block mt-0.5">
                  {formatMoney(Number(kirimForm.qty || 0) * Number(kirimForm.pricePerUnit || 0))}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 block mt-1">
                  * Ushbu xarajat avtomatik tarzda "Materiallar" xarajatlari ro'yxatiga qo'shiladi.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ CHIQIM (STOCK OUT) MODAL ═══ */}
      {activeModal === "chiqim" && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-white border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between items-center bg-amber-50/50">
              <div>
                <h2 className="text-sm font-black text-amber-800">📤 {t.chiqimBtn} — {selectedItem.name}</h2>
                <p className="text-xs text-amber-600 mt-0.5">Joriy qoldiq: {selectedItem.quantity} {selectedItem.unit}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-xl font-bold">
                &times;
              </button>
            </div>
            <form onSubmit={handleChiqimSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.qty} *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0.001"
                      max={selectedItem.quantity}
                      step="any"
                      value={chiqimForm.qty}
                      onChange={(e) => setChiqimForm({ ...chiqimForm, qty: e.target.value })}
                      placeholder="Masalan: 2"
                      className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{selectedItem.unit}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.dentist}</label>
                  <select
                    value={chiqimForm.dentistId}
                    onChange={(e) => setChiqimForm({ ...chiqimForm, dentistId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white"
                  >
                    <option value="">-- Tanlang (ixtiyoriy) --</option>
                    {dentists?.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.reason} *</label>
                <input
                  type="text"
                  required
                  value={chiqimForm.reason}
                  onChange={(e) => setChiqimForm({ ...chiqimForm, reason: e.target.value })}
                  placeholder="Muolaja uchun olindi, muddati o'tdi..."
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.note}</label>
                <textarea
                  value={chiqimForm.note}
                  onChange={(e) => setChiqimForm({ ...chiqimForm, note: e.target.value })}
                  placeholder="Qo'shimcha ma'lumotlar..."
                  rows="2"
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
                {passwordConfirmType === "admin_or_doctor" 
                  ? "Ushbu harakatni tasdiqlash uchun administrator yoki mas'ul stomatolog parolini kiriting."
                  : "Ushbu harakatni tasdiqlash uchun administrator parolini kiriting."}
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

      {/* ═══ DUAL PASSWORD MODAL — Chiqim (admin + dentist required) ═══ */}
      {dualPasswordAction && (
        <DualPasswordModal
          title="Chiqimni tasdiqlash"
          description="Chiqim uchun administrator va mas'ul stomatolog paroli talab etiladi."
          dentistId={chiqimForm.dentistId}
          onConfirm={() => {
            const fn = dualPasswordAction;
            setDualPasswordAction(null);
            fn();
          }}
          onCancel={() => setDualPasswordAction(null)}
        />
      )}

    </div>
  );
}
