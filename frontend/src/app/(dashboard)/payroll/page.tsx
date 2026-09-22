'use client';

import { useState, useMemo } from 'react';
import {
  Wallet, Users, CheckCircle2, Clock, Download, ChevronDown, Search, X,
  FileText, Building2, AlertTriangle, Eye, Lock, Unlock, RefreshCw, Check,
} from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

type PayrollStatus = 'processed' | 'pending' | 'draft' | 'error';

type PayrollRecord = {
  id: string; name: string; initials: string; department: string; position: string;
  grossSalary: number; basicSalary: number; allowance: number; overtime: number;
  pph21: number; bpjsKes: number; bpjsTk: number; otherDeduction: number;
  netSalary: number; bank: string; accountNumber: string; status: PayrollStatus;
  errorMessage?: string;
};

const statusMeta: Record<PayrollStatus, { label: string; color: string }> = {
  processed: { label: 'Paid', color: 'bg-cta-surface text-cta-hover' },
  pending: { label: 'Pending', color: 'bg-amber-50 text-accent-yellow' },
  draft: { label: 'Draft', color: 'bg-surface-strong text-muted' },
  error: { label: 'Error', color: 'bg-red-50 text-semantic-down' },
};

const departments = ['All', 'HR', 'Engineering', 'Marketing', 'Finance', 'Design', 'Customer Success'];
const periods = ['September 2026', 'August 2026', 'July 2026', 'June 2026'];

const initialPayroll: PayrollRecord[] = [
  { id: 'PAY-001', name: 'Rina Sari', initials: 'RS', department: 'HR', position: 'HR Manager', grossSalary: 16500000, basicSalary: 15000000, allowance: 1500000, overtime: 0, pph21: 1950000, bpjsKes: 660000, bpjsTk: 495000, otherDeduction: 0, netSalary: 13395000, bank: 'BCA', accountNumber: '••••7890', status: 'processed' },
  { id: 'PAY-002', name: 'Budi Hartono', initials: 'BH', department: 'Engineering', position: 'Senior Engineer', grossSalary: 19800000, basicSalary: 18500000, allowance: 1300000, overtime: 0, pph21: 2475000, bpjsKes: 792000, bpjsTk: 594000, otherDeduction: 0, netSalary: 15939000, bank: 'Mandiri', accountNumber: '••••3456', status: 'processed' },
  { id: 'PAY-003', name: 'Sari Dewi', initials: 'SD', department: 'Marketing', position: 'Marketing Lead', grossSalary: 10500000, basicSalary: 9500000, allowance: 1000000, overtime: 0, pph21: 787500, bpjsKes: 420000, bpjsTk: 315000, otherDeduction: 0, netSalary: 8977500, bank: 'BNI', accountNumber: '••••1234', status: 'processed' },
  { id: 'PAY-004', name: 'Andi Pratama', initials: 'AP', department: 'Finance', position: 'Finance Director', grossSalary: 22000000, basicSalary: 20000000, allowance: 2000000, overtime: 0, pph21: 3300000, bpjsKes: 880000, bpjsTk: 660000, otherDeduction: 0, netSalary: 17160000, bank: 'BCA', accountNumber: '••••5678', status: 'pending' },
  { id: 'PAY-005', name: 'Dewi Lestari', initials: 'DL', department: 'HR', position: 'HR Specialist', grossSalary: 9500000, basicSalary: 8500000, allowance: 1000000, overtime: 0, pph21: 637500, bpjsKes: 380000, bpjsTk: 285000, otherDeduction: 0, netSalary: 8197500, bank: 'BRI', accountNumber: '••••9012', status: 'processed' },
  { id: 'PAY-006', name: 'Rizky Prasetyo', initials: 'RP', department: 'Engineering', position: 'Backend Engineer', grossSalary: 14000000, basicSalary: 13000000, allowance: 1000000, overtime: 500000, pph21: 1400000, bpjsKes: 560000, bpjsTk: 420000, otherDeduction: 0, netSalary: 12120000, bank: 'Mandiri', accountNumber: '••••3457', status: 'processed' },
  { id: 'PAY-007', name: 'Maya Anggraeni', initials: 'MA', department: 'Design', position: 'UI/UX Designer', grossSalary: 12500000, basicSalary: 11500000, allowance: 1000000, overtime: 0, pph21: 1125000, bpjsKes: 500000, bpjsTk: 375000, otherDeduction: 0, netSalary: 10500000, bank: 'BCA', accountNumber: '••••7891', status: 'pending' },
  { id: 'PAY-008', name: 'Fajar Nugroho', initials: 'FN', department: 'Engineering', position: 'Mobile Engineer', grossSalary: 13000000, basicSalary: 12000000, allowance: 1000000, overtime: 0, pph21: 1170000, bpjsKes: 520000, bpjsTk: 390000, otherDeduction: 0, netSalary: 10920000, bank: 'BNI', accountNumber: '••••1235', status: 'draft' },
  { id: 'PAY-009', name: 'Yuni Kartika', initials: 'YK', department: 'Customer Success', position: 'CS Manager', grossSalary: 11500000, basicSalary: 10500000, allowance: 1000000, overtime: 0, pph21: 975000, bpjsKes: 460000, bpjsTk: 345000, otherDeduction: 0, netSalary: 9720000, bank: 'BCA', accountNumber: '••••7892', status: 'processed' },
  { id: 'PAY-010', name: 'Arief Wibowo', initials: 'AW', department: 'Finance', position: 'Accountant', grossSalary: 8500000, basicSalary: 8000000, allowance: 500000, overtime: 250000, pph21: 562500, bpjsKes: 340000, bpjsTk: 255000, otherDeduction: 100000, netSalary: 7492500, bank: 'BRI', accountNumber: '••••9013', status: 'error', errorMessage: 'Bank account not found. BRI account ••••9013 is inactive. Please update the employee\'s bank details.' },
];

function formatRupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function PayslipDetailModal({ record, onClose }: { record: PayrollRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-canvas border border-hairline shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-surface-dark text-white px-6 py-5 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div><p className="text-lg font-bold">PAYSLIP</p><p className="text-xs text-indigo-200 mt-1">September 2026</p></div>
            <button onClick={onClose} aria-label="Close payslip" className="min-h-10 min-w-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><X size={16} /></button>
          </div>
        </div>
        <div className="px-6 py-4 border-b border-hairline-soft">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Employee</p><p className="text-sm font-bold text-ink mt-1">{record.name}</p><p className="text-xs text-muted font-mono mt-0.5">{record.id}</p></div>
            <div><p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Position</p><p className="text-sm font-semibold text-ink mt-1">{record.position}</p><p className="text-xs text-muted mt-0.5">{record.department}</p></div>
            <div><p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Bank</p><p className="text-sm font-semibold text-ink mt-1">{record.bank}</p><p className="text-xs text-muted font-mono mt-0.5">{record.accountNumber}</p></div>
            <div><p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Status</p><span className={`badge ${statusMeta[record.status]?.color} mt-1.5`}>{statusMeta[record.status]?.label}</span></div>
          </div>
        </div>
        <div className="px-6 py-4 border-b border-hairline-soft">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-cta-surface flex items-center justify-center"><span className="text-[10px] text-cta font-bold">+</span></div>
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Earnings</h3>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-body">Basic salary</span><span className="font-mono text-ink">{formatRupiah(record.basicSalary)}</span></div>
            <div className="flex justify-between"><span className="text-body">Transport & meal allowance</span><span className="font-mono text-ink">{formatRupiah(record.allowance)}</span></div>
            {record.overtime > 0 && <div className="flex justify-between"><span className="text-body">Overtime pay</span><span className="font-mono text-cta">{formatRupiah(record.overtime)}</span></div>}
            <div className="flex justify-between pt-2.5 mt-2.5 border-t border-hairline-soft"><span className="font-bold text-ink">Gross earnings</span><span className="font-mono font-bold text-ink">{formatRupiah(record.grossSalary)}</span></div>
          </div>
        </div>
        <div className="px-6 py-4 border-b border-hairline-soft">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center"><span className="text-[10px] text-semantic-down font-bold">−</span></div>
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Deductions</h3>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-body">PPh 21 (Income tax)</span><span className="font-mono text-semantic-down">{formatRupiah(record.pph21)}</span></div>
            <div className="flex justify-between"><span className="text-body">BPJS Kesehatan (4%)</span><span className="font-mono text-semantic-down">{formatRupiah(record.bpjsKes)}</span></div>
            <div className="flex justify-between"><span className="text-body">BPJS Ketenagakerjaan</span><span className="font-mono text-semantic-down">{formatRupiah(record.bpjsTk)}</span></div>
            {record.otherDeduction > 0 && <div className="flex justify-between"><span className="text-body">Other deductions</span><span className="font-mono text-semantic-down">{formatRupiah(record.otherDeduction)}</span></div>}
            <div className="flex justify-between pt-2.5 mt-2.5 border-t border-hairline-soft">
              <span className="font-bold text-ink">Total deductions</span>
              <span className="font-mono font-bold text-semantic-down">{formatRupiah(record.pph21 + record.bpjsKes + record.bpjsTk + record.otherDeduction)}</span>
            </div>
          </div>
        </div>
        <div className="mx-6 my-5 rounded-xl bg-primary-surface px-5 py-4 flex items-center justify-between">
          <div><p className="text-xs font-semibold text-primary">Net pay</p><p className="text-[11px] text-muted mt-0.5">Amount transferred</p></div>
          <p className="font-mono text-lg font-bold text-ink">{formatRupiah(record.netSalary)}</p>
        </div>
        <div className="px-6 pb-5 flex items-center gap-2 text-[11px] text-muted"><Building2 size={12} /> System-generated payslip</div>
      </div>
    </div>
  );
}

function ProcessingStepper({ step, onClose }: { step: number; onClose: () => void }) {
  const steps = ['Review data', 'Validate calculations', 'Approve payroll', 'Export bank files'];
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" />
      <div className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary-surface flex items-center justify-center"><Wallet size={18} className="text-primary" /></div>
          <div><h2 className="text-base font-bold text-ink">Processing Payroll</h2><p className="text-xs text-muted">September 2026 · 10 employees</p></div>
        </div>
        <div className="space-y-0">
          {steps.map((s, i) => {
            const isComplete = i < step;
            const isCurrent = i === step;
            const isUpcoming = i > step;
            return (
              <div key={s} className="flex gap-3 pb-5 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isComplete ? 'bg-cta text-white' : isCurrent ? 'bg-primary text-white animate-pulse' : 'bg-surface-strong text-muted'}`}>
                    {isComplete ? <Check size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  {i < steps.length - 1 && <div className={`w-0.5 flex-1 mt-2 ${isComplete ? 'bg-cta' : 'bg-hairline'}`} />}
                </div>
                <div className="pt-1">
                  <p className={`text-sm font-semibold ${isCurrent ? 'text-primary' : isComplete ? 'text-ink' : 'text-muted'}`}>{s}</p>
                  {isCurrent && <p className="text-[11px] text-primary mt-0.5 animate-pulse">Processing…</p>}
                  {isComplete && <p className="text-[11px] text-cta mt-0.5">Done</p>}
                </div>
              </div>
            );
          })}
        </div>
        {step >= steps.length && (
          <div className="text-center mt-4">
            <div className="w-12 h-12 rounded-full bg-cta-surface flex items-center justify-center mx-auto mb-3"><CheckCircle2 size={24} className="text-cta" /></div>
            <p className="text-sm font-bold text-ink">Payroll processed!</p>
            <p className="text-xs text-muted mt-1">All payslips generated successfully.</p>
            <button onClick={onClose} className="btn-cta w-full mt-4 text-sm">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PayrollPage() {
  const [payroll, setPayroll] = useState(initialPayroll);
  const [period, setPeriod] = useState('September 2026');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | PayrollStatus>('all');
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [confirmProcess, setConfirmProcess] = useState(false);
  const [confirmExport, setConfirmExport] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [showProcessStepper, setShowProcessStepper] = useState(false);
  const [locked, setLocked] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);
  const [reprocessTarget, setReprocessTarget] = useState<string | null>(null);
  const { toast } = useToast();

  const filtered = useMemo(() =>
    payroll.filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
      const matchDept = department === 'All' || r.department === department;
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    }),
    [payroll, search, department, statusFilter],
  );

  const totalGross = filtered.reduce((sum, r) => sum + r.grossSalary, 0);
  const totalNet = filtered.reduce((sum, r) => sum + r.netSalary, 0);
  const totalDeductions = filtered.reduce((sum, r) => sum + r.pph21 + r.bpjsKes + r.bpjsTk + r.otherDeduction, 0);
  const processedCount = filtered.filter((r) => r.status === 'processed').length;
  const pendingCount = filtered.filter((r) => r.status === 'pending' || r.status === 'draft').length;
  const errorCount = filtered.filter((r) => r.status === 'error').length;

  const handleProcessPayroll = () => {
    setConfirmProcess(false);
    setShowProcessStepper(true);
    setProcessing(true);
    setProcessStep(0);
    const timers = [800, 1600, 2400, 3200];
    timers.forEach((delay, i) => {
      setTimeout(() => setProcessStep(i + 1), delay);
    });
    setTimeout(() => {
      setProcessing(false);
      setPayroll((rows) => rows.map((r) => r.status === 'pending' || r.status === 'draft' ? { ...r, status: 'processed' as const } : r));
      toast('Payroll processed successfully. All payslips generated.', 'success');
    }, 3500);
  };

  const handleExport = () => {
    setConfirmExport(false);
    toast('Bank transfer file exported. CSV format ready for upload to BCA/Mandiri/BNI internet banking.', 'success');
  };

  const handleReprocess = (id: string) => {
    setReprocessTarget(null);
    setPayroll((rows) => rows.map((r) => r.id === id ? { ...r, status: 'processed' as const, errorMessage: undefined } : r));
    toast('Employee payroll reprocessed successfully.', 'success');
  };

  const handleToggleLock = () => {
    setConfirmLock(false);
    setLocked(!locked);
    toast(locked ? 'Payroll period unlocked. Changes are now allowed.' : 'Payroll period locked. No changes can be made until unlocked.', 'success');
  };

  return (
    <div>
      <ModuleHeader
        eyebrow="Compensation"
        title="Payroll"
        description="Review, process, and export monthly payroll"
        action={
          <div className="flex gap-2">
            <button onClick={() => setConfirmExport(true)} disabled={locked} className="btn-secondary gap-2 disabled:opacity-50"><Download size={15} /> Export</button>
            <button onClick={() => setConfirmProcess(true)} disabled={processing || locked} className="btn-cta gap-2 disabled:opacity-50">
              {processing ? <><Clock size={15} className="animate-spin" /> Processing…</> : <><Wallet size={15} /> Process Payroll</>}
            </button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Payroll period</p>
          <div className="relative mt-1.5">
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input-field min-h-10 py-2 pr-10 w-full sm:w-56">
              {periods.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setConfirmLock(true)} className={`flex items-center gap-2 text-xs font-semibold transition-colors ${locked ? 'text-accent-yellow' : 'text-muted hover:text-ink'}`}>
            {locked ? <Lock size={14} /> : <Unlock size={14} />}
            {locked ? 'Period locked' : 'Lock period'}
          </button>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="w-2 h-2 rounded-full bg-cta" />
            Last processed: 31 Aug 2026
          </div>
        </div>
      </div>

      {locked && (
        <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-5 py-3 flex items-center gap-3">
          <Lock size={15} className="text-accent-yellow shrink-0" />
          <p className="text-xs text-accent-yellow font-semibold">This payroll period is locked. Unlock it to process or export.</p>
          <button onClick={() => setConfirmLock(true)} className="ml-auto text-xs font-semibold text-accent-yellow underline">Unlock</button>
        </div>
      )}

      {errorCount > 0 && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-5 py-3 flex items-center gap-3">
          <AlertTriangle size={15} className="text-semantic-down shrink-0" />
          <p className="text-xs text-semantic-down font-semibold">{errorCount} employee{errorCount > 1 ? 's' : ''} with processing errors. Review and reprocess.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard icon={Wallet} label="Total gross" value={`${(totalGross / 1000000).toFixed(1)}M`} tone="primary" detail={`${filtered.length} employees`} />
        <StatCard icon={CheckCircle2} label="Paid" value={String(processedCount)} tone="green" detail={`${((processedCount / (filtered.length || 1)) * 100).toFixed(0)}% of records`} />
        <StatCard icon={Clock} label="Pending" value={String(pendingCount)} tone="amber" detail="Requires attention" />
        {errorCount > 0 && <StatCard icon={AlertTriangle} label="Errors" value={String(errorCount)} tone="red" detail="Bank account issues" />}
        {errorCount === 0 && <StatCard icon={Building2} label="Net disbursement" value={`${(totalNet / 1000000).toFixed(1)}M`} tone="green" detail={`After ${(totalDeductions / 1000000).toFixed(1)}M deductions`} />}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline-soft flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative max-w-xs flex-1 sm:flex-initial">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" />
              <input type="search" aria-label="Search payroll" placeholder="Search name or ID…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full min-h-10 rounded-pill bg-surface-strong pl-9 pr-3 py-2 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="relative">
              <button onClick={() => setShowDeptDropdown(!showDeptDropdown)} className="min-h-10 px-4 rounded-pill bg-surface-strong text-xs font-semibold text-muted hover:text-ink flex items-center gap-1.5 transition-colors">
                {department === 'All' ? 'Department' : department} <ChevronDown size={13} />
              </button>
              {showDeptDropdown && (
                <div className="absolute top-12 left-0 z-50 w-48 rounded-xl border border-hairline bg-canvas shadow-lg p-1">
                  {departments.map((d) => (
                    <button key={d} onClick={() => { setDepartment(d); setShowDeptDropdown(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${department === d ? 'bg-primary-surface text-primary' : 'text-body hover:bg-surface-strong'}`}>{d}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-1.5">
              {(['all', 'processed', 'pending', 'error'] as const).map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`min-h-8 px-3 rounded-pill text-[11px] font-semibold transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>{s === 'all' ? 'All' : statusMeta[s]?.label}</button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted">{filtered.length} records</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead>
              <tr className="border-b border-hairline">
                <th className="table-header">Employee</th>
                <th className="table-header">Department</th>
                <th className="table-header">Gross salary</th>
                <th className="table-header">PPh 21</th>
                <th className="table-header">BPJS</th>
                <th className="table-header">Net salary</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState title="No payroll records found" description="Try a different search, department, or status filter." /></td></tr>
              ) : filtered.map((row) => {
                const totalBPJS = row.bpjsKes + row.bpjsTk;
                return (
                  <tr key={row.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-surface flex items-center justify-center shrink-0"><span className="text-[11px] font-bold text-primary">{row.initials}</span></div>
                        <div>
                          <p className="font-semibold text-ink">{row.name}</p>
                          <p className="text-[11px] font-mono text-muted">{row.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-body">{row.department}</td>
                    <td className="table-cell font-mono text-xs text-ink">{formatRupiah(row.grossSalary)}</td>
                    <td className="table-cell font-mono text-xs text-semantic-down">{formatRupiah(row.pph21)}</td>
                    <td className="table-cell font-mono text-xs text-semantic-down">{formatRupiah(totalBPJS)}</td>
                    <td className="table-cell font-mono text-xs font-semibold text-ink">{formatRupiah(row.netSalary)}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className={`badge capitalize ${statusMeta[row.status]?.color}`}>{statusMeta[row.status]?.label}</span>
                        {row.errorMessage && <span className="text-[10px] text-semantic-down truncate max-w-[100px]" title={row.errorMessage}>⚠ {row.errorMessage}</span>}
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        {row.status === 'error' && (
                          <button onClick={() => setReprocessTarget(row.id)} className="min-h-9 px-2.5 rounded-lg bg-amber-50 text-accent-yellow text-[11px] font-semibold hover:bg-amber-100 transition-colors gap-1 inline-flex items-center" title="Reprocess"><RefreshCw size={12} /> Reprocess</button>
                        )}
                        <button onClick={() => setSelectedPayslip(row)} className="min-h-9 min-w-9 rounded-lg hover:bg-primary-surface inline-flex items-center justify-center transition-colors" aria-label={`View payslip for ${row.name}`}>
                          <Eye size={15} className="text-primary" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-hairline-soft flex items-center justify-between">
          <p className="text-xs text-muted">Showing {filtered.length} of {payroll.length} records</p>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span>Gross: <span className="font-mono font-semibold text-ink">{formatRupiah(totalGross)}</span></span>
            <span>Net: <span className="font-mono font-semibold text-cta">{formatRupiah(totalNet)}</span></span>
          </div>
        </div>
      </div>

      {selectedPayslip && <PayslipDetailModal record={selectedPayslip} onClose={() => setSelectedPayslip(null)} />}
      {showProcessStepper && <ProcessingStepper step={processStep} onClose={() => setShowProcessStepper(false)} />}

      <ConfirmDialog open={confirmProcess} title="Process September 2026 payroll?" description={`This will calculate PPh 21, BPJS contributions, and generate payslips for ${filtered.length} employees. This action cannot be undone.`} confirmLabel="Process payroll" onConfirm={handleProcessPayroll} onCancel={() => setConfirmProcess(false)} />
      <ConfirmDialog open={confirmExport} title="Export bank transfer file?" description="A CSV file will be generated for upload to internet banking (BCA, Mandiri, BNI, BRI). Only processed employees will be included." confirmLabel="Export CSV" onConfirm={handleExport} onCancel={() => setConfirmExport(false)} />

      {confirmLock && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setConfirmLock(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">{locked ? <Unlock size={16} className="text-accent-yellow" /> : <Lock size={16} className="text-accent-yellow" />}</div>
              <h3 className="text-base font-bold text-ink">{locked ? 'Unlock payroll period?' : 'Lock payroll period?'}</h3>
            </div>
            <p className="text-sm text-body mb-5">
              {locked ? 'Unlocking will allow changes to this payroll period. Processed records will remain unchanged.' : 'Locking prevents any changes to this payroll period. Process and export will be disabled.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmLock(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleToggleLock} className="min-h-10 px-4 rounded-pill bg-accent-yellow text-white text-sm font-semibold hover:bg-amber-600 transition-colors">{locked ? 'Unlock' : 'Lock'} period</button>
            </div>
          </div>
        </div>
      )}

      {reprocessTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setReprocessTarget(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center"><RefreshCw size={16} className="text-accent-yellow" /></div>
              <h3 className="text-base font-bold text-ink">Reprocess payroll?</h3>
            </div>
            <p className="text-sm text-body mb-2">This will recalculate and retry processing for this employee.</p>
            <p className="text-xs text-muted mb-5">The error was: {payroll.find((r) => r.id === reprocessTarget)?.errorMessage}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setReprocessTarget(null)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={() => handleReprocess(reprocessTarget)} className="btn-cta text-sm gap-2"><RefreshCw size={14} /> Reprocess</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
