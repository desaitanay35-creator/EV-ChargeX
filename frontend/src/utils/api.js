const BASE_URL = 'http://localhost:8000/api';

export const auth = {
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  
  saveTokens: (access, refresh) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Decode token simple helper to save user info
    try {
      const payload = JSON.parse(atob(access.split('.')[1]));
      localStorage.setItem('user_role', payload.role || 'USER');
      localStorage.setItem('username', payload.username || '');
      localStorage.setItem('user_id', payload.user_id || '');
    } catch (e) {
      console.error('Error decoding token', e);
    }
  },

  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (e) {
      return false;
    }
  },

  getUser: () => ({
    username: localStorage.getItem('username'),
    role: localStorage.getItem('user_role'),
    id: localStorage.getItem('user_id')
  })
};

export const api = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = auth.getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      if (endpoint === '/login' || endpoint === '/login/') {
        throw new Error('Invalid username or password.');
      }
      auth.clearTokens();
      window.dispatchEvent(new Event('auth-change'));
      throw new Error('Session expired. Please login again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `API error: ${response.statusText}`);
    }

    // Handles empty responses (e.g. 204 No Content)
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Call failed: ${url}`, error);
    throw error;
  }
};
