import { useState, useEffect, useMemo } from 'react';
import { 
  Users, Banknote, Download, Filter, Search, RefreshCw, 
  Eye, EyeOff, ChevronDown, CheckCircle2, ArrowRight, Wallet, Printer, LogOut, 
  Building2, Zap, Clock, ShieldCheck, ArrowDownCircle, PauseCircle, PlayCircle
} from 'lucide-react';
import { ApiService } from '../api/services';
import { logout } from '../api/auth';
import type { Transaction, Client, Enterprise } from '../types';
import { formatCurrency, cleanStr, normalizeStatus } from '../utils/formatters';

// COMPONENTS
import TransactionReceipt from '../components/TransactionReceipt';
import LogoutModal from '../components/LogoutModal';
import EnterpriseRechargeModal from '../components/EnterpriseRechargeModal';
import DepositModal from '../components/DepositModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { KPICard } from '../components/dashboard/ui/KPICard';
import { TabButton } from '../components/dashboard/ui/TabButton';
import { ActionIconBtn } from '../components/dashboard/ui/ActionIconBtn';
import { TransactionsTable } from '../components/dashboard/tables/TransactionsTable';
import { ClientsTable } from '../components/dashboard/tables/ClientsTable';
import { EnterprisesTable } from '../components/dashboard/tables/EnterprisesTable';

type EnterpriseActionType = 'approve' | 'suspend' | 'unsuspend';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'CLIENTS' | 'ENTERPRISES'>('TRANSACTIONS');
  
  // DATA STATE
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  
  // UI STATE
  const [loading, setLoading] = useState(true);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false); 
  
  // MODAL STATES
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [rechargeId, setRechargeId] = useState('');
  const [rechargeName, setRechargeName] = useState('');
  
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositClientPhone, setDepositClientPhone] = useState('');

  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
  const [denyId, setDenyId] = useState('');
  const [isEnterpriseActionModalOpen, setIsEnterpriseActionModalOpen] = useState(false);
  const [pendingEnterpriseAction, setPendingEnterpriseAction] = useState<{
    id: string;
    action: EnterpriseActionType;
    name: string;
  } | null>(null);
  const [isEnterpriseActionSubmitting, setIsEnterpriseActionSubmitting] = useState(false);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    searchQuery: '',
    payer: '',
    receiver: '',
    minAmount: '',
    maxAmount: '',
    txStatus: 'ALL',
    paymentStatus: 'ALL',
    enterpriseStartDate: '',
    enterpriseEndDate: '',
  });

  const parseNumericValue = (value: unknown): number | null => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value !== 'string') return null;

    let normalized = value
      .trim()
      .replace(/\u00A0/g, '')
      .replace(/\u202F/g, '')
      .replace(/\s+/g, '')
      .replace(/[^\d,.-]/g, '');

    if (!normalized) return null;

    const hasComma = normalized.includes(',');
    const hasDot = normalized.includes('.');

    if (hasComma && hasDot) {
      if (normalized.lastIndexOf(',') > normalized.lastIndexOf('.')) {
        normalized = normalized.replace(/\./g, '').replace(',', '.');
      } else {
        normalized = normalized.replace(/,/g, '');
      }
    } else if (hasComma) {
      if (/^\d{1,3}(,\d{3})+$/.test(normalized)) {
        normalized = normalized.replace(/,/g, '');
      } else {
        normalized = normalized.replace(',', '.');
      }
    } else if (hasDot) {
      if (/^\d{1,3}(\.\d{3})+$/.test(normalized)) {
        normalized = normalized.replace(/\./g, '');
      }
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
  };

  const findBalanceValueDeep = (
    input: unknown,
    depth = 0,
    seen = new Set<object>()
  ): number | null => {
    if (!isRecord(input) || depth > 4) return null;
    if (seen.has(input)) return null;
    seen.add(input);

    const entries = Object.entries(input);

    for (const [key, value] of entries) {
      const k = key.toLowerCase();
      const looksLikeBalance = (k.includes('solde') || k.includes('balance')) && !k.includes('bonus');
      if (looksLikeBalance) {
        const parsed = parseNumericValue(value);
        if (parsed !== null) return parsed;
      }
    }

    for (const [, value] of entries) {
      if (isRecord(value)) {
        const nested = findBalanceValueDeep(value, depth + 1, seen);
        if (nested !== null) return nested;
      }
    }

    return null;
  };

  const hasBalanceFieldDeep = (
    input: unknown,
    depth = 0,
    seen = new Set<object>()
  ): boolean => {
    if (!isRecord(input) || depth > 4) return false;
    if (seen.has(input)) return false;
    seen.add(input);

    const entries = Object.entries(input);

    for (const [key] of entries) {
      const k = key.toLowerCase();
      if ((k.includes('solde') || k.includes('balance')) && !k.includes('bonus')) {
        return true;
      }
    }

    for (const [, value] of entries) {
      if (isRecord(value) && hasBalanceFieldDeep(value, depth + 1, seen)) {
        return true;
      }
    }

    return false;
  };

  const getEnterpriseBalance = (enterprise: any) => {
    const balanceCandidates = [
      enterprise?.solde,
      enterprise?.balance,
      enterprise?.walletBalance,
      enterprise?.wallet?.balance,
      enterprise?.wallet?.solde,
      enterprise?.compte?.solde,
      enterprise?.compte?.balance,
      enterprise?.soldePrincipal,
    ];

    for (const candidate of balanceCandidates) {
      const parsed = parseNumericValue(candidate);
      if (parsed !== null) return parsed;
    }

    const deepBalance = findBalanceValueDeep(enterprise);
    if (deepBalance !== null) return deepBalance;

    return 0;
  };

  const hasEnterpriseBalanceField = (enterprise: any) => {
    return hasBalanceFieldDeep(enterprise);
  };

  const handleEnterpriseRechargeSuccess = async ({
    entrepriseId,
    responseData,
  }: {
    entrepriseId: string;
    amount: number;
    responseData: any;
  }) => {
    const responseBalance = getEnterpriseBalance(responseData);

    if (hasEnterpriseBalanceField(responseData)) {
      setEnterprises((prev) =>
        prev.map((enterprise) =>
          enterprise.entrepriseId === entrepriseId
            ? { ...enterprise, solde: responseBalance }
            : enterprise
        )
      );
    }

    await fetchEnterprisesOnly(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("Fetching Data..."); 
      const [txRes, clientsRes, entRes] = await Promise.allSettled([
        ApiService.dashboard.getTransactions(),
        ApiService.dashboard.getClients(),
        ApiService.enterprise.getAll()
      ]);

      if (txRes.status === 'fulfilled') {
        const rawData = txRes.value.data;
        const txData = Array.isArray(rawData) ? rawData : (rawData.content || []);
        setTransactions(
          txData.map((t: any) => ({
            id: t.transactionsId || t.id,
            txRef: t.transactionsId || t.txRef || 'REF-N/A',
            date: t.date || t.createdAt,
            clientName: t.clientNom || 'Unknown',
            clientId: t.clientId || '?',
            operator: t.operateurNom || 'N/A',
            product: t.produitLibelle || 'N/A',
            paymentMethod: t.methodePaiementNom || '-',
            payerPhone: t.numeroPayeur || 'N/A',
            receiverPhone: t.numeroRecepteur || 'N/A',
            amount: parseFloat(t.montant || 0),
            serviceFee: parseFloat(t.fraisService ?? t.serviceFee ?? t.frais ?? 0),
            bonus: parseFloat(t.bonus || 0), 
            paymentStatus: normalizeStatus(t.statusPaiement),
            txStatus: normalizeStatus(t.statusTransaction || t.status)
          }))
          .sort((a: Transaction, b: Transaction) => // ← Fixed implicit any
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
      }

      if (clientsRes.status === 'fulfilled') {
        const rawData = clientsRes.value.data;
        const clientsData = Array.isArray(rawData) ? rawData : (rawData.content || []);
        setClients(
          clientsData.map((c: any) => ({
            clientId: c.clientId || c.id,
            nom: c.nom || '',
            prenom: c.prenom || '',
            phone: c.telephone || 'N/A',
            email: c.email || 'N/A',
            date: c.date || c.createdAt,
            solde: parseFloat(c.solde || 0),
            soldeBonus: parseFloat(c.soldeBonus || 0),
            firstLogin: c.firstLogin ?? true,
            name: [c.nom, c.prenom].filter(Boolean).join(' ').trim() || 'Unknown',
            status: c.firstLogin ? 'First Login' : 'Active',
          }))
          .sort((a: Client, b: Client) => // ← Fixed implicit any
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
      }

      if (entRes.status === 'fulfilled') {
        const rawData = entRes.value.data;
        const entData = Array.isArray(rawData) ? rawData : (rawData.content || []);

        console.log('[RAW ENTERPRISES FROM API]', entData);

    setEnterprises(
  entData.map((e: any): Enterprise => ({
    entrepriseId: e.entrepriseId || e.id || '',
    nom: e.nom || 'Unknown',
    solde: getEnterpriseBalance(e),
    rccm: e.rccm || '',
    niu: e.niu || '',
    email: e.email || e.responsableEmail || '',
    telephone: e.telephone || '',
    lieu: e.lieu || '',
    rue: e.rue || '',
    boitePostale: e.boitePostale || '',

    // ✅ IMPORTANT: keep exact status
    status: e.status || 'PENDING',

    dateCreationEntreprise:
      e.dateCreationEntreprise ||
      e.datecreationentreprises ||
      new Date().toISOString(),

    // ✅ RESPONSABLE
    responsableNom:
      e.responsableNom ||
      e.nomduresponsable ||
      '-',

    responsablePrenom: e.responsablePrenom || '',

    responsableTelephone:
      e.responsableTelephone ||
      e.numeroduresponsable ||
      '-',

    responsableEmail: e.responsableEmail || '',

    // ✅ FIX WRONG STATUS CHECK
    isValidated:
      e.status === 'STATUT_VALIDATED',

    raw: e,

  }))
  .sort((a: Enterprise, b: Enterprise) => {
    const dateA = new Date(a.dateCreationEntreprise).getTime();
    const dateB = new Date(b.dateCreationEntreprise).getTime();

    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;

    return dateB - dateA;
  })
);
      }
    } catch (e) { 
      console.error("Fetch Error", e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchTransactionsOnly(); }, []);

  const fetchTransactionsOnly = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const txRes = await ApiService.dashboard.getTransactions();
      const rawData = txRes.data;
      const txData = Array.isArray(rawData) ? rawData : (rawData.content || []);
      setTransactions(
        txData.map((t: any) => ({
          id: t.transactionsId || t.id,
          txRef: t.transactionsId || t.txRef || 'REF-N/A',
          date: t.date || t.createdAt,
          clientName: t.clientNom || 'Unknown',
          clientId: t.clientId || '?',
          operator: t.operateurNom || 'N/A',
          product: t.produitLibelle || 'N/A',
          paymentMethod: t.methodePaiementNom || '-',
          payerPhone: t.numeroPayeur || 'N/A',
          receiverPhone: t.numeroRecepteur || 'N/A',
          amount: parseFloat(t.montant || 0),
          serviceFee: parseFloat(t.fraisService ?? t.serviceFee ?? t.frais ?? 0),
          bonus: parseFloat(t.bonus || 0),
          paymentStatus: normalizeStatus(t.statusPaiement),
          txStatus: normalizeStatus(t.statusTransaction || t.status)
        }))
        .sort((a: Transaction, b: Transaction) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    } catch (e) {
      console.error("Fetch Error", e);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const fetchClientsOnly = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const clientsRes = await ApiService.dashboard.getClients();
      const rawData = clientsRes.data;
      const clientsData = Array.isArray(rawData) ? rawData : (rawData.content || []);
      setClients(
        clientsData.map((c: any) => ({
          clientId: c.clientId || c.id,
          nom: c.nom || '',
          prenom: c.prenom || '',
          phone: c.telephone || 'N/A',
          email: c.email || 'N/A',
          date: c.date || c.createdAt,
          solde: parseFloat(c.solde || 0),
          soldeBonus: parseFloat(c.soldeBonus || 0),
          firstLogin: c.firstLogin ?? true,
          name: [c.nom, c.prenom].filter(Boolean).join(' ').trim() || 'Unknown',
          status: c.firstLogin ? 'First Login' : 'Active',
        }))
        .sort((a: Client, b: Client) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    } catch (e) {
      console.error("Fetch Error", e);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const fetchEnterprisesOnly = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const entRes = await ApiService.enterprise.getAll();
      const rawData = entRes.data;
      const entData = Array.isArray(rawData) ? rawData : (rawData.content || []);

      setEnterprises(
        entData.map((e: any): Enterprise => ({
          entrepriseId: e.entrepriseId || e.id || '',
          nom: e.nom || 'Unknown',
          solde: getEnterpriseBalance(e),
          rccm: e.rccm || '',
          niu: e.niu || '',
          email: e.email || e.responsableEmail || '',
          telephone: e.telephone || '',
          lieu: e.lieu || '',
          rue: e.rue || '',
          boitePostale: e.boitePostale || '',
          status: e.status || 'PENDING',
          dateCreationEntreprise:
            e.dateCreationEntreprise ||
            e.datecreationentreprises ||
            new Date().toISOString(),
          responsableNom:
            e.responsableNom ||
            e.nomduresponsable ||
            '-',
          responsablePrenom: e.responsablePrenom || '',
          responsableTelephone:
            e.responsableTelephone ||
            e.numeroduresponsable ||
            '-',
          responsableEmail: e.responsableEmail || '',
          isValidated: e.status === 'STATUT_VALIDATED',
          raw: e,
        }))
        .sort((a: Enterprise, b: Enterprise) => {
          const dateA = new Date(a.dateCreationEntreprise).getTime();
          const dateB = new Date(b.dateCreationEntreprise).getTime();
          if (isNaN(dateA)) return 1;
          if (isNaN(dateB)) return -1;
          return dateB - dateA;
        })
      );
    } catch (e) {
      console.error("Fetch Error", e);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const refreshActiveTab = () => {
    if (activeTab === 'TRANSACTIONS') {
      fetchTransactionsOnly();
      return;
    }

    if (activeTab === 'CLIENTS') {
      fetchClientsOnly();
      return;
    }

    fetchEnterprisesOnly();
  };

  useEffect(() => {
    if (activeTab === 'CLIENTS' && clients.length === 0) {
      fetchClientsOnly();
      return;
    }

    if (activeTab === 'ENTERPRISES' && enterprises.length === 0) {
      fetchEnterprisesOnly();
    }
  }, [activeTab]);

  const handleAcceptEnterprise = async (id: string) => {
    const ent = enterprises.find(e => e.entrepriseId === id);
    if (!ent) return;

    setEnterprises(prev => prev.map(e => (
      e.entrepriseId === id
        ? { ...e, isValidated: true, status: 'STATUT_VALIDATED' }
        : e
    )));

    try {
      console.log('[APPROVE ATTEMPT] Enterprise ID:', id);
      console.log('[PAYLOAD BEING SENT]:', { ...ent.raw, status: 'STATUT_VALIDATED' });

      await ApiService.enterprise.update(id, { ...ent.raw, status: 'STATUT_VALIDATED' });

      console.log('[APPROVE SUCCESS]');
    } catch (err) {
      console.error('[APPROVE FAILED]', err);
      alert("Error: Server rejected the update.");
      setEnterprises(prev => prev.map(e => (
        e.entrepriseId === id
          ? { ...e, isValidated: false, status: ent.status }
          : e
      )));
    }
  };

  const handleSuspendEnterprise = async (id: string) => {
    const ent = enterprises.find(e => e.entrepriseId === id);
    if (!ent) return;

    setEnterprises(prev => prev.map(e => (
      e.entrepriseId === id
        ? { ...e, isValidated: false, status: 'SUSPEND' }
        : e
    )));

    try {
      await ApiService.enterprise.update(id, { ...ent.raw, status: 'SUSPEND' });
    } catch (err) {
      console.error('[SUSPEND FAILED]', err);
      alert('Error: Could not suspend enterprise.');
      setEnterprises(prev => prev.map(e => (
        e.entrepriseId === id
          ? { ...e, isValidated: ent.isValidated, status: ent.status }
          : e
      )));
    }
  };

  const handleUnsuspendEnterprise = async (id: string) => {
    const ent = enterprises.find(e => e.entrepriseId === id);
    if (!ent) return;

    setEnterprises(prev => prev.map(e => (
      e.entrepriseId === id
        ? { ...e, isValidated: true, status: 'STATUT_VALIDATED' }
        : e
    )));

    try {
      await ApiService.enterprise.update(id, { ...ent.raw, status: 'STATUT_VALIDATED' });
    } catch (err) {
      console.error('[UNSUSPEND FAILED]', err);
      alert('Error: Could not unsuspend enterprise.');
      setEnterprises(prev => prev.map(e => (
        e.entrepriseId === id
          ? { ...e, isValidated: ent.isValidated, status: ent.status }
          : e
      )));
    }
  };

  const onDenyClick = (id: string) => {
    setDenyId(id);
    setIsDenyModalOpen(true);
  };

  const openEnterpriseActionModal = (action: EnterpriseActionType, id: string) => {
    const enterprise = enterprises.find((item) => item.entrepriseId === id);
    if (!enterprise) return;

    setPendingEnterpriseAction({
      id,
      action,
      name: enterprise.nom || 'this enterprise',
    });
    setIsEnterpriseActionModalOpen(true);
  };

  const closeEnterpriseActionModal = () => {
    if (isEnterpriseActionSubmitting) return;
    setIsEnterpriseActionModalOpen(false);
    setPendingEnterpriseAction(null);
  };

  const confirmEnterpriseAction = async () => {
    if (!pendingEnterpriseAction) return;

    setIsEnterpriseActionSubmitting(true);

    try {
      if (pendingEnterpriseAction.action === 'approve') {
        await handleAcceptEnterprise(pendingEnterpriseAction.id);
      } else if (pendingEnterpriseAction.action === 'suspend') {
        await handleSuspendEnterprise(pendingEnterpriseAction.id);
      } else {
        await handleUnsuspendEnterprise(pendingEnterpriseAction.id);
      }

      setIsEnterpriseActionModalOpen(false);
      setPendingEnterpriseAction(null);
    } finally {
      setIsEnterpriseActionSubmitting(false);
    }
  };

  const enterpriseActionModalConfig = useMemo(() => {
    if (!pendingEnterpriseAction) return null;

    if (pendingEnterpriseAction.action === 'approve') {
      return {
        title: 'Do You Really Want to Approve This Enterprise?',
        message: `${pendingEnterpriseAction.name} will be approved and activated immediately.`,
        confirmText: 'Yes',
        cancelText: 'No',
        tone: 'primary' as const,
        icon: <CheckCircle2 className="h-5 w-5" />,
      };
    }

    if (pendingEnterpriseAction.action === 'suspend') {
      return {
        title: 'Do You Really Want to Suspend This Enterprise?',
        message: `${pendingEnterpriseAction.name} will be suspended until you enable it again.`,
        confirmText: 'Yes',
        cancelText: 'No',
        tone: 'warning' as const,
        icon: <PauseCircle className="h-5 w-5" />,
      };
    }

    return {
      title: 'Do You Really Want to Unsuspend This Enterprise?',
      message: `${pendingEnterpriseAction.name} will be reactivated immediately.`,
      confirmText: 'Yes',
      cancelText: 'No',
      tone: 'success' as const,
      icon: <PlayCircle className="h-5 w-5" />,
    };
  }, [pendingEnterpriseAction]);

  const confirmDenyEnterprise = async () => {
    if (!denyId) return;
    
    setEnterprises(prev => prev.filter(e => e.entrepriseId !== denyId));
    try {
      await ApiService.enterprise.delete(denyId);
      setIsDenyModalOpen(false);
      setDenyId('');
    } catch(err) {
      alert("Error: Could not delete.");
      fetchEnterprisesOnly(); 
    }
  };

  const openRecharge = (id: string = '', name: string = '') => { 
    setRechargeId(id); 
    setRechargeName(name);
    setIsRechargeOpen(true); 
  };
  const openDeposit = (phone: string = '') => { 
    setDepositClientPhone(phone); 
    setIsDepositOpen(true); 
  };

  const filteredData = useMemo(() => {
    const searchTerms = cleanStr(filters.searchQuery);
    if (activeTab === 'TRANSACTIONS') {
      const startTimestamp = filters.startDate ? new Date(filters.startDate).setHours(0,0,0,0) : 0;
      const endTimestamp = filters.endDate ? new Date(filters.endDate).setHours(23,59,59,999) : Infinity;
      return transactions.filter(item => {
        if (searchTerms && !(cleanStr(item.clientName).includes(searchTerms) || cleanStr(item.txRef).includes(searchTerms))) return false;
        if (filters.payer && !cleanStr(item.payerPhone).includes(cleanStr(filters.payer))) return false;
        if (filters.receiver && !cleanStr(item.receiverPhone).includes(cleanStr(filters.receiver))) return false;
        if (filters.minAmount && item.amount < Number(filters.minAmount)) return false;
        if (filters.maxAmount && item.amount > Number(filters.maxAmount)) return false;
        if (filters.txStatus !== 'ALL' && item.txStatus !== filters.txStatus) return false;
        if (filters.paymentStatus !== 'ALL' && item.paymentStatus !== filters.paymentStatus) return false;
        const tDate = new Date(item.date).getTime();
        if (tDate < startTimestamp || tDate > endTimestamp) return false;
        return true;
      });
    } else if (activeTab === 'CLIENTS') {
      return clients.filter(c => !searchTerms || cleanStr(c.name).includes(searchTerms));
    } else { // ENTERPRISES
      return enterprises.filter(e => {
        if (searchTerms && !cleanStr(e.nom).includes(searchTerms)) return false;

        if (filters.enterpriseStartDate || filters.enterpriseEndDate) {
          const entDate = new Date(e.dateCreationEntreprise).getTime();
          if (filters.enterpriseStartDate) {
            const startTs = new Date(filters.enterpriseStartDate).setHours(0, 0, 0, 0);
            if (entDate < startTs) return false;
          }
          if (filters.enterpriseEndDate) {
            const endTs = new Date(filters.enterpriseEndDate).setHours(23, 59, 59, 999);
            if (entDate > endTs) return false;
          }
        }
        return true;
      });
    }
  }, [transactions, clients, enterprises, filters, activeTab]);

  const stats = useMemo(() => {
    if (activeTab === 'ENTERPRISES') {
      const total = enterprises.length;
      const active = enterprises.filter(e => e.isValidated).length;
      return { total, active, pending: total - active };
    }
    return {
      revenue: transactions.filter(t => t.txStatus === 'SUCCESS').reduce((sum, t) => sum + t.amount, 0),
      txCount: transactions.length,
      clientCount: clients.length
    };
  }, [transactions, clients, enterprises, activeTab]);

  const revenueDisplay = useMemo(() => {
    const formattedRevenue = formatCurrency((stats as any).revenue ?? 0).trim();
    const match = formattedRevenue.match(/^(.*?)(?:\s+(F\s*CFA|FCFA|XOF))$/i);

    return {
      amount: match?.[1] ?? formattedRevenue,
      currency: match?.[2] ?? 'FCFA',
    };
  }, [stats]);

  const revenueAmountGroups = useMemo(
    () => revenueDisplay.amount.split(/[\s\u202F]+/).filter(Boolean),
    [revenueDisplay.amount]
  );

  const exportCSV = () => { alert("Export feature available."); };
  const handlePrintList = () => { window.print(); };

  const resetFilters = () => setFilters({
    startDate: '',
    endDate: '',
    searchQuery: '',
    payer: '',
    receiver: '',
    minAmount: '',
    maxAmount: '',
    txStatus: 'ALL',
    paymentStatus: 'ALL',
    enterpriseStartDate: '',
    enterpriseEndDate: '',
  });

  return (
    <div className="min-h-screen w-full font-sans text-slate-800 pb-20 bg-white via-slate-50 to-white">
      
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 px-4 py-4 sm:px-6 no-print shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 sm:gap-6">
          <div className="flex items-center justify-center xl:justify-start gap-3">
            <div className="flex flex-col items-start">
              <h1 className="text-2xl sm:text-3xl font-black text-[#1e3a8a] tracking-tight leading-none">
                HOREB<span className="text-[#FFC107]">PAY</span>
              </h1>
              <p className="text-xl sm:text-2xl font-black text-[#FFC107] tracking-wide mt-0.5">
                Dashboard
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-center">
            <div className="flex p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/60">
              <TabButton label="Transactions" active={activeTab === 'TRANSACTIONS'} onClick={() => setActiveTab('TRANSACTIONS')} />
              <TabButton label="Clients" active={activeTab === 'CLIENTS'} onClick={() => setActiveTab('CLIENTS')} />
              <TabButton label="Enterprises" active={activeTab === 'ENTERPRISES'} onClick={() => setActiveTab('ENTERPRISES')} />
            </div>
            
            <div className="flex items-center gap-2">
              {activeTab === 'ENTERPRISES' && (
                <button
                  onClick={() => openDeposit('')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1e3a8a] to-blue-900 text-white font-semibold rounded-xl shadow-md shadow-blue-900/20 hover:shadow-lg hover:shadow-blue-900/30 hover:-translate-y-0.5 transition-all text-sm"
                >
                  <ArrowDownCircle className="h-4 w-4" />
                  Deposit
                </button>
              )}

              <div className="h-8 w-\[1px\] bg-slate-200 mx-2 hidden sm:block"></div>
              
              <ActionIconBtn onClick={handlePrintList} icon={<Printer className="h-4 w-4"/>} title="Print" />
              <ActionIconBtn onClick={() => setIsPrivacyMode(!isPrivacyMode)} icon={isPrivacyMode ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>} title="Privacy" active={isPrivacyMode} />
              <ActionIconBtn onClick={refreshActiveTab} icon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />} title="Refresh" />
              
              <button onClick={() => setIsLogoutOpen(true)} className="ml-2 p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 rounded-xl transition-all shadow-sm">
                <LogOut className="h-4 w-4"/>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
        
        {/* KPI STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          {activeTab === 'ENTERPRISES' ? (
            <>
              <KPICard title="Total Partners" value={(stats as any).total} />
              <KPICard title="Validated" value={(stats as any).active} />
              <KPICard title="Pending Review" value={(stats as any).pending} />
            </>
          ) : (
            <>
              <div className="bg-linear-to-br from-[#1e3a8a] to-[#0f172a] p-5 sm:p-6 rounded-[1.75rem] shadow-2xl shadow-blue-900/10 text-white relative overflow-hidden group hover:scale-[1.01] transition-transform duration-500 min-w-0">
                <div className="absolute -right-4 -top-4 p-5 opacity-10 group-hover:scale-110 transition-transform duration-500"><Banknote className="h-24 w-24 sm:h-28 sm:w-28" /></div>
                <div className="relative z-10 min-w-0">
                  <p className="text-blue-200/80 text-[11px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Wallet className="h-3 w-3"/> Total Revenue</p>
                  <h2 className="max-w-full font-mono font-black tracking-tight leading-none text-[clamp(1.75rem,5vw,3rem)]">
                    {isPrivacyMode ? (
                      '••••••'
                    ) : (
                      <span className="flex max-w-full flex-wrap items-end gap-x-2 gap-y-1">
                        <span className="flex min-w-0 max-w-full flex-wrap items-end gap-x-2 gap-y-1 overflow-wrap-anywhere">
                          {revenueAmountGroups.map((group, index) => (
                            <span key={`${group}-${index}`}>{group}</span>
                          ))}
                        </span>
                        <span className="text-[0.48em] font-bold uppercase tracking-[0.2em] text-blue-100/90">
                          {revenueDisplay.currency}
                        </span>
                      </span>
                    )}
                  </h2>
                </div>
              </div>
              <KPICard title="Volume" value={(stats as any).txCount}  color="gray" />
              <KPICard title="Users" value={(stats as any).clientCount}  color="gray" />
            </>
          )}
        </div>

        {/* FILTERS & SEARCH */}
        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-1.5 no-print transition-all hover:shadow-md duration-500">
          <div className="p-2 flex flex-col md:flex-row gap-4 items-stretch md:items-end">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder={activeTab === 'TRANSACTIONS' ? "Search by Reference, Client, Method..." : "Search by Name, Phone..."}
                className="w-full pl-14 pr-4 py-4 bg-[#F8FAFB] border-transparent rounded-2xl text-sm font-semibold text-[#1e3a8a] placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all" 
                value={filters.searchQuery} 
                onChange={(e) => setFilters({...filters, searchQuery: e.target.value})} 
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold border transition-all active:scale-95 w-full sm:w-auto ${
                  showFilters ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter className="h-4 w-4" /> Filters <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={resetFilters}
                className="px-6 py-3 text-sm font-bold text-[#1e3a8a] bg-blue-50/50 hover:bg-blue-50 rounded-2xl transition-colors w-full sm:w-auto"
              >
                Reset
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="px-4 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 no-print border-t border-slate-100 mt-2 pt-6">
              {activeTab === 'TRANSACTIONS' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Tx Status</label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 bg-[#F8FAFB] hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl text-sm font-bold text-[#1e3a8a] appearance-none outline-none focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all cursor-pointer"
                        value={filters.txStatus}
                        onChange={(val) => setFilters({...filters, txStatus: val.target.value})}
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILED">Failed</option>
                        <option value="PENDING">Pending</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"/>
                    </div>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Date Range</label>
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-[#F8FAFB] p-1 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                      <input
                        type="date"
                        className="w-full bg-transparent text-sm font-bold text-[#1e3a8a] px-4 py-2 outline-none"
                        value={filters.startDate}
                        onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                      />
                      <span className="text-slate-300">→</span>
                      <input
                        type="date"
                        className="w-full bg-transparent text-sm font-bold text-[#1e3a8a] px-4 py-2 outline-none"
                        value={filters.endDate}
                        onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              ) : activeTab === 'ENTERPRISES' ? (
                <>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Creation Date Range</label>
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-[#F8FAFB] p-1 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                      <input
                        type="date"
                        className="w-full bg-transparent text-sm font-bold text-[#1e3a8a] px-4 py-2 outline-none"
                        value={filters.enterpriseStartDate}
                        onChange={(e) => setFilters({...filters, enterpriseStartDate: e.target.value})}
                        placeholder="From"
                      />
                      <span className="text-slate-300">→</span>
                      <input
                        type="date"
                        className="w-full bg-transparent text-sm font-bold text-[#1e3a8a] px-4 py-2 outline-none"
                        value={filters.enterpriseEndDate}
                        onChange={(e) => setFilters({...filters, enterpriseEndDate: e.target.value})}
                        placeholder="To"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 text-xs text-slate-500 italic">
                  Search active — no additional filters for Clients yet
                </div>
              )}
            </div>
          )}
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white border border-slate-200 rounded-[1.75rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden print-area min-h-[500px]">
          <div className="hidden print:block p-8 text-center border-b border-black">
            <h1 className="text-3xl font-black uppercase text-black">HorebPay Report</h1>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[860px] lg:min-w-[1000px] print:min-w-0">
              {activeTab === 'TRANSACTIONS' && <TransactionsTable data={filteredData as Transaction[]} isPrivacyMode={isPrivacyMode} onPrint={setSelectedTx} />}
              {activeTab === 'CLIENTS' && <ClientsTable data={filteredData as Client[]} isPrivacyMode={isPrivacyMode} />}
              {activeTab === 'ENTERPRISES' && (
                <EnterprisesTable 
                  data={filteredData as Enterprise[]} 
                  onAccept={(id) => openEnterpriseActionModal('approve', id)} 
                  onDeny={onDenyClick} 
                  onRecharge={openRecharge}
                  onSuspend={(id) => openEnterpriseActionModal('suspend', id)}
                  onUnsuspend={(id) => openEnterpriseActionModal('unsuspend', id)}
                />
              )}
            </table>
          </div>
        </div>

        {/* Modals */}
        {selectedTx && <TransactionReceipt data={selectedTx} onClose={() => setSelectedTx(null)} />}
        <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={logout} />
        <EnterpriseRechargeModal 
          isOpen={isRechargeOpen} 
          onClose={() => setIsRechargeOpen(false)} 
          onSuccess={handleEnterpriseRechargeSuccess}
          prefilledId={rechargeId} 
          prefilledName={rechargeName}
        />
        <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} prefilledPhone={depositClientPhone} />
        <ConfirmationModal 
          isOpen={isEnterpriseActionModalOpen && !!enterpriseActionModalConfig}
          onClose={closeEnterpriseActionModal}
          onConfirm={confirmEnterpriseAction}
          title={enterpriseActionModalConfig?.title || 'Confirm action'}
          message={enterpriseActionModalConfig?.message || ''}
          confirmText={enterpriseActionModalConfig?.confirmText}
          cancelText={enterpriseActionModalConfig?.cancelText}
          icon={enterpriseActionModalConfig?.icon}
          tone={enterpriseActionModalConfig?.tone}
          isLoading={isEnterpriseActionSubmitting}
        />
        <ConfirmationModal 
          isOpen={isDenyModalOpen} 
          onClose={() => {
            setIsDenyModalOpen(false);
            setDenyId('');
          }} 
          onConfirm={confirmDenyEnterprise}
          title="Reject Enterprise?"
          message="This action will permanently delete the enterprise application. This cannot be undone."
          confirmText="Reject & Delete"
          tone="danger"
        />
      </div>
    </div>
  );
}
