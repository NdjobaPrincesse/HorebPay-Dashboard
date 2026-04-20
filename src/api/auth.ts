import { ApiService } from './services';

export const login = async (userName: string, password: string) => {
  console.log("Attempting login...");

  const response = await ApiService.auth.login({
    userName: userName,
    password: password 
  });

  console.log("Login Response:", response.data);

  // 1. EXTRACT USER ID
  const { userId, token, accessToken, message } = response.data;
  const authToken = token || accessToken;

  if (userId || response.status === 200) {
    const validId = userId || 'unknown-id';
    
    // 2. STORE AS CLIENT INITIATOR (Crucial Step)
    // This allows services.ts to read it later for recharges/deposits
    localStorage.setItem('clientInitiator', validId); 
    
    // Store standard auth flags
    localStorage.setItem('userId', validId);
    if (authToken) {
      localStorage.setItem('token', authToken);
    }
    localStorage.setItem('user', JSON.stringify({ userName, userId: validId }));
    
    return response.data;
  } 
  
  throw new Error(message || "Login failed.");
};

export const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('userId');
};
