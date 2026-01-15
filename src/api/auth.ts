// 1. Import the new Service
import { ApiService } from './services'; 

export const login = async (userName: string, password: string) => {
  console.log("Attempting login for:", userName);

  // 2. Use the Service call
  const response = await ApiService.auth.login({
    userName: userName,
    password: password
  });

  console.log("Login Response:", response.data);

  // Robust Token Detection
  const token = response.data.token || response.data.accessToken || response.data.jwt || response.data.bearerToken;
  const user = response.data.user || response.data.userDetails || { userName };

  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  } else {
    // Check headers if body is empty
    const authHeader = response.headers['authorization'];
    if (authHeader) {
        localStorage.setItem('token', authHeader.replace('Bearer ', ''));
        localStorage.setItem('user', JSON.stringify({ userName }));
        return response.data;
    }
    
    // Cookie Fallback
    console.log("Assuming Cookie Auth");
    localStorage.setItem('token', 'cookie-session');
    localStorage.setItem('user', JSON.stringify({ userName }));
    return response.data;
  }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};