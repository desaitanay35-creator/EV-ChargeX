import api from "./api";

const login = async (credentials) => {
  const response = await api.post(
    "/auth/login/",
    credentials
  );

  return response.data;
};

const register = async (userData) => {
  const response = await api.post(
    "/auth/register/",
    userData
  );

  return response.data;
};

const getProfile = async () => {
  const response = await api.get(
    "/auth/profile/"
  );

  return response.data;
};

const authService = {
  login,
  register,
  getProfile,
};

export default authService;