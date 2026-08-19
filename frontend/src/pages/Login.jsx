import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import eyesClosed from "../assets/login/eyes-closed.png";
import eyesOpened from "../assets/login/eyes-opened.png";

import { AppContext } from "../context/AppContext";
import { isoToday } from "../../../shared/date.js";
import {
  IMAGE_INPUT_ACCEPT_ATTR,
  createImagePreviewUrl,
  getImageFileError,
  humanizeImageUploadMessage,
  revokePreviewUrl,
} from "../utils/imageUpload";
import { formatUzPhone, isUzPhoneComplete, maybeFormatUzPhoneCandidate, PHONE_PLACEHOLDER } from "../utils/phone";
import Seo from "../components/Seo";

const PasswordToggle = ({ visible, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition"
    aria-label={visible ? "Parolni yashirish" : "Parolni ko‘rsatish"}
  >
    <img
      src={visible ? eyesOpened : eyesClosed}
      alt=""
      className="h-5 w-5 object-contain opacity-70 hover:opacity-100 transition-opacity"
    />
  </button>
);

const ErrorText = ({ message }) =>
  message ? (
    <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1 text-left">
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </p>
  ) : null;

const Login = () => {
  const { backendUrl, setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const lang = localStorage.getItem("language") || "uz";

  // Active main mode: "login" | "signup" | "forgot" | "activate"
  const [activeTab, setActiveTab] = useState("login");

  const [signupData, setSignupData] = useState({
    image: null,
    name: "",
    email: "",
    phone: "",
    address: { line1: "", line2: "" },
    gender: "Tanlanmagan",
    DOB: "",
    password: "",
  });

  const [authData, setAuthData] = useState({
    emailOrPhone: "",
    password: "",
    loginHint: "",
    loginDOB: "",
    name: "",
    phone: "",
    DOB: "",
  });

  const [loginAssist, setLoginAssist] = useState({
    needHint: false,
    needDob: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [signupErrors, setSignupErrors] = useState({});
  const [authErrors, setAuthErrors] = useState({});
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const t = {
    uz: {
      pageTitle: "Bemor Kabineti",
      pageDesc: "Shaxsiy hisobingizga kiring yoki yangi hisob yarating.",
      tabLogin: "Kirish",
      tabSignup: "Ro‘yxatdan o‘tish",
      loginTitle: "Xush kelibsiz",
      loginDesc: "Qabullaringizni kuzatish va shifokor tavsiyalarini ko‘rish uchun tizimga kiring.",
      signupTitle: "Yangi akkaunt yaratish",
      signupDesc: "Magic Denta bemor kabineti orqali qulay boshqaring.",
      forgotTitle: "Parolni tiklash",
      forgotDesc: "Ma’lumotlaringizni tasdiqlang va yangi parol o‘rnating.",
      activateTitle: "Akkauntni faollashtirish",
      activateDesc: "Klinikada ochilgan kartangizni tasdiqlang va parolingizni belgilang.",
      emailOrPhone: "Telefon raqam yoki Email",
      emailOrPhonePlaceholder: "+998 (__) ___-__-__ yoki email",
      phone: "Telefon raqam",
      fullName: "Ism va familiyangiz",
      fullNamePlaceholder: "Ism Familiya",
      emailOpt: "Email manzilingiz (ixtiyoriy)",
      password: "Parol",
      newPassword: "Yangi parol",
      city: "Shahar / Tuman",
      address: "Mahalla, ko‘cha, xonadon",
      gender: "Jinsingiz",
      genderUnselected: "Tanlang",
      genderMale: "Erkak",
      genderFemale: "Ayol",
      dob: "Tug‘ilgan sana",
      avatarLabel: "Profil rasmi (ixtiyoriy)",
      avatarUpload: "Rasm yuklash",
      avatarChange: "Rasmni o‘zgartirish",
      loginBtn: "Akkauntga kirish",
      signupBtn: "Ro‘yxatdan o‘tish",
      savePasswordBtn: "Parolni yangilash",
      activateBtn: "Faollashtirish",
      forgotLink: "Parolni unutdingizmi?",
      activateLink: "Akkauntni faollashtirish",
      backToLogin: "Kirishga qaytish",
      alreadyHaveAccount: "Akkauntingiz bormi?",
      noAccount: "Hali akkauntingiz yo‘qmi?",
      orRegister: "Ro‘yxatdan o‘tish",
      orLogin: "Tizimga kirish",
    },
    ru: {
      pageTitle: "Кабинет пациента",
      pageDesc: "Войдите в личный кабинет или создайте новый аккаунт.",
      tabLogin: "Вход",
      tabSignup: "Регистрация",
      loginTitle: "Добро пожаловать",
      loginDesc: "Войдите в систему для просмотра записей и рекомендаций врачей.",
      signupTitle: "Создание аккаунта",
      signupDesc: "Удобное управление приемами в клинике Magic Denta.",
      forgotTitle: "Восстановление пароля",
      forgotDesc: "Подтвердите свои данные и установите новый пароль.",
      activateTitle: "Активация аккаунта",
      activateDesc: "Подтвердите карту пациента, созданную в клинике, и установите пароль.",
      emailOrPhone: "Номер телефона или Email",
      emailOrPhonePlaceholder: "+998 (__) ___-__-__ или email",
      phone: "Номер телефона",
      fullName: "Имя и фамилия",
      fullNamePlaceholder: "Имя Фамилия",
      emailOpt: "Электронная почта (необязательно)",
      password: "Пароль",
      newPassword: "Новый пароль",
      city: "Город / Район",
      address: "Махалля, улица, дом",
      gender: "Пол",
      genderUnselected: "Выберите",
      genderMale: "Мужской",
      genderFemale: "Женский",
      dob: "Дата рождения",
      avatarLabel: "Фото профиля (необязательно)",
      avatarUpload: "Загрузить фото",
      avatarChange: "Изменить фото",
      loginBtn: "Войти в аккаунт",
      signupBtn: "Зарегистрироваться",
      savePasswordBtn: "Обновить пароль",
      activateBtn: "Активировать",
      forgotLink: "Забыли пароль?",
      activateLink: "Активировать аккаунт",
      backToLogin: "Вернуться ко входу",
      alreadyHaveAccount: "Уже есть аккаунт?",
      noAccount: "Еще нет аккаунта?",
      orRegister: "Зарегистрироваться",
      orLogin: "Войти",
    },
    en: {
      pageTitle: "Patient Portal",
      pageDesc: "Sign in to your patient account or create a new profile.",
      tabLogin: "Sign In",
      tabSignup: "Register",
      loginTitle: "Welcome Back",
      loginDesc: "Log in to track appointments and medical recommendations.",
      signupTitle: "Create Account",
      signupDesc: "Easily manage your clinic appointments with Magic Denta.",
      forgotTitle: "Reset Password",
      forgotDesc: "Verify your credentials and set a new password.",
      activateTitle: "Activate Account",
      activateDesc: "Confirm the patient record created at the clinic and set your password.",
      emailOrPhone: "Phone number or Email",
      emailOrPhonePlaceholder: "+998 (__) ___-__-__ or email",
      phone: "Phone number",
      fullName: "Full Name",
      fullNamePlaceholder: "Full Name",
      emailOpt: "Email address (optional)",
      password: "Password",
      newPassword: "New Password",
      city: "City / District",
      address: "Neighborhood, street, apartment",
      gender: "Gender",
      genderUnselected: "Select",
      genderMale: "Male",
      genderFemale: "Female",
      dob: "Date of Birth",
      avatarLabel: "Profile photo (optional)",
      avatarUpload: "Upload photo",
      avatarChange: "Change photo",
      loginBtn: "Sign In",
      signupBtn: "Create Account",
      savePasswordBtn: "Update Password",
      activateBtn: "Activate Account",
      forgotLink: "Forgot password?",
      activateLink: "Activate existing account",
      backToLogin: "Back to sign in",
      alreadyHaveAccount: "Already have an account?",
      noAccount: "Don't have an account yet?",
      orRegister: "Register now",
      orLogin: "Sign in",
    },
  }[lang] || {
    pageTitle: "Bemor Kabineti",
    pageDesc: "Shaxsiy hisobingizga kiring yoki yangi hisob yarating.",
    tabLogin: "Kirish",
    tabSignup: "Ro‘yxatdan o‘tish",
    loginTitle: "Xush kelibsiz",
    loginDesc: "Qabullaringizni kuzatish va shifokor tavsiyalarini ko‘rish uchun tizimga kiring.",
    signupTitle: "Yangi akkaunt yaratish",
    signupDesc: "Magic Denta bemor kabineti orqali qulay boshqaring.",
    forgotTitle: "Parolni tiklash",
    forgotDesc: "Ma’lumotlaringizni tasdiqlang va yangi parol o‘rnating.",
    activateTitle: "Akkauntni faollashtirish",
    activateDesc: "Klinikada ochilgan kartangizni tasdiqlang va parolingizni belgilang.",
    emailOrPhone: "Telefon raqam yoki Email",
    emailOrPhonePlaceholder: "+998 (__) ___-__-__ yoki email",
    phone: "Telefon raqam",
    fullName: "Ism va familiyangiz",
    fullNamePlaceholder: "Ism Familiya",
    emailOpt: "Email manzilingiz (ixtiyoriy)",
    password: "Parol",
    newPassword: "Yangi parol",
    city: "Shahar / Tuman",
    address: "Mahalla, ko‘cha, xonadon",
    gender: "Jinsingiz",
    genderUnselected: "Tanlang",
    genderMale: "Erkak",
    genderFemale: "Ayol",
    dob: "Tug‘ilgan sana",
    avatarLabel: "Profil rasmi (ixtiyoriy)",
    avatarUpload: "Rasm yuklash",
    avatarChange: "Rasmni o‘zgartirish",
    loginBtn: "Akkauntga kirish",
    signupBtn: "Ro‘yxatdan o‘tish",
    savePasswordBtn: "Parolni yangilash",
    activateBtn: "Faollashtirish",
    forgotLink: "Parolni unutdingizmi?",
    activateLink: "Akkauntni faollashtirish",
    backToLogin: "Kirishga qaytish",
    alreadyHaveAccount: "Akkauntingiz bormi?",
    noAccount: "Hali akkauntingiz yo‘qmi?",
    orRegister: "Ro‘yxatdan o‘tish",
    orLogin: "Tizimga kirish",
  };

  const isEmail = (value) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);

  const isNameValid = (value) =>
    /^[A-Za-z\u0400-\u04FF\s\-`´‘’ʼ']+$/u.test(value);

  const getFieldError = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Ism sharifingiz majburiy.";
        if (!isNameValid(value))
          return "Ism sharif faqat harflardan iborat bo‘lishi kerak.";
        return "";

      case "email":
        if (!value) return "";
        if (!isEmail(value)) return "Email formati noto‘g‘ri.";
        return "";

      case "phone":
        if (!value.trim()) return "Telefon raqamingiz majburiy.";
        if (!isUzPhoneComplete(value))
          return "Telefon formati noto‘g‘ri. Masalan: +998 (97) 990-88-84";
        return "";

      case "emailOrPhone":
        if (!value.trim()) return "Email yoki telefoningiz majburiy.";
        if (!isEmail(value) && !isUzPhoneComplete(value))
          return "Email yoki telefon formati noto‘g‘ri.";
        return "";

      case "loginHint":
        if (!value.trim()) return "Ism-sharif yoki email majburiy.";
        return "";

      case "password":
        if (!value.trim()) return "Parol majburiy.";
        if (value.length < 6)
          return "Parol kamida 6 ta belgidan iborat bo‘lishi kerak.";
        return "";

      case "address.line1":
        if (!value.trim()) return "Shahar / Tuman majburiy.";
        if (!/^[A-Za-zА-Яа-яЁё\s\-`´‘’ʼ']+$/u.test(value))
          return "Shahar / Tuman faqat harflardan iborat bo‘lishi kerak.";
        return "";

      case "address.line2":
        if (!value.trim()) return "Mahalla, ko‘cha, xonadon majburiy.";
        return "";

      case "DOB":
        if (!value) return "Tug‘ilgan sana majburiy.";
        return "";

      default:
        return "";
    }
  };

  const handleSignupImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageError = getImageFileError(file, { maxBytes: 20 * 1024 * 1024 });
    if (imageError) {
      setSignupErrors((prev) => ({ ...prev, image: imageError }));
      toast.error(imageError);
      e.target.value = "";
      return;
    }

    setSignupData((prev) => ({ ...prev, image: file }));
    setSignupErrors((prev) => ({ ...prev, image: "" }));
    setImagePreviewUrl(await createImagePreviewUrl(file));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setSignupData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
      setSignupErrors((prev) => ({ ...prev, [name]: getFieldError(name, value) }));
      return;
    }

    let newValue = value;
    if (name === "phone") {
      newValue = maybeFormatUzPhoneCandidate(value);
    }

    setSignupData((prev) => ({ ...prev, [name]: newValue }));
    setSignupErrors((prev) => ({ ...prev, [name]: getFieldError(name, newValue) }));
  };

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "phone" || name === "emailOrPhone") {
      newValue = maybeFormatUzPhoneCandidate(value);
    }

    setAuthData((prev) => ({ ...prev, [name]: newValue }));
    setAuthErrors((prev) => ({ ...prev, [name]: getFieldError(name, newValue) }));
  };

  const handlePhonePaste = (e, isSignup = false) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    const formatted = formatUzPhone(paste);

    if (isSignup) {
      setSignupData((prev) => ({ ...prev, phone: formatted }));
      setSignupErrors((prev) => ({ ...prev, phone: "" }));
    } else {
      setAuthData((prev) => ({
        ...prev,
        phone: activeTab === "activate" ? formatted : prev.phone,
        emailOrPhone: activeTab === "login" || activeTab === "forgot" ? formatted : prev.emailOrPhone,
      }));
      setAuthErrors((prev) => ({ ...prev, phone: "", emailOrPhone: "" }));
    }
  };

  const validateSignup = () => {
    const nextErrors = {};
    nextErrors.name = getFieldError("name", signupData.name);
    nextErrors.email = getFieldError("email", signupData.email);
    nextErrors.phone = getFieldError("phone", signupData.phone);
    nextErrors["address.line1"] = getFieldError("address.line1", signupData.address.line1);
    nextErrors["address.line2"] = getFieldError("address.line2", signupData.address.line2);
    nextErrors.DOB = getFieldError("DOB", signupData.DOB);
    nextErrors.password = getFieldError("password", signupData.password);

    if (signupData.gender === "Tanlanmagan") {
      nextErrors.gender = "Iltimos, jinsingizni tanlang";
    }

    Object.keys(nextErrors).forEach((k) => {
      if (!nextErrors[k]) delete nextErrors[k];
    });

    setSignupErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateAuth = () => {
    const nextErrors = {};

    if (activeTab === "login") {
      nextErrors.emailOrPhone = getFieldError("emailOrPhone", authData.emailOrPhone);
      nextErrors.password = getFieldError("password", authData.password);

      if (loginAssist.needHint) {
        nextErrors.loginHint = getFieldError("loginHint", authData.loginHint);
      }
      if (loginAssist.needDob) {
        nextErrors.loginDOB = getFieldError("DOB", authData.loginDOB);
      }
    }

    if (activeTab === "forgot") {
      nextErrors.name = getFieldError("name", authData.name);
      nextErrors.emailOrPhone = getFieldError("emailOrPhone", authData.emailOrPhone);
      nextErrors.DOB = getFieldError("DOB", authData.DOB);
      nextErrors.password = getFieldError("password", authData.password);
    }

    if (activeTab === "activate") {
      nextErrors.name = getFieldError("name", authData.name);
      nextErrors.phone = getFieldError("phone", authData.phone);
      nextErrors.DOB = getFieldError("DOB", authData.DOB);
      nextErrors.password = getFieldError("password", authData.password);
    }

    Object.keys(nextErrors).forEach((k) => {
      if (!nextErrors[k]) delete nextErrors[k];
    });

    setAuthErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetAuthForm = () => {
    setAuthData({
      emailOrPhone: "",
      password: "",
      loginHint: "",
      loginDOB: "",
      name: "",
      phone: "",
      DOB: "",
    });
    setAuthErrors({});
    setLoginAssist({ needHint: false, needDob: false });
  };

  useEffect(() => {
    return () => {
      revokePreviewUrl(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("name", signupData.name);
      body.append("email", signupData.email);
      body.append("phone", signupData.phone);
      body.append("password", signupData.password);
      body.append("DOB", signupData.DOB);
      body.append("gender", signupData.gender);
      body.append("address", JSON.stringify(signupData.address));
      if (signupData.image) body.append("image", signupData.image);

      const { data } = await axios.post(`${backendUrl}/api/user/register`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        toast.success(data.message || "Ro'yxatdan o'tish muvaffaqiyatli");
        navigate("/");
      } else {
        toast.error(humanizeImageUploadMessage(data.message, "Ro‘yxatdan o‘tishda xatolik yuz berdi."));
      }
    } catch (error) {
      toast.error(
        humanizeImageUploadMessage(
          error?.response?.data?.message || error?.message,
          "So‘rovni bajarishda xatolik yuz berdi.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!validateAuth()) return;

    setSubmitting(true);
    try {
      if (activeTab === "login") {
        const payload = {
          emailOrPhone: authData.emailOrPhone,
          password: authData.password,
          nameOrEmail: authData.loginHint.trim(),
          DOB: authData.loginDOB,
        };

        const { data } = await axios.post(`${backendUrl}/api/user/login`, payload);

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Kirish muvaffaqiyatli");
          navigate("/");
        } else {
          if (data.code === "NEEDS_ACTIVATION") {
            toast.info(data.message);
            setActiveTab("activate");
            setAuthData((p) => ({
              ...p,
              name: "",
              phone: isUzPhoneComplete(p.emailOrPhone) ? p.emailOrPhone : "",
              password: "",
              DOB: "",
            }));
            setLoginAssist({ needHint: false, needDob: false });
            return;
          }

          if (data.code === "ACCOUNT_SELECTION_REQUIRED") {
            toast.info(
              data.message ||
                "Telefon raqam orqali bir nechta akkaunt topildi. Iltimos, ism-sharif yoki emailni kiriting.",
            );
            setLoginAssist({ needHint: true, needDob: false });
            return;
          }

          if (data.code === "ACCOUNT_DOB_REQUIRED") {
            toast.info(
              data.message ||
                "Bir nechta mos akkaunt topildi. Iltimos, tug‘ilgan sanani ham kiriting.",
            );
            setLoginAssist({ needHint: true, needDob: true });
            return;
          }

          toast.error(data.message);
        }
        return;
      }

      if (activeTab === "forgot") {
        const payload = {
          name: authData.name.trim(),
          emailOrPhone: authData.emailOrPhone.trim(),
          DOB: authData.DOB,
          password: authData.password,
        };

        const { data } = await axios.post(`${backendUrl}/api/user/forgot-password`, payload);

        if (data.success) {
          toast.success(data.message || "Parol muvaffaqiyatli yangilandi");
          setActiveTab("login");
          setAuthData((p) => ({
            ...p,
            name: "",
            emailOrPhone: payload.emailOrPhone,
            DOB: "",
            password: "",
          }));
          setAuthErrors({});
          setLoginAssist({ needHint: false, needDob: false });
        } else if (data.code === "NEEDS_ACTIVATION") {
          toast.info(data.message);
          setActiveTab("activate");
          setAuthData((p) => ({
            ...p,
            name: authData.name,
            phone: isUzPhoneComplete(authData.emailOrPhone) ? authData.emailOrPhone : "",
            emailOrPhone: "",
            DOB: authData.DOB,
            password: "",
          }));
          setLoginAssist({ needHint: false, needDob: false });
        } else {
          toast.error(data.message || "Parolni yangilashda xatolik");
        }
        return;
      }

      if (activeTab === "activate") {
        const payload = {
          name: authData.name.trim(),
          phone: authData.phone.replace(/\D/g, ""),
          DOB: authData.DOB,
          password: authData.password,
        };

        const { data } = await axios.post(`${backendUrl}/api/user/claim/by-id-dob`, payload);

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success(data.message || "Akkaunt muvaffaqiyatli faollashtirildi");
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(
        humanizeImageUploadMessage(
          error?.response?.data?.message || error?.message,
          "So‘rovni bajarishda xatolik yuz berdi.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white rounded-2xl border px-4 py-3.5 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 ${
      hasError
        ? "border-red-400 ring-2 ring-red-400/20"
        : "border-slate-200 focus:border-[#403D88] focus:ring-4 focus:ring-[#403D88]/10"
    }`;

  const labelClass = "block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-left";

  return (
    <>
      <Seo
        title={`${t.pageTitle} | Magic Denta`}
        description="Magic Denta shaxsiy bemor kabinetiga kirish yoki yangi hisob yaratish."
        canonicalPath="/login"
        breadcrumbs={[
          { name: "Bosh sahifa", path: "/" },
          { name: "Shaxsiy kabinet", path: "/login" }
        ]}
      />

      <div className="min-h-[85vh] py-8 sm:py-14 px-4 flex items-center justify-center">
        <div className="w-full max-w-xl mx-auto">
          
          {/* Card Container */}
          <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-xl p-6 sm:p-10 transition-all">
            
            {/* Top Switcher Tabs (Only visible when in login or signup) */}
            {(activeTab === "login" || activeTab === "signup") && (
              <div className="flex bg-slate-100 p-1.5 rounded-full mb-8 border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    resetAuthForm();
                  }}
                  className={`flex-1 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                    activeTab === "login"
                      ? "bg-gradient-to-r from-[#403D88] to-[#321E48] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {t.tabLogin}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signup");
                    resetAuthForm();
                  }}
                  className={`flex-1 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                    activeTab === "signup"
                      ? "bg-gradient-to-r from-[#403D88] to-[#321E48] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {t.tabSignup}
                </button>
              </div>
            )}

            {/* Back Button for Forgot / Activate views */}
            {(activeTab === "forgot" || activeTab === "activate") && (
              <div className="mb-6 text-left">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    resetAuthForm();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition py-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  {t.backToLogin}
                </button>
              </div>
            )}

            {/* ═══════════════════════════════════════════
                1. LOGIN VIEW
            ═══════════════════════════════════════════ */}
            {activeTab === "login" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-left space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {t.loginTitle}
                  </h1>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {t.loginDesc}
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} noValidate className="space-y-5">
                  <div>
                    <label htmlFor="login-emailOrPhone" className={labelClass}>
                      {t.emailOrPhone}
                    </label>
                    <input
                      id="login-emailOrPhone"
                      name="emailOrPhone"
                      type="text"
                      placeholder={t.emailOrPhonePlaceholder}
                      value={authData.emailOrPhone}
                      onChange={handleAuthChange}
                      onPaste={(e) => handlePhonePaste(e, false)}
                      className={inputClass(Boolean(authErrors.emailOrPhone))}
                    />
                    <ErrorText message={authErrors.emailOrPhone} />
                  </div>

                  {loginAssist.needHint && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left">
                      <label htmlFor="login-hint" className={labelClass}>
                        {t.fullName}
                      </label>
                      <input
                        id="login-hint"
                        name="loginHint"
                        type="text"
                        placeholder={t.fullNamePlaceholder}
                        value={authData.loginHint}
                        onChange={handleAuthChange}
                        className={inputClass(Boolean(authErrors.loginHint))}
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Ushbu telefon raqam bilan bir nechta hisob topildi.
                      </p>
                      <ErrorText message={authErrors.loginHint} />
                    </div>
                  )}

                  {loginAssist.needDob && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left">
                      <label htmlFor="login-dob" className={labelClass}>
                        {t.dob}
                      </label>
                      <input
                        id="login-dob"
                        name="loginDOB"
                        type="date"
                        value={authData.loginDOB}
                        onChange={handleAuthChange}
                        max={isoToday()}
                        className={inputClass(Boolean(authErrors.loginDOB))}
                      />
                      <ErrorText message={authErrors.loginDOB} />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="login-password" className={`${labelClass} mb-0`}>
                        {t.password}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("forgot");
                          resetAuthForm();
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition underline underline-offset-2"
                      >
                        {t.forgotLink}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={authData.password}
                        onChange={handleAuthChange}
                        className={`${inputClass(Boolean(authErrors.password))} pr-12`}
                      />
                      <PasswordToggle
                        visible={showPassword}
                        onClick={() => setShowPassword((s) => !s)}
                      />
                    </div>
                    <ErrorText message={authErrors.password} />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-200 shadow-md active:scale-98 disabled:opacity-70 cursor-pointer"
                  >
                    {submitting ? "..." : t.loginBtn}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("activate");
                        resetAuthForm();
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                    >
                      {t.activateLink}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ═══════════════════════════════════════════
                2. SIGN UP VIEW
            ═══════════════════════════════════════════ */}
            {activeTab === "signup" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-left space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {t.signupTitle}
                  </h1>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {t.signupDesc}
                  </p>
                </div>

                <form onSubmit={handleSignupSubmit} noValidate className="space-y-5">
                  {/* Circular Avatar Upload */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0">
                      {imagePreviewUrl ? (
                        <img
                          src={imagePreviewUrl}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <label
                        htmlFor="signup-image"
                        className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        {imagePreviewUrl ? t.avatarChange : t.avatarUpload}
                      </label>
                      <input
                        id="signup-image"
                        type="file"
                        accept={IMAGE_INPUT_ACCEPT_ATTR}
                        onChange={handleSignupImageChange}
                        className="hidden"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        JPG, PNG yoki WEBP (maks. 20MB)
                      </p>
                      <ErrorText message={signupErrors.image} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-name" className={labelClass}>
                      {t.fullName}
                    </label>
                    <input
                      id="signup-name"
                      name="name"
                      type="text"
                      placeholder={t.fullNamePlaceholder}
                      value={signupData.name}
                      onChange={handleSignupChange}
                      className={inputClass(Boolean(signupErrors.name))}
                    />
                    <ErrorText message={signupErrors.name} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="signup-phone" className={labelClass}>
                        {t.phone}
                      </label>
                      <input
                        id="signup-phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        placeholder={PHONE_PLACEHOLDER}
                        value={signupData.phone}
                        onChange={handleSignupChange}
                        onPaste={(e) => handlePhonePaste(e, true)}
                        className={inputClass(Boolean(signupErrors.phone))}
                      />
                      <ErrorText message={signupErrors.phone} />
                    </div>

                    <div>
                      <label htmlFor="signup-email" className={labelClass}>
                        {t.emailOpt}
                      </label>
                      <input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="namuna@gmail.com"
                        value={signupData.email}
                        onChange={handleSignupChange}
                        className={inputClass(Boolean(signupErrors.email))}
                      />
                      <ErrorText message={signupErrors.email} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="signup-gender" className={labelClass}>
                        {t.gender}
                      </label>
                      <select
                        id="signup-gender"
                        name="gender"
                        value={signupData.gender}
                        onChange={handleSignupChange}
                        className={inputClass(Boolean(signupErrors.gender))}
                      >
                        <option value="Tanlanmagan">{t.genderUnselected}</option>
                        <option value="Erkak">{t.genderMale}</option>
                        <option value="Ayol">{t.genderFemale}</option>
                      </select>
                      <ErrorText message={signupErrors.gender} />
                    </div>

                    <div>
                      <label htmlFor="signup-dob" className={labelClass}>
                        {t.dob}
                      </label>
                      <input
                        id="signup-dob"
                        name="DOB"
                        type="date"
                        value={signupData.DOB}
                        onChange={handleSignupChange}
                        max={isoToday()}
                        className={inputClass(Boolean(signupErrors.DOB))}
                      />
                      <ErrorText message={signupErrors.DOB} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="signup-city" className={labelClass}>
                        {t.city}
                      </label>
                      <input
                        id="signup-city"
                        name="address.line1"
                        type="text"
                        placeholder="Toshkent"
                        value={signupData.address.line1}
                        onChange={handleSignupChange}
                        className={inputClass(Boolean(signupErrors["address.line1"]))}
                      />
                      <ErrorText message={signupErrors["address.line1"]} />
                    </div>

                    <div>
                      <label htmlFor="signup-address" className={labelClass}>
                        {t.address}
                      </label>
                      <input
                        id="signup-address"
                        name="address.line2"
                        type="text"
                        placeholder="Navoiy ko‘chasi, 12-uy"
                        value={signupData.address.line2}
                        onChange={handleSignupChange}
                        className={inputClass(Boolean(signupErrors["address.line2"]))}
                      />
                      <ErrorText message={signupErrors["address.line2"]} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-password" className={labelClass}>
                      {t.password}
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Kamida 6 ta belgi"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        className={`${inputClass(Boolean(signupErrors.password))} pr-12`}
                      />
                      <PasswordToggle
                        visible={showPassword}
                        onClick={() => setShowPassword((s) => !s)}
                      />
                    </div>
                    <ErrorText message={signupErrors.password} />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-200 shadow-md active:scale-98 disabled:opacity-70 cursor-pointer"
                  >
                    {submitting ? "..." : t.signupBtn}
                  </button>
                </form>
              </div>
            )}

            {/* ═══════════════════════════════════════════
                3. FORGOT PASSWORD VIEW
            ═══════════════════════════════════════════ */}
            {activeTab === "forgot" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-left space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {t.forgotTitle}
                  </h1>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {t.forgotDesc}
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} noValidate className="space-y-5">
                  <div>
                    <label htmlFor="forgot-name" className={labelClass}>
                      {t.fullName}
                    </label>
                    <input
                      id="forgot-name"
                      name="name"
                      type="text"
                      placeholder={t.fullNamePlaceholder}
                      value={authData.name}
                      onChange={handleAuthChange}
                      className={inputClass(Boolean(authErrors.name))}
                    />
                    <ErrorText message={authErrors.name} />
                  </div>

                  <div>
                    <label htmlFor="forgot-emailOrPhone" className={labelClass}>
                      {t.emailOrPhone}
                    </label>
                    <input
                      id="forgot-emailOrPhone"
                      name="emailOrPhone"
                      type="text"
                      placeholder={t.emailOrPhonePlaceholder}
                      value={authData.emailOrPhone}
                      onChange={handleAuthChange}
                      onPaste={(e) => handlePhonePaste(e, false)}
                      className={inputClass(Boolean(authErrors.emailOrPhone))}
                    />
                    <ErrorText message={authErrors.emailOrPhone} />
                  </div>

                  <div>
                    <label htmlFor="forgot-dob" className={labelClass}>
                      {t.dob}
                    </label>
                    <input
                      id="forgot-dob"
                      name="DOB"
                      type="date"
                      value={authData.DOB}
                      onChange={handleAuthChange}
                      max={isoToday()}
                      className={inputClass(Boolean(authErrors.DOB))}
                    />
                    <ErrorText message={authErrors.DOB} />
                  </div>

                  <div>
                    <label htmlFor="forgot-password" className={labelClass}>
                      {t.newPassword}
                    </label>
                    <div className="relative">
                      <input
                        id="forgot-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Kamida 6 ta belgi"
                        value={authData.password}
                        onChange={handleAuthChange}
                        className={`${inputClass(Boolean(authErrors.password))} pr-12`}
                      />
                      <PasswordToggle
                        visible={showPassword}
                        onClick={() => setShowPassword((s) => !s)}
                      />
                    </div>
                    <ErrorText message={authErrors.password} />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-200 shadow-md active:scale-98 disabled:opacity-70 cursor-pointer"
                  >
                    {submitting ? "..." : t.savePasswordBtn}
                  </button>
                </form>
              </div>
            )}

            {/* ═══════════════════════════════════════════
                4. ACTIVATE VIEW
            ═══════════════════════════════════════════ */}
            {activeTab === "activate" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-left space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {t.activateTitle}
                  </h1>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {t.activateDesc}
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} noValidate className="space-y-5">
                  <div>
                    <label htmlFor="activate-name" className={labelClass}>
                      {t.fullName}
                    </label>
                    <input
                      id="activate-name"
                      name="name"
                      type="text"
                      placeholder={t.fullNamePlaceholder}
                      value={authData.name}
                      onChange={handleAuthChange}
                      className={inputClass(Boolean(authErrors.name))}
                    />
                    <ErrorText message={authErrors.name} />
                  </div>

                  <div>
                    <label htmlFor="activate-phone" className={labelClass}>
                      {t.phone}
                    </label>
                    <input
                      id="activate-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      placeholder={PHONE_PLACEHOLDER}
                      value={authData.phone}
                      onChange={handleAuthChange}
                      onPaste={(e) => handlePhonePaste(e, false)}
                      className={inputClass(Boolean(authErrors.phone))}
                    />
                    <ErrorText message={authErrors.phone} />
                  </div>

                  <div>
                    <label htmlFor="activate-dob" className={labelClass}>
                      {t.dob}
                    </label>
                    <input
                      id="activate-dob"
                      name="DOB"
                      type="date"
                      value={authData.DOB}
                      onChange={handleAuthChange}
                      max={isoToday()}
                      className={inputClass(Boolean(authErrors.DOB))}
                    />
                    <ErrorText message={authErrors.DOB} />
                  </div>

                  <div>
                    <label htmlFor="activate-password" className={labelClass}>
                      {t.newPassword}
                    </label>
                    <div className="relative">
                      <input
                        id="activate-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Kamida 6 ta belgi"
                        value={authData.password}
                        onChange={handleAuthChange}
                        className={`${inputClass(Boolean(authErrors.password))} pr-12`}
                      />
                      <PasswordToggle
                        visible={showPassword}
                        onClick={() => setShowPassword((s) => !s)}
                      />
                    </div>
                    <ErrorText message={authErrors.password} />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-[#92003A] to-[#91008D] hover:shadow-glow-wine text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-200 shadow-md active:scale-98 disabled:opacity-70 cursor-pointer"
                  >
                    {submitting ? "..." : t.activateBtn}
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
};

export default Login;
