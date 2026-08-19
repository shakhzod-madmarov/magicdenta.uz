import { useEffect, useMemo, useRef, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PHONE_PLACEHOLDER, formatUzPhone, handleUzPhonePaste, normalizeUzPhone } from "../utils/phone";
import { AdminContext } from "../context/AdminContext";
import TelegramPatientConnectModal from "./TelegramPatientConnectModal.jsx";

const INFECTIOUS_DISEASE_OPTIONS = ["Gepatit B", "Gepatit C", "SPID"];

const WalkInModal = ({
  dentist,
  isBusy,
  onClose,
  onSubmit,
  lookupPatientFn,
  createPatientFn,
}) => {
  const lookupPatient = lookupPatientFn;
  const createPatient = createPatientFn;

  const { backendUrl, aToken } = useContext(AdminContext);

  const modalRef = useRef(null);
  const nameTimer = useRef(null);

  const [patientId, setPatientId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchingPatientId, setSearchingPatientId] = useState(false);
  const [searchingPhone, setSearchingPhone] = useState(false);
  const [searchingName, setSearchingName] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState({
    name: "",
    phone: "",
    DOB: "",
    gender: "Tanlanmagan",
    addressLine1: "",
    addressLine2: "",
    allergy: "",
    medicalWarnings: "",
    note: "",
    infectiousDiseaseMarkers: [],
  });

  const [showTelegramConnect, setShowTelegramConnect] = useState(false);
  const [telegramLink, setTelegramLink] = useState("");
  const [telegramTokenHash, setTelegramTokenHash] = useState("");
  const [connectPatient, setConnectPatient] = useState(null);
  const [pendingCloseFn, setPendingCloseFn] = useState(null);

  useEffect(() => {
    if (!telegramLink || !telegramTokenHash || !connectPatient?._id || !showTelegramConnect) return undefined;
    let intervalId = setInterval(async () => {
      try {
        const { data: resp } = await axios.get(
          `${backendUrl}/api/admin/patients/${connectPatient._id}/telegram-check`,
          { headers: { atoken: aToken } }
        );
        if (resp?.success && resp?.linked) {
          setTelegramLink("");
          setTelegramTokenHash("");
          setShowTelegramConnect(false);
          toast.success("Telegram muvaffaqiyatli ulandi!");
          if (pendingCloseFn) {
            pendingCloseFn();
          }
        }
      } catch (err) {
        console.error("Error polling telegram check status:", err);
      }
    }, 3000);
    return () => clearInterval(intervalId);
  }, [telegramLink, telegramTokenHash, connectPatient?._id, showTelegramConnect, backendUrl, aToken, pendingCloseFn]);

  const handleTelegramModalClose = () => {
    setShowTelegramConnect(false);
    if (pendingCloseFn) {
      pendingCloseFn();
    }
  };

  const [admissionType, setAdmissionType] = useState("NORMAL");

  const cleanPatientId = useMemo(() => patientId.trim().toUpperCase(), [patientId]);
  const normalizedPhone = useMemo(() => normalizeUzPhone(phone), [phone]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !submitting && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const onOverlayClick = (e) => {
    if (!modalRef.current?.contains(e.target)) onClose();
  };

  const fillPatient = (p) => {
    setSelectedPatient(p);
    setPatientId(p.patientId || "");
    setName(p.name || "");
    setPhone(formatUzPhone(p.phone || ""));
    setSuggestions([]);
    setCreateOpen(false);
  };

  const clearSelection = () => {
    if (selectedPatient) setSelectedPatient(null);
  };

  const searchByPatientId = async () => {
    if (!cleanPatientId || submitting) return;
    if (!lookupPatient) return toast.error("Bemor qidirish sozlanmagan");

    try {
      setSearchingPatientId(true);
      const res = await lookupPatient({ patientId: cleanPatientId });
      if (!res?.success) {
        toast.info("Bemor topilmadi");
        setCreateOpen(true);
        return;
      }
      if (res.patient) fillPatient(res.patient);
    } finally {
      setSearchingPatientId(false);
    }
  };

  const searchByPhone = async () => {
    if (!normalizedPhone || submitting) return;
    if (!lookupPatient) return toast.error("Bemor qidirish sozlanmagan");

    try {
      setSearchingPhone(true);
      const res = await lookupPatient({ phone: normalizedPhone });
      if (!res?.success) {
        toast.info("Bemor topilmadi");
        setCreateOpen(true);
        return;
      }

      if (res.patient) {
        fillPatient(res.patient);
        return;
      }

      if (Array.isArray(res.patients) && res.patients.length > 0) {
        setSuggestions(res.patients);
        toast.info(
          "Bu telefon raqam bilan bir nechta bemor topildi. Ro‘yxatdan aniq bemorni tanlang.",
        );
      }
    } finally {
      setSearchingPhone(false);
    }
  };

  useEffect(() => {
    clearTimeout(nameTimer.current);

    if (name.trim().length < 2 || submitting || !lookupPatient) {
      setSuggestions([]);
      return;
    }

    nameTimer.current = setTimeout(async () => {
      try {
        setSearchingName(true);
        const res = await lookupPatient({ name: name.trim() });
        if (res?.success && Array.isArray(res.patients)) {
          setSuggestions(res.patients);
        } else {
          setSuggestions([]);
        }
      } finally {
        setSearchingName(false);
      }
    }, 300);

    return () => clearTimeout(nameTimer.current);
  }, [name, lookupPatient, submitting]);

  const handleTopNameChange = (e) => {
    const val = e.target.value;
    clearSelection();
    setName(val);
    setCreateDraft((prev) => ({ ...prev, name: val }));
  };

  const handleTopPhoneChange = (e) => {
    const formatted = formatUzPhone(e.target.value);
    clearSelection();
    setPhone(formatted);
    setCreateDraft((prev) => ({ ...prev, phone: formatted }));
  };

  const handleCreateChange = (e) => {
    const { name: field, value } = e.target;
    const formattedVal = field === "phone" ? formatUzPhone(value) : value;
    setCreateDraft((prev) => ({
      ...prev,
      [field]: formattedVal,
    }));
    if (field === "name") {
      setName(value);
    }
    if (field === "phone") {
      setPhone(formattedVal);
    }
  };

  const toggleMarker = (value) => {
    setCreateDraft((prev) => ({
      ...prev,
      infectiousDiseaseMarkers: prev.infectiousDiseaseMarkers.includes(value)
        ? prev.infectiousDiseaseMarkers.filter((item) => item !== value)
        : [...prev.infectiousDiseaseMarkers, value],
    }));
  };

  const submit = async (actionType = "walk_in") => {
    if (submitting) return;

    try {
      setSubmitting(true);
      let createdPatient = null;

      let finalPatientId = selectedPatient?.patientId || cleanPatientId;
      let finalName = (selectedPatient?.name || name).trim();
      let finalPhone = selectedPatient?.phone
        ? normalizeUzPhone(selectedPatient.phone)
        : normalizedPhone;
      let finalNote = String(createDraft.note || "").trim();

      // If creating a new patient
      if (createOpen || (!selectedPatient && !cleanPatientId)) {
        const createName = (createDraft.name || name).trim();
        const createPhone = normalizeUzPhone(createDraft.phone) || normalizedPhone;

        if (!createName || !createPhone) {
          toast.error("Ism va telefon majburiy");
          return;
        }

        if (!createDraft.DOB) {
          toast.error("Yangi bemor uchun tug‘ilgan sana majburiy");
          return;
        }

        if (!createPatient) {
          toast.error("Bemor yaratish funksiyasi ulanmagan");
          return;
        }

        const createRes = await createPatient(
          {
            name: createName,
            phone: createPhone,
            DOB: createDraft.DOB,
            gender: createDraft.gender || "Tanlanmagan",
            address: {
              line1: createDraft.addressLine1 || "",
              line2: createDraft.addressLine2 || "",
            },
            allergy: createDraft.allergy || "",
            medicalWarnings: createDraft.medicalWarnings || "",
            note: createDraft.note || "",
            infectiousDiseaseMarkers: createDraft.infectiousDiseaseMarkers || [],
          },
          { silent: false },
        );

        if (!createRes?.success || !createRes?.patient?.patientId) return;

        createdPatient = createRes.patient;
        finalPatientId = createRes.patient.patientId;
        finalName = createRes.patient.name || createName;
        finalPhone = createRes.patient.phone || createPhone;

        // If user only wanted to save patient without sending to live queue
        if (actionType === "save_only") {
          toast.success("Bemor muvaffaqiyatli saqlandi");
          onClose();
          return;
        }
      } else {
        if (!finalName || !finalPhone) {
          toast.error("Ism va telefon majburiy");
          return;
        }
      }

      // Send to Live Walk-in queue
      const result = await onSubmit({
        dentistID: dentist._id,
        patientId: finalPatientId,
        phone: finalPhone,
        name: finalName,
        note: finalNote,
        appointmentType: admissionType,
        isOrtho: admissionType === "ORTHODONTIC",
        force: !!isBusy,
      });

      if (result?.success) {
        const targetPatient = selectedPatient || createdPatient;
        if (targetPatient && targetPatient._id) {
          try {
            const { data: resp } = await axios.get(
              `${backendUrl}/api/admin/patients/${targetPatient._id}/telegram-check`,
              { headers: { atoken: aToken } }
            );
            if (resp?.success && resp?.linked) {
              onClose();
              return;
            }
          } catch (err) {
            console.warn("Error checking telegram status:", err);
          }

          try {
            const { data: linkData } = await axios.post(
              `${backendUrl}/api/admin/patients/${targetPatient._id}/telegram-link`,
              {},
              { headers: { atoken: aToken } }
            );
            if (linkData?.success) {
              setConnectPatient(targetPatient);
              setTelegramLink(linkData.deepLink || "");
              setTelegramTokenHash(linkData.tokenHash || "");
              setShowTelegramConnect(true);
              setPendingCloseFn(() => onClose);
              return;
            }
          } catch (linkErr) {
            console.warn("Failed to generate telegram link:", linkErr);
          }
        }
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      onMouseDown={(e) => {
        if (!submitting) onOverlayClick(e);
      }}
    >
      <div
        ref={modalRef}
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-6"
      >
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Jonli Yuborish — {dentist?.name}</h2>
          <button onClick={onClose} disabled={submitting} className="text-xl disabled:opacity-50">✕</button>
        </div>

        <input
          value={patientId}
          onChange={(e) => {
            clearSelection();
            setPatientId(e.target.value);
          }}
          onBlur={searchByPatientId}
          placeholder={`Bemor ID (B-1)${searchingPatientId ? " • tekshirilmoqda" : ""}`}
          className="w-full border p-2 rounded mb-3 disabled:bg-gray-100"
          disabled={submitting}
        />
        <input
          value={phone}
          onChange={handleTopPhoneChange}
          onPaste={(e) => handleUzPhonePaste(e, (next) => {
            clearSelection();
            setPhone(next);
            setCreateDraft((prev) => ({ ...prev, phone: next }));
          })}
          onBlur={searchByPhone}
          inputMode="tel"
          maxLength={19}
          placeholder={`${PHONE_PLACEHOLDER}${searchingPhone ? " • tekshirilmoqda" : ""}`}
          className="w-full border p-2 rounded mb-3 disabled:bg-gray-100"
          disabled={submitting}
        />
        <div className="relative">
          <input
            value={name}
            onChange={handleTopNameChange}
            placeholder={searchingName ? "Ism sharif • qidirilmoqda" : "Ism sharif"}
            className="w-full border p-2 rounded disabled:bg-gray-100"
            disabled={submitting}
          />

          {suggestions.length > 0 && (
            <div className="absolute z-20 w-full bg-white border rounded shadow mt-1 max-h-56 overflow-y-auto">
              {suggestions.map((p) => (
                <div
                  key={p._id}
                  onClick={() => fillPatient(p)}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                >
                  {p.name} • {p.patientId || "ID yo‘q"} • {p.phone}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Qabul turi */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-sm font-bold text-slate-900 mb-2.5">Qabul turi</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              onClick={() => setAdmissionType("NORMAL")}
              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition cursor-pointer ${
                admissionType === "NORMAL"
                  ? "border-slate-800 bg-white shadow-xs"
                  : "border-slate-200 bg-white/70 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="admissionType"
                value="NORMAL"
                checked={admissionType === "NORMAL"}
                onChange={() => setAdmissionType("NORMAL")}
                className="mt-0.5 text-slate-900 focus:ring-slate-900 h-4 w-4"
                disabled={submitting}
              />
              <div>
                <span className="block font-bold text-slate-900 text-sm">
                  Oddiy ko'rik
                </span>
                <span className="block text-xs text-slate-500 mt-1 leading-relaxed">
                  Bemorlar uchrashuvlar jadvaliga oddiy qabul sifatida qo'shiladi.
                </span>
              </div>
            </label>

            <label
              onClick={() => setAdmissionType("ORTHODONTIC")}
              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition cursor-pointer ${
                admissionType === "ORTHODONTIC"
                  ? "border-slate-800 bg-white shadow-xs"
                  : "border-slate-200 bg-white/70 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="admissionType"
                value="ORTHODONTIC"
                checked={admissionType === "ORTHODONTIC"}
                onChange={() => setAdmissionType("ORTHODONTIC")}
                className="mt-0.5 text-slate-900 focus:ring-slate-900 h-4 w-4"
                disabled={submitting}
              />
              <div>
                <span className="block font-bold text-slate-900 text-sm">
                  Ortodontik ko'rik
                </span>
                <span className="block text-xs text-slate-500 mt-1 leading-relaxed">
                  Ortodont navbatiga qo'shiladi va 3/7/10/15 kunlik nazorat bilan boshqariladi.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-slate-900">Bemor topilmadimi?</p>
              <p className="text-sm text-slate-500">Shu joyning o‘zida yangi bemor yaratib jonli yuboring.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (selectedPatient) return;
                setCreateOpen((prev) => !prev);
              }}
              disabled={submitting || !!selectedPatient}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {selectedPatient ? "Avval tanlangan bemorni tozalang" : createOpen ? "Formani yopish" : "Formani ochish"}
            </button>
          </div>

          {selectedPatient ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Mavjud bemor tanlangan: <strong>{selectedPatient.name}</strong> ({selectedPatient.phone}). Yangi bemor yaratish uchun avval tanlovni tozalang.
            </div>
          ) : createOpen ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                name="name"
                value={createDraft.name}
                onChange={handleCreateChange}
                placeholder="Ism sharif"
                className="w-full rounded-xl border px-4 py-3"
                disabled={submitting}
              />
              <input
                name="phone"
                value={createDraft.phone}
                onChange={handleCreateChange}
                onPaste={(e) => handleUzPhonePaste(e, (next) => {
                  setCreateDraft((prev) => ({ ...prev, phone: next }));
                  clearSelection();
                  setPhone(next);
                })}
                inputMode="tel"
                maxLength={19}
                placeholder={PHONE_PLACEHOLDER}
                className="w-full rounded-xl border px-4 py-3"
                disabled={submitting}
              />
              <input
                type="date"
                name="DOB"
                value={createDraft.DOB}
                onChange={handleCreateChange}
                className="w-full rounded-xl border px-4 py-3"
                disabled={submitting}
              />
              <select
                name="gender"
                value={createDraft.gender}
                onChange={handleCreateChange}
                className="w-full rounded-xl border px-4 py-3"
                disabled={submitting}
              >
                <option value="Tanlanmagan">Tanlanmagan</option>
                <option value="Erkak">Erkak</option>
                <option value="Ayol">Ayol</option>
              </select>
              <input
                name="addressLine1"
                value={createDraft.addressLine1}
                onChange={handleCreateChange}
                placeholder="Shahar / tuman"
                className="w-full rounded-xl border px-4 py-3"
                disabled={submitting}
              />
              <input
                name="addressLine2"
                value={createDraft.addressLine2}
                onChange={handleCreateChange}
                placeholder="Mahalla / ko‘cha"
                className="w-full rounded-xl border px-4 py-3 md:col-span-2"
                disabled={submitting}
              />
              <input
                name="allergy"
                value={createDraft.allergy}
                onChange={handleCreateChange}
                placeholder="Allergiya (ixtiyoriy)"
                className="w-full rounded-xl border px-4 py-3 md:col-span-2"
                disabled={submitting}
              />
              <input
                name="medicalWarnings"
                value={createDraft.medicalWarnings}
                onChange={handleCreateChange}
                placeholder="Tibbiy ogohlantirish (ixtiyoriy)"
                className="w-full rounded-xl border px-4 py-3 md:col-span-2"
                disabled={submitting}
              />
              <textarea
                name="note"
                value={createDraft.note}
                onChange={handleCreateChange}
                placeholder="Izoh (ixtiyoriy)"
                rows={3}
                className="w-full rounded-xl border px-4 py-3 md:col-span-2"
                disabled={submitting}
              />
              <div className="md:col-span-2 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">Maxfiy infeksion belgi (ixtiyoriy)</p>
                <p className="mt-1 text-xs text-gray-500">Faqat admin va stomatolog ko‘radi. Bemor va navbat ekranida ko‘rinmaydi.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {INFECTIOUS_DISEASE_OPTIONS.map((item) => (
                    <label key={item} className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-xs font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={createDraft.infectiousDiseaseMarkers.includes(item)}
                        onChange={() => toggleMarker(item)}
                        disabled={submitting}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-60"
          >
            Bekor qilish
          </button>

          {createOpen ? (
            <>
              <button
                type="button"
                onClick={() => submit("save_only")}
                disabled={submitting || searchingPatientId || searchingPhone}
                className="border border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
              >
                {submitting ? "Saqlanmoqda..." : "Faqat bemorni saqlash"}
              </button>

              <button
                type="button"
                onClick={() => submit("walk_in")}
                disabled={submitting || searchingPatientId || searchingPhone}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-60"
              >
                {submitting ? "Saqlanmoqda..." : "Saqlash va jonli qo‘shish"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => submit("walk_in")}
              disabled={submitting || searchingPatientId || searchingPhone}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition disabled:opacity-60 ${
                isBusy ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {submitting
                ? "Yuborilmoqda..."
                : isBusy
                ? "Majburan jonli yuborish"
                : "Jonli yuborish"}
            </button>
          )}
        </div>
      </div>

      {showTelegramConnect && (
        <TelegramPatientConnectModal
          open={showTelegramConnect}
          onClose={handleTelegramModalClose}
          link={telegramLink}
          patient={connectPatient}
          title="Bemor Telegramga ulanishi"
        />
      )}
    </div>
  );
};

export default WalkInModal;
