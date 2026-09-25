'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Mail, Phone, Building2, MapPin, X, UserRound, Briefcase, Copy, Check, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import ModuleHeader from '@/components/ui/ModuleHeader';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

type Person = {
  id: string;
  name: string;
  initials: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  location: string;
  status: string;
  color: string;
  joined?: string;
};

const COLORS = ['bg-primary-surface text-primary', 'bg-cta-surface text-cta-hover', 'bg-violet-50 text-violet-600', 'bg-amber-50 text-accent-yellow', 'bg-sky-50 text-sky-600', 'bg-emerald-50 text-emerald-600'];

function toPerson(row: any, index: number): Person {
  const name = row.full_name ?? 'Unknown employee';
  const initials = name.split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase();
  return {
    id: row.id,
    name,
    initials,
    department: row.department ?? 'Unassigned',
    position: row.position ?? '—',
    email: row.email ?? '',
    phone: row.phone ?? '',
    location: row.branch ?? '—',
    status: row.status ?? 'active',
    color: COLORS[index % COLORS.length],
    joined: row.join_date ?? undefined,
  };
}

function PersonModal({ person, onClose }: { person: Person; onClose: () => void }) {
  const [copied, setCopied] = useState('');
  const copy = async (value: string, label: string) => { await navigator.clipboard?.writeText(value); setCopied(label); setTimeout(() => setCopied(''), 1500); };
  return <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><div className="absolute inset-0 bg-ink/40" onClick={onClose} /><div className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6"><div className="flex justify-end"><button onClick={onClose} aria-label="Close employee details" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button></div><div className="text-center -mt-5"><div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${person.color}`}><span className="text-xl font-bold">{person.initials}</span></div><h2 className="text-lg font-bold text-ink mt-3">{person.name}</h2><p className="text-sm text-muted">{person.position}</p><span className="badge bg-cta-surface text-cta-hover mt-2 capitalize">{person.status}</span></div><div className="mt-6 border-t border-hairline-soft pt-4 space-y-3"><div className="flex items-center gap-3 text-sm"><Briefcase size={15} className="text-muted" /><span className="text-body">{person.department}</span></div><div className="flex items-center gap-3 text-sm"><MapPin size={15} className="text-muted" /><span className="text-body">{person.location}</span></div><div className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-3"><Mail size={15} className="text-muted" /><span className="text-body">{person.email || '—'}</span></span>{person.email && <button onClick={() => copy(person.email, 'email')} className="text-primary" aria-label="Copy email">{copied === 'email' ? <Check size={14} /> : <Copy size={14} />}</button>}</div><div className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-3"><Phone size={15} className="text-muted" /><span className="text-body">{person.phone || '—'}</span></span>{person.phone && <button onClick={() => copy(person.phone, 'phone')} className="text-primary" aria-label="Copy phone">{copied === 'phone' ? <Check size={14} /> : <Copy size={14} />}</button>}</div></div><div className="flex gap-2 mt-6"><a href={`mailto:${person.email}`} className="btn-cta flex-1 justify-center gap-2 text-sm"><Mail size={14} /> Email</a><a href={`tel:${person.phone}`} className="btn-secondary flex-1 justify-center gap-2 text-sm"><Phone size={14} /> Call</a></div></div></div>;
}

export default function DirectoryPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeDept, setActiveDept] = useState('All');
  const [selected, setSelected] = useState<Person | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try { const response = await api.get('/employees', { params: { per_page: 100 } }); setPeople((response.data.items ?? []).map(toPerson)); }
    catch (error: any) { toast(error.response?.data?.detail || 'Unable to load directory.', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const depts = ['All', ...Array.from(new Set(people.map((p) => p.department)))];
  const filtered = useMemo(() => people.filter((p) => `${p.name} ${p.position} ${p.email} ${p.location}`.toLowerCase().includes(search.toLowerCase())).filter((p) => activeDept === 'All' || p.department === activeDept), [people, search, activeDept]);

  return <div>
    <ModuleHeader eyebrow="People" title="Employee Directory" description="Find anyone in your organization instantly" action={<div className="flex gap-2"><button onClick={() => { navigator.clipboard?.writeText(filtered.map((p) => `${p.name} — ${p.email}`).join('\n')); toast('Directory contacts copied to clipboard.', 'success'); }} className="btn-secondary gap-2 text-xs"><Copy size={14} /> Copy contacts</button></div>} />
    <div className="mb-6"><div className="card p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative flex-1 max-w-sm"><Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" /><input type="search" aria-label="Search directory" placeholder="Search name, role, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full min-h-11 rounded-pill bg-surface-strong pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-primary/20" /></div><div className="flex items-center gap-2"><button onClick={() => setView('grid')} className={`min-h-9 px-3 rounded-lg text-xs font-semibold ${view === 'grid' ? 'bg-primary text-white' : 'bg-surface-strong text-muted'}`}>Grid</button><button onClick={() => setView('list')} className={`min-h-9 px-3 rounded-lg text-xs font-semibold ${view === 'list' ? 'bg-primary text-white' : 'bg-surface-strong text-muted'}`}>List</button></div><div className="flex gap-2 overflow-x-auto pb-1">{depts.map((d) => <button key={d} onClick={() => setActiveDept(d)} className={`min-h-9 px-3 rounded-pill text-[11px] font-semibold whitespace-nowrap transition-colors ${activeDept === d ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>{d}</button>)}</div></div></div></div>
    {loading ? <div className="card"><p className="p-8 text-center text-sm text-muted">Loading directory…</p></div> : filtered.length === 0 ? <div className="card"><EmptyState title="No employees found" description="Try another name, role, location, or department." /></div> : view === 'grid' ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{filtered.map((person) => <button key={person.id} onClick={() => setSelected(person)} className="card card-hover text-left cursor-pointer p-5"><div className="flex items-center gap-3 mb-4"><div className={`w-11 h-11 rounded-full flex items-center justify-center ${person.color}`}><span className="text-sm font-bold">{person.initials}</span></div><div className="min-w-0"><p className="text-sm font-bold text-ink truncate">{person.name}</p><p className="text-xs text-muted truncate">{person.position}</p></div></div><div className="space-y-2.5 text-xs"><div className="flex items-center gap-2 text-body"><Building2 size={13} className="text-muted shrink-0" />{person.department}</div><div className="flex items-center gap-2 text-body"><MapPin size={13} className="text-muted shrink-0" />{person.location}</div><div className="flex items-center gap-2 text-body"><Mail size={13} className="text-muted shrink-0" />{person.email || '—'}</div><div className="flex items-center gap-2 text-body"><Phone size={13} className="text-muted shrink-0" />{person.phone || '—'}</div></div></button>)}</div> : <div className="card p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[700px]"><thead><tr className="border-b border-hairline"><th className="table-header">Employee</th><th className="table-header">Department</th><th className="table-header">Location</th><th className="table-header">Contact</th></tr></thead><tbody>{filtered.map((person) => <tr key={person.id} onClick={() => setSelected(person)} className="table-row cursor-pointer"><td className="table-cell"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${person.color}`}><span className="text-[10px] font-bold">{person.initials}</span></div><div><p className="font-semibold text-ink">{person.name}</p><p className="text-[11px] text-muted">{person.position}</p></div></div></td><td className="table-cell text-body">{person.department}</td><td className="table-cell text-body">{person.location}</td><td className="table-cell text-primary">{person.email || '—'}</td></tr>)}</tbody></table></div></div>}
    <div className="mt-5 flex items-center justify-center gap-4 text-center"><button onClick={() => void load()} className="btn-secondary gap-2 text-xs"><RefreshCw size={13} /> Refresh</button><p className="text-xs text-muted">Showing {filtered.length} of {people.length} employees</p></div>
    {selected && <PersonModal person={selected} onClose={() => setSelected(null)} />}
  </div>;
}
