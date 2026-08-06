export const saveAuthData = ({
  access,
  refresh,
  user,
  role,
}) => {
  if (access) {
    localStorage.setItem("accessToken", access);
  }

  if (refresh) {
    localStorage.setItem("refreshToken", refresh);
  }

  if (user) {
    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );
  }

  if (role) {
    localStorage.setItem("role", role);
  }
};

export const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const getStoredRole = () => {
  return localStorage.getItem("role");
};

export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

export const clearAuthData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
};