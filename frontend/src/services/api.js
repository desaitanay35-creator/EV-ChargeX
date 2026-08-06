import axios from "axios";

import { clearAuthData, getAccessToken } from "../utils/token";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/login/")
    ) {
      clearAuthData();

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export const getApiError = (error, fallback = "Something went wrong.") => {
  const data = error?.response?.data;

  if (!data) {
    if (error?.code === "ERR_NETWORK") {
      return "Cannot reach the EV-ChargeX backend. Start Django on port 8000.";
    }
    return error?.message || fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (data.non_field_errors) {
    return Array.isArray(data.non_field_errors) ? data.non_field_errors.join(" ") : String(data.non_field_errors);
  }

  if (typeof data === "object") {
    const messages = Object.entries(data)
      .map(([field, msgs]) => {
        const text = Array.isArray(msgs) ? msgs.join(", ") : String(msgs);
        return `${field}: ${text}`;
      })
      .join("; ");
    if (messages) return messages;
  }

  return fallback;
};

export default api;
