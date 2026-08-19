import { useContext, useEffect, useMemo, useState, Fragment } from "react";
import { AdminContext } from "../../context/AdminContext";
import LiveDentistsBar from "../../components/LiveDentistsBar";
import AdminManualBookingModal from "../../components/AdminManualBookingModal";
import RescheduleModal from "../../components/RescheduleModal";
import ChangeAmountModal from "../../components/ChangeAmountModal";
import {
  dayToUtcMs,
  formatMoney,
  formatWeekdayDMY,
  formatDateTimeISO,
  isoToday,
} from "../../../../shared/date.js";
import { useAppointmentsDayPagination } from "../../hooks/useAppointmentsDayPagination";
import { normalizeText } from "../../utils/text";

const dateToTs = (dateStr) => {
  if (!dateStr) return 0;
  return dayToUtcMs(dateStr, 0);
};

const getStatus = (a) => {
  if (a.cancelled || a.status === "CANCELLED") {
    return ["Bekor qilingan", "bg-red-100 text-red-700"];
  }

  if (a.status === "MISSED") {
    return ["Kelmagan", "bg-gray-200 text-gray-600"];
  }

  if (a.status === "IN_PROGRESS") {
    return ["Qabul qilinmoqda", "bg-blue-50 text-blue-700 border-blue-200"];
  }

  if (a.status === "DONE") {
    const paid = Number(a.financial?.paidAmount || 0);
    const debt = Number(a.financial?.debt || 0);
    const requested = Number(a.financial?.requestedPaidNow || 0);

    if (requested > 0) {
      return ["To‘lov tasdiqlanishi kutilmoqda", "bg-blue-100 text-blue-800"];
    }

    if (paid > 0 && debt > 0) {
      return ["Yakunlangan (qarz bor)", "bg-yellow-100 text-yellow-800"];
    }

    return ["Yakunlangan", "bg-green-100 text-green-700"];
  }

  return ["Kutilmoqda", "bg-yellow-100 text-yellow-800"];
};

const AllAppointments = () => {
  const {
    aToken,
    appointments,
    getAllAppointments,
    confirmAppointmentArrival,
    getAllDentists,
    dentists,
    changeTreatmentAmount,
  } = useContext(AdminContext);

  const [filter, setFilter] = useState("ALL");
  const [customDate, setCustomDate] = useState("");
  const [search, setSearch] = useState("");
  const [manualBookingOpen, setManualBookingOpen] = useState(false);
  const [rescheduleModalApp, setRescheduleModalApp] = useState(null);
  const [amountModalOpen, setAmountModalOpen] = useState(false);
  const [amountTarget, setAmountTarget] = useState(null);

  const today = isoToday();
  const todayTs = dateToTs(today);

  const handleConfirmArrival = async (appointmentId) => {
    const res = await confirmAppointmentArrival(appointmentId);
    if (res?.ok) {
      getAllAppointments();
    }
  };

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
      getAllDentists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aToken]);

  const todayAppointments = useMemo(
    () => appointments.filter((a) => !a?.cancelled && a?.slotDate === today),
    [appointments, today],
  );

  const filtered = useMemo(() => {
    let list = [...appointments];

    if (filter === "CANCELLED") {
      list = list.filter((a) => a.cancelled || a.status === "CANCELLED");
    }

    if (filter === "PENDING") {
      list = list.filter(
        (a) =>
          !a.cancelled &&
          (a.status === "WAITING" || a.status === "IN_PROGRESS"),
      );
    }

    if (filter === "PAID") {
      list = list.filter(
        (a) =>
          !a.cancelled &&
          a.status === "DONE" &&
          Number(a.financial?.paidAmount || 0) > 0,
      );
    }

    if (filter === "MISSED") {
      list = list.filter((a) => a.status === "MISSED");
    }

    if (customDate) {
      list = list.filter((a) => a.slotDate === customDate);
    }

        if (search) {
          const s = search.toLowerCase();
          const norm = normalizeText(s);

          list = list.filter((a) => {
            const userName = a.userData?.name || "";
            const dentistName = a.dentistData?.name || "";
            const phone = a.userData?.phone || "";

            const userNameLc = userName.toLowerCase();
            const dentistNameLc = dentistName.toLowerCase();

            const userNameNorm = normalizeText(userName);
            const dentistNameNorm = normalizeText(dentistName);

            return (
              userNameLc.includes(s) ||
              dentistNameLc.includes(s) ||
              (norm && userNameNorm.includes(norm)) ||
              (norm && dentistNameNorm.includes(norm)) ||
              phone.includes(s)
            );
          });
        }

    return list;
  }, [appointments, filter, customDate, search]);

const {
  groups: grouped,
  page,
  totalPages,
  nextPage,
  prevPage,
  resetPage,
} = useAppointmentsDayPagination({
  list: filtered,
  todayYMD: today,
  perPageDays: 3,
  pinInProgress: true,
  getStatus: (a) => a?.status,
  getDate: (a) => a?.slotDate,
  getTime: (a) => a?.slotTime,
  sortItems: (x, y) => {
    const xActive = x?.status === "WAITING";
    const yActive = y?.status === "WAITING";

    if (xActive && !yActive) return -1;
    if (!xActive && yActive) return 1;

    if (xActive && yActive) {
      if (x?.isWalkIn && !y?.isWalkIn) return -1;
      if (!x?.isWalkIn && y?.isWalkIn) return 1;
    }

    const timeX = new Date(x?.createdAt || x?.date || 0).getTime();
    const timeY = new Date(y?.createdAt || y?.date || 0).getTime();
    return timeY - timeX;
  },
});
  
  useEffect(() => {
    resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, customDate, search]);

  return (
    <main className="w-full flex justify-center px-4 py-6">
      <section className="w-full max-w-[1600px] space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F3040]">
            Uchrashuvlar (Admin)
          </h1>
          <button
            onClick={() => setManualBookingOpen(true)}
            className="h-9 px-4 bg-primary text-white text-xs font-bold rounded-2xl hover:bg-primary/95 transition flex items-center gap-1.5 shadow-sm"
          >
            + Rejali uchrashuv qo'shish
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px,minmax(0,1fr)] xl:grid-cols-[410px,minmax(0,1fr)]">
          <div className="min-w-0 self-start">
            <LiveDentistsBar
              appointments={todayAppointments}
              onRefreshData={({ silent = false } = {}) =>
                getAllAppointments({ silent })
              }
            />
          </div>

          <div className="min-w-0 space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap gap-2">
          {[
            ["ALL", "Hammasi"],
            ["TODAY", "Bugun"],
            ["PENDING", "Kutilmoqda"],
            ["PAID", "To‘langan"],
            ["CANCELLED", "Bekor qilingan"],
            ["MISSED", "Kelmagan"],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => {
                setFilter(k);
                setCustomDate(k === "TODAY" ? today : "");
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === k
                  ? "bg-primary text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Bemor / telefon / stomatolog"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm sm:w-72"
                />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-gray-600">
                  Sahifa: <b>{page}</b> / {totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={prevPage}
                    disabled={page <= 1}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
                  >
                    ⬅ Oldingi
                  </button>
                  <button
                    onClick={nextPage}
                    disabled={page >= totalPages}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
                  >
                    Keyingi ➡
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
            <thead className="bg-[#0F3040] text-white">
              <tr>
                <th className="p-3 text-left">Bemor</th>
                <th className="p-3 text-left">Stomatolog</th>
                <th className="p-3">Sana</th>
                <th className="p-3">Vaqt</th>
                <th className="p-3">Narx</th>
                <th className="p-3">Qarz</th>
                <th className="p-3">Oxirgi to‘lov</th>
                <th className="p-3">Holat</th>
                <th className="p-3">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {grouped.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-500">
                    Uchrashuvlar topilmadi
                  </td>
                </tr>
              )}
              {grouped.map((g) => (
                <Fragment key={g.date}>
                  <tr className="bg-gray-100">
                    <td colSpan={9} className="p-3 font-semibold">
                      {g.date === "IN_PROGRESS"
                        ? "Qabul qilinmoqda"
                        : formatWeekdayDMY(g.date)}
                      {g.date === today && (
                        <span className="ml-2 text-xs text-green-600">
                          (Bugun)
                        </span>
                      )}
                    </td>
                  </tr>
                  {g.items.map((a) => {
                    const [label, badge] = getStatus(a);
                    const fin = a.financial || {};
                    const amount = fin.amount || 0;
                    const debt =
                      fin.debt ?? Math.max(0, amount - (fin.paidAmount || 0));
                                        const hasInfectiousDiseaseMarker =
                                          Boolean(
                                            a.userData
                                              ?.hasInfectiousDiseaseMarker,
                                          );
                    return (
                      <tr key={a._id} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                          <p className="font-medium inline-flex items-center gap-1 flex-wrap">
                            {a.queueNo && (
                              <span className="text-blue-600 font-extrabold mr-1">
                                #{a.queueNo}
                              </span>
                            )}
                            <span>{a.userData?.name || "—"}</span>
                            {hasInfectiousDiseaseMarker && (
                              <span
                                className="text-sm font-bold leading-none text-gray-800"
                                title="Maxfiy infeksion belgi bor"
                              >
                                *
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {a.userData?.phone || "—"}
                          </p>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                a.dentistData?.image
                                  ? `${import.meta.env.VITE_BACKEND_URL || ""}${a.dentistData.image}`
                                  : "/doctor-placeholder.svg"
                              }
                              alt={a.dentistData?.name || "Dentist"}
                              className="h-8 w-8 rounded-full object-cover bg-slate-100"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/doctor-placeholder.svg";
                              }}
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800">{a.dentistData?.name || "—"}</p>
                              {a.dentistData?.isArchived && (
                                <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                  Arxivda
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {formatWeekdayDMY(a.slotDate)}
                        </td>
                        <td className="p-3 text-center">{a.slotTime || "—"}</td>
                        <td className="p-3 text-center font-semibold">
                          {formatMoney(amount)}
                        </td>
                        <td className="p-3 text-center font-semibold text-red-600">
                          {formatMoney(debt)}
                        </td>
                        <td className="p-3 text-center">
                          {formatDateTimeISO(fin.lastPaidAt)}
                        </td>
                        <td className="p-3 text-center align-middle">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span
                              className={`min-w-[120px] h-7 flex items-center justify-center rounded-md text-xs font-semibold border ${badge}`}
                            >
                              {label}
                            </span>
                            {a.isWalkIn && (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  a.appointmentType === "ORTHODONTIC"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : "bg-sky-50 text-sky-700 border border-sky-200"
                                }`}
                              >
                                {a.appointmentType === "ORTHODONTIC"
                                  ? "Ortodont ko'rik"
                                  : "Oddiy ko'rik"}
                              </span>
                            )}
                            {a.rescheduled && (
                              <span
                                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200 cursor-help"
                                title={
                                  Array.isArray(a.rescheduleHistory) && a.rescheduleHistory.length > 0
                                    ? a.rescheduleHistory
                                        .map(
                                          (h, i) =>
                                            `#${i + 1}: ${formatWeekdayDMY(h.oldSlotDate)} ${h.oldSlotTime} ➔ ${formatWeekdayDMY(h.newSlotDate)} ${h.newSlotTime} (${h.rescheduledByName || h.rescheduledBy}${h.reason ? ` - "${h.reason}"` : ""})`
                                        )
                                        .join("\n")
                                    : `Ko'chirdi: ${a.rescheduledByName || a.rescheduledBy}`
                                }
                              >
                                🔄 Ko'chirilgan ({a.rescheduledByName || a.rescheduledBy})
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            {a.status === "WAITING" &&
                              !a.cancelled &&
                              a.slotDate &&
                              dateToTs(a.slotDate) > todayTs && (
                                <button
                                  type="button"
                                  onClick={() => handleConfirmArrival(a._id)}
                                  className="px-3 py-1 text-xs rounded bg-primary text-white hover:bg-primary/90"
                                >
                                  Bugun qabul qilindi
                                </button>
                              )}
                            {a.status === "WAITING" && !a.cancelled && (
                              <button
                                type="button"
                                onClick={() => setRescheduleModalApp(a)}
                                className="px-2.5 py-1 text-xs font-semibold rounded border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors flex items-center gap-1"
                              >
                                🔄 Vaqtini ko'chirish
                              </button>
                            )}
                            {a.status === "DONE" && !a.cancelled && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAmountTarget({
                                    _id: a.financial?.treatmentId || a.financial?._id || a._id,
                                    amount: a.financial?.amount || 0,
                                    paidAmount: a.financial?.paidAmount || 0,
                                  });
                                  setAmountModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                              >
                                Summani o‘zgartirish
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </section>
      {manualBookingOpen && (
        <AdminManualBookingModal
          open={manualBookingOpen}
          onClose={() => setManualBookingOpen(false)}
          onSubmit={() => getAllAppointments({ silent: true })}
        />
      )}
      {rescheduleModalApp && (
        <RescheduleModal
          open={Boolean(rescheduleModalApp)}
          appointment={rescheduleModalApp}
          onClose={() => setRescheduleModalApp(null)}
          onSuccess={() => getAllAppointments({ silent: true })}
          isDentist={false}
          dentistsList={dentists || []}
        />
      )}
      {amountModalOpen && amountTarget && (
        <ChangeAmountModal
          open={amountModalOpen}
          treatment={amountTarget}
          onClose={() => {
            setAmountModalOpen(false);
            setAmountTarget(null);
          }}
          onSubmit={async (treatmentId, payload) => {
            const res = await changeTreatmentAmount(treatmentId, payload);
            if (res?.ok) {
              getAllAppointments({ silent: true });
            }
            return res;
          }}
        />
      )}
    </main>
  );
};

export default AllAppointments;
