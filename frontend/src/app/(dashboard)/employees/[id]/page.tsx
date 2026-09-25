'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Building2, Briefcase, Pencil, MoreHorizontal, FileText, Wallet, CalendarDays, Clock, X } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

type Employee = {
  id: string; employee_id: string; full_name: string; email: string | null; phone: string | null; nik: string | null;
  npwp: string | null; join_date: string; department: string | null; position: string | null; status: string;
  address_domisili: string | null; address_ktp: string | null; emergency_contact_name: string | null;
  emergency_contact_phone: string | null; emergency_contact_relation: string | null; base_salary: number | null;
  bank_name: string | null; bank_account: string | null; branch: string | null;
};

function rupiah(n: number | null) { return n == null ? '—' : `Rp ${Number(n).toLocaleString('id-ID')}`; }

function tenure(joinDate: string) {
  const months = Math.floor((Date.now() - new Date(`${joinDate}T00:00:00`).getTime()) / (30 * 86400000));
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'}`;
}

type Tab = 'Overview' | 'Documents' | 'Payroll' | 'Leave' | 'Attendance';

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [emp, setEmp] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('Overview');
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [more, setMore] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true); setError('');
    try { const response = await api.get(`/employees/${id}`); setEmp(response.data); }
    catch (e: any) { setError(e.response?.data?.detail || 'Unable to load employee.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (id) void load(); }, [id]);

  const saveProfile = async (patch: Partial<Employee>) => {
    setSaving(true);
    try { const response = await api.put(`/employees/${id}`, patch); setEmp(response.data); setShowEdit(false); toast('Employee profile updated successfully.', 'success'); }
    catch (e: any) { toast(e.response?.data?.detail || 'Unable to update employee.', 'error'); }
    finally { setSaving(false); }
  };

  const deactivate = async () => {
    setMore(false);
    try { await api.delete(`/employees/${id}`); setEmp((current) => current ? { ...current, status: 'inactive' } : current); toast('Employee deactivated.', 'success'); }
    catch (e: any) { toast(e.response?.data?.detail || 'Unable to deactivate employee.', 'error'); }
  };

  if (loading) return <p className="text-sm text-muted">Loading employee…</p>;
  if (error) return <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-semantic-down">{error} <button onClick={() => void load()} className="btn-secondary text-xs ml-3">Retry</button></div>;
  if (!emp) return null;

  const initials = emp.full_name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return <div>
    <Link href="/employees" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors mb-5"><ArrowLeft size={14} /> Back to Employees</Link>
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 mb-6"><div className="w-16 h-16 rounded-2xl bg-primary-surface flex items-center justify-center shrink-0"><span className="text-xl font-bold text-primary">{initials}</span></div><div className="flex-1"><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold text-ink tracking-tight">{emp.full_name}</h1><span className="badge bg-cta-surface text-cta-hover capitalize">{emp.status}</span></div><p className="text-sm text-muted mt-1 font-mono">{emp.employee_id}</p><div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-body"><span className="flex items-center gap-1.5"><Briefcase size={14} className="text-muted" /> {emp.position ?? '—'}</span><span className="flex items-center gap-1.5"><Building2 size={14} className="text-muted" /> {emp.department ?? '—'}</span><span className="flex items-center gap-1.5"><Calendar size={14} className="text-muted" /> Joined {emp.join_date ? new Date(`${emp.join_date}T00:00:00`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '—'}</span></div></div><div className="flex gap-2"><button onClick={() => setShowEdit(true)} className="btn-secondary gap-2"><Pencil size={14} /> Edit Profile</button><div className="relative"><button onClick={() => setMore(!more)} className="btn-secondary min-w-11 px-3" aria-label="More actions"><MoreHorizontal size={16} /></button>{more && <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-canvas border border-hairline shadow-xl z-20 py-1"><button onClick={() => void deactivate()} disabled={emp.status === 'inactive'} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-semantic-down hover:bg-red-50 transition-colors disabled:opacity-50"><X size={13} /> Deactivate</button></div>}</div></div></div>
    <div className="flex gap-1 overflow-x-auto border-b border-hairline mb-6" role="tablist">{(['Overview', 'Documents', 'Payroll', 'Leave', 'Attendance'] as Tab[]).map((item) => <button key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`min-h-11 px-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === item ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'}`}>{item}</button>)}</div>

    {tab === 'Overview' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-5"><InfoCard title="Personal Details"><Row label="NIK" value={emp.nik ?? '—'} mono /><Row label="NPWP" value={emp.npwp ?? '—'} mono /><Row label="Email" value={emp.email ?? '—'} icon={<Mail size={13} />} /><Row label="Phone" value={emp.phone ?? '—'} icon={<Phone size={13} />} /><div className="pt-3 border-t border-hairline-soft"><span className="text-muted text-xs flex items-center gap-1.5"><MapPin size={13} /> Address</span><p className="text-ink mt-1.5 text-sm">{emp.address_domisili || emp.address_ktp || '—'}</p></div><div className="pt-3 border-t border-hairline-soft"><span className="text-muted text-xs">Emergency Contact</span><p className="text-ink mt-1.5 text-sm">{[emp.emergency_contact_name, emp.emergency_contact_phone, emp.emergency_contact_relation].filter(Boolean).join(' · ') || '—'}</p></div></InfoCard><InfoCard title="Employment"><Row label="Department" value={emp.department ?? '—'} /><Row label="Position" value={emp.position ?? '—'} /><Row label="Status" value={emp.status} /><Row label="Join Date" value={emp.join_date ?? '—'} /><div className="mt-4 rounded-xl bg-primary-surface p-4"><p className="text-xs text-primary font-semibold">Tenure</p><p className="text-xl font-mono font-bold text-ink mt-1">{tenure(emp.join_date)}</p></div></InfoCard><InfoCard title="Compensation"><Row label="Base Salary" value={rupiah(emp.base_salary)} mono /><Row label="Bank" value={emp.bank_name ? `${emp.bank_name} — ${emp.bank_account ?? '—'}` : '—'} /><Row label="Branch" value={emp.branch ?? '—'} /></InfoCard></div>}

    {tab === 'Documents' && <DataCard title="Employee documents" description="Documents stored in HRIS" icon={FileText}><p className="text-sm text-muted py-6 text-center">Documents are managed in the <Link href="/documents" className="text-primary font-semibold">Documents</Link> module and are scoped to this employee.</p></DataCard>}
    {tab === 'Payroll' && <DataCard title="Payroll history" description="Employee-scoped payslips" icon={Wallet}><p className="text-sm text-muted py-6 text-center">Payroll history per employee requires an employee-scoped payroll endpoint; aggregate payroll remains in the <Link href="/payroll" className="text-primary font-semibold">Payroll</Link> module.</p></DataCard>}
    {tab === 'Leave' && <DataCard title="Leave history" description="Approved and past leave requests" icon={CalendarDays}><p className="text-sm text-muted py-6 text-center">Leave history per employee is available in the <Link href="/leave" className="text-primary font-semibold">Leave</Link> module.</p></DataCard>}
    {tab === 'Attendance' && <DataCard title="Attendance summary" description="Per-employee attendance records" icon={Clock}><p className="text-sm text-muted py-6 text-center">Attendance per employee is available in the <Link href="/attendance" className="text-primary font-semibold">Attendance</Link> module.</p></DataCard>}

    {showEdit && <EditModal emp={emp} saving={saving} onClose={() => setShowEdit(false)} onSave={saveProfile} />}
  </div>;
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) { return <div className="card space-y-4"><h2 className="text-sm font-bold text-ink">{title}</h2><div className="space-y-3">{children}</div></div>; }
function Row({ label, value, mono = false, icon }: { label: string; value: string; mono?: boolean; icon?: React.ReactNode }) { return <div className="flex justify-between gap-4 text-sm"><span className="text-muted flex items-center gap-1.5">{icon}{label}</span><span className={`${mono ? 'font-mono' : ''} text-ink text-right break-all`}>{value}</span></div>; }
function DataCard({ title, description, icon: Icon, children }: { title: string; description: string; icon: typeof FileText; children: React.ReactNode }) { return <div className="card"><div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-lg bg-primary-surface flex items-center justify-center"><Icon size={17} className="text-primary" /></div><div><h2 className="text-sm font-bold text-ink">{title}</h2><p className="text-xs text-muted mt-0.5">{description}</p></div></div>{children}</div>; }

function EditModal({ emp, saving, onClose, onSave }: { emp: Employee; saving: boolean; onClose: () => void; onSave: (patch: Partial<Employee>) => void }) {
  const [email, setEmail] = useState(emp.email ?? '');
  const [phone, setPhone] = useState(emp.phone ?? '');
  const [address, setAddress] = useState(emp.address_domisili ?? '');
  const [emergency, setEmergency] = useState(emp.emergency_contact_phone ?? '');
  return <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true"><div className="absolute inset-0 bg-ink/40" onClick={onClose} /><div className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6"><div className="flex items-center justify-between mb-5"><div><h2 className="text-base font-bold text-ink">Edit employee profile</h2><p className="text-xs text-muted mt-1">Update contact and employment details</p></div><button onClick={onClose} aria-label="Close" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button></div><div className="space-y-4"><label className="block text-sm font-semibold text-ink">Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="input-field mt-1.5" /></label><label className="block text-sm font-semibold text-ink">Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field mt-1.5" /></label><label className="block text-sm font-semibold text-ink">Address<textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="input-field mt-1.5" /></label><label className="block text-sm font-semibold text-ink">Emergency contact phone<input value={emergency} onChange={(e) => setEmergency(e.target.value)} className="input-field mt-1.5" /></label></div><div className="flex justify-end gap-3 mt-6 pt-4 border-t border-hairline-soft"><button onClick={onClose} className="btn-secondary text-sm">Cancel</button><button onClick={() => onSave({ email, phone, address_domisili: address, emergency_contact_phone: emergency })} disabled={saving} className="btn-cta text-sm disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button></div></div></div>;
}
