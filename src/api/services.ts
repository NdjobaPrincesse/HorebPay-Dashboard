import api  from './axios';
import { APP_CONFIG } from '../config';

// Helper to get client initiator
const getInitiator = () => {
  return (
    localStorage.getItem('clientInitiator') ||
    localStorage.getItem('userId') ||
    APP_CONFIG.CLIENT_INITIATOR
  );
};

export const ApiService = {
  auth: {
    login: (payload: any) => api.post('/auth/login', payload),
  },

  dashboard: {
    getTransactions: () => api.get('/transactions'),
    getClients: () => api.get('/clients'),
  },

  enterprise: {
    getAll: () => api.get('/entreprise'),

    recharge: (data: { entrepriseId: string; montant: number; masterSecret: string }) => {
      const payload = {
        clientInitiatorId: getInitiator(),
        entrepriseId: data.entrepriseId,
        masterSecret: data.masterSecret,
        montant: data.montant,
      };
      console.log('Recharge Payload:', payload);
      return api.post('/transactions/wallet/entreprise/recharge', payload);
    },

    update: (id: string, payload: any) => {
      // Ensure clientInitiatorId is always sent
      const fullPayload = { ...payload, clientInitiatorId: getInitiator() };
      console.log(`Updating enterprise ${id} with payload:`, fullPayload);
      return api.put(`/entreprise/${id}`, fullPayload);
    },

    delete: (id: string) => api.delete(`/entreprise/${id}`),
  },

  transactions: {
    getConfig: () => api.get('/money-transfer-config'),
    deposit: (payload: any) => api.post('/transactions/deposit', payload),
  },
};