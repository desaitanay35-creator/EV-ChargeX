import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, api } from './utils/api';
import { 
  Zap, Car, MapPin, Calendar, Clock, CreditCard, Bell, 
  User as UserIcon, LogOut, Menu, X, BarChart3, AlertCircle, CheckCircle2 
} from 'lucide-react';

// Import Pages (we will create these next)
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Trips from './pages/Trips';
import Bookings from './pages/Bookings';
import ChargingSessionPage from './pages/ChargingSession';
import Payments from './pages/Payments';
import Login from './pages/Login';
import Register from './pages/Register';

// Simple Alert Toast component
export const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 20px',
      borderRadius: '12px',
      background: 'rgba(18, 20, 28, 0.95)',
      border: `1px solid ${type === 'success' ? 'var(--color-primary)' : 'var(--color-danger)'}`,
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(10px)',
      color: '#ffffff',
      animation: 'slideUp 0.3s ease-out'
    }}>
      {type === 'success' ? (
        <CheckCircle2 size={20} color="var(--color-primary)" />
      ) : (
        <AlertCircle size={20} color="var(--color-danger)" />
      )}
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: '1rem'
      }}>
        <X size={16} />
      </button>
    </div>
  );
};

// Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = auth.isAuthenticated();
  const user = auth.getUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App Layout with Navigation and Sidebar
const MainLayout = ({ children, onLogout, unreadCount, setUnreadCount }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const user = auth.getUser();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3, roles: ['USER', 'OPERATOR', 'ADMIN'] },
    { name: 'Vehicles', path: '/vehicles', icon: Car, roles: ['USER', 'ADMIN'] },
    { name: 'Trips', path: '/trips', icon: MapPin, roles: ['USER', 'ADMIN'] },
    { name: 'Bookings', path: '/bookings', icon: Calendar, roles: ['USER', 'OPERATOR', 'ADMIN'] },
    { name: 'Charging', path: '/charging', icon: Clock, roles: ['USER', 'OPERATOR', 'ADMIN'] },
    { name: 'Payments', path: '/payments', icon: CreditCard, roles: ['USER', 'ADMIN'] },
  ];

  const fetchNotifications = async () => {
    if (!auth.isAuthenticated()) return;
    try {
      const data = await api('/notifications/');
      // Sort notifications by created_at desc
      const sorted = (data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(sorted);
      setUnreadCount(sorted.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => api(`/notifications/${n.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_read: true })
      })));
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar for Desktop */}
      <aside className="glass-panel" style={{
        margin: '20px 0 20px 20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'calc(100vh - 40px)',
        position: 'sticky',
        top: '20px',
        zIndex: 100,
        width: '240px',
        left: 0
      }}>
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--color-primary), #059669)',
              padding: '8px',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-neon)'
            }}>
              <Zap size={24} color="#042f1a" />
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px', color: '#ffffff' }}>EV-ChargeX</span>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Optimizer</div>
            </div>
          </div>

          {/* Nav Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {menuItems
              .filter(item => item.roles.includes(user.role))
              .map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: isActive ? '#ffffff' : 'var(--text-muted)',
                      background: isActive ? 'var(--color-primary-glow)' : 'transparent',
                      border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent'}`,
                      fontWeight: isActive ? 600 : 500,
                      transition: 'var(--transition)'
                    }}
                    className={isActive ? 'glow-active' : ''}
                  >
                    <Icon size={18} color={isActive ? 'var(--color-primary)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.95rem' }}>{item.name}</span>
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* User Card */}
        <div style={{
          borderTop: '1px solid var(--border-glass)',
          paddingTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--color-primary-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-glass-hover)'
            }}>
              <UserIcon size={18} color="var(--color-primary)" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user.username}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.85rem',
              transition: 'var(--transition)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        {/* Header bar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 40px',
          borderBottom: '1px solid var(--border-glass)',
          background: 'rgba(10, 11, 16, 0.4)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {location.pathname.substring(1).toUpperCase() || 'DASHBOARD'}
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Welcome back, Tanay Desai</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
            {/* Notification Bell */}
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markAllAsRead();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                padding: '8px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition)'
              }}
            >
              <Bell size={18} color="var(--text-main)" />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'var(--color-danger)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 10px var(--color-danger)'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="glass-panel" style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                width: '320px',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 200,
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                  <h3 style={{ fontSize: '0.95rem' }}>Notifications</h3>
                  <button 
                    onClick={() => setShowNotifications(false)} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                    No notifications yet.
                  </p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: n.is_read ? 'transparent' : 'rgba(16, 185, 129, 0.05)',
                      borderLeft: `3px solid ${n.notification_type === 'PAYMENT' ? 'var(--color-secondary)' : 'var(--color-primary)'}`,
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span>{n.title}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isAuthenticated());
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [unreadCount, setUnreadCount] = useState(0);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(auth.isAuthenticated());
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleLogin = (accessToken, refreshToken) => {
    auth.saveTokens(accessToken, refreshToken);
    setIsAuthenticated(true);
    showToast('Logged in successfully!');
  };

  const handleLogout = () => {
    auth.clearTokens();
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? <Login onLogin={handleLogin} showToast={showToast} /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="/register" element={
          !isAuthenticated ? <Register showToast={showToast} /> : <Navigate to="/dashboard" replace />
        } />
        
        {/* Protected Dashboard Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <MainLayout onLogout={handleLogout} unreadCount={unreadCount} setUnreadCount={setUnreadCount}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard showToast={showToast} />} />
                <Route path="/vehicles" element={<Vehicles showToast={showToast} />} />
                <Route path="/trips" element={<Trips showToast={showToast} />} />
                <Route path="/bookings" element={<Bookings showToast={showToast} />} />
                <Route path="/charging" element={<ChargingSessionPage showToast={showToast} />} />
                <Route path="/payments" element={<Payments showToast={showToast} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
      
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage(null)} 
        />
      )}
    </BrowserRouter>
  );
}
