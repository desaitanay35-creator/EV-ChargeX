import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
} from "react-router-dom";

import {
  ToastContainer,
} from "react-toastify";

import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import AuthProvider from "./context/AuthContext";
import "./styles/global.css";
import "./styles/pages.css";

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
