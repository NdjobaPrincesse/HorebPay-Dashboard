// src/types/index.ts

// 1. Transaction Interface
export interface Transaction {
  id: string;
  amount: number;
  date: string;
  type: string;  
  status: string; 
  clientName?: string; 
}

// 2. Client Interface (for the Table)
export interface ClientRow {
  id: string;
  
  // Display fields (Masked)
  displayClient: string;
  displayPhone: string;
  displayEmail: string;
  
  // Logic fields (Raw data)
  _rawClient: string;
  _rawPhone: string;
  _rawEmail: string;
  
  status: string;
  balance: number;
}