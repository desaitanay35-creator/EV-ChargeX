import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { getUserDashboard, getNotifications } from '../services/userService';

const UserDataContext = createContext(null);

export function UserDataProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshDashboard = useCallback(async () => {
    const data = await getUserDashboard();
    setDashboard(data);
    return data;
  }, []);

  const refreshNotifications = useCallback(async () => {
    const data = await getNotifications();
    setNotifications(data);
    return data;
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await Promise.all([refreshDashboard(), refreshNotifications()]);
      setIsLoading(false);
    })();
  }, [refreshDashboard, refreshNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = {
    dashboard,
    notifications,
    unreadCount,
    isLoading,
    refreshDashboard,
    refreshNotifications,
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used within a UserDataProvider');
  return ctx;
}
