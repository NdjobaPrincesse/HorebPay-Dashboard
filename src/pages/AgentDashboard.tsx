import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  RefreshCw,
  RadioTower,
  Trash2,
  UserCircle2,
  X,
  Shield,
  TrendingUp,
  Search,
  Filter,
  Download,
  MoreVertical,
  Calendar,
  DollarSign,
  Users,
  Signal,
  Smartphone,
  MapPin,
} from 'lucide-react';
import Layout from '../components/Layout';
import { getStoredUser } from '../api/auth';
import AgentNavigation from '../components/agent/AgentNavigation';
import {
  AGENT_QUEUE_STORAGE_KEY,
  AGENT_REPORT_STORAGE_KEY,
  appendAgentReport,
  loadAgentQueue,
  loadAgentReports,
  resetAgentQueue,
  resetAgentReports,
  saveAgentQueue,
  type AgentReportEntry,
  type AgentReportOutcome,
  type PendingRecharge,
} from '../utils/agentStorage';
import { useLocation, useNavigate } from 'react-router-dom';

const formatAmount = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(value);

// Network options for filter
const NETWORKS = ['MTN', 'ORANGE', 'CAMTEL', 'YOOMEE'];
const ZONES = ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Maroua'];

interface FilterState {
  network: string[];
  zone: string[];
  amountRange: { min: string; max: string };
  dateRange: { start: string; end: string };
}

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  activeView: 'queue' | 'report';
  buttonRef: React.RefObject<HTMLButtonElement>;
}

const FilterDropdown = ({ isOpen, onClose, filters, onFilterChange, activeView, buttonRef }: FilterDropdownProps) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 320,
      });
    }
  }, [isOpen, buttonRef]);

  if (!isOpen) return null;

  const handleNetworkToggle = (network: string) => {
    setLocalFilters(prev => ({
      ...prev,
      network: prev.network.includes(network)
        ? prev.network.filter(n => n !== network)
        : [...prev.network, network]
    }));
  };

  const handleZoneToggle = (zone: string) => {
    setLocalFilters(prev => ({
      ...prev,
      zone: prev.zone.includes(zone)
        ? prev.zone.filter(z => z !== zone)
        : [...prev.zone, zone]
    }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      network: [],
      zone: [],
      amountRange: { min: '', max: '' },
      dateRange: { start: '', end: '' }
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const activeFilterCount = 
    filters.network.length + 
    filters.zone.length + 
    (filters.amountRange.min || filters.amountRange.max ? 1 : 0) +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0);

  const dropdownContent = (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div 
        className="fixed z-[9999] w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
        }}
      >
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Filter Options</h3>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {activeFilterCount} active
              </span>
            )}
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto p-4">
          <div className="mb-6">
            <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Network
            </label>
            <div className="space-y-2">
              {NETWORKS.map(network => (
                <label key={network} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={localFilters.network.includes(network)}
                    onChange={() => handleNetworkToggle(network)}
                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-slate-700">{network}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Zone
            </label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {ZONES.map(zone => (
                <label key={zone} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={localFilters.zone.includes(zone)}
                    onChange={() => handleZoneToggle(zone)}
                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-slate-700">{zone}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Amount Range (XAF)
            </label>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Minimum amount"
                value={localFilters.amountRange.min}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  amountRange: { ...prev.amountRange, min: e.target.value }
                }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <input
                type="number"
                placeholder="Maximum amount"
                value={localFilters.amountRange.max}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  amountRange: { ...prev.amountRange, max: e.target.value }
                }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Date Range
            </label>
            <div className="space-y-2">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="date"
                  placeholder="Start date"
                  value={localFilters.dateRange.start}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="date"
                  placeholder="End date"
                  value={localFilters.dateRange.end}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">Leave empty for no date filter</p>
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Reset All
            </button>
            <button
              onClick={handleApply}
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(dropdownContent, document.body);
};

// Simple Delete Confirmation Modal - Exactly as shown in image
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recharge: PendingRecharge | null;
}

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, recharge }: DeleteConfirmationModalProps) => {
  if (!isOpen || !recharge) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        {/* X button to close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Trash Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-slate-900">Delete Confirmation</h2>
        <p className="mt-1 text-sm text-slate-500">This action cannot be undone</p>

        {/* Message */}
        <p className="mt-4 text-sm text-slate-700">
          Are you sure you want to delete this recharge request?
        </p>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

interface ValidationModalProps {
  recharge: PendingRecharge | null;
  agentName: string;
  onClose: () => void;
  onConfirm: (outcome: AgentReportOutcome) => void;
}

const RechargeValidationModal = ({
  recharge,
  agentName,
  onClose,
  onConfirm,
}: ValidationModalProps) => {
  if (!recharge) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/80 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 px-8 py-6 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500 blur-3xl" />
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/20 p-2 backdrop-blur-sm">
                <Shield className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-amber-200">
                  Secure Validation
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-white">
                  Confirm Transaction
                </h3>
              </div>
            </div>
            <p className="mt-3 text-slate-200">
              Processing as <span className="font-semibold text-white">{agentName}</span>. 
              Please verify all details before approving.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Transaction Details */}
          <div className="mb-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
              <div className="rounded-lg bg-amber-100 p-1.5">
                <Smartphone className="h-4 w-4 text-amber-600" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                Transaction Details
              </h4>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Request ID</p>
                <p className="mt-1 font-mono text-xl font-bold text-slate-900">{recharge.id}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer</p>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">{recharge.customerName}</p>
                  <p className="text-sm text-slate-500">{recharge.phoneNumber}</p>
                </div>

                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Signal className="h-4 w-4 text-blue-500" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Network</p>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">{recharge.network}</p>
                  <p className="text-sm text-slate-500">{recharge.bundle}</p>
                </div>

                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Amount</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-blue-600">{formatAmount(recharge.amount)}</p>
                </div>

                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Location</p>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">{recharge.requestedAt}</p>
                  <p className="text-sm text-slate-500">{recharge.zone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="mb-6 rounded-2xl bg-amber-50 p-4 border border-amber-100">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Important Note</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  By approving this transaction, you confirm that all details are correct and the recharge has been successfully processed.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              Cancel & Return
            </button>
            <button
              type="button"
              onClick={() => onConfirm('SUCCESS')}
              className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <span className="relative flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Approve Transaction
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const AgentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  const agentName = user?.userName || user?.username || 'Agent';
  const [recharges, setRecharges] = useState<PendingRecharge[]>(() => loadAgentQueue());
  const [reports, setReports] = useState<AgentReportEntry[]>(() => loadAgentReports());
  const [selectedRechargeId, setSelectedRechargeId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'queue' | 'report'>(
    location.pathname.endsWith('/report') ? 'report' : 'queue'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    network: [],
    zone: [],
    amountRange: { min: '', max: '' },
    dateRange: { start: '', end: '' }
  });
  const filterButtonRef = useState<HTMLButtonElement | null>(null)[1];
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rechargeToDelete, setRechargeToDelete] = useState<PendingRecharge | null>(null);

  useEffect(() => {
    setActiveView(location.pathname.endsWith('/report') ? 'report' : 'queue');
  }, [location.pathname]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === AGENT_QUEUE_STORAGE_KEY) {
        setRecharges(loadAgentQueue());
      }

      if (event.key === AGENT_REPORT_STORAGE_KEY) {
        setReports(loadAgentReports());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const selectedRecharge =
    recharges.find((item) => item.id === selectedRechargeId) ?? null;

  const visibleRecharges = useMemo(
    () =>
      recharges.filter(
        (item) =>
          item.status !== 'Treated' &&
          (!item.isProcessing || item.processingBy === agentName)
      ),
    [agentName, recharges]
  );

  const applyFilters = (items: any[]) => {
    return items.filter(item => {
      if (filters.network.length > 0 && !filters.network.includes(item.network)) {
        return false;
      }
      
      if (filters.zone.length > 0 && !filters.zone.includes(item.zone)) {
        return false;
      }
      
      const min = parseFloat(filters.amountRange.min);
      const max = parseFloat(filters.amountRange.max);
      if (!isNaN(min) && item.amount < min) return false;
      if (!isNaN(max) && item.amount > max) return false;
      
      return true;
    });
  };

  const filteredRecharges = useMemo(() => {
    let filtered = applyFilters(visibleRecharges);
    
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.phoneNumber.includes(searchTerm) ||
          item.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [visibleRecharges, searchTerm, filters]);

  const agentReports = useMemo(
    () => reports.filter((entry) => entry.agentName === agentName),
    [agentName, reports]
  );

  const filteredReports = useMemo(() => {
    let filtered = applyFilters(agentReports.map(r => ({ ...r, amount: r.amount, network: r.network, zone: r.zone })));
    
    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.phoneNumber.includes(searchTerm) ||
          entry.rechargeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [agentReports, searchTerm, filters]);

  const metrics = useMemo(() => {
    const untreated = visibleRecharges.filter((item) => item.status === 'Untreated').length;
    const totalAmount = visibleRecharges.reduce((sum, item) => sum + item.amount, 0);
    const reserved = visibleRecharges.filter((item) => item.processingBy === agentName).length;

    return { untreated, totalAmount, reserved };
  }, [agentName, visibleRecharges]);

  const reportStats = useMemo(() => {
    const successCount = agentReports.filter((entry) => entry.outcome === 'SUCCESS').length;
    const failureCount = agentReports.filter((entry) => entry.outcome === 'FAILED').length;
    const totalAmount = agentReports.reduce((sum, entry) => sum + entry.amount, 0);

    return { successCount, failureCount, totalAmount };
  }, [agentReports]);

  const updateQueue = (updater: (current: PendingRecharge[]) => PendingRecharge[]) => {
    setRecharges((current) => {
      const next = updater(current);
      saveAgentQueue(next);
      return next;
    });
  };

  const openValidationModal = (id: string) => {
    const target = recharges.find((item) => item.id === id);
    if (!target || target.status === 'Treated') return;

    updateQueue((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              isProcessing: true,
              processingBy: agentName,
            }
          : item
      )
    );

    setSelectedRechargeId(id);
  };

  const closeValidationModal = () => {
    if (!selectedRechargeId) return;

    updateQueue((current) =>
      current.map((item) =>
        item.id === selectedRechargeId && item.status !== 'Treated'
          ? {
              ...item,
              isProcessing: false,
              processingBy: null,
            }
          : item
      )
    );

    setSelectedRechargeId(null);
  };

  const confirmValidation = (outcome: AgentReportOutcome) => {
    if (!selectedRechargeId || !selectedRecharge) return;

    updateQueue((current) =>
      current.map((item) =>
        item.id === selectedRechargeId
          ? {
              ...item,
              status: 'Treated',
              isProcessing: false,
              processingBy: null,
              processedBy: agentName,
            }
          : item
      )
    );

    appendAgentReport({
      id: `${selectedRecharge.id}-${Date.now()}`,
      rechargeId: selectedRecharge.id,
      customerName: selectedRecharge.customerName,
      phoneNumber: selectedRecharge.phoneNumber,
      network: selectedRecharge.network,
      bundle: selectedRecharge.bundle,
      amount: selectedRecharge.amount,
      requestedAt: selectedRecharge.requestedAt,
      zone: selectedRecharge.zone,
      agentName,
      outcome,
      treatedAt: new Date().toLocaleString(),
    });
    setReports(loadAgentReports());

    setSelectedRechargeId(null);
  };

  const handleDeleteClick = (item: PendingRecharge) => {
    setRechargeToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (rechargeToDelete) {
      if (selectedRechargeId === rechargeToDelete.id) {
        setSelectedRechargeId(null);
      }
      updateQueue((current) => current.filter((item) => item.id !== rechargeToDelete.id));
    }
    setDeleteModalOpen(false);
    setRechargeToDelete(null);
  };

  const handleViewChange = (view: 'queue' | 'report') => {
    setActiveView(view);
    setSearchTerm('');
    setIsFilterOpen(false);
    navigate(view === 'report' ? '/agent/report' : '/agent');
  };

  const handleResetQueue = () => {
    setRecharges(resetAgentQueue());
    setSelectedRechargeId(null);
  };

  const handleResetReports = () => {
    setReports(resetAgentReports());
  };

  const activeFilterCount = 
    filters.network.length + 
    filters.zone.length + 
    (filters.amountRange.min || filters.amountRange.max ? 1 : 0) +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 shadow-xl">
          <div className="absolute inset-0">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          </div>
          
          <div className="relative px-8 py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-2 shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-amber-200">
                    Agent Workspace
                  </p>
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-white lg:text-3xl">
                  Welcome back, {agentName}
                </h1>
                <p className="mt-2 text-slate-300">
                  Manage and process recharge requests with real-time updates
                </p>
                
                <div className="mt-6">
                  <AgentNavigation activeView={activeView} onChange={handleViewChange} />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-300">Pending</p>
                      <p className="mt-1 text-3xl font-bold text-white">{metrics.untreated}</p>
                    </div>
                    <div className="h-10 w-px bg-white/20" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-300">In Validation</p>
                      <p className="mt-1 text-3xl font-bold text-white">{metrics.reserved}</p>
                    </div>
                    <div className="h-10 w-px bg-white/20" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-300">Queue Value</p>
                      <p className="mt-1 text-2xl font-bold text-amber-300">{formatAmount(metrics.totalAmount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Table Header */}
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {activeView === 'queue' ? 'Pending Recharge Queue' : 'Transaction History'}
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  {activeView === 'queue' 
                    ? `${filteredRecharges.length} of ${visibleRecharges.length} requests displayed` 
                    : `${filteredReports.length} of ${agentReports.length} transactions displayed`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 lg:w-64"
                  />
                </div>

                <button
                  ref={filterButtonRef}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition-all hover:bg-slate-50"
                >
                  <Filter className="h-5 w-5" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition-all hover:bg-slate-50">
                  <Download className="h-5 w-5" />
                </button>

                <div className="h-6 w-px bg-slate-200" />

                <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
                  <UserCircle2 className="h-5 w-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">{agentName}</span>
                </div>

                <button
                  type="button"
                  onClick={activeView === 'queue' ? handleResetQueue : handleResetReports}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:scale-[1.02]"
                >
                  <RefreshCw className="mr-2 inline-block h-4 w-4" />
                  Reset Data
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {activeView === 'queue' ? (
                    <>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Request ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Network</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Bundle</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Time</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Request ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Network</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Bundle</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Outcome</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Processed At</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeView === 'queue' ? (
                  filteredRecharges.length > 0 ? (
                    filteredRecharges.map((item) => {
                      const isMine = item.processingBy === agentName;
                      
                      return (
                        <tr
                          key={item.id}
                          className={`group transition-all hover:bg-slate-50 ${
                            isMine ? 'bg-amber-50/50' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <p className="font-mono text-sm font-bold text-slate-900">{item.id}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{item.zone}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
                                <UserCircle2 className="h-5 w-5 text-slate-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{item.customerName}</p>
                                <p className="text-sm text-slate-500">{item.phoneNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                              <RadioTower className="h-3.5 w-3.5" />
                              {item.network}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-slate-700">{item.bundle}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-lg font-bold text-slate-900">{formatAmount(item.amount)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-600">{item.requestedAt}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                isMine
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${isMine ? 'bg-amber-500' : 'bg-blue-500'}`} />
                              {isMine ? 'In Validation' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openValidationModal(item.id)}
                                className={`group relative overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                                  isMine
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl'
                                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl'
                                }`}
                              >
                                <span className="relative z-10">{isMine ? 'Continue' : 'Process'}</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(item)}
                                className="rounded-xl border border-slate-200 p-2 text-slate-400 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <button className="rounded-xl border border-slate-200 p-2 text-slate-400 transition-all hover:bg-slate-50">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-20 text-center">
                        <div className="mx-auto max-w-md">
                          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                            <Clock3 className="h-10 w-10 text-slate-400" />
                          </div>
                          <h3 className="mt-6 text-xl font-bold text-slate-900">No pending requests</h3>
                          <p className="mt-2 text-slate-500">
                            {searchTerm || activeFilterCount > 0 
                              ? 'No results match your search criteria.' 
                              : 'Your queue is empty. Reset to add sample data.'}
                          </p>
                          {!searchTerm && activeFilterCount === 0 && (
                            <button
                              onClick={handleResetQueue}
                              className="mt-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl"
                            >
                              Load Sample Data
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                ) : (
                  filteredReports.length > 0 ? (
                    filteredReports.map((entry: any) => (
                      <tr
                        key={entry.id}
                        className="group transition-all hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm font-bold text-slate-900">{entry.rechargeId}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{entry.zone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
                              <UserCircle2 className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{entry.customerName}</p>
                              <p className="text-sm text-slate-500">{entry.phoneNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-700">{entry.network}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-700">{entry.bundle}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-lg font-bold text-slate-900">{formatAmount(entry.amount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                              entry.outcome === 'SUCCESS'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {entry.outcome === 'SUCCESS' ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <AlertTriangle className="h-3.5 w-3.5" />
                            )}
                            {entry.outcome === 'SUCCESS' ? 'Successful' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600">{entry.treatedAt}</p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="mx-auto max-w-md">
                          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                            <BarChart3 className="h-10 w-10 text-slate-400" />
                          </div>
                          <h3 className="mt-6 text-xl font-bold text-slate-900">No transactions yet</h3>
                          <p className="mt-2 text-slate-500">
                            {searchTerm || activeFilterCount > 0 
                              ? 'No results match your search criteria.' 
                              : 'Process recharges from the queue to see your history.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <FilterDropdown
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        activeView={activeView}
        buttonRef={{ current: filterButtonRef } as React.RefObject<HTMLButtonElement>}
      />

      <RechargeValidationModal
        recharge={selectedRecharge}
        agentName={agentName}
        onClose={closeValidationModal}
        onConfirm={confirmValidation}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRechargeToDelete(null);
        }}
        onConfirm={confirmDelete}
        recharge={rechargeToDelete}
      />
    </Layout>
  );
};

export default AgentDashboard;