import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { AdminContext } from "../../context/AdminContext";
import { normalizeText } from "../../utils/text";
import { formatMoneyPlain, isoToday } from "../../../../shared/date.js";

const RANGE_OPTIONS = [
  { value: "today", label: "Bugun" },
  { value: "3d", label: "So‘nggi 3 kun" },
  { value: "week", label: "So‘nggi 7 kun" },
  { value: "month", label: "Joriy oy" },
  { value: "season", label: "Joriy chorak" },
  { value: "year", label: "Joriy yil" },
  { value: "custom", label: "Tanlangan oraliq" },
];

const fmt = (n) => formatMoneyPlain(n);
const classNames = (...xs) => xs.filter(Boolean).join(" ");

const Badge = ({ tone = "gray", children }) => {
  const cls =
    tone === "green"
      ? "bg-green-100 text-green-700"
      : tone === "yellow"
        ? "bg-yellow-100 text-yellow-800"
        : tone === "red"
          ? "bg-red-100 text-red-700"
          : "bg-grayLight text-grayDark/70";
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[13px] font-semibold",
        cls,
      )}
    >
      {children}
    </span>
  );
};

const Progress = ({ value = 0, tone = "green" }) => {
  const v = Math.max(0, Math.min(100, Number(value || 0)));
  const bar =
    tone === "green"
      ? "bg-green-500"
      : tone === "yellow"
        ? "bg-yellow-500"
        : "bg-red-500";
  return (
    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={classNames("h-2.5 rounded-full", bar)}
        style={{ width: `${v}%` }}
      />
    </div>
  );
};

const Skeleton = ({ className = "" }) => (
  <div
    className={classNames("animate-pulse rounded-xl bg-gray-100", className)}
  />
);

const SectionCard = ({ title, subtitle, right, children }) => (
  <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-lg sm:text-xl font-semibold text-grayDark break-words">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm text-grayDark/60 mt-1 break-words">
            {subtitle}
          </p>
        ) : null}
      </div>
      {right}
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </section>
);

const StatCard = ({
  title,
  value,
  hint,
  onClick,
  tone = "default",
  rightTop,
  bottom,
  loading,
}) => {
  const clickable = typeof onClick === "function";
  const cardTone =
    tone === "softPrimary"
      ? "bg-gradient-to-br from-primary/5 to-primary/10"
      : tone === "softSecondary"
        ? "bg-gradient-to-br from-secondary/5 to-secondary/10"
        : tone === "softDanger"
          ? "bg-gradient-to-br from-thirdary/5 to-thirdary/10"
          : "bg-white";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={classNames(
        "text-left rounded-2xl shadow-sm border border-gray-100 p-6 transition overflow-hidden max-w-full",
        clickable
          ? "hover:shadow-md hover:-translate-y-[1px]"
          : "cursor-default",
        cardTone,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-grayDark/70 break-words">
            {title}
          </p>

          {loading ? (
            <Skeleton className="mt-2 h-9 w-32" />
          ) : (
            <p
              className="
                mt-2 font-semibold text-grayDark leading-tight
                text-[26px] sm:text-[32px]
                break-words max-w-full
              "
            >
              {value}
            </p>
          )}
        </div>

        {rightTop ? <div className="flex-shrink-0">{rightTop}</div> : null}
      </div>

      {hint ? (
        <p className="mt-2 text-sm text-grayDark/55 break-words">{hint}</p>
      ) : null}
      {bottom ? <div className="mt-4">{bottom}</div> : null}
    </button>
  );
};

const exportDentistsExcel = ({
  rows = [],
  stats = null,
  dentists = [],
  rangeLabel = "Barcha vaqt",
  selectedDentistName = "",
} = {}) => {
  const wb = XLSX.utils.book_new();

  const nowStr = new Date().toLocaleString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalAmount = Number(stats?.totalAmount || 0);
  const totalPaid = Number(stats?.totalPaid || 0);
  const totalDebt = Number(stats?.totalDebt || 0);
  const totalVisits = Number(stats?.totalVisits || 0);
  const totalPatients = Number(stats?.patientsCount || 0);
  const totalAppointments = Number(stats?.totalAppointments || 0);
  const payRateAll = Number(stats?.payRateAll || (totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 100));
  const avgCheck = totalVisits > 0 ? Math.round(totalAmount / totalVisits) : 0;

  // 1. Sheet: Umumiy Klinika Xulosasi
  const summaryData = [
    { "Klinika ko‘rsatkichi": "KLINIKA BOSHQARUV HISOBOTI", Qiymat: "MAGIC DENTA" },
    { "Klinika ko‘rsatkichi": "Hisobot shakllantirilgan sana", Qiymat: nowStr },
    { "Klinika ko‘rsatkichi": "Hisobot davri", Qiymat: rangeLabel || stats?.range?.label || "Barcha vaqt" },
    { "Klinika ko‘rsatkichi": "Stomatolog filtri", Qiymat: selectedDentistName || "Barcha stomatologlar" },
    { "Klinika ko‘rsatkichi": "----------------------------------------", Qiymat: "----------------------------------------" },
    { "Klinika ko‘rsatkichi": "Jami stomatologlar soni", Qiymat: Number(stats?.totalDentists || dentists.length || 0) },
    { "Klinika ko‘rsatkichi": "Bazada ro‘yxatga olingan jami bemorlar", Qiymat: Number(stats?.totalPatients || 0) },
    { "Klinika ko‘rsatkichi": "Davrdagi faol bemorlar soni", Qiymat: totalPatients },
    { "Klinika ko‘rsatkichi": "Davrdagi jami tashriflar (muolajalar)", Qiymat: totalVisits },
    { "Klinika ko‘rsatkichi": "Davrdagi jami uchrashuvlar soni", Qiymat: totalAppointments },
    { "Klinika ko‘rsatkichi": "----------------------------------------", Qiymat: "----------------------------------------" },
    { "Klinika ko‘rsatkichi": "Jami hisoblangan summa (so‘m)", Qiymat: totalAmount },
    { "Klinika ko‘rsatkichi": "Klinikaga tushgan tushum (so‘m)", Qiymat: totalPaid },
    { "Klinika ko‘rsatkichi": "Klinikadagi jami qarz (so‘m)", Qiymat: totalDebt },
    { "Klinika ko‘rsatkichi": "To‘lov / Tushum yig‘ish darajasi (%)", Qiymat: `${payRateAll}%` },
    { "Klinika ko‘rsatkichi": "O‘rtacha chek / Tashrif qiymati (so‘m)", Qiymat: avgCheck },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary["!cols"] = [{ wch: 44 }, { wch: 32 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Klinika Xulosasi");

  // Meta map for dentists speciality and phone
  const dentistMetaMap = new Map(
    (Array.isArray(dentists) ? dentists : []).map((d) => [
      String(d._id),
      {
        speciality: Array.isArray(d.speciality) ? d.speciality.join(", ") : d.speciality || "Stomatolog",
        phone: d.phone || "",
      },
    ]),
  );

  // 2. Sheet: Stomatologlar Reytingi va KPI
  const dentistRows = (Array.isArray(rows) ? rows : []).map((r, i) => {
    const dId = String(r?.dentistId || "");
    const meta = dentistMetaMap.get(dId) || {};
    const amount = Number(r?.totalAmount || 0);
    const paid = Number(r?.totalPaid || 0);
    const debt = Number(r?.totalDebt || 0);
    const visits = Number(r?.visits || 0);
    const patients = Number(r?.patientsCount || 0);
    const apps = Number(r?.appointments || 0);
    const payRate = Number(r?.payRate || (amount > 0 ? Math.round((paid / amount) * 100) : 100));
    const share = totalPaid > 0 ? ((paid / totalPaid) * 100).toFixed(1) : "0.0";
    const avgPerVisit = visits > 0 ? Math.round(amount / visits) : 0;

    return {
      "№": i + 1,
      "Stomatolog F.I.Sh.": r?.name || "Noma’lum",
      "Mutaxassisligi": meta.speciality || "Stomatolog",
      "Telefon": meta.phone || "-",
      "Tashriflar (muolajalar)": visits,
      "Unikal bemorlar": patients,
      "Uchrashuvlar soni": apps,
      "Umumiy summa (so‘m)": amount,
      "Tushum (so‘m)": paid,
      "Qarz (so‘m)": debt,
      "To‘lov foizi (%)": `${payRate}%`,
      "Klinika tushumidagi ulushi (%)": `${share}%`,
      "O‘rtacha chek (so‘m)": avgPerVisit,
    };
  });

  const wsDentists = XLSX.utils.json_to_sheet(
    dentistRows.length > 0
      ? dentistRows
      : [
          {
            "№": 1,
            "Stomatolog F.I.Sh.": "Ma’lumot mavjud emas",
            "Mutaxassisligi": "-",
            "Telefon": "-",
            "Tashriflar (muolajalar)": 0,
            "Unikal bemorlar": 0,
            "Uchrashuvlar soni": 0,
            "Umumiy summa (so‘m)": 0,
            "Tushum (so‘m)": 0,
            "Qarz (so‘m)": 0,
            "To‘lov foizi (%)": "0%",
            "Klinika tushumidagi ulushi (%)": "0%",
            "O‘rtacha chek (so‘m)": 0,
          },
        ],
  );
  wsDentists["!cols"] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 22 },
    { wch: 18 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 20 },
    { wch: 18 },
    { wch: 16 },
    { wch: 28 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDentists, "Stomatologlar KPI");

  const cleanRange = String(rangeLabel || "Hisobot").replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, "_");
  const dateTag = new Date().toISOString().slice(0, 10);
  const fileName = `Magic_Denta_${cleanRange}_${dateTag}.xlsx`;

  XLSX.writeFile(wb, fileName);
};

const Dashboard = () => {
  const {
    backendUrl,
    aToken,
    dentists = [],
    getAllDentists,
  } = useContext(AdminContext);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const [range, setRange] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [dentistId, setDentistId] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("paid"); 
  const [sortDir, setSortDir] = useState("desc"); 
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const go = (path) => window.location.assign(path);

  const loadStats = async (overrides = {}) => {
    if (!aToken) return;

    const effRange = overrides.range ?? range;
    const effFrom = overrides.customFrom ?? customFrom;
    const effTo = overrides.customTo ?? customTo;
    const effDentistId = overrides.dentistId ?? dentistId;

    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (effRange && effRange !== "all") params.append("range", effRange);

      if (effRange === "custom") {
        if (effFrom) params.append("from", effFrom);
        if (effTo) params.append("to", effTo);
      }

      if (effDentistId) params.append("dentistId", effDentistId);

      const url = `${backendUrl}/api/admin/stats${params.toString() ? `?${params.toString()}` : ""}`;

      const { data } = await axios.get(url, { headers: { atoken: aToken } });

      if (!data?.success) {
        toast.error(data?.message || "Statistikani yuklashda xatolik");
        setStats(null);
      } else {
        setStats(data.stats || null);
        setPage(1);
      }
    } catch (e) {
      toast.error(e?.message || "Statistikani yuklashda xatolik");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      typeof getAllDentists === "function" &&
      (!dentists || !dentists.length)
    ) {
      getAllDentists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllDentists]);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyQuickRange = (r) => {
    setRange(r);
    setCustomFrom("");
    setCustomTo("");
    loadStats({ range: r, customFrom: "", customTo: "" });
  };

  const clearDentist = () => {
    setDentistId("");
    loadStats({ dentistId: "" });
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const byDentist = useMemo(
    () => (Array.isArray(stats?.byDentist) ? stats.byDentist : []),
    [stats],
  );

  const tableRows = useMemo(() => {
    const rows = [...byDentist];
    const needle = q.trim().toLowerCase();
    const normNeedle = normalizeText(needle);

    let filtered = rows;
    if (needle) {
      filtered = rows.filter((r) => {
        const rawName = String(r.name || "");
        const nameLc = rawName.toLowerCase();
        const nameNorm = normalizeText(rawName);

        return (
          nameLc.includes(needle) ||
          (normNeedle && nameNorm.includes(normNeedle))
        );
      });
    }

    const getVal = (r) => {
      if (sortKey === "paid") return Number(r.totalPaid || 0);
      if (sortKey === "visits") return Number(r.visits || 0);
      if (sortKey === "patients") return Number(r.patientsCount || 0);
      if (sortKey === "debt") return Number(r.totalDebt || 0);
      return Number(r.totalPaid || 0);
    };

    filtered.sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);
      return sortDir === "asc" ? av - bv : bv - av;
    });

    return filtered;
  }, [byDentist, q, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(tableRows.length / pageSize));
  const pagedRows = tableRows.slice((page - 1) * pageSize, page * pageSize);

  const rangeLabel = stats?.range?.label || "Barcha vaqt";
  const payRateAll = Number(stats?.payRateAll ?? 0);
  const payBadgeTone =
    payRateAll >= 90 ? "green" : payRateAll >= 70 ? "yellow" : "red";

  const topByPaid = useMemo(() => {
    const rows = [...byDentist].sort(
      (a, b) => Number(b.totalPaid || 0) - Number(a.totalPaid || 0),
    );
    return rows[0] || null;
  }, [byDentist]);

  const topByDebt = useMemo(() => {
    const rows = [...byDentist].sort(
      (a, b) => Number(b.totalDebt || 0) - Number(a.totalDebt || 0),
    );
    return rows[0] || null;
  }, [byDentist]);

  const clinicDebt = Number(stats?.totalDebt || 0);
  const debtTone = clinicDebt > 0 ? "red" : "green";

  const FiltersRight = (
    <div className="flex items-center gap-2">
      {dentistId ? (
        <button
          type="button"
          onClick={clearDentist}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold text-grayDark hover:bg-grayLight"
        >
          Filtrni tozalash
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => setFiltersOpen((v) => !v)}
        className="rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold text-grayDark hover:bg-grayLight"
      >
        {filtersOpen ? "Filtrlarni yopish" : "Filtrlarni ochish"}
      </button>
    </div>
  );

  return (
    <main className="w-full flex-1 bg-grayLight text-[15px] leading-relaxed">
      <section className="max-w-6xl mx-auto px-3 sm:px-4 py-5 md:py-8">
        <div className="sticky top-0 z-10 -mx-3 sm:-mx-4 px-3 sm:px-4 py-3 bg-grayLight/80 backdrop-blur border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-semibold text-grayDark break-words">
                Admin boshqaruv paneli
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-base text-grayDark/70 break-words">
                  {rangeLabel} bo‘yicha ko‘rsatkichlar
                </p>
                <Badge tone={payBadgeTone}>To‘lov: {payRateAll}%</Badge>
                <Badge tone={debtTone}>
                  Qarz: {fmt(stats?.totalDebt)} so‘m
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/all-dentists"
                className="inline-flex items-center gap-2 rounded-xl bg-[#92003A] text-white px-5 py-2.5 text-[15px] font-bold shadow-sm hover:bg-[#780030] transition"
              >
                Stomatologlar
              </a>
              <a
                href="/admin-patients"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F3040] text-white px-5 py-2.5 text-[15px] font-bold shadow-sm hover:bg-[#081C26] transition"
              >
                Bemorlar
              </a>
              <a
                href="/treatments"
                className="inline-flex items-center gap-2 rounded-xl bg-[#403D88] text-white px-5 py-2.5 text-[15px] font-bold shadow-sm hover:bg-[#321E48] transition"
              >
                To‘lovlar
              </a>
              <a
                href="/all-appointments"
                className="inline-flex items-center gap-2 rounded-xl bg-[#321E48] text-white px-5 py-2.5 text-[15px] font-bold shadow-sm hover:bg-[#1E122C] transition"
              >
                Qabullar
              </a>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <SectionCard
            title="Filtrlar"
            subtitle="Davr va stomatolog bo‘yicha statistikani boshqaring"
            right={FiltersRight}
          >
            {filtersOpen ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-3">
                  <label className="block text-sm font-semibold text-grayDark mb-1">
                    Davr
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                    value={range}
                    onChange={(e) => {
                      const newRange = e.target.value;
                      setRange(newRange);
                      if (newRange !== "custom") {
                        setCustomFrom("");
                        setCustomTo("");
                        loadStats({ range: newRange, customFrom: "", customTo: "" });
                      }
                    }}
                  >
                    {RANGE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyQuickRange("today")}
                      className={classNames(
                        "rounded-full px-4 py-2 text-[13px] font-semibold transition",
                        range === "today"
                          ? "bg-primary text-white shadow-xs"
                          : "bg-grayLight text-grayDark hover:bg-primary/10 hover:text-primary",
                      )}
                    >
                      Bugun
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickRange("week")}
                      className={classNames(
                        "rounded-full px-4 py-2 text-[13px] font-semibold transition",
                        range === "week"
                          ? "bg-primary text-white shadow-xs"
                          : "bg-grayLight text-grayDark hover:bg-primary/10 hover:text-primary",
                      )}
                    >
                      7 kun
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickRange("month")}
                      className={classNames(
                        "rounded-full px-4 py-2 text-[13px] font-semibold transition",
                        range === "month"
                          ? "bg-primary text-white shadow-xs"
                          : "bg-grayLight text-grayDark hover:bg-primary/10 hover:text-primary",
                      )}
                    >
                      Oy
                    </button>
                  </div>
                </div>
                {range === "custom" ? (
                  <>
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-grayDark mb-1">
                        Boshlanish
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-grayDark mb-1">
                        Tugash
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                      />
                    </div>
                  </>
                ) : null}
                <div
                  className={classNames(
                    "lg:col-span-5",
                    range === "custom" ? "" : "lg:col-span-6",
                  )}
                >
                  <label className="block text-sm font-semibold text-grayDark mb-1">
                    Stomatolog
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                    value={dentistId}
                    onChange={(e) => {
                      const newDentistId = e.target.value;
                      setDentistId(newDentistId);
                      loadStats({ dentistId: newDentistId });
                    }}
                  >
                    <option value="">Barcha stomatologlar</option>
                    {dentists?.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-grayDark/55">
                    * Stomatolog tanlasangiz, barcha KPI shu stomatologga
                    filtrlanadi
                  </p>
                </div>
                <div className="lg:col-span-12 flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => loadStats()}
                    disabled={loading}
                    className="h-[48px] rounded-xl bg-primary px-6 text-[15px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? "Yuklanmoqda..." : "Qo‘llash"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      exportDentistsExcel({
                        rows: tableRows,
                        stats,
                        dentists,
                        rangeLabel,
                        selectedDentistName:
                          dentists?.find(
                            (d) => String(d._id) === String(dentistId),
                          )?.name || "",
                      })
                    }
                    className="h-[48px] rounded-xl border border-gray-200 px-6 text-[15px] font-semibold text-grayDark hover:bg-grayLight flex items-center justify-center gap-2 transition"
                  >
                    Excel hisobotni yuklash
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 items-center">
                <Badge>{rangeLabel}</Badge>
                {dentistId ? (
                  <Badge tone="yellow">Stomatolog bo‘yicha filtrlangan</Badge>
                ) : (
                  <Badge>Barcha stomatologlar</Badge>
                )}
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="ml-auto rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold text-grayDark hover:bg-grayLight"
                >
                  Filtrlarni ochish
                </button>
              </div>
            )}
          </SectionCard>
        </div>
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Stomatologlar"
            value={stats?.totalDentists ?? 0}
            hint="Ro‘yxatni ochish"
            loading={loading && !stats}
            onClick={() => go("/all-dentists")}
          />
          <StatCard
            title="Bemorlar (davr)"
            value={stats?.patientsCount ?? 0}
            hint="Davr bo‘yicha (muolajalar asosida)"
            loading={loading && !stats}
            onClick={() => go("/patients")}
            tone="softSecondary"
          />
          <StatCard
            title="Tashriflar (davr)"
            value={stats?.totalVisits ?? 0}
            hint="Qabullar ro‘yxatini ochish"
            loading={loading && !stats}
            onClick={() => go("/all-appointments")}
          />
          <StatCard
            title="Tushum (davr)"
            value={`${fmt(stats?.totalPaid)} so‘m`}
            hint="To‘lovlar / qarzlarni ko‘rish"
            loading={loading && !stats}
            onClick={() => go("/treatments")}
            tone="softPrimary"
            rightTop={
              <div className="flex flex-col items-end gap-1">
                <Badge tone={payBadgeTone}>{payRateAll}%</Badge>
                <span className="text-sm text-grayDark/50">To‘lov</span>
              </div>
            }
            bottom={
              <div className="space-y-3">
                <Progress value={payRateAll} tone={payBadgeTone} />
                <div className="flex items-center justify-between text-sm text-grayDark/60">
                  <span>Qarz</span>
                  <span className="font-semibold text-thirdary">
                    {fmt(stats?.totalDebt)} so‘m
                  </span>
                </div>
              </div>
            }
          />
        </section>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SectionCard
            title="Tahliliy ko‘rsatkichlar"
            subtitle="Tezkor tahlil: eng yaxshi natijalar va risklar"
            right={
              <button
                type="button"
                onClick={() => loadStats()}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold text-grayDark hover:bg-grayLight"
              >
                Yangilash
              </button>
            }
          >
            {loading && !stats ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-grayDark">
                        Eng yuqori tushum (stomatolog)
                      </p>
                      <p className="mt-1 text-base text-grayDark/80 break-words">
                        {topByPaid ? (
                          <>
                            <span className="font-semibold">
                              {topByPaid.name}
                            </span>{" "}
                            —{" "}
                            <span className="text-primary font-bold">
                              {fmt(topByPaid.totalPaid)} so‘m
                            </span>
                          </>
                        ) : (
                          "Ma’lumot yo‘q"
                        )}
                      </p>
                      <p className="mt-1 text-sm text-grayDark/55">
                        Tashrif: {Number(topByPaid?.visits || 0)} • Bemor:{" "}
                        {Number(topByPaid?.patientsCount || 0)}
                      </p>
                    </div>
                    {topByPaid ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!topByPaid?.dentistId) return;
                          setDentistId(topByPaid.dentistId);
                          loadStats({ dentistId: topByPaid.dentistId });
                          setTimeout(() => {
                            document
                              .getElementById("dentists-table")
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          }, 200);
                        }}
                        className="rounded-xl border border-primary/30 px-4 py-2.5 text-[14px] font-semibold text-primary hover:bg-primary/5 transition"
                      >
                        Ko‘rish
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-grayDark">
                        Eng katta qarz (stomatolog)
                      </p>
                      <p className="mt-1 text-base text-grayDark/80 break-words">
                        {topByDebt ? (
                          <>
                            <span className="font-semibold">
                              {topByDebt.name}
                            </span>{" "}
                            —{" "}
                            <span className="text-thirdary font-bold">
                              {fmt(topByDebt.totalDebt)} so‘m
                            </span>
                          </>
                        ) : (
                          "Ma’lumot yo‘q"
                        )}
                      </p>
                      <p className="mt-1 text-sm text-grayDark/55">
                        To‘lov: {Number(topByDebt?.payRate || 0)}% • Tushum:{" "}
                        {fmt(topByDebt?.totalPaid)} so‘m
                      </p>
                    </div>
                    {topByDebt ? (
                      <a
                        href="/treatments"
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold hover:bg-grayLight"
                      >
                        To‘lovlar
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-grayDark">
                        Klinika to‘lov darajasi
                      </p>
                      <p className="mt-1 text-base text-grayDark/70 break-words">
                        {fmt(stats?.totalPaid)} / {fmt(stats?.totalAmount)} so‘m
                      </p>
                    </div>
                    <Badge tone={payBadgeTone}>{payRateAll}%</Badge>
                  </div>
                  <div className="mt-3">
                    <Progress value={payRateAll} tone={payBadgeTone} />
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
          <SectionCard
            title="Moliyaviy blok"
            subtitle="Davr bo‘yicha umumiy ko‘rsatkichlar"
          >
            {loading && !stats ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-2/3" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-12 w-1/2" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-gray-100 p-5">
                  <p className="text-sm font-semibold text-grayDark/70">
                    Umumiy summa
                  </p>
                  <p className="mt-1 text-xl font-bold text-grayDark break-words">
                    {fmt(stats?.totalAmount)} so‘m
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-grayDark/70">
                      Tushum
                    </p>
                    <p className="mt-1 text-xl font-bold text-primary break-words">
                      {fmt(stats?.totalPaid)} so‘m
                    </p>
                  </div>
                  <Badge tone={payBadgeTone}>{payRateAll}%</Badge>
                </div>
                <div className="rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-grayDark/70">
                      Qarz
                    </p>
                    <p className="mt-1 text-xl font-bold text-thirdary break-words">
                      {fmt(stats?.totalDebt)} so‘m
                    </p>
                  </div>
                  <Badge tone={debtTone}>
                    {Number(stats?.totalDebt || 0) > 0
                      ? "Xavf mavjud"
                      : "Muammo yo‘q"}
                  </Badge>
                </div>
              </div>
            )}
          </SectionCard>
          <SectionCard title="Reja" subtitle="Uchrashuvlar va tashriflar">
            {loading && !stats ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-grayDark/70">
                      Rejalashtirilgan uchrashuvlar
                    </p>
                    <p className="mt-1 text-xl font-bold text-grayDark">
                      {Number(stats?.totalAppointments ?? 0)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => go("/all-appointments")}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold hover:bg-grayLight"
                  >
                    Qabullar
                  </button>
                </div>
                <div className="rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-grayDark/70">
                      Tashriflar (muolajalar)
                    </p>
                    <p className="mt-1 text-xl font-bold text-grayDark">
                      {Number(stats?.totalVisits ?? 0)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => go("/treatments")}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold hover:bg-grayLight"
                  >
                    Muolajalar
                  </button>
                </div>
              </div>
            )}
          </SectionCard>
        </div>
        <div className="mt-6" id="dentists-table">
          <SectionCard
            title="Stomatologlar bo‘yicha ko‘rsatkichlar"
            subtitle="Klinik KPI: tashriflar (muolajalar), bemorlar, tushum, qarz va to‘lov foizi"
            right={
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Qidirish: ism..."
                  className="w-full sm:w-60 rounded-xl border border-gray-200 px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <select
                  value={sortKey}
                  onChange={(e) => {
                    setSortKey(e.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-48 rounded-xl border border-gray-200 px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="paid">Tushum bo‘yicha</option>
                  <option value="visits">Tashrif bo‘yicha</option>
                  <option value="patients">Bemor bo‘yicha</option>
                  <option value="debt">Qarz bo‘yicha</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                  }
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-[15px] font-semibold text-grayDark hover:bg-grayLight"
                >
                  {sortDir === "asc" ? "↑" : "↓"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    exportDentistsExcel({
                      rows: tableRows,
                      stats,
                      dentists,
                      rangeLabel,
                      selectedDentistName:
                        dentists?.find(
                          (d) => String(d._id) === String(dentistId),
                        )?.name || "",
                    })
                  }
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold text-primary hover:bg-primary/5 transition flex items-center gap-1.5"
                  title="Excel hisobotni yuklash"
                >
                  Excel
                </button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-[15px]">
                <thead className="bg-grayLight">
                  <tr className="text-left text-sm font-semibold text-grayDark/80">
                    <th className="px-4 py-3">Stomatolog</th>
                    <th
                      className="px-4 py-3 text-center cursor-pointer"
                      onClick={() => toggleSort("visits")}
                    >
                      Tashrif
                    </th>
                    <th
                      className="px-4 py-3 text-center hidden sm:table-cell cursor-pointer"
                      onClick={() => toggleSort("patients")}
                    >
                      Bemor
                    </th>
                    <th className="px-4 py-3 text-right hidden md:table-cell">
                      Uchrashuv
                    </th>
                    <th
                      className="px-4 py-3 text-right cursor-pointer"
                      onClick={() => toggleSort("paid")}
                    >
                      Tushum
                    </th>
                    <th
                      className="px-4 py-3 text-right hidden sm:table-cell cursor-pointer"
                      onClick={() => toggleSort("debt")}
                    >
                      Qarz
                    </th>
                    <th className="px-4 py-3 text-right">To‘lov</th>
                    <th className="px-4 py-3 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && !stats ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-4 py-4">
                          <Skeleton className="h-6 w-44" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Skeleton className="h-6 w-12 mx-auto" />
                        </td>
                        <td className="px-4 py-4 text-center hidden sm:table-cell">
                          <Skeleton className="h-6 w-12 mx-auto" />
                        </td>
                        <td className="px-4 py-4 text-right hidden md:table-cell">
                          <Skeleton className="h-6 w-12 ml-auto" />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Skeleton className="h-6 w-28 ml-auto" />
                        </td>
                        <td className="px-4 py-4 text-right hidden sm:table-cell">
                          <Skeleton className="h-6 w-28 ml-auto" />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Skeleton className="h-6 w-14 ml-auto" />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Skeleton className="h-10 w-32 ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : pagedRows.length > 0 ? (
                    pagedRows.map((d) => {
                      const payRate = Number(d.payRate || 0);
                      const tone =
                        payRate >= 90
                          ? "green"
                          : payRate >= 70
                            ? "yellow"
                            : "red";

                      return (
                        <tr
                          key={d.dentistId}
                          className="border-t border-gray-100 hover:bg-grayLight/60 transition"
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-[15.5px] text-grayDark break-words">
                              {d.name}
                            </p>
                          </td>

                          <td className="px-4 py-3 text-center font-semibold">
                            {d.visits || 0}
                          </td>

                          <td className="px-4 py-3 text-center hidden sm:table-cell">
                            {d.patientsCount || 0}
                          </td>

                          <td className="px-4 py-3 text-right hidden md:table-cell">
                            {d.appointments || 0}
                          </td>

                          <td className="px-4 py-3 text-right font-semibold text-primary">
                            {fmt(d.totalPaid)} so‘m
                          </td>

                          <td className="px-4 py-3 text-right font-semibold text-thirdary hidden sm:table-cell">
                            {fmt(d.totalDebt)} so‘m
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-col items-end gap-2">
                              <Badge tone={tone}>{payRate}%</Badge>
                              <div className="w-24">
                                <Progress value={payRate} tone={tone} />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-col sm:flex-row gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setDentistId(d.dentistId);
                                  loadStats({ dentistId: d.dentistId });
                                }}
                                className="rounded-xl border border-primary/25 px-4 py-2.5 text-[14px] font-semibold text-primary hover:bg-primary/5"
                              >
                                Filtrlash
                              </button>
                              <a
                                href={`/all-dentists/${d.dentistId}`}
                                className="rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold text-grayDark hover:bg-grayLight"
                              >
                                Akkaunt
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-base text-grayDark/60"
                      >
                        Ma’lumot topilmadi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-[14px] text-grayDark/60">
                Jami:{" "}
                <span className="font-semibold text-grayDark">
                  {tableRows.length}
                </span>{" "}
                • Sahifa{" "}
                <span className="font-semibold text-grayDark">
                  {page}/{totalPages}
                </span>
              </p>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold hover:bg-grayLight disabled:opacity-50"
                >
                  ⏮
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold hover:bg-grayLight disabled:opacity-50"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold hover:bg-grayLight disabled:opacity-50"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold hover:bg-grayLight disabled:opacity-50"
                >
                  ⏭
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
