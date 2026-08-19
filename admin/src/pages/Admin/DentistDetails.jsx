import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext";
import {
  IMAGE_INPUT_ACCEPT_ATTR,
  createImagePreviewUrl,
  getImageFileError,
  humanizeImageUploadMessage,
} from "../../utils/imageUpload";
import { formatUzPhone, handleUzPhonePaste, isUzPhoneComplete, PHONE_PLACEHOLDER } from "../../utils/phone";
import TelegramPatientConnectModal from "../../components/TelegramPatientConnectModal.jsx";

const specialityOptions = [
  "Terapevtik stomatologiya",
  "Ortodontiya",
  "Ortopedik stomatologiya",
  "Stomatologiya Jarrohligi",
  "Parodontologiya",
  "Bolalar stomatologiyasi",
  "Implantologiya",
  "Estetik stomatologiya",
  "Rentgenologiya",
];

const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\u0400-\u04FF\s'-]+$/u;
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const DentistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl, aToken } = useContext(AdminContext);

  const authHeader = useMemo(() => ({ headers: { atoken: aToken } }), [aToken]);

  const fileRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [dentistMeta, setDentistMeta] = useState(null);
  const [telegramLink, setTelegramLink] = useState("");
  const [telegramTokenHash, setTelegramTokenHash] = useState("");
  const [telegramConnectOpen, setTelegramConnectOpen] = useState(false);
  const [creatingTelegramLink, setCreatingTelegramLink] = useState(false);

  const [customScheduleEnabled, setCustomScheduleEnabled] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const fetchSchedule = async () => {
    try {
      setScheduleLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/dentists/${id}/schedule`, authHeader);
      if (data?.success) {
        setSchedule(data.workingSchedule || []);
        setCustomScheduleEnabled(!!data.isCustom);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setScheduleLoading(false);
    }
  };

  useEffect(() => {
    if (aToken && id) {
      fetchSchedule();
    }
  }, [aToken, id]);

  const triggerReload = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/dentists/${id}`,
        authHeader,
      );
      if (data?.success) {
        setDentistMeta(data.dentist);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createTelegramLink = async () => {
    if (dentistMeta?.telegram?.isVerified) {
      toast.info("Telegram allaqachon ulangan");
      return;
    }
    if (telegramLink) {
      setTelegramConnectOpen(true);
      return;
    }
    if (!id || creatingTelegramLink) return;
    try {
      setCreatingTelegramLink(true);
      const { data: resp } = await axios.post(
        `${backendUrl}/api/admin/dentists/${id}/telegram-link`,
        {},
        { headers: { atoken: aToken } }
      );
      if (resp?.success) {
        setTelegramLink(resp.deepLink || "");
        setTelegramTokenHash(resp.tokenHash || "");
        setTelegramConnectOpen(true);
      } else {
        throw new Error(resp?.message || "Xatolik");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Telegram ulanish havolasini yaratib bo'lmadi");
    } finally {
      setCreatingTelegramLink(false);
    }
  };

  const handleTelegramDisconnect = async () => {
    if (!window.confirm("Telegramni haqiqatdan ham uzmoqchimisiz?")) return;
    try {
      const { data: resp } = await axios.post(
        `${backendUrl}/api/admin/dentists/${id}/telegram-unlink`,
        {},
        { headers: { atoken: aToken } }
      );
      if (resp?.success) {
        toast.success("Telegram bog'lanishi muvaffaqiyatli uzildi!");
        setTelegramLink("");
        setTelegramTokenHash("");
        triggerReload();
      } else {
        throw new Error(resp?.message || "Xatolik");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Telegramni uzib bo'lmadi");
    }
  };

  useEffect(() => {
    if (!telegramLink || !telegramTokenHash || !id || !telegramConnectOpen) return undefined;
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const { data: resp } = await axios.get(
          `${backendUrl}/api/admin/dentists/${id}/telegram-check`,
          { headers: { atoken: aToken } }
        );
        if (!isMounted) return;
        if (resp?.success && resp?.linked) {
          setTelegramLink("");
          setTelegramTokenHash("");
          setTelegramConnectOpen(false);
          toast.success("Telegram muvaffaqiyatli ulandi!");
          triggerReload();
        }
      } catch (err) {
        console.error("Error polling telegram check status:", err);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [telegramLink, telegramTokenHash, id, telegramConnectOpen, backendUrl, aToken]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${backendUrl}/api/admin/dentists/${id}`,
          authHeader,
        );

        if (!data?.success) {
          toast.error(data?.message || "Xatolik");
          setForm(null);
          return;
        }

        const d = data.dentist;
        setDentistMeta(d);

        setForm({
          name: d?.name || "",
          phone: formatUzPhone(d?.phone || ""),
          email: d?.email || "",
          gender: d?.gender || "male",
          experience: String(d?.experience ?? ""),
          speciality: Array.isArray(d?.speciality) ? d.speciality : [],
          degree: d?.degree || "",
          about: d?.about || "",
          imageUrl: d?.image || "",
          isArchived: Boolean(d?.isArchived),
        });

        setErrors({});
        setImageFile(null);
        setImagePreview(d?.image ? `${d.image}?v=${Date.now()}` : "");
      } catch {
        toast.error("Akkauntni yuklashda xatolik");
        setForm(null);
      } finally {
        setLoading(false);
      }
    };

    if (aToken && id) load();
  }, [aToken, id, backendUrl, authHeader]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setErrors((p) => ({ ...p, [name]: "" }));

    if (name === "name") {
      const clean = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\u0400-\u04FF\s'-]/gu, "");
      setForm((p) => ({ ...p, name: clean }));
      return;
    }

    if (name === "phone") {
      setForm((p) => ({ ...p, phone: formatUzPhone(value) }));
      return;
    }

    if (name === "experience") {
      const digits = value.replace(/\D/g, "");
      setForm((p) => ({ ...p, experience: digits }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleMultiSelectChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (o) => o.value);
    setForm((p) => ({ ...p, speciality: selected }));
    setErrors((p) => ({ ...p, speciality: "" }));
  };

  const pickImage = () => fileRef.current?.click();

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageError = getImageFileError(file, { maxBytes: 20 * 1024 * 1024 });
    if (imageError) {
      toast.error(imageError);
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(await createImagePreviewUrl(file));
  };

  const validateAll = () => {
    const errs = {};

    if (!form.name.trim()) errs.name = "Ism majburiy.";
    else if (!nameRegex.test(form.name.trim()))
      errs.name = "Ism faqat harflardan iborat bo‘lishi kerak.";

    if (!form.phone.trim()) errs.phone = "Telefon majburiy.";
    else if (!isUzPhoneComplete(form.phone))
      errs.phone = "Telefon formati: +998 (95) 123-45-67";

    if (!form.email.trim()) errs.email = "Email majburiy.";
    else if (!emailRegex.test(form.email))
      errs.email = "Email formati noto‘g‘ri.";

    if (!form.gender) errs.gender = "Jins tanlanishi kerak.";

    if (form.experience === "") errs.experience = "Tajriba (yil) majburiy.";
    else {
      const exp = Number(form.experience);
      if (!Number.isInteger(exp) || exp < 0 || exp > 50)
        errs.experience = "Tajriba 0..50 butun son bo‘lsin.";
    }

    if (!form.speciality || form.speciality.length === 0)
      errs.speciality = "Hech bo‘lmaganda bitta mutaxassislik tanlang.";

    if (!form.degree.trim()) errs.degree = "Daraja majburiy.";

    if (!form.about.trim()) errs.about = "Stomatolog haqida yozing.";
    else if (form.about.trim().length < 10)
      errs.about = "Kamida 10 ta belgidan iborat bo‘lsin.";

    return errs;
  };

  const onSave = async (e) => {
    e.preventDefault();

    const errs = validateAll();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Iltimos, formani to‘g‘ri to‘ldiring");
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("phone", form.phone.trim());
      fd.append("email", form.email.trim());
      fd.append("gender", form.gender);
      fd.append("experience", String(Number(form.experience || 0)));
      fd.append("degree", form.degree.trim());
      fd.append("about", form.about.trim());
      fd.append("speciality", JSON.stringify(form.speciality));

      if (imageFile) fd.append("image", imageFile);

      const { data } = await axios.put(
        `${backendUrl}/api/admin/dentists/${id}`,
        fd,
        {
          headers: {
            atoken: aToken,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!data?.success) {
        toast.error(humanizeImageUploadMessage(data?.message, "Ma’lumotlarni saqlashda xatolik yuz berdi."));
        return;
      }

      toast.success("Akkaunt saqlandi");

      const d = data.dentist;
      setForm((p) => ({
        ...p,
        name: d?.name || "",
        phone: formatUzPhone(d?.phone || ""),
        email: d?.email || "",
        gender: d?.gender || "male",
        experience: String(d?.experience ?? ""),
        speciality: Array.isArray(d?.speciality) ? d.speciality : [],
        degree: d?.degree || "",
        about: d?.about || "",
        imageUrl: d?.image || p?.imageUrl || "",
        isArchived: Boolean(d?.isArchived),
      }));

      setImageFile(null);
      setImagePreview(d?.image || "");
    } catch (err) {
      toast.error(
        humanizeImageUploadMessage(
          err?.response?.data?.message || err?.message,
          "Ma’lumotlarni saqlashda xatolik yuz berdi.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const toImg = (path) => {
    if (!path) return "";
    if (path.startsWith("blob:")) return path;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${backendUrl}${path}`;
  };

  const handleArchiveToggle = async () => {
    if (!form) return;

    const nextArchived = !form.isArchived;
    const confirmText = nextArchived
      ? `Bu stomatolog arxivga o‘tkazilsinmi?

Arxivdagi stomatolog public ro‘yxat, bron, jonli status va dentist login oqimlaridan yashiriladi. Eski tarix saqlanib qoladi.`
      : "Bu stomatolog arxivdan chiqarilsinmi?";

    if (!window.confirm(confirmText)) return;

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/dentists/${id}/archive`,
        { isArchived: nextArchived },
        authHeader,
      );

      if (!data?.success) {
        toast.error(humanizeImageUploadMessage(data?.message, "Holatni yangilab bo‘lmadi"));
        return;
      }

      toast.success(data.message || "Holat yangilandi");
      setForm((prev) =>
        prev
          ? { ...prev, isArchived: Boolean(data?.dentist?.isArchived) }
          : prev,
      );
    } catch (err) {
      toast.error(
        humanizeImageUploadMessage(
          err?.response?.data?.message || err?.message,
          "Holatni yangilashda xatolik",
        ),
      );
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (loading) return <div className="p-6 text-gray-500">Yuklanmoqda...</div>;
  if (!form) return <div className="p-6 text-gray-500">Topilmadi</div>;

  return (
    <main className="w-full min-h-screen bg-gray-50 px-4 py-8">
      <article className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <section className="bg-gray-50 p-6">
            <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
              <img
                src={toImg(imagePreview || form.imageUrl)}
                alt={form.name ? `${form.name} rasmi` : "Stomatolog rasmi"}
                className="h-[380px] w-full object-cover sm:h-[520px]"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/doctor-placeholder.svg";
                }}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept={IMAGE_INPUT_ACCEPT_ATTR}
                onChange={handleImageChange}
                hidden
              />
              <button
                type="button"
                onClick={pickImage}
                className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Rasmni yangilash
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50"
              >
                ← Orqaga
              </button>
            </div>
          </section>
          <section className="p-8">
            <div className="mb-6 flex flex-col gap-3 rounded-xl border bg-amber-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  Stomatolog akkaunti (Admin tahriri)
                </h1>
                {form.isArchived ? (
                  <span className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    Arxivda
                  </span>
                ) : (
                  <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Faol
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleArchiveToggle}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                  form.isArchived
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {form.isArchived ? "Arxivdan chiqarish" : "Arxivga o‘tkazish"}
              </button>
            </div>

            {/* Telegram Connection Card */}
            <div className="mb-6 rounded-2xl border border-sky-100 bg-sky-50/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-sky-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Telegram Bot ulanishi
                  </p>
                  {dentistMeta?.telegram?.isVerified ? (
                    <div className="mt-1">
                      <p className="text-xs font-bold text-green-800">Telegram faol ulandi</p>
                      {dentistMeta.telegram.username && (
                        <p className="text-[10px] text-slate-500 mt-1">Username: @{dentistMeta.telegram.username}</p>
                      )}
                      {dentistMeta.telegram.chatId && (
                        <p className="text-[10px] font-mono text-slate-500">Chat ID: {dentistMeta.telegram.chatId}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-0.5">Telegram bot hali ulanmagan. Skanerlash uchun QR kod generatsiya qiling.</p>
                  )}
                </div>
              </div>
              <div>
                {dentistMeta?.telegram?.isVerified ? (
                  <button
                    type="button"
                    onClick={handleTelegramDisconnect}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 active:scale-95 transition-all"
                  >
                    Telegramni uzish
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={createTelegramLink}
                    disabled={creatingTelegramLink}
                    className="rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 px-4 py-2 text-xs font-bold text-white shadow-sm active:scale-95 transition-all"
                  >
                    {creatingTelegramLink ? "Yaratilmoqda..." : "Telegram QR/havolasini olish"}
                  </button>
                )}
              </div>
            </div>

            {/* Working Schedule Card */}
            <div className="mb-6 rounded-2xl border border-sky-100 bg-white p-5 space-y-4 shadow-sm">
              <div>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ish vaqti sozlamalari
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Ushbu shifokor uchun shaxsiy ish jadvalini sozlashingiz mumkin. O‘chirilsa, klinika standart ish vaqti qo‘llaniladi.
                </p>
              </div>

              {scheduleLoading ? (
                <div className="text-xs text-slate-500">Yuklanmoqda...</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl">
                    <input
                      type="checkbox"
                      id="adminCustomScheduleToggle"
                      checked={customScheduleEnabled}
                      onChange={(e) => setCustomScheduleEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500 cursor-pointer"
                    />
                    <label htmlFor="adminCustomScheduleToggle" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                      Shaxsiy ish vaqti jadvalini qo‘llash
                    </label>
                  </div>

                  {customScheduleEnabled && (
                    <div className="space-y-2">
                      {schedule.map((item, idx) => {
                        const daysUz = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
                        return (
                          <div key={item.day} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                id={`admin-dentist-day-${item.day}`}
                                checked={item.isOpen}
                                onChange={() => {
                                  const next = [...schedule];
                                  next[idx] = { ...next[idx], isOpen: !next[idx].isOpen };
                                  setSchedule(next);
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500 cursor-pointer"
                              />
                              <label htmlFor={`admin-dentist-day-${item.day}`} className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                                {daysUz[item.day]}
                              </label>
                            </div>

                            {item.isOpen ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={item.start}
                                  onChange={(e) => {
                                    const next = [...schedule];
                                    next[idx] = { ...next[idx], start: e.target.value };
                                    setSchedule(next);
                                  }}
                                  className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white outline-none focus:border-sky-500"
                                />
                                <span className="text-slate-400 text-xs">—</span>
                                <input
                                  type="time"
                                  value={item.end}
                                  onChange={(e) => {
                                    const next = [...schedule];
                                    next[idx] = { ...next[idx], end: e.target.value };
                                    setSchedule(next);
                                  }}
                                  className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white outline-none focus:border-sky-500"
                                />
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                                Dam olish kuni
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setSavingSchedule(true);
                        const { data } = await axios.post(
                          `${backendUrl}/api/admin/dentists/${id}/schedule`,
                          {
                            workingSchedule: schedule,
                            isReset: !customScheduleEnabled
                          },
                          authHeader
                        );
                        if (data?.success) {
                          toast.success(data.message || "Shifokor ish vaqti saqlandi!");
                          fetchSchedule();
                        } else {
                          toast.error(data?.message || "Xatolik yuz berdi");
                        }
                      } catch (error) {
                        toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
                      } finally {
                        setSavingSchedule(false);
                      }
                    }}
                    disabled={savingSchedule}
                    className="w-full rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-bold py-2.5 text-xs transition shadow-sm active:scale-95"
                  >
                    {savingSchedule ? "Saqlanmoqda..." : "Ish vaqtini saqlash"}
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={onSave} noValidate>
              <fieldset className="space-y-5">
                <Field label="Ism Sharif" error={errors.name}>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Masalan: Dr. Dilshoda Qodirova"
                    className={inputClass(errors.name)}
                  />
                </Field>
                <Field label="Jins" error={errors.gender}>
                  <div className="flex gap-3">
                    <label
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 ${
                        form.gender === "male"
                          ? "border-primary bg-primary/10"
                          : "border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={form.gender === "male"}
                        onChange={handleChange}
                        className="accent-primary"
                      />
                      <span className="text-sm">Erkak</span>
                    </label>
                    <label
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 ${
                        form.gender === "female"
                          ? "border-primary bg-primary/10"
                          : "border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={form.gender === "female"}
                        onChange={handleChange}
                        className="accent-primary"
                      />
                      <span className="text-sm">Ayol</span>
                    </label>
                  </div>
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Telefon" error={errors.phone}>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder={PHONE_PLACEHOLDER}
                      inputMode="tel"
                      maxLength={PHONE_PLACEHOLDER.length}
                      onPaste={(e) => handleUzPhonePaste(e, (formatted) => {
                        setForm((p) => ({ ...p, phone: formatted }));
                        setErrors((prev) => ({ ...prev, phone: "" }));
                      })}
                      className={inputClass(errors.phone)}
                    />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      placeholder="dr@gmail.com"
                      className={inputClass(errors.email)}
                    />
                  </Field>
                </div>
                <Field label="Tajriba (yil)" error={errors.experience}>
                  <input
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    max="50"
                    placeholder="Masalan: 5"
                    className={inputClass(errors.experience)}
                  />
                </Field>
                <Field label="Mutaxassislik(lar)" error={errors.speciality}>
                  <select
                    multiple
                    value={form.speciality}
                    onChange={handleMultiSelectChange}
                    className={`${inputClass(errors.speciality)} h-32`}
                  >
                    {specialityOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Bir nechta tanlash uchun <b>Ctrl</b> (Mac: <b>Cmd</b>).
                  </p>
                </Field>
                <Field label="Ma’lumoti / Darajasi" error={errors.degree}>
                  <input
                    name="degree"
                    value={form.degree}
                    onChange={handleChange}
                    placeholder="Masalan: Tibbiyot doktori"
                    className={inputClass(errors.degree)}
                  />
                </Field>
                <Field label="Stomatolog haqida" error={errors.about}>
                  <textarea
                    name="about"
                    value={form.about}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Mutaxassis haqida batafsil..."
                    className={`${inputClass(errors.about)} resize-none`}
                  />
                </Field>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`rounded-md px-6 py-2 font-semibold text-white shadow-md transition ${
                      saving
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-gradient-to-r from-primary to-secondary hover:opacity-95"
                    }`}
                  >
                    {saving ? "Saqlanmoqda..." : "Saqlash"}
                  </button>
                </div>
              </fieldset>
            </form>
          </section>
        </div>
      </article>
      <TelegramPatientConnectModal
        open={telegramConnectOpen}
        onClose={() => setTelegramConnectOpen(false)}
        link={telegramLink}
        patient={dentistMeta}
        title="Mutaxassis Telegramga ulanishi"
      />
    </main>
  );
};

const Field = ({ label, error, children }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">
      {label}
    </label>
    {children}
    {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
  </div>
);

const inputClass = (err) =>
  `w-full rounded-md border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${
    err ? "border-red-400" : "border-gray-300"
  }`;

export default DentistDetails;
