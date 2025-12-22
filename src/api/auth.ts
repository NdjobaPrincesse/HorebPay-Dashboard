import api from './axios';

// Update function signature to be clear
export const login = async (email: string, motDePasse: string) => {
  
  // POST to /api/auth/login (which proxies to /horeb/api/auth/login)
  const response = await api.post('/auth/login', {
    // USE THE FRENCH KEYS REQUIRED BY BACKEND
    email: email,       
    motDePasse: motDePasse 
  });

  const { token, user } = response.data;

  if (token) {
    localStorage.setItem('token', token);
    // Create a user object if backend doesn't send one
    localStorage.setItem('user', JSON.stringify(user || { email: email }));
  }

  return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};