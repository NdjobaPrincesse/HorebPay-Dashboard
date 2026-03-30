export interface Transaction {
  id: string;
  txRef: string;
  date: string;
  clientName: string;
  clientId: string;
  operator: string;
  product: string;
  paymentMethod: string;
  payerPhone: string;
  receiverPhone: string;
  amount: number;
  serviceFee: number;
  bonus: number; 
  paymentStatus: string; 
  txStatus: string;
  errorMessage?: string | null;
}

export interface Client {
  clientId: string;              // backend primary key
  nom: string | null;            // last name / family name
  prenom: string | null;         // first name
  telephone: string;             // phone number
  email: string | null;
  date: string;                  // creation / joined date (ISO)
  solde: number;                 // main balance
  soldeBonus: number;            // bonus balance
  firstLogin: boolean;           // true if first authentication → force password change
  // Computed / derived (optional – you can populate these in mapping if needed)
  name?: string;                 // full name: `${nom} ${prenom}`.trim()
  status?: string;               // e.g. "Active" or "First Login"
  // Optional extras if backend sends them
  id?: string;                   // alias for clientId (if your code uses id)
}

export interface Enterprise {
  entrepriseId: string;
  nom: string;
  solde: number;
  rccm?: string;
  niu?: string;
  email?: string;
  telephone?: string;
  lieu?: string;
  rue?: string;
  boitePostale?: string;
  status: string;
  dateCreationEntreprise: string;
  responsableNom: string;
  responsablePrenom?: string;
  responsableTelephone: string;
  responsableEmail?: string;
  isValidated?: boolean;
  raw?: Record<string, any>;     
}
