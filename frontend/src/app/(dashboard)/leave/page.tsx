'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import {
  Search, CheckCircle2, XCircle, Clock, CalendarDays, Plus, X, Eye, Trash2,
  MessageSquare, ChevronDown, UserRound, AlertTriangle,
} from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

type ApprovalStep = { step: string; approver: string; status: 'pending' | 'approved' | 'rejected'; date?: string; reason?: string };

type LeaveRequest = {
  id: string;
  name: string;
  initials: string;
  department: string;
  type: 'Annual Leave' | 'Sick Leave' | 'Personal Leave' | 'Maternity Leave' | 'Unpaid Leave';
  from: string;
  to: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string;
  balance: number;
  submittedDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  rejectReason?: string;
  approvalChain: ApprovalStep[];
  timeline: { action: string; by: string; date: string; note?: string }[];
};

const initialRequests: LeaveRequest[] = [
  {
    id: '1', name: 'Budi Hartono', initials: 'BH', department: 'Engineering', type: 'Annual Leave',
    from: '22 Sep', to: '24 Sep', days: 3, status: 'pending', reason: 'Family vacation to Bali', balance: 9,
    submittedDate: '18 Sep 2026', approvalChain: [
      { step: 'Line Manager', approver: 'Line Manager', status: 'pending' },
      { step: 'HR Manager', approver: 'HR Manager', status: 'pending' },
    ],
    timeline: [{ action: 'Request submitted', by: 'Budi Hartono', date: '18 Sep, 14:30' }],
  },
  {
    id: '2', name: 'Sari Dewi', initials: 'SD', department: 'Marketing', type: 'Sick Leave',
    from: '20 Sep', to: '20 Sep', days: 1, status: 'approved', reason: 'Medical appointment — dentist checkup', balance: 14,
    submittedDate: '19 Sep 2026', reviewedBy: 'Rina Sari', reviewDate: '19 Sep 2026',
    approvalChain: defaultApprovalChain('approved', 'Rina Sari', '19 Sep 2026'),
    timeline: [
      { action: 'Request submitted', by: 'Sari Dewi', date: '19 Sep, 08:15' },
      { action: 'Approved', by: 'Rina Sari', date: '19 Sep, 09:30', note: 'Approved. Get well soon!' },
    ],
  },
  {
    id: '3', name: 'Andi Pratama', initials: 'AP', department: 'Finance', type: 'Annual Leave',
    from: '27 Sep', to: '30 Sep', days: 4, status: 'pending', reason: 'Wedding ceremony', balance: 8,
    submittedDate: '15 Sep 2026', approvalChain: [
      { step: 'Line Manager', approver: 'Line Manager', status: 'pending' },
      { step: 'HR Manager', approver: 'HR Manager', status: 'pending' },
    ],
    timeline: [{ action: 'Request submitted', by: 'Andi Pratama', date: '15 Sep, 10:00' }],
  },
  {
    id: '4', name: 'Maya Anggraeni', initials: 'MA', department: 'Design', type: 'Personal Leave',
    from: '18 Sep', to: '19 Sep', days: 2, status: 'approved', reason: 'Moving house', balance: 13,
    submittedDate: '14 Sep 2026', reviewedBy: 'Budi Hartono', reviewDate: '14 Sep 2026',
    approvalChain: defaultApprovalChain('approved', 'Budi Hartono', '14 Sep 2026'),
    timeline: [
      { action: 'Request submitted', by: 'Maya Anggraeni', date: '14 Sep, 11:00' },
      { action: 'Approved', by: 'Budi Hartono', date: '14 Sep, 15:45' },
    ],
  },
  {
    id: '5', name: 'Fajar Nugroho', initials: 'FN', department: 'Engineering', type: 'Annual Leave',
    from: '15 Sep', to: '17 Sep', days: 3, status: 'approved', reason: 'Travel to Yogyakarta', balance: 11,
    submittedDate: '10 Sep 2026', reviewedBy: 'Budi Hartono', reviewDate: '10 Sep 2026',
    approvalChain: defaultApprovalChain('approved', 'Budi Hartono', '10 Sep 2026'),
    timeline: [
      { action: 'Request submitted', by: 'Fajar Nugroho', date: '10 Sep, 09:00' },
      { action: 'Approved', by: 'Budi Hartono', date: '10 Sep, 14:20' },
    ],
  },
  {
    id: '6', name: 'Rina Sari', initials: 'RS', department: 'HR', type: 'Maternity Leave',
    from: '01 Oct', to: '31 Dec', days: 66, status: 'pending', reason: 'Maternity leave — expected due date October 5', balance: 12,
    submittedDate: '12 Sep 2026', approvalChain: [
      { step: 'Line Manager', approver: 'Line Manager', status: 'pending' },
      { step: 'HR Manager', approver: 'HR Manager', status: 'pending' },
    ],
    timeline: [{ action: 'Request submitted', by: 'Rina Sari', date: '12 Sep, 16:00' }],
  },
  {
    id: '7', name: 'Rizky Prasetyo', initials: 'RP', department: 'Engineering', type: 'Annual Leave',
    from: '01 Sep', to: '03 Sep', days: 3, status: 'rejected', reason: 'Personal trip', balance: 11,
    submittedDate: '25 Aug 2026', reviewedBy: 'Budi Hartono', reviewDate: '26 Aug 2026',
    rejectReason: 'Too many engineers already on leave that week. Please reschedule.',
    approvalChain: [
      { step: 'Line Manager', approver: 'Budi Hartono', status: 'rejected', date: '26 Aug 2026', reason: 'Too many engineers already on leave that week. Please reschedule.' },
      { step: 'HR Manager', approver: 'HR Manager', status: 'pending' },
    ],
    timeline: [
      { action: 'Request submitted', by: 'Rizky Prasetyo', date: '25 Aug, 08:30' },
      { action: 'Rejected', by: 'Budi Hartono', date: '26 Aug, 10:15', note: 'Too many engineers already on leave that week. Please reschedule.' },
    ],
  },
  {
    id: '8', name: 'Dewi Lestari', initials: 'DL', department: 'HR', type: 'Personal Leave',
    from: '05 Oct', to: '05 Oct', days: 1, status: 'pending', reason: 'Family matter', balance: 15,
    submittedDate: '20 Sep 2026', approvalChain: [
      { step: 'Line Manager', approver: 'Line Manager', status: 'pending' },
      { step: 'HR Manager', approver: 'HR Manager', status: 'pending' },
    ],
    timeline: [{ action: 'Request submitted', by: 'Dewi Lestari', date: '20 Sep, 13:00' }],
  },
];

const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave', 'Unpaid Leave'] as const;

function defaultApprovalChain(status: LeaveRequest['status'], reviewedBy?: string, date?: string, reason?: string): ApprovalStep[] {
  return [
    { step: 'Line Manager', approver: reviewedBy || 'Line Manager', status: status === 'pending' ? 'pending' : status === 'rejected' ? 'rejected' : 'approved', date: status === 'pending' ? undefined : date, reason: status === 'rejected' ? reason : undefined },
    { step: 'HR Manager', approver: 'HR Manager', status: status === 'approved' ? 'approved' : 'pending', date: status === 'approved' ? date : undefined },
  ];
}

const statusMeta: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-accent-yellow', icon: Clock },
  approved: { label: 'Approved', color: 'bg-cta-surface text-cta-hover', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-50 text-semantic-down', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'bg-surface-strong text-muted', icon: XCircle },
};

const balances = [
  { type: 'Annual Leave', used: 12, total: 12 },
  { type: 'Sick Leave', used: 3, total: 12 },
  { type: 'Personal Leave', used: 2, total: 3 },
  { type: 'Maternity Leave', used: 0, total: 90 },
];

function RequestDetailModal({ request, onClose, onApprove, onReject }: { request: LeaveRequest; onClose: () => void; onApprove: (id: string) => void; onReject: (id: string, reason: string) => void }) {
  const st = statusMeta[request.status];
  const Icon = st.icon;
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const pendingIndex = request.approvalChain.findIndex((step) => step.status === 'pending');
  const currentStep = pendingIndex >= 0 ? request.approvalChain[pendingIndex] : undefined;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-canvas border border-hairline shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-canvas border-b border-hairline-soft px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-bold text-ink">Leave Request Details</h2>
          <button onClick={onClose} aria-label="Close" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-primary-surface flex items-center justify-center"><span className="text-sm font-bold text-primary">{request.initials}</span></div>
            <div>
              <p className="text-sm font-bold text-ink">{request.name}</p>
              <p className="text-xs text-muted">{request.department}</p>
            </div>
            <span className={`badge gap-1.5 ml-auto ${st.color}`}><Icon size={12} /> {st.label}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl bg-surface-soft p-3"><p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Type</p><p className="text-sm font-bold text-ink mt-1">{request.type}</p></div>
            <div className="rounded-xl bg-surface-soft p-3"><p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Duration</p><p className="text-sm font-bold text-ink mt-1">{request.from} — {request.to}</p><p className="text-[11px] text-muted">{request.days} day{request.days > 1 ? 's' : ''}</p></div>
            <div className="rounded-xl bg-surface-soft p-3"><p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Reason</p><p className="text-sm text-ink mt-1">{request.reason}</p></div>
            <div className="rounded-xl bg-surface-soft p-3"><p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Remaining balance</p><p className="text-sm font-bold text-ink mt-1">{request.balance} days</p></div>
          </div>

          {request.rejectReason && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 mb-5">
              <p className="text-[10px] uppercase tracking-wider text-semantic-down font-semibold mb-1">Rejection reason</p>
              <p className="text-xs text-body">{request.rejectReason}</p>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">Approval chain</h3>
            <div className="space-y-0" role="list" aria-label="Approval chain steps">
              {request.approvalChain.map((step, i) => {
                const isCurrentPending = i === pendingIndex;
                const StepIcon = step.status === 'approved' ? CheckCircle2 : step.status === 'rejected' ? XCircle : Clock;
                const circleBg = step.status === 'approved' ? 'bg-cta text-white' : step.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-100 text-amber-600';
                const lineBg = step.status === 'approved' ? 'bg-cta' : step.status === 'rejected' ? 'bg-red-300' : 'bg-hairline';
                return <div key={`${step.step}-${i}`} className="flex gap-3 pb-4 last:pb-0" role="listitem">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${circleBg}`} aria-label={`${step.step}: ${step.status}`}><StepIcon size={15} /></div>
                    {i < request.approvalChain.length - 1 && <div className={`w-px flex-1 ${lineBg} mt-1`} />}
                  </div>
                  <div className="pt-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-ink">{step.step}</p><span className={`badge capitalize ${step.status === 'approved' ? 'bg-cta-surface text-cta-hover' : step.status === 'rejected' ? 'bg-red-50 text-semantic-down' : 'bg-amber-50 text-accent-yellow'}`}>{step.status}</span></div>
                    <p className="text-xs text-muted mt-0.5">{step.approver}{step.date ? ` · ${step.date}` : ''}</p>
                    {step.reason && <p className="text-xs text-body mt-1 bg-red-50 rounded-lg p-2">{step.reason}</p>}
                    {isCurrentPending && showReject && (
                      <div className="mt-3">
                        <label className="block">
                          <span className="text-sm font-semibold text-ink">Rejection reason <span className="text-semantic-down">*</span></span>
                          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="input-field mt-1.5 min-h-[80px] resize-y" placeholder="e.g. Too many team members already on leave during this period..." aria-label="Rejection reason" />
                          {rejectReason.length === 0 && <p className="text-[11px] text-muted mt-1">Reason is required</p>}
                        </label>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => { setShowReject(false); setRejectReason(''); }} className="btn-secondary min-h-10 text-xs">Cancel</button>
                          <button onClick={() => { if (rejectReason.trim()) { onReject(request.id, rejectReason.trim()); onClose(); } }} disabled={!rejectReason.trim()} className="min-h-10 px-4 rounded-pill bg-semantic-down text-white text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-40">Confirm reject</button>
                        </div>
                      </div>
                    )}
                    {isCurrentPending && !showReject && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => { onApprove(request.id); onClose(); }} className="min-h-10 px-4 rounded-pill bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors" aria-label={`Approve at ${step.step}`}>Approve</button>
                        <button onClick={() => setShowReject(true)} className="min-h-10 px-4 rounded-pill bg-red-50 text-semantic-down text-xs font-semibold hover:bg-red-100 transition-colors" aria-label={`Reject at ${step.step}`}>Reject</button>
                      </div>
                    )}
                  </div>
                </div>;
              })}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">Activity timeline</h3>
            <div className="space-y-0">
              {request.timeline.map((t, i) => (
                <div key={i} className="flex gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center"><div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${i === request.timeline.length - 1 ? 'bg-primary' : 'bg-hairline'}`} />{i < request.timeline.length - 1 && <div className="w-px flex-1 bg-hairline mt-1" />}</div>
                  <div><p className="text-sm font-semibold text-ink">{t.action}</p><p className="text-xs text-muted mt-0.5">by {t.by} · {t.date}</p>{t.note && <p className="text-xs text-body mt-1 bg-surface-soft rounded-lg p-2">{t.note}</p>}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-hairline-soft">
          <button onClick={onClose} className="btn-secondary w-full justify-center text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ onClose, onReject }: { onClose: () => void; onReject: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><XCircle size={16} className="text-semantic-down" /></div>
          <h3 className="text-base font-bold text-ink">Reject Leave Request</h3>
        </div>
        <p className="text-sm text-body mb-4">Provide a reason for rejection. The employee will be notified.</p>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Rejection reason <span className="text-semantic-down">*</span></span>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="input-field mt-1.5 min-h-[80px] resize-y" placeholder="e.g. Too many team members already on leave during this period..." />
          {reason.length === 0 && <p className="text-[11px] text-muted mt-1">Reason is required</p>}
        </label>
        <div className="flex gap-3 justify-end mt-5 pt-4 border-t border-hairline-soft">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button onClick={() => { if (reason.trim()) onReject(reason.trim()); }} disabled={!reason.trim()} className="min-h-10 px-4 rounded-pill bg-semantic-down text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40">Reject request</button>
        </div>
      </div>
    </div>
  );
}

function NewRequestModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => Promise<void> }) {
  const { toast } = useToast();
  const [type, setType] = useState<string>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [employee, setEmployee] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    api.get<{ items: { id: string; full_name: string }[] }>('/employees', { params: { per_page: 100 } })
      .then((response) => setEmployees(response.data.items))
      .catch(() => setEmployees([]));
  }, []);

  const calcDays = () => {
    if (!from || !to) return 0;
    const diff = Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!employee) e.employee = 'Select an employee.';
    if (!type) e.type = 'Select a leave type.';
    if (!from) e.from = 'Start date is required.';
    if (!to) e.to = 'End date is required.';
    if (from && to && new Date(to) < new Date(from)) e.to = 'End date must be after start date.';
    if (!reason.trim()) e.reason = 'Reason is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/leave', { employee_id: employee, leave_type: ({ 'Annual Leave': 'annual', 'Sick Leave': 'sick', 'Personal Leave': 'personal', 'Maternity Leave': 'maternity', 'Unpaid Leave': 'unpaid' } as Record<string, string>)[type], start_date: from, end_date: to, reason: reason.trim() });
      await onSaved();
      toast(`Leave request submitted. ${calcDays()} day${calcDays() !== 1 ? 's' : ''} requested.`, 'success');
      onClose();
    } catch (error: any) {
      toast(error.response?.data?.detail || 'Could not submit leave request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg rounded-2xl bg-canvas border border-hairline shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-canvas border-b border-hairline-soft px-6 py-4 flex items-center justify-between z-10">
          <div><h2 className="text-base font-bold text-ink">New Leave Request</h2><p className="text-xs text-muted mt-0.5">Submit a request for manager approval</p></div>
          <button type="button" onClick={onClose} aria-label="Close" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-ink">Employee <span className="text-semantic-down">*</span></span>
            <select value={employee} onChange={(e) => setEmployee(e.target.value)} className="input-field mt-1.5">
              <option value="">Select employee…</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name}</option>)}
            </select>
            {errors.employee && <p role="alert" className="text-xs text-semantic-down mt-1">{errors.employee}</p>}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink">Leave type <span className="text-semantic-down">*</span></span>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input-field mt-1.5">
              <option value="">Select type…</option>
              {leaveTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
            {errors.type && <p role="alert" className="text-xs text-semantic-down mt-1">{errors.type}</p>}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-ink">From <span className="text-semantic-down">*</span></span>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field mt-1.5" />
              {errors.from && <p role="alert" className="text-xs text-semantic-down mt-1">{errors.from}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-ink">To <span className="text-semantic-down">*</span></span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-field mt-1.5" />
              {errors.to && <p role="alert" className="text-xs text-semantic-down mt-1">{errors.to}</p>}
            </label>
          </div>
          {from && to && calcDays() > 0 && (
            <div className="rounded-xl bg-primary-surface p-3 flex items-center justify-between">
              <span className="text-xs text-primary font-semibold">Total days</span>
              <span className="text-sm font-bold text-primary">{calcDays()} day{calcDays() !== 1 ? 's' : ''}</span>
            </div>
          )}
          <label className="block">
            <span className="text-sm font-semibold text-ink">Reason <span className="text-semantic-down">*</span></span>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="input-field mt-1.5 min-h-[80px] resize-y" placeholder="Why are you requesting leave?" />
            {errors.reason && <p role="alert" className="text-xs text-semantic-down mt-1">{errors.reason}</p>}
          </label>
        </div>
        <div className="px-6 py-4 border-t border-hairline-soft flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-cta flex-1 justify-center gap-2 text-sm disabled:opacity-50">
            {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'>('all');
  const [deptFilter, setDeptFilter] = useState('All');
  const [showRequest, setShowRequest] = useState(false);
  const [selectedReq, setSelectedReq] = useState<LeaveRequest | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const departments = ['All', ...Array.from(new Set(requests.map((r) => r.department)))];

  const loadRequests = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await api.get<{ items: any[] }>('/leave', { params: { status: tab === 'all' ? undefined : tab } });
      setRequests(response.data.items.map((item) => {
        const label = { annual: 'Annual Leave', sick: 'Sick Leave', personal: 'Personal Leave', maternity: 'Maternity Leave', unpaid: 'Unpaid Leave' }[item.leave_type as string] ?? item.leave_type;
        return { ...item, name: item.employee_name, initials: item.employee_name.split(/\s+/).map((part: string) => part[0]).slice(0, 2).join('').toUpperCase(), department: item.department, type: label, from: item.start_date, to: item.end_date, days: Number(item.total_days), balance: 0, submittedDate: item.created_at, approvalChain: [], timeline: [] };
      }));
    } catch (error: any) {
      setLoadError(error.response?.data?.detail || 'Could not load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadRequests(); }, [tab]);

  const filtered = useMemo(() =>
    requests
      .filter((r) => `${r.name} ${r.type} ${r.reason} ${r.department}`.toLowerCase().includes(search.toLowerCase()))
      .filter((r) => tab === 'all' || r.status === tab)
      .filter((r) => deptFilter === 'All' || r.department === deptFilter),
    [requests, search, tab, deptFilter],
  );

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;

  const advanceChain = (rows: LeaveRequest[], id: string, action: 'approve' | 'reject', reason?: string): LeaveRequest[] => {
    const now = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString('en-GB');
    return rows.map((r) => {
      if (r.id !== id) return r;
      const chain = r.approvalChain.map((s) => ({ ...s }));
      const idx = chain.findIndex((s) => s.status === 'pending');
      if (idx === -1) return r;
      if (action === 'approve') {
        chain[idx] = { ...chain[idx], status: 'approved', approver: 'You', date: now };
      } else {
        chain[idx] = { ...chain[idx], status: 'rejected', approver: 'You', date: now, reason };
      }
      const allApproved = chain.every((s) => s.status === 'approved');
      const newStatus = action === 'reject' ? 'rejected' as const : allApproved ? 'approved' as const : 'pending' as const;
      const label = action === 'approve' ? (allApproved ? 'Approved' : 'Step approved') : 'Rejected';
      return {
        ...r,
        status: newStatus,
        approvalChain: chain,
        rejectReason: action === 'reject' ? reason : r.rejectReason,
        reviewedBy: newStatus !== 'pending' ? 'You' : r.reviewedBy,
        reviewDate: newStatus !== 'pending' ? nowDate : r.reviewDate,
        timeline: [...r.timeline, { action: label, by: 'You', date: now, note: action === 'reject' ? reason : undefined }],
      };
    });
  };

  const handleApprove = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    setRequests((rows) => advanceChain(rows, id, 'approve'));
    void api.post(`/leave/${id}/approve`).then(() => loadRequests()).catch(() => toast('Could not approve leave request.', 'error'));
    const pendingIdx = req.approvalChain.findIndex((s) => s.status === 'pending');
    const hasMoreSteps = pendingIdx !== -1 && pendingIdx < req.approvalChain.length - 1;
    toast(hasMoreSteps ? 'Approved. Forwarded to next approver.' : `${req.name}'s leave request fully approved.`, 'success');
  };

  const handleReject = (id: string, reason: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    setRequests((rows) => advanceChain(rows, id, 'reject', reason));
    void api.post(`/leave/${id}/reject`, { reason }).then(() => loadRequests()).catch(() => toast('Could not reject leave request.', 'error'));
    toast(`${req.name}'s leave request rejected.`, 'success');
    setRejectTarget(null);
  };

  const handleCancel = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    void api.post(`/leave/${id}/cancel`).then(() => loadRequests()).catch(() => toast('Could not cancel leave request.', 'error'));
    toast(`Leave request cancelled.`, 'success');
    setCancelTarget(null);
  };

  const handleDelete = (id: string) => {
    void api.delete(`/leave/${id}`).then(() => loadRequests()).catch(() => toast('Could not remove leave request.', 'error'));
    toast('Leave request removed.', 'success');
    setConfirmDelete(null);
    setSelectedReq(null);
  };

  return (
    <div>
      <ModuleHeader eyebrow="Time off" title="Leave Management" description="Manage leave requests, balances, and approvals" action={<button onClick={() => setShowRequest(true)} className="btn-cta gap-2"><Plus size={15} /> New Request</button>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard icon={Clock} label="Pending requests" value={String(pendingCount)} tone="amber" detail="Awaiting approval" />
        <StatCard icon={CheckCircle2} label="Approved this month" value={String(approvedCount)} tone="green" detail="This month" />
        <StatCard icon={XCircle} label="Rejected" value={String(requests.filter((r) => r.status === 'rejected').length)} tone="red" detail="This month" />
        <StatCard icon={CalendarDays} label="On leave today" value="18" tone="primary" detail="3.7% of workforce" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 card">
          <h2 className="text-sm font-bold text-ink mb-4">Leave Balances</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {balances.map((b) => (
              <div key={b.type} className="rounded-xl border border-hairline p-4 bg-surface-soft">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">{b.type}</p>
                <p className="text-xl font-mono font-bold text-ink">{b.used}<span className="text-sm font-normal text-muted">/{b.total}</span></p>
                {b.total > 0 && (
                  <div className="mt-2.5 h-1.5 rounded-full bg-hairline overflow-hidden">
                    <div className={`h-full rounded-full ${(b.used / b.total) > 0.8 ? 'bg-red-400' : 'bg-primary'}`} style={{ width: `${(b.used / b.total) * 100}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-bold text-ink mb-4">Quick Summary</h2>
          <div className="space-y-3">
            {[
              { label: 'Most used type', value: 'Annual Leave', color: 'text-primary' },
              { label: 'Avg. request length', value: '2.5 days', color: 'text-ink' },
              { label: 'Longest current leave', value: 'Rina Sari — 66 days', color: 'text-ink' },
              { label: 'Upcoming returns', value: '3 employees this week', color: 'text-cta' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between gap-4 border-b border-hairline-soft pb-2 last:border-0 last:pb-0">
                <span className="text-xs text-muted">{item.label}</span>
                <span className={`text-xs font-semibold text-right ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loadError && <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center justify-between"><p className="text-sm text-semantic-down">{loadError}</p><button onClick={() => void loadRequests()} className="btn-secondary text-xs">Retry</button></div>}
        <div className="px-5 py-4 border-b border-hairline-soft space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {(['all', 'pending', 'approved', 'rejected', 'cancelled'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`min-h-10 px-4 rounded-pill text-xs font-semibold transition-colors ${tab === t ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                  {t === 'pending' && pendingCount > 0 && <span className="ml-1.5 bg-primary-light text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="min-h-10 px-3 rounded-pill bg-surface-strong text-xs font-semibold text-muted appearance-none pr-8 cursor-pointer">
                {departments.map((d) => <option key={d}>{d}</option>)}
              </select>
              <div className="relative max-w-xs">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" />
                <input type="search" aria-label="Search leave requests" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full min-h-10 rounded-pill bg-surface-strong pl-9 pr-3 py-2 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-hairline">
                <th className="table-header">Employee</th>
                <th className="table-header">Type</th>
                <th className="table-header">Duration</th>
                <th className="table-header">Reason</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="table-cell text-center text-muted">Loading leave requests...</td></tr> : filtered.length === 0 ? <tr><td colSpan={6}><EmptyState title="No leave requests found" description="Try another search, filter, or status." /></td></tr> : filtered.map((row) => {
                const st = statusMeta[row.status];
                const Icon = st.icon;
                return (
                  <tr key={row.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-surface flex items-center justify-center shrink-0"><span className="text-[11px] font-bold text-primary">{row.initials}</span></div>
                        <div>
                          <button onClick={() => setSelectedReq(row)} className="font-semibold text-ink hover:text-primary transition-colors text-left">{row.name}</button>
                          <p className="text-[11px] text-muted">{row.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell"><span className="badge bg-surface-strong text-muted">{row.type}</span></td>
                    <td className="table-cell"><span className="text-ink">{row.from}</span> <span className="text-muted">—</span> <span className="text-ink">{row.to}</span><span className="text-muted ml-1 text-xs">({row.days}d)</span></td>
                    <td className="table-cell text-muted max-w-[180px] truncate">{row.reason}</td>
                    <td className="table-cell"><span className={`badge gap-1.5 capitalize ${st.color}`}><Icon size={12} /> {st.label}</span></td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        {row.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(row.id)} className="min-h-9 px-2.5 rounded-lg bg-cta-surface text-cta-hover text-[11px] font-semibold hover:bg-emerald-100 transition-colors" title="Approve">Approve</button>
                            <button onClick={() => setRejectTarget(row.id)} className="min-h-9 px-2.5 rounded-lg bg-red-50 text-semantic-down text-[11px] font-semibold hover:bg-red-100 transition-colors" title="Reject">Reject</button>
                          </>
                        )}
                        {row.status === 'approved' && (
                          <button onClick={() => setCancelTarget(row.id)} className="min-h-9 px-2.5 rounded-lg bg-surface-strong text-muted text-[11px] font-semibold hover:bg-hairline transition-colors" title="Cancel">Cancel</button>
                        )}
                        <button onClick={() => setSelectedReq(row)} className="min-h-9 min-w-9 rounded-md hover:bg-primary-surface flex items-center justify-center" title="View details"><Eye size={14} className="text-muted" /></button>
                        <button onClick={() => setConfirmDelete(row.id)} className="min-h-9 min-w-9 rounded-md hover:bg-red-50 flex items-center justify-center" title="Delete"><Trash2 size={14} className="text-muted-soft hover:text-semantic-down" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-hairline-soft">
          <p className="text-xs text-muted">Showing {filtered.length} of {requests.length} requests</p>
        </div>
      </div>

      {selectedReq && <RequestDetailModal request={selectedReq} onClose={() => setSelectedReq(null)} onApprove={handleApprove} onReject={handleReject} />}
      {showRequest && <NewRequestModal onClose={() => setShowRequest(false)} onSaved={loadRequests} />}
      {rejectTarget && (
        <RejectModal onClose={() => setRejectTarget(null)} onReject={(reason) => handleReject(rejectTarget, reason)} />
      )}
      {cancelTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setCancelTarget(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center"><AlertTriangle size={16} className="text-accent-yellow" /></div>
              <h3 className="text-base font-bold text-ink">Cancel leave request?</h3>
            </div>
            <p className="text-sm text-body mb-5">This will cancel your pending leave request. This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setCancelTarget(null)} className="btn-secondary text-sm">Keep request</button>
              <button onClick={() => handleCancel(cancelTarget)} className="min-h-10 px-4 rounded-pill bg-accent-yellow text-white text-sm font-semibold hover:bg-amber-600 transition-colors">Cancel leave</button>
            </div>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><Trash2 size={16} className="text-semantic-down" /></div>
              <h3 className="text-base font-bold text-ink">Delete leave request</h3>
            </div>
            <p className="text-sm text-body mb-5">This will permanently remove this leave request. This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="min-h-10 px-4 rounded-pill bg-semantic-down text-white text-sm font-semibold hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
