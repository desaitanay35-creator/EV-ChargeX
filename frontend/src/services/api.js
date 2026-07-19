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
  const data = error.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (data?.detail || data?.message || data?.error) {
    return data.detail || data.message || data.error;
  }

  if (data && typeof data === "object") {
    const firstError = Object.values(data)[0];

    if (Array.isArray(firstError)) {
      return firstError[0];
    }

    if (typeof firstError === "string") {
      return firstError;
    }
  }

  if (error.code === "ERR_NETWORK") {
    return "Cannot reach the EV-ChargeX backend. Start Django on port 8000.";
  }

  return fallback;
};

export default api;
