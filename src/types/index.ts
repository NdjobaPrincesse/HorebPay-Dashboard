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
  clientId: string;
  nom: string | null;
  prenom: string | null;
  telephone: string;
  phone?: string;
  email: string | null;
  date: string;
  solde: number;
  balance?: number;
  soldeBonus: number;
  firstLogin: boolean;
  name?: string;
  status?: string;
  id?: string;
}

export interface ClientRow {
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
