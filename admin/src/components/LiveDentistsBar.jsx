import { useContext, useEffect, useMemo, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import WalkInModal from "./WalkInModal";
import AdminManualBookingModal from "./AdminManualBookingModal";
import { formatHM, isoToday } from "../../../shared/date.js";

const STORAGE_KEY = "denta.admin.liveDentists.order.v1";

const Badge = ({ work }) => {
  const next = work?.next;

  if (next && typeof next.minutesLeft === "number" && next.showInAdmin) {
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
        Keyingi bemor: {next.minutesLeft} daqiqa qoldi
      </span>
    );
  }

  if (work?.state === "BUSY") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
        BAND
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
      BO‘SH
    </span>
  );
};

const parseSlotMinutes = (value) => {
  const match = String(value || "")
    .trim()
    .match(/^(\d{1,2}):(\d{2})/);

  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
};

const normalizeNameKey = (value) =>
  String(value || "")
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, " ");

const getAppointmentDentistKey = (appointment) => {
  const rawDentistId =
    appointment?.dentistID?._id ||
    appointment?.dentistID ||
    appointment?.dentistId ||
    appointment?.dentistData?._id ||
    "";

  if (rawDentistId && typeof rawDentistId !== "object") {
    return String(rawDentistId);
  }

  const rawDentistName =
    appointment?.dentistData?.name || appointment?.dentistName || "";

  return normalizeNameKey(rawDentistName);
};

const getCardDentistKey = (dentist) => {
  if (dentist?._id) return String(dentist._id);
  return normalizeNameKey(dentist?.name || "");
};

const readSavedOrder = () => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

const saveOrder = (items) => {
  if (typeof window === "undefined") return;

  try {
    const ids = items.map((item) => item?.dentist?._id).filter(Boolean);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore storage write issues
  }
};

const applySavedOrder = (items) => {
  const savedOrder = readSavedOrder();
  if (!savedOrder.length) return items;

  const indexMap = new Map(savedOrder.map((id, index) => [id, index]));

  return [...items].sort((a, b) => {
    const aId = a?.dentist?._id;
    const bId = b?.dentist?._id;
    const aIndex = indexMap.has(aId) ? indexMap.get(aId) : Number.MAX_SAFE_INTEGER;
    const bIndex = indexMap.has(bId) ? indexMap.get(bId) : Number.MAX_SAFE_INTEGER;

    if (aIndex !== bIndex) return aIndex - bIndex;
    return String(a?.dentist?.name || "").localeCompare(String(b?.dentist?.name || ""));
  });
};

const moveDentist = (items, draggedId, targetId) => {
  if (!draggedId || !targetId || draggedId === targetId) return items;

  const sourceIndex = items.findIndex((item) => item?.dentist?._id === draggedId);
  const targetIndex = items.findIndex((item) => item?.dentist?._id === targetId);

  if (sourceIndex === -1 || targetIndex === -1) return items;

  const next = [...items];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
};

const StatsPill = ({ label, value, tone = "gray" }) => {
  const toneClass = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
  }[tone] || "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <div className={`rounded-2xl border px-3 py-2.5 ${toneClass}`}>
      <p className="text-[12px] font-medium leading-4 opacity-80">{label}</p>
      <p className="mt-1.5 text-xl font-semibold leading-none text-slate-900">{value}</p>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 rounded-2xl bg-slate-100" />
        <div className="min-w-0 flex-1">
          <div className="mb-2 h-4 w-36 rounded bg-slate-100" />
          <div className="h-6 w-24 rounded-full bg-slate-100" />
        </div>
        <div className="h-9 w-9 rounded-xl bg-slate-100" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="h-16 rounded-2xl bg-slate-100" />
        <div className="h-16 rounded-2xl bg-slate-100" />
        <div className="h-16 rounded-2xl bg-slate-100" />
      </div>
      <div className="mt-3 h-14 rounded-xl bg-slate-100" />
      <div className="mt-4 h-11 rounded-2xl bg-slate-100" />
    </div>
  </div>
);

const LiveDentistsBar = ({ appointments = [], onRefreshData }) => {
  const { getLiveDentistsStatus, assignWalkIn, lookupPatient, createPatient, backendUrl } =
    useContext(AdminContext);

  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedScheduled, setSelectedScheduled] = useState(null);
  const [draggedId, setDraggedId] = useState("");
  const [dragOverId, setDragOverId] = useState("");
  const [loading, setLoading] = useState(false);

  const today = isoToday();
  const nowMinutes = parseSlotMinutes(formatHM(new Date())) ?? 0;

  const todayStats = useMemo(() => {
    const statsMap = {};

    appointments.forEach((appointment) => {
      if (!appointment || appointment.cancelled) return;
      if (String(appointment.status || "") === "CANCELLED") return;
      if (appointment.slotDate !== today) return;

      const dentistKey = getAppointmentDentistKey(appointment);
      if (!dentistKey) return;

      if (!statsMap[dentistKey]) {
        statsMap[dentistKey] = {
          waiting: 0,
          coming: 0,
          checked: 0,
        };
      }

      const status = String(appointment.status || "").trim();

      if (status === "DONE") {
        statsMap[dentistKey].checked += 1;
        return;
      }

      if (status === "IN_PROGRESS" || status === "CALLED") {
        statsMap[dentistKey].waiting += 1;
        return;
      }

      if (status !== "WAITING") return;

      const slotMinutes = parseSlotMinutes(appointment.slotTime);
      const isFutureBooked =
        !appointment.isWalkIn && slotMinutes !== null && slotMinutes > nowMinutes;

      if (isFutureBooked) {
        statsMap[dentistKey].coming += 1;
      } else {
        statsMap[dentistKey].waiting += 1;
      }
    });

    return statsMap;
  }, [appointments, nowMinutes, today]);

  const load = async ({ silent = false } = {}) => {
    setLoading(true);
    const res = await getLiveDentistsStatus({ silent });
    const ordered = applySavedOrder(Array.isArray(res) ? res : []);
    setList(ordered);
    saveOrder(ordered);
    setLoading(false);
  };

  const refreshAll = async () => {
    await Promise.all([
      load(),
      Promise.resolve(onRefreshData?.({ silent: false })),
    ]);
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      const res = await getLiveDentistsStatus({ silent: true });
      if (!active) return;

      const ordered = applySavedOrder(Array.isArray(res) ? res : []);
      setList(ordered);
      saveOrder(ordered);
      setLoading(false);
    };

    const boot = setTimeout(() => {
      void load();
    }, 0);
    const timer = setInterval(run, 15000);

    return () => {
      active = false;
      clearTimeout(boot);
      clearInterval(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendWalkIn = async (payload) => {
    const res = await assignWalkIn(payload);

    if (res.success) {
      await Promise.resolve(onRefreshData?.({ silent: true }));
      await load({ silent: true });
    }
    return res;
  };

  const handleDrop = (targetId) => {
    setList((current) => {
      const next = moveDentist(current, draggedId, targetId);
      saveOrder(next);
      return next;
    });
    setDraggedId("");
    setDragOverId("");
  };

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Stomatologlar holati
        </h2>

        <button
          type="button"
          onClick={refreshAll}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          {loading ? "Yangilanmoqda..." : "Yangilash"}
        </button>
      </div>

      <div className="space-y-3">
        {loading && list.length === 0 && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {list.length === 0 && !loading && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Hozircha stomatologlar topilmadi.
          </div>
        )}

        {list.map(({ dentist, work }) => {
          const dentistId = dentist?._id || "";
          const stats =
            todayStats[getCardDentistKey(dentist)] ||
            todayStats[normalizeNameKey(dentist?.name)] || {
              waiting: 0,
              coming: 0,
              checked: 0,
            };
          const isBusy = work?.state === "BUSY";
          const isDraggingOver = dragOverId === dentistId;

          return (
            <article
              key={dentistId}
              draggable
              onDragStart={() => {
                setDraggedId(dentistId);
                setDragOverId(dentistId);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (dragOverId !== dentistId) setDragOverId(dentistId);
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(dentistId);
              }}
              onDragEnd={() => {
                setDraggedId("");
                setDragOverId("");
              }}
              className={`rounded-2xl border bg-white p-4 shadow-sm transition ${
                isDraggingOver
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={
                    dentist?.image
                      ? (dentist.image.startsWith("http") ? dentist.image : backendUrl + dentist.image)
                      : "/doctor-placeholder.svg"
                  }
                  alt={dentist?.name || "Stomatolog"}
                  className="h-14 w-14 rounded-2xl border border-slate-200 object-cover bg-slate-100"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/doctor-placeholder.svg";
                  }}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="group relative min-w-0">
                      <h3
                        title={dentist?.name || ""}
                        className="truncate text-base font-semibold text-slate-900"
                      >
                        {dentist?.name || "—"}
                      </h3>

                      {!!dentist?.name && (
                        <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden max-w-[280px] rounded-2xl bg-slate-900 px-3 py-2 text-white shadow-2xl group-hover:block">
                          <p className="whitespace-normal break-words text-lg font-semibold leading-snug sm:text-xl">
                            {dentist.name}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Badge work={work} />
                      <button
                        type="button"
                        aria-label={`${dentist?.name || "Stomatolog"} tartibini sudrash`}
                        className="inline-flex h-9 w-9 cursor-grab items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 active:cursor-grabbing"
                      >
                        <span className="text-lg leading-none">⋮⋮</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <StatsPill label="Navbat" value={stats.waiting} tone="amber" />
                    <StatsPill label="Keladi" value={stats.coming} tone="blue" />
                    <StatsPill label="Qabul qilingan" value={stats.checked} tone="green" />
                  </div>

                  <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                    <span className="text-slate-400">Telefon</span>
                    <p className="mt-1 break-all font-medium text-slate-800">
                      {dentist?.phone || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelected({ dentist, work })}
                  className={`flex-1 rounded-2xl px-3 py-2.5 text-xs font-semibold transition ${
                    isBusy
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-primary text-white hover:opacity-90"
                  }`}
                >
                  {isBusy ? "Majburan yuborish" : "Jonli yuborish"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedScheduled(dentist)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                >
                  Rejali band qilish
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <WalkInModal
          dentist={selected.dentist}
          isBusy={selected.work?.state === "BUSY"}
          onClose={() => setSelected(null)}
          lookupPatientFn={lookupPatient}
          createPatientFn={createPatient}
          onSubmit={async (payload) => {
            return await sendWalkIn({ dentistID: selected.dentist._id, ...payload });
          }}
        />
      )}

      {selectedScheduled && (
        <AdminManualBookingModal
          open={!!selectedScheduled}
          dentist={selectedScheduled}
          onClose={() => setSelectedScheduled(null)}
          onSubmit={async () => {
            await Promise.resolve(onRefreshData?.({ silent: false }));
          }}
        />
      )}
    </aside>
  );
};

export default LiveDentistsBar;
