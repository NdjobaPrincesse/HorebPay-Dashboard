import api from './axios';

export const login = async (email: string, motDePasse: string) => {
  
  // 1. CHANGE THIS URL to '/users/login'
  const response = await api.post('/users/login', {
    email: email,       
    motDePasse: motDePasse 
  });

  const { token, user } = response.data;

  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user || { email }));
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