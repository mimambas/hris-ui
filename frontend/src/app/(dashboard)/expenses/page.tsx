'use client';

import { useState, useMemo } from 'react';
import {
  Receipt, Wallet, Clock, CheckCircle2, Search, Plus, MoreHorizontal, X, Eye,
  AlertTriangle, FileText, CalendarDays, Filter, Upload,
} from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'draft';

type ExpenseRecord = {
  id: string;
  employee: string;
  initials: string;
  department: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  receiptAttached: boolean;
  status: ExpenseStatus;
  submittedDate: string;
  reviewedBy?: string;
  reviewNote?: string;
};

const statusMeta: Record<ExpenseStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-accent-yellow' },
  approved: { label: 'Approved', color: 'bg-cta-surface text-cta-hover' },
  rejected: { label: 'Rejected', color: 'bg-red-50 text-semantic-down' },
  draft: { label: 'Draft', color: 'bg-surface-strong text-muted' },
};

const categories = ['All', 'Travel & Transport', 'Client Entertainment', 'Software & Tools', 'Office Supplies', 'Meals & Entertainment', 'Training & Development'];
const statuses: ExpenseStatus[] = ['pending', 'approved', 'rejected'];

const mockExpenses: ExpenseRecord[] = [
  { id: 'EXP-0261', employee: 'Andi Pratama', initials: 'AP', department: 'Finance', category: 'Client Entertainment', amount: 2450000, date: '22 Sep 2026', description: 'Client dinner with PT Sejahtera at Hotel Mulia', receiptAttached: true, status: 'pending', submittedDate: '22 Sep 2026' },
  { id: 'EXP-0260', employee: 'Maya Anggraeni', initials: 'MA', department: 'Design', category: 'Travel & Transport', amount: 1875000, date: '21 Sep 2026', description: 'Grab to client office in BSD', receiptAttached: true, status: 'approved', submittedDate: '21 Sep 2026', reviewedBy: 'Rina Sari' },
  { id: 'EXP-0259', employee: 'Budi Hartono', initials: 'BH', department: 'Engineering', category: 'Software & Tools', amount: 950000, date: '20 Sep 2026', description: 'Annual Figma subscription renewal', receiptAttached: true, status: 'approved', submittedDate: '20 Sep 2026', reviewedBy: 'Andi Pratama' },
  { id: 'EXP-0258', employee: 'Rizky Prasetyo', initials: 'RP', department: 'Engineering', category: 'Travel & Transport', amount: 3200000, date: '19 Sep 2026', description: 'Flight to Surabaya for conference', receiptAttached: true, status: 'rejected', submittedDate: '19 Sep 2026', reviewedBy: 'Andi Pratama', reviewNote: 'Conference not approved for this quarter' },
  { id: 'EXP-0257', employee: 'Sari Dewi', initials: 'SD', department: 'Marketing', category: 'Office Supplies', amount: 680000, date: '18 Sep 2026', description: 'Printer paper and toner for marketing dept', receiptAttached: false, status: 'pending', submittedDate: '18 Sep 2026' },
  { id: 'EXP-0256', employee: 'Dimas Saputra', initials: 'DS', department: 'Engineering', category: 'Training & Development', amount: 4500000, date: '15 Sep 2026', description: 'AWS re:Invent virtual pass', receiptAttached: true, status: 'approved', submittedDate: '15 Sep 2026', reviewedBy: 'Budi Hartono' },
  { id: 'EXP-0255', employee: 'Nadia Putri', initials: 'NP', department: 'Design', category: 'Software & Tools', amount: 750000, date: '14 Sep 2026', description: 'Notion team subscription', receiptAttached: true, status: 'approved', submittedDate: '14 Sep 2026', reviewedBy: 'Maya Anggraeni' },
  { id: 'EXP-0254', employee: 'Fajar Nugroho', initials: 'FN', department: 'Engineering', category: 'Meals & Entertainment', amount: 1200000, date: '12 Sep 2026', description: 'Team lunch during sprint retrospective', receiptAttached: true, status: 'pending', submittedDate: '12 Sep 2026' },
  { id: 'EXP-0253', employee: 'Yuni Kartika', initials: 'YK', department: 'Customer Success', category: 'Travel & Transport', amount: 890000, date: '10 Sep 2026', description: 'Grab to client meeting in Jakarta Selatan', receiptAttached: true, status: 'approved', submittedDate: '10 Sep 2026', reviewedBy: 'Rina Sari' },
  { id: 'EXP-0252', employee: 'Arief Wibowo', initials: 'AW', department: 'Finance', category: 'Office Supplies', amount: 350000, date: '08 Sep 2026', description: 'Desk organizer and stationery', receiptAttached: false, status: 'rejected', submittedDate: '08 Sep 2026', reviewedBy: 'Andi Pratama', reviewNote: 'Receipt required for claims over Rp 200.000' },
];

function formatRupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function ClaimDetailModal({ record, onClose, onApprove, onReject }: {
  record: ExpenseRecord;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, note: string) => void;
}) {
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="claim-title">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-canvas border border-hairline shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-canvas border-b border-hairline-soft px-6 py-4 z-10 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-mono text-primary">{record.id}</p>
            <h2 id="claim-title" className="text-base font-bold text-ink mt-1">Expense claim detail</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>

        <div className="px-6 py-4 border-b border-hairline-soft">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Employee</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-7 h-7 rounded-full bg-primary-surface flex items-center justify-center"><span className="text-[10px] font-bold text-primary">{record.initials}</span></div>
                <div>
                  <p className="text-sm font-semibold text-ink">{record.employee}</p>
                  <p className="text-[11px] text-muted">{record.department}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Status</p>
              <span className={`badge ${statusMeta[record.status]?.color} mt-1.5`}>{statusMeta[record.status]?.label}</span>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Category</p>
              <p className="text-sm font-semibold text-ink mt-1.5">{record.category}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Amount</p>
              <p className="text-sm font-mono font-bold text-ink mt-1.5">{formatRupiah(record.amount)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Expense date</p>
              <p className="text-sm text-ink mt-1.5">{record.date}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Submitted</p>
              <p className="text-sm text-ink mt-1.5">{record.submittedDate}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-hairline-soft">
          <p className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2">Description</p>
          <p className="text-sm text-body">{record.description}</p>
        </div>

        <div className="px-6 py-4 border-b border-hairline-soft">
          <p className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2">Receipt</p>
          {record.receiptAttached ? (
            <div className="flex items-center gap-2 text-sm text-cta"><FileText size={14} /> Receipt attached</div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-600"><AlertTriangle size={14} /> No receipt attached</div>
          )}
        </div>

        {record.reviewedBy && (
          <div className="px-6 py-4 border-b border-hairline-soft">
            <p className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2">Reviewed by</p>
            <p className="text-sm text-ink">{record.reviewedBy}</p>
            {record.reviewNote && <p className="text-xs text-muted mt-1">{record.reviewNote}</p>}
          </div>
        )}

        {record.status === 'pending' && (
          <div className="px-6 py-4 flex gap-3 justify-end">
            <button onClick={() => setShowReject(!showReject)} className="btn-secondary text-sm gap-2 text-semantic-down border-semantic-down/30">Reject</button>
            <button onClick={() => { onApprove(record.id); onClose(); }} className="btn-cta text-sm gap-2">Approve claim</button>
          </div>
        )}

        {showReject && (
          <div className="px-6 pb-4">
            <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Reason for rejection…" className="input-field w-full" rows={2} />
            <button onClick={() => { onReject(record.id, rejectNote); onClose(); }} className="mt-2 min-h-10 px-4 rounded-pill bg-semantic-down text-white text-sm font-semibold hover:bg-red-600 transition-colors">Confirm rejection</button>
          </div>
        )}
      </div>
    </div>
  );
}

function SubmitClaimModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: { category: string; amount: number; description: string; date: string }) => void }) {
  const [error, setError] = useState('');
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const category = String(data.get('category') || '');
    const amount = Number(data.get('amount') || 0);
    const description = String(data.get('description') || '').trim();
    const date = String(data.get('date') || '');
    if (!category || amount <= 0 || !description || !date) { setError('All fields are required and amount must be greater than 0.'); return; }
    onSubmit({ category, amount, description, date });
  };
  return <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><div className="absolute inset-0 bg-ink/40" onClick={onClose} /><form onSubmit={submit} className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6"><div className="flex items-center justify-between mb-5"><div><h2 className="text-base font-bold text-ink">Submit expense claim</h2><p className="text-xs text-muted mt-1">Attach a receipt if available</p></div><button type="button" onClick={onClose} aria-label="Close claim form" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button></div><div className="space-y-4"><label className="block text-sm font-semibold text-ink">Category<select name="category" className="input-field mt-1.5"><option value="">Select category…</option><option>Travel & Transport</option><option>Client Entertainment</option><option>Software & Tools</option><option>Office Supplies</option><option>Meals & Entertainment</option><option>Training & Development</option></select></label><label className="block text-sm font-semibold text-ink">Amount (IDR)<input name="amount" type="number" min="0" placeholder="e.g. 1500000" className="input-field mt-1.5 font-mono" /></label><label className="block text-sm font-semibold text-ink">Description<textarea name="description" rows={2} placeholder="What was this expense for?" className="input-field mt-1.5" /></label><label className="block text-sm font-semibold text-ink">Date<input name="date" type="date" className="input-field mt-1.5" /></label><div className="rounded-lg border border-dashed border-hairline p-4 text-center"><Upload size={20} className="mx-auto text-muted-soft mb-2" /><p className="text-xs text-muted">Drag and drop receipt or <span className="text-primary font-semibold cursor-pointer">browse</span></p><p className="text-[10px] text-muted-soft mt-1">PNG, JPG, PDF up to 5MB</p></div>{error && <p role="alert" className="text-xs text-semantic-down">{error}</p>}</div><div className="flex justify-end gap-3 mt-6 pt-4 border-t border-hairline-soft"><button type="button" onClick={onClose} className="btn-secondary text-sm">Cancel</button><button type="submit" className="btn-cta text-sm gap-2"><Receipt size={14} /> Submit claim</button></div></form></div>;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(mockExpenses);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | ExpenseStatus>('all');
  const [selectedClaim, setSelectedClaim] = useState<ExpenseRecord | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const { toast } = useToast();

  const filtered = useMemo(() => expenses.filter((r) => {
    const matchSearch = r.employee.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || r.category === category;
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  }), [expenses, search, category, statusFilter]);

  const totalAmount = filtered.reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = filtered.filter((r) => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
  const approvedAmount = filtered.filter((r) => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0);
  const pendingCount = filtered.filter((r) => r.status === 'pending').length;

  const approveClaim = (id: string) => { setExpenses((rows) => rows.map((r) => r.id === id ? { ...r, status: 'approved' as ExpenseStatus, reviewedBy: 'You' } : r)); toast('Expense claim approved.', 'success'); };
  const rejectClaim = (id: string, note: string) => { setExpenses((rows) => rows.map((r) => r.id === id ? { ...r, status: 'rejected' as ExpenseStatus, reviewedBy: 'You', reviewNote: note } : r)); toast('Expense claim rejected.', 'success'); };
  const submitClaim = (data: { category: string; amount: number; description: string; date: string }) => {
    setExpenses((rows) => [{ id: `EXP-${String(rows.length + 262).padStart(4, '0')}`, employee: 'You', initials: 'YO', department: 'HR', category: data.category, amount: data.amount, date: new Date(`${data.date}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), description: data.description, receiptAttached: false, status: 'pending', submittedDate: '22 Sep 2026' }, ...rows]);
    setShowSubmit(false);
    toast('Expense claim submitted for review.', 'success');
  };

  return <div>
    <ModuleHeader eyebrow="Finance" title="Expenses" description="Review employee claims and keep spending on track" action={<button onClick={() => setShowSubmit(true)} className="btn-cta gap-2"><Plus size={15} /> New Claim</button>} />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      <StatCard icon={Receipt} label="Total claims" value={`${(totalAmount / 1000000).toFixed(1)}M`} tone="primary" detail={`${filtered.length} records`} />
      <StatCard icon={Clock} label="Pending approval" value={`${(pendingAmount / 1000000).toFixed(1)}M`} tone="amber" detail={`${pendingCount} claims`} />
      <StatCard icon={CheckCircle2} label="Approved" value={`${(approvedAmount / 1000000).toFixed(1)}M`} tone="green" detail={`${filtered.filter((r) => r.status === 'approved').length} claims`} />
      <StatCard icon={Wallet} label="Avg. claim" value={filtered.length > 0 ? `${(totalAmount / filtered.length / 1000).toFixed(0)}K` : 'Rp 0'} tone="primary" detail="Per submission" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      <div className="card lg:col-span-2">
        <h2 className="text-sm font-bold text-ink mb-4">Spending by category</h2>
        <div className="space-y-4">
          {categories.filter((c) => c !== 'All').map((cat) => {
            const catTotal = expenses.filter((r) => r.category === cat).reduce((sum, r) => sum + r.amount, 0);
            const maxCat = Math.max(...categories.filter((c) => c !== 'All').map((c) => expenses.filter((r) => r.category === c).reduce((sum, r) => sum + r.amount, 0)));
            const colors: Record<string, string> = { 'Travel & Transport': 'bg-primary', 'Client Entertainment': 'bg-cta', 'Software & Tools': 'bg-violet-500', 'Office Supplies': 'bg-accent-yellow', 'Meals & Entertainment': 'bg-pink-500', 'Training & Development': 'bg-sky-500' };
            return <div key={cat}><div className="flex justify-between text-xs mb-1.5"><span className="font-semibold text-body">{cat}</span><span className="font-mono text-ink">{formatRupiah(catTotal)}</span></div><div className="h-2 rounded-full bg-surface-strong overflow-hidden"><div className={`h-full rounded-full ${colors[cat] || 'bg-primary'} transition-all`} style={{ width: `${maxCat > 0 ? (catTotal / maxCat) * 100 : 0}%` }} /></div></div>;
          })}
        </div>
      </div>
      <div className="card">
        <h2 className="text-sm font-bold text-ink mb-4">Quick summary</h2>
        <div className="space-y-3">
          {[{ label: 'Most claimed category', value: 'Travel & Transport', color: 'text-primary' }, { label: 'Avg. processing time', value: '1.2 days', color: 'text-ink' }, { label: 'Receipt compliance', value: '80%', color: 'text-cta' }, { label: 'Monthly budget used', value: 'Rp 18,4M / 25M', color: 'text-accent-yellow' }].map((item) => <div key={item.label} className="flex justify-between gap-4 border-b border-hairline-soft pb-2 last:border-0 last:pb-0"><span className="text-xs text-muted">{item.label}</span><span className={`text-xs font-semibold text-right ${item.color}`}>{item.value}</span></div>)}
        </div>
      </div>
    </div>

    <div className="card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-hairline-soft flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative max-w-xs flex-1 sm:flex-initial">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" />
            <input type="search" aria-label="Search expenses" placeholder="Search claims…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full min-h-10 rounded-pill bg-surface-strong pl-9 pr-3 py-2 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="relative">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="min-h-10 px-3 rounded-pill bg-surface-strong text-xs font-semibold text-muted appearance-none pr-8 cursor-pointer">{categories.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="flex gap-1.5">
            {(['all', ...statuses] as const).map((s) => <button key={s} onClick={() => setStatusFilter(s)} className={`min-h-8 px-3 rounded-pill text-[11px] font-semibold transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>{s === 'all' ? 'All' : statusMeta[s]?.label}</button>)}
          </div>
        </div>
        <p className="text-xs text-muted">{filtered.length} claims</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead>
            <tr className="border-b border-hairline">
              <th className="table-header">Claim</th>
              <th className="table-header">Employee</th>
              <th className="table-header">Category</th>
              <th className="table-header">Amount</th>
              <th className="table-header">Date</th>
              <th className="table-header">Receipt</th>
              <th className="table-header">Status</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={8}><EmptyState title="No expense claims found" description="Try another search, category, or status filter." /></td></tr> : filtered.map((row) => (
              <tr key={row.id} className="table-row">
                <td className="table-cell font-mono text-xs text-primary">{row.id}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-surface flex items-center justify-center"><span className="text-[10px] font-bold text-primary">{row.initials}</span></div>
                    <span className="font-semibold text-ink">{row.employee}</span>
                  </div>
                </td>
                <td className="table-cell text-body">{row.category}</td>
                <td className="table-cell font-mono text-xs text-ink">{formatRupiah(row.amount)}</td>
                <td className="table-cell text-muted text-xs">{row.date}</td>
                <td className="table-cell">{row.receiptAttached ? <CheckCircle2 size={14} className="text-cta" /> : <X size={14} className="text-muted-soft" />}</td>
                <td className="table-cell"><span className={`badge capitalize ${statusMeta[row.status]?.color}`}>{statusMeta[row.status]?.label}</span></td>
                <td className="table-cell text-right">
                  <div className="inline-flex items-center gap-1">
                    <button onClick={() => setSelectedClaim(row)} className="min-h-9 min-w-9 rounded-lg hover:bg-primary-surface inline-flex items-center justify-center" aria-label={`View ${row.id}`}><Eye size={15} className="text-primary" /></button>
                    {row.status === 'pending' && <>
                      <button onClick={() => approveClaim(row.id)} className="min-h-9 min-w-9 rounded-lg hover:bg-cta-surface inline-flex items-center justify-center" aria-label={`Approve ${row.id}`}><CheckCircle2 size={15} className="text-cta" /></button>
                    </>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-4 border-t border-hairline-soft flex items-center justify-between">
        <p className="text-xs text-muted">Showing {filtered.length} of {expenses.length} claims</p>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span>Total: <span className="font-mono font-semibold text-ink">{formatRupiah(totalAmount)}</span></span>
        </div>
      </div>
    </div>

    {selectedClaim && <ClaimDetailModal record={selectedClaim} onClose={() => setSelectedClaim(null)} onApprove={(id) => { approveClaim(id); setSelectedClaim(null); }} onReject={(id, note) => { rejectClaim(id, note); setSelectedClaim(null); }} />}
    {showSubmit && <SubmitClaimModal onClose={() => setShowSubmit(false)} onSubmit={submitClaim} />}
  </div>;
}
