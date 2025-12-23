import api from './axios';

export const login = async (userName: string, password: string) => {
  
  // POST to Virtual Path '/auth/login'
  // vercel.json will redirect this to '.../horeb/users/login'
  const response = await api.post('/auth/login', {
    userName: userName, // Exact key required by backend
    password: password 
  });

  const { token, user } = response.data;

  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user || { userName }));
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