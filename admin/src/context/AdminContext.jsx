import { createContext, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const ConfirmDialog = ({
  open,
  title = "Tasdiqlash",
  message = "",
  confirmText = "Tasdiqlash",
  cancelText = "Bekor qilish",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border">
        <div className="p-5 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-700 whitespace-pre-line">{message}</p>
        </div>
        <div className="p-5 pt-0 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 text-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  const [aToken, setAToken] = useState(localStorage.getItem("aToken") || "");
  const [dentists, setDentists] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const authHeader = { headers: { atoken: aToken } };

  const confirmResolverRef = useRef(null);

  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Tasdiqlash",
    cancelText: "Bekor qilish",
  });

  const confirmAsync = ({
    title = "Tasdiqlash",
    message = "",
    confirmText = "Tasdiqlash",
    cancelText = "Bekor qilish",
  }) => {
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmState({
        open: true,
        title,
        message,
        confirmText,
        cancelText,
      });
    });
  };

  const closeConfirm = (result) => {
    setConfirmState((s) => ({ ...s, open: false }));
    const resolve = confirmResolverRef.current;
    confirmResolverRef.current = null;
    if (resolve) resolve(result);
  };

  const loginAdmin = async (email, password) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/login`, {
        email,
        password,
      });

      if (!data?.success) {
        toast.error(data?.message || "Login xatolik");
        return false;
      }

      localStorage.setItem("aToken", data.token);
      setAToken(data.token);
      toast.success("Admin muvaffaqiyatli tizimga kirdi");
      return true;
    } catch (error) {
      toast.error(error?.message || "Admin login xatolik");
      return false;
    }
  };

  const getAllDentists = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/all-dentists`,
        authHeader,
      );
      if (data.success) setDentists(data.dentists || []);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error?.message || "Stomatologlarni yuklashda xatolik");
    }
  };

  const changeDentistAvailability = async (dentistId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/change-availability`,
        { dentistId },
        authHeader,
      );
      if (data.success) {
        toast.success(data.message);
        getAllDentists();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error?.message || "Holatni yangilashda xatolik");
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/appointments`,
        authHeader,
      );
      if (data.success) setAppointments(data.appointments || []);
      else toast.error(data.message);
    } catch {
      toast.error("Uchrashuvlarni yuklashda xatolik");
    }
  };

  const confirmAppointmentArrival = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/appointments/confirm-arrival`,
        { appointmentId },
        authHeader,
      );

      if (!data?.success) {
        toast.error(data?.message || "Kelish tasdiqlanmadi");
        return { ok: false };
      }

      toast.success("Bemor bugun qabul qilindi");
      return { ok: true };
    } catch (error) {
      toast.error("Kelish tasdiqlashda xatolik");
      return { ok: false };
    }
  };

  const confirmTreatmentPayment = async (treatmentId, payload = {}) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/confirm-treatment-payment/${treatmentId}`,
        payload,
        authHeader,
      );
      if (!data?.success) {
        toast.error(data?.message || "To‘lov tasdiqlanmadi");
        return { ok: false, message: data?.message };
      }
      toast.success(data.message || "To‘lov tasdiqlandi");
      return { ok: true };
    } catch (e) {
      toast.error("Tasdiqlashda xatolik");
      return { ok: false, message: e?.response?.data?.message || e?.message };
    }
  };

  const changeTreatmentAmount = async (treatmentId, payload = {}) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/change-treatment-amount/${treatmentId}`,
        payload,
        authHeader,
      );

      if (!data?.success) {
        toast.error(data?.message || "Summani o‘zgartirib bo‘lmadi");
        return { ok: false, message: data?.message };
      }

      toast.success(data.message || "Qabul summasi yangilandi");
      return { ok: true, treatment: data.treatment };
    } catch (e) {
      toast.error("Summani o‘zgartirishda xatolik");
      return { ok: false, message: e?.response?.data?.message || e?.message };
    }
  };

  const getLiveDentistsStatus = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/dentists/live-status`,
        authHeader,
      );
      if (data.success) return data.dentists || [];
      toast.error(data.message);
      return [];
    } catch {
      toast.error("Live stomatologlar yuklanmadi");
      return [];
    }
  };

  const assignWalkIn = async (payload) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/walkin/assign`,
        payload,
        authHeader,
      );

      if (!data?.success && data?.code === "HAS_TODAY_APPOINTMENT") {
        const dentistName = data?.existing?.dentistName || "boshqa stomatolog";
        const slotTime = data?.existing?.slotTime || "—";

        const ok = await confirmAsync({
          title: "Uchrashuvni ko‘chirish?",
          message:
            `Bu bemor bugun ${dentistName} ga ${slotTime} da yozilgan.\n\n` +
            `Hozirgi stomatologga va hozirgi vaqtga ko‘chirishni tasdiqlaysizmi?`,
          confirmText: "Ha, ko‘chirish",
          cancelText: "Yo‘q",
        });

        if (!ok) return data;

        const { data: forced } = await axios.post(
          `${backendUrl}/api/admin/walkin/assign`,
          { ...payload, forceChange: true },
          authHeader,
        );

        if (forced?.success) toast.success(forced.message || "Ko‘chirildi");
        else toast.error(forced?.message || "Ko‘chirishda xatolik");

        return forced;
      }

      if (data?.success) toast.success(data.message || "Jonli yuborildi");
else toast.error(data?.message || "Jonli Yuborishda xatolik");

return data;
} catch (error) {
  toast.error("Jonli Yuborishda xatolik");
  return { success: false, message: "Jonli Yuborishda xatolik" };
}
  };

  const createPatient = async (payload = {}, options = {}) => {
    const { silent = false } = options || {};

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/patients/create`,
        payload,
        authHeader,
      );

      if (!data?.success) {
        if (!silent) toast.error(data?.message || "Bemor yaratilmadi");
        return data || { success: false };
      }

      if (!silent) toast.success(data?.message || "Bemor yaratildi");
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message || "Bemor yaratishda xatolik";
      if (!silent) toast.error(message);
      return { success: false, message };
    }
  };

  const lookupPatient = async (params) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/patients/lookup`,
        {
          params,
          headers: { atoken: aToken },
        },
      );
      return data;
    } catch {
      return { success: false, message: "Bemor qidirishda xatolik" };
    }
  };

  const getAdminCalendarAvailability = async (dentistId, fromDate, days = 7) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/calendar-availability`,
        {
          params: { dentistId, fromDate, days },
          headers: { atoken: aToken },
        }
      );
      return data;
    } catch {
      return { success: false, message: "Kalendar yuklanmadi" };
    }
  };

  const createAdminManualAppointment = async (payload) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/manual-appointments`,
        payload,
        authHeader
      );
      if (data?.success) {
        toast.success(data.message);
      } else {
        toast.error(data?.message || "Qabul yaratib bo'lmadi");
      }
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || "Qabul yaratishda xatolik";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const cancelAdminAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/appointments/${appointmentId}/cancel`,
        {},
        authHeader
      );
      return { ok: data?.success, message: data?.message };
    } catch (error) {
      const msg = error?.response?.data?.message || "Uchrashuvni bekor qilishda xatolik";
      toast.error(msg);
      return { ok: false, message: msg };
    }
  };

  const value = {
    backendUrl,
    aToken,
    setAToken,
    loginAdmin,
    dentists,
    appointments,
    getAllDentists,
    getAllAppointments,
    changeDentistAvailability,
    confirmAppointmentArrival,
    confirmTreatmentPayment,
    changeTreatmentAmount,
    getLiveDentistsStatus,
    assignWalkIn,
    lookupPatient,
    createPatient,
    getAdminCalendarAvailability,
    createAdminManualAppointment,
    cancelAdminAppointment,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        onCancel={() => closeConfirm(false)}
        onConfirm={() => closeConfirm(true)}
      />
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;