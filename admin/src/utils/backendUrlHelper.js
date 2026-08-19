export const getBackendUrl = () => {
  if (typeof window !== "undefined" && window.location.port === "5000") {
    return window.location.origin;
  }
  const localSaved = localStorage.getItem("clinic_server_ip");
  if (localSaved) {
    return `http://${localSaved}:5000`;
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "";
  }
  return import.meta.env.VITE_BACKEND_URL || "";
};
