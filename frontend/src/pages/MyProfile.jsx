import { useState, useContext, useEffect, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import profilePic from "../assets/profile_pic.png";
import { isoToday } from "../../../shared/date.js";
import {
  IMAGE_INPUT_ACCEPT_ATTR,
  createImagePreviewUrl,
  getImageFileError,
  humanizeImageUploadMessage,
  revokePreviewUrl,
} from "../utils/imageUpload";
import { formatUzPhone, isUzPhoneComplete, handleUzPhonePaste, PHONE_PLACEHOLDER } from "../utils/phone";
import Seo from "../components/Seo";

const MyProfile = () => {
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [telegramLoading, setTelegramLoading] = useState(true);
  const [telegramActionLoading, setTelegramActionLoading] = useState(false);

  const { userData, setUserData, token, backendUrl, getUserProfile } =
    useContext(AppContext);

  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const loadTelegramStatus = useCallback(async () => {
    if (!token) {
      setTelegramStatus(null);
      setTelegramLoading(false);
      return;
    }

    try {
      setTelegramLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/user/telegram/status`,
        { headers: { token } },
      );

      if (data.success) {
        setTelegramStatus(data.telegram || null);
      } else {
        toast.error(data.message || "Telegram holatini yuklab bo‘lmadi");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Telegram holatini yuklab bo‘lmadi",
      );
    } finally {
      setTelegramLoading(false);
    }
  }, [backendUrl, token]);

  const handleTelegramConnect = async () => {
    try {
      setTelegramActionLoading(true);

      const { data } = await axios.post(
        `${backendUrl}/api/user/telegram/link-token`,
        {},
        { headers: { token } },
      );

      if (!data.success) {
        toast.error(data.message || "Telegram ulash tokeni yaratilmagan");
        return;
      }

      if (!data.deepLink) {
        toast.error("Telegram havolasi yaratilmagan");
        return;
      }

      const isIPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      let tgDeepLink = data.deepLink;
      try {
        const url = new URL(data.deepLink);
        const domain = url.pathname.replace(/^\//, "");
        const start = url.searchParams.get("start");
        if (domain && start) {
          tgDeepLink = `tg://resolve?domain=${domain}&start=${start}`;
        }
      } catch (e) {
        const match = data.deepLink.match(/(?:t\.me|telegram\.me)\/([^/?]+)\?start=(.+)$/i);
        if (match) {
          tgDeepLink = `tg://resolve?domain=${match[1]}&start=${match[2]}`;
        }
      }

      if (isMobile && tgDeepLink.startsWith("tg://")) {
        window.location.href = tgDeepLink;
      } else {
        if (isIPhone) {
          window.location.href = data.deepLink;
        } else {
          window.open(data.deepLink, "_blank", "noopener,noreferrer");
        }
      }

      await loadTelegramStatus();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Telegram ulashda xatolik",
      );
    } finally {
      setTelegramActionLoading(false);
    }
  };

  const handleTelegramUnlink = async () => {
    try {
      setTelegramActionLoading(true);

      const { data } = await axios.post(
        `${backendUrl}/api/user/telegram/unlink`,
        {},
        { headers: { token } },
      );

      if (data.success) {
        toast.success(data.message || "Telegram uzildi");
        await loadTelegramStatus();
      } else {
        toast.error(data.message || "Telegram uzishda xatolik");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Telegram uzishda xatolik",
      );
    } finally {
      setTelegramActionLoading(false);
    }
  };

  useEffect(() => {
    loadTelegramStatus();
  }, [loadTelegramStatus]);

  useEffect(() => {
    document.title = "Mening profilim | Magic Denta";
    const metaRobots = document.querySelector('meta[name="robots"]') || document.createElement("meta");
    metaRobots.name = "robots";
    metaRobots.content = "noindex, nofollow";
    if (!document.head.contains(metaRobots)) {
      document.head.appendChild(metaRobots);
    }
  }, []);

  const updateUserProfile = async () => {
    try {
      if (!token) {
        toast.error("Token topilmadi. Iltimos login qiling.");
        return;
      }

      const formData = new FormData();
      formData.append("name", userData.name || "");
      formData.append("email", userData.email || "");
      formData.append("phone", userData.phone || "");
      formData.append("gender", userData.gender || "Tanlanmagan");
      formData.append("DOB", userData.DOB || "");
      formData.append(
        "address",
        JSON.stringify({
          line1: userData?.address?.line1 || "",
          line2: userData?.address?.line2 || "",
        }),
      );

      if (image) {
        formData.append("image", image);
      }

      const { data } = await axios.post(
        backendUrl + "/api/user/profile",
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (data.success) {
        if (data.user) {
          setUserData(data.user);
        }
        toast.success(data.message || "Akkaunt yangilandi");
        await getUserProfile();
        setIsEditing(false);
        setImage(false);
        setImagePreviewUrl("");
      } else {
        toast.error(humanizeImageUploadMessage(data.message, "Akkauntni yangilashda xatolik yuz berdi."));
      }
    } catch (error) {
      toast.error(
        humanizeImageUploadMessage(
          error?.response?.data?.message || error?.message,
          "Akkauntni yangilashda xatolik yuz berdi.",
        ),
      );
    }
  };

  useEffect(() => {
    return () => {
      revokePreviewUrl(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const formatDisplayDate = (isoDate) => {
    if (!isoDate || isoDate === "Tanlanmagan") return "Kiritilmagan";
    const [year, month, day] = isoDate.split("-");
    if (!year || !month || !day) return isoDate;
    return `${day}.${month}.${year}`;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageError = getImageFileError(file, { maxBytes: 20 * 1024 * 1024 });
    if (imageError) {
      setErrors((prev) => ({ ...prev, image: imageError }));
      toast.error(imageError);
      e.target.value = "";
      return;
    }

    setImage(file);
    setErrors((prev) => ({ ...prev, image: "" }));
    setImagePreviewUrl(await createImagePreviewUrl(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setUserData((prev) => ({ ...prev, phone: formatUzPhone(value) }));
      setErrors((prev) => ({ ...prev, phone: "" }));
    } else if (name.includes("address.")) {
      const key = name.split(".")[1];
      setUserData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
    } else {
      setUserData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const isNameValid = (value) =>
    /^[A-Za-z\u0400-\u04FF\s\-`´‘’ʼ']+$/u.test(value);

  const isEmail = (email) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);

  const validate = () => {
    const validationErrors = {};

    if (!userData.name?.trim()) validationErrors.name = "Ism majburiy.";
    else if (!isNameValid(userData.name))
      validationErrors.name =
        "Ism Sharif faqat harf, bo‘sh joy, tire va apostrofdan iborat bo‘lishi kerak.";

    if (!userData.phone?.trim())
      validationErrors.phone = "Telefon raqam majburiy.";
    else if (!isUzPhoneComplete(userData.phone))
      validationErrors.phone =
        "Telefon formati noto‘g‘ri. Masalan: +998 (95) 123-45-67";

    if (userData.email?.trim() && !isEmail(userData.email))
      validationErrors.email = "Email manzilingiz noto‘g‘ri.";

    if (!userData?.address?.line1?.trim())
      validationErrors.line1 = "Shahar / Tuman majburiy.";
    else if (!/^[A-Za-zА-Яа-яЁё\s]+$/.test(userData.address.line1))
      validationErrors.line1 =
        "Shahar / Tuman faqat harflardan iborat bo‘lishi kerak.";

    if (!userData?.address?.line2?.trim())
      validationErrors.line2 = "Mahalla, Ko'cha, Xonadon majburiy.";

    if (userData.gender !== "Erkak" && userData.gender !== "Ayol") {
      validationErrors.gender = "Iltimos, jinsni tanlang (Erkak yoki Ayol)";
    }

    if (!userData.DOB || userData.DOB === "Tanlanmagan")
      validationErrors.DOB = "Tug‘ilgan sana majburiy.";
    else {
      const birthDate = new Date(userData.DOB);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      if (age < 1 || age > 100)
        validationErrors.DOB =
          "Yosh 1 dan kam yoki 100 dan ko‘p bo‘lmasligi kerak.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    await updateUserProfile(); 
  };

  return (
    userData && (
      <div className="max-w-5xl mx-auto py-6 sm:py-12 px-4 sm:px-6">
        <Seo title="Mening Profilim | Magic Denta" noindex={true} />
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <span className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1 sm:mb-2">
            SHAXSIY KABINET
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Mening profilim
          </h1>
          <p className="text-slate-500 text-xs sm:text-base mt-1.5">
            Shaxsiy ma’lumotlaringizni ko‘rish, tahrirlash va Telegram eslatmalarini boshqarish
          </p>
        </div>

        {/* No-slide Full Width Adaptive Navigation Tabs */}
        <div className="w-full max-w-xl mx-auto mb-8 sm:mb-10">
          <div className="grid grid-cols-3 bg-slate-100/90 p-1 rounded-2xl sm:rounded-full border border-slate-200/70 shadow-xs">
            <NavLink
              to="/myprofile"
              className={({ isActive }) =>
                `py-2 sm:py-2.5 px-1 sm:px-4 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-center ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="truncate">Profil</span>
            </NavLink>
            <NavLink
              to="/myappointments"
              className={({ isActive }) =>
                `py-2 sm:py-2.5 px-1 sm:px-4 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-center ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="truncate">Uchrashuvlar</span>
            </NavLink>
            <NavLink
              to="/my-treatments"
              className={({ isActive }) =>
                `py-2 sm:py-2.5 px-1 sm:px-4 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-center ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="truncate">Davolash</span>
            </NavLink>
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          {/* Profile Top Hero Banner */}
          <div className="relative bg-gradient-to-r from-slate-900 via-[#141820] to-slate-900 p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <figure className="relative group shrink-0">
                <img
                  src={
                    imagePreviewUrl
                      ? imagePreviewUrl
                      : userData?.image
                        ? backendUrl + userData.image
                        : profilePic
                  }
                  alt={`${userData?.name || "Bemor"} Akkaunt rasmi`}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white/20 shadow-xl bg-slate-800"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = profilePic;
                  }}
                />
                {isEditing && (
                  <label
                    htmlFor="profileImage"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white text-xs font-bold rounded-3xl cursor-pointer opacity-90 hover:opacity-100 transition backdrop-blur-xs border-2 border-dashed border-white/60"
                  >
                    <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>O‘zgartirish</span>
                  </label>
                )}
                <input
                  id="profileImage"
                  type="file"
                  accept={IMAGE_INPUT_ACCEPT_ATTR}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </figure>

              <div className="text-center sm:text-left flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
                  <span className="text-[10px] font-extrabold px-3 py-1 bg-white/10 text-amber-200 rounded-full uppercase tracking-wider border border-white/10">
                    Bemor Akkaunti
                  </span>
                  {userData?.patientId && (
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-white/10 text-slate-300 rounded-full">
                      ID: #{userData.patientId}
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-1 max-w-md">
                    <input
                      type="text"
                      name="name"
                      value={userData.name}
                      onChange={handleChange}
                      placeholder="Ism Sharifingiz"
                      className={`bg-white/10 text-white placeholder-slate-400 border rounded-xl px-4 py-2.5 w-full text-base font-bold outline-none focus:ring-2 focus:ring-amber-300 ${
                        errors.name ? "border-red-400" : "border-white/20"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-300 text-xs mt-1 text-left">{errors.name}</p>
                    )}
                  </div>
                ) : (
                  <h2 className="text-2xl sm:text-3xl font-black text-white truncate">
                    {userData.name}
                  </h2>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs sm:text-sm text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {userData.phone || "Telefon kiritilmagan"}
                  </span>
                  {userData.email && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {userData.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Edit Toggle Action in Header */}
              <div className="sm:self-start">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => {
                      setUserData((prev) => ({
                        ...prev,
                        phone: formatUzPhone(prev.phone),
                      }));
                      setIsEditing(true);
                    }}
                    className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-full shadow-sm transition active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Tahrirlash</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 bg-white/10 text-white hover:bg-white/20 font-bold text-xs rounded-full border border-white/20 transition active:scale-95 cursor-pointer"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-full shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Saqlash</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="p-6 sm:p-10 space-y-8">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                <span>Asosiy ma’lumotlar</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Elektron pochta (Email)
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      onChange={handleChange}
                      onKeyDown={(e) =>
                        !/^[A-Za-z0-9@._-]*$/.test(e.key) && e.preventDefault()
                      }
                      placeholder="namuna@gmail.com"
                      className={`w-full bg-slate-50 border rounded-2xl p-3.5 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition ${
                        errors.email ? "border-red-500 bg-red-50/20" : "border-slate-200"
                      }`}
                    />
                  ) : (
                    <div className="w-full bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-sm font-bold text-slate-800 flex items-center justify-between">
                      <span>{userData.email || "Kiritilmagan"}</span>
                    </div>
                  )}
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Telefon raqam
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleChange}
                      placeholder={PHONE_PLACEHOLDER}
                      onPaste={(e) => handleUzPhonePaste(e, (formatted) => {
                        setUserData((prev) => ({ ...prev, phone: formatted }));
                        setErrors((prev) => ({ ...prev, phone: "" }));
                      })}
                      inputMode="tel"
                      maxLength={PHONE_PLACEHOLDER.length}
                      className={`w-full bg-slate-50 border rounded-2xl p-3.5 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition ${
                        errors.phone ? "border-red-500 bg-red-50/20" : "border-slate-200"
                      }`}
                    />
                  ) : (
                    <div className="w-full bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-sm font-bold text-slate-800">
                      {userData.phone || "Kiritilmagan"}
                    </div>
                  )}
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone}</p>
                  )}
                </div>

                {/* City / District */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Shahar / Tuman
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.line1"
                      value={userData?.address?.line1 || ""}
                      onChange={handleChange}
                      placeholder="Toshkent"
                      onKeyDown={(e) =>
                        !/^[A-Za-zА-Яа-яЁё\s]*$/.test(e.key) && e.preventDefault()
                      }
                      className={`w-full bg-slate-50 border rounded-2xl p-3.5 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition ${
                        errors.line1 ? "border-red-500 bg-red-50/20" : "border-slate-200"
                      }`}
                    />
                  ) : (
                    <div className="w-full bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-sm font-bold text-slate-800">
                      {userData?.address?.line1 || "Kiritilmagan"}
                    </div>
                  )}
                  {errors.line1 && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">{errors.line1}</p>
                  )}
                </div>

                {/* Street / Home */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Mahalla, Ko‘cha, Xonadon
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.line2"
                      value={userData?.address?.line2 || ""}
                      onChange={handleChange}
                      placeholder="Ko‘cha, xonadon"
                      className={`w-full bg-slate-50 border rounded-2xl p-3.5 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition ${
                        errors.line2 ? "border-red-500 bg-red-50/20" : "border-slate-200"
                      }`}
                    />
                  ) : (
                    <div className="w-full bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-sm font-bold text-slate-800">
                      {userData?.address?.line2 || "Kiritilmagan"}
                    </div>
                  )}
                  {errors.line2 && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">{errors.line2}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Jinsi
                  </label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={userData.gender}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition cursor-pointer"
                    >
                      <option value="">Tanlanmagan</option>
                      <option value="Erkak">Erkak</option>
                      <option value="Ayol">Ayol</option>
                    </select>
                  ) : (
                    <div className="w-full bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-sm font-bold text-slate-800">
                      {userData.gender || "Tanlanmagan"}
                    </div>
                  )}
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">{errors.gender}</p>
                  )}
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Tug‘ilgan sana
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="DOB"
                      value={userData.DOB === "Tanlanmagan" ? "" : userData.DOB}
                      onChange={handleChange}
                      max={isoToday()}
                      className={`w-full bg-slate-50 border rounded-2xl p-3.5 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition cursor-pointer ${
                        errors.DOB ? "border-red-500 bg-red-50/20" : "border-slate-200"
                      }`}
                    />
                  ) : (
                    <div className="w-full bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-sm font-bold text-slate-800">
                      {formatDisplayDate(userData.DOB)}
                    </div>
                  )}
                  {errors.DOB && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">{errors.DOB}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Telegram Integration Card */}
            <div className="pt-4">
              <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#24A1DE]"></span>
                <span>Telegram Bot Xabarnomalari</span>
              </h3>

              <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#24A1DE]/10 text-[#24A1DE] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 4L3 11.5l4 1.5 1.5 4L21 4z" />
                      </svg>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900">Telegram Bot</h4>
                        {telegramLoading ? (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            Tekshirilmoqda...
                          </span>
                        ) : telegramStatus?.isLinked ? (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Ulangan
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            Ulanmagan
                          </span>
                        )}
                      </div>

                      {telegramStatus?.isLinked ? (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-sm font-bold text-slate-800">
                            {telegramStatus?.username
                              ? `@${telegramStatus.username}`
                              : telegramStatus?.firstName || "Telegram Akkaunti"}
                          </p>
                          <p className="text-xs text-slate-500">
                            Qabul eslatmalari va davolash yangiliklari shu Telegram akkauntingizga yuboriladi.
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mt-1">
                          Qabul vaqtini unutmaslik uchun Telegram botimizga ulaning va bepul eslatmalar oling.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {telegramStatus?.isLinked ? (
                      <button
                        type="button"
                        onClick={handleTelegramUnlink}
                        disabled={telegramActionLoading}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-2xl font-bold text-xs text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 active:scale-95 disabled:opacity-50 transition cursor-pointer"
                      >
                        Telegramni uzish
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleTelegramConnect}
                        disabled={telegramActionLoading}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs text-white bg-[#24A1DE] hover:bg-[#1f8fcd] shadow-sm hover:shadow active:scale-95 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.2-.02-.08.02-1.3 0.83-3.68 2.44-.35.24-.67.36-.96.35-.32-.01-.94-.18-1.4-.33-.56-.18-1.01-.28-0.97-.6.02-.17.26-.34.7-.52 2.76-1.2 4.6-2 5.53-2.4 2.64-1.1 3.19-1.28 3.55-1.28.08 0 .25.02.36.1.1.08.13.18.14.28 0 .06-.01.12-.02.18z" />
                        </svg>
                        <span>Telegram orqali ulash</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default MyProfile;
