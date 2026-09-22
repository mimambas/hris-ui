'use client';

import { useMemo, useState } from 'react';
import { Search, Download, Filter, ShieldCheck, UserPlus, FileText, Settings, LogIn, MoreHorizontal, X, ChevronDown, CalendarDays } from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

type AuditEntry = {
  id: string; actor: string; initials: string; action: string; target: string;
  category: string; time: string; ip: string; icon: typeof ShieldCheck; color: string;
  date: string; detail: string;
};

const auditEntries: AuditEntry[] = [
  { id: '1', actor: 'Rina Sari', initials: 'RS', action: 'Updated employee record', target: 'Budi Hartono · EMP-20260101-002', category: 'Employee', time: 'Today, 09:42', ip: '103.28.14.21', icon: UserPlus, color: 'bg-primary-surface text-primary', date: '22 Sep', detail: 'Updated phone number from +62 813-4567-8900 to +62 813-4567-8901. Changed emergency contact details.' },
  { id: '2', actor: 'System', initials: 'SY', action: 'Payroll processed', target: 'September 2026 payroll · 478 employees', category: 'Payroll', time: 'Today, 08:15', ip: 'Internal', icon: Settings, color: 'bg-cta-surface text-cta-hover', date: '22 Sep', detail: 'Monthly payroll batch processed. Total disbursement: Rp 4,200,000,000. 8 pending items flagged.' },
  { id: '3', actor: 'Budi Hartono', initials: 'BH', action: 'Downloaded document', target: 'Employment contract · EMP-20260101-002', category: 'Documents', time: 'Yesterday, 16:28', ip: '103.28.18.44', icon: FileText, color: 'bg-sky-50 text-sky-600', date: '21 Sep', detail: 'Downloaded employment contract PDF. File size: 245KB. Access logged for compliance.' },
  { id: '4', actor: 'Rina Sari', initials: 'RS', action: 'Approved leave request', target: 'Maya Anggraeni · Annual leave · 3 days', category: 'Leave', time: 'Yesterday, 14:05', ip: '103.28.14.21', icon: ShieldCheck, color: 'bg-violet-50 text-violet-600', date: '21 Sep', detail: 'Leave approved for 24-26 Sep 2026. Balance deducted: 3 days annual leave remaining: 9 days.' },
  { id: '5', actor: 'Andi Pratama', initials: 'AP', action: 'Logged in', target: 'Web application', category: 'Authentication', time: 'Yesterday, 09:12', ip: '114.125.80.7', icon: LogIn, color: 'bg-amber-50 text-accent-yellow', date: '21 Sep', detail: 'Successful login via email/password. 2FA verified. Session started from Chrome on macOS.' },
  { id: '6', actor: 'Rina Sari', initials: 'RS', action: 'Generated report', target: 'Workforce analytics · September 2026', category: 'Reports', time: '20 Sep 2026, 11:30', ip: '103.28.14.21', icon: FileText, color: 'bg-pink-50 text-pink-600', date: '20 Sep', detail: 'Generated workforce analytics report in PDF format. Date range: 01 Sep - 20 Sep 2026.' },
  { id: '7', actor: 'System', initials: 'SY', action: 'Updated notification settings', target: 'Scheduled maintenance announcement', category: 'System', time: '19 Sep 2026, 18:00', ip: 'Internal', icon: Settings, color: 'bg-surface-strong text-muted', date: '19 Sep', detail: 'System maintenance notification scheduled for 27 Sep 2026 22:00-02:00 WIB. All users will be notified.' },
  { id: '8', actor: 'Maya Anggraeni', initials: 'MA', action: 'Submitted expense claim', target: 'Travel claim · Rp 1,875,000', category: 'Expenses', time: '19 Sep 2026, 10:48', ip: '36.68.22.109', icon: FileText, color: 'bg-emerald-50 text-emerald-600', date: '19 Sep', detail: 'Travel & Transport expense claim submitted. Receipt attached. Awaiting manager approval.' },
  { id: '9', actor: 'Sari Dewi', initials: 'SD', action: 'Created job posting', target: 'Senior Marketing Manager', category: 'Employee', time: '18 Sep 2026, 14:20', ip: '36.68.22.110', icon: UserPlus, color: 'bg-primary-surface text-primary', date: '18 Sep', detail: 'New job posting created for Marketing department. Salary range: Rp 18-25M. 2 openings.' },
  { id: '10', actor: 'System', initials: 'SY', action: 'BPJS sync completed', target: 'Monthly BPJS data sync · 486 employees', category: 'System', time: '17 Sep 2026, 06:00', ip: 'Internal', icon: Settings, color: 'bg-surface-strong text-muted', date: '17 Sep', detail: 'Automated monthly BPJS Kesehatan and Ketenagakerjaan data synchronization completed successfully.' },
];

const categories = ['All activity', 'Employee', 'Payroll', 'Documents', 'Leave', 'Authentication', 'Reports', 'Expenses', 'System'];

function DetailModal({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  const Icon = entry.icon;
  return <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><div className="absolute inset-0 bg-ink/40" onClick={onClose} /><div className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className={`w-11 h-11 rounded-full flex items-center justify-center ${entry.color}`}><Icon size={18} /></div><div><h2 className="text-base font-bold text-ink">{entry.action}</h2><p className="text-xs text-muted mt-0.5">{entry.time}</p></div></div><button onClick={onClose} aria-label="Close detail" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button></div><div className="mt-5 space-y-3 border-t border-hairline-soft pt-4"><div className="flex justify-between text-sm"><span className="text-muted">Actor</span><span className="font-semibold text-ink">{entry.actor}</span></div><div className="flex justify-between text-sm"><span className="text-muted">Target</span><span className="font-semibold text-ink text-right max-w-[60%] truncate">{entry.target}</span></div><div className="flex justify-between text-sm"><span className="text-muted">Category</span><span className="badge bg-surface-strong text-muted">{entry.category}</span></div><div className="flex justify-between text-sm"><span className="text-muted">IP address</span><span className="font-mono text-xs text-ink">{entry.ip}</span></div><div className="pt-3 border-t border-hairline-soft"><p className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-1.5">Details</p><p className="text-xs text-body leading-relaxed">{entry.detail}</p></div></div></div></div>;
}

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All activity');
  const [dateRange, setDateRange] = useState('This month');
  const [selected, setSelected] = useState<AuditEntry | null>(null);
  const [showExport, setShowExport] = useState(false);
  const { toast } = useToast();
  const filtered = useMemo(() => auditEntries.filter((entry) => {
    const matchesCategory = category === 'All activity' || entry.category === category;
    const haystack = `${entry.actor} ${entry.action} ${entry.target} ${entry.category}`.toLowerCase();
    return matchesCategory && haystack.includes(search.toLowerCase());
  }), [search, category]);
  const handleExport = () => { setShowExport(false); toast('Audit log exported as CSV. File contains all events for the selected date range.', 'success'); };

  return (
    <div>
      <ModuleHeader eyebrow="Security & compliance" title="Audit Log" description="Track every important action across your organization" action={<button onClick={() => setShowExport(true)} className="btn-secondary gap-2"><Download size={15} /> Export log</button>} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="card"><p className="text-xs text-muted font-semibold">Events this month</p><p className="mt-2 font-mono text-2xl font-bold text-ink">2,847</p><p className="text-xs text-cta mt-1">+18.4% from last month</p></div>
        <div className="card"><p className="text-xs text-muted font-semibold">Admin actions</p><p className="mt-2 font-mono text-2xl font-bold text-ink">486</p><p className="text-xs text-muted mt-1">17.1% of all activity</p></div>
        <div className="card"><p className="text-xs text-muted font-semibold">Security events</p><p className="mt-2 font-mono text-2xl font-bold text-ink">12</p><p className="text-xs text-cta mt-1">No critical events</p></div>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline-soft space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm"><Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" /><input type="search" aria-label="Search audit log" placeholder="Search activity..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full min-h-11 rounded-pill bg-surface-strong pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <div className="flex gap-2">
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="min-h-10 px-3 rounded-pill bg-surface-strong text-xs font-semibold text-muted appearance-none pr-8 cursor-pointer"><option>This month</option><option>Last 30 days</option><option>Last 90 days</option><option>This year</option></select>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`min-h-9 px-3 rounded-pill text-[11px] font-semibold whitespace-nowrap transition-colors ${category === item ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>{item}</button>)}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead><tr className="border-b border-hairline"><th className="table-header">Activity</th><th className="table-header">Category</th><th className="table-header">Timestamp</th><th className="table-header">IP address</th><th className="table-header w-12"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={5}><EmptyState title="No activity matches your filters" description="Try a different search term, category, or date range." /></td></tr> : filtered.map((entry) => {
                const Icon = entry.icon;
                return <tr key={entry.id} className="table-row cursor-pointer" onClick={() => setSelected(entry)}><td className="table-cell"><div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${entry.color}`}><Icon size={15} /></div><div className="min-w-0"><p className="text-sm font-semibold text-ink">{entry.action}</p><p className="text-xs text-muted mt-0.5 truncate">{entry.actor} · {entry.target}</p></div></div></td><td className="table-cell"><span className="badge bg-surface-strong text-muted">{entry.category}</span></td><td className="table-cell text-xs text-body whitespace-nowrap">{entry.time}</td><td className="table-cell text-xs font-mono text-muted">{entry.ip}</td><td className="table-cell"><button onClick={(e) => { e.stopPropagation(); setSelected(entry); }} aria-label={`Details for ${entry.action}`} className="min-h-10 min-w-10 rounded-md hover:bg-primary-surface"><MoreHorizontal size={16} className="mx-auto text-muted" /></button></td></tr>;
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-hairline-soft flex items-center justify-between text-xs text-muted">
          <span>Showing {filtered.length} of {auditEntries.length} recent events</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-cta" /> Logs retained for 7 years</span>
        </div>
      </div>
      {selected && <DetailModal entry={selected} onClose={() => setSelected(null)} />}
      {showExport && <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><div className="absolute inset-0 bg-ink/40" onClick={() => setShowExport(false)} /><div className="relative w-full max-w-sm rounded-2xl bg-canvas border border-hairline shadow-2xl p-6"><div className="flex items-center justify-between mb-4"><h2 className="text-base font-bold text-ink">Export audit log</h2><button onClick={() => setShowExport(false)} aria-label="Close export" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button></div><div className="space-y-4"><label className="block text-sm font-semibold text-ink">Date range<select defaultValue="this-month" className="input-field mt-1.5"><option value="this-month">This month</option><option value="last-30">Last 30 days</option><option value="last-90">Last 90 days</option><option value="all">All time</option></select></label><label className="block text-sm font-semibold text-ink">Format<select defaultValue="csv" className="input-field mt-1.5"><option value="csv">CSV</option><option value="json">JSON</option></select></label></div><div className="flex gap-3 justify-end mt-6 pt-4 border-t border-hairline-soft"><button onClick={() => setShowExport(false)} className="btn-secondary text-sm">Cancel</button><button onClick={handleExport} className="btn-cta text-sm gap-2"><Download size={14} /> Export</button></div></div></div>}
    </div>
  );
}
