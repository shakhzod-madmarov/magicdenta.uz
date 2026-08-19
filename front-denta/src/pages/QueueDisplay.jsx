import { useEffect, useMemo, useRef, useState } from "react";
import { assets } from "../assets/assets";
import "./QueueDisplay.css";
import Seo from "../components/Seo";

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
const QUEUE_FEED_URL = "/__queue_feed";

const getStableQueueItemId = (item) => {
  const raw = item?.appointmentId || item?.orthoQueueId || "";
  return raw ? String(raw) : "";
};

const DENTISTS_PER_PAGE = 6;
const FETCH_MS = 2000;
const PAGE_ROTATE_MS = 7000;

const POPUP_SHOW_MS = 5000;
const REMIND_AFTER_MS = 120000;

const SOUND_SRC = "/sounds/airport-call.mp3";

let sharedAudio = null;
const getAudio = () => {
  if (!sharedAudio) {
    sharedAudio = new Audio(SOUND_SRC);
    sharedAudio.preload = "auto";
    sharedAudio.volume = 1.0;
    sharedAudio.playsInline = true;
  }
  return sharedAudio;
};

const stopAudio = () => {
  try {
    const a = getAudio();
    a.pause();
    a.currentTime = 0;
  } catch {}
};

const playOnce = async () => {
  try {
    const a = getAudio();
    a.muted = false;
    a.volume = 1.0;
    a.currentTime = 0;
    await a.play();
    return true;
  } catch {
    return false;
  }
};

const playAirportChime3x = async () => {
  const ok1 = await playOnce();
  setTimeout(() => playOnce(), 800);
  setTimeout(() => playOnce(), 1600);
  return ok1;
};

const formatTashkentDateTime = (ms) => {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "—";

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (t) => parts.find((p) => p.type === t)?.value || "";

  return `${get("day")}-${get("month")}-${get("year")} ${get("hour")}:${get("minute")}`;
};

const safeName = (s) => (String(s || "").trim() ? String(s).trim() : "—");

const requestFullscreen = async () => {
  const el = document.documentElement;

  const fn =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen;

  if (fn) await fn.call(el);
};

const exitFullscreen = async () => {
  const fn =
    document.exitFullscreen ||
    document.webkitExitFullscreen ||
    document.mozCancelFullScreen ||
    document.msExitFullscreen;

  if (fn) await fn.call(document);
};

const toggleFullscreen = async () => {
  try {
    const isFs =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    if (!isFs) await requestFullscreen();
    else await exitFullscreen();
  } catch {}
};

const isFullscreenNow = () =>
  Boolean(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement,
  );

export default function QueueDisplay() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [page, setPage] = useState(0);

  const [popup, setPopup] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== "undefined" ? isFullscreenNow() : false,
  );

  const [headerNowMs, setHeaderNowMs] = useState(0);

  useEffect(() => {
    if (data?.serverTimeMs) {
      setHeaderNowMs(Number(data.serverTimeMs));
    }
  }, [data?.serverTimeMs]);

  useEffect(() => {
    if (!headerNowMs) return;

    const t = setInterval(() => {
      setHeaderNowMs((prev) => prev + 1000);
    }, 1000);

    return () => clearInterval(t);
  }, [headerNowMs]);

  const [soundReady, setSoundReady] = useState(true);

  const showingRef = useRef(false);
  const popupQueueRef = useRef([]);
  const lastRemindAtRef = useRef(new Map());
  const lastSeenNextIdRef = useRef(new Map());
  const lastSeenCurrentIdRef = useRef(new Map());

  const url = QUEUE_FEED_URL;

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(isFullscreenNow());

    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    document.addEventListener("mozfullscreenchange", onFsChange);
    document.addEventListener("MSFullscreenChange", onFsChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      document.removeEventListener("mozfullscreenchange", onFsChange);
      document.removeEventListener("MSFullscreenChange", onFsChange);
    };
  }, []);

  useEffect(() => {
    getAudio();

    const onUserGesture = async () => {
      const ok = await playOnce();
      stopAudio();
      setSoundReady(ok);
    };

    window.addEventListener("click", onUserGesture, { once: true });
    window.addEventListener("touchstart", onUserGesture, { once: true });
    window.addEventListener("keydown", onUserGesture, { once: true });

    return () => {
      window.removeEventListener("click", onUserGesture);
      window.removeEventListener("touchstart", onUserGesture);
      window.removeEventListener("keydown", onUserGesture);
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const enqueuePopup = (item, reason = "normal") => {
      if (!item?.dentistId) return;

      const existsInQueue = popupQueueRef.current.some(
        (x) =>
          x.dentistId === item.dentistId &&
          x.queueNo === item.queueNo &&
          x.patientName === item.patientName,
      );

      const isCurrentlyShowingSame =
        popup?.dentistId === item.dentistId &&
        popup?.queueNo === item.queueNo &&
        popup?.patientName === item.patientName;

      if (existsInQueue || isCurrentlyShowingSame) return;

      if (reason === "urgent") popupQueueRef.current.unshift(item);
      else popupQueueRef.current.push(item);
    };

    const fetchQueue = async () => {
      try {
        setErr("");

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
        }

        const json = await res.json();
        if (!json?.success) throw new Error(json?.message || "Backend error");

        const dentists = Array.isArray(json.dentists) ? json.dentists : [];
        const now = Date.now();

        for (const d of dentists) {
          const dentistId = String(d?.dentist?.id || "");
          if (!dentistId) continue;

          const currentId = getStableQueueItemId(d?.current);
          const nextId = getStableQueueItemId(d?.next);

          const prevCurrentId =
            lastSeenCurrentIdRef.current.get(dentistId) || "";
          const prevNextId = lastSeenNextIdRef.current.get(dentistId) || "";

          lastSeenCurrentIdRef.current.set(dentistId, currentId);
          lastSeenNextIdRef.current.set(dentistId, nextId);

          const canCallNow =
            !currentId && Boolean(nextId) && Boolean(d?.next?.shouldCall);

          const justFinished = Boolean(prevCurrentId) && canCallNow;
          const nextChangedWhileIdle = canCallNow && nextId !== prevNextId;

          if (justFinished || nextChangedWhileIdle) {
            enqueuePopup(
              {
                dentistId,
                dentistName: safeName(d?.dentist?.name),
                queueNo: d?.next?.queueNo ?? "—",
                patientName: safeName(d?.next?.patient?.name),
              },
              "urgent",
            );
            lastRemindAtRef.current.set(dentistId, now);
          }

          if (canCallNow) {
            const last = lastRemindAtRef.current.get(dentistId) || 0;
            if (now - last >= REMIND_AFTER_MS) {
              enqueuePopup(
                {
                  dentistId,
                  dentistName: safeName(d?.dentist?.name),
                  queueNo: d?.next?.queueNo ?? "—",
                  patientName: safeName(d?.next?.patient?.name),
                },
                "normal",
              );
              lastRemindAtRef.current.set(dentistId, now);
            }
          } else {
            lastRemindAtRef.current.set(dentistId, 0);
          }
        }

        const sorted = [...dentists].sort((a, b) => {
          const aCallable = !a.current && a.next && a.next.shouldCall;
          const bCallable = !b.current && b.next && b.next.shouldCall;

          if (aCallable && !bCallable) return -1;
          if (!aCallable && bCallable) return 1;

          const aBusy = Boolean(a?.current);
          const bBusy = Boolean(b?.current);
          if (aBusy && !bBusy) return -1;
          if (!aBusy && bBusy) return 1;

          return safeName(a?.dentist?.name).localeCompare(
            safeName(b?.dentist?.name),
          );
        });

        if (alive) setData({ ...json, dentists: sorted });
      } catch (e) {
        if (alive) setErr(e?.message || "Network error");
      }
    };

    fetchQueue();
    const t = setInterval(fetchQueue, FETCH_MS);

    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [url, popup]);

  useEffect(() => {
    const tick = async () => {
      if (showingRef.current) return;

      const nextItem = popupQueueRef.current.shift();
      if (!nextItem) return;

      showingRef.current = true;
      setPopup(nextItem);

      const ok = await playAirportChime3x();
      setSoundReady(ok);

      setTimeout(() => {
        setPopup(null);
        showingRef.current = false;
      }, POPUP_SHOW_MS);
    };

    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }, []);

  const totalPages = useMemo(() => {
    const len = data?.dentists?.length || 0;
    return Math.max(1, Math.ceil(len / DENTISTS_PER_PAGE));
  }, [data]);

  const pageDentists = useMemo(() => {
    const list = data?.dentists || [];
    const start = page * DENTISTS_PER_PAGE;
    return list.slice(start, start + DENTISTS_PER_PAGE);
  }, [data, page]);

  useEffect(() => {
    const t = setInterval(() => {
      setPage((p) => (p + 1 >= totalPages ? 0 : p + 1));
      setAnimKey((k) => k + 1);
    }, PAGE_ROTATE_MS);
    return () => clearInterval(t);
  }, [totalPages]);

  if (!data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F2F2F2] text-black">
        <div className="text-3xl font-black">Yuklanmoqda...</div>
        {err ? (
          <div className="mt-6 p-4 rounded-2xl border border-[#B6B09F] bg-white max-w-2xl text-center">
            <div className="text-red-600 font-bold">Xatolik:</div>
            <div className="mt-2 text-sm whitespace-pre-wrap">{err}</div>
            <div className="mt-3 text-xs text-neutral-500">URL: {url}</div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <Seo title="Bemorlar Navbati | Magic Denta" noindex={true} />
      <div className="tv-app">
        {!soundReady ? (
          <div className="unlock-bar">
            <div className="unlock-card">
              <div className="unlock-title">TV uchun ovoz yoqilmagan</div>
              <div className="unlock-subtitle">
                Bir marta bosing — ovoz va fullscreen ishga tushadi
              </div>
              <button
                onClick={async () => {
                  const ok = await playAirportChime3x();
                  stopAudio();
                  setSoundReady(ok);
                }}
                className="primary-btn"
                type="button"
              >
                Ovoz / Fullscreen yoqish
              </button>
            </div>
          </div>
        ) : null}

        <header className="topbar">
          <div className="brand">
            <img src={assets.logo} alt="Magic Denta logo" className="brand-logo" />
          </div>
          <div className="topbar-right">
            <div className="header-time">
              {headerNowMs ? formatTashkentDateTime(headerNowMs) : "—"}
            </div>
            {!isFullscreen ? (
              <button
                onClick={async () => {
                  await toggleFullscreen();
                  const ok = await playAirportChime3x();
                  stopAudio();
                  setSoundReady(ok);
                }}
                className="primary-btn"
              >
                Fullscreen
              </button>
            ) : null}
          </div>
        </header>

        <main className="board">
          <div className="table-head">
            <div className="col doctor-col">Shifokor</div>
            <div className="col current-col">Qabulda</div>
            <div className="col next-col">Keyingi</div>
          </div>
          <div
            key={animKey}
            className="rows"
            style={{ animation: "slideIn 450ms ease-out" }}
          >
            <style>{`
              @keyframes slideIn {
                from { opacity: 0; transform: translateX(18px); }
                to   { opacity: 1; transform: translateX(0); }
              }
            `}</style>
            {pageDentists.map((d) => {
              const dentistId = String(d?.dentist?.id || "");
              const dentistName = safeName(d?.dentist?.name);

              const img = d?.dentist?.image
                ? `${API_BASE}${d.dentist.image}`
                : "";

              const curName = d?.current?.patient?.name
                ? safeName(d.current.patient.name)
                : "";

              const nextName = d?.next?.patient?.name
                ? safeName(d.next.patient.name)
                : "";

              const isBusy = Boolean(d?.current);
              const hasNext = Boolean(d?.next);
              const isCallable =
                !isBusy && hasNext && Boolean(d?.next?.shouldCall);
              const isScheduledWaiting = !isBusy && hasNext;

              return (
                <div
                  key={dentistId}
                  className={[
                    "queue-row",
                    isCallable ? "callable" : "",
                  ].join(" ")}
                >
                  <div className="doctor-cell">
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="doctor-avatar"
                      />
                    ) : (
                      <div className="doctor-avatar-placeholder" />
                    )}

                    <div className="doctor-meta">
                      <div className="doctor-name">
                        {dentistName}
                      </div>

                      <div className="status-chip-container">
                        {isBusy ? (
                          <span className="status-chip status-busy">
                            QABULDA
                          </span>
                        ) : isCallable ? (
                          <span className="status-chip status-callable">
                            NAVBAT BOR
                          </span>
                        ) : isScheduledWaiting ? (
                          <span className="status-chip status-waiting">
                            BAND
                          </span>
                        ) : (
                          <span className="status-chip status-empty">
                            BO‘SH
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="slot-cell">
                    <div className={`slot-name ${d?.current ? "slot-name-current" : ""}`}>
                      {curName || "—"}
                    </div>
                    <div className="slot-caption">
                      {d?.current ? "Qabulda" : ""}
                    </div>
                  </div>

                  <div className="slot-cell">
                    <div className={`slot-name ${d?.next ? "slot-name-next" : ""}`}>
                      {nextName || "—"}
                    </div>
                    <div className="slot-caption">
                      {hasNext && isCallable ? "Keyingi" : ""}
                    </div>
                  </div>
                </div>
              );
            })}

            {!pageDentists.length ? (
              <div className="empty-card">
                Hozircha shifokorlar ro‘yxati yo‘q.
              </div>
            ) : null}
          </div>

          {totalPages > 1 ? (
            <div className="pager">
              {Array.from({ length: totalPages }).map((_, i) => (
                <div
                  key={i}
                  className={`pager-dot ${
                    i === page ? "active" : ""
                  }`}
                />
              ))}
            </div>
          ) : null}
        </main>

        {popup ? (
          <div className="popup-overlay" style={{ display: "block" }}>
            <div className="popup-card">
              <div className="popup-label">
                KEYINGI BEMOR
              </div>

              <div className="popup-queue-no">
                #{popup.queueNo}
              </div>

              <div className="popup-patient-name">
                {popup.patientName}
              </div>

              <div className="popup-message">
                Iltimos,{" "}
                <span className="popup-dentist-name">
                  {popup.dentistName}
                </span>{" "}
                huzuriga o‘ting
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
