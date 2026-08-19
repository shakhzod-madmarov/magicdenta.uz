import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ToothChartPicker, { parseToothChartFromText } from "./ToothChartPicker.jsx";
import { formatMoney, isoToday } from "../../../shared/date.js";
import {
  IMAGE_INPUT_ACCEPT_ATTR,
  createImagePreviewItems,
  revokePreviewItems,
  getImageFileError,
  humanizeImageUploadMessage,
} from "../utils/imageUpload.js";

const filterAcceptedImageFiles = (pickedFiles, { maxBytes }) => {
  const accepted = [];
  const rejectedMessages = [];

  (pickedFiles || []).forEach((file) => {
    const imageError = getImageFileError(file, { maxBytes });
    if (imageError) {
      rejectedMessages.push(`${file?.name || "Fayl"}: ${imageError}`);
      return;
    }
    accepted.push(file);
  });

  return { accepted, rejectedMessages };
};

const digitsOnly = (v) => String(v ?? "").replace(/\D/g, "");

const AddHistoricalTreatmentModal = ({
  open,
  onClose,
  patient,
  backendUrl,
  authToken,
  authHeaderName = "atoken",
  isAdmin = false,
  onSuccess,
}) => {
  const [dentists, setDentists] = useState([]);
  const [selectedDentistId, setSelectedDentistId] = useState("");
  const [templates, setTemplates] = useState([]);
  const [saving, setSaving] = useState(false);
  const [inlineError, setInlineError] = useState("");

  const [form, setForm] = useState({
    treatmentDate: "",
    treatmentTime: "12:00",
    diagnosis: "",
    teeth: "",
    procedures: "",
    nextStep: "",
    medicines: "",
    notes: "",
    templateId: "",
    amount: "",
    paidNow: "0",
    paymentMethod: "CASH",
  });

  const [toothChartItems, setToothChartItems] = useState([]);
  const [xrays, setXrays] = useState([]);
  const [xrayPreviews, setXrayPreviews] = useState([]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (!open || !patient) return;

    setForm({
      treatmentDate: isoToday(),
      treatmentTime: "12:00",
      diagnosis: "",
      teeth: "",
      procedures: "",
      nextStep: "",
      medicines: "",
      notes: "",
      templateId: "",
      amount: "",
      paidNow: "0",
      paymentMethod: "CASH",
    });
    setToothChartItems([]);
    setXrays([]);
    setXrayPreviews([]);
    setInlineError("");
    setSaving(false);

    // Load templates
    const apiPrefix = isAdmin ? "admin" : "dentist";
    axios
      .get(`${backendUrl}/api/dentist/templates`, {
        headers: { [authHeaderName]: authToken },
      })
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.templates)) {
          setTemplates(res.data.templates);
        }
      })
      .catch(() => {});

    // If admin, load dentists
    if (isAdmin) {
      axios
        .get(`${backendUrl}/api/admin/all-dentists`, {
          headers: { [authHeaderName]: authToken },
        })
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.dentists)) {
            const active = res.data.dentists.filter((d) => !d.isArchived);
            setDentists(active);
            if (active.length > 0 && !selectedDentistId) {
              setSelectedDentistId(active[0]._id);
            }
          }
        })
        .catch(() => {});
    }
  }, [open, patient?._id]);

  useEffect(() => {
    return () => {
      revokePreviewItems(xrayPreviews);
    };
  }, [xrayPreviews]);

  if (!open || !patient) return null;

  const amountNum = Number(digitsOnly(form.amount) || 0);
  const paidNum = Number(digitsOnly(form.paidNow) || 0);
  const remaining = Math.max(0, amountNum - paidNum);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInlineError("");

    if (name === "amount" || name === "paidNow") {
      setForm((p) => ({ ...p, [name]: digitsOnly(value) }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const applyTemplate = (templateId) => {
    const selected = (Array.isArray(templates) ? templates : []).find(
      (item) => String(item?._id || "") === String(templateId || ""),
    );

    setForm((prev) => ({
      ...prev,
      templateId: templateId || "",
      diagnosis: selected?.diagnosis || prev.diagnosis,
      teeth: selected?.teeth || prev.teeth,
      procedures: selected?.procedures || prev.procedures,
      nextStep: selected?.nextStep || prev.nextStep,
      medicines: selected?.medicines || prev.medicines,
      notes: selected?.notes || prev.notes,
      amount: selected?.price ? String(selected.price) : prev.amount,
    }));

    if (selected?.teeth) {
      setToothChartItems(parseToothChartFromText(selected.teeth));
    } else {
      setToothChartItems([]);
    }
  };

  const handleSetFullPaid = () => {
    setForm((p) => ({ ...p, paidNow: p.amount || "0" }));
  };

  const handleSetUnpaid = () => {
    setForm((p) => ({ ...p, paidNow: "0" }));
  };

  const handleSubmit = async () => {
    if (saving) return;

    if (!form.treatmentDate) {
      setInlineError("Davolash sanasi kiritilishi shart.");
      return;
    }

    if (!String(form.diagnosis || "").trim()) {
      setInlineError("Diagnos (tashxis) majburiy maydon.");
      return;
    }

    if (digitsOnly(form.amount) === "") {
      setInlineError("Umumiy narx majburiy maydon.");
      return;
    }

    if (paidNum > amountNum) {
      setInlineError("To'langan summa umumiy narxdan katta bo'lishi mumkin emas.");
      return;
    }

    if (isAdmin && !selectedDentistId) {
      setInlineError("Stomatolog tanlanishi shart.");
      return;
    }

    let finalProcedures = form.procedures.trim();
    const toothDetails = toothChartItems
      .map(
        (info) =>
          `${info.toothNumber} - ${info.procedureLabel || "Tekshirildi"}${
            info.notes ? ` (${info.notes})` : ""
          }`
      )
      .join(", ");
    if (toothDetails) {
      if (finalProcedures) {
        finalProcedures = `${toothDetails}\n${finalProcedures}`;
      } else {
        finalProcedures = toothDetails;
      }
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("treatmentDate", form.treatmentDate);
      formData.append("treatmentTime", form.treatmentTime || "12:00");
      formData.append("diagnosis", form.diagnosis.trim());
      formData.append("teeth", (form.teeth || "").trim());
      formData.append("procedures", finalProcedures);
      formData.append("nextStep", (form.nextStep || "").trim());
      formData.append("medicines", (form.medicines || "").trim());
      formData.append("notes", (form.notes || "").trim());
      formData.append("amount", amountNum);
      formData.append("paidAmount", paidNum);
      formData.append("paymentMethod", form.paymentMethod || "CASH");

      if (isAdmin && selectedDentistId) {
        formData.append("dentistId", selectedDentistId);
      }

      xrays.forEach((file) => {
        formData.append("xrays", file);
      });

      const apiPrefix = isAdmin ? "admin" : "dentist";
      const { data } = await axios.post(
        `${backendUrl}/api/${apiPrefix}/patients/${patient._id}/historical-treatment`,
        formData,
        {
          headers: {
            [authHeaderName]: authToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data?.success) {
        toast.success(data.message || "Eski davolash tarixi muvaffaqiyatli saqlandi!");
        onSuccess && onSuccess(data);
        onClose();
      } else {
        setInlineError(data?.message || "Saqlashda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error("Save historical treatment error:", err);
      setInlineError(
        err.response?.data?.message || err.message || "Saqlashda xatolik yuz berdi."
      );
    } finally {
      setSaving(false);
    }
  };

  const headerName = patient?.name || "Bemor";
  const headerPhone = patient?.phone || "";
  const headerPid = patient?.patientId || "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-3 py-3 sm:px-4 sm:py-4 animate-fade-in"
    >
      <div
        className="min-h-full flex items-start sm:items-center justify-center"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b flex items-start justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-primary">
                Qabulni yakunlash (Eski davolash)
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                <b>{headerName}</b> {headerPid ? `(${headerPid})` : ""} {headerPhone ? `• ${headerPhone}` : ""}
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-2 text-sm rounded-xl border hover:bg-gray-50 font-medium"
            >
              Yopish
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-5 gap-5 max-h-[75vh] overflow-y-auto">
            {/* Left Column (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Date, Time and Doctor Row */}
              <div className="rounded-2xl border bg-amber-50/70 border-amber-200 p-4 space-y-3">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Qabul sanasi, vaqti va shifokor
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {isAdmin ? (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Shifokor (Stomatolog) *
                      </label>
                      <select
                        value={selectedDentistId}
                        onChange={(e) => setSelectedDentistId(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
                        required
                      >
                        <option value="">Shifokorni tanlang</option>
                        {dentists.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name} ({Array.isArray(d.speciality) ? d.speciality.join(", ") : d.speciality || "Stomatolog"})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Davolash sanasi (O'tgan sana) *
                    </label>
                    <input
                      type="date"
                      name="treatmentDate"
                      value={form.treatmentDate}
                      onChange={handleChange}
                      className="w-full border rounded-xl px-3 py-2 text-sm bg-white font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Taxminiy vaqti
                    </label>
                    <input
                      type="time"
                      name="treatmentTime"
                      value={form.treatmentTime}
                      onChange={handleChange}
                      className="w-full border rounded-xl px-3 py-2 text-sm bg-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Template Row */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1 text-amber-950">
                      Shablon (ixtiyoriy)
                    </label>
                    <select
                      name="templateId"
                      value={form.templateId}
                      onChange={(e) => applyTemplate(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
                    >
                      <option value="">Shablon tanlang</option>
                      {(Array.isArray(templates) ? templates : []).map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-xs text-amber-900/70 sm:max-w-48">
                    Shablon tanlansa, diagnoz va klinik maydonlar avtomatik to‘ladi.
                  </div>
                </div>

                {Array.isArray(templates) &&
                  templates.filter((t) => t.isFavorite).length > 0 && (
                    <div className="pt-1 border-t border-amber-200/60">
                      <div className="text-xs font-semibold text-amber-900 mb-1.5 flex items-center gap-1">
                        <span>Tezkor tanlov:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {templates
                          .filter((t) => t.isFavorite)
                          .map((item) => {
                            const isSelected =
                              String(form.templateId) === String(item._id);
                            return (
                              <button
                                key={item._id}
                                type="button"
                                onClick={() =>
                                  applyTemplate(isSelected ? "" : item._id)
                                }
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition shadow-2xs border ${
                                  isSelected
                                    ? "bg-amber-600 border-amber-700 text-white shadow-xs font-semibold"
                                    : "bg-white border-amber-300/80 text-amber-950 hover:bg-amber-100 hover:border-amber-400"
                                }`}
                              >
                                <span>{item.title}</span>
                                {Number(item.price) > 0 && (
                                  <span className={`text-[10px] ${isSelected ? "text-amber-100" : "text-amber-700"}`}>
                                    • {Number(item.price).toLocaleString()} so'm
                                  </span>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Diagnos *
                </label>
                <textarea
                  name="diagnosis"
                  value={form.diagnosis}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Karies, pulpit, periodontit..."
                  required
                />
              </div>

              {/* ToothChartPicker */}
              <div className="space-y-4">
                <ToothChartPicker
                  value={toothChartItems}
                  onChange={(newItems) => {
                    setToothChartItems(newItems);
                    setForm((p) => ({
                      ...p,
                      teeth: newItems.map((i) => i.toothNumber).join(", "),
                    }));
                  }}
                />
              </div>

              {/* Procedures */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Bajarilgan ishlar
                </label>
                <textarea
                  name="procedures"
                  value={form.procedures}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Qilingan muolajalar..."
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Next step */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Keyingi qadam / Tavsiyalar
                </label>
                <textarea
                  name="nextStep"
                  value={form.nextStep}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Medicines */}
              <div>
                <label className="block text-sm font-medium mb-1">Dorilar</label>
                <textarea
                  name="medicines"
                  value={form.medicines}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1">Eslatma</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* X-Rays */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  XRAY / suratlar (ixtiyoriy)
                </label>
                <input
                  type="file"
                  accept={IMAGE_INPUT_ACCEPT_ATTR}
                  multiple
                  onChange={async (e) => {
                    const picked = Array.from(e.target.files || []);
                    const { accepted, rejectedMessages } = filterAcceptedImageFiles(
                      picked,
                      { maxBytes: 10 * 1024 * 1024 },
                    );

                    setXrays(accepted);
                    revokePreviewItems(xrayPreviews);
                    setXrayPreviews(await createImagePreviewItems(accepted));
                    if (rejectedMessages.length) {
                      toast.error(humanizeImageUploadMessage(rejectedMessages[0]));
                    }
                  }}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                />
                {xrayPreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {xrayPreviews.map((item) => (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                      >
                        {item.url ? (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="h-24 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-24 items-center justify-center px-2 text-center text-xs text-gray-500">
                            Ko‘rinish tayyor emas
                          </div>
                        )}
                        <p className="truncate px-2 py-1 text-[11px] text-gray-600">
                          {item.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {xrays.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    Tanlangan fayllar: {xrays.length}
                  </p>
                )}
              </div>

              {inlineError && (
                <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl px-3 py-2 text-sm">
                  {inlineError}
                </div>
              )}
            </div>

            {/* Right Column (2 cols) */}
            <div className="lg:col-span-2">
              <div className="border rounded-2xl p-4 bg-gray-50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">To‘lov ma’lumotlari</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSetFullPaid}
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      ✓ To'liq to'lash
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={handleSetUnpaid}
                      className="text-[11px] font-bold text-red-600 hover:underline"
                    >
                      To'lanmagan
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium">Umumiy narx *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      className="w-full border rounded-xl px-3 py-2 text-sm bg-white font-bold"
                      placeholder="Masalan: 150000"
                      required
                    />
                    {digitsOnly(form.amount) === "" && (
                      <p className="text-xs text-red-600 mt-1">Umumiy narx majburiy</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Hozir olingan / To'langan summa
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="paidNow"
                      value={form.paidNow}
                      onChange={handleChange}
                      className="w-full border rounded-xl px-3 py-2 text-sm bg-white font-bold text-emerald-700"
                      placeholder="Masalan: 50000"
                    />
                  </div>

                  {paidNum > amountNum && (
                    <p className="text-xs text-red-600 font-semibold">
                      To‘langan summa umumiy narxdan katta bo‘lishi mumkin emas
                    </p>
                  )}

                  <div className="pt-2 border-t space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Umumiy</span>
                      <span className="font-semibold">{formatMoney(amountNum)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">To'langan</span>
                      <span className="font-semibold text-green-700">
                        {formatMoney(paidNum)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Qarz</span>
                      <span className="font-semibold text-red-600">
                        {formatMoney(remaining)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
                >
                  Yopish
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || !String(form.diagnosis || "").trim() || digitsOnly(form.amount) === ""}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center gap-2 shadow"
                >
                  {saving ? (
                    <>
                      <span className="animate-spin">⏳</span> Saqlanmoqda...
                    </>
                  ) : (
                    "✓ Qabulni yakunlash"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHistoricalTreatmentModal;
