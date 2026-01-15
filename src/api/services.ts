import api from './axios';

interface LoginPayload {
  userName: string;
  password: string;
}

export const ApiService = {
  /**
   * AUTHENTICATION
   * Route: /users/login 
   */
  auth: {
    login: (payload: LoginPayload) => api.post('/auth/login', payload),
  },

  /**
   * DASHBOARD 
   * Routes: /api/transactions, /api/clients
   */
  dashboard: {
    getTransactions: () => api.get('/transactions'),
    getClients: () => api.get('/clients'),
  }
};