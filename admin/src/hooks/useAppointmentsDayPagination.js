import { useMemo, useState } from "react";
import { addDaysYMD, dayToUtcMs } from "../../../shared/date.js";

const dayTs = (ymd) => {
  if (!ymd) return 0;
  const ts = dayToUtcMs(ymd, 0);
  return Number.isFinite(ts) ? ts : 0;
};

const addDays = (ymd, days) => {
  if (!ymd) return "";
  return addDaysYMD(ymd, days);
};

export const useAppointmentsDayPagination = ({
  list = [],
  todayYMD = "",
  perPageDays = 3,
  pinInProgress = true,
  getStatus = (a) => a?.status,
  getDate = (a) => a?.slotDate,
  getTime = (a) => a?.slotTime,
  sortItems = null,
} = {}) => {
  const [page, setPage] = useState(1);

  const data = useMemo(() => {
    const safeList = Array.isArray(list) ? list : [];
    const todayTs = dayTs(todayYMD);

    const active = pinInProgress
      ? safeList.filter((a) => getStatus(a) === "IN_PROGRESS")
      : [];

    const rest = pinInProgress
      ? safeList.filter((a) => getStatus(a) !== "IN_PROGRESS")
      : safeList;

    const map = new Map();

    for (const a of rest) {
      const d = getDate(a) || "unknown";
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(a);
    }

    for (const [d, items] of map.entries()) {
      if (typeof sortItems === "function") {
        items.sort(sortItems);
      } else {
        items.sort((x, y) =>
          String(getTime(x) || "").localeCompare(String(getTime(y) || "")),
        );
      }
      map.set(d, items);
    }

    const today = todayYMD;
    const tomorrow = addDays(todayYMD, 1);
    const afterTomorrow = addDays(todayYMD, 2);

    const firstThreeSet = new Set(
      [today, tomorrow, afterTomorrow].filter(Boolean),
    );

    const firstThree = [];
    const future = [];
    const past = [];
    const unknown = [];

    for (const [date, items] of map.entries()) {
      const ts = dayTs(date);

      if (date === "unknown" || !ts) {
        unknown.push({ date, items });
        continue;
      }

      if (firstThreeSet.has(date)) firstThree.push({ date, items });
      else if (ts > todayTs) future.push({ date, items });
      else past.push({ date, items });
    }

    firstThree.sort((a, b) => dayTs(a.date) - dayTs(b.date));
    future.sort((a, b) => dayTs(a.date) - dayTs(b.date));
    past.sort((a, b) => dayTs(b.date) - dayTs(a.date));

    const timeline = [...firstThree, ...future, ...past, ...unknown];
    const totalPages = Math.max(1, Math.ceil(timeline.length / perPageDays));

    const safePage = Math.min(Math.max(1, page), totalPages);

    const start = (safePage - 1) * perPageDays;
    const slice = timeline.slice(start, start + perPageDays);

   const groups = [];
   if (active.length > 0) {
     const activeItems = [...active];

     if (typeof sortItems === "function") {
       activeItems.sort(sortItems);
     } else {
       activeItems.sort((x, y) =>
         String(getTime(x) || "").localeCompare(String(getTime(y) || "")),
       );
     }

     groups.push({ date: "IN_PROGRESS", items: activeItems, pinned: true });
   }
   groups.push(...slice.map((g) => ({ ...g, pinned: false })));

    return {
      page: safePage,
      totalPages,
      groups,
      counts: {
        daysTotal: timeline.length,
        firstThreeCount: firstThree.length,
        futureCount: future.length,
        pastCount: past.length,
        unknownCount: unknown.length,
      },
    };
  }, [
    list,
    todayYMD,
    perPageDays,
    pinInProgress,
    page,
    getStatus,
    getDate,
    getTime,
    sortItems,
  ]);

  const goto = (p) => setPage(p);
  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const resetPage = () => setPage(1);

  return {
    groups: data.groups,
    page: data.page,
    totalPages: data.totalPages,
    goto,
    nextPage,
    prevPage,
    resetPage,
    counts: data.counts,
  };
};
