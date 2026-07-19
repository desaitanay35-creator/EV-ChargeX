import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import authService from "../services/authService";
import {
  clearAuthData,
  getAccessToken,
  getStoredRole,
  getStoredUser,
  saveAuthData,
} from "../utils/token";

export const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(
    getStoredUser()
  );

  const [role, setRole] = useState(
    getStoredRole()
  );

  const [loading, setLoading] = useState(true);

  const login = useCallback(
    async (credentials) => {
      const data = await authService.login(
        credentials
      );

      const authenticatedUser =
        data.user || {
          username: data.username,
          email: data.email,
        };

      const authenticatedRole =
        data.role ||
        authenticatedUser?.role ||
        "USER";

      saveAuthData({
        access: data.access,
        refresh: data.refresh,
        user: authenticatedUser,
        role: authenticatedRole,
      });

      setUser(authenticatedUser);
      setRole(authenticatedRole);

      return {
        user: authenticatedUser,
        role: authenticatedRole,
      };
    },
    []
  );

  const register = useCallback(
    async (userData) => {
      return authService.register(userData);
    },
    []
  );

  const logout = useCallback(() => {
    clearAuthData();
    setUser(null);
    setRole(null);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = getAccessToken();

      if (!accessToken) {
        setLoading(false);
        return;
      }

      if (user) {
        setLoading(false);
        return;
      }

      try {
        const profile =
          await authService.getProfile();

        const profileRole =
          profile.role || role || "USER";

        localStorage.setItem(
          "user",
          JSON.stringify(profile)
        );

        localStorage.setItem(
          "role",
          profileRole
        );

        setUser(profile);
        setRole(profileRole);
      } catch {
        clearAuthData();
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [role, user]);

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(
        getAccessToken()
      ),
    }),
    [
      user,
      role,
      loading,
      login,
      register,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
