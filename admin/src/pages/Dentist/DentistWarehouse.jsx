import { useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { DentistContext } from "../../context/DentistContext";
import { formatMoney, formatDMY } from "@shared/date.js";
import { displayMoney, parseMoney } from "../../utils/moneyInput.js";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n === undefined || n === null || Number.isNaN(n)
    ? "0"
    : Number(n).toLocaleString("uz-UZ");

const fmtDate = (d) => {
  if (!d) return "—";
  return formatDMY(d);
};

const CATEGORIES = [
  { value: "CONSUMABLES", label: "Sarflovchi material", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "INSTRUMENTS",  label: "Uskuna / Jihoz",      color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "MEDICINES",    label: "Dori-darmon",          color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "OTHER",        label: "Boshqa",               color: "bg-slate-50 text-slate-600 border-slate-200" },
];
const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));

const UNITS = ["dona", "ml", "gr", "kg", "litr", "metr", "quti", "paket", "juft", "set"];

const REASONS_OUT = [
  "Bemor muolajasi uchun",
  "Klinika sarfi uchun",
  "Sinib/yaroqsiz bo'ldi",
  "Boshqa sabab",
];
const REASONS_IN = [
  "Yangi material sotib olindi",
  "Zaxira to'ldirildi",
  "Boshqadan olingan",
  "Boshqa sabab",
];

const emptyAdd = {
  name: "", category: "CONSUMABLES", unit: "dona",
  unitPrice: "", minQty: "2", initialQty: "", note: "",
};
const emptyIn = { qty: "", pricePerUnit: "", reason: "", note: "" };
const emptyOut = { qty: "", reason: "", note: "" };

// ── Modal wrapper ─────────────────────────────────────────────────────────────
const Modal = ({ onClose, title, children }) => {
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={ref}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-sm font-black text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ── main component ────────────────────────────────────────────────────────────
const DentistWarehouse = () => {
  const { backendUrl, dToken } = useContext(DentistContext);
  const auth = useMemo(() => ({ headers: { dtoken: dToken } }), [dToken]);

  const [items, setItems]         = useState([]);
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [activeTab, setActiveTab] = useState("stock"); // "stock" | "history"
  const [search, setSearch]       = useState("");
  const [filterCat, setFilterCat] = useState("ALL");
  const [logFilter, setLogFilter] = useState("ALL"); // ALL | IN | OUT

  // Modals
  const [addOpen,    setAddOpen]    = useState(false);
  const [inModal,    setInModal]    = useState(null);  // item
  const [outModal,   setOutModal]   = useState(null);  // item
  const [editModal,  setEditModal]  = useState(null);  // item

  // Forms
  const [addForm, setAddForm]   = useState(emptyAdd);
  const [inForm,  setInForm]    = useState(emptyIn);
  const [outForm, setOutForm]   = useState(emptyOut);
  const [editForm,setEditForm]  = useState({});
  const [saving,  setSaving]    = useState(false);

  // ── fetch ──
  const loadItems = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/dentist/my-warehouse/items`, auth);
      if (data.success) setItems(data.items || []);
    } catch { toast.error("Materiallar yuklashda xatolik"); }
    finally { setLoading(false); }
  };

  const loadLogs = async () => {
    try {
      const params = logFilter !== "ALL" ? { type: logFilter } : {};
      const { data } = await axios.get(`${backendUrl}/api/dentist/my-warehouse/logs`, { ...auth, params });
      if (data.success) setLogs(data.logs || []);
    } catch { toast.error("Tarix yuklashda xatolik"); }
  };

  useEffect(() => { if (dToken) { loadItems(); loadLogs(); } }, [dToken]);
  useEffect(() => { if (dToken && activeTab === "history") loadLogs(); }, [logFilter, activeTab]);

  // ── filtered ──
  const filteredItems = useMemo(() => {
    let list = items;
    if (filterCat !== "ALL") list = list.filter((i) => i.category === filterCat);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((i) => i.name.toLowerCase().includes(q));
    return list;
  }, [items, search, filterCat]);

  const lowStockCount = useMemo(() => items.filter((i) => i.quantity <= i.minQty).length, [items]);

  // ── totals ──
  const totalStockValue = useMemo(
    () => items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0),
    [items]
  );

  // ── handlers ──
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) return toast.warning("Material nomi majburiy");
    try {
      setSaving(true);
      const { data } = await axios.post(`${backendUrl}/api/dentist/my-warehouse/items`, {
        ...addForm,
        unitPrice: Number(addForm.unitPrice) || 0,
        minQty: Number(addForm.minQty) || 2,
        initialQty: Number(addForm.initialQty) || 0,
      }, auth);
      if (data.success) {
        toast.success(data.message);
        setAddOpen(false);
        setAddForm(emptyAdd);
        loadItems(); loadLogs();
      } else toast.error(data.message);
    } catch { toast.error("Xatolik yuz berdi"); }
    finally { setSaving(false); }
  };

  const handleStockIn = async (e) => {
    e.preventDefault();
    if (!inForm.qty || Number(inForm.qty) <= 0) return toast.warning("Miqdor kiritilmadi");
    try {
      setSaving(true);
      const { data } = await axios.post(
        `${backendUrl}/api/dentist/my-warehouse/items/${inModal._id}/stock-in`,
        { qty: Number(inForm.qty), pricePerUnit: Number(inForm.pricePerUnit) || undefined,
          reason: inForm.reason || "Yangi material sotib olindi", note: inForm.note },
        auth
      );
      if (data.success) {
        toast.success(data.message);
        setInModal(null); setInForm(emptyIn);
        loadItems(); loadLogs();
      } else toast.error(data.message);
    } catch { toast.error("Xatolik yuz berdi"); }
    finally { setSaving(false); }
  };

  const handleStockOut = async (e) => {
    e.preventDefault();
    if (!outForm.qty || Number(outForm.qty) <= 0) return toast.warning("Miqdor kiritilmadi");
    if (!outForm.reason) return toast.warning("Sabab tanlang");
    try {
      setSaving(true);
      const { data } = await axios.post(
        `${backendUrl}/api/dentist/my-warehouse/items/${outModal._id}/stock-out`,
        { qty: Number(outForm.qty), reason: outForm.reason, note: outForm.note },
        auth
      );
      if (data.success) {
        toast.success(data.message);
        setOutModal(null); setOutForm(emptyOut);
        loadItems(); loadLogs();
      } else toast.error(data.message);
    } catch { toast.error("Xatolik yuz berdi"); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await axios.put(
        `${backendUrl}/api/dentist/my-warehouse/items/${editModal._id}`,
        { ...editForm, unitPrice: Number(editForm.unitPrice) || 0, minQty: Number(editForm.minQty) || 0 },
        auth
      );
      if (data.success) {
        toast.success(data.message);
        setEditModal(null);
        loadItems();
      } else toast.error(data.message);
    } catch { toast.error("Xatolik yuz berdi"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`"${item.name}" ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/dentist/my-warehouse/items/${item._id}`, auth
      );
      if (data.success) { toast.success(data.message); loadItems(); }
      else toast.error(data.message);
    } catch { toast.error("Xatolik yuz berdi"); }
  };

  // ── styles ──
  const card = "bg-white border border-slate-200 rounded-2xl shadow-sm";
  const inputCls = "w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-800";
  const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1";
  const btnPrimary = "px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50";
  const btnGhost = "px-4 py-2 border text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 active:scale-95 transition-all";

  return (
    <main className="w-full min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-primary rounded-full" />
            <div>
              <h1 className="text-2xl font-black text-slate-800">Mening Omborxonam</h1>
              <p className="text-xs text-slate-400 mt-0.5">Shaxsiy materiallar va stomatolog zaxirasi</p>
            </div>
          </div>
          <button
            onClick={() => { setAddForm(emptyAdd); setAddOpen(true); }}
            className={btnPrimary + " flex items-center gap-2 px-5 py-2.5 text-sm"}
          >
            <span className="text-base">+</span> Yangi material
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`${card} p-4`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jami turlar</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{items.length}</p>
            <p className="text-[10px] text-slate-400 mt-1">material turi</p>
          </div>
          <div className={`${card} p-4`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ombor qiymati</p>
            <p className="text-xl font-black text-indigo-600 mt-1">{formatMoney(totalStockValue)}</p>
            <p className="text-[10px] text-slate-400 mt-1">umumiy bozor narxi</p>
          </div>
          <div className={`${card} p-4 ${lowStockCount > 0 ? "border-rose-200 bg-rose-50/30" : ""}`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kam qoldiq</p>
            <p className={`text-2xl font-black mt-1 ${lowStockCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {lowStockCount}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">materialda qoldiq kam</p>
          </div>
          <div className={`${card} p-4`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Harakatlar</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{logs.length}</p>
            <p className="text-[10px] text-slate-400 mt-1">jami kirim/chiqim</p>
          </div>
        </div>

        {/* Tabs */}
        <nav className={`${card} p-1.5 flex gap-1.5`}>
          {[
            { key: "stock", label: "📦 Zaxira" },
            { key: "history", label: "📋 Harakatlar tarixi" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === key
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ── STOCK TAB ── */}
        {activeTab === "stock" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className={`${card} p-4 flex flex-col sm:flex-row gap-3 items-center`}>
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Material nomi bo'yicha qidirish..."
                className="w-full sm:flex-1 border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterCat("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterCat === "ALL" ? "bg-primary text-white" : "border text-slate-500 hover:bg-slate-50"}`}
                >
                  Barchasi
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setFilterCat(c.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterCat === c.value ? "bg-primary text-white" : "border text-slate-500 hover:bg-slate-50"}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className={`${card} overflow-hidden`}>
              {loading ? (
                <div className="py-16 text-center text-slate-400 font-medium">Yuklanmoqda...</div>
              ) : filteredItems.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <p className="text-4xl">📦</p>
                  <p className="text-slate-500 font-medium">
                    {items.length === 0 ? "Hali materiallar yo'q" : "Qidiruv bo'yicha topilmadi"}
                  </p>
                  {items.length === 0 && (
                    <button onClick={() => setAddOpen(true)} className={btnPrimary}>
                      + Birinchi materialni qo'shish
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-5 py-3">Material nomi</th>
                        <th className="px-5 py-3">Kategoriya</th>
                        <th className="px-5 py-3 text-center">Qoldiq</th>
                        <th className="px-5 py-3 text-right">Narxi</th>
                        <th className="px-5 py-3 text-right">Ombor qiymati</th>
                        <th className="px-5 py-3 text-center">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {filteredItems.map((item) => {
                        const isLow = item.quantity <= item.minQty;
                        const cat = CAT_MAP[item.category] || CAT_MAP.OTHER;
                        return (
                          <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="font-bold text-slate-800">{item.name}</div>
                              {isLow && (
                                <div className="text-[10px] text-rose-500 font-semibold mt-0.5">
                                  ⚠ Kam qoldiq (min: {fmt(item.minQty)} {item.unit})
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg border ${cat.color}`}>
                                {cat.label}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span className={`font-black text-base ${isLow ? "text-rose-600" : "text-slate-800"}`}>
                                {fmt(item.quantity)}
                              </span>
                              <span className="text-slate-400 text-xs ml-1">{item.unit}</span>
                            </td>
                            <td className="px-5 py-3 text-right text-slate-600 font-semibold">
                              {formatMoney(item.unitPrice)}
                            </td>
                            <td className="px-5 py-3 text-right font-bold text-indigo-700">
                              {formatMoney(item.quantity * item.unitPrice)}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex gap-1.5 justify-center">
                                <button
                                  onClick={() => { setInModal(item); setInForm({ ...emptyIn, pricePerUnit: item.unitPrice }); }}
                                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                                  title="Kirim"
                                >
                                  + Kirim
                                </button>
                                <button
                                  onClick={() => { setOutModal(item); setOutForm(emptyOut); }}
                                  disabled={item.quantity <= 0}
                                  className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-40"
                                  title="Chiqim"
                                >
                                  − Chiqim
                                </button>
                                <button
                                  onClick={() => { setEditModal(item); setEditForm({ name: item.name, category: item.category, unit: item.unit, unitPrice: item.unitPrice, minQty: item.minQty }); }}
                                  className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold rounded-lg hover:bg-slate-100 transition-colors"
                                  title="Tahrirlash"
                                >
                                  ✎
                                </button>
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="px-2.5 py-1 bg-slate-50 text-slate-400 border border-slate-200 text-[10px] font-bold rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                                  title="O'chirish"
                                >
                                  🗑
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

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {/* Filter row */}
            <div className={`${card} p-4 flex gap-2 items-center flex-wrap`}>
              <span className="text-xs font-bold text-slate-500 mr-2">Ko'rsatish:</span>
              {[
                { v: "ALL", label: "Barchasi" },
                { v: "IN",  label: "🟢 Kirim" },
                { v: "OUT", label: "🔴 Chiqim" },
              ].map(({ v, label }) => (
                <button
                  key={v}
                  onClick={() => setLogFilter(v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${logFilter === v ? "bg-primary text-white" : "border text-slate-500 hover:bg-slate-50"}`}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={loadLogs}
                className={`ml-auto px-3 py-1.5 rounded-xl border text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all`}
              >
                ↻ Yangilash
              </button>
            </div>

            <div className={`${card} overflow-hidden`}>
              {logs.length === 0 ? (
                <div className="py-16 text-center text-slate-400 font-medium">Harakatlar tarixi topilmadi</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-5 py-3">Sana</th>
                        <th className="px-5 py-3 text-center">Tur</th>
                        <th className="px-5 py-3">Material</th>
                        <th className="px-5 py-3">Sabab</th>
                        <th className="px-5 py-3 text-center">Miqdor</th>
                        <th className="px-5 py-3 text-right">Narxi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs">
                      {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3 whitespace-nowrap text-slate-500">
                            {fmtDate(log.date || log.createdAt)}
                          </td>
                          <td className="px-5 py-3 text-center">
                            {log.type === "IN" ? (
                              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                                ↑ Kirim
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold rounded-full">
                                ↓ Chiqim
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <div className="font-bold text-slate-800">{log.itemId?.name || "O'chirilgan"}</div>
                            {log.itemId?.category && (
                              <div className="text-[10px] text-slate-400">
                                {CAT_MAP[log.itemId.category]?.label || log.itemId.category}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 text-slate-600 max-w-[180px] truncate">
                            {log.reason}
                            {log.note && <div className="text-[10px] text-slate-400 italic truncate">{log.note}</div>}
                          </td>
                          <td className="px-5 py-3 text-center font-semibold text-slate-800">
                            {log.type === "IN" ? "+" : "−"}{fmt(log.qty)}{" "}
                            <span className="text-slate-400 font-normal">{log.itemId?.unit || ""}</span>
                          </td>
                          <td className={`px-5 py-3 text-right font-bold ${log.type === "IN" ? "text-emerald-600" : "text-rose-600"}`}>
                            {formatMoney(log.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ── ADD MODAL ── */}
      {addOpen && (
        <Modal onClose={() => setAddOpen(false)} title="📦 Yangi material qo'shish">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className={labelCls}>Material nomi *</label>
              <input className={inputCls} value={addForm.name} onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))} placeholder="Masalan: Plomba, Novocaine, Stakan..." autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Kategoriya</label>
                <select className={inputCls} value={addForm.category} onChange={(e) => setAddForm((p) => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>O'lchov birligi</label>
                <select className={inputCls} value={addForm.unit} onChange={(e) => setAddForm((p) => ({ ...p, unit: e.target.value }))}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Dona narxi (so'm)</label>
                <input type="text" inputMode="numeric" className={inputCls} value={displayMoney(addForm.unitPrice)} onChange={(e) => setAddForm((p) => ({ ...p, unitPrice: parseMoney(e.target.value) }))} placeholder="Masalan: 50 000" />
              </div>
              <div>
                <label className={labelCls}>Min. qoldiq ogohlantirish</label>
                <input type="number" min="0" className={inputCls} value={addForm.minQty} onChange={(e) => setAddForm((p) => ({ ...p, minQty: e.target.value }))} placeholder="2" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Boshlang'ich qoldiq (ixtiyoriy)</label>
              <input type="number" min="0" step="any" className={inputCls} value={addForm.initialQty} onChange={(e) => setAddForm((p) => ({ ...p, initialQty: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Izoh</label>
              <input className={inputCls} value={addForm.note} onChange={(e) => setAddForm((p) => ({ ...p, note: e.target.value }))} placeholder="Qo'shimcha ma'lumot..." />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setAddOpen(false)} className={btnGhost + " flex-1"}>Bekor qilish</button>
              <button type="submit" disabled={saving} className={btnPrimary + " flex-1"}>{saving ? "Qo'shilmoqda..." : "✓ Qo'shish"}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── STOCK-IN MODAL ── */}
      {inModal && (
        <Modal onClose={() => setInModal(null)} title={`🟢 Kirim — ${inModal.name}`}>
          <p className="text-xs text-slate-500 mb-4">Joriy qoldiq: <strong>{fmt(inModal.quantity)} {inModal.unit}</strong></p>
          <form onSubmit={handleStockIn} className="space-y-4">
            <div>
              <label className={labelCls}>Miqdor ({inModal.unit}) *</label>
              <input type="number" min="0.01" step="any" required autoFocus className={inputCls} value={inForm.qty} onChange={(e) => setInForm((p) => ({ ...p, qty: e.target.value }))} placeholder="Qancha qo'shilmoqda?" />
            </div>
            <div>
              <label className={labelCls}>Sotib olish narxi (dona uchun, ixtiyoriy)</label>
              <input type="text" inputMode="numeric" className={inputCls} value={displayMoney(inForm.pricePerUnit)} onChange={(e) => setInForm((p) => ({ ...p, pricePerUnit: parseMoney(e.target.value) }))} placeholder={`Joriy narx: ${displayMoney(String(inModal.unitPrice))} so'm`} />
            </div>
            <div>
              <label className={labelCls}>Sabab</label>
              <select className={inputCls} value={inForm.reason} onChange={(e) => setInForm((p) => ({ ...p, reason: e.target.value }))}>
                <option value="">Sababni tanlang...</option>
                {REASONS_IN.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Izoh</label>
              <input className={inputCls} value={inForm.note} onChange={(e) => setInForm((p) => ({ ...p, note: e.target.value }))} placeholder="Ixtiyoriy..." />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setInModal(null)} className={btnGhost + " flex-1"}>Bekor qilish</button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                {saving ? "Kiritilmoqda..." : "+ Kirim qilish"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── STOCK-OUT MODAL ── */}
      {outModal && (
        <Modal onClose={() => setOutModal(null)} title={`🔴 Chiqim — ${outModal.name}`}>
          <p className="text-xs text-slate-500 mb-4">Joriy qoldiq: <strong className={outModal.quantity <= outModal.minQty ? "text-rose-600" : ""}>{fmt(outModal.quantity)} {outModal.unit}</strong></p>
          <form onSubmit={handleStockOut} className="space-y-4">
            <div>
              <label className={labelCls}>Miqdor ({outModal.unit}) *</label>
              <input type="number" min="0.01" max={outModal.quantity} step="any" required autoFocus className={inputCls} value={outForm.qty} onChange={(e) => setOutForm((p) => ({ ...p, qty: e.target.value }))} placeholder={`Maks: ${fmt(outModal.quantity)}`} />
            </div>
            <div>
              <label className={labelCls}>Sabab *</label>
              <select required className={inputCls} value={outForm.reason} onChange={(e) => setOutForm((p) => ({ ...p, reason: e.target.value }))}>
                <option value="">Sababni tanlang...</option>
                {REASONS_OUT.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Izoh</label>
              <input className={inputCls} value={outForm.note} onChange={(e) => setOutForm((p) => ({ ...p, note: e.target.value }))} placeholder="Bemor ismi, muolaja turi..." />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setOutModal(null)} className={btnGhost + " flex-1"}>Bekor qilish</button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                {saving ? "Sarflanmoqda..." : "− Chiqim qilish"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── EDIT MODAL ── */}
      {editModal && (
        <Modal onClose={() => setEditModal(null)} title={`✎ Tahrirlash — ${editModal.name}`}>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className={labelCls}>Material nomi *</label>
              <input className={inputCls} value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Kategoriya</label>
                <select className={inputCls} value={editForm.category} onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>O'lchov birligi</label>
                <select className={inputCls} value={editForm.unit} onChange={(e) => setEditForm((p) => ({ ...p, unit: e.target.value }))}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Dona narxi (so'm)</label>
                <input type="text" inputMode="numeric" className={inputCls} value={displayMoney(String(editForm.unitPrice))} onChange={(e) => setEditForm((p) => ({ ...p, unitPrice: parseMoney(e.target.value) }))} />
              </div>
              <div>
                <label className={labelCls}>Min. qoldiq</label>
                <input type="number" min="0" className={inputCls} value={editForm.minQty} onChange={(e) => setEditForm((p) => ({ ...p, minQty: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setEditModal(null)} className={btnGhost + " flex-1"}>Bekor qilish</button>
              <button type="submit" disabled={saving} className={btnPrimary + " flex-1"}>{saving ? "Saqlanmoqda..." : "✓ Saqlash"}</button>
            </div>
          </form>
        </Modal>
      )}

    </main>
  );
};

export default DentistWarehouse;
