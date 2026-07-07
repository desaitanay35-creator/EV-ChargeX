import apiClient from './apiClient';

/**
 * POST /api/auth/login/
 */
export async function login(credentials) {
  try {
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
  } catch (err) {
    console.warn('[authService] Backend unavailable, simulating login:', err.message);
    return {
      token: 'demo-token',
      user: { id: 'u-001', name: 'Rohan Mehta', initials: 'RO', role: 'EV Driver', email: credentials.email },
    };
  }
}

/**
 * POST /api/auth/register/
 */
export async function register(details) {
  try {
    const response = await apiClient.post('/auth/register/', details);
    return response.data;
  } catch (err) {
    console.warn('[authService] Backend unavailable, simulating registration:', err.message);
    return {
      token: 'demo-token',
      user: { id: `u-${Date.now()}`, name: details.name, initials: details.name?.slice(0, 2).toUpperCase(), role: 'EV Driver', email: details.email },
    };
  }
}
