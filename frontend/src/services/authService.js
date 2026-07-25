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

const updateProfile = async (payload) => {
  const response = await api.patch(
    "/auth/profile/",
    payload
  );

  return response.data;
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
};

export default authService;