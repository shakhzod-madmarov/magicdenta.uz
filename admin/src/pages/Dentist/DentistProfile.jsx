import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { DentistContext } from "../../context/DentistContext";
import eyesClosed from "../../assets/login/eyes-closed.png";
import eyesOpened from "../../assets/login/eyes-opened.png";
import profileFallback from "../../assets/profile_pic.png";

const genderUz = (g) => (g === "female" ? "Ayol" : "Erkak");

const safeText = (v) => (v ? String(v) : "—");

const toImgUrl = (backendUrl, img) => {
  const s = String(img || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) return `${backendUrl}${s}`;
  return `${backendUrl}/${s}`;
};


const DentistProfile = () => {
  const { backendUrl, dToken, profile, loadProfile } =
    useContext(DentistContext);

  const authHeader = useMemo(() => ({ headers: { dtoken: dToken } }), [dToken]);

  const [pw, setPw] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    old: false,
    next: false,
    confirm: false,
  });

  const [savingPw, setSavingPw] = useState(false);

  const [customScheduleEnabled, setCustomScheduleEnabled] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const fetchSchedule = async () => {
    try {
      setScheduleLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/dentist/profile/schedule`, authHeader);
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
    if (dToken) {
      loadProfile();
      fetchSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dToken]);

  const changePassword = async (e) => {
    e.preventDefault();

    if (!pw.oldPassword || !pw.newPassword || !pw.confirmPassword) {
      toast.error("Barcha maydonlarni to‘ldiring");
      return;
    }
    if (pw.newPassword.length < 6) {
      toast.error("Yangi parol kamida 6 ta belgi bo‘lsin");
      return;
    }
    if (pw.newPassword !== pw.confirmPassword) {
      toast.error("Yangi parollar mos emas");
      return;
    }

    try {
      setSavingPw(true);
     const { data } = await axios.post(
       `${backendUrl}/api/dentist/change-password`,
       pw,
       authHeader,
      );
      
      if (!data?.success) {
        toast.error(data?.message || "Parol o‘zgartirishda xatolik");
        return;
      }

      toast.success(data.message || "Parol o‘zgartirildi");
      setPw({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Server xatosi");
    } finally {
      setSavingPw(false);
    }
  };

  if (!profile)
    return <main className="p-6 text-gray-500">Yuklanmoqda...</main>;

  return (
    <main className="w-full bg-gray-50 min-h-screen p-6">
      <article className="max-w-5xl mx-auto space-y-6">
        <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-7 flex flex-col sm:flex-row gap-6">
            <div className="shrink-0">
              <img
               src={toImgUrl(backendUrl, profile.image) || profileFallback}
                alt={profile.name || "Dentist"}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border"
                onError={(e) => {
                  e.currentTarget.src = profileFallback;
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary truncate">
                {safeText(profile.name)}
              </h1>
              <p className="text-sm text-gray-600 mt-1 truncate">
                {safeText(profile.email)}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {safeText(profile.phone)}
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Info label="Jins" value={genderUz(profile.gender)} />
                <Info
                  label="Tajriba"
                  value={`${Number(profile.experience || 0)} yil`}
                />
                <Info label="Daraja" value={safeText(profile.degree)} />
                <Info
                  label="Mutaxassislik"
                  value={
                    Array.isArray(profile.speciality)
                      ? profile.speciality.join(", ")
                      : safeText(profile.speciality)
                  }
                />
              </div>
              {profile.about ? (
                <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
                  {profile.about}
                </p>
              ) : (
                <p className="mt-4 text-sm text-gray-400">Haqida: —</p>
              )}
              <p className="mt-4 text-xs text-gray-400">
                Parol xavfsizlik uchun ko‘rsatilmaydi.
              </p>
            </div>
          </div>
        </section>
        <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-7">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Parolni o‘zgartirish
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Eski parolni kiriting va yangi parolni 2 marta tasdiqlang.
            </p>
            <form onSubmit={changePassword} className="mt-5 max-w-md space-y-4">
              <PasswordField
                label="Eski parol"
                value={pw.oldPassword}
                show={show.old}
                onToggle={() => setShow((p) => ({ ...p, old: !p.old }))}
                onChange={(v) => setPw((p) => ({ ...p, oldPassword: v }))}
              />
              <PasswordField
                label="Yangi parol"
                value={pw.newPassword}
                show={show.next}
                onToggle={() => setShow((p) => ({ ...p, next: !p.next }))}
                onChange={(v) => setPw((p) => ({ ...p, newPassword: v }))}
                hint="Kamida 6 ta belgi"
              />
              <PasswordField
                label="Yangi parolni tasdiqlang"
                value={pw.confirmPassword}
                show={show.confirm}
                onToggle={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}
                onChange={(v) => setPw((p) => ({ ...p, confirmPassword: v }))}
              />
              <button
                type="submit"
                disabled={savingPw}
                className="w-full rounded-xl bg-primary text-white font-semibold py-3 disabled:opacity-60"
              >
                {savingPw ? "Saqlanmoqda..." : "Parolni saqlash"}
              </button>
            </form>
          </div>
        </section>

        <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-7">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Ish vaqti sozlamalari
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Shaxsiy ish kunlaringiz va soatlaringizni belgilang. Belgilanmagan taqdirda klinikaning standart ish vaqti amal qiladi.
            </p>

            {scheduleLoading ? (
              <div className="mt-5 text-gray-500 text-sm">Yuklanmoqda...</div>
            ) : (
              <div className="mt-5 space-y-5">
                <div className="flex items-center gap-3 p-4 bg-slate-50 border rounded-xl">
                  <input
                    type="checkbox"
                    id="customScheduleToggle"
                    checked={customScheduleEnabled}
                    onChange={(e) => setCustomScheduleEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="customScheduleToggle" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                    Shaxsiy ish vaqti jadvalini yoqish
                  </label>
                </div>

                {customScheduleEnabled && (
                  <div className="space-y-3">
                    {schedule.map((item, idx) => {
                      const daysUz = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
                      return (
                        <div key={item.day} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-gray-50 border">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={`dentist-day-${item.day}`}
                              checked={item.isOpen}
                              onChange={() => {
                                const next = [...schedule];
                                next[idx] = { ...next[idx], isOpen: !next[idx].isOpen };
                                setSchedule(next);
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                            />
                            <label htmlFor={`dentist-day-${item.day}`} className="text-sm font-bold text-slate-700 cursor-pointer select-none">
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
                                className="px-3 py-1.5 border rounded-lg text-sm bg-white outline-none focus:border-primary"
                              />
                              <span className="text-gray-400">—</span>
                              <input
                                type="time"
                                value={item.end}
                                onChange={(e) => {
                                  const next = [...schedule];
                                  next[idx] = { ...next[idx], end: e.target.value };
                                  setSchedule(next);
                                }}
                                className="px-3 py-1.5 border rounded-lg text-sm bg-white outline-none focus:border-primary"
                              />
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
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
                        `${backendUrl}/api/dentist/profile/schedule`,
                        {
                          workingSchedule: schedule,
                          isReset: !customScheduleEnabled
                        },
                        authHeader
                      );
                      if (data?.success) {
                        toast.success(data.message || "Ish vaqti muvaffaqiyatli saqlandi!");
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
                  className="w-full rounded-xl bg-primary text-white font-semibold py-3 disabled:opacity-60"
                >
                  {savingSchedule ? "Saqlanmoqda..." : "Ish vaqtini saqlash"}
                </button>
              </div>
            )}
          </div>
        </section>
      </article>
    </main>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-gray-50 border rounded-xl p-3">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value}</p>
  </div>
);

const PasswordField = ({ label, value, show, onToggle, onChange, hint }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>

    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-primary/20"
        placeholder={label}
      />

      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
        aria-label={show ? "Parolni yashirish" : "Parolni ko‘rsatish"}
      >
        <img
          src={show ? eyesOpened : eyesClosed}
          alt={show ? "Ko‘rinayotgan parol" : "Yashirilgan parol"}
          className="w-6 h-6 object-contain"
        />
      </button>
    </div>

    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

export default DentistProfile;
