import api from './axios';

export const login = async (userName: string, password: string) => {
  console.log("Attempting login...");

  const response = await api.post('/auth/login', {
    userName: userName,
    password: password 
  });

  console.log("Response Body:", response.data);
  console.log("Response Headers:", response.headers);

  // 1. Try to find token in JSON Body
  let token = response.data.token || response.data.accessToken || response.data.jwt;

  // 2. Try to find token in Headers (Common in Java Apps)
  if (!token) {
     const authHeader = response.headers['authorization'] || response.headers['Authorization'];
     if (authHeader && authHeader.startsWith('Bearer ')) {
         token = authHeader.substring(7); // Remove 'Bearer '
         console.log("Token found in Headers!");
     }
  }

  // 3. LOGIC DECISION
  if (token) {
    // CASE A: We found a token (Body or Header)
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ userName }));
    return response.data;
  } else {
    // CASE B: No token found, but 200 OK received. 
    // This means it's a COOKIE-BASED login.
    console.log("No token string found. Assuming Cookie/Session Auth.");
    
    // We set a "flag" so our App knows we are logged in.
    // The browser handles the actual cookie security automatically.
    localStorage.setItem('token', 'cookie-session-active'); 
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