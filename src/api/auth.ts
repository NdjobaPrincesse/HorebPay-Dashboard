import api from './axios';

export const login = async (username: string, password: string) => {
  // Localhost: Hits http://localhost:5173/api/auth/login -> Proxy -> Prod
  const response = await api.post('/auth/login', {
    username,
    password,
  });

  const { token, user } = response.data;

  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user || { username }));
  }

  return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

// --- ADD THIS FUNCTION ---
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token; // Returns true if token exists
};