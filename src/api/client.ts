import api from './axios';
// --- THIS LINE FIXES THE "Client is a type" ERROR ---
import type { Client } from '../types'; 

export const getClients = async () => {
  const response = await api.get<Client[] | any>('/clients');
  
  if (response.data && Array.isArray(response.data.content)) {
    return response.data.content;
  }
  
  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};