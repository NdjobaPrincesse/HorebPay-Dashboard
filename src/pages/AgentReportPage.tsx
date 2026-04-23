import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, Clock3, UserCircle2 } from 'lucide-react';
import Layout from '../components/Layout';
import AgentNavigation from '../components/agent/AgentNavigation';
import {
  AGENT_REPORT_STORAGE_KEY,
  type AgentReportEntry,
  loadAgentReports,
} from '../utils/agentStorage';
import { getStoredUser } from '../api/auth';

const formatAmount = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(value);

const AgentReportPage = () => {
  const user = getStoredUser();
  const agentName = user?.userName || user?.username || 'Agent';
  const [reports, setReports] = useState<AgentReportEntry[]>(() => loadAgentReports());

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== AGENT_REPORT_STORAGE_KEY) return;
      setReports(loadAgentReports());
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const agentReports = useMemo(
    () => reports.filter((entry) => entry.agentName === agentName),
    [agentName, reports]
  );

  const stats = useMemo(() => {
    const successCount = agentReports.filter((entry) => entry.outcome === 'SUCCESS').length;
    const failureCount = agentReports.filter((entry) => entry.outcome === 'FAILED').length;
    const totalAmount = agentReports.reduce((sum, entry) => sum + entry.amount, 0);

    return {
      successCount,
      failureCount,
      totalAmount,
    };
  }, [agentReports]);

  return (
    <Layout>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-[1.6rem] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(255,193,7,0.24),_transparent_30%),linear-gradient(135deg,#082f49_0%,#0f172a_55%,#1d4ed8_100%)] px-5 py-6 text-white shadow-2xl shadow-blue-950/20 sm:rounded-[2.2rem] sm:px-6 sm:py-8 md:px-8">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-100/80">
                Agent Report
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                Track every recharge you treated.
              </h1>
              <p className="mt-4 text-sm leading-7 text-blue-100/85 md:text-base">
                This report shows all recharge requests you completed, whether the
                result was successful or failed.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <AgentNavigation />
              <div className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-3 text-sm font-semibold text-blue-50">
                <UserCircle2 className="h-4 w-4 text-blue-100" />
                Active agent: <span className="text-white">{agentName}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <p className="text-sm font-semibold text-slate-500">Successful</p>
            </div>
            <p className="mt-4 text-3xl font-black text-slate-900">{stats.successCount}</p>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              <p className="text-sm font-semibold text-slate-500">Failed</p>
            </div>
            <p className="mt-4 text-3xl font-black text-slate-900">{stats.failureCount}</p>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-cyan-500" />
              <p className="text-sm font-semibold text-slate-500">Handled Value</p>
            </div>
            <p className="mt-4 text-3xl font-black text-slate-900">{formatAmount(stats.totalAmount)}</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 sm:rounded-[2rem]">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
                History
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                Treated Transactions Report
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Every recharge you marked as success or failure will appear here.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full text-left md:min-w-full">
              <thead className="bg-slate-50/90 text-xs uppercase tracking-[0.22em] text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Request</th>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Network</th>
                  <th className="px-6 py-4 font-bold">Bundle</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Outcome</th>
                  <th className="px-6 py-4 font-bold">Treated At</th>
                </tr>
              </thead>
              <tbody>
                {agentReports.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-t border-slate-100 align-top transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900">{entry.rechargeId}</p>
                      <p className="mt-1 text-sm text-slate-500">{entry.zone}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900">{entry.customerName}</p>
                      <p className="mt-1 text-sm text-slate-500">{entry.phoneNumber}</p>
                    </td>
                    <td className="px-6 py-5 font-semibold text-slate-700">{entry.network}</td>
                    <td className="px-6 py-5 font-semibold text-slate-700">{entry.bundle}</td>
                    <td className="px-6 py-5 font-black text-slate-900">{formatAmount(entry.amount)}</td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-sm font-bold ${
                          entry.outcome === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {entry.outcome === 'SUCCESS' ? 'Successful' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <Clock3 className="h-4 w-4 text-slate-400" />
                        {entry.treatedAt}
                      </div>
                    </td>
                  </tr>
                ))}

                {agentReports.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                          <BarChart3 className="h-7 w-7 text-blue-600" />
                        </div>
                        <h3 className="mt-5 text-xl font-black text-slate-900">
                          No report entries yet
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Once you validate a recharge from the pending queue, the result
                          will appear here automatically.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AgentReportPage;
