import { useContext, useEffect, useMemo, useState } from "react";
import { DentistContext } from "../../context/DentistContext";
import { formatDateTimeISO } from "../../../../shared/date.js";
import { displayMoney, parseMoney } from "../../utils/moneyInput.js";

const emptyForm = {
  title: "",
  diagnosis: "",
  teeth: "",
  procedures: "",
  nextStep: "",
  medicines: "",
  notes: "",
  isFavorite: false,
  price: "",
};

const PreviewLine = ({ label, value }) => {
  if (!String(value || "").trim()) return null;
  return (
    <p className="text-xs text-gray-600">
      <b>{label}:</b> {value}
    </p>
  );
};

const DentistTemplates = () => {
  const { dToken, templates, loadTemplates, saveTemplate, removeTemplate } =
    useContext(DentistContext);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  // Dori shabloni helper states
  const [doriName, setDoriName] = useState("");
  const [doriMahal, setDoriMahal] = useState("2");
  const [doriInstruction, setDoriInstruction] = useState("ovqatdan keyin");

  useEffect(() => {
    if (dToken) loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dToken]);

  const filtered = useMemo(() => {
    const list = Array.isArray(templates) ? templates : [];
    const term = String(search || "").trim().toLowerCase();
    if (!term) return list;

    return list.filter((item) =>
      [
        item?.title,
        item?.diagnosis,
        item?.teeth,
        item?.procedures,
        item?.nextStep,
        item?.medicines,
        item?.notes,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [templates, search]);

  const resetForm = () => {
    setEditingId("");
    setForm(emptyForm);
  };

  const startEdit = (template) => {
    setEditingId(String(template?._id || ""));
    setForm({
      title: template?.title || "",
      diagnosis: template?.diagnosis || "",
      teeth: template?.teeth || "",
      procedures: template?.procedures || "",
      nextStep: template?.nextStep || "",
      medicines: template?.medicines || "",
      notes: template?.notes || "",
      isFavorite: Boolean(template?.isFavorite),
      price: template?.price || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    const result = await saveTemplate(form, editingId);
    setSaving(false);

    if (result?.success) {
      resetForm();
    }
  };

  const handleDelete = async (templateId) => {
    const id = String(templateId || "");
    if (!id || deletingId) return;

    const ok = window.confirm("Shablonni o‘chirmoqchimisiz?");
    if (!ok) return;

    setDeletingId(id);
    await removeTemplate(id);
    setDeletingId("");

    if (editingId === id) resetForm();
  };

  const addDoriHelper = () => {
    const name = String(doriName || "").trim();
    if (!name) return;

    const entry = `${name} - ${doriMahal} mahal, ${doriInstruction}`;
    setForm((prev) => {
      const existing = String(prev.medicines || "").trim();
      const medicines = existing ? `${existing}\n${entry}` : entry;
      return { ...prev, medicines };
    });

    setDoriName("");
  };

  return (
    <main className="w-full bg-gray-50 px-4 py-5 sm:px-6 min-h-screen">
      <section className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Shablonlar</h1>
            <p className="mt-1 text-sm text-gray-500">
              Tez tez ishlatiladigan diagnoz, tishlar, bajarilgan ishlar, tavsiya, dorilar va eslatmalarni oldindan tayyorlab qo‘ying.
            </p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Shablon qidirish..."
            className="h-10 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 lg:w-72"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingId ? "Shablonni tahrirlash" : "Yangi shablon"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Bir marta kiriting, keyin qabulni yakunlash oynasida bir bosishda qo‘llang.
                </p>
              </div>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Bekor qilish
                </button>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium">Shablon nomi *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Masalan: Karies plomba"
                  className="mt-1 h-10 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  maxLength={120}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Kasallik / diagnoz</label>
                <textarea
                  rows={3}
                  value={form.diagnosis}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, diagnosis: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 items-end">
                <div>
                  <label className="block text-sm font-medium">Tishlar</label>
                  <input
                    type="text"
                    value={form.teeth}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, teeth: e.target.value }))
                    }
                    placeholder="Masalan: 16, 17"
                    className="mt-1 h-10 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <label className="mb-2.5 flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFavorite}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, isFavorite: e.target.checked }))
                    }
                  />
                  Tezkor tanlovda ko‘rsatish
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium">Bajarilgan ishlar</label>
                <textarea
                  rows={3}
                  value={form.procedures}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, procedures: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Keyingi qadam</label>
                <textarea
                  rows={2}
                  value={form.nextStep}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nextStep: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Dori shabloni helper box */}
              <div className="border rounded-2xl p-4 bg-slate-50/80 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Dori shabloni
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Dori nomi, kuniga necha mahal va qabul qilish usulini tanlang. "Qo'shish" bosilganda matn dorilar maydoniga tushadi.
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={doriName}
                    onChange={(e) => setDoriName(e.target.value)}
                    placeholder="Masalan: Amoksitsillin 500 mg"
                    className="h-9 w-full rounded-lg border px-3 text-xs outline-none bg-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={doriMahal}
                      onChange={(e) => setDoriMahal(e.target.value)}
                      placeholder="2"
                      className="h-9 w-20 rounded-lg border px-3 text-xs outline-none bg-white text-center"
                    />
                    <select
                      value={doriInstruction}
                      onChange={(e) => setDoriInstruction(e.target.value)}
                      className="h-9 flex-1 rounded-lg border px-2 text-xs outline-none bg-white"
                    >
                      <option value="ovqatdan keyin">ovqatdan keyin</option>
                      <option value="ovqatdan oldin">ovqatdan oldin</option>
                      <option value="chayqash">chayqash</option>
                      <option value="farqi yo'q">farqi yo'q</option>
                      <option value="tunda">tunda</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={addDoriHelper}
                    className="w-full h-8 rounded-lg bg-slate-500 hover:bg-slate-600 text-white text-xs font-semibold transition"
                  >
                    Dorini qo'shish
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Dorilar</label>
                <textarea
                  rows={2}
                  value={form.medicines}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, medicines: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Eslatmalar</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Taxminiy narx (so‘m, ixtiyoriy)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayMoney(form.price)}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: parseMoney(e.target.value) }))
                  }
                  className="mt-1 h-10 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Masalan: 150 000"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 h-11 w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-white transition disabled:opacity-60"
            >
              {saving
                ? "Saqlanmoqda..."
                : editingId
                  ? "Shablonni yangilash"
                  : "Shablonni saqlash"}
            </button>
          </form>

          <section className="space-y-4">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Mavjud shablonlar
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Qabulni yakunlash oynasida tez tanlash uchun tayyor ro‘yxat.
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {filtered.length} ta
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
                Hozircha shablon yo‘q.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {filtered.map((item) => (
                  <article
                    key={item._id}
                    className="rounded-2xl border bg-white p-4 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-gray-900 break-words">
                              {item.title}
                            </h3>
                            {item.isFavorite ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                Tezkor
                              </span>
                            ) : null}
                            {item.price ? (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                {Number(item.price).toLocaleString()} so‘m
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Ishlatilgan: {Number(item.useCount || 0)} marta
                            {item.lastUsedAt
                              ? ` · Oxirgi: ${formatDateTimeISO(item.lastUsedAt)}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1 rounded-xl bg-gray-50 p-3">
                        <PreviewLine label="Diagnos" value={item.diagnosis} />
                        <PreviewLine label="Tishlar" value={item.teeth} />
                        <PreviewLine label="Bajarilgan ishlar" value={item.procedures} />
                        <PreviewLine label="Keyingi qadam" value={item.nextStep} />
                        <PreviewLine label="Dorilar" value={item.medicines} />
                        <PreviewLine label="Eslatmalar" value={item.notes} />
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="flex-1 h-9 rounded-xl border text-sm hover:bg-gray-50 transition"
                      >
                        Tahrirlash
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        disabled={deletingId === item._id}
                        className="flex-1 h-9 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition disabled:opacity-60"
                      >
                        {deletingId === item._id ? "O‘chirilmoqda..." : "O‘chirish"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
};

export default DentistTemplates;
