'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import {
  Building2, Plus, Users, ChevronRight, MoreHorizontal, Search, Layers3,
  X, Mail, MapPin, Edit3, Trash2, Eye, DollarSign, Calendar, Briefcase,
} from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

type Member = {
  name: string; initials: string; position: string; email: string; joined: string; color: string;
};

type SubTeam = {
  id: string; name: string; code: string; head: string; employees: number; color: string;
};

type Department = {
  id: string;
  name: string;
  code: string;
  head: string;
  headEmail: string;
  parent: string;
  employees: number;
  color: string;
  icon: typeof Building2;
  description: string;
  budget: number;
  createdAt: string;
  location: string;
  members: Member[];
  subTeams: SubTeam[];
  openRoles: number;
};

const allDepartments: Department[] = [
  {
    id: '1', name: 'Human Resources', code: 'HR', head: 'Rina Sari', headEmail: 'rina@company.com',
    parent: '—', employees: 24, color: 'bg-primary-surface text-primary', icon: Building2,
    description: 'People operations, talent acquisition, employee relations, and organizational development.',
    budget: 240000000, createdAt: '01 Jan 2020', location: 'Jakarta HQ', openRoles: 2,
    members: [
      { name: 'Rina Sari', initials: 'RS', position: 'HR Manager', email: 'rina@company.com', joined: '12 Jan 2023', color: 'bg-primary-surface text-primary' },
      { name: 'Dewi Lestari', initials: 'DL', position: 'Recruiter', email: 'dewi@company.com', joined: '14 Feb 2024', color: 'bg-pink-50 text-pink-600' },
      { name: 'Larasati Hadi', initials: 'LH', position: 'HR Officer', email: 'larasati@company.com', joined: '01 Aug 2024', color: 'bg-amber-50 text-accent-yellow' },
      { name: 'Nadia Putri', initials: 'NP', position: 'HR Admin', email: 'nadia@company.com', joined: '15 Sep 2025', color: 'bg-violet-50 text-violet-600' },
    ],
    subTeams: [
      { id: 's1', name: 'Talent Acquisition', code: 'HR-TA', head: 'Dewi Lestari', employees: 8, color: 'bg-pink-50 text-pink-600' },
      { id: 's2', name: 'People Operations', code: 'HR-PO', head: 'Larasati Hadi', employees: 10, color: 'bg-amber-50 text-accent-yellow' },
    ],
  },
  {
    id: '2', name: 'Engineering', code: 'ENG', head: 'Budi Hartono', headEmail: 'budi@company.com',
    parent: '—', employees: 186, color: 'bg-cta-surface text-cta-hover', icon: Briefcase,
    description: 'Product engineering, infrastructure, platform reliability, and technical architecture.',
    budget: 1860000000, createdAt: '01 Jan 2020', location: 'Jakarta HQ + Remote', openRoles: 8,
    members: [
      { name: 'Budi Hartono', initials: 'BH', position: 'Tech Lead', email: 'budi@company.com', joined: '04 Mar 2022', color: 'bg-cta-surface text-cta-hover' },
      { name: 'Rizky Prasetyo', initials: 'RP', position: 'Backend Developer', email: 'rizky@company.com', joined: '12 Aug 2024', color: 'bg-emerald-50 text-emerald-600' },
      { name: 'Fajar Nugroho', initials: 'FN', position: 'Frontend Developer', email: 'fajar@company.com', joined: '02 Sep 2024', color: 'bg-sky-50 text-sky-600' },
      { name: 'Adi Wijaya', initials: 'AW', position: 'DevOps Engineer', email: 'adi@company.com', joined: '10 Mar 2024', color: 'bg-amber-50 text-accent-yellow' },
      { name: 'Rian Kurniawan', initials: 'RK', position: 'Backend Developer', email: 'rian@company.com', joined: '05 Jan 2025', color: 'bg-primary-surface text-primary' },
    ],
    subTeams: [
      { id: 's3', name: 'Platform Engineering', code: 'ENG-PLT', head: 'Rizky Prasetyo', employees: 72, color: 'bg-emerald-50 text-emerald-600' },
      { id: 's4', name: 'Mobile Engineering', code: 'ENG-MOB', head: 'Fajar Nugroho', employees: 48, color: 'bg-indigo-50 text-indigo-600' },
      { id: 's5', name: 'Infrastructure', code: 'ENG-INF', head: 'Adi Wijaya', employees: 32, color: 'bg-amber-50 text-accent-yellow' },
    ],
  },
  {
    id: '3', name: 'Product & Design', code: 'PD', head: 'Maya Anggraeni', headEmail: 'maya@company.com',
    parent: '—', employees: 48, color: 'bg-violet-50 text-violet-600', icon: Briefcase,
    description: 'Product management, UX research, UI design, and design system governance.',
    budget: 480000000, createdAt: '15 Mar 2021', location: 'Jakarta HQ + Surabaya', openRoles: 3,
    members: [
      { name: 'Maya Anggraeni', initials: 'MA', position: 'UI/UX Designer', email: 'maya@company.com', joined: '05 Jun 2023', color: 'bg-violet-50 text-violet-600' },
      { name: 'Putri Anjani', initials: 'PA', position: 'Product Manager', email: 'putri@company.com', joined: '20 Jan 2024', color: 'bg-pink-50 text-pink-600' },
      { name: 'Firman Hakim', initials: 'FH', position: 'UX Researcher', email: 'firman@company.com', joined: '11 Jul 2024', color: 'bg-primary-surface text-primary' },
    ],
    subTeams: [
      { id: 's6', name: 'UX Research', code: 'PD-UXR', head: 'Firman Hakim', employees: 12, color: 'bg-sky-50 text-sky-600' },
    ],
  },
  {
    id: '4', name: 'Finance', code: 'FIN', head: 'Andi Pratama', headEmail: 'andi@company.com',
    parent: '—', employees: 32, color: 'bg-amber-50 text-accent-yellow', icon: DollarSign,
    description: 'Financial planning & analysis, accounting, tax compliance, and treasury operations.',
    budget: 320000000, createdAt: '01 Jan 2020', location: 'Jakarta HQ', openRoles: 1,
    members: [
      { name: 'Andi Pratama', initials: 'AP', position: 'Finance Officer', email: 'andi@company.com', joined: '22 Feb 2023', color: 'bg-amber-50 text-accent-yellow' },
      { name: 'Wati Susilawati', initials: 'WS', position: 'Accountant', email: 'wati@company.com', joined: '15 Sep 2023', color: 'bg-primary-surface text-primary' },
    ],
    subTeams: [],
  },
  {
    id: '5', name: 'Marketing', code: 'MKT', head: 'Sari Dewi', headEmail: 'sari@company.com',
    parent: '—', employees: 56, color: 'bg-pink-50 text-pink-600', icon: Briefcase,
    description: 'Brand management, growth marketing, content strategy, and performance analytics.',
    budget: 560000000, createdAt: '01 Jun 2021', location: 'Jakarta HQ + Bandung', openRoles: 4,
    members: [
      { name: 'Sari Dewi', initials: 'SD', position: 'Marketing Specialist', email: 'sari@company.com', joined: '17 Jul 2023', color: 'bg-pink-50 text-pink-600' },
      { name: 'Raka Firmansyah', initials: 'RF', position: 'Content Strategist', email: 'raka@company.com', joined: '01 Mar 2024', color: 'bg-cta-surface text-cta-hover' },
      { name: 'Ayu Lestari', initials: 'AL', position: 'Growth Marketer', email: 'ayu@company.com', joined: '22 Aug 2025', color: 'bg-emerald-50 text-emerald-600' },
    ],
    subTeams: [
      { id: 's7', name: 'Content', code: 'MKT-CT', head: 'Raka Firmansyah', employees: 18, color: 'bg-sky-50 text-sky-600' },
      { id: 's8', name: 'Performance', code: 'MKT-PF', head: 'Ayu Lestari', employees: 14, color: 'bg-emerald-50 text-emerald-600' },
    ],
  },
  {
    id: '6', name: 'Customer Success', code: 'CS', head: 'Yuni Kartika', headEmail: 'yuni@company.com',
    parent: '—', employees: 94, color: 'bg-sky-50 text-sky-600', icon: Users,
    description: 'Customer onboarding, support operations, account management, and customer health.',
    budget: 940000000, createdAt: '01 Jan 2021', location: 'Jakarta HQ', openRoles: 6,
    members: [
      { name: 'Yuni Kartika', initials: 'YK', position: 'CS Manager', email: 'yuni@company.com', joined: '19 Nov 2022', color: 'bg-sky-50 text-sky-600' },
      { name: 'Hendra Wijaya', initials: 'HW', position: 'Senior Support', email: 'hendra@company.com', joined: '01 Apr 2023', color: 'bg-primary-surface text-primary' },
      { name: 'Indah Permata', initials: 'IP', position: 'Account Manager', email: 'indah@company.com', joined: '15 Oct 2024', color: 'bg-amber-50 text-accent-yellow' },
    ],
    subTeams: [
      { id: 's9', name: 'Technical Support', code: 'CS-TS', head: 'Hendra Wijaya', employees: 42, color: 'bg-primary-surface text-primary' },
      { id: 's10', name: 'Account Management', code: 'CS-AM', head: 'Indah Permata', employees: 28, color: 'bg-amber-50 text-accent-yellow' },
    ],
  },
];

function formatRp(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)}M`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function DetailModal({ dept, onClose, onEdit }: { dept: Department; onClose: () => void; onEdit: (d: Department) => void }) {
  const [tab, setTab] = useState<'members' | 'subteams'>('members');
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="dept-detail-title">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-canvas border border-hairline shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-canvas border-b border-hairline-soft px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${dept.color}`}>
              <dept.icon size={18} />
            </div>
            <div>
              <h2 id="dept-detail-title" className="text-base font-bold text-ink">{dept.name}</h2>
              <p className="text-xs text-muted">{dept.code} · {dept.location}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close department detail" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-body leading-relaxed mb-5">{dept.description}</p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl bg-surface-soft p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Head</p>
              <p className="text-sm font-bold text-ink mt-1">{dept.head}</p>
              <p className="text-[11px] text-muted mt-0.5">{dept.headEmail}</p>
            </div>
            <div className="rounded-xl bg-surface-soft p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Budget</p>
              <p className="text-sm font-bold text-ink mt-1">{formatRp(dept.budget)}</p>
              <p className="text-[11px] text-muted mt-0.5">Annual</p>
            </div>
            <div className="rounded-xl bg-surface-soft p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Team size</p>
              <p className="text-sm font-bold text-ink mt-1">{dept.employees} employees</p>
              <p className="text-[11px] text-muted mt-0.5">{dept.subTeams.length} sub-teams</p>
            </div>
            <div className="rounded-xl bg-surface-soft p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Open roles</p>
              <p className="text-sm font-bold text-ink mt-1">{dept.openRoles}</p>
              <p className="text-[11px] text-cta mt-0.5">Actively hiring</p>
            </div>
          </div>

          <div className="flex gap-1 mb-4 bg-surface-soft rounded-pill p-1">
            <button onClick={() => setTab('members')} className={`flex-1 min-h-9 rounded-pill text-xs font-semibold transition-colors ${tab === 'members' ? 'bg-white text-ink shadow-sm' : 'text-muted'}`}>
              Members ({dept.members.length})
            </button>
            <button onClick={() => setTab('subteams')} className={`flex-1 min-h-9 rounded-pill text-xs font-semibold transition-colors ${tab === 'subteams' ? 'bg-white text-ink shadow-sm' : 'text-muted'}`}>
              Sub-teams ({dept.subTeams.length})
            </button>
          </div>

          {tab === 'members' && (
            <div className="space-y-2">
              {dept.members.map((m) => (
                <div key={m.email} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-soft transition-colors">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${m.color}`}>
                    <span className="text-[11px] font-bold">{m.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{m.name}</p>
                    <p className="text-[11px] text-muted">{m.position}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`mailto:${m.email}`} className="min-h-9 min-w-9 rounded-lg hover:bg-primary-surface flex items-center justify-center" aria-label={`Email ${m.name}`}><Mail size={14} className="text-muted" /></a>
                  </div>
                </div>
              ))}
              {dept.members.length === 0 && <p className="text-xs text-muted text-center py-6">No members listed.</p>}
            </div>
          )}

          {tab === 'subteams' && (
            <div className="space-y-2">
              {dept.subTeams.map((st) => (
                <div key={st.id} className="flex items-center gap-3 p-3 rounded-xl border border-hairline">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${st.color}`}>
                    <Layers3 size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{st.name}</p>
                    <p className="text-[11px] text-muted">{st.head} · {st.employees} people</p>
                  </div>
                  <span className="badge bg-surface-strong text-muted font-mono text-[10px]">{st.code}</span>
                </div>
              ))}
              {dept.subTeams.length === 0 && <p className="text-xs text-muted text-center py-6">No sub-teams in this department.</p>}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-hairline-soft flex gap-3">
          <button onClick={() => { onEdit(dept); onClose(); }} className="btn-secondary flex-1 justify-center gap-2 text-sm"><Edit3 size={14} /> Edit</button>
          <a href={`mailto:${dept.headEmail}`} className="btn-cta flex-1 justify-center gap-2 text-sm"><Mail size={14} /> Contact Head</a>
        </div>
      </div>
    </div>
  );
}

function DepartmentFormModal({ initial, onClose, onSaved }: { initial: Department | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const { toast } = useToast();
  const [name, setName] = useState(initial?.name ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [head, setHead] = useState(initial?.head ?? '');
  const [headEmail, setHeadEmail] = useState(initial?.headEmail ?? '');
  const [parent, setParent] = useState(initial?.parent ?? '—');
  const [location, setLocation] = useState(initial?.location ?? 'Jakarta HQ');
  const [budget, setBudget] = useState(initial ? String(initial.budget) : '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Department name is required.';
    if (!code.trim()) e.code = 'Code is required.';
    if (!head.trim()) e.head = 'Department head is required.';
    if (headEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(headEmail)) e.headEmail = 'Enter a valid email.';
    if (budget && (isNaN(Number(budget)) || Number(budget) < 0)) e.budget = 'Enter a valid budget amount.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { name: name.trim(), code: code.trim(), cost_center: location || null };
      if (initial) await api.put(`/departments/${initial.id}`, payload);
      else await api.post('/departments', payload);
      await onSaved();
      toast(initial ? `${name} updated successfully.` : `${name} department created.`, 'success');
      onClose();
    } catch (error: any) {
      toast(error.response?.data?.detail || 'Could not save department.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="dept-form-title">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg rounded-2xl bg-canvas border border-hairline shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-canvas border-b border-hairline-soft px-6 py-4 flex items-center justify-between z-10">
          <h2 id="dept-form-title" className="text-base font-bold text-ink">{initial ? 'Edit Department' : 'Add Department'}</h2>
          <button type="button" onClick={onClose} aria-label="Close form" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-ink">Department name <span className="text-semantic-down">*</span></span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field mt-1.5" placeholder="e.g. Engineering" />
            {errors.name && <p role="alert" className="text-xs text-semantic-down mt-1">{errors.name}</p>}
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-ink">Code <span className="text-semantic-down">*</span></span>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="input-field mt-1.5 font-mono" placeholder="ENG" maxLength={10} />
              {errors.code && <p role="alert" className="text-xs text-semantic-down mt-1">{errors.code}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-ink">Location</span>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="input-field mt-1.5">
                <option>Jakarta HQ</option><option>Bandung</option><option>Surabaya</option><option>Remote</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-ink">Department head <span className="text-semantic-down">*</span></span>
              <input value={head} onChange={(e) => setHead(e.target.value)} className="input-field mt-1.5" placeholder="Full name" />
              {errors.head && <p role="alert" className="text-xs text-semantic-down mt-1">{errors.head}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-ink">Head email</span>
              <input value={headEmail} onChange={(e) => setHeadEmail(e.target.value)} className="input-field mt-1.5" placeholder="name@company.com" type="email" />
              {errors.headEmail && <p role="alert" className="text-xs text-semantic-down mt-1">{errors.headEmail}</p>}
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-ink">Parent department</span>
            <select value={parent} onChange={(e) => setParent(e.target.value)} className="input-field mt-1.5">
              <option value="—">None (top-level)</option>
              {allDepartments.filter((d) => d.parent === '—').map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink">Annual budget (IDR)</span>
            <input value={budget} onChange={(e) => setBudget(e.target.value)} className="input-field mt-1.5" placeholder="e.g. 240000000" type="number" min="0" />
            {errors.budget && <p role="alert" className="text-xs text-semantic-down mt-1">{errors.budget}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink">Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field mt-1.5 min-h-[80px] resize-y" placeholder="Brief description of the department's scope..." />
          </label>
        </div>

        <div className="px-6 py-4 border-t border-hairline-soft flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="btn-cta flex-1 justify-center text-sm gap-2 disabled:opacity-50">
            {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {initial ? 'Save Changes' : 'Create Department'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DepartmentsPage() {
  const [search, setSearch] = useState('');
  const [showSub, setShowSub] = useState(false);
  const [selected, setSelected] = useState<Department | null>(null);
  const [formDept, setFormDept] = useState<Department | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState<Department | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const loadDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<{ items: any[] }>('/departments', { params: { search: search || undefined } });
      setDepartments(response.data.items.map((item, index) => ({
        ...item,
        headEmail: item.head_email,
        employees: item.employee_count ?? 0,
        parent: item.parent ?? '—',
        head: item.head ?? 'Unassigned',
        budget: 0,
        location: item.cost_center ?? '—',
        createdAt: item.created_at,
        description: '',
        openRoles: 0,
        members: [],
        subTeams: [],
        color: ['bg-primary-surface text-primary', 'bg-cta-surface text-cta-hover', 'bg-amber-50 text-accent-yellow'][index % 3],
        icon: Building2,
      })));
    } catch (requestError: any) {
      setError(requestError.response?.data?.detail || 'Could not load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadDepartments(); }, [search]);

  const filtered = departments.filter((d) => showSub || d.parent === '—');

  const totalEmployees = filtered.reduce((s, d) => s + d.employees, 0);
  const totalSubTeams = filtered.reduce((s, d) => s + d.subTeams.length, 0);
  const totalOpenRoles = filtered.reduce((s, d) => s + d.openRoles, 0);

  const handleDelete = async (dept: Department) => {
    try {
      await api.delete(`/departments/${dept.id}`);
      await loadDepartments();
      setShowDelete(null);
      toast(`${dept.name} has been removed.`, 'success');
    } catch (requestError: any) {
      toast(requestError.response?.data?.detail || 'Could not delete department.', 'error');
    }
  };

  return (
    <div>
      <ModuleHeader
        eyebrow="Organization"
        title="Departments"
        description="Design your organization structure and team ownership"
        action={
          <div className="flex gap-2">
            <button onClick={() => setShowSub(!showSub)} className="btn-secondary gap-2">
              <Layers3 size={15} /> {showSub ? 'Top level only' : 'Show sub-teams'}
            </button>
            <button onClick={() => { setFormDept(null); setShowForm(true); }} className="btn-cta gap-2">
              <Plus size={15} /> Add Department
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <StatCard icon={Building2} label="Departments" value={String(filtered.length)} tone="primary" detail={`${filtered.filter((d) => d.parent === '—').length} top-level`} />
        <StatCard icon={Users} label="Total employees" value={String(totalEmployees)} tone="green" detail="Across all teams" />
        <StatCard icon={Layers3} label="Sub-teams" value={String(totalSubTeams)} tone="amber" detail={`${totalOpenRoles} open roles`} />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline-soft flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" />
            <input type="search" aria-label="Search departments" placeholder="Search departments or team leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full min-h-10 rounded-pill bg-surface-strong pl-9 pr-3 py-2 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <p className="text-xs text-muted">{filtered.length} departments shown</p>
        </div>

        {error && <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center justify-between"><p className="text-sm text-semantic-down">{error}</p><button onClick={() => void loadDepartments()} className="btn-secondary text-xs">Retry</button></div>}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-hairline">
                <th className="table-header">Department</th>
                <th className="table-header">Code</th>
                <th className="table-header">Department head</th>
                <th className="table-header">Employees</th>
                <th className="table-header">Open roles</th>
                <th className="table-header">Budget</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="table-cell text-center text-muted">Loading departments...</td></tr> : filtered.length === 0 ? (
                <tr><td colSpan={7}><EmptyState title="No departments found" description="Try another search or show sub-teams." /></td></tr>
              ) : filtered.map((dept) => (
                <tr key={dept.id} className="table-row cursor-pointer" onClick={() => setSelected(dept)}>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${dept.color}`}>
                        <dept.icon size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-ink">{dept.name}</p>
                        {dept.subTeams.length > 0 && <p className="text-[11px] text-muted mt-0.5">{dept.subTeams.length} sub-teams</p>}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell"><span className="badge bg-surface-strong text-muted font-mono">{dept.code}</span></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-surface flex items-center justify-center shrink-0"><span className="text-[9px] font-bold text-primary">{dept.head.split(' ').map((n) => n[0]).join('')}</span></div>
                      <span className="text-body text-sm">{dept.head}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                      <Users size={14} className="text-muted" />{dept.employees}
                    </span>
                  </td>
                  <td className="table-cell">
                    {dept.openRoles > 0 ? <span className="badge bg-cta-surface text-cta-hover">{dept.openRoles}</span> : <span className="text-xs text-muted">—</span>}
                  </td>
                  <td className="table-cell font-mono text-xs text-muted">{formatRp(dept.budget)}</td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setSelected(dept)} className="min-h-10 min-w-10 rounded-md hover:bg-primary-surface" aria-label={`View ${dept.name}`} title="View details">
                        <Eye size={15} className="mx-auto text-muted" />
                      </button>
                      <button onClick={() => { setFormDept(dept); setShowForm(true); }} className="min-h-10 min-w-10 rounded-md hover:bg-primary-surface" aria-label={`Edit ${dept.name}`} title="Edit">
                        <Edit3 size={15} className="mx-auto text-muted" />
                      </button>
                      <button onClick={() => setShowDelete(dept)} className="min-h-10 min-w-10 rounded-md hover:bg-red-50" aria-label={`Delete ${dept.name}`} title="Delete">
                        <Trash2 size={15} className="mx-auto text-muted-soft hover:text-semantic-down" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-hairline-soft flex items-center justify-between">
          <p className="text-xs text-muted">Showing {filtered.length} of {departments.length} departments</p>
          <p className="text-xs text-muted">{totalEmployees} total employees · {formatRp(filtered.reduce((s, d) => s + d.budget, 0))} combined budget</p>
        </div>
      </div>

      {selected && <DetailModal dept={selected} onClose={() => setSelected(null)} onEdit={(d) => { setFormDept(d); setShowForm(true); }} />}
      {showForm && <DepartmentFormModal initial={formDept} onClose={() => { setShowForm(false); setFormDept(null); }} onSaved={loadDepartments} />}
      {showDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowDelete(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><Trash2 size={16} className="text-semantic-down" /></div>
              <h3 className="text-base font-bold text-ink">Delete department</h3>
            </div>
            <p className="text-sm text-body mb-2">
              Are you sure you want to delete <span className="font-semibold text-ink">{showDelete.name}</span>? This will remove the department and reassign {showDelete.employees} employees.
            </p>
            <p className="text-xs text-muted mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDelete(null)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={() => handleDelete(showDelete)} className="min-h-10 px-4 rounded-pill bg-semantic-down text-white text-sm font-semibold hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
