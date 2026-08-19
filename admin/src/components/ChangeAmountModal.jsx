import React, { useState, useEffect } from "react";
import { fmtMoney } from "../utils/text";

const digitsOnly = (val) => String(val || "").replace(/\D/g, "");

export default function ChangeAmountModal({ open, onClose, onSubmit, treatment }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    adminPassword: "",
    dentistPassword: "",
    newAmount: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setErr("");
    setLoading(false);
    setForm({
      adminPassword: "",
      dentistPassword: "",
      newAmount: String(Number(treatment?.amount || 0)),
      reason: "",
    });
  }, [open, treatment]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !treatment) return null;

  const total = Number(treatment.amount || 0);
  const paidAmount = Number(treatment.paidAmount || 0);

  const next = () => {
    if (step === 1) {
      if (!form.adminPassword.trim()) {
        setErr("Admin parolini kiriting");
        return;
      }
      setErr("");
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!form.dentistPassword.trim()) {
        setErr("Stomatolog parolini kiriting");
        return;
      }
      setErr("");
      setStep(3);
    }
  };

  const save = async () => {
    const newAmount = Number(digitsOnly(form.newAmount) || 0);

    if (!Number.isFinite(newAmount) || newAmount < 0) {
      setErr("Yangi summa noto‘g‘ri");
      return;
    }

    if (!form.reason.trim()) {
      setErr("Sababni kiriting");
      return;
    }

    setErr("");
    setLoading(true);

    const res = await onSubmit(treatment._id, {
      adminPassword: form.adminPassword,
      dentistPassword: form.dentistPassword,
      newAmount,
      reason: form.reason.trim(),
    });

    setLoading(false);

    if (!res?.ok) {
      setErr(res?.message || "Xatolik yuz berdi");
      return;
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-primary">
              Summani tuzatish
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Joriy summa: <b>{fmtMoney(total)} so‘m</b>
            </p>
            <p className="text-sm text-gray-500">
              Allaqachon to‘langan: <b>{fmtMoney(paidAmount)} so‘m</b>
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm rounded-xl border hover:bg-gray-50"
          >
            Yopish
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span
            className={`px-2 py-1 rounded-full ${
              step >= 1
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            1. Admin
          </span>
          <span
            className={`px-2 py-1 rounded-full ${
              step >= 2
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            2. Stomatolog
          </span>
          <span
            className={`px-2 py-1 rounded-full ${
              step >= 3
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            3. Yangi summa
          </span>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <label className="block">
              <span className="block text-sm font-medium mb-1">
                Admin paroli
              </span>
              <input
                type="password"
                className="w-full border rounded-xl px-3 py-2 text-sm"
                value={form.adminPassword}
                onChange={(e) =>
                  setForm((p) => ({ ...p, adminPassword: e.target.value }))
                }
                placeholder="Admin parolini kiriting"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <label className="block">
              <span className="block text-sm font-medium mb-1">
                Stomatolog paroli
              </span>
              <input
                type="password"
                className="w-full border rounded-xl px-3 py-2 text-sm"
                value={form.dentistPassword}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dentistPassword: e.target.value }))
                }
                placeholder="Stomatolog parolini kiriting"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <label className="block">
              <span className="block text-sm font-medium mb-1">
                Yangi umumiy summa (so‘m)
              </span>
              <input
                type="text"
                className="w-full border rounded-xl px-3 py-2 text-sm"
                value={fmtMoney(form.newAmount)}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    newAmount: digitsOnly(e.target.value),
                  }))
                }
                placeholder="Yangi umumiy summani kiriting"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium mb-1">
                O‘zgartirish sababi (majburiy)
              </span>
              <textarea
                rows={2}
                className="w-full border rounded-xl px-3 py-2 text-sm"
                value={form.reason}
                onChange={(e) =>
                  setForm((p) => ({ ...p, reason: e.target.value }))
                }
                placeholder="Masalan: to‘lov summada xatolik yuz berdi"
              />
            </label>
          </div>
        )}

        {err && <p className="text-xs text-red-600 font-medium">{err}</p>}

        <div className="flex items-center justify-between gap-3 pt-2">
          {step > 1 ? (
            <button
              type="button"
              className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50"
              onClick={() => setStep((s) => s - 1)}
              disabled={loading}
            >
              Orqaga
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              className="px-5 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary/95"
              onClick={next}
            >
              Davom etish
            </button>
          ) : (
            <button
              type="button"
              className="px-5 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary/95 disabled:opacity-50"
              onClick={save}
              disabled={loading}
            >
              {loading ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
