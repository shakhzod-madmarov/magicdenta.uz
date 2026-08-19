import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { DentistContext } from "../../context/DentistContext";
import {
  IMAGE_INPUT_ACCEPT_ATTR,
  createImagePreviewUrl,
  getImageFileError,
  humanizeImageUploadMessage,
  revokePreviewUrl,
} from "../../utils/imageUpload";
import { formatUzPhoneInput, handleUzPhonePaste, PHONE_PLACEHOLDER } from "../../utils/phone";
import AddHistoricalTreatmentModal from "../../components/AddHistoricalTreatmentModal.jsx";

const DentistAddPatient = () => {
  const navigate = useNavigate();
  const { backendUrl, dToken } = useContext(DentistContext);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    DOB: "",
    gender: "Tanlanmagan",
    address: { line1: "", line2: "" },
    infectiousDiseaseMarkers: [],
    allergy: "",
    medicalWarnings: "",
    note: "",
  });

  const [created, setCreated] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [historicalModalOpen, setHistoricalModalOpen] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((p) => ({ ...p, address: { ...p.address, [key]: value } }));
      return;
    }

    if (name === "phone") {
      setForm((p) => ({ ...p, phone: formatUzPhoneInput(value) }));
      return;
    }

    if (name === "infectiousDiseaseMarkers") {
      setForm((p) => {
        const list = Array.isArray(p.infectiousDiseaseMarkers)
          ? p.infectiousDiseaseMarkers
          : [];

        return {
          ...p,
          infectiousDiseaseMarkers: list.includes(value)
            ? list.filter((item) => item !== value)
            : [...list, value],
        };
      });
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

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
    setImagePreviewUrl(await createImagePreviewUrl(file));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.phone || !form.DOB) {
      toast.error("Ism, telefon va tug‘ilgan sana majburiy");
      return;
    }

    try {
      setSubmitting(true);
      const body = new FormData();
      body.append("name", form.name);
      body.append("phone", form.phone);
      body.append("email", form.email);
      body.append("DOB", form.DOB);
      body.append("gender", form.gender);
      body.append("address", JSON.stringify(form.address));
      body.append("infectiousDiseaseMarkers", JSON.stringify(form.infectiousDiseaseMarkers || []));
      body.append("allergy", form.allergy || "");
      body.append("medicalWarnings", form.medicalWarnings || "");
      body.append("note", form.note || "");
      if (imageFile) body.append("image", imageFile);

      const { data } = await axios.post(
        `${backendUrl}/api/dentist/patients/create`,
        body,
        { headers: { dtoken: dToken } },
      );

      if (!data?.success) {
        toast.error(
          humanizeImageUploadMessage(
            data?.message,
            "Bemorni yaratishda xatolik yuz berdi.",
          ),
        );
        return;
      }

      toast.success("Bemor muvaffaqiyatli yaratildi");
      navigate("/dentist-patients");
    } catch (e) {
      toast.error(
        humanizeImageUploadMessage(
          e?.response?.data?.message || e?.message,
          "Bemor ma’lumotlarini saqlashda xatolik yuz berdi.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => () => revokePreviewUrl(imagePreviewUrl), [imagePreviewUrl]);

  return (
    <main className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">+ Yangi bemor yaratish</h1>

        {created && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <span>✅</span> Bemor muvaffaqiyatli yaratildi
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  <b>ID:</b> <span className="font-mono text-primary">{created.patientId}</span> · {created.name} · {created.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoricalModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
              >
                + Eski davolash tarixini kiritish
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Bemor login sahifasida <b>ism</b>, <b>telefon raqam</b> va <b>tug'ilgan sana</b> orqali parol o‘rnatishi mumkin.
            </p>
          </div>
        )}

        <form onSubmit={submit} className="bg-white p-6 rounded-2xl shadow space-y-4">
          <input name="name" value={form.name} onChange={onChange} placeholder="Ism sharif" className="w-full border px-4 py-2 rounded-lg" />
          <input name="phone" value={form.phone} onChange={onChange} placeholder={PHONE_PLACEHOLDER} inputMode="tel" maxLength={PHONE_PLACEHOLDER.length} onPaste={(e) => handleUzPhonePaste(e, (formatted) => setForm((p) => ({ ...p, phone: formatted })))} className="w-full border px-4 py-2 rounded-lg" />
          <input name="email" value={form.email} onChange={onChange} placeholder="Email (ixtiyoriy)" className="w-full border px-4 py-2 rounded-lg" />

          <div className="space-y-3">
            <input type="file" accept={IMAGE_INPUT_ACCEPT_ATTR} onChange={handleImageChange} className="w-full border px-4 py-2 rounded-lg" />
            {imagePreviewUrl ? (
              <img src={imagePreviewUrl} alt="Tanlangan rasm" className="h-28 w-28 rounded-xl object-cover border border-gray-200" />
            ) : null}
            {imageFile && <p className="text-xs text-gray-600">Tanlandi: {imageFile.name}</p>}
          </div>

          <input type="date" name="DOB" value={form.DOB} onChange={onChange} className="w-full border px-4 py-2 rounded-lg" />

          <select name="gender" value={form.gender} onChange={onChange} className="w-full border px-4 py-2 rounded-lg">
            <option value="Tanlanmagan">Tanlanmagan</option>
            <option value="Erkak">Erkak</option>
            <option value="Ayol">Ayol</option>
          </select>

          <input name="address.line1" value={form.address.line1} onChange={onChange} placeholder="Shahar / Tuman" className="w-full border px-4 py-2 rounded-lg" />
          <input name="address.line2" value={form.address.line2} onChange={onChange} placeholder="Mahalla / Ko‘cha" className="w-full border px-4 py-2 rounded-lg" />

          <input name="allergy" value={form.allergy} onChange={onChange} placeholder="Allergiya (ixtiyoriy)" className="w-full border px-4 py-2 rounded-lg" />
          <input name="medicalWarnings" value={form.medicalWarnings} onChange={onChange} placeholder="Tibbiy ogohlantirish (ixtiyoriy)" className="w-full border px-4 py-2 rounded-lg" />
          <textarea name="note" value={form.note} onChange={onChange} placeholder="Izoh (ixtiyoriy)" rows={3} className="w-full border px-4 py-2 rounded-lg" />

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">Maxfiy infeksion belgi (ixtiyoriy)</p>
            <p className="mt-1 text-xs text-gray-500">Faqat admin va stomatolog ko‘radi. Bemor va navbat ekranida ko‘rinmaydi.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Gepatit B", "Gepatit C", "SPID"].map((item) => (
                <label key={item} className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-xs font-medium text-gray-700">
                  <input type="checkbox" name="infectiousDiseaseMarkers" value={item} checked={form.infectiousDiseaseMarkers.includes(item)} onChange={onChange} />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <button disabled={submitting} className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-60">{submitting ? "Saqlanmoqda..." : "Bemor yaratish"}</button>
        </form>
      </div>

      <AddHistoricalTreatmentModal
        open={historicalModalOpen}
        onClose={() => setHistoricalModalOpen(false)}
        patient={created}
        backendUrl={backendUrl}
        authToken={dToken}
        authHeaderName="dtoken"
        isAdmin={false}
        onSuccess={() => {
          toast.success("Eski davolash tarixi bemorga muvaffaqiyatli biriktirildi!");
        }}
      />
    </main>
  );
};

export default DentistAddPatient;
