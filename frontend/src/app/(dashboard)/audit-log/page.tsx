'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { Search, Download, Filter, ShieldCheck, UserPlus, FileText, Settings, LogIn, MoreHorizontal, X, ChevronDown, CalendarDays } from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { downloadCsv } from '@/lib/csv';

type AuditEntry = {
  id: string; actor: string; initials: string; action: string; target: string;
  category: string; time: string; ip: string; icon: typeof ShieldCheck; color: string;
  date: string; dateISO: string; detail: string;
  before?: Record<string, string>;
  after?: Record<string, string>;
};

const categories = ['All activity', 'Employee', 'Payroll', 'Documents', 'Leave', 'Authentication', 'Reports', 'Expenses', 'System'];

/* ---------- Date range helper ---------- */
function inRange(isoDate: string, range: string): boolean {
  if (range === 'All time' || range === 'This year') return true;
  const d = new Date(isoDate);
  const now = new Date();
  if (range === 'Last 90 days') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    return d >= cutoff;
  }
  if (range === 'Last 30 days') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return d >= cutoff;
  }
  if (range === 'This month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  return true;
}

/* ---------- Detail Modal ---------- */
function DetailModal({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  const Icon = entry.icon;
  const hasBeforeAfter = entry.before && entry.after;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center ${entry.color}`}><Icon size={18} /></div>
            <div><h2 className="text-base font-bold text-ink">{entry.action}</h2><p className="text-xs text-muted mt-0.5">{entry.time}</p></div>
          </div>
          <button onClick={onClose} aria-label="Close detail" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>
        <div className="mt-5 space-y-3 border-t border-hairline-soft pt-4">
          <div className="flex justify-between text-sm"><span className="text-muted">Actor</span><span className="font-semibold text-ink">{entry.actor}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted">Target</span><span className="font-semibold text-ink text-right max-w-[60%] truncate">{entry.target}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted">Category</span><span className="badge bg-surface-strong text-muted">{entry.category}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted">IP address</span><span className="font-mono text-xs text-ink">{entry.ip}</span></div>
          <div className="pt-3 border-t border-hairline-soft">
            <p className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-1.5">Details</p>
            <p className="text-xs text-body leading-relaxed">{entry.detail}</p>
          </div>
          {hasBeforeAfter && (
            <div className="pt-3 border-t border-hairline-soft">
              <p className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2">Changes</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-hairline-soft">
                      <th className="text-left py-1.5 pr-3 font-semibold text-muted">Field</th>
                      <th className="text-left py-1.5 pr-3 font-semibold text-semantic-down">Before</th>
                      <th className="text-left py-1.5 font-semibold text-cta-hover">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(entry.before!).map((field) => (
                      <tr key={field} className="border-b border-hairline-soft last:border-0">
                        <td className="py-1.5 pr-3 text-muted font-medium">{field}</td>
                        <td className="py-1.5 pr-3 text-body">{entry.before![field]}</td>
                        <td className="py-1.5 text-ink font-semibold">{entry.after![field]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Export Modal ---------- */
function ExportModal({ entries, onClose }: { entries: AuditEntry[]; onClose: () => void }) {
  const [expRange, setExpRange] = useState('all');
  const [expFormat, setExpFormat] = useState('csv');
  const { toast } = useToast();

  const handleExport = () => {
    const filtered = entries.filter((e) => inRange(e.dateISO, expRange === 'this-month' ? 'This month' : expRange === 'last-30' ? 'Last 30 days' : expRange === 'last-90' ? 'Last 90 days' : 'All time'));
    if (expFormat === 'csv') {
      downloadCsv(filtered, `audit-log-${new Date().toISOString().slice(0, 10)}.csv`, [
        { key: 'id', header: 'ID' },
        { key: 'actor', header: 'Actor' },
        { key: 'action', header: 'Action' },
        { key: 'target', header: 'Target' },
        { key: 'category', header: 'Category' },
        { key: 'time', header: 'Timestamp' },
        { key: 'ip', header: 'IP Address' },
        { key: 'detail', header: 'Detail' },
      ]);
      toast(`Audit log exported as CSV (${filtered.length} rows).`, 'success');
    } else {
      const json = JSON.stringify(filtered, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast(`Audit log exported as JSON (${filtered.length} rows).`, 'success');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-ink">Export audit log</h2>
          <button onClick={onClose} aria-label="Close export" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-ink">Date range
            <select value={expRange} onChange={(e) => setExpRange(e.target.value)} className="input-field mt-1.5">
              <option value="this-month">This month</option>
              <option value="last-30">Last 30 days</option>
              <option value="last-90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-ink">Format
            <select value={expFormat} onChange={(e) => setExpFormat(e.target.value)} className="input-field mt-1.5">
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </label>
        </div>
        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-hairline-soft">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleExport} className="btn-cta text-sm gap-2"><Download size={14} /> Export</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All activity');
  const [dateRange, setDateRange] = useState('All time');
  const [actorFilter, setActorFilter] = useState('All actors');
  const [actionFilter, setActionFilter] = useState('All actions');
  const [selected, setSelected] = useState<AuditEntry | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    const iconMap: Record<string, typeof ShieldCheck> = { Authentication: LogIn, Documents: FileText, Payroll: Settings, Reports: FileText, Leave: ShieldCheck, Expenses: FileText, Employee: UserPlus, System: Settings };
    const colorMap: Record<string, string> = { Authentication: 'bg-amber-50 text-accent-yellow', Documents: 'bg-sky-50 text-sky-600', Payroll: 'bg-cta-surface text-cta-hover', Reports: 'bg-pink-50 text-pink-600', Leave: 'bg-violet-50 text-violet-600', Expenses: 'bg-emerald-50 text-emerald-600', Employee: 'bg-primary-surface text-primary', System: 'bg-surface-strong text-muted' };
    api.get('/audit-log', { params: { search, category } }).then((response) => { if (active) setEntries((response.data.items ?? []).map((entry: any) => ({ ...entry, icon: iconMap[entry.category] ?? ShieldCheck, color: colorMap[entry.category] ?? 'bg-surface-strong text-muted' }))); }).catch(() => toast('Unable to load audit log.', 'error')).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, category, toast]);

  const uniqueActors = ['All actors', ...Array.from(new Set(entries.map((e) => e.actor)))];
  const uniqueActions = ['All actions', ...Array.from(new Set(entries.map((e) => e.action)))];
  const filtered = useMemo(() => entries.filter((entry) => {
    const matchesDate = inRange(entry.dateISO, dateRange);
    const matchesActor = actorFilter === 'All actors' || entry.actor === actorFilter;
    const matchesAction = actionFilter === 'All actions' || entry.action === actionFilter;
    return matchesDate && matchesActor && matchesAction;
  }), [entries, dateRange, actorFilter, actionFilter]);

  return (
    <div>
      <ModuleHeader eyebrow="Security & compliance" title="Audit Log" description="Track every important action across your organization" action={<button onClick={() => setShowExport(true)} className="btn-secondary gap-2"><Download size={15} /> Export log</button>} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="card"><p className="text-xs text-muted font-semibold">Events this month</p><p className="mt-2 font-mono text-2xl font-bold text-ink">{entries.length}</p><p className="text-xs text-muted mt-1">Loaded events</p></div>
        <div className="card"><p className="text-xs text-muted font-semibold">Admin actions</p><p className="mt-2 font-mono text-2xl font-bold text-ink">{new Set(entries.map((entry) => entry.actor)).size}</p><p className="text-xs text-muted mt-1">Unique actors</p></div>
        <div className="card"><p className="text-xs text-muted font-semibold">Security events</p><p className="mt-2 font-mono text-2xl font-bold text-ink">{entries.filter((entry) => entry.category === 'Authentication').length}</p><p className="text-xs text-muted mt-1">Authentication events</p></div>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline-soft space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm"><Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" /><input type="search" aria-label="Search audit log" placeholder="Search activity..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full min-h-11 rounded-pill bg-surface-strong pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <div className="flex gap-2">
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="min-h-10 px-3 rounded-pill bg-surface-strong text-xs font-semibold text-muted appearance-none pr-8 cursor-pointer"><option>All time</option><option>This month</option><option>Last 30 days</option><option>Last 90 days</option><option>This year</option></select>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-muted" />
              <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} className="min-h-9 px-3 rounded-pill bg-surface-strong text-[11px] font-semibold text-muted appearance-none pr-8 cursor-pointer">
                {uniqueActors.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="min-h-9 px-3 rounded-pill bg-surface-strong text-[11px] font-semibold text-muted appearance-none pr-8 cursor-pointer">
                {uniqueActions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`min-h-9 px-3 rounded-pill text-[11px] font-semibold whitespace-nowrap transition-colors ${category === item ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>{item}</button>)}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead><tr className="border-b border-hairline"><th className="table-header">Activity</th><th className="table-header">Category</th><th className="table-header">Timestamp</th><th className="table-header">IP address</th><th className="table-header w-12"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5}><div className="p-8 text-center text-sm text-muted">Loading audit log…</div></td></tr> : filtered.length === 0 ? <tr><td colSpan={5}><EmptyState title="No activity matches your filters" description="Try a different search term, category, or date range." /></td></tr> : filtered.map((entry) => {
                const Icon = entry.icon;
                return <tr key={entry.id} className="table-row cursor-pointer" onClick={() => setSelected(entry)}><td className="table-cell"><div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${entry.color}`}><Icon size={15} /></div><div className="min-w-0"><p className="text-sm font-semibold text-ink">{entry.action}</p><p className="text-xs text-muted mt-0.5 truncate">{entry.actor} · {entry.target}</p></div></div></td><td className="table-cell"><span className="badge bg-surface-strong text-muted">{entry.category}</span></td><td className="table-cell text-xs text-body whitespace-nowrap">{entry.time}</td><td className="table-cell text-xs font-mono text-muted">{entry.ip}</td><td className="table-cell"><button onClick={(e) => { e.stopPropagation(); setSelected(entry); }} aria-label={`Details for ${entry.action}`} className="min-h-10 min-w-10 rounded-md hover:bg-primary-surface"><MoreHorizontal size={16} className="mx-auto text-muted" /></button></td></tr>;
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-hairline-soft flex items-center justify-between text-xs text-muted">
          <span>Showing {filtered.length} of {entries.length} recent events</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-cta" /> Logs retained for 7 years</span>
        </div>
      </div>
      {selected && <DetailModal entry={selected} onClose={() => setSelected(null)} />}
      {showExport && <ExportModal entries={filtered} onClose={() => setShowExport(false)} />}
    </div>
  );
}
