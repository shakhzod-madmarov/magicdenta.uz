import { useContext, useEffect, useMemo, useState } from "react";
import { DentistContext } from "../../context/DentistContext";
import { formatMoney, isoToday } from "../../../../shared/date.js";

const ymdToday = () => isoToday();

const MiniLine = ({ points = [] }) => {
  const values = points.map((p) => Number(p?.paid ?? p ?? 0));
  const max = Math.max(1, ...values);
  const w = 220;
  const h = 52;
  const pad = 6;

  const path = values
    .map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1);
      const y = h - pad - (v * (h - pad * 2)) / max;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <path
        d={path || `M ${pad} ${h - pad}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="0"
        y1={h - 1}
        x2={w}
        y2={h - 1}
        stroke="currentColor"
        opacity="0.08"
      />
    </svg>
  );
};

const Card = ({ label, value, hint, right }) => (
  <div className="bg-white border rounded-2xl p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1 truncate">
          {value}
        </p>
        {hint ? <p className="text-xs text-gray-500 mt-1">{hint}</p> : null}
      </div>
      {right ? <div className="text-primary">{right}</div> : null}
    </div>
  </div>
);

const DentistDashboard = () => {
  const {
    dToken,
    profile,
    loadProfile,
    dashboard,
    dashboardLoading,
    loadDashboard,
  } = useContext(DentistContext);

  const [mode, setMode] = useState("30d");
  const [from, setFrom] = useState(ymdToday());
  const [to, setTo] = useState(ymdToday());

  useEffect(() => {
    if (!dToken) return;
    loadProfile();
    loadDashboard({ mode: "30d" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dToken]);

  const apply = () => {
    if (mode === "custom") loadDashboard({ mode, from, to });
    else loadDashboard({ mode });
  };

  useEffect(() => {
    if (!dToken) return;
    apply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const k = dashboard?.kpis || {};
  const s = dashboard?.statusSummary || {};
  const trend = Array.isArray(dashboard?.trend) ? dashboard.trend : [];
  const top = Array.isArray(dashboard?.topProcedures)
    ? dashboard.topProcedures
    : [];

  const rangeLabel = useMemo(() => {
    const r = dashboard?.range;
    if (!r) return "";
    if (r.mode === "today") return "Bugun";
    if (r.mode === "7d") return "Oxirgi 7 kun";
    if (r.mode === "30d") return "Oxirgi 30 kun";
    if (r.mode === "month") return "Shu oy";
    if (r.mode === "custom") return `${r.from} → ${r.to}`;
    return `${r.from} → ${r.to}`;
  }, [dashboard]);

  const waiting = Number(s.WAITING || 0);
  const inProgress = Number(s.IN_PROGRESS || 0);
  const done = Number(s.DONE || 0);
  const missed = Number(s.MISSED || 0);
  const cancelled = Number(s.CANCELLED || 0);

  return (
    <main className="w-full p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              Stomatolog paneli
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {profile?.name ? (
                <>
                  <span className="font-semibold">{profile.name}</span>{" "}
                  •{" "}
                </>
              ) : null}
              <span className="font-semibold">{rangeLabel}</span>
              {dashboardLoading ? (
                <span className="ml-2 text-xs text-gray-400">Yuklanmoqda…</span>
              ) : null}
            </p>
          </div>
          <div className="bg-white border rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="flex flex-wrap gap-2">
              {[
                ["today", "Bugun"],
                ["7d", "7 kun"],
                ["30d", "30 kun"],
                ["month", "Shu oy"],
                ["custom", "Tanlab"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className={`px-3 py-2 rounded-full text-sm font-medium border transition ${
                    mode === key
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {mode === "custom" ? (
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="border rounded-xl px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="border rounded-xl px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={apply}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
                >
                  Ko‘rsatish
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            label="Qabul yakunlanganlar"
            value={Number(k.visits || 0)}
            hint="Davolashlar soni"
          />
          <Card
            label="Unikal bemorlar"
            value={Number(k.uniquePatients || 0)}
            hint="Tanlangan davr bo‘yicha"
          />
          <Card
            label="To‘langan summa"
            value={formatMoney(k.totalPaid)}
            hint={`To‘lov foizi: ${Number(k.paymentRate || 0)}%`}
            right={<MiniLine points={trend.map((x) => ({ paid: x.paid }))} />}
          />
          <Card label="Umumiy narx" value={formatMoney(k.totalAmount)} />
          <Card
            label="Qarz"
            value={formatMoney(k.totalDebt)}
            hint="Umumiy - to‘langan"
          />
          <Card
            label="Uchrashuv holatlari"
            value={`${waiting} ta kutilmoqda / ${inProgress} ta qabulda`}
            hint={`${done} ta yakunlangan • ${missed} ta kelmagan • ${cancelled} ta bekor`}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                Oxirgi 14 kun tendensiya
              </h2>
              <span className="text-xs text-gray-500">To‘langan summa</span>
            </div>
            <div className="mt-4 text-primary">
              <MiniLine points={trend.map((x) => ({ paid: x.paid }))} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 border rounded-xl p-3">
                <p className="text-xs text-gray-500">
                  {mode === "today" ? "Bugun to‘langan" : "To‘langan summa"}
                </p>
                <p className="font-semibold text-green-700">
                  {formatMoney(k.totalPaid || 0)}
                </p>
              </div>
              <div className="bg-gray-50 border rounded-xl p-3">
                <p className="text-xs text-gray-500">
                  {mode === "today" ? "Bugun qabul soni" : "Qabul soni"}
                </p>
                <p className="font-semibold">
                  {Number(k.visits || 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-800">
              Eng ko‘p bajarilgan ishlar
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              (Eng ko‘p qo‘yilgan tashxislar va muolajalar)
            </p>
            {top.length === 0 ? (
              <div className="mt-6 text-gray-500 text-sm">
                Hozircha ma’lumot yo‘q
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {top.map((x) => (
                  <div
                    key={x.name}
                    className="flex items-center justify-between bg-gray-50 border rounded-xl px-3 py-2"
                  >
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {x.name}
                    </p>
                    <span className="text-xs font-semibold text-primary">
                      {x.count} marta
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {profile ? (
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <p className="font-semibold text-gray-900"> {profile.name}</p>
            <p className="text-sm text-gray-600">{profile.email}</p>
            <p className="text-sm text-gray-600">{profile.phone}</p>
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default DentistDashboard;
