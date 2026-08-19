import { useEffect, useState, useContext } from "react";
import eyesClosed from "../../assets/login/eyes-closed.png";
import eyesOpened from "../../assets/login/eyes-opened.png";
import uploadImage from "../../assets/upload_area.svg";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";
import {
  IMAGE_INPUT_ACCEPT_ATTR,
  createImagePreviewUrl,
  getImageFileError,
  humanizeImageUploadMessage,
} from "../../utils/imageUpload";
import { formatUzPhone, handleUzPhonePaste, isUzPhoneComplete, PHONE_PLACEHOLDER } from "../../utils/phone.js";

const AddDentist = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    gender: "",
    experience: "",
    speciality: [],
    degree: "",
    about: "",
    image: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const { backendUrl, aToken } = useContext(AdminContext);

  const specialityOptions = [
    "Ortodontiya",
    "Terapevtik stomatologiya",
    "Ortopedik stomatologiya",
    "Estetik stomatologiya",
    "Stomatologiya Jarrohligi",
  ];

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\u0400-\u04FF\s'-]+$/u;
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      const clean = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\u0400-\u04FF\s'-]/gu, "");
      setForm((prev) => ({ ...prev, name: clean }));
      setErrors((p) => ({ ...p, name: "" }));
      return;
    }
    if (name === "phone") {
      setForm((prev) => ({ ...prev, phone: formatUzPhone(value) }));
      setErrors((p) => ({ ...p, phone: "" }));
      return;
    }
    if (["experience"].includes(name)) {
      const digits = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: digits }));
      setErrors((p) => ({ ...p, [name]: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleMultiSelectChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (o) => o.value);
    setForm((prev) => ({ ...prev, speciality: selected }));
    setErrors((p) => ({ ...p, speciality: "" }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageError = getImageFileError(file, { maxBytes: 20 * 1024 * 1024 });
    if (imageError) {
      setErrors((p) => ({ ...p, image: imageError }));
      toast.error(imageError);
      e.target.value = "";
      return;
    }

    setForm((prev) => ({ ...prev, image: file }));
    setErrors((p) => ({ ...p, image: "" }));
    setImagePreviewUrl(await createImagePreviewUrl(file));
  };

  const validateAll = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Ism majburiy.";
    else if (!nameRegex.test(form.name.trim()))
      errs.name = "Ism faqat harflardan iborat bo‘lishi kerak.";

    if (!form.phone.trim()) errs.phone = "Telefon raqam majburiy.";
    else if (!isUzPhoneComplete(form.phone))
      errs.phone = "Telefon formati noto‘g‘ri: +998 (95) 123-45-67";

    if (!form.email.trim()) errs.email = "Email majburiy.";
    else if (!emailRegex.test(form.email))
      errs.email = "Email formati noto‘g‘ri.";

    if (!form.password) errs.password = "Parol majburiy.";
    else if (form.password.length < 6)
      errs.password = "Parol kamida 6 belgidan iborat bo‘lishi kerak.";

    if (!form.gender) errs.gender = "Jins tanlanishi kerak.";

    if (form.experience === "") errs.experience = "Tajriba (yil) majburiy.";
    else {
      const exp = Number(form.experience);
      if (!Number.isInteger(exp) || exp < 0 || exp > 50)
        errs.experience = "Tajriba 0 dan 50 yilgacha butun son bo‘lishi kerak.";
    }

    if (!form.speciality || form.speciality.length === 0)
      errs.speciality =
        "Hech bo‘lmaganda bitta mutaxassislik tanlanishi kerak.";

    if (!form.degree.trim()) errs.degree = "Ma'lumot / daraja majburiy.";

    if (!form.about.trim()) errs.about = "Iltimos, stomatolog haqida yozing.";
    else if (form.about.trim().length < 6)
      errs.about = "Kamida 6 ta belgidan iborat bo‘lishi kerak.";

    if (!form.image) errs.image = "Rasm yuklash majburiy.";
    else {
      const imageError = getImageFileError(form.image, {
        maxBytes: 20 * 1024 * 1024,
      });
      if (imageError) errs.image = imageError;
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateAll();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      Object.values(errs).forEach((msg) => toast.error(msg));
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.info("Yuklanmoqda, iltimos kuting...", {
      autoClose: false,
      closeButton: false,
    });

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "speciality") formData.append(key, JSON.stringify(value));
        else formData.append(key, value);
      });

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-dentist",
        formData,
        { headers: { atoken: aToken } },
      );

      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success("Yangi stomatolog muvaffaqiyatli qo‘shildi!");
        setForm({
          name: "",
          phone: "",
          email: "",
          password: "",
          gender: "",
          experience: "",
          speciality: [],
          degree: "",
          about: "",
          image: "",
        });
        setErrors({});
        setImagePreviewUrl("");
      } else {
        toast.error(humanizeImageUploadMessage(data.message, "Xatolik yuz berdi. Qayta urinib ko‘ring."));
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Stomatologni saqlashda xatolik yuz berdi.";
      toast.error(humanizeImageUploadMessage(msg, "Stomatologni saqlashda xatolik yuz berdi."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  return (
    <main className="w-full flex flex-col items-center bg-gray-50 py-10 px-4 sm:px-8">
      <style>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">
          Yangi Stomatolog Qo‘shish
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Quyidagi ma’lumotlarni to‘ldiring.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6 sm:p-8 space-y-5"
        noValidate
      >
        <div className="flex items-center gap-4">
          <label className="cursor-pointer">
            <div className="w-24 h-24 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50">
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={uploadImage}
                  alt="placeholder"
                  className="w-12 h-12 opacity-60"
                />
              )}
            </div>
            <input
              type="file"
              accept={IMAGE_INPUT_ACCEPT_ATTR}
              onChange={handleImageChange}
              hidden
            />
          </label>
          <div className="space-y-1">
            {errors.image && (
              <p className="text-sm text-red-600">{errors.image}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ism Sharif
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Masalan: Dr. Dilshoda Qodirova"
            className={`w-full border rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none ${
              errors.name ? "border-red-400" : "border-gray-300"
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jins
          </label>
          <div className="flex gap-3">
            <label
              className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                form.gender === "male"
                  ? "border-primary bg-primary/10"
                  : "border-gray-300"
              } cursor-pointer`}
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
              className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                form.gender === "female"
                  ? "border-primary bg-primary/10"
                  : "border-gray-300"
              } cursor-pointer`}
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
          {errors.gender && (
            <p className="text-sm text-red-600 mt-1">{errors.gender}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefon raqami
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder={PHONE_PLACEHOLDER}
            inputMode="tel"
            maxLength={PHONE_PLACEHOLDER.length}
            onPaste={(e) => handleUzPhonePaste(e, (formatted) => {
              setForm((prev) => ({ ...prev, phone: formatted }));
              setErrors((p) => ({ ...p, phone: "" }));
            })}
            className={`w-full border rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none ${
              errors.phone ? "border-red-400" : "border-gray-300"
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Elektron pochta
          </label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="dr@gmail.com"
            className={`w-full border rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none ${
              errors.email ? "border-red-400" : "border-gray-300"
            }`}
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parol
          </label>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder="Kamida 6 ta belgi"
            className={`w-full border rounded-md px-4 py-2 pr-12 text-sm focus:ring-2 focus:ring-primary outline-none ${
              errors.password ? "border-red-400" : "border-gray-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-[38px]"
          >
            <img
              src={showPassword ? eyesOpened : eyesClosed}
              alt="toggle password"
              className="w-6 h-6"
            />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tajriba (yil)
            </label>
            <input
              name="experience"
              value={form.experience}
              onChange={handleChange}
              type="number"
              min="0"
              max="50"
              placeholder="Masalan: 5"
              className={`w-full border rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none ${
                errors.experience ? "border-red-400" : "border-gray-300"
              }`}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mutaxassislik(lar)
          </label>
          <select
            multiple
            value={form.speciality}
            onChange={handleMultiSelectChange}
            className={`w-full border rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none h-32 ${
              errors.speciality ? "border-red-400" : "border-gray-300"
            }`}
          >
            {specialityOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Bir nechta yo‘nalishni tanlash uchun <b>Ctrl</b> (yoki Mac’da{" "}
            <b>Cmd</b>) tugmasini bosing.
          </p>
          {errors.speciality && (
            <p className="text-sm text-red-600 mt-1">{errors.speciality}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ma’lumoti / Darajasi
          </label>
          <input
            name="degree"
            value={form.degree}
            onChange={handleChange}
            placeholder="Masalan: Tibbiyot doktori"
            className={`w-full border rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none ${
              errors.degree ? "border-red-400" : "border-gray-300"
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stomatolog haqida
          </label>
          <textarea
            name="about"
            value={form.about}
            onChange={handleChange}
            rows="5"
            placeholder="Mutaxassis haqida batafsil..."
            className={`w-full border rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none ${
              errors.about ? "border-red-400" : "border-gray-300"
            } resize-none`}
          />
        </div>
        <div className="text-right">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 rounded-md text-white font-semibold transition shadow-md ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-primary to-secondary hover:opacity-95"
            }`}
          >
            {isLoading ? "Qo‘shilmoqda..." : "Qo‘shish"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default AddDentist;
