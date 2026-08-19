import axios from "axios";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import {
  formatDMY,
  formatDateTimeDMY,
  formatDateTimeISO,
  formatMoney,
} from "../../../shared/date.js";
import profilePic from "../assets/profile_pic.png";
import { formatUzPhoneInput, handleUzPhonePaste, PHONE_PLACEHOLDER } from "../utils/phone";
import TelegramPatientConnectModal from "./TelegramPatientConnectModal.jsx";
import AddHistoricalTreatmentModal from "./AddHistoricalTreatmentModal.jsx";

const INFECTIOUS_DISEASE_OPTIONS = ["Gepatit B", "Gepatit C", "SPID"];

const toUzOrthoStatus = (value) => {
  const key = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const map = {
    WAITING: "Kutilmoqda",
    CALLED: "Chaqirildi",
    IN_PROGRESS: "Qabulda",
    DONE: "Tugallangan",
    MISSED: "Kelmagan",
    CANCELLED: "Bekor qilingan",
    CANCELED: "Bekor qilingan",
  };

  return map[key] || (value ? String(value) : "—");
};

const formatPatientId = (value = "") => String(value || "").trim() || "—";

const Info = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-xs">{label}</p>
    <p className="font-semibold text-sm break-words">{value || "—"}</p>
  </div>
);

const SecureImage = ({ url, token, alt, onClick }) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let objectUrl = null;

    const loadImage = async () => {
      try {
        const effectiveToken =
          token ||
          localStorage.getItem("aToken") ||
          localStorage.getItem("dToken") ||
          "";

        const headers = {};
        if (effectiveToken) {
          headers["Authorization"] = `Bearer ${effectiveToken}`;
          headers["atoken"] = effectiveToken;
          headers["dtoken"] = effectiveToken;
        }

        const queryChar = url.includes("?") ? "&" : "?";
        const fetchUrl = effectiveToken
          ? `${url}${queryChar}token=${encodeURIComponent(effectiveToken)}`
          : url;

        const response = await fetch(fetchUrl, { headers });

        if (!response.ok) throw new Error("Image load failed");

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch (err) {
        console.error("XRAY load error:", err);
      }
    };

    loadImage();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, token]);

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      onClick={() => onClick?.(src)}
      className="h-24 w-full object-cover rounded-lg border cursor-pointer hover:opacity-80"
    />
  );
};

const PaymentStatusBadge = ({ status }) => {
  const map = {
    PAID: { label: "To‘langan", cls: "bg-green-100 text-green-700" },
    PARTIAL: { label: "Qisman", cls: "bg-yellow-100 text-yellow-700" },
    UNPAID: { label: "To‘lanmagan", cls: "bg-red-100 text-red-700" },
  };

  const s = map[status] || map.UNPAID;

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
};

const PatientModal = ({
  open,
  onClose,
  data,
  backendUrl,
  authToken = "",
  authHeaderName = "",
  onPatientUpdated,
}) => {
  const isAdmin = authHeaderName === "atoken" || Boolean(localStorage.getItem("aToken") && !authToken?.includes("dToken"));
  // Derive API prefix so dentists hit /api/dentist/... instead of /api/admin/...
  const apiBase = isAdmin ? "admin" : "dentist";

  const patient = data?.patient;
  const [xrayOpen, setXrayOpen] = useState(false);
  const [activeXray, setActiveXray] = useState(null);
  const [markerPasswordOpen, setMarkerPasswordOpen] = useState(false);
  const [markerPassword, setMarkerPassword] = useState("");
  const [markerPasswordChecking, setMarkerPasswordChecking] = useState(false);
  const [markerEditorOpen, setMarkerEditorOpen] = useState(false);
  const [markerSaving, setMarkerSaving] = useState(false);
  const [markerDraft, setMarkerDraft] = useState([]);
  const [markerAccessGranted, setMarkerAccessGranted] = useState(false);
  const [verifiedMarkerPassword, setVerifiedMarkerPassword] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [historicalModalOpen, setHistoricalModalOpen] = useState(false);
  const [editDraft, setEditDraft] = useState({
    name: "",
    phone: "",
    email: "",
    DOB: "",
    gender: "Tanlanmagan",
    addressLine1: "",
    addressLine2: "",
    allergy: "",
    medicalWarnings: "",
    note: "",
  });

  const [telegramLink, setTelegramLink] = useState("");
  const [telegramTokenHash, setTelegramTokenHash] = useState("");
  const [telegramConnectOpen, setTelegramConnectOpen] = useState(false);
  const [creatingTelegramLink, setCreatingTelegramLink] = useState(false);

  const createTelegramLink = async () => {
    if (patient?.telegram?.isVerified) {
      return;
    }
    if (telegramLink) {
      setTelegramConnectOpen(true);
      return;
    }
    if (!patient?._id || creatingTelegramLink) return;
    try {
      setCreatingTelegramLink(true);
      const { data: resp } = await axios.post(
        `${backendUrl}/api/${apiBase}/patients/${patient._id}/telegram-link`,
        {},
        { headers: { [authHeaderName]: authToken } }
      );
      setTelegramLink(resp.deepLink || "");
      setTelegramTokenHash(resp.tokenHash || "");
      setTelegramConnectOpen(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Telegram ulanish havolasini yaratib bo'lmadi");
    } finally {
      setCreatingTelegramLink(false);
    }
  };

  const handleTelegramDisconnect = async () => {
    if (!window.confirm("Bemorning Telegram bog'lanishini uzmoqchimisiz?")) return;
    try {
      const { data: resp } = await axios.post(
        `${backendUrl}/api/${apiBase}/patients/${patient._id}/telegram-unlink`,
        {},
        { headers: { [authHeaderName]: authToken } }
      );
      if (resp.success) {
        setTelegramLink("");
        setTelegramTokenHash("");
        toast.success("Telegram muvaffaqiyatli uzildi!");
        if (onPatientUpdated) {
          onPatientUpdated({
            ...patient,
            telegram: {
              ...patient.telegram,
              isVerified: false,
              chatId: "",
              username: "",
              firstName: "",
            }
          });
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Telegramni uzib bo'lmadi");
    }
  };

  useEffect(() => {
    if (!telegramLink || !telegramTokenHash || !patient?._id || !telegramConnectOpen) return undefined;
    let intervalId = setInterval(async () => {
      try {
        const { data: resp } = await axios.get(
          `${backendUrl}/api/${apiBase}/patients/${patient._id}/telegram-check`,
          { headers: { [authHeaderName]: authToken } }
        );
        if (resp?.success && resp?.linked) {
          setTelegramLink("");
          setTelegramTokenHash("");
          setTelegramConnectOpen(false);
          toast.success("Telegram muvaffaqiyatli ulandi!");
          if (onPatientUpdated) {
            onPatientUpdated(resp.patient);
          }
        }
      } catch (err) {
        console.error("Error polling telegram check status:", err);
      }
    }, 3000);
    return () => clearInterval(intervalId);
  }, [telegramLink, telegramTokenHash, patient?._id, telegramConnectOpen, backendUrl, onPatientUpdated, authToken, authHeaderName]);

  useEffect(() => {
    const list = Array.isArray(data?.patient?.infectiousDiseaseMarkers)
      ? data.patient.infectiousDiseaseMarkers
      : [];

    setMarkerDraft(list);
    setMarkerEditorOpen(false);
    setMarkerPasswordOpen(false);
    setMarkerPassword("");
    setMarkerAccessGranted(false);
    setVerifiedMarkerPassword("");
    setEditMode(false);
    setEditSaving(false);
    setEditDraft({
      name: data?.patient?.name || "",
      phone: data?.patient?.phone || "",
      email: data?.patient?.email || "",
      DOB: data?.patient?.DOB || "",
      gender: data?.patient?.gender || "Tanlanmagan",
      addressLine1: data?.patient?.address?.line1 || "",
      addressLine2: data?.patient?.address?.line2 || "",
      allergy: data?.patient?.allergy || "",
      medicalWarnings: data?.patient?.medicalWarnings || "",
      note: data?.patient?.note || "",
    });
  }, [open, data?.patient?._id, data?.patient?.infectiousDiseaseMarkers, data?.patient]);

  useEffect(() => {
    const esc = (e) => {
      if (e.key === "Escape") {
        if (xrayOpen) {
          setXrayOpen(false);
          setActiveXray(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [xrayOpen, onClose]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditDraft((prev) => ({
      ...prev,
      [name]: name === "phone" ? formatUzPhoneInput(value) : value,
    }));
  };

  const cancelPatientEdit = () => {
    setEditMode(false);
    setEditDraft({
      name: data?.patient?.name || "",
      phone: data?.patient?.phone || "",
      email: data?.patient?.email || "",
      DOB: data?.patient?.DOB || "",
      gender: data?.patient?.gender || "Tanlanmagan",
      addressLine1: data?.patient?.address?.line1 || "",
      addressLine2: data?.patient?.address?.line2 || "",
      allergy: data?.patient?.allergy || "",
      medicalWarnings: data?.patient?.medicalWarnings || "",
      note: data?.patient?.note || "",
    });
  };

  const savePatientEdit = async () => {
    if (!patient?._id) return;
    try {
      setEditSaving(true);
      const { data: response } = await axios.put(
        `${backendUrl}/api/${apiBase}/patients/${patient._id}`,
        {
          name: editDraft.name,
          phone: editDraft.phone,
          email: editDraft.email,
          DOB: editDraft.DOB,
          gender: editDraft.gender,
          address: {
            ...(patient?.address || {}),
            line1: editDraft.addressLine1,
            line2: editDraft.addressLine2,
          },
          allergy: editDraft.allergy,
          medicalWarnings: editDraft.medicalWarnings,
          note: editDraft.note,
        },
        { headers: { [authHeaderName]: authToken } },
      );

      if (!response?.success) {
        toast.error(response?.message || "Saqlashda xatolik");
        return;
      }

      toast.success(response?.message || "Bemor yangilandi");
      setEditMode(false);
      onPatientUpdated?.(response.patient || {
        ...patient,
        name: editDraft.name,
        phone: editDraft.phone,
        email: editDraft.email,
        DOB: editDraft.DOB,
        gender: editDraft.gender,
        address: { ...(patient?.address || {}), line1: editDraft.addressLine1, line2: editDraft.addressLine2 },
        allergy: editDraft.allergy,
        medicalWarnings: editDraft.medicalWarnings,
        note: editDraft.note,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Saqlashda xatolik");
    } finally {
      setEditSaving(false);
    }
  };

  if (!open || !data) return null;

  const { totals, history } = data;

  const canManageInfectiousMarkers = Boolean(
    authToken && authHeaderName && patient?._id,
  );
  const secureMarkers = Array.isArray(patient?.infectiousDiseaseMarkers)
    ? patient.infectiousDiseaseMarkers
    : [];
  const hasSecureMarkers = secureMarkers.length > 0;
  const selectedMarkers = Array.isArray(markerDraft) ? markerDraft : [];

  const toggleMarker = (value) => {
    setMarkerDraft((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      return list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
    });
  };

  const openMarkerPasswordPrompt = () => {
    if (!canManageInfectiousMarkers) return;

    setMarkerPassword("");
    setMarkerPasswordOpen(true);
  };

  const closeMarkerPasswordPrompt = () => {
    if (markerPasswordChecking) return;
    setMarkerPasswordOpen(false);
    setMarkerPassword("");
  };

  const verifyMarkerAccess = async () => {
    if (!canManageInfectiousMarkers || markerPasswordChecking) return;

    const password = String(markerPassword || "");
    if (!password) {
      toast.error("Parolni kiriting");
      return;
    }

    try {
      setMarkerPasswordChecking(true);

      const { data: resp } = await axios.post(
        `${backendUrl}/api/${
          authHeaderName === "atoken" ? "admin" : "dentist"
        }/patients/${patient._id}/infectious-diseases/verify-access`,
        { password },
        { headers: { [authHeaderName]: authToken } },
      );

      if (!resp?.success) {
        throw new Error(resp?.message || "Parol noto‘g‘ri");
      }

      setVerifiedMarkerPassword(password);
      setMarkerAccessGranted(true);
      setMarkerPasswordOpen(false);
      setMarkerPassword("");
      setMarkerEditorOpen(true);
    } catch (error) {
      console.error("verifyMarkerAccess error:", error);
      toast.error(error?.message || "Parol noto‘g‘ri");
    } finally {
      setMarkerPasswordChecking(false);
    }
  };

  const saveMarkers = async () => {
    if (!canManageInfectiousMarkers || markerSaving || !markerAccessGranted)
      return;

    try {
      setMarkerSaving(true);

      const { data: resp } = await axios.put(
        `${backendUrl}/api/${
          authHeaderName === "atoken" ? "admin" : "dentist"
        }/patients/${patient._id}/infectious-diseases`,
        {
          infectiousDiseaseMarkers: selectedMarkers,
          password: verifiedMarkerPassword,
        },
        { headers: { [authHeaderName]: authToken } },
      );

      if (!resp?.success) {
        throw new Error(resp?.message || "Saqlanmadi");
      }

      toast.success(resp?.message || "Infeksion belgilar yangilandi");
      onPatientUpdated?.(resp?.patient?.infectiousDiseaseMarkers || []);
      setMarkerEditorOpen(false);
      setMarkerAccessGranted(false);
      setVerifiedMarkerPassword("");
    } catch (error) {
      console.error("saveMarkers error:", error);
      toast.error(error?.message || "Infeksion belgilarni saqlashda xatolik");
    } finally {
      setMarkerSaving(false);
    }
  };

  const isGenuineOrthoControl = (row) => {
    const o = row?.orthodontistQueue;
    if (!o) return false;
    return Boolean(
      o.isOrthoControl === true ||
      o.visitPurpose === "ORTHO_CONTROL" ||
      o.visitPurpose === "REGULAR_CONTROL" ||
      (o.followUpDays && Number(o.followUpDays) > 0) ||
      /ortodont/i.test(String(o.visitPurposeLabel || ""))
    );
  };

  const getFlags = (a = {}) => {
    const status = String(a.status || "").toUpperCase();

    const cancelled = Boolean(
      a.cancelled || a.isCancelled || status === "CANCELLED",
    );
    const missed = Boolean(a.missed || a.isMissed || status === "MISSED");
    const done = Boolean(a.isDone || a.isVisited || status === "DONE");

    const isWalkIn = Boolean(
      a.isWalkIn ||
      a.createdFrom === "WALK_IN" ||
      a.createdFrom === "ADMIN_WALKIN" ||
      a.createdFrom === "DENTIST_WALKIN"
    );

    // Bron qilingan (Advance Scheduled Booking):
    // Only WAITING state, NOT cancelled/missed/done, and NOT a Walk-In!
    const booked = status === "WAITING" && !cancelled && !missed && !done && !isWalkIn;

    return { booked, done, cancelled, missed, isWalkIn };
  };

  const stats = (Array.isArray(history) ? history : []).reduce(
    (acc, row) => {
      const a = row?.appointment || {};
      const f = getFlags(a);

      if (f.booked) acc.booked += 1;
      if (f.done) acc.visited += 1;
      if (f.cancelled) acc.cancelled += 1;
      if (f.missed) acc.missed += 1;
      if (isGenuineOrthoControl(row)) acc.orthoVisits += 1;

      return acc;
    },
    { booked: 0, visited: 0, cancelled: 0, missed: 0, orthoVisits: 0 },
  );

  const patientImg = patient?.image
    ? patient.image.startsWith("http")
      ? patient.image
      : backendUrl + patient.image
    : profilePic;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onMouseDown={onClose} />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img
                src={patientImg}
                alt={patient.name}
                onClick={() => {
                  setActiveXray(patientImg);
                  setXrayOpen(true);
                }}
                className="w-16 h-16 rounded-full border object-cover cursor-pointer hover:opacity-80"
                onError={(e) => {
                  e.currentTarget.src = profilePic;
                }}
              />
              <div>
                <h2 className="text-xl font-bold">
                  {formatPatientId(patient.patientId)} — {patient.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {patient.phone} · {patient.email || "Email yo‘q"}
                </p>
              </div>
              {canManageInfectiousMarkers && (
                <button
                  type="button"
                  onClick={openMarkerPasswordPrompt}
                  className={`text-xl font-bold leading-none ${
                    hasSecureMarkers ? "text-yellow-500" : "text-gray-500"
                  }`}
                  title={
                    hasSecureMarkers
                      ? secureMarkers.join(", ")
                      : "Belgilanmagan"
                  }
                  aria-label="Infeksion belgilar"
                >
                  *
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!editMode && (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium disabled:opacity-60"
                  disabled={editSaving || markerSaving || markerPasswordChecking}
                >
                  Tahrirlash
                </button>
              )}
              {editMode && (
                <>
                  <button
                    type="button"
                    onClick={cancelPatientEdit}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium disabled:opacity-60"
                    disabled={editSaving}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="button"
                    onClick={savePatientEdit}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-60"
                    disabled={editSaving}
                  >
                    {editSaving ? "Saqlanmoqda..." : "Saqlash"}
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                disabled={editSaving || markerSaving || markerPasswordChecking}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium disabled:opacity-60"
              >
                Yopish
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Info label="Bemor ID" value={formatPatientId(patient.patientId)} />
              <Info label="Jinsi" value={patient.gender} />
              <Info label="Tug‘ilgan sana" value={formatDMY(patient.DOB)} />
              <Info
                label="Ro‘yxatdan o‘tgan"
                value={formatDMY(patient.createdAt)}
              />
              <Info label="Telefon" value={patient.phone} />
              <Info label="Email" value={patient.email || "—"} />
              <Info
                label="Manzil"
                value={
                  [
                    patient.address?.line1,
                    patient.address?.line2,
                    patient.address?.city,
                    patient.address?.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"
                }
              />
              <Info label="Allergiya" value={patient.allergy || "—"} />
              <Info label="Tibbiy ogohlantirish" value={patient.medicalWarnings || "—"} />
              <Info label="Izoh" value={patient.note || "—"} />
            </section>

            {/* Telegram Bot Integration Card */}
            <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-indigo-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {patient.telegram?.isVerified ? "Telegram ulangan" : "Telegram bot ulanmagan"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {patient.telegram?.isVerified
                      ? `@${patient.telegram.username || ""} (${patient.telegram.firstName || ""})`
                      : "QR kod orqali bog‘lang"}
                  </p>
                </div>
              </div>
              <div>
                {patient.telegram?.isVerified ? (
                  <button
                    type="button"
                    onClick={handleTelegramDisconnect}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 active:scale-95 transition-all"
                  >
                    Ulanishni uzish
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={createTelegramLink}
                    disabled={creatingTelegramLink}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 px-4 py-2 text-xs font-bold text-white shadow-sm active:scale-95 transition-all"
                  >
                    {creatingTelegramLink ? "Tayyorlanmoqda..." : "Telegramni ulash"}
                  </button>
                )}
              </div>
            </div>

            {editMode && (
              <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3">
                  <p className="text-base font-semibold text-gray-900">Bemor ma’lumotlarini tahrirlash</p>
                  <p className="text-sm text-gray-500">Ism, telefon, manzil, allergiya va boshqa ma’lumotlarni shu yerda yangilang.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Ism va familiya</label>
                    <input name="name" value={editDraft.name} onChange={handleEditChange} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Telefon</label>
                    <input name="phone" value={editDraft.phone} onChange={handleEditChange} onPaste={(e) => handleUzPhonePaste(e, (formatted) => setEditDraft((prev) => ({ ...prev, phone: formatted })))} inputMode="tel" maxLength={PHONE_PLACEHOLDER.length} placeholder={PHONE_PLACEHOLDER} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Email</label>
                    <input name="email" value={editDraft.email} onChange={handleEditChange} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Tug‘ilgan sana</label>
                    <input type="date" name="DOB" value={String(editDraft.DOB || "").slice(0,10)} onChange={handleEditChange} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Jinsi</label>
                    <select name="gender" value={editDraft.gender} onChange={handleEditChange} className="w-full rounded-lg border px-3 py-2 text-sm">
                      <option value="Erkak">Erkak</option>
                      <option value="Ayol">Ayol</option>
                      <option value="Tanlanmagan">Tanlanmagan</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Allergiya</label>
                    <input name="allergy" value={editDraft.allergy} onChange={handleEditChange} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Shahar / tuman</label>
                    <input name="addressLine1" value={editDraft.addressLine1} onChange={handleEditChange} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Mahalla / ko‘cha</label>
                    <input name="addressLine2" value={editDraft.addressLine2} onChange={handleEditChange} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm text-gray-600">Tibbiy ogohlantirish</label>
                    <input name="medicalWarnings" value={editDraft.medicalWarnings} onChange={handleEditChange} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm text-gray-600">Izoh</label>
                    <textarea name="note" value={editDraft.note} onChange={handleEditChange} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                </div>
              </section>
            )}

            <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatBox label="Kelgan" value={stats.visited} color="green" />
              <StatBox
                label="Bron qilingan"
                value={stats.booked}
                color="blue"
              />
              <StatBox
                label="Bekor qilingan"
                value={stats.cancelled}
                color="yellow"
              />
              <StatBox label="Kelmagan" value={stats.missed} color="red" />
              <StatBox
                label="Ortodont nazorat"
                value={stats.orthoVisits}
                color="blue"
              />
            </section>

            <section className="bg-gray-50 p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Umumiy qarz</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatMoney(totals.totalDebt)}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                Jami: {formatMoney(totals.totalAmount)} · To‘langan:{" "}
                {formatMoney(totals.totalPaid)}
              </div>
            </section>

            {canManageInfectiousMarkers &&
              markerEditorOpen &&
              markerAccessGranted && (
                <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Maxfiy infeksion belgilar
                      </p>
                      <p className="text-xs text-gray-500">
                        Faqat admin va stomatolog ko‘radi. Bemor va navbat
                        ekranida ko‘rinmaydi.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {INFECTIOUS_DISEASE_OPTIONS.map((item) => (
                        <label
                          key={item}
                          className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-xs font-medium text-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMarkers.includes(item)}
                            onChange={() => toggleMarker(item)}
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-gray-500">
                      Joriy holat:{" "}
                      {selectedMarkers.length
                        ? selectedMarkers.join(", ")
                        : "Belgilanmagan"}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMarkerDraft(
                            Array.isArray(patient?.infectiousDiseaseMarkers)
                              ? patient.infectiousDiseaseMarkers
                              : [],
                          );
                          setMarkerEditorOpen(false);
                          setMarkerAccessGranted(false);
                          setVerifiedMarkerPassword("");
                        }}
                        className="px-3 py-2 rounded-lg border text-sm"
                        disabled={markerSaving}
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="button"
                        onClick={saveMarkers}
                        className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
                        disabled={markerSaving}
                      >
                        {markerSaving ? "Saqlanmoqda..." : "Saqlash"}
                      </button>
                    </div>
                  </div>
                </section>
              )}

            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="font-semibold text-lg">
                  Qabul va davolash tarixi
                </h3>
                {!isAdmin && (
                  <button
                    type="button"
                    onClick={() => setHistoricalModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-semibold hover:bg-primary/20 transition shadow-xs self-start sm:self-auto"
                  >
                    + Eski davolash tarixi kiritish
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {history.map((row) => {
                  const a = row.appointment;
                  const t = row.treatment;
                  const ortho = row.orthodontistQueue;

                  const token =
                    localStorage.getItem("aToken") ||
                    localStorage.getItem("dToken") ||
                    localStorage.getItem("uToken") ||
                    "";

                  return (
                    <details
                      key={a._id}
                      className="border rounded-xl p-4 bg-white"
                    >
                      <summary className="font-semibold cursor-pointer text-primary flex items-center justify-between gap-2">
                        <span>
                          {formatDateTimeDMY(a.slotDate, a.slotTime)} ·{" "}
                          {row.dentistData?.name || "Stomatolog"}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {a.rescheduled && (
                            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-normal">
                              🔄 Ko'chirilgan ({a.rescheduledByName || a.rescheduledBy})
                            </span>
                          )}
                        </div>
                      </summary>

                      {Array.isArray(a.rescheduleHistory) && a.rescheduleHistory.length > 0 && (
                        <div className="mt-3 bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-xs space-y-1">
                          <p className="font-bold text-amber-900">
                            🔄 Qabul vaqtini ko'chirish tarixi:
                          </p>
                          {a.rescheduleHistory.map((h, idx) => (
                            <div key={idx} className="text-amber-800">
                              • {formatDateTimeDMY(h.oldSlotDate, h.oldSlotTime)} ➔{" "}
                              <b>{formatDateTimeDMY(h.newSlotDate, h.newSlotTime)}</b>{" "}
                              (Ko'chirdi: <b>{h.rescheduledByName || h.rescheduledBy}</b>
                              {h.reason ? ` — "${h.reason}"` : ""})
                            </div>
                          ))}
                        </div>
                      )}

                      {(t || ortho) && (
                        <div className="mt-4 space-y-4 text-sm">
                          {t && (
                            <>
                              <div className="space-y-1">
                                {t.sourceTemplateTitle ? (
                                  <p>
                                    <b>Shablon:</b> {t.sourceTemplateTitle}
                                  </p>
                                ) : null}
                                <p>
                                  <b>Diagnos:</b> {t.diagnosis || "—"}
                                </p>
                                <p>
                                  <b>Tishlar:</b> {t.teeth || "—"}
                                </p>
                                <p>
                                  <b>Muolajalar:</b> {t.procedures || "—"}
                                </p>
                                <p>
                                  <b>Keyingi reja:</b> {t.nextStep || "—"}
                                </p>
                                <p>
                                  <b>Dorilar:</b> {t.medicines || "—"}
                                </p>
                                <p>
                                  <b>Eslatma:</b> {t.notes || "—"}
                                </p>
                                {t.nextVisitDate && (
                                  <p>
                                    <b>Keyingi qabul:</b>{" "}
                                    {formatDateTimeDMY(
                                      t.nextVisitDate,
                                      t.nextVisitTime,
                                    )}
                                  </p>
                                )}
                              </div>

                              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                                <p>
                                  <b>Qabul summasi:</b> {formatMoney(t.amount)}
                                </p>
                                <p>
                                  <b>To‘langan:</b> {formatMoney(t.paidAmount)}
                                </p>
                                <p>
                                  <b>Qolgan qarz:</b>{" "}
                                  {formatMoney(t.amount - t.paidAmount)}
                                </p>
                                <p>
                                  <b>Status:</b>{" "}
                                  <PaymentStatusBadge
                                    status={t.paymentStatus}
                                  />
                                </p>
                                {t.createdAt && (
                                  <p className="text-xs text-gray-500">
                                    Yaratilgan: {formatDateTimeISO(t.createdAt)}
                                  </p>
                                )}
                              </div>

                              {Array.isArray(t.payments) &&
                                t.payments.length > 0 && (
                                  <div className="space-y-2">
                                    <b>To‘lovlar:</b>
                                    {t.payments.map((p, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                                      >
                                        <div>
                                          <p className="font-semibold">
                                            {formatMoney(p.amount)}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {formatDateTimeISO(p.paidAt)}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
{Array.isArray(t.amountHistory) && t.amountHistory.length > 0 && (
  <div className="space-y-2">
    <b>Summa o‘zgarishlari:</b>
    {t.amountHistory.map((h, i) => (
      <div
        key={h._id || i}
        className="bg-gray-50 p-3 rounded-md space-y-1"
      >
        <p>
          <b>{formatMoney(h.oldAmount)}</b> → <b>{formatMoney(h.newAmount)}</b>
        </p>
        <p className="text-xs text-gray-600">
          {formatDateTimeISO(h.changedAt)}
        </p>
        <p className="text-sm text-gray-700">
          <b>Sabab:</b> {h.reason || "—"}
        </p>
        <p className="text-xs text-gray-600">
          <b>Kim o‘zgartirdi:</b>{" "}
          {h.changedByRole === "ADMIN" ? "Admin" : h.changedByRole}
        </p>
        <p className="text-xs text-gray-600">
          <b>Stomatolog tasdig‘i:</b> {h.confirmedDentistName || "—"}
        </p>
      </div>
    ))}
  </div>
)}
                              {Array.isArray(t.xrays) && t.xrays.length > 0 && (
                                <div>
                                  <b>Rentgenlar:</b>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                    {t.xrays.map((x) => {
                                      const url = `${backendUrl}/api/files/xray/${t._id}/${x._id}`;

                                      return (
                                        <SecureImage
                                          key={String(x._id)}
                                          url={url}
                                          token={authToken}
                                          alt={x.originalName || "xray"}
                                          onClick={(blobUrl) => {
                                            setActiveXray(blobUrl);
                                            setXrayOpen(true);
                                          }}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {ortho && isGenuineOrthoControl(row) && (
                            <div className="border rounded-xl p-4 bg-blue-50/50 space-y-2">
                              <p className="font-semibold text-primary">
                                Ortodont nazorat ma'lumoti
                              </p>
                              <p>
                                <b>Navbat raqami:</b> #{ortho.queueNo || "—"}
                              </p>
                              <p>
                                <b>Maqsad:</b>{" "}
                                {ortho.visitPurposeLabel ||
                                  ortho.visitPurpose ||
                                  "—"}
                              </p>
                              <p>
                                <b>Holat:</b> {toUzOrthoStatus(ortho.status)}
                              </p>
                              <p>
                                <b>Birinchi tashrif:</b>{" "}
                                {ortho.firstVisit ? "Ha" : "Yo‘q"}
                              </p>
                              <p>
                                <b>Keyingi nazorat:</b>{" "}
                                {ortho.followUpDays
                                  ? `${ortho.followUpDays} kun`
                                  : "—"}
                              </p>
                              <p>
  <b>Keyingi nazorat sanasi:</b>{" "}
  {ortho.nextPlannedDate ? formatDMY(ortho.nextPlannedDate) : "—"}
</p>

                              {ortho.joinedAt && (
                                <p>
                                  <b>Navbatga qo‘shilgan:</b>{" "}
                                  {formatDateTimeISO(ortho.joinedAt)}
                                </p>
                              )}
                              {ortho.calledAt && (
                                <p>
                                  <b>Chaqirilgan:</b>{" "}
                                  {formatDateTimeISO(ortho.calledAt)}
                                </p>
                              )}
                              {ortho.doneAt && (
                                <p>
                                  <b>Tugatildi:</b>{" "}
                                  {formatDateTimeISO(ortho.doneAt)}
                                </p>
                              )}

                              {Array.isArray(ortho.progressImages) &&
                                ortho.progressImages.length > 0 && (
                                  <div>
                                    <b>Jarayon rasmlari:</b>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                      {ortho.progressImages.map((img) => {
                                        const url = `${backendUrl}/api/files/orthodontist-queue-image/${ortho._id}/${img._id}`;

                                        return (
                                          <SecureImage
                                            key={String(img._id)}
                                            url={url}
                                            token={authToken}
                                            alt={
                                              img.originalName ||
                                              "ortho-progress"
                                            }
                                            onClick={(blobUrl) => {
                                              setActiveXray(blobUrl);
                                              setXrayOpen(true);
                                            }}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      )}
                    </details>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
      {markerPasswordOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[80]"
            onClick={closeMarkerPasswordPrompt}
          />
          <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
            <div
              className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Maxfiy infeksion belgi
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tahrirlash uchun parolni kiriting.
                </p>
              </div>

              <div className="px-5 py-4 space-y-3">
                <input
                  type="password"
                  value={markerPassword}
                  onChange={(e) => setMarkerPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      verifyMarkerAccess();
                    }
                  }}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Parol"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 border-t px-5 py-4">
                <button
                  type="button"
                  onClick={closeMarkerPasswordPrompt}
                  className="rounded-xl border px-4 py-2 text-sm"
                  disabled={markerPasswordChecking}
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={verifyMarkerAccess}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  disabled={markerPasswordChecking}
                >
                  {markerPasswordChecking ? "Tekshirilmoqda..." : "Kirish"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {xrayOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/80 z-[60]"
            onClick={() => {
              setXrayOpen(false);
              setActiveXray(null);
            }}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center">
            <img
              src={activeXray}
              className="max-w-[95vw] max-h-[95vh] rounded-xl shadow-2xl"
            />
          </div>
        </>
      )}

      <TelegramPatientConnectModal
        open={telegramConnectOpen}
        onClose={() => setTelegramConnectOpen(false)}
        link={telegramLink}
        patient={patient}
      />

      <AddHistoricalTreatmentModal
        open={historicalModalOpen}
        onClose={() => setHistoricalModalOpen(false)}
        patient={patient}
        backendUrl={backendUrl}
        authToken={authToken}
        authHeaderName={authHeaderName}
        isAdmin={isAdmin}
        onSuccess={() => {
          onPatientUpdated && onPatientUpdated();
        }}
      />
    </>
  );
};

const StatBox = ({ label, value, color }) => {
  const map = {
    green: {
      box: "bg-green-50",
      text: "text-green-700",
      val: "text-green-800",
    },
    blue: { box: "bg-blue-50", text: "text-blue-700", val: "text-blue-800" },
    yellow: {
      box: "bg-yellow-50",
      text: "text-yellow-700",
      val: "text-yellow-800",
    },
    red: { box: "bg-red-50", text: "text-red-700", val: "text-red-800" },
  };
  const c = map[color] || map.blue;

  return (
    <div className={`${c.box} p-4 rounded-xl text-center`}>
      <p className={`text-xs ${c.text}`}>{label}</p>
      <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
    </div>
  );
};

export default PatientModal;
