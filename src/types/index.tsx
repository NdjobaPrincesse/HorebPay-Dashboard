// src/types/index.ts

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  type: string;
  status: string;
  clientName: string;
  
  // NEW DETAILED FIELDS
  txRef: string;        // transactionsId
  payerPhone: string;   // numeroPayeur
  receiverPhone: string; // numeroRecepteur
  method: string;       // methodePaiementNom (ORANGE_MONEY)
  operator: string;     // operateurNom (CAMEROON_MTN)
  errorMessage?: string | null;
}

export interface ClientRow {
  // ... (Keep existing client fields)
  id: string;
  displayClient: string;
  displayPhone: string;
  displayEmail: string;
  _rawClient: string;
  _rawPhone: string;
  _rawEmail: string;
  date: string;
  balance: number;
  status: string;
}