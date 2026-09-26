'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import {
  Plus, Search, Download, Upload, MoreHorizontal, ChevronLeft, ChevronRight,
  X, Mail, Phone, MapPin, Calendar, Briefcase, Eye, UserRound, Send,
} from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { parseCsv, toCsv, type CsvRow } from '@/lib/csv';

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

type EmployeeApiRecord = {
  id: string;
  employee_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  join_date: string;
  employment_status: string;
  department?: string | null;
  position?: string | null;
  status: string;
  branch?: string | null;
  base_salary?: number | null;
  contract_end?: string | null;
};

type EmployeeListResponse = { items: EmployeeApiRecord[]; total: number; page: number; per_page: number; total_pages: number };

function mapEmployee(record: EmployeeApiRecord, index: number): Employee {
  const name = record.full_name || 'Unnamed employee';
  const status = ['active', 'inactive', 'probation'].includes(record.status) ? record.status as Employee['status'] : 'active';
  return {
    id: record.id,
    employeeId: record.employee_id,
    name,
    initials: initialsFromName(name),
    department: record.department || 'Unassigned',
    position: record.position || 'Unassigned',
    status,
    joinDate: record.join_date,
    email: record.email || '',
    phone: record.phone || '',
    location: record.branch || '—',
    manager: '—',
    salary: Number(record.base_salary || 0),
    color: COLORS[index % COLORS.length],
    contractExpiry: record.contract_end || '—',
    leaveBalance: 0,
  };
}

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

const EmployeeDetailModal = ({ emp, onClose }: { emp: Employee; onClose: () => void }) => {
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

type ParsedImportRow = { row: CsvRow; index: number; valid: boolean; errors: string[] };

const REQUIRED_FIELDS = ['name', 'department', 'position'] as const;
const OPTIONAL_FIELDS = ['employeeid', 'email', 'phone', 'location', 'manager', 'status', 'joindate', 'salary', 'contractexpiry', 'leavebalance'] as const;
const VALID_STATUSES = ['active', 'inactive', 'probation'];

function initialsFromName(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}

const COLORS = [
  'bg-primary-surface text-primary', 'bg-cta-surface text-cta-hover',
  'bg-pink-50 text-pink-600', 'bg-amber-50 text-accent-yellow',
  'bg-violet-50 text-violet-600', 'bg-emerald-50 text-emerald-600',
  'bg-sky-50 text-sky-600', 'bg-rose-50 text-rose-600',
];

function validateRow(row: CsvRow, index: number): ParsedImportRow {
  const errors: string[] = [];
  for (const field of REQUIRED_FIELDS) {
    if (!row[field]?.trim()) errors.push(`Missing required field: "${field}"`);
  }
  if (row.status && !VALID_STATUSES.includes(row.status.toLowerCase().trim())) {
    errors.push(`Invalid status: "${row.status}". Must be active, inactive, or probation.`);
  }
  if (row.salary && isNaN(Number(row.salary.replace(/[^0-9.\-]/g, '')))) {
    errors.push(`Invalid salary: "${row.salary}"`);
  }
  return { row, index, valid: errors.length === 0, errors };
}

function rowToEmployee(row: CsvRow, counter: number, color: string): Employee {
  const name = row.name?.trim() ?? '';
  const id = `imp-${Date.now()}-${counter}`;
  const salary = Number((row.salary ?? '0').replace(/[^0-9.\-]/g, ''));
  return {
    id,
    employeeId: row.employeeid?.trim() || `EMP-IMP-${String(counter).padStart(3, '0')}`,
    name,
    initials: initialsFromName(name),
    department: row.department?.trim() ?? '',
    position: row.position?.trim() ?? '',
    status: (VALID_STATUSES.includes(row.status?.toLowerCase().trim()) ? row.status.toLowerCase().trim() : 'active') as Employee['status'],
    joinDate: row.joindate?.trim() || new Date().toISOString().slice(0, 10),
    email: row.email?.trim() || '',
    phone: row.phone?.trim() || '',
    location: row.location?.trim() || '',
    manager: row.manager?.trim() || '',
    salary: isNaN(salary) ? 0 : salary,
    color,
    contractExpiry: row.contractexpiry?.trim() || new Date().toISOString().slice(0, 10),
    leaveBalance: Number(row.leavebalance) || 12,
  };
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

const PAGE_SIZE = 10;

type ImportModalProps = { onClose: () => void; onConfirm: (employees: Employee[]) => void };
type ExportScope = 'all' | 'filtered' | 'selected' | 'active' | 'probation';
type ExportFieldSet = 'all' | 'basic' | 'contact' | 'payroll';
type ExportModalProps = {
  employeeCount: number;
  filteredCount: number;
  selectedCount: number;
  activeCount: number;
  probationCount: number;
  onClose: () => void;
  onExport: (scope: ExportScope, fieldSet: ExportFieldSet) => void;
};

function ModalShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-canvas border border-hairline shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline-soft">
          <h2 className="text-base font-bold text-ink">{title}</h2>
          <button onClick={onClose} aria-label={`Close ${title}`} className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ImportModal({ onClose, onConfirm }: ImportModalProps) {
  const [rows, setRows] = useState<ParsedImportRow[]>([]);
  const [error, setError] = useState('');
  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) { setError('Only CSV files are supported in this preview.'); return; }
    const parsed = parseCsv(await file.text());
    setRows(parsed.map((row, index) => validateRow(row, index + 2)));
    setError(parsed.length === 0 ? 'The file has no data rows.' : '');
  };
  const validRows = rows.filter((item) => item.valid);
  return (
    <ModalShell title="Import employees" onClose={onClose}>
      <div className="p-6 space-y-4">
        <label className="block rounded-xl border-2 border-dashed border-hairline p-8 text-center hover:border-primary transition-colors cursor-pointer">
          <Upload size={22} className="mx-auto text-primary mb-2" />
          <span className="text-sm font-semibold text-ink">Choose a CSV file</span>
          <span className="block text-xs text-muted mt-1">Required columns: name, department, position</span>
          <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => handleFile(event.target.files?.[0])} />
        </label>
        {error && <p className="text-xs text-semantic-down">{error}</p>}
        {rows.length > 0 && <div className="overflow-x-auto rounded-lg border border-hairline"><table className="w-full min-w-[560px] text-xs"><thead><tr className="bg-surface-soft"><th className="table-header">Row</th><th className="table-header">Name</th><th className="table-header">Department</th><th className="table-header">Status</th><th className="table-header">Validation</th></tr></thead><tbody>{rows.slice(0, 8).map((item) => <tr key={item.index} className="border-t border-hairline-soft"><td className="table-cell">{item.index}</td><td className="table-cell text-ink">{item.row.name || '—'}</td><td className="table-cell">{item.row.department || '—'}</td><td className="table-cell">{item.valid ? <span className="text-cta font-semibold">Valid</span> : <span className="text-semantic-down font-semibold">Error</span>}</td><td className="table-cell text-muted">{item.errors[0] || 'Ready to import'}</td></tr>)}</tbody></table></div>}
        {rows.length > 8 && <p className="text-xs text-muted">Showing first 8 of {rows.length} rows.</p>}
        <div className="flex items-center justify-between pt-2"><p className="text-xs text-muted">{validRows.length} valid of {rows.length} rows</p><div className="flex gap-2"><button onClick={onClose} className="btn-secondary text-sm">Cancel</button><button disabled={validRows.length === 0} onClick={() => { onConfirm(validRows.map((item, index) => rowToEmployee(item.row, index + 1, COLORS[index % COLORS.length]))); onClose(); }} className="btn-cta text-sm disabled:opacity-50">Import valid rows</button></div></div>
      </div>
    </ModalShell>
  );
}

function ExportModal({ employeeCount, filteredCount, selectedCount, activeCount, probationCount, onClose, onExport }: ExportModalProps) {
  const [scope, setScope] = useState<ExportScope>('all');
  const [fieldSet, setFieldSet] = useState<'all' | 'basic' | 'contact' | 'payroll'>('all');
  return (
    <ModalShell title="Export employees" onClose={onClose}>
      <div className="p-6 space-y-5">
        <div><p className="text-xs font-semibold text-muted mb-2">Records</p><select value={scope} onChange={(event) => setScope(event.target.value as ExportScope)} className="input-field w-full"><option value="all">All employees ({employeeCount})</option><option value="filtered">Current filtered results ({filteredCount})</option><option value="selected" disabled={selectedCount === 0}>Selected employees ({selectedCount})</option><option value="active">Active employees ({activeCount})</option><option value="probation">Probation employees ({probationCount})</option></select></div>
        <div><p className="text-xs font-semibold text-muted mb-2">Columns</p><select value={fieldSet} onChange={(event) => setFieldSet(event.target.value as ExportFieldSet)} className="input-field w-full"><option value="all">All employee fields</option><option value="basic">Basic information</option><option value="contact">Contact information</option><option value="payroll">Payroll summary</option></select></div>
        <div className="flex justify-end gap-2"><button onClick={onClose} className="btn-secondary text-sm">Cancel</button><button onClick={() => onExport(scope, fieldSet)} className="btn-cta gap-2 text-sm"><Download size={14} /> Download CSV</button></div>
      </div>
    </ModalShell>
  );
}

type BulkStatusModalProps = { count: number; onClose: () => void; onConfirm: (status: Employee['status']) => void };
function BulkStatusModal({ count, onClose, onConfirm }: BulkStatusModalProps) {
  const [status, setStatus] = useState<Employee['status']>('active');
  return (
    <ModalShell title="Update employee status" onClose={onClose}>
      <div className="p-6 space-y-5">
        <p className="text-sm text-body">Select the new status for <strong>{count}</strong> selected employee{count === 1 ? '' : 's'}.</p>
        <select value={status} onChange={(event) => setStatus(event.target.value as Employee['status'])} className="input-field w-full">
          <option value="active">Active</option><option value="probation">Probation</option><option value="inactive">Inactive</option>
        </select>
        <div className="flex justify-end gap-2"><button onClick={onClose} className="btn-secondary text-sm">Cancel</button><button onClick={() => onConfirm(status)} className="btn-cta text-sm">Update status</button></div>
      </div>
    </ModalShell>
  );
}

type BulkEmailModalProps = { employees: Employee[]; onClose: () => void; onSend: (subject: string, body: string) => void };
function BulkEmailModal({ employees, onClose, onSend }: BulkEmailModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const valid = subject.trim().length > 0 && body.trim().length > 0;
  return (
    <ModalShell title="Send email" onClose={onClose}>
      <div className="p-6 space-y-4">
        <div><p className="text-xs font-semibold text-muted mb-2">Recipients ({employees.length})</p><div className="rounded-lg bg-surface-soft p-3 text-xs text-body max-h-20 overflow-y-auto">{employees.map((employee) => employee.email || employee.name).join(', ')}</div></div>
        <div><label className="text-xs font-semibold text-muted">Subject</label><input value={subject} onChange={(event) => setSubject(event.target.value)} className="input-field w-full mt-2" placeholder="Email subject" /></div>
        <div><label className="text-xs font-semibold text-muted">Message</label><textarea value={body} onChange={(event) => setBody(event.target.value)} className="input-field w-full mt-2" rows={5} placeholder="Write your message..." /></div>
        <div className="flex justify-end gap-2"><button onClick={onClose} className="btn-secondary text-sm">Cancel</button><button disabled={!valid} onClick={() => onSend(subject.trim(), body.trim())} className="btn-cta gap-2 text-sm disabled:opacity-50"><Send size={14} /> Send email</button></div>
      </div>
    </ModalShell>
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [detailEmp, setDetailEmp] = useState<Employee | null>(null);
  const [page, setPage] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [actionEmployee, setActionEmployee] = useState<string | null>(null);
  const { toast } = useToast();

  const loadEmployees = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await api.get<EmployeeListResponse>('/employees', { params: { page, per_page: PAGE_SIZE, search: search || undefined, status: statusFilter === 'all' ? undefined : statusFilter, department: deptFilter === 'All' ? undefined : deptFilter } });
      setEmployees(response.data.items.map(mapEmployee));
      setTotal(response.data.total);
      setTotalPages(Math.max(1, response.data.total_pages));
    } catch (error: any) {
      setLoadError(error.response?.data?.detail || 'Could not load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadEmployees(); }, [page, search, statusFilter, deptFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, deptFilter]);

  const departments = ['All', ...Array.from(new Set(employees.map((e) => e.department)))];

  const filtered = employees;
  const paged = employees;

  const allSelected = paged.length > 0 && paged.every((e) => selected.includes(e.id));
  const toggleAll = () => setSelected(allSelected ? paged.filter((e) => !selected.includes(e.id)).length === 0 ? [] : selected.filter((id) => !paged.some((e) => e.id === id)) : [...new Set([...selected, ...paged.map((e) => e.id)])]);
  const toggleOne = (id: string) => setSelected((cur) => cur.includes(id) ? cur.filter((i) => i !== id) : [...cur, id]);

  const activeCount = total > 0 ? (statusFilter === 'active' ? total : employees.filter((e) => e.status === 'active').length) : 0;
  const probationCount = total > 0 ? (statusFilter === 'probation' ? total : employees.filter((e) => e.status === 'probation').length) : 0;

  const refreshEmployees = () => { void loadEmployees(); };

  const openEmployeeDetails = async (employee: Employee) => {
    setDetailEmp(employee);
    try {
      const response = await api.get<EmployeeApiRecord>(`/employees/${employee.id}`);
      setDetailEmp(mapEmployee(response.data, 0));
    } catch {
      toast('Could not load the latest employee details.', 'error');
    }
  };

  const handleImportConfirm = async (imported: Employee[]) => {
    // Single tenant-scoped batch request so the server owns validation, uniqueness,
    // and the per-row error report instead of firing N sequential writes.
    try {
      const response = await api.post('/employees/import', {
        rows: imported.map((employee) => ({
          full_name: employee.name,
          join_date: employee.joinDate,
          email: employee.email || null,
          phone: employee.phone || null,
          employment_status: employee.status === 'probation' ? 'contract' : 'permanent',
        })),
      });
      const created = response.data.imported ?? 0;
      await loadEmployees();
      toast(`Imported ${created} of ${imported.length} employee${imported.length !== 1 ? 's' : ''}.`, created === imported.length ? 'success' : 'error');
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      const firstError = error?.response?.data?.errors?.[0];
      await loadEmployees();
      toast(firstError ? `Row ${firstError.line}: ${firstError.reason}` : (detail || 'Import failed.'), 'error');
    }
  };

  const handleBulkStatus = async (status: Employee['status']) => {
    try {
      await Promise.all(selected.map((id) => api.put(`/employees/${id}`, { status })));
      await loadEmployees();
      toast(`Updated status for ${selected.length} employee${selected.length !== 1 ? 's' : ''}.`, 'success');
      setShowStatusModal(false);
      setSelected([]);
    } catch {
      toast('Could not update all selected employees.', 'error');
    }
  };

  const handleBulkEmail = (subject: string) => {
    toast(`Email sent to ${selected.length} employee${selected.length !== 1 ? 's' : ''}: ${subject}`, 'success');
    setShowEmailModal(false);
    setShowBulkActions(false);
  };

  const exportColumns: Record<string, string[]> = {
    all: ['employeeId', 'name', 'department', 'position', 'status', 'joinDate', 'email', 'phone', 'location', 'manager', 'salary', 'contractExpiry', 'leaveBalance'],
    basic: ['employeeId', 'name', 'department', 'position'],
    contact: ['name', 'email', 'phone', 'location'],
    payroll: ['name', 'department', 'salary', 'status'],
  };

  return (
    <div>
      <ModuleHeader
        eyebrow="People management"
        title="Employees"
        description="Manage your organization's people and employment records"
        action={
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setShowImport(true)} className="btn-secondary gap-2 text-sm"><Upload size={15} /> Import</button>
            <Link href="/employees/new" className="btn-cta gap-2 text-sm"><Plus size={15} /> Add Employee</Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-xs text-muted font-semibold">Total employees</p>
          <p className="mt-2 font-mono text-2xl font-bold text-ink">{employees.length}</p>
          <p className="text-xs text-cta mt-1">+3 this month</p>
        </div>
        <div className="card">
          <p className="text-xs text-muted font-semibold">Active</p>
          <p className="mt-2 font-mono text-2xl font-bold text-ink">{activeCount}</p>
          <p className="text-xs text-muted mt-1">{employees.length > 0 ? ((activeCount / employees.length) * 100).toFixed(1) : '0'}% of workforce</p>
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
                {s !== 'all' && <span className="ml-1 opacity-70">{employees.filter((e) => e.status === s).length}</span>}
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
                    <button onClick={() => { setShowStatusModal(true); setShowBulkActions(false); }} className="w-full text-left px-3 py-2.5 text-xs text-body hover:bg-surface-soft">Update status</button>
                    <button onClick={() => { setShowEmailModal(true); setShowBulkActions(false); }} className="w-full text-left px-3 py-2.5 text-xs text-body hover:bg-surface-soft">Send email</button>
                    <button onClick={() => { setShowExport(true); setShowBulkActions(false); }} className="w-full text-left px-3 py-2.5 text-xs text-body hover:bg-surface-soft">Export selected</button>
                  </div>
                )}
              </div>
              <button onClick={() => setSelected([])} className="text-xs font-semibold text-muted hover:text-ink">Clear</button>
            </div>
          </div>
        )}

        {loadError && (
          <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-semantic-down">{loadError}</p>
            <button onClick={refreshEmployees} className="btn-secondary text-xs">Retry</button>
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
              {loading ? (
                <tr><td colSpan={8} className="table-cell text-center text-muted">Loading employees...</td></tr>
              ) : paged.length === 0 ? (
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
                        <button onClick={() => void openEmployeeDetails(emp)} className="font-semibold text-ink hover:text-primary transition-colors text-left">{emp.name}</button>
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
                      <button onClick={() => void openEmployeeDetails(emp)} className="min-h-10 min-w-10 p-2.5 rounded-md hover:bg-primary-surface transition-colors cursor-pointer" aria-label={`View ${emp.name}`} title="View details"><Eye size={15} className="text-muted mx-auto" /></button>
                      <div className="relative">
                        <button onClick={() => setActionEmployee(actionEmployee === emp.id ? null : emp.id)} className="min-h-10 min-w-10 p-2.5 rounded-md hover:bg-primary-surface transition-colors cursor-pointer" aria-label={`Actions for ${emp.name}`} title="More actions"><MoreHorizontal size={16} className="text-muted mx-auto" /></button>
                        {actionEmployee === emp.id && <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-canvas border border-hairline shadow-xl z-20 py-1 text-left">
                          <button onClick={() => { void openEmployeeDetails(emp); setActionEmployee(null); }} className="w-full px-3 py-2 text-xs text-body hover:bg-surface-soft">View details</button>
                          <a href={`mailto:${emp.email}`} onClick={() => setActionEmployee(null)} className="block w-full px-3 py-2 text-xs text-body hover:bg-surface-soft">Send email</a>
                          <button onClick={async () => {
                            try {
                              const nextStatus = emp.status === 'inactive' ? 'active' : 'inactive';
                              if (nextStatus === 'inactive') await api.delete(`/employees/${emp.id}`);
                              else await api.put(`/employees/${emp.id}`, { status: nextStatus });
                              await loadEmployees();
                              setActionEmployee(null);
                              toast(`${emp.name} status updated.`, 'success');
                            } catch {
                              toast(`Could not update ${emp.name}.`, 'error');
                            }
                          }} className="w-full px-3 py-2 text-xs text-body hover:bg-surface-soft">{emp.status === 'inactive' ? 'Activate' : 'Deactivate'}</button>
                        </div>}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-hairline-soft flex items-center justify-between">
          <p className="text-xs text-muted">Showing {paged.length} of {total} employees</p>
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

      {showStatusModal && (
        <BulkStatusModal count={selected.length} onClose={() => setShowStatusModal(false)} onConfirm={handleBulkStatus} />
      )}

      {showEmailModal && (
        <BulkEmailModal employees={employees.filter((e) => selected.includes(e.id))} onClose={() => setShowEmailModal(false)} onSend={handleBulkEmail} />
      )}

      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} onConfirm={handleImportConfirm} />
      )}

      {showExport && (
        <ExportModal
          employeeCount={employees.length}
          filteredCount={filtered.length}
          selectedCount={selected.length}
          activeCount={activeCount}
          probationCount={probationCount}
          onClose={() => setShowExport(false)}
          onExport={(scope, fieldSet) => {
            let rows: Employee[];
            if (scope === 'selected' && selected.length > 0) rows = employees.filter((e) => selected.includes(e.id));
            else if (scope === 'filtered') rows = filtered;
            else if (scope === 'active') rows = employees.filter((e) => e.status === 'active');
            else if (scope === 'probation') rows = employees.filter((e) => e.status === 'probation');
            else rows = employees;

            const columns = exportColumns[fieldSet] ?? exportColumns.all;
            const csv = toCsv(rows, columns);
            downloadBlob(csv, `employees-${scope}-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
            toast(`Exported ${rows.length} employee${rows.length !== 1 ? 's' : ''} to CSV.`, 'success');
            setShowExport(false);
          }}
        />
      )}
    </div>
  );
}
