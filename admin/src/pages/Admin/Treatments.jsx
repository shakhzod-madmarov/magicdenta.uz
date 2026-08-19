import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext";
import TelegramPatientConnectModal from "../../components/TelegramPatientConnectModal.jsx";
import ChangeAmountModal from "../../components/ChangeAmountModal";
import {
  formatDMY,
  formatDateTimeISO,
  formatMoneyPlain,
} from "../../../../shared/date.js";
import { normalizeText } from "../../utils/text";
import { displayMoney, parseMoney } from "../../utils/moneyInput.js";

const digitsOnly = (v) => String(v ?? "").replace(/\D/g, "");

const fmtMoney = (n) => formatMoneyPlain(n);

const PaymentBadge = ({ status }) => {
  const ps = status || "UNPAID";
  const cls =
    ps === "PAID"
      ? "bg-green-100 text-green-700"
      : ps === "PARTIAL"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-gray-100 text-gray-700";

  const label =
    ps === "PAID"
      ? "To‘liq to‘langan"
      : ps === "PARTIAL"
        ? "To‘langan (qarz bor)"
        : "To‘lanmagan";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
};

const SecureImage = ({ url, token, alt }) => {
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
      className="h-24 w-full object-cover rounded-lg border"
    />
  );
};



const Treatments = () => {
  const { backendUrl, aToken, confirmTreatmentPayment, changeTreatmentAmount } =
    useContext(AdminContext);

  const [mode, setMode] = useState("REQUESTS");
  const [list, setList] = useState([]);
  const [pay, setPay] = useState({});
  const [note, setNote] = useState({});
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");
  const [amountModalOpen, setAmountModalOpen] = useState(false);
  const [amountTarget, setAmountTarget] = useState(null);

  const [tgQrOpen, setTgQrOpen] = useState(false);
  const [tgQrLink, setTgQrLink] = useState("");
  const [tgQrPatient, setTgQrPatient] = useState(null);

  const showTelegramQrForPatient = async (patientObj) => {
    if (!patientObj?._id || !aToken) return;
    try {
      const { data: checkData } = await axios.get(
        `${backendUrl || ""}/api/admin/patients/${patientObj._id}/telegram-check`,
        { headers: { atoken: aToken } }
      );
      if (checkData?.success && checkData?.linked) return;
    } catch { /* ignore */ }
    try {
      const { data: linkData } = await axios.post(
        `${backendUrl || ""}/api/admin/patients/${patientObj._id}/telegram-link`,
        {},
        { headers: { atoken: aToken } }
      );
      if (linkData?.success && linkData?.deepLink) {
        setTgQrPatient(patientObj);
        setTgQrLink(linkData.deepLink);
        setTgQrOpen(true);
      }
    } catch { /* ignore */ }
  };

  const authHeader = { headers: { atoken: aToken } };

  const load = async () => {
    try {
      const url =
        mode === "REQUESTS"
          ? `${backendUrl}/api/admin/payment-requests`
          : `${backendUrl}/api/admin/pending-treatments`;

      const { data } = await axios.get(url, authHeader);

      if (!data?.success) {
        toast.error(data?.message || "Yuklashda xatolik");
        return;
      }

      const items = data.treatments || [];
      setList(items);

      setPay((prev) => {
        const next = { ...prev };
        for (const t of items) {
          const id = t._id;
          if (next[id] === undefined && Number(t.requestedPaidNow || 0) > 0) {
            next[id] = String(t.requestedPaidNow);
          }
        }
        return next;
      });
    } catch {
      toast.error("To‘lovlar ro‘yxatini yuklashda xatolik");
    }
  };

  useEffect(() => {
    if (aToken) load();
  }, [aToken, mode]);

  const filtered = useMemo(() => {
    if (!search.trim()) return list;

    const term = search.toLowerCase();
    const digits = digitsOnly(term);
    const normTerm = normalizeText(term);

    return list.filter((t) => {
      const rawPatient = t.userId?.name || "";
      const rawDentist = t.dentistId?.name || "";

      const patient = rawPatient.toLowerCase();
      const dentist = rawDentist.toLowerCase();
      const phone = digitsOnly(t.userId?.phone || "");

      const patientNorm = normalizeText(rawPatient);
      const dentistNorm = normalizeText(rawDentist);

      return (
        patient.includes(term) ||
        dentist.includes(term) ||
        (normTerm && patientNorm.includes(normTerm)) ||
        (normTerm && dentistNorm.includes(normTerm)) ||
        (digits && phone.includes(digits))
      );
    });
  }, [list, search]);

  const totals = useMemo(() => {
    const sumDebt = filtered.reduce(
      (s, t) =>
        s +
        Number(t.debt ?? Math.max(0, (t.amount || 0) - (t.paidAmount || 0))),
      0,
    );
    const sumReq = filtered.reduce(
      (s, t) => s + Number(t.requestedPaidNow || 0),
      0,
    );
    return { sumDebt, sumReq, count: filtered.length };
  }, [filtered]);

  const toggleExpand = (id) => {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  };

  const confirm = async (t) => {
    const id = t._id;

    const total = Number(t.amount || 0);
    const paidAlready = Number(t.paidAmount || 0);
    const debt = t.debt ?? Math.max(0, total - paidAlready);
    const raw = pay[id];
    const hasInput = raw !== undefined && raw !== "";
    const value = hasInput ? Number(digitsOnly(raw) || 0) : undefined;

    if (hasInput && (Number.isNaN(value) || value <= 0)) {
      toast.error("To‘lov summasini kiriting");
      return;
    }
    if (value !== undefined && value > debt) {
      toast.error("To‘lov qarzdan katta bo‘lishi mumkin emas");
      return;
    }

    const payload = {};
    if (value !== undefined) payload.paidNow = value;
    if (note[id]?.trim()) payload.note = note[id].trim();

    const res = await confirmTreatmentPayment(id, payload);
    if (res?.ok) await load();
  };

  const handleSendDebtReminder = async (t) => {
    if (!window.confirm("Bemorga Telegram orqali qarz to'lovi haqida eslatma yubormoqchimisiz?")) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/treatments/${t._id}/remind-debt`,
        {},
        authHeader
      );
      if (data?.success) {
        toast.success(data.message || "Eslatma yuborildi!");
      } else {
        toast.error(data?.message || "Yuborishda xatolik yuz berdi");
      }
    } catch (err) {
      const respData = err?.response?.data;
      if (respData?.code === "PATIENT_TELEGRAM_NOT_LINKED") {
        toast.warn("Bemor Telegramga ulanmagan. Ulanish oynasi ochilmoqda...");
        if (t.userId) {
          await showTelegramQrForPatient(t.userId).catch(() => {});
        }
      } else {
        toast.error(respData?.message || err.message || "Serverga ulanib bo'lmadi");
      }
    }
  };

  const handleAmountChange = async (treatmentId, payload) => {
    const res = await changeTreatmentAmount(treatmentId, payload);
    if (res?.ok) {
      await load();
    }
    return res;
  };

  return (
    <>
      <main className="w-full p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">To‘lovlar</h1>
            <p className="text-sm text-gray-600">
              {mode === "REQUESTS"
                ? "To‘lov so‘rovlari"
                : "Qarzlari bor barcha davolashlar"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-md text-sm border ${
                mode === "REQUESTS" ? "bg-primary text-white" : "bg-white"
              }`}
              onClick={() => setMode("REQUESTS")}
            >
              To‘lov so‘rovlari
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm border ${
                mode === "ALL" ? "bg-primary text-white" : "bg-white"
              }`}
              onClick={() => setMode("ALL")}
            >
              Barcha qarzlar
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <input
            className="border rounded-md px-3 py-2 text-sm w-full sm:w-96"
            placeholder="Qidirish: bemor / telefon / stomatolog"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="text-sm text-gray-700 flex flex-wrap gap-4">
            <span>
              <b>Jami:</b> {totals.count}
            </span>
            <span>
              <b>Jami qarz:</b> {fmtMoney(totals.sumDebt)} so‘m
            </span>
            {mode === "REQUESTS" && (
              <span>
                <b>Jami so‘rov:</b> {fmtMoney(totals.sumReq)} so‘m
              </span>
            )}
          </div>
        </div>

        {!filtered.length ? (
          <p className="text-gray-500">
            {mode === "REQUESTS"
              ? "Hozircha stomatologdan to‘lov so‘rovi yo‘q"
              : "Hozircha qarzdor davolash yo‘q"}
          </p>
        ) : (
          <div className="grid gap-4">
            {filtered.map((t) => {
              const id = t._id;
              const total = Number(t.amount || 0);
              const paidAlready = Number(t.paidAmount || 0);
              const debt = t.debt ?? Math.max(0, total - paidAlready);
              const hasReq = Number(t.requestedPaidNow || 0) > 0;
              const payments = Array.isArray(t.payments) ? t.payments : [];
              const lastPaidAt =
                t.lastPaidAt ||
                (payments.length ? payments[payments.length - 1]?.paidAt : null);
              const xrayUrl = (treatmentId, xray) => {
                const xid = xray?._id;
                if (!treatmentId || !xid) return "";
                const token = aToken || localStorage.getItem("aToken") || "";
                return `${backendUrl}/api/files/xray/${treatmentId}/${xid}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
              };

              return (
                <section
                  key={id}
                  className="bg-white border rounded-xl p-5 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {t.userId?.name || "—"}{" "}
                        <span className="text-gray-500 font-normal">
                          — {t.userId?.phone || "—"}
                        </span>
                      </p>

                      <p className="text-sm text-gray-700">
                        <span className="font-medium">
                          {t.dentistId?.name || "—"}
                        </span>
                      </p>

                      <p className="text-sm text-gray-700">
                        {formatDMY(t.appointmentId?.slotDate)} | ⏰{" "}
                        {t.appointmentId?.slotTime || "—"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Davolash yaratilgan:{" "}
                        <span className="font-medium">
                          {formatDateTimeISO(t.createdAt)}
                        </span>{" "}
                        • Oxirgi to‘lov:{" "}
                        <span className="font-medium">
                          {formatDateTimeISO(lastPaidAt)}
                        </span>
                      </p>
                      {hasReq && (
                        <p className="text-sm text-blue-700 mt-2">
                          Dentist so‘rovi:{" "}
                          <span className="font-semibold">
                            {fmtMoney(t.requestedPaidNow)} so‘m
                          </span>{" "}
                          <span className="text-xs text-blue-600">
                            ({formatDateTimeISO(t.requestedPaidNowAt)})
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <PaymentBadge status={t.paymentStatus} />
                      <button
                        className="text-sm px-3 py-2 rounded-md border hover:bg-gray-50"
                        onClick={() => toggleExpand(id)}
                      >
                        {expanded[id] ? "Yopish" : "Batafsil"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    <p className="font-semibold">
                      Umumiy: {fmtMoney(total)} so‘m
                    </p>
                    <p className="text-green-700 font-semibold">
                      To‘langan: {fmtMoney(paidAlready)} so‘m
                    </p>
                    <p className="text-red-600 font-semibold">
                      Qarz: {fmtMoney(debt)} so‘m
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col lg:flex-row lg:items-center gap-3">
                    <input
                      className="border rounded-md px-3 py-2 text-sm w-full lg:w-64"
                      placeholder={`To‘lov (max: ${fmtMoney(debt)})`}
                      value={displayMoney(pay[id] ?? "")}
                      onChange={(e) =>
                        setPay((p) => ({
                          ...p,
                          [id]: parseMoney(e.target.value),
                        }))
                      }
                    />
                    <input
                      className="border rounded-md px-3 py-2 text-sm w-full lg:flex-1"
                      placeholder="Izoh (ixtiyoriy) — masalan: qarzning 2-qismi"
                      value={note[id] ?? ""}
                      onChange={(e) =>
                        setNote((p) => ({ ...p, [id]: e.target.value }))
                      }
                    />
                    <button
                      className="border border-primary text-primary px-5 py-2 rounded-md text-sm w-full lg:w-auto hover:bg-primary/5"
                      onClick={() => {
                        setAmountTarget(t);
                        setAmountModalOpen(true);
                      }}
                    >
                      Summani o‘zgartirish
                    </button>
                    <button
                      className="bg-primary text-white px-5 py-2 rounded-md text-sm w-full lg:w-auto"
                      onClick={() => confirm(t)}
                    >
                      Tasdiqlash
                    </button>
                    {debt > 0 && (
                      <button
                        type="button"
                        className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md text-sm w-full lg:w-auto flex items-center justify-center gap-1.5 active:scale-95 transition-all font-semibold"
                        onClick={() => handleSendDebtReminder(t)}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Qarzni eslatish
                      </button>
                    )}
                    <p className="text-xs text-gray-500">
                      * Sana/vaqt avtomatik saqlanadi
                    </p>
                  </div>

                  {expanded[id] && (
                    <div className="mt-5 border-t pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Diagnos</p>
                          <p className="text-sm font-medium whitespace-pre-wrap">
                            {t.diagnosis || "—"}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            Ishlangan tish(lar)
                          </p>
                          <p className="text-sm font-medium whitespace-pre-wrap">
                            {t.teeth || "—"}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            Bajarilgan ishlar
                          </p>
                          <p className="text-sm font-medium whitespace-pre-wrap">
                            {t.procedures || "—"}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            Keyingi qadam
                          </p>
                          <p className="text-sm font-medium whitespace-pre-wrap">
                            {t.nextStep || "—"}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Dorilar</p>
                          <p className="text-sm font-medium whitespace-pre-wrap">
                            {t.medicines || "—"}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Eslatma</p>
                          <p className="text-sm font-medium whitespace-pre-wrap">
                            {t.notes || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">
                            Keyingi ko‘rik
                          </p>
                          <p className="font-medium">
                            {t.nextVisitDate
                              ? `${formatDMY(t.nextVisitDate)} ${t.nextVisitTime || ""}`
                              : "—"}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">
                            Next Appointment ID
                          </p>
                          <p className="font-medium break-all">
                            {t.nextAppointmentId || "—"}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">
                            Appointment ID
                          </p>
                          <p className="font-medium break-all">
                            {t.appointmentId?._id || "—"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          To‘lovlar tarixi
                        </p>
                        {payments.length ? (
                          <div className="space-y-2">
                            {payments.map((p, i) => (
                              <div
                                key={p.paymentRef || i}
                                className="text-sm bg-gray-50 rounded-lg px-3 py-3"
                              >
                                <p className="font-medium">
                                  {fmtMoney(p.amount)} so‘m
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDateTimeISO(p.paidAt)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {p.note || "Izoh yo‘q"}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            To‘lovlar yo‘q
                          </p>
                        )}
                      </div>

                      <div>
  <p className="text-sm font-semibold text-gray-700 mb-2">
    X-ray / Rentgen rasmlari
  </p>
  {Array.isArray(t.xrays) && t.xrays.length > 0 ? (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {t.xrays.map((x, idx) => (
        <a
          key={x._id || idx}
          href={xrayUrl(t._id, x)}
          target="_blank"
          rel="noreferrer"
          className="block border rounded-lg overflow-hidden hover:shadow"
        >
          <SecureImage
            url={`${backendUrl}/api/files/xray/${t._id}/${x._id}`}
            token={aToken}
            alt="xray"
          />
        </a>
      ))}
    </div>
  ) : (
    <p className="text-sm text-gray-500">Rasm yo‘q</p>
  )}
</div>

<div>
  <p className="text-sm font-semibold text-gray-700 mb-2">
    To‘lovlar tarixi
  </p>
  {payments.length ? (
    <div className="space-y-2">
      {payments.map((p, i) => (
        <div
          key={p.paymentRef || i}
          className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
        >
          <span className="text-gray-600">
            {formatDateTimeISO(p.paidAt)}
          </span>
          <span className="font-semibold text-green-700">
            {fmtMoney(p.amount)} so‘m
          </span>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-gray-500">
      To‘lovlar tarixi yo‘q
    </p>
  )}
</div>

<div>
  <p className="text-sm font-semibold text-gray-700 mb-2">
    Summa o‘zgarishlari tarixi
  </p>
  {Array.isArray(t.amountHistory) && t.amountHistory.length ? (
    <div className="space-y-2">
      {t.amountHistory.map((h, i) => (
        <div
          key={h._id || i}
          className="text-sm bg-gray-50 rounded-lg px-3 py-3"
        >
          <p className="font-medium">
            {fmtMoney(h.oldAmount)} so‘m → {fmtMoney(h.newAmount)} so‘m
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDateTimeISO(h.changedAt)} • {h.changedByRole === "ADMIN" ? "Admin" : h.changedByRole}
          </p>
          <p className="text-sm text-gray-700 mt-1">
            <b>Sabab:</b> {h.reason || "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            <b>Stomatolog tasdig‘i:</b> {h.confirmedDentistName || "—"}
          </p>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-gray-500">
      Summa o‘zgarishlari yo‘q
    </p>
  )}
</div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>

      <ChangeAmountModal
        open={amountModalOpen}
        treatment={amountTarget}
        onClose={() => {
          setAmountModalOpen(false);
          setAmountTarget(null);
        }}
        onSubmit={handleAmountChange}
      />

      {tgQrOpen && (
        <TelegramPatientConnectModal
          open={tgQrOpen}
          onClose={() => setTgQrOpen(false)}
          link={tgQrLink}
          patient={tgQrPatient}
          title="Bemor Telegramga ulanishi"
        />
      )}
    </>
  );
};

export default Treatments;