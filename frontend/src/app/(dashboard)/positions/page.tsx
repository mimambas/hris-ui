'use client';

import { useEffect, useState } from 'react';
import { Briefcase, Plus, Search, Trash2, RefreshCw, X, Pencil } from 'lucide-react';
import api from '@/lib/api';
import ModuleHeader from '@/components/ui/ModuleHeader';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

type Position = { id: string; title: string; code: string; level: number | null; grade: string | null; department_id: string; department: string | null; min_salary: number | null; max_salary: number | null };
type Department = { id: string; name: string };
type FormState = { title: string; code: string; department_id: string; level: string; grade: string; min_salary: string; max_salary: string };
const emptyForm: FormState = { title: '', code: '', department_id: '', level: '', grade: '', min_salary: '', max_salary: '' };
function formatRp(value: number | null) { return value == null ? '—' : `Rp ${Number(value).toLocaleString('id-ID')}`; }

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Position | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [positionResponse, departmentResponse] = await Promise.all([
        api.get('/positions', { params: { search } }),
        api.get('/departments'),
      ]);
      setPositions(positionResponse.data.items ?? []);
      setDepartments(departmentResponse.data.items ?? []);
    } catch (e: any) { setError(e.response?.data?.detail || 'Unable to load positions.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (position: Position) => { setEditing(position); setForm({ title: position.title, code: position.code, department_id: position.department_id, level: position.level == null ? '' : String(position.level), grade: position.grade ?? '', min_salary: position.min_salary == null ? '' : String(position.min_salary), max_salary: position.max_salary == null ? '' : String(position.max_salary) }); setShowForm(true); };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, level: form.level === '' ? null : Number(form.level), min_salary: form.min_salary === '' ? null : Number(form.min_salary), max_salary: form.max_salary === '' ? null : Number(form.max_salary) };
      if (editing) await api.put(`/positions/${editing.id}`, payload);
      else await api.post('/positions', payload);
      setShowForm(false); await load();
      toast(editing ? 'Position updated.' : 'Position created.', 'success');
    } catch (e: any) { toast(e.response?.data?.detail || 'Unable to save position.', 'error'); }
    finally { setSaving(false); }
  };

  const remove = async (position: Position) => {
    try { await api.delete(`/positions/${position.id}`); setDeleteTarget(null); await load(); toast('Position deleted.', 'success'); }
    catch (e: any) { toast(e.response?.data?.detail || 'Unable to delete position.', 'error'); }
  };

  return <div>
    <ModuleHeader eyebrow="People" title="Positions" description="Manage job titles, grades, and salary ranges" action={<button onClick={openCreate} className="btn-cta gap-2"><Plus size={15} /> Add position</button>} />
    {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center justify-between"><p className="text-sm text-semantic-down">{error}</p><button onClick={() => void load()} className="btn-secondary text-xs">Retry</button></div>}
    <div className="mb-6 card p-4"><div className="relative max-w-sm"><Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" /><input type="search" aria-label="Search positions" placeholder="Search title or code…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full min-h-11 rounded-pill bg-surface-strong pl-9 pr-4 py-2.5 text-sm text-ink" /></div></div>
    <div className="card p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[800px]"><thead><tr className="border-b border-hairline"><th className="table-header">Position</th><th className="table-header">Code</th><th className="table-header">Department</th><th className="table-header">Level</th><th className="table-header">Salary range</th><th className="table-header text-right">Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="table-cell text-center text-muted">Loading positions…</td></tr> : positions.length === 0 ? <tr><td colSpan={6}><EmptyState title="No positions found" description="Create a position to get started." /></td></tr> : positions.map((position) => <tr key={position.id} className="table-row"><td className="table-cell"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-primary-surface flex items-center justify-center"><Briefcase size={14} className="text-primary" /></div><span className="font-semibold text-ink">{position.title}</span></div></td><td className="table-cell"><span className="badge bg-surface-strong text-muted font-mono">{position.code}</span></td><td className="table-cell text-body">{position.department ?? '—'}</td><td className="table-cell text-body">{position.level ?? '—'}{position.grade ? ` · ${position.grade}` : ''}</td><td className="table-cell font-mono text-xs text-muted">{formatRp(position.min_salary)} – {formatRp(position.max_salary)}</td><td className="table-cell text-right"><div className="flex items-center justify-end gap-1"><button onClick={() => openEdit(position)} className="min-h-10 min-w-10 rounded-md hover:bg-primary-surface" aria-label={`Edit ${position.title}`}><Pencil size={14} className="mx-auto text-muted" /></button><button onClick={() => setDeleteTarget(position)} className="min-h-10 min-w-10 rounded-md hover:bg-red-50" aria-label={`Delete ${position.title}`}><Trash2 size={14} className="mx-auto text-muted-soft hover:text-semantic-down" /></button></div></td></tr>)}</tbody></table></div><div className="px-5 py-4 border-t border-hairline-soft flex items-center justify-between text-xs text-muted"><span>Showing {positions.length} positions</span><button onClick={() => void load()} className="btn-secondary gap-2 text-xs"><RefreshCw size={13} /> Refresh</button></div></div>

    {showForm && <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true"><div className="absolute inset-0 bg-ink/40" onClick={() => setShowForm(false)} /><form onSubmit={submit} className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6"><div className="flex items-center justify-between mb-5"><div><h2 className="text-base font-bold text-ink">{editing ? 'Edit position' : 'Add position'}</h2><p className="text-xs text-muted mt-1">Title, code, and department are required</p></div><button type="button" onClick={() => setShowForm(false)} aria-label="Close" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button></div><div className="space-y-4"><label className="block text-sm font-semibold text-ink">Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field mt-1.5" /></label><label className="block text-sm font-semibold text-ink">Code<input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-field mt-1.5 font-mono uppercase" placeholder="ENG-BE" /></label><label className="block text-sm font-semibold text-ink">Department<select required value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} className="input-field mt-1.5"><option value="">Select department…</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label><div className="grid grid-cols-2 gap-3"><label className="block text-sm font-semibold text-ink">Level<input type="number" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="input-field mt-1.5" /></label><label className="block text-sm font-semibold text-ink">Grade<input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="input-field mt-1.5" /></label></div><div className="grid grid-cols-2 gap-3"><label className="block text-sm font-semibold text-ink">Min salary<input type="number" value={form.min_salary} onChange={(e) => setForm({ ...form, min_salary: e.target.value })} className="input-field mt-1.5" /></label><label className="block text-sm font-semibold text-ink">Max salary<input type="number" value={form.max_salary} onChange={(e) => setForm({ ...form, max_salary: e.target.value })} className="input-field mt-1.5" /></label></div></div><div className="flex justify-end gap-3 mt-6 pt-4 border-t border-hairline-soft"><button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button><button type="submit" disabled={saving} className="btn-cta text-sm disabled:opacity-50">{saving ? 'Saving…' : 'Save position'}</button></div></form></div>}

    {deleteTarget && <ConfirmDialog open title="Delete position" description={`Delete ${deleteTarget.title}? Positions assigned to active employees cannot be deleted.`} confirmLabel="Delete" variant="danger" onConfirm={() => void remove(deleteTarget)} onCancel={() => setDeleteTarget(null)} />}
  </div>;
}
