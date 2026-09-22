'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { UserPlus, CheckCircle2, Clock, AlertTriangle, Plus, ArrowRight, Search, X, Check, UserRound, ChevronRight } from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

type Task = { id: string; label: string; owner: string; due: string; done: boolean; overdue?: boolean };
type Person = { id: string; name: string; role: string; department: string; start: string; start_date?: string; status: 'On track' | 'Completed' | 'At risk'; initials: string; buddy: string; tasks: Task[] };

const taskTemplates: { id: string; label: string; owner: string }[] = [
  { id: 'welcome', label: 'Send welcome email', owner: 'HR' },
  { id: 'documents', label: 'Collect employment documents', owner: 'HR' },
  { id: 'account', label: 'Create email & system accounts', owner: 'IT' },
  { id: 'equipment', label: 'Prepare laptop and equipment', owner: 'IT' },
  { id: 'policies', label: 'Review company policies', owner: 'HR' },
  { id: 'intro', label: 'Schedule company introduction', owner: 'HR' },
  { id: 'manager', label: 'Manager 1:1 meeting', owner: 'Manager' },
  { id: 'team', label: 'Team introduction', owner: 'Manager' },
  { id: 'buddy', label: 'Assign onboarding buddy', owner: 'HR' },
  { id: 'goals', label: 'Set first 30-day goals', owner: 'Manager' },
  { id: 'training', label: 'Complete security training', owner: 'IT' },
  { id: 'feedback', label: '30-day check-in', owner: 'Manager' },
];

function createTasks(doneCount: number): Task[] {
  return taskTemplates.map(({ id, label, owner }, index) => ({ id, label, owner, due: `Sep ${18 + index}`, done: index < doneCount, overdue: index === doneCount && doneCount < 5 }));
}

const initialPeople: Person[] = [
  { id: 'ONB-001', name: 'Dimas Saputra', role: 'Senior Backend Developer', department: 'Engineering', start: '18 Sep 2026', status: 'On track', initials: 'DS', buddy: 'Rizky Prasetyo', tasks: createTasks(11) },
  { id: 'ONB-002', name: 'Nadia Putri', role: 'Product Designer', department: 'Design', start: '15 Sep 2026', status: 'On track', initials: 'NP', buddy: 'Maya Anggraeni', tasks: createTasks(8) },
  { id: 'ONB-003', name: 'Kevin Wijaya', role: 'Finance Analyst', department: 'Finance', start: '01 Sep 2026', status: 'Completed', initials: 'KW', buddy: 'Andi Pratama', tasks: createTasks(12) },
  { id: 'ONB-004', name: 'Larasati Hadi', role: 'HR Officer', department: 'HR', start: '25 Sep 2026', status: 'At risk', initials: 'LH', buddy: 'Rina Sari', tasks: createTasks(3) },
  { id: 'ONB-005', name: 'Bagas Ramadhan', role: 'Customer Success Associate', department: 'Customer Success', start: '28 Sep 2026', status: 'On track', initials: 'BR', buddy: 'Yuni Kartika', tasks: createTasks(5) },
];

const statusMeta = {
  'On track': { text: 'text-primary', bar: 'bg-primary', badge: 'bg-primary-surface text-primary' },
  Completed: { text: 'text-cta', bar: 'bg-cta', badge: 'bg-cta-surface text-cta-hover' },
  'At risk': { text: 'text-semantic-down', bar: 'bg-semantic-down', badge: 'bg-red-50 text-semantic-down' },
};

function NewOnboardingModal({ onClose, onCreate }: { onClose: () => void; onCreate: (person: Person) => void }) {
  const [error, setError] = useState('');
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim();
    const role = String(data.get('role') || '').trim();
    const start = String(data.get('start') || '').trim();
    if (!name || !role || !start) { setError('Name, role, and start date are required.'); return; }
    onCreate({ id: `ONB-${String(Date.now()).slice(-3)}`, name, role, department: String(data.get('department') || 'Engineering'), start: new Date(`${start}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), start_date: start, status: 'On track', initials: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), buddy: 'Not assigned', tasks: createTasks(0) });
  };
  return <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><div className="absolute inset-0 bg-ink/40" onClick={onClose} /><form onSubmit={submit} className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6"><div className="flex items-center justify-between mb-5"><div><h2 className="text-base font-bold text-ink">Start onboarding</h2><p className="text-xs text-muted mt-1">Create a checklist for a new hire</p></div><button type="button" onClick={onClose} aria-label="Close onboarding form" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button></div><div className="space-y-4"><label className="block text-sm font-semibold text-ink">Employee name<input name="name" autoFocus className="input-field mt-1.5" placeholder="e.g. Putri Ananda" /></label><label className="block text-sm font-semibold text-ink">Role<input name="role" className="input-field mt-1.5" placeholder="e.g. Product Manager" /></label><label className="block text-sm font-semibold text-ink">Department<select name="department" defaultValue="Engineering" className="input-field mt-1.5"><option>Engineering</option><option>Design</option><option>Finance</option><option>HR</option><option>Marketing</option><option>Customer Success</option></select></label><label className="block text-sm font-semibold text-ink">Start date<input name="start" type="date" className="input-field mt-1.5" /></label>{error && <p role="alert" className="text-xs text-semantic-down">{error}</p>}</div><div className="flex justify-end gap-3 mt-6 pt-4 border-t border-hairline-soft"><button type="button" onClick={onClose} className="btn-secondary text-sm">Cancel</button><button type="submit" className="btn-cta text-sm gap-2"><UserPlus size={14} /> Create onboarding</button></div></form></div>;
}

function ChecklistModal({ person, onClose, onToggle }: { person: Person; onClose: () => void; onToggle: (id: string, taskId: string) => void }) {
  const completed = person.tasks.filter((task) => task.done).length;
  return <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><div className="absolute inset-0 bg-ink/40" onClick={onClose} /><div className="relative w-full max-w-xl rounded-2xl bg-canvas border border-hairline shadow-2xl max-h-[90vh] overflow-y-auto"><div className="sticky top-0 bg-canvas border-b border-hairline-soft px-6 py-5 z-10"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full bg-primary-surface flex items-center justify-center"><span className="text-xs font-bold text-primary">{person.initials}</span></div><div><h2 className="text-base font-bold text-ink">{person.name}</h2><p className="text-xs text-muted mt-0.5">{person.role} · Starts {person.start}</p></div></div><button onClick={onClose} aria-label="Close checklist" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button></div><div className="mt-4 flex items-center gap-3"><div className="h-2 flex-1 rounded-full bg-surface-strong overflow-hidden"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(completed / person.tasks.length) * 100}%` }} /></div><span className="font-mono text-xs text-muted">{completed}/{person.tasks.length}</span></div></div><div className="px-6 py-4 space-y-2">{person.tasks.map((task) => <button key={task.id} onClick={() => onToggle(person.id, task.id)} className="w-full flex items-center gap-3 text-left rounded-lg p-3 hover:bg-surface-soft transition-colors"><span className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${task.done ? 'bg-cta border-cta text-white' : task.overdue ? 'border-semantic-down text-semantic-down' : 'border-hairline text-transparent'}`}><Check size={14} /></span><span className="flex-1 min-w-0"><span className={`block text-sm font-semibold ${task.done ? 'text-muted line-through' : 'text-ink'}`}>{task.label}</span><span className="flex items-center gap-2 text-[11px] text-muted mt-0.5"><span>{task.owner}</span><span>·</span><span className={task.overdue && !task.done ? 'text-semantic-down font-semibold' : ''}>Due {task.due}</span></span></span>{task.done && <CheckCircle2 size={15} className="text-cta shrink-0" />}</button>)}</div><div className="px-6 pb-5 flex items-center gap-2 text-xs text-muted"><UserRound size={14} /> Buddy: <span className="font-semibold text-body">{person.buddy}</span></div></div></div>;
}

export default function OnboardingPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Person['status']>('all');
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<Person | null>(null);
  const [confirmComplete, setConfirmComplete] = useState<Person | null>(null);
  const { toast } = useToast();
  const loadPeople = async () => { setLoading(true); try { const response = await api.get('/onboarding'); setPeople(response.data.items ?? []); } catch { toast('Unable to load onboarding records.', 'error'); } finally { setLoading(false); } };
  useEffect(() => { void loadPeople(); }, []);

  const filtered = useMemo(() => people.filter((person) => `${person.name} ${person.role} ${person.department}`.toLowerCase().includes(search.toLowerCase())).filter((person) => statusFilter === 'all' || person.status === statusFilter), [people, search, statusFilter]);
  const active = people.filter((person) => person.status !== 'Completed').length;
  const atRisk = people.filter((person) => person.status === 'At risk').length;
  const avgProgress = Math.round(people.reduce((sum, person) => sum + person.tasks.filter((task) => task.done).length / person.tasks.length * 100, 0) / people.length);

  const addPerson = async (person: Person) => { try { const response = await api.post('/onboarding', { name: person.name, role: person.role, department: person.department, start_date: person.start_date ?? person.start.split(' ').reverse().join('-') }); setPeople((rows) => [response.data, ...rows]); setShowNew(false); toast(`Onboarding created for ${person.name}.`, 'success'); } catch { toast('Unable to create onboarding.', 'error'); } };
  const toggleTask = async (personId: string, taskId: string) => {
    try { const response = await api.patch(`/onboarding/${personId}/tasks/${taskId}`); setPeople((rows) => rows.map((person) => { if (person.id !== personId) return person; const tasks = person.tasks.map((task) => task.id === taskId ? { ...task, done: response.data.done } : task); return { ...person, tasks, status: response.data.status ?? person.status }; })); setSelected((current) => current?.id === personId ? { ...current, tasks: current.tasks.map((task) => task.id === taskId ? { ...task, done: response.data.done } : task), status: response.data.status ?? current.status } : current); } catch { toast('Unable to update checklist task.', 'error'); }
  };
  const completeOnboarding = async () => { if (!confirmComplete) return; try { await api.post(`/onboarding/${confirmComplete.id}/complete`); await loadPeople(); setConfirmComplete(null); toast(`${confirmComplete.name}'s onboarding marked complete.`, 'success'); } catch { toast('Unable to complete onboarding.', 'error'); } };

  return <div>
    <ModuleHeader eyebrow="People operations" title="Onboarding" description="Help new hires get productive from day one" action={<button onClick={() => setShowNew(true)} className="btn-cta gap-2"><Plus size={15} /> Start Onboarding</button>} />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6"><StatCard icon={UserPlus} label="Active onboarding" value={String(active)} tone="primary" detail="Across 5 departments" /><StatCard icon={CheckCircle2} label="Completed this month" value="14" tone="green" detail="100% completion rate" /><StatCard icon={Clock} label="Avg. completion" value={`${Math.max(1, Math.round((100 - avgProgress) / 8) + 7)}d`} tone="amber" detail={`${avgProgress}% average progress`} /><StatCard icon={AlertTriangle} label="Need attention" value={String(atRisk)} tone="red" detail="Overdue tasks" /></div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6"><div className="card lg:col-span-2"><div className="flex items-center justify-between mb-5"><div><h2 className="text-sm font-bold text-ink">Onboarding progress</h2><p className="text-xs text-muted mt-1">Active new hires</p></div><a href="/onboarding/checklist" className="text-xs font-semibold text-primary flex items-center gap-1">Manage checklist <ArrowRight size={13} /></a></div><div className="space-y-5">{filtered.length === 0 ? <EmptyState title="No onboarding records found" description="Try another name or status filter." /> : filtered.slice(0, 5).map((person) => { const progress = Math.round(person.tasks.filter((task) => task.done).length / person.tasks.length * 100); const meta = statusMeta[person.status]; return <div key={person.id}><button onClick={() => setSelected(person)} className="w-full text-left flex items-center gap-3 mb-2 rounded-lg hover:bg-surface-soft p-1.5 -m-1.5 transition-colors"><div className="w-8 h-8 rounded-full bg-primary-surface flex items-center justify-center shrink-0"><span className="text-[10px] font-bold text-primary">{person.initials}</span></div><div className="flex-1 min-w-0"><p className="text-xs font-bold text-ink truncate">{person.name}</p><p className="text-[11px] text-muted truncate">{person.role} · Starts {person.start}</p></div><span className={`text-[11px] font-semibold ${meta.text}`}>{person.status}</span><ChevronRight size={14} className="text-muted-soft" /></button><div className="flex items-center gap-3"><div className="h-2 flex-1 rounded-full bg-surface-strong overflow-hidden"><div className={`h-full rounded-full ${meta.bar} transition-all`} style={{ width: `${progress}%` }} /></div><span className="font-mono text-[11px] text-muted w-16 text-right">{person.tasks.filter((task) => task.done).length}/{person.tasks.length}</span></div></div>; })}</div></div><div className="card"><h2 className="text-sm font-bold text-ink mb-4">Checklist health</h2><div className="space-y-4">{[{ label: 'Company intro', value: '100%', color: 'bg-cta' }, { label: 'IT setup', value: '84%', color: 'bg-primary' }, { label: 'Policy review', value: '72%', color: 'bg-primary-light' }, { label: 'Team integration', value: '58%', color: 'bg-accent-yellow' }].map((item) => <div key={item.label}><div className="flex justify-between text-xs mb-1.5"><span className="font-semibold text-body">{item.label}</span><span className="font-mono text-muted">{item.value}</span></div><div className="h-2 rounded-full bg-surface-strong overflow-hidden"><div className={`h-full rounded-full ${item.color}`} style={{ width: item.value }} /></div></div>)}</div><div className="mt-6 p-3 rounded-lg bg-primary-surface"><p className="text-xs font-semibold text-primary">Tip</p><p className="text-xs text-body mt-1">Assign a buddy to new hires to improve time-to-productivity.</p></div></div></div>

    <div className="card p-0 overflow-hidden"><div className="px-5 py-4 border-b border-hairline-soft flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-bold text-ink">Onboarding directory</h2><p className="text-xs text-muted mt-1">Track every new hire and checklist</p></div><div className="flex flex-wrap gap-2"><div className="relative"><Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" /><input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search onboarding" placeholder="Search…" className="w-44 min-h-10 rounded-pill bg-surface-strong pl-9 pr-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>{(['all', 'On track', 'At risk', 'Completed'] as const).map((filter) => <button key={filter} onClick={() => setStatusFilter(filter)} className={`min-h-10 px-3 rounded-pill text-[11px] font-semibold ${statusFilter === filter ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>{filter === 'all' ? 'All' : filter}</button>)}</div></div><div className="overflow-x-auto"><table className="w-full min-w-[780px]"><thead><tr className="border-b border-hairline"><th className="table-header">Employee</th><th className="table-header">Role</th><th className="table-header">Start date</th><th className="table-header">Progress</th><th className="table-header">Status</th><th className="table-header text-right">Action</th></tr></thead><tbody>{filtered.length === 0 ? <tr><td colSpan={6}><EmptyState title="No onboarding records found" description="Try another search or filter." /></td></tr> : filtered.map((person) => { const progress = Math.round(person.tasks.filter((task) => task.done).length / person.tasks.length * 100); return <tr key={person.id} className="table-row"><td className="table-cell"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary-surface flex items-center justify-center"><span className="text-[10px] font-bold text-primary">{person.initials}</span></div><span className="font-semibold text-ink">{person.name}</span></div></td><td className="table-cell text-body">{person.role}</td><td className="table-cell text-muted">{person.start}</td><td className="table-cell"><span className="font-mono text-xs text-ink">{progress}%</span></td><td className="table-cell"><span className={`badge ${statusMeta[person.status].badge}`}>{person.status}</span></td><td className="table-cell text-right"><div className="inline-flex items-center gap-1"><button onClick={() => setSelected(person)} className="min-h-9 px-3 rounded-lg text-xs font-semibold text-primary hover:bg-primary-surface">Checklist</button>{person.status !== 'Completed' && <button onClick={() => setConfirmComplete(person)} aria-label={`Complete onboarding for ${person.name}`} className="min-h-9 min-w-9 rounded-lg hover:bg-cta-surface text-cta inline-flex items-center justify-center"><CheckCircle2 size={15} /></button>}</div></td></tr>; })}</tbody></table></div><div className="px-5 py-4 border-t border-hairline-soft"><p className="text-xs text-muted">Showing {filtered.length} of {people.length} onboarding records</p></div></div>

    {showNew && <NewOnboardingModal onClose={() => setShowNew(false)} onCreate={addPerson} />}
    {selected && <ChecklistModal person={selected} onClose={() => setSelected(null)} onToggle={toggleTask} />}
    <ConfirmDialog open={Boolean(confirmComplete)} title="Mark onboarding complete?" description={`${confirmComplete?.name} will be marked as fully onboarded and all remaining checklist tasks will be completed.`} confirmLabel="Mark complete" onConfirm={completeOnboarding} onCancel={() => setConfirmComplete(null)} />
  </div>;
}
