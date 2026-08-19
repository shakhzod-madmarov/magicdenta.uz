import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DentistContext = createContext();

const DentistContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [earnings, setEarnings] = useState({
    today: null,
    week: null,
    month: null,
  });
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);

  const authHeader = useMemo(() => ({ headers: { dtoken: dToken } }), [dToken]);

  const logoutDentist = useCallback(() => {
    setDToken("");
    localStorage.removeItem("dToken");
    setProfile(null);
    setAppointments([]);
    setPatients([]);
    setTemplates([]);
    setEarnings({ today: null, week: null, month: null });
    setNotifications([]);
    setNotifCount(0);
    setDashboard(null);
  }, []);

  const handleAuthError = useCallback((err) => {
    if (err?.response?.status === 401) {
      logoutDentist();
      return true;
    }
    return false;
  }, [logoutDentist]);

  const loadProfile = async () => {
    if (!dToken) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/dentist/profile`,
        authHeader,
      );
      if (data.success) setProfile(data.dentist);
      else toast.error(data.message);
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error("Stomatolog profilini yuklashda xatolik");
      }
    }
  };

  const loadAppointments = async () => {
    if (!dToken) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/dentist/appointments`,
        authHeader,
      );
      if (data.success) setAppointments(data.appointments || []);
      else toast.error(data.message);
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error("Uchrashuvlarni yuklashda xatolik");
      }
    }
  };

  const loadPatients = async () => {
    if (!dToken) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/dentist/patients`,
        authHeader,
      );
      if (data.success) setPatients(data.patients || []);
      else toast.error(data.message);
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error("Bemorlarni yuklashda xatolik");
      }
    }
  };

  const loadTemplates = async () => {
    if (!dToken) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/dentist/templates`,
        authHeader,
      );
      if (data.success) setTemplates(data.templates || []);
      else toast.error(data.message || "Shablonlarni yuklashda xatolik");
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error("Shablonlarni yuklashda xatolik");
      }
    }
  };

  const saveTemplate = async (payload = {}, templateId = "") => {
    if (!dToken) return { success: false };
    try {
      const method = templateId ? "put" : "post";
      const url = templateId
        ? `${backendUrl}/api/dentist/templates/${templateId}`
        : `${backendUrl}/api/dentist/templates`;

      const { data } = await axios[method](url, payload, authHeader);

      if (!data?.success) {
        toast.error(data?.message || "Shablon saqlanmadi");
        return data || { success: false };
      }

      toast.success(data.message || "Shablon saqlandi");
      await loadTemplates();
      return data;
    } catch (err) {
      if (handleAuthError(err)) return { success: false };
      const message =
        err?.response?.data?.message || "Shablonni saqlashda xatolik";
      toast.error(message);
      return { success: false, message };
    }
  };

  const removeTemplate = async (templateId = "") => {
    if (!dToken) return { success: false };
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/dentist/templates/${templateId}`,
        authHeader,
      );

      if (!data?.success) {
        toast.error(data?.message || "Shablon o‘chirilmadi");
        return data || { success: false };
      }

      toast.success(data.message || "Shablon o‘chirildi");
      await loadTemplates();
      return data;
    } catch (err) {
      if (handleAuthError(err)) return { success: false };
      const message =
        err?.response?.data?.message || "Shablonni o‘chirishda xatolik";
      toast.error(message);
      return { success: false, message };
    }
  };

  const loadEarnings = async () => {
    if (!dToken) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/dentist/earnings-overview`,
        authHeader,
      );
      if (data.success) {
        setEarnings({
          today: data.today,
          week: data.week,
          month: data.month,
        });
      } else {
        toast.error(data.message || "Daromad ma'lumotlarini olishda xatolik");
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error("Daromad ma'lumotlarini yuklashda xatolik");
      }
    }
  };

  const setManualPrice = async (appointmentId, customPrice, note = "") => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/dentist/set-price`,
        { appointmentId, customPrice, note },
        authHeader,
      );

      if (data.success) {
        toast.success(data.message || "Narx belgilandi");
        await loadAppointments();
        await loadEarnings();
        return true;
      } else {
        toast.error(data.message || "Narxni saqlashda xatolik");
        return false;
      }
    } catch (err) {
      if (handleAuthError(err)) return false;
      toast.error(
        err?.response?.data?.message || "Narxni saqlashda xatolik yuz berdi",
      );
      return false;
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/dentist/complete-appointment`,
        { appointmentId },
        authHeader,
      );

      if (data.success) {
        toast.success(data.message);
        await loadAppointments();
        await loadEarnings();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
      }
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/dentist/cancel-appointment`,
        { appointmentId },
        authHeader,
      );

      if (data.success) {
        toast.success(data.message);
        await loadAppointments();
        await loadEarnings();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
      }
    }
  };

  const updateProfile = async (formData) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/dentist/update-profile`,
        formData,
        authHeader,
      );

      if (data.success) {
        toast.success(data.message);
        setProfile(data.dentist);
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (err) {
      if (handleAuthError(err)) return false;
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
      return false;
    }
  };

  const sendPatientToAnotherDentist = async ({
    appointmentId,
    targetDentistId,
    note = "",
  }) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/dentist/send-patient`,
        { appointmentId, targetDentistId, note },
        authHeader,
      );

      if (data.success) {
        toast.success(data.message || "Bemor muvaffaqiyatli yuborildi");
        await loadAppointments();
        return true;
      } else {
        toast.error(data.message || "Bemorni yuborishda xatolik");
        return false;
      }
    } catch (err) {
      if (handleAuthError(err)) return false;
      toast.error(
        err?.response?.data?.message ||
          "Bemorni boshqa shifokorga yuborishda xatolik",
      );
      return false;
    }
  };

  const loadDashboard = async ({ mode = "30d", from = "", to = "" } = {}) => {
    if (!dToken) return;
    try {
      setDashboardLoading(true);
      const params = new URLSearchParams();
      params.append("mode", mode);
      if (mode === "custom") {
        if (from) params.append("from", from);
        if (to) params.append("to", to);
      }
      const { data } = await axios.get(
        `${backendUrl}/api/dentist/dashboard-stats?${params.toString()}`,
        authHeader,
      );

      if (data?.success) {
        setDashboard(data);
      } else {
        toast.error(data?.message || "Dashboard ma'lumotlarini yuklab bo'lmadi");
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error("Dashboard ma'lumotlarini yuklashda xatolik");
      }
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadNotifications = async () => {
    if (!dToken) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/dentist/notifications`,
        authHeader,
      );
      if (!data?.success) return;

      const list = data.notifications || [];
      setNotifications(list);
      setNotifCount(list.length);

      if (list.some((n) => n.type === "PAYMENT_CONFIRMED")) {
        await loadAppointments();
        await loadEarnings();
      }
    } catch (err) {
      handleAuthError(err);
    }
  };

  const markNotificationRead = async (id) => {
    if (!dToken) return;
    try {
      await axios.post(
        `${backendUrl}/api/dentist/notifications/read/${id}`,
        {},
        authHeader,
      );
      await loadNotifications();
    } catch (err) {
      handleAuthError(err);
    }
  };

  const createPatient = async (payload = {}, options = {}) => {
    const { silent = false } = options || {};
    try {
      const { data } = await axios.post(
        `${backendUrl || ""}/api/dentist/patients/create`,
        payload,
        authHeader,
      );

      if (!data?.success) {
        if (!silent) toast.error(data?.message || "Bemor yaratilmadi");
        return data || { success: false };
      }

      if (!silent) toast.success(data?.message || "Bemor yaratildi");
      await loadPatients();
      return data;
    } catch (err) {
      if (handleAuthError(err)) return { success: false };
      const message =
        err?.response?.data?.message || "Bemor yaratishda xatolik";
      if (!silent) toast.error(message);
      return { success: false, message };
    }
  };

  const lookupPatient = async (params) => {
    try {
      const { data } = await axios.get(
        `${backendUrl || ""}/api/dentist/patients/lookup`,
        {
          params,
          ...authHeader,
        },
      );
      return data;
    } catch (err) {
      if (handleAuthError(err)) return { success: false };
      return {
        success: false,
        message: err?.response?.data?.message || "Qidirishda xatolik",
      };
    }
  };

  const assignWalkIn = async (payload) => {
    try {
      const { data } = await axios.post(
        `${backendUrl || ""}/api/dentist/walkin/assign`,
        payload,
        authHeader,
      );

      if (!data?.success) {
        toast.error(data?.message || "Jonli navbatga qo‘shib bo‘lmadi");
        return data || { success: false };
      }

      toast.success(data?.message || "Jonli navbatga qo‘shildi");
      await loadAppointments();
      return data;
    } catch (err) {
      if (handleAuthError(err)) return { success: false };
      const message =
        err?.response?.data?.message || "Jonli navbatga qo‘shishda xatolik";
      toast.error(message);
      return { success: false, message };
    }
  };

  const checkoutVisit = async (payload) => {
    try {
      let body = payload;
      let isMultipart = false;

      if (typeof FormData !== "undefined") {
        if (payload instanceof FormData) {
          body = payload;
          isMultipart = true;
        } else if (payload && typeof payload === "object") {
          const fd = new FormData();
          Object.entries(payload).forEach(([key, val]) => {
            if (key === "xrays" && Array.isArray(val)) {
              val.forEach((file) => {
                if (file) {
                  fd.append("xrays", file);
                  isMultipart = true;
                }
              });
            } else if (val !== undefined && val !== null) {
              fd.append(key, typeof val === "object" ? JSON.stringify(val) : String(val));
            }
          });
          if (isMultipart) {
            body = fd;
          }
        }
      }

      const headers = {
        ...authHeader.headers,
        ...(isMultipart ? { "Content-Type": "multipart/form-data" } : {}),
      };

      const appointmentId =
        body instanceof FormData ? body.get("appointmentId") : payload?.appointmentId;
      const url = appointmentId
        ? `${backendUrl || ""}/api/dentist/checkout/${appointmentId}`
        : `${backendUrl || ""}/api/dentist/checkout`;

      const { data } = await axios.post(url, body, { headers });

      if (!data?.success) {
        toast.error(data?.message || "Qabulni yakunlab bo‘lmadi");
        return { ok: false, message: data?.message };
      }

      toast.success(data?.message || "Qabul muvaffaqiyatli yakunlandi");
      await loadAppointments();
      await loadEarnings();
      return { ok: true, data };
    } catch (err) {
      if (handleAuthError(err)) return { ok: false };
      const message =
        err?.response?.data?.message || "Qabulni yakunlashda xatolik";
      toast.error(message);
      return { ok: false, message };
    }
  };

  const payAppointmentDebt = async ({ appointmentId, payAmount }) => {
    try {
      const { data } = await axios.post(
        `${backendUrl || ""}/api/dentist/pay-debt`,
        { appointmentId, payAmount },
        authHeader,
      );

      if (!data?.success) {
        toast.error(data?.message || "To‘lov qabul qilinmadi");
        return { ok: false, message: data?.message };
      }

      toast.success(data?.message || "To‘lov qabul qilindi");
      await loadAppointments();
      await loadEarnings();
      return { ok: true, data };
    } catch (err) {
      if (handleAuthError(err)) return { ok: false };
      const message =
        err?.response?.data?.message || "To‘lovda xatolik yuz berdi";
      toast.error(message);
      return { ok: false, message };
    }
  };

  useEffect(() => {
    if (!dToken) return;

    loadProfile();
    loadAppointments();
    loadPatients();
    loadTemplates();
    loadEarnings();
    loadNotifications();
    loadDashboard({ mode: "30d" });

    const t = setInterval(() => {
      if (localStorage.getItem("dToken")) {
        loadNotifications();
      }
    }, 30000);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dToken]);

  return (
    <DentistContext.Provider
      value={{
        backendUrl,
        dToken,
        setDToken,
        profile,
        appointments,
        patients,
        templates,
        earnings,
        loadProfile,
        loadAppointments,
        loadPatients,
        loadTemplates,
        saveTemplate,
        removeTemplate,
        loadEarnings,
        setManualPrice,
        completeAppointment,
        cancelAppointment,
        updateProfile,
        sendPatientToAnotherDentist,
        dashboard,
        dashboardLoading,
        loadDashboard,
        notifications,
        notifCount,
        loadNotifications,
        markNotificationRead,
        createPatient,
        lookupPatient,
        assignWalkIn,
        checkoutVisit,
        payAppointmentDebt,
        logoutDentist,
      }}
    >
      {children}
    </DentistContext.Provider>
  );
};

export default DentistContextProvider;
