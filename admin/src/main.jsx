import { createRoot } from "react-dom/client";
import "./i18n/translator.js";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AdminContextProvider from "./context/AdminContext.jsx";
import DentistContextProvider from "./context/DentistContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AdminContextProvider>
      <DentistContextProvider>
        <App />
      </DentistContextProvider>
    </AdminContextProvider>
  </BrowserRouter>,
);
