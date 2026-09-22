'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Download, MoreHorizontal, ChevronLeft, ChevronRight,
  X, Mail, Phone, MapPin, Calendar, Briefcase, Eye, UserRound,
} from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

type Employee = {
  id: string;
  employeeId: string;
  name: string;
  initials: string;
  department: string;
  position: string;
  status: 'active' | 'inactive' | 'probation';
  joinDate: string;
  email: string;
  phone: string;
  location: string;
  manager: string;
  salary: number;
  color: string;
  contractExpiry: string;
  leaveBalance: number;
};

const allEmployees: Employee[] = [
  { id: '1', employeeId: 'EMP-20260101-001', name: 'Rina Sari', initials: 'RS', department: 'HR', position: 'HR Manager', status: 'active', joinDate: '2020-03-15', email: 'rina@company.com', phone: '+62 812-3456-7890', location: 'Jakarta HQ', manager: 'Arif Darmawan', salary: 18000000, color: 'bg-primary-surface text-primary', contractExpiry: '2027-03-15', leaveBalance: 12 },
  { id: '2', employeeId: 'EMP-20260101-002', name: 'Budi Hartono', initials: 'BH', department: 'Engineering', position: 'Tech Lead', status: 'active', joinDate: '2021-06-01', email: 'budi@company.com', phone: '+62 813-4567-8901', location: 'Jakarta HQ', manager: 'Arif Darmawan', salary: 25000000, color: 'bg-cta-surface text-cta-hover', contractExpiry: '2027-06-01', leaveBalance: 9 },
  { id: '3', employeeId: 'EMP-20260101-003', name: 'Sari Dewi', initials: 'SD', department: 'Marketing', position: 'Marketing Specialist', status: 'active', joinDate: '2023-01-10', email: 'sari@company.com', phone: '+62 815-5678-9012', location: 'Bandung', manager: 'Arif Darmawan', salary: 12000000, color: 'bg-pink-50 text-pink-600', contractExpiry: '2026-12-31', leaveBalance: 14 },
  { id: '4', employeeId: 'EMP-20260101-004', name: 'Andi Pratama', initials: 'AP', department: 'Finance', position: 'Finance Officer', status: 'active', joinDate: '2022-09-20', email: 'andi@company.com', phone: '+62 816-6789-0123', location: 'Jakarta HQ', manager: 'Arif Darmawan', salary: 14000000, color: 'bg-amber-50 text-accent-yellow', contractExpiry: '2026-10-20', leaveBalance: 8 },
  { id: '5', employeeId: 'EMP-20260101-005', name: 'Dewi Lestari', initials: 'DL', department: 'HR', position: 'Recruiter', status: 'active', joinDate: '2024-02-14', email: 'dewi@company.com', phone: '+62 817-7890-1234', location: 'Jakarta HQ', manager: 'Rina Sari', salary: 10000000, color: 'bg-violet-50 text-violet-600', contractExpiry: '2027-02-14', leaveBalance: 15 },
  { id: '6', employeeId: 'EMP-20260101-006', name: 'Rizky Prasetyo', initials: 'RP', department: 'Engineering', position: 'Backend Developer', status: 'active', joinDate: '2023-08-01', email: 'rizky@company.com', phone: '+62 818-8901-2345', location: 'Jakarta HQ', manager: 'Budi Hartono', salary: 16000000, color: 'bg-emerald-50 text-emerald-600', contractExpiry: '2027-08-01', leaveBalance: 11 },
  { id: '7', employeeId: 'EMP-20260101-007', name: 'Maya Anggraeni', initials: 'MA', department: 'Design', position: 'UI/UX Designer', status: 'active', joinDate: '2024-04-15', email: 'maya@company.com', phone: '+62 819-9012-3456', location: 'Surabaya', manager: 'Budi Hartono', salary: 14000000, color: 'bg-violet-50 text-violet-600', contractExpiry: '2027-04-15', leaveBalance: 13 },
  { id: '8', employeeId: 'EMP-20260101-008', name: 'Fajar Nugroho', initials: 'FN', department: 'Engineering', position: 'Frontend Developer', status: 'inactive', joinDate: '2022-11-01', email: 'fajar@company.com', phone: '+62 821-0123-4567', location: 'Remote', manager: 'Budi Hartono', salary: 15000000, color: 'bg-sky-50 text-sky-600', contractExpiry: '2025-11-01', leaveBalance: 0 },
  { id: '9', employeeId: 'EMP-20260101-009', name: 'Yuni Kartika', initials: 'YK', department: 'CS', position: 'CS Manager', status: 'active', joinDate: '2022-11-19', email: 'yuni@company.com', phone: '+62 822-2345-6789', location: 'Jakarta HQ', manager: 'Arif Darmawan', salary: 16000000, color: 'bg-rose-50 text-rose-600', contractExpiry: '2027-11-19', leaveBalance: 10 },
  { id: '10', employeeId: 'EMP-20260101-010', name: 'Larasati Hadi', initials: 'LH', department: 'HR', position: 'HR Officer', status: 'probation', joinDate: '2025-08-01', email: 'larasati@company.com', phone: '+62 823-3456-7890', location: 'Jakarta HQ', manager: 'Rina Sari', salary: 9000000, color: 'bg-amber-50 text-accent-yellow', contractExpiry: '2026-11-01', leaveBalance: 6 },
  { id: '11', employeeId: 'EMP-20260101-011', name: 'Nadia Putri', initials: 'NP', department: 'Design', position: 'Product Designer', status: 'probation', joinDate: '2025-09-15', email: 'nadia@company.com', phone: '+62 824-4567-8901', location: 'Jakarta HQ', manager: 'Maya Anggraeni', salary: 11000000, color: 'bg-pink-50 text-pink-600', contractExpiry: '2026-12-15', leaveBalance: 4 },
  { id: '12', employeeId: 'EMP-20260101-012', name: 'Adi Wijaya', initials: 'AW', department: 'Engineering', position: 'DevOps Engineer', status: 'active', joinDate: '2024-03-10', email: 'adi@company.com', phone: '+62 825-5678-9012', location: 'Jakarta HQ', manager: 'Budi Hartono', salary: 17000000, color: 'bg-emerald-50 text-emerald-600', contractExpiry: '2027-03-10', leaveBalance: 10 },
];

const statusMeta: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-cta-surface text-cta-hover' },
  inactive: { label: 'Inactive', color: 'bg-surface-strong text-muted' },
  probation: { label: 'Probation', color: 'bg-amber-50 text-accent-yellow' },
};

function EmployeeDetailModal({ emp, onClose }: { emp: Employee; onClose: () => void }) {
  const [copied, setCopied] = useState('');
  const copy = async (val: string, label: string) => { await navigator.clipboard?.writeText(val); setCopied(label); setTimeout(() => setCopied(''), 1500); };
  const st = statusMeta[emp.status];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="emp-detail-title">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end p-4 pb-0">
          <button onClick={onClose} aria-label="Close employee details" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>
        <div className="text-center px-6 -mt-2">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${emp.color}`}>
            <span className="text-xl font-bold">{emp.initials}</span>
          </div>
          <h2 id="emp-detail-title" className="text-lg font-bold text-ink mt-3">{emp.name}</h2>
          <p className="text-sm text-muted">{emp.position}</p>
          <span className={`badge mt-2 ${st.color}`}>{st.label}</span>
        </div>

        <div className="px-6 py-5 space-y-3 border-t border-hairline-soft mt-4">
          <div className="flex items-center gap-3 text-sm"><Briefcase size={15} className="text-muted shrink-0" /><span className="text-body">{emp.department}</span></div>
          <div className="flex items-center gap-3 text-sm"><UserRound size={15} className="text-muted shrink-0" /><span className="text-body">Reports to {emp.manager}</span></div>
          <div className="flex items-center gap-3 text-sm"><MapPin size={15} className="text-muted shrink-0" /><span className="text-body">{emp.location}</span></div>
          <div className="flex items-center gap-3 text-sm"><Calendar size={15} className="text-muted shrink-0" /><span className="text-body">Joined {new Date(emp.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>

          <div className="pt-3 border-t border-hairline-soft space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-3"><Mail size={15} className="text-muted" /><span className="text-body">{emp.email}</span></span>
              <button onClick={() => copy(emp.email, 'email')} className="text-primary" aria-label="Copy email">{copied === 'email' ? <span className="text-cta text-[11px] font-semibold">Copied!</span> : <Copy size={14} />}</button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-3"><Phone size={15} className="text-muted" /><span className="text-body">{emp.phone}</span></span>
              <button onClick={() => copy(emp.phone, 'phone')} className="text-primary" aria-label="Copy phone">{copied === 'phone' ? <span className="text-cta text-[11px] font-semibold">Copied!</span> : <Copy size={14} />}</button>
            </div>
          </div>

          <div className="pt-3 border-t border-hairline-soft grid grid-cols-3 gap-3">
            <div className="text-center rounded-xl bg-surface-soft p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Contract</p>
              <p className="text-xs font-bold text-ink mt-1">{new Date(emp.contractExpiry).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="text-center rounded-xl bg-surface-soft p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Leave bal.</p>
              <p className="text-xs font-bold text-ink mt-1">{emp.leaveBalance} days</p>
            </div>
            <div className="text-center rounded-xl bg-surface-soft p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">ID</p>
              <p className="text-[10px] font-mono font-bold text-ink mt-1">{emp.employeeId}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-hairline-soft flex gap-3">
          <a href={`mailto:${emp.email}`} className="btn-cta flex-1 justify-center gap-2 text-sm"><Mail size={14} /> Email</a>
          <a href={`/employees/${emp.id}`} className="btn-secondary flex-1 justify-center gap-2 text-sm"><Eye size={14} /> Full Profile</a>
        </div>
      </div>
    </div>
  );
}

function Copy({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

const PAGE_SIZE = 10;

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [detailEmp, setDetailEmp] = useState<Employee | null>(null);
  const [page, setPage] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const { toast } = useToast();

  const departments = ['All', ...Array.from(new Set(allEmployees.map((e) => e.department)))];

  const filtered = useMemo(() =>
    allEmployees
      .filter((e) => `${e.name} ${e.employeeId} ${e.position}`.toLowerCase().includes(search.toLowerCase()))
      .filter((e) => deptFilter === 'All' || e.department === deptFilter)
      .filter((e) => statusFilter === 'all' || e.status === statusFilter),
    [search, deptFilter, statusFilter],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allSelected = paged.length > 0 && paged.every((e) => selected.includes(e.id));
  const toggleAll = () => setSelected(allSelected ? paged.filter((e) => !selected.includes(e.id)).length === 0 ? [] : selected.filter((id) => !paged.some((e) => e.id === id)) : [...new Set([...selected, ...paged.map((e) => e.id)])]);
  const toggleOne = (id: string) => setSelected((cur) => cur.includes(id) ? cur.filter((i) => i !== id) : [...cur, id]);

  const activeCount = allEmployees.filter((e) => e.status === 'active').length;
  const probationCount = allEmployees.filter((e) => e.status === 'probation').length;

  return (
    <div>
      <ModuleHeader
        eyebrow="People management"
        title="Employees"
        description="Manage your organization's people and employment records"
        action={<Link href="/employees/new" className="btn-cta gap-2 shrink-0"><Plus size={16} /> Add Employee</Link>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-xs text-muted font-semibold">Total employees</p>
          <p className="mt-2 font-mono text-2xl font-bold text-ink">{allEmployees.length}</p>
          <p className="text-xs text-cta mt-1">+3 this month</p>
        </div>
        <div className="card">
          <p className="text-xs text-muted font-semibold">Active</p>
          <p className="mt-2 font-mono text-2xl font-bold text-ink">{activeCount}</p>
          <p className="text-xs text-muted mt-1">{((activeCount / allEmployees.length) * 100).toFixed(1)}% of workforce</p>
        </div>
        <div className="card">
          <p className="text-xs text-muted font-semibold">On probation</p>
          <p className="mt-2 font-mono text-2xl font-bold text-ink">{probationCount}</p>
          <p className="text-xs text-accent-yellow mt-1">Ending within 90 days</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-hairline-soft space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" />
              <input type="search" aria-label="Search employees" placeholder="Search by name, ID, or position..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full min-h-10 rounded-pill bg-surface-strong pl-9 pr-3 py-2 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} className="min-h-10 px-3 rounded-pill bg-surface-strong text-xs font-semibold text-muted appearance-none pr-8 cursor-pointer">
                {departments.map((d) => <option key={d}>{d}</option>)}
              </select>
              <button onClick={() => setShowExport(true)} className="btn-secondary gap-1.5 text-xs py-2 px-3 min-h-10"><Download size={13} /> Export</button>
            </div>
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'probation', 'inactive'] as const).map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`min-h-9 px-3 rounded-pill text-[11px] font-semibold whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>
                {s === 'all' ? 'All' : statusMeta[s].label}
                {s !== 'all' && <span className="ml-1 opacity-70">{allEmployees.filter((e) => e.status === s).length}</span>}
              </button>
            ))}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="px-5 py-3 bg-primary-surface border-b border-indigo-100 flex items-center justify-between">
            <p className="text-xs font-semibold text-primary">{selected.length} employee{selected.length > 1 ? 's' : ''} selected</p>
            <div className="flex gap-2">
              <div className="relative">
                <button onClick={() => setShowBulkActions(!showBulkActions)} className="text-xs font-semibold text-primary hover:text-primary-hover">Bulk actions</button>
                {showBulkActions && (
                  <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-canvas border border-hairline shadow-xl z-20 py-1">
                    <button onClick={() => { toast(`Status update queued for ${selected.length} employees.`, 'success'); setShowBulkActions(false); }} className="w-full text-left px-3 py-2.5 text-xs text-body hover:bg-surface-soft">Update status</button>
                    <button onClick={() => { toast(`Email composer opened for ${selected.length} employees.`, 'success'); setShowBulkActions(false); }} className="w-full text-left px-3 py-2.5 text-xs text-body hover:bg-surface-soft">Send email</button>
                    <button onClick={() => { setShowExport(true); setShowBulkActions(false); }} className="w-full text-left px-3 py-2.5 text-xs text-body hover:bg-surface-soft">Export selected</button>
                  </div>
                )}
              </div>
              <button onClick={() => setSelected([])} className="text-xs font-semibold text-muted hover:text-ink">Clear</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-hairline">
                <th className="table-header w-12"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all employees" className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary" /></th>
                <th className="table-header">Employee</th>
                <th className="table-header">ID</th>
                <th className="table-header">Department</th>
                <th className="table-header">Position</th>
                <th className="table-header">Join Date</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={8}><EmptyState title="No employees found" description="Try a different search term or filter." /></td></tr>
              ) : paged.map((emp) => (
                <tr key={emp.id} className="table-row">
                  <td className="table-cell"><input type="checkbox" checked={selected.includes(emp.id)} onChange={() => toggleOne(emp.id)} aria-label={`Select ${emp.name}`} className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary" /></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${emp.color}`}>
                        <span className="text-[11px] font-bold">{emp.initials}</span>
                      </div>
                      <div>
                        <button onClick={() => setDetailEmp(emp)} className="font-semibold text-ink hover:text-primary transition-colors text-left">{emp.name}</button>
                        <p className="text-[11px] text-muted">{emp.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell font-mono text-xs text-muted">{emp.employeeId}</td>
                  <td className="table-cell"><span className="badge bg-surface-strong text-muted">{emp.department}</span></td>
                  <td className="table-cell text-body text-sm">{emp.position}</td>
                  <td className="table-cell text-muted text-sm">{new Date(emp.joinDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="table-cell"><span className={`badge capitalize ${statusMeta[emp.status].color}`}>{statusMeta[emp.status].label}</span></td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setDetailEmp(emp)} className="min-h-10 min-w-10 p-2.5 rounded-md hover:bg-primary-surface transition-colors cursor-pointer" aria-label={`View ${emp.name}`} title="View details"><Eye size={15} className="text-muted mx-auto" /></button>
                      <button className="min-h-10 min-w-10 p-2.5 rounded-md hover:bg-primary-surface transition-colors cursor-pointer" aria-label={`Actions for ${emp.name}`} title="More actions"><MoreHorizontal size={16} className="text-muted mx-auto" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-hairline-soft flex items-center justify-between">
          <p className="text-xs text-muted">Showing {paged.length} of {filtered.length} employees {filtered.length !== allEmployees.length && `(filtered from ${allEmployees.length})`}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="min-h-10 min-w-10 p-2.5 rounded-md hover:bg-primary-surface transition-colors cursor-pointer disabled:opacity-30" aria-label="Previous page"><ChevronLeft size={16} className="text-muted mx-auto" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`min-h-10 min-w-10 p-2.5 rounded-md text-xs font-semibold transition-colors ${p === page ? 'bg-primary text-white' : 'hover:bg-primary-surface text-muted'}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="min-h-10 min-w-10 p-2.5 rounded-md hover:bg-primary-surface transition-colors cursor-pointer disabled:opacity-30" aria-label="Next page"><ChevronRight size={16} className="text-muted mx-auto" /></button>
          </div>
        </div>
      </div>

      {detailEmp && <EmployeeDetailModal emp={detailEmp} onClose={() => setDetailEmp(null)} />}

      {showExport && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowExport(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-ink">Export Employees</h2>
              <button onClick={() => setShowExport(false)} aria-label="Close" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-ink">Scope
                <select className="input-field mt-1.5 w-full">
                  <option>{selected.length > 0 ? `Selected employees (${selected.length})` : 'All employees'}</option>
                  <option>Filtered results ({filtered.length})</option>
                  <option>Active only ({activeCount})</option>
                  <option>On probation ({probationCount})</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-ink">Fields
                <select defaultValue="all" className="input-field mt-1.5 w-full">
                  <option value="all">All fields</option>
                  <option value="basic">Name, ID, Department, Position</option>
                  <option value="contact">Name, Email, Phone, Location</option>
                  <option value="payroll">Name, Department, Salary, Status</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-ink">Format
                <select defaultValue="csv" className="input-field mt-1.5 w-full">
                  <option value="csv">CSV</option>
                  <option value="xlsx">XLSX</option>
                  <option value="pdf">PDF</option>
                </select>
              </label>
            </div>
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-hairline-soft">
              <button onClick={() => setShowExport(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={() => { setShowExport(false); toast(`Employee export started. The file will download shortly.`, 'success'); }} className="btn-cta text-sm gap-2"><Download size={14} /> Export</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
