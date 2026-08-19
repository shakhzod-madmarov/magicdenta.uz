import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  const [dentists, setDentists] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(null);

  const getDentistsData = useCallback(async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/dentist/list");
      if (data.success) {
        setDentists(data.dentists);
      } else {
        toast.error(data.message || "Dentists load error");
      }
    } catch (error) {
      toast.error(error?.message || "Server error");
    }
  }, [backendUrl]);

  const getUserProfile = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/user/profile",
        { headers: { token } },
      );

      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message || "Akkauntni yuklab bo‘lmadi");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Akkauntni yuklab bo‘lmadi");
    }
  };

  useEffect(() => {
    getDentistsData();
  }, [getDentistsData]);

  useEffect(() => {
    if (token) {
      getUserProfile();
    } else {
      setUserData(false);
    }
  }, [token]);

  const value = {
    dentists,
    getDentistsData,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    getUserProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;  
