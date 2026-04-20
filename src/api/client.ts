import api from './axios';
// --- THIS LINE FIXES THE "Client is a type" ERROR ---
import type { Client } from '../types'; 
import { extractCollection } from './response';

export const getClients = async () => {
  const response = await api.get<Client[] | any>('/clients');
  return extractCollection<Client>(response.data);
};
