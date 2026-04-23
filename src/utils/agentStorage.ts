// Improved version of your agentStorage.ts
// ✔ Logic unchanged
// ✔ Added richer, more varied mock data for UI/UX testing
// ✔ Better distribution (treated, untreated, processing)
// ✔ More realistic timestamps & zones

export type RechargeStatus = 'Treated' | 'Untreated';
export type AgentReportOutcome = 'SUCCESS' | 'FAILED';

export interface PendingRecharge {
  id: string;
  customerName: string;
  phoneNumber: string;
  network: string;
  bundle: string;
  amount: number;
  requestedAt: string;
  zone: string;
  status: RechargeStatus;
  isProcessing?: boolean;
  processingBy?: string | null;
  processedBy?: string | null;
}

export interface AgentReportEntry {
  id: string;
  rechargeId: string;
  customerName: string;
  phoneNumber: string;
  network: string;
  bundle: string;
  amount: number;
  requestedAt: string;
  zone: string;
  agentName: string;
  outcome: AgentReportOutcome;
  treatedAt: string;
}

export const AGENT_QUEUE_STORAGE_KEY = 'agentPendingRechargeQueue';
export const AGENT_REPORT_STORAGE_KEY = 'agentRechargeReports';

// 🔥 MUCH BETTER MOCK DATA
const initialPendingRecharges: PendingRecharge[] = [
  {
    id: 'DRP-2401',
    customerName: 'Brenda Tita',
    phoneNumber: '670112908',
    network: 'MTN',
    bundle: '15GB Weekly',
    amount: 6500,
    requestedAt: '08:15 AM',
    zone: 'Douala Centre',
    status: 'Untreated',
    isProcessing: false,
    processingBy: null,
    processedBy: null,
  },
  {
    id: 'DRP-2402',
    customerName: 'Jordan Neba',
    phoneNumber: '675441200',
    network: 'Orange',
    bundle: '2GB Daily',
    amount: 1800,
    requestedAt: '08:42 AM',
    zone: 'Buea Town',
    status: 'Treated',
    isProcessing: false,
    processingBy: null,
    processedBy: 'Agent Grace',
  },
  {
    id: 'DRP-2403',
    customerName: 'Lydia Asong',
    phoneNumber: '679550812',
    network: 'Camtel',
    bundle: '10GB Monthly',
    amount: 4200,
    requestedAt: '09:03 AM',
    zone: 'Yaounde Centre',
    status: 'Untreated',
    isProcessing: true,
    processingBy: 'Agent',
    processedBy: null,
  },
  {
    id: 'DRP-2404',
    customerName: 'Michael Forba',
    phoneNumber: '651781990',
    network: 'MTN',
    bundle: '5GB Weekly',
    amount: 2500,
    requestedAt: '09:25 AM',
    zone: 'Limbe Mile 2',
    status: 'Untreated',
    isProcessing: false,
    processingBy: null,
    processedBy: null,
  },
  {
    id: 'DRP-2405',
    customerName: 'Grace Ndzi',
    phoneNumber: '694220441',
    network: 'Orange',
    bundle: '20GB Monthly',
    amount: 9000,
    requestedAt: '09:47 AM',
    zone: 'Bonamoussadi',
    status: 'Treated',
    isProcessing: false,
    processingBy: null,
    processedBy: 'Agent Brenda',
  },
  {
    id: 'DRP-2406',
    customerName: 'Samuel Ekane',
    phoneNumber: '677889900',
    network: 'MTN',
    bundle: '3GB Daily',
    amount: 2000,
    requestedAt: '10:12 AM',
    zone: 'Akwa',
    status: 'Untreated',
    isProcessing: false,
    processingBy: null,
    processedBy: null,
  },
  {
    id: 'DRP-2407',
    customerName: 'Esther Mbella',
    phoneNumber: '699334455',
    network: 'Nexttel',
    bundle: '1GB Daily',
    amount: 500,
    requestedAt: '10:45 AM',
    zone: 'Makepe',
    status: 'Untreated',
    isProcessing: false,
    processingBy: null,
    processedBy: null,
  },
  {
    id: 'DRP-2408',
    customerName: 'Patrick Ndzi',
    phoneNumber: '682223344',
    network: 'Orange',
    bundle: '7GB Weekly',
    amount: 3500,
    requestedAt: '11:20 AM',
    zone: 'Kotto',
    status: 'Untreated',
    isProcessing: true,
    processingBy: 'Agent Alex',
    processedBy: null,
  },
];

const cloneInitialQueue = () =>
  initialPendingRecharges.map((item) => ({
    ...item,
    isProcessing: item.isProcessing || false,
    processingBy: item.processingBy || null,
  }));

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;

  const stored = window.localStorage.getItem(key);
  if (!stored) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(stored) as T;
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
};

export const loadAgentQueue = () =>
  readStorage<PendingRecharge[]>(AGENT_QUEUE_STORAGE_KEY, cloneInitialQueue());

export const saveAgentQueue = (queue: PendingRecharge[]) => {
  window.localStorage.setItem(AGENT_QUEUE_STORAGE_KEY, JSON.stringify(queue));
};

export const resetAgentQueue = () => {
  const queue = cloneInitialQueue();
  saveAgentQueue(queue);
  return queue;
};

// 🔥 ADD MOCK REPORTS TOO
const initialReports: AgentReportEntry[] = [
  {
    id: 'REP-1001',
    rechargeId: 'DRP-2390',
    customerName: 'Test User',
    phoneNumber: '650000000',
    network: 'MTN',
    bundle: '1GB Daily',
    amount: 500,
    requestedAt: 'Yesterday',
    zone: 'Douala',
    agentName: 'Agent',
    outcome: 'SUCCESS',
    treatedAt: 'Yesterday 14:20',
  },
  {
    id: 'REP-1002',
    rechargeId: 'DRP-2391',
    customerName: 'Test User 2',
    phoneNumber: '651111111',
    network: 'Orange',
    bundle: '2GB Weekly',
    amount: 1500,
    requestedAt: 'Yesterday',
    zone: 'Yaounde',
    agentName: 'Agent',
    outcome: 'FAILED',
    treatedAt: 'Yesterday 16:05',
  },
];

export const loadAgentReports = () =>
  readStorage<AgentReportEntry[]>(AGENT_REPORT_STORAGE_KEY, initialReports);

export const saveAgentReports = (reports: AgentReportEntry[]) => {
  window.localStorage.setItem(AGENT_REPORT_STORAGE_KEY, JSON.stringify(reports));
};

export const appendAgentReport = (entry: AgentReportEntry) => {
  const current = loadAgentReports();
  const next = [entry, ...current];
  saveAgentReports(next);
  return next;
};

export const resetAgentReports = () => {
  saveAgentReports(initialReports);
  return initialReports;
};
