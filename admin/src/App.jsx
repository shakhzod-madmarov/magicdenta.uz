import { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Navbar from "./components/Navbar.jsx";

import { AdminContext } from "./context/AdminContext.jsx";
import { DentistContext } from "./context/DentistContext.jsx";

import Dashboard from "./pages/Admin/Dashboard.jsx"
import AllAppointments from "./pages/Admin/AllAppointments.jsx";
import AddDentist from "./pages/Admin/AddDentist.jsx";
import DentistsList from "./pages/Admin/DentistsList.jsx";
import Treatments from "./pages/Admin/Treatments.jsx";
import Patients from "./pages/Admin/Patients.jsx";
import AddPatient from "./pages/Admin/AddPatient.jsx";
import DentistDetails from "./pages/Admin/DentistDetails.jsx";
import Expenses from "./pages/Admin/Expenses.jsx";
import Warehouse from "./pages/Admin/Warehouse.jsx";
import Payroll from "./pages/Admin/Payroll.jsx";
import AuditLogs from "./pages/Admin/AuditLogs.jsx";
import Settings from "./pages/Admin/Settings.jsx";

import DentistDashboard from "./pages/Dentist/DentistDashboard.jsx";
import DentistAppointments from "./pages/Dentist/DentistAppointments.jsx";
import DentistPatients from "./pages/Dentist/DentistPatients.jsx";
import DentistAddPatient from "./pages/Dentist/DentistAddPatient";
import DentistProfile from "./pages/Dentist/DentistProfile.jsx";
import DentistTemplates from "./pages/Dentist/DentistTemplates.jsx";
import DentistFinance from "./pages/Dentist/DentistFinance.jsx";
import DentistWarehouse from "./pages/Dentist/DentistWarehouse.jsx";

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DentistContext);

  const isLogged = aToken || dToken;

  return isLogged ? (
    <div className="flex flex-col min-h-screen">
      <ToastContainer />
      <Navbar />
      <div className="flex min-h-screen">
        <Routes>
          {aToken && (
            <>
              <Route path="/admin-dashboard" element={<Dashboard />} />
              <Route path="/all-appointments" element={<AllAppointments />} />
              <Route path="/add-dentists" element={<AddDentist />} />
              <Route path="/all-dentists" element={<DentistsList />} />
              <Route path="/all-dentists/:id" element={<DentistDetails />} />
              <Route path="/treatments" element={<Treatments />} />
              <Route path="/admin-patients" element={<Patients />} />
              <Route path="/admin-patients/create" element={<AddPatient />} />
              <Route path="/admin-expenses" element={<Expenses />} />
              <Route path="/admin-warehouse" element={<Warehouse />} />
              <Route path="/admin-payroll" element={<Payroll />} />
              <Route path="/admin-audit-logs" element={<AuditLogs />} />
              <Route path="/admin-settings" element={<Settings />} />
            </>
          )}

          {dToken && (
            <>
              <Route path="/dentist-dashboard" element={<DentistDashboard />} />
              <Route
                path="/dentist-appointments"
                element={<DentistAppointments />}
              />
              <Route path="/dentist-patients" element={<DentistPatients />} />
              <Route
                path="/dentist-patients/create"
                element={<DentistAddPatient />}
              />
              <Route path="/dentist-profile" element={<DentistProfile />} />
              <Route path="/dentist-templates" element={<DentistTemplates />} />
              <Route path="/dentist-finance" element={<DentistFinance />} />
              <Route path="/dentist-warehouse" element={<DentistWarehouse />} />
            </>
          )}

          <Route path="*" element={<></>} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  );
};

export default App;
