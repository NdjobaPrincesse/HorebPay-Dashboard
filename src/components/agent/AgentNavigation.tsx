interface AgentNavigationProps {
  activeView: 'queue' | 'report';
  onChange: (view: 'queue' | 'report') => void;
}

const AgentNavigation = ({ activeView, onChange }: AgentNavigationProps) => {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-2">
      <button
        type="button"
        onClick={() => onChange('queue')}
        className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
          activeView === 'queue'
            ? 'bg-[#1e3a8a] text-white shadow-lg shadow-blue-900/15'
            : 'bg-white text-slate-600 hover:bg-slate-100'
        }`}
      >
        Pending Queue
      </button>
      <button
        type="button"
        onClick={() => onChange('report')}
        className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
          activeView === 'report'
            ? 'bg-[#1e3a8a] text-white shadow-lg shadow-blue-900/15'
            : 'bg-white text-slate-600 hover:bg-slate-100'
        }`}
      >
        Report
      </button>
    </div>
  );
};

export default AgentNavigation;
