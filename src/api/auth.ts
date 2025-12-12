// src/api/auth.ts

// 1. LOGIN FUNCTION
export const login = async (email: string, password: string) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email.length > 0 && password.length > 0) {
                const mockToken = "fake-jwt-token-123456";
                localStorage.setItem('token', mockToken);
                resolve({ token: mockToken });
            } else {
                reject(new Error("Invalid credentials"));
            }
        }, 1000);
    });
};

// 2. LOGOUT FUNCTION
export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};

// 3. AUTH CHECK FUNCTION
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};