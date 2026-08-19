(function () {
  "use strict";

  var QUEUE_FEED_URL = "/__queue_feed";
  var DENTISTS_PER_PAGE = 6;
  var FETCH_MS = 2000;
  var PAGE_ROTATE_MS = 7000;
  var POPUP_SHOW_MS = 5000;
  var REMIND_AFTER_MS = 120000;
  var TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

  var state = {
    data: null,
    error: "",
    page: 0,
    popup: null,
    soundReady: false,
    headerNowMs: null,
  };

  var popupQueue = [];
  var showingPopup = false;
  var lastRemindAt = {};
  var lastSeenCurrentId = {};
  var lastSeenNextId = {};

  function byId(id) {
    return document.getElementById(id);
  }

  function safeTrim(value) {
    return String(value == null ? "" : value).replace(/^\s+|\s+$/g, "");
  }

  function safeName(value) {
    var s = safeTrim(value);
    return s ? s : "—";
  }

  function pad(n) {
    var x = Number(n) || 0;
    return x < 10 ? "0" + x : String(x);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(
      /[&<>"']/g,
      function (ch) {
        if (ch === "&") return "&amp;";
        if (ch === "<") return "&lt;";
        if (ch === ">") return "&gt;";
        if (ch === '"') return "&quot;";
        return "&#39;";
      },
    );
  }

  function formatTashkentDateTime(ms) {
    if (ms == null) return "—";

    var d = new Date(Number(ms) + TASHKENT_OFFSET_MS);
    if (isNaN(d.getTime())) return "—";

    return (
      pad(d.getUTCDate()) +
      "-" +
      pad(d.getUTCMonth() + 1) +
      "-" +
      d.getUTCFullYear() +
      " " +
      pad(d.getUTCHours()) +
      ":" +
      pad(d.getUTCMinutes())
    );
  }

  function getStableQueueItemId(item) {
    if (!item) return "";
    var raw = item.appointmentId || item.orthoQueueId || "";
    return raw ? String(raw) : "";
  }

  function resolveImageUrl(path) {
    var raw = safeTrim(path);
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    return window.location.origin + raw;
  }

  function isDentistBusy(d) {
    return !!(d && d.current);
  }

  function isDentistCallable(d) {
    return !isDentistBusy(d) && !!(d && d.next && d.next.shouldCall);
  }

  function compareDentists(a, b) {
    var aCallable = isDentistCallable(a);
    var bCallable = isDentistCallable(b);

    if (aCallable && !bCallable) return -1;
    if (!aCallable && bCallable) return 1;

    var aBusy = isDentistBusy(a);
    var bBusy = isDentistBusy(b);

    if (aBusy && !bBusy) return -1;
    if (!aBusy && bBusy) return 1;

    var an = safeName(a && a.dentist && a.dentist.name).toLowerCase();
    var bn = safeName(b && b.dentist && b.dentist.name).toLowerCase();

    if (an < bn) return -1;
    if (an > bn) return 1;
    return 0;
  }

  function requestJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
      var text;

      if (xhr.readyState !== 4) return;

      if (xhr.status < 200 || xhr.status >= 300) {
        callback(new Error("HTTP " + xhr.status));
        return;
      }

      text = xhr.responseText || "";

      if (/^\s*</.test(text)) {
        callback(new Error("JSON emas. /__queue_feed proxy hali ishlamayapti"));
        return;
      }

      try {
        callback(null, JSON.parse(text));
      } catch (err) {
        callback(new Error("JSON parse error"));
      }
    };
    xhr.onerror = function () {
      callback(new Error("Network error"));
    };
    xhr.send(null);
  }

  function getAudio() {
    return byId("queueAudio");
  }

  function stopAudio() {
    var a = getAudio();
    if (!a) return;

    try {
      a.pause();
    } catch (e) {}

    try {
      a.currentTime = 0;
    } catch (e2) {}
  }

  function playOnce(done) {
    var a = getAudio();
    if (!a) {
      if (done) done(false);
      return;
    }

    try {
      a.muted = false;
      a.volume = 1;
      a.currentTime = 0;
      var res = a.play();

      if (res && typeof res.then === "function") {
        res.then(
          function () {
            if (done) done(true);
          },
          function () {
            if (done) done(false);
          },
        );
      } else {
        if (done) done(true);
      }
    } catch (e) {
      if (done) done(false);
    }
  }

  function playChime3x(done) {
    playOnce(function (ok) {
      setTimeout(function () {
        playOnce();
      }, 800);

      setTimeout(function () {
        playOnce();
      }, 1600);

      if (done) done(ok);
    });
  }

  function requestFullscreen() {
    var el = document.documentElement;
    var fn =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;

    if (!fn) return;

    try {
      var promise = fn.call(el);
      if (promise && typeof promise.catch === "function") {
        promise.catch(function (err) {
          console.warn("Fullscreen request rejected:", err);
        });
      }
    } catch (e) {}
  }

  function unlockAudioAndFullscreen() {
    playChime3x(function (ok) {
      stopAudio();
      state.soundReady = !!ok;
      renderUnlock();
    });

    requestFullscreen();
  }

  function enqueuePopup(item, urgent) {
    var i;
    var current = state.popup;

    if (!item || !item.dentistId) return;

    for (i = 0; i < popupQueue.length; i += 1) {
      if (
        popupQueue[i].dentistId === item.dentistId &&
        popupQueue[i].queueNo === item.queueNo &&
        popupQueue[i].patientName === item.patientName
      ) {
        return;
      }
    }

    if (
      current &&
      current.dentistId === item.dentistId &&
      current.queueNo === item.queueNo &&
      current.patientName === item.patientName
    ) {
      return;
    }

    if (urgent) popupQueue.unshift(item);
    else popupQueue.push(item);
  }

  function processPopupSignals(dentists) {
    var now = new Date().getTime();
    var i;
    var d;
    var dentistId;
    var currentId;
    var nextId;
    var prevCurrentId;
    var prevNextId;
    var canCallNow;
    var justFinished;
    var nextChangedWhileIdle;
    var popupData;
    var last;

    for (i = 0; i < dentists.length; i += 1) {
      d = dentists[i];
      dentistId = String((d && d.dentist && d.dentist.id) || "");
      if (!dentistId) continue;

      currentId = getStableQueueItemId(d && d.current);
      nextId = getStableQueueItemId(d && d.next);

      prevCurrentId = lastSeenCurrentId[dentistId] || "";
      prevNextId = lastSeenNextId[dentistId] || "";

      lastSeenCurrentId[dentistId] = currentId;
      lastSeenNextId[dentistId] = nextId;

      canCallNow =
        !currentId && !!nextId && !!(d && d.next && d.next.shouldCall);
      justFinished = !!prevCurrentId && canCallNow;
      nextChangedWhileIdle = canCallNow && nextId !== prevNextId;

      popupData = {
        dentistId: dentistId,
        dentistName: safeName(d && d.dentist && d.dentist.name),
        queueNo: d && d.next && d.next.queueNo != null ? d.next.queueNo : "—",
        patientName: safeName(
          d && d.next && d.next.patient && d.next.patient.name,
        ),
      };

      if (justFinished || nextChangedWhileIdle) {
        enqueuePopup(popupData, true);
        lastRemindAt[dentistId] = now;
      }

      if (canCallNow) {
        last = lastRemindAt[dentistId] || 0;
        if (now - last >= REMIND_AFTER_MS) {
          enqueuePopup(popupData, false);
          lastRemindAt[dentistId] = now;
        }
      } else {
        lastRemindAt[dentistId] = 0;
      }
    }
  }

  function fetchQueue() {
    requestJSON(
      QUEUE_FEED_URL + "?_=" + String(new Date().getTime()),
      function (err, json) {
        var dentists;

        if (err) {
          state.error = err.message || "Network error";
          renderError();
          return;
        }

        if (!json || !json.success) {
          state.error = (json && json.message) || "Backend error";
          renderError();
          return;
        }

        dentists =
          Object.prototype.toString.call(json.dentists) === "[object Array]"
            ? json.dentists.slice()
            : [];

        processPopupSignals(dentists);
        dentists.sort(compareDentists);

        state.data = {
          day: json.day,
          serverTimeMs: json.serverTimeMs,
          dentists: dentists,
          snapshotHash: json.snapshotHash || "",
        };

        state.headerNowMs =
          json.serverTimeMs == null ? null : Number(json.serverTimeMs);

        if (state.page >= getTotalPages()) {
          state.page = 0;
        }

        state.error = "";
        renderAll();
      },
    );
  }

  function getTotalPages() {
    var len =
      state.data && state.data.dentists ? state.data.dentists.length : 0;
    return Math.max(1, Math.ceil(len / DENTISTS_PER_PAGE));
  }

  function getPageDentists() {
    var list = state.data && state.data.dentists ? state.data.dentists : [];
    var start = state.page * DENTISTS_PER_PAGE;
    return list.slice(start, start + DENTISTS_PER_PAGE);
  }

  function renderHeader() {
    byId("headerTime").innerHTML = escapeHtml(
      formatTashkentDateTime(state.headerNowMs),
    );
  }

  function renderUnlock() {
    var bar = byId("unlockBar");
    if (!bar) return;
    bar.style.display = state.soundReady ? "none" : "block";
  }

  function renderError() {
    var el = byId("errorBanner");
    if (!el) return;

    if (!state.error) {
      el.style.display = "none";
      el.innerHTML = "";
      return;
    }

    el.style.display = "block";
    el.innerHTML = "Xatolik: " + escapeHtml(state.error);
  }

  function renderPager() {
    var total = getTotalPages();
    var html = "";
    var i;

    for (i = 0; i < total; i += 1) {
      html +=
        '<div class="pager-dot' +
        (i === state.page ? " active" : "") +
        '"></div>';
    }

    byId("pager").innerHTML = html;
  }

  function renderRows() {
    var rowsEl = byId("rows");
    var dentists = getPageDentists();
    var html = "";
    var i;
    var d;
    var dentistName;
    var dentistImage;
    var currentQueueNo;
    var currentPatientName;
    var nextQueueNo;
    var nextPatientName;
    var isBusy;
    var isCallable;
    var hasNext;
    var statusClass;
    var statusText;
    var nextCaption;
    var imageHtml;

    if (!state.data) {
      rowsEl.innerHTML = '<div class="empty-card">Yuklanmoqda...</div>';
      return;
    }

    if (!dentists.length) {
      rowsEl.innerHTML =
        '<div class="empty-card">Hozircha navbat ma’lumoti yo‘q.</div>';
      return;
    }

    for (i = 0; i < dentists.length; i += 1) {
      d = dentists[i];
      dentistName = safeName(d && d.dentist && d.dentist.name);
      dentistImage = resolveImageUrl(d && d.dentist && d.dentist.image);

      currentQueueNo =
        d && d.current && d.current.queueNo != null
          ? "#" + d.current.queueNo
          : "—";
      currentPatientName =
        d && d.current && d.current.patient && d.current.patient.name
          ? safeName(d.current.patient.name)
          : "";

      nextQueueNo =
        d && d.next && d.next.queueNo != null ? "#" + d.next.queueNo : "—";
      nextPatientName =
        d && d.next && d.next.patient && d.next.patient.name
          ? safeName(d.next.patient.name)
          : "";

      isBusy = isDentistBusy(d);
      isCallable = isDentistCallable(d);
      hasNext = !!(d && d.next);

      statusClass = "status-empty";
      statusText = "BO‘SH";

      if (isBusy) {
        statusClass = "status-busy";
        statusText = "QABULDA";
      } else if (isCallable) {
        statusClass = "status-callable";
        statusText = "NAVBAT BOR";
      } else if (hasNext) {
        statusClass = "status-waiting";
        statusText = "BAND";
      }

      nextCaption = "";
      if (hasNext && isCallable) nextCaption = "Keyingi";
      else if (hasNext) nextCaption = "Navbat kutmoqda";

      imageHtml = dentistImage
        ? '<img class="doctor-avatar" src="' +
          escapeHtml(dentistImage) +
          '" alt="" onerror="this.outerHTML=\'<span class=&quot;doctor-avatar-placeholder&quot;></span>\'" />'
        : '<span class="doctor-avatar-placeholder"></span>';

      html +=
        '<div class="queue-row' +
        (isCallable ? " callable" : "") +
        '">' +
        '<div class="doctor-cell">' +
        imageHtml +
        '<div class="doctor-meta">' +
        '<div class="doctor-name">' +
        escapeHtml(dentistName) +
        "</div>" +
        '<span class="status-chip ' +
        statusClass +
        '">' +
        escapeHtml(statusText) +
        "</span>" +
        "</div>" +
        "</div>" +
        '<div class="slot-cell">' +
        '<div class="slot-name' + (isBusy ? " slot-name-current" : "") + '">' +
        escapeHtml(currentPatientName || "—") +
        "</div>" +
        '<div class="slot-caption">' +
        (isBusy ? "Qabulda" : "") +
        "</div>" +
        "</div>" +
        '<div class="slot-cell">' +
        '<div class="slot-name' + (hasNext ? " slot-name-next" : "") + '">' +
        escapeHtml(nextPatientName || "—") +
        "</div>" +
        '<div class="slot-caption">' +
        escapeHtml(nextCaption) +
        "</div>" +
        "</div>" +
        "</div>";
    }

    rowsEl.innerHTML = html;
  }

  function renderPopup() {
    var overlay = byId("popupOverlay");

    if (!state.popup) {
      overlay.style.display = "none";
      return;
    }

    byId("popupQueueNo").innerHTML = "#" + escapeHtml(state.popup.queueNo);
    byId("popupPatientName").innerHTML = escapeHtml(state.popup.patientName);
    byId("popupDentistName").innerHTML = escapeHtml(state.popup.dentistName);
    overlay.style.display = "flex";
  }

  function renderAll() {
    renderHeader();
    renderUnlock();
    renderError();
    renderRows();
    renderPager();
    renderPopup();
  }

  function startPopupLoop() {
    setInterval(function () {
      var nextItem;

      if (showingPopup) return;

      nextItem = popupQueue.shift();
      if (!nextItem) return;

      showingPopup = true;
      state.popup = nextItem;
      renderPopup();

      playChime3x(function (ok) {
        state.soundReady = !!ok;
        renderUnlock();
      });

      setTimeout(function () {
        state.popup = null;
        renderPopup();
        showingPopup = false;
      }, POPUP_SHOW_MS);
    }, 250);
  }

  function startClock() {
    setInterval(function () {
      if (state.headerNowMs == null) return;
      state.headerNowMs += 1000;
      renderHeader();
    }, 1000);
  }

  function startPageRotate() {
    setInterval(function () {
      var total = getTotalPages();
      state.page = state.page + 1 >= total ? 0 : state.page + 1;
      renderRows();
      renderPager();
    }, PAGE_ROTATE_MS);
  }

  function bindUnlock() {
    var btn = byId("unlockBtn");

    function onceUnlock() {
      unlockAudioAndFullscreen();
      document.removeEventListener("click", onceUnlock);
      document.removeEventListener("touchstart", onceUnlock);
      document.removeEventListener("keydown", onceUnlock);
    }

    if (btn) {
      btn.onclick = function () {
        unlockAudioAndFullscreen();
      };
    }

    document.addEventListener("click", onceUnlock);
    document.addEventListener("touchstart", onceUnlock);
    document.addEventListener("keydown", onceUnlock);
  }

  function bindFullscreenButton() {
    var btn = byId("fullscreenBtn");
    if (!btn) return;

    btn.onclick = function () {
      unlockAudioAndFullscreen();
    };
  }

  function boot() {
    renderAll();
    bindUnlock();
    bindFullscreenButton();
    startClock();
    startPopupLoop();
    startPageRotate();
    fetchQueue();
    setInterval(fetchQueue, FETCH_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
