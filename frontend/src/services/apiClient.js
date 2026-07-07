import axios from 'axios';

// Base URL for the Django REST backend.
// Override at build time with VITE_API_BASE_URL in a .env file.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach auth token (if present) to every request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ev_chargex_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Central error handling, so calling code can just try/catch and read err.message.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail || error.response?.data?.message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
