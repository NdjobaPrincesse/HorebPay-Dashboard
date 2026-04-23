import { ApiService } from './services';

export const login = async (userName: string, password: string) => {
  console.log("Attempting login...");

  const response = await ApiService.auth.login({
    userName: userName,
    password: password 
  });

  console.log("Login Response:", response.data);

  // 1. EXTRACT USER ID
  const { userId, token, accessToken, message, user, role } = response.data;
  const authToken = token || accessToken;
  const resolvedUserId = userId || user?.id || user?.userId;
  const resolvedRole =
    user?.role ||
    role ||
    response.data?.userRole ||
    response.data?.profile ||
    '';

  if (resolvedUserId || response.status === 200) {
    const validId = resolvedUserId || 'unknown-id';
    
    localStorage.setItem('clientInitiator', validId); 
    localStorage.setItem('userId', validId);
    if (authToken) {
      localStorage.setItem('token', authToken);
    }
    localStorage.setItem(
      'user',
      JSON.stringify({
        ...user,
        userName: user?.username || user?.userName || userName,
        userId: validId,
        role: resolvedRole,
      })
    );
    
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

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const user = getStoredUser();
  const role = String(user?.role || '').toUpperCase();
  return role;
};

export const isAgentUser = () => {
  const role = getUserRole();
  return role.includes('AGENT');
};

export const getDefaultRoute = () => {
  return isAgentUser() ? '/agent' : '/';
};
