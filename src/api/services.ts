import api from './axios';
import { APP_CONFIG } from '../config';

const getInitiator = () => {
  return localStorage.getItem('clientInitiator') || localStorage.getItem('userId') || APP_CONFIG.CLIENT_INITIATOR;
};

export const ApiService = {
  auth: { login: (p: any) => api.post('/auth/login', p) },
  dashboard: { getTransactions: () => api.get('/transactions'), getClients: () => api.get('/clients') },

  enterprise: {
    getAll: () => api.get('/entreprise'), 

   
    recharge: (data: { entrepriseId: string; montant: number; masterSecret: string }) => {
      
      const payload = {
        clientInitiatorId: getInitiator(), 
        entrepriseId: data.entrepriseId,
        masterSecret: data.masterSecret,
        montant: data.montant
      };

      console.log("Sending Recharge Payload (Fixed):", payload);
      return api.post('/transactions/wallet/entreprise/recharge', payload);
    },

    update: (id: string, payload: any) => api.put(`/entreprise/${id}`, payload),
    delete: (id: string) => api.delete(`/entreprise/${id}`)
  },

  transactions: {
    getConfig: () => api.get('/money-transfer-config'),
    deposit: (p: any) => api.post('/transactions/deposit', p)
  }
};