// src/types/index.tsx

// ==============================
// TRANSACTION TYPES
// ==============================

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  type: string;
  status: string;
  clientName: string;
  
  // NEW DETAILED FIELDS
  txRef: string;         // Mapped from: transactionsId
  payerPhone: string;    // Mapped from: numeroPayeur
  receiverPhone: string; // Mapped from: numeroRecepteur
  method: string;        // Mapped from: methodePaiementNom (e.g. ORANGE_MONEY)
  operator: string;      // Mapped from: operateurNom (e.g. CAMEROON_MTN)
  errorMessage?: string | null;
}

// ==============================
// CLIENT TYPES
// ==============================

// The raw data shape coming from the API (Standard)
export interface Client {
  id: number | string;
  firstName?: string;
  lastName?: string;
  name?: string; // Fallback if API sends full name
  email: string;
  phone: string;
  address?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  balance?: number;
  createdAt?: string;
}

// The processed row shape for the Data Table (UI Specific)
export interface ClientRow {
  id: string;
  
  // Visual fields (Formatted for display)
  displayClient: string;
  displayPhone: string;
  displayEmail: string;
  
  // Raw data (Kept for filtering/sorting)
  _rawClient: string;
  _rawPhone: string;
  _rawEmail: string;
  
  date: string;
  balance: number;
  status: string;
}

// ==============================
// API RESPONSE TYPES
// ==============================

export interface ClientResponse {
  // Spring Boot Pageable response support
  content?: Client[]; 
  totalPages?: number;
  totalElements?: number;
  size?: number;
  number?: number;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}