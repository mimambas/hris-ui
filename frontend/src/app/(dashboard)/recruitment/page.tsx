'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import {
  Briefcase, Users, UserPlus, Clock, Plus, MoreHorizontal, Search, X,
  CalendarDays, Mail, Phone, MapPin, Star, MessageSquare, ChevronDown,
  ArrowRight, CheckCircle2, FileText, GripVertical,
} from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

type Stage = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

type Candidate = {
  id: string;
  name: string;
  role: string;
  stage: Stage;
  applied: string;
  initials: string;
  email: string;
  phone: string;
  location: string;
  source: string;
  rating: number;
  experience: string;
  skills: string[];
  notes: string;
  interview?: { date: string; time: string; interviewer: string };
};

const initialCandidates: Candidate[] = [
  { id: '1', name: 'Dimas Saputra', role: 'Senior Backend Developer', stage: 'Interview', applied: '21 Sep 2026', initials: 'DS', email: 'dimas.saputra@email.com', phone: '+628123450001', location: 'Jakarta Selatan', source: 'LinkedIn', rating: 4, experience: '7 years', skills: ['Python', 'FastAPI', 'PostgreSQL'], notes: 'Strong distributed systems background. Culture interview pending.', interview: { date: '25 Sep 2026', time: '10:00', interviewer: 'Budi Hartono' } },
  { id: '2', name: 'Nadia Putri', role: 'Product Designer', stage: 'Screening', applied: '20 Sep 2026', initials: 'NP', email: 'nadia.putri@email.com', phone: '+628123450002', location: 'Bandung', source: 'Jobstreet', rating: 3, experience: '4 years', skills: ['Figma', 'Research', 'Design Systems'], notes: 'Portfolio review looks promising. Schedule phone screen.',
  },
  { id: '3', name: 'Kevin Wijaya', role: 'Finance Analyst', stage: 'Offer', applied: '19 Sep 2026', initials: 'KW', email: 'kevin.wijaya@email.com', phone: '+628123450003', location: 'Jakarta Pusat', source: 'Referral', rating: 5, experience: '5 years', skills: ['Financial Modeling', 'Excel', 'PPh 21'], notes: 'Offer sent on 21 Sep. Awaiting response.', },
  { id: '4', name: 'Larasati Hadi', role: 'HR Officer', stage: 'Applied', applied: '18 Sep 2026', initials: 'LH', email: 'larasati.hadi@email.com', phone: '+628123450004', location: 'Depok', source: 'Career page', rating: 0, experience: '2 years', skills: ['Recruitment', 'HRIS', 'Payroll'], notes: '', },
  { id: '5', name: 'Yoga Pranoto', role: 'Frontend Developer', stage: 'Interview', applied: '17 Sep 2026', initials: 'YP', email: 'yoga.pranoto@email.com', phone: '+628123450005', location: 'Jakarta Barat', source: 'LinkedIn', rating: 4, experience: '6 years', skills: ['React', 'TypeScript', 'Next.js'], notes: 'Technical interview passed. Strong frontend fundamentals.', interview: { date: '26 Sep 2026', time: '14:00', interviewer: 'Rizky Prasetyo' } },
];

const stageOrder: Stage[] = ['Applied', 'Screening', 'Interview', 'Offer'];
const stageColor: Record<Stage, string> = {
  Applied: 'bg-surface-strong text-muted', Screening: 'bg-primary-surface text-primary',
  Interview: 'bg-amber-50 text-accent-yellow', Offer: 'bg-cta-surface text-cta-hover',
  Hired: 'bg-cta-surface text-cta-hover', Rejected: 'bg-red-50 text-semantic-down',
};
const stageDot: Record<Stage, string> = { Applied: 'bg-muted', Screening: 'bg-primary-light', Interview: 'bg-accent-yellow', Offer: 'bg-cta', Hired: 'bg-cta', Rejected: 'bg-semantic-down' };

export default function RecruitmentPage() {
  const [view, setView] = useState<'pipeline' | 'candidates'>('pipeline');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showVacancy, setShowVacancy] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [stageFilter, setStageFilter] = useState<'All stages' | Stage>('All stages');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [confirmReject, setConfirmReject] = useState<Candidate | null>(null);
  const { toast } = useToast();
  const loadCandidates = async () => { setLoading(true); try { const response = await api.get('/recruitment'); setCandidates(response.data.items ?? []); } catch { toast('Unable to load candidates.', 'error'); } finally { setLoading(false); } };
  useEffect(() => { void loadCandidates(); }, []);

  const roles = ['All roles', ...Array.from(new Set(candidates.map((candidate) => candidate.role)))];
  const filtered = useMemo(() => candidates.filter((candidate) => {
    const matchesSearch = `${candidate.name} ${candidate.role} ${candidate.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All roles' || candidate.role === roleFilter;
    const matchesStage = stageFilter === 'All stages' || candidate.stage === stageFilter;
    return matchesSearch && matchesRole && matchesStage;
  }), [candidates, roleFilter, search, stageFilter]);

  const updateStage = async (id: string, stage: Stage) => {
    try { await api.patch(`/recruitment/${id}`, { stage }); setCandidates((current) => current.map((candidate) => candidate.id === id ? { ...candidate, stage } : candidate)); setSelectedCandidate((current) => current?.id === id ? { ...current, stage } : current); toast(`Candidate moved to ${stage}.`, 'success'); } catch { toast('Unable to update candidate stage.', 'error'); }
  };

  const handleDrop = (stage: Stage) => {
    if (!draggedId) return;
    updateStage(draggedId, stage);
    setDraggedId(null);
  };

  const addNote = async (id: string, note: string) => {
    const trimmed = note.trim();
    if (!trimmed) return;
    try { const response = await api.post(`/recruitment/${id}/notes`, { note: trimmed }); setCandidates((current) => current.map((candidate) => candidate.id === id ? { ...candidate, notes: response.data.notes } : candidate)); setSelectedCandidate((current) => current?.id === id ? { ...current, notes: response.data.notes } : current); toast('Note added to candidate.', 'success'); } catch { toast('Unable to add note.', 'error'); }
  };

  const scheduleInterview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCandidate) return;
    const form = new FormData(event.currentTarget);
    const date = String(form.get('date') || '');
    const time = String(form.get('time') || '');
    const interviewer = String(form.get('interviewer') || '').trim();
    if (!date || !time || !interviewer) { toast('Complete the interview date, time, and interviewer.', 'error'); return; }
    try { await api.post(`/recruitment/${selectedCandidate.id}/interview`, { date, time, interviewer }); await loadCandidates(); const interview = { date, time, interviewer }; setSelectedCandidate({ ...selectedCandidate, interview, stage: 'Interview' }); toast('Interview scheduled successfully.', 'success'); } catch { toast('Unable to schedule interview.', 'error'); }
  };

  const createVacancy = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') || '').trim();
    const department = String(form.get('department') || '').trim();
    if (!title || !department) { toast('Job title and department are required.', 'error'); return; }
    try { await api.post('/recruitment/vacancies', { title, department, type: form.get('type'), openings: form.get('openings'), description: form.get('description') }); setShowVacancy(false); toast(`${title} vacancy created as draft.`, 'success'); } catch { toast('Unable to create vacancy.', 'error'); }
  };

  return (
    <div>
      <ModuleHeader eyebrow="Talent acquisition" title="Recruitment" description="Build your team and manage the hiring pipeline" action={<button onClick={() => setShowVacancy(true)} className="btn-cta gap-2"><Plus size={15} /> Add Vacancy</button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard icon={Briefcase} label="Open positions" value="12" tone="primary" detail="Across 6 departments" />
        <StatCard icon={Users} label="Active candidates" value={String(candidates.length)} tone="green" detail="In hiring pipeline" />
        <StatCard icon={Clock} label="Avg. time to hire" value="24d" tone="amber" detail="Down 3 days this month" />
        <StatCard icon={UserPlus} label="Hires this month" value="8" tone="green" detail="Target: 10 hires" />
      </div>

      <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setView('pipeline')} className={`min-h-10 px-4 rounded-pill text-xs font-semibold ${view === 'pipeline' ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>Hiring pipeline</button>
          <button onClick={() => setView('candidates')} className={`min-h-10 px-4 rounded-pill text-xs font-semibold ${view === 'candidates' ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>All candidates</button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative"><Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" /><input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search candidates" placeholder="Search candidates..." className="input-field min-h-10 rounded-pill pl-9 py-2 w-full sm:w-56" /></div>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Filter by role" className="input-field min-h-10 py-2 text-xs sm:w-40"><option disabled={roles.length === 1}>All roles</option>{roles.slice(1).map((role) => <option key={role}>{role}</option>)}</select>
          {view === 'candidates' && <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value as 'All stages' | Stage)} aria-label="Filter by stage" className="input-field min-h-10 py-2 text-xs sm:w-36"><option>All stages</option>{stageOrder.map((stage) => <option key={stage}>{stage}</option>)}</select>}
        </div>
      </div>

      {view === 'pipeline' ? <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stageOrder.map((stage) => {
          const stageCandidates = filtered.filter((candidate) => candidate.stage === stage);
          return <div key={stage} onDragOver={(event) => event.preventDefault()} onDrop={() => handleDrop(stage)} className={`card p-4 min-h-[300px] transition-colors ${draggedId ? 'border-primary/40 bg-primary-surface/20' : ''}`}>
            <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${stageDot[stage]}`} /><h2 className="text-sm font-bold text-ink">{stage}</h2></div><span className="badge bg-surface-strong text-muted">{stageCandidates.length}</span></div>
            <div className="space-y-3">
              {stageCandidates.map((candidate) => <div key={candidate.id} draggable onDragStart={() => setDraggedId(candidate.id)} onDragEnd={() => setDraggedId(null)} className="rounded-lg border border-hairline bg-canvas hover:border-primary-light hover:shadow-card-hover transition-all" onPointerDown={(e) => { if (e.button !== 0) return; const rect = e.currentTarget.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; if (x < 30 && y < 30) { e.currentTarget.removeAttribute('draggable'); } else { e.currentTarget.setAttribute('draggable', 'true'); } }}>
                <div className="p-3 cursor-pointer" onClick={() => setSelectedCandidate(candidate)}>
                <div className="flex items-start gap-2.5"><GripVertical size={14} className="text-muted-soft mt-1 shrink-0" /><div className="w-8 h-8 rounded-full bg-primary-surface flex items-center justify-center shrink-0"><span className="text-[10px] font-bold text-primary">{candidate.initials}</span></div><div className="min-w-0"><p className="text-xs font-bold text-ink truncate">{candidate.name}</p><p className="text-[10px] text-muted truncate mt-0.5">{candidate.role}</p></div></div>
                <div className="flex items-center justify-between mt-3"><p className="text-[10px] text-muted">Applied {candidate.applied}</p>{candidate.rating > 0 && <span className="inline-flex items-center gap-0.5 text-[10px] text-accent-yellow"><Star size={10} fill="currentColor" /> {candidate.rating}/5</span>}</div>
                </div>
              </div>)}
              {stageCandidates.length === 0 && <div className="rounded-lg border border-dashed border-hairline py-8 text-center"><p className="text-xs text-muted">Drop candidates here</p></div>}
            </div>
            <button onClick={() => { setStageFilter(stage); setView('candidates'); }} className="w-full mt-4 min-h-10 rounded-lg border border-dashed border-hairline text-xs font-semibold text-muted hover:border-primary hover:text-primary">View all {stage.toLowerCase()}</button>
          </div>;
        })}
      </div> : <div className="card p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[900px]"><thead><tr className="border-b border-hairline"><th className="table-header">Candidate</th><th className="table-header">Position</th><th className="table-header">Stage</th><th className="table-header">Experience</th><th className="table-header">Source</th><th className="table-header">Applied</th><th className="table-header text-right">Actions</th></tr></thead><tbody>{filtered.length === 0 ? <tr><td colSpan={7}><EmptyState title="No candidates found" description="Try another search or filter." /></td></tr> : filtered.map((candidate) => <tr key={candidate.id} className="table-row"><td className="table-cell"><button onClick={() => setSelectedCandidate(candidate)} className="flex items-center gap-3 text-left"><div className="w-8 h-8 rounded-full bg-primary-surface flex items-center justify-center shrink-0"><span className="text-[10px] font-bold text-primary">{candidate.initials}</span></div><span className="font-semibold text-ink hover:text-primary">{candidate.name}</span></button></td><td className="table-cell text-body">{candidate.role}</td><td className="table-cell"><span className={`badge ${stageColor[candidate.stage]}`}>{candidate.stage}</span></td><td className="table-cell text-muted">{candidate.experience}</td><td className="table-cell text-muted">{candidate.source}</td><td className="table-cell text-muted">{candidate.applied}</td><td className="table-cell text-right"><button onClick={() => setSelectedCandidate(candidate)} aria-label={`Actions for ${candidate.name}`} className="min-h-10 min-w-10 rounded-md hover:bg-primary-surface"><MoreHorizontal size={16} className="mx-auto text-muted" /></button></td></tr>)}</tbody></table></div><div className="px-5 py-4 border-t border-hairline-soft"><p className="text-xs text-muted">Showing {filtered.length} of {candidates.length} candidates</p></div></div>}

      {selectedCandidate && <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} onStageChange={(stage) => updateStage(selectedCandidate.id, stage)} onAddNote={(note) => addNote(selectedCandidate.id, note)} onSchedule={scheduleInterview} onReject={() => setConfirmReject(selectedCandidate)} />}
      <ConfirmDialog open={Boolean(confirmReject)} title="Reject this candidate?" description="This candidate will be moved to the rejected stage. You can still review their profile later." confirmLabel="Reject candidate" variant="danger" onConfirm={() => { if (confirmReject) updateStage(confirmReject.id, 'Rejected'); setConfirmReject(null); setSelectedCandidate(null); }} onCancel={() => setConfirmReject(null)} />
      {showVacancy && <VacancyModal onClose={() => setShowVacancy(false)} onSubmit={createVacancy} />}
    </div>
  );
}

function ModalShell({ title, description, onClose, children, wide = false }: { title: string; description?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><div className="absolute inset-0 bg-ink/40" onClick={onClose} /><div role="dialog" aria-modal="true" className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto rounded-2xl bg-canvas border border-hairline shadow-2xl p-6`}><div className="flex items-start justify-between gap-4 mb-5"><div><h2 className="text-base font-bold text-ink">{title}</h2>{description && <p className="text-xs text-muted mt-1">{description}</p>}</div><button type="button" onClick={onClose} aria-label="Close dialog" className="btn-secondary min-h-10 min-w-10 px-3"> <X size={15} /></button></div>{children}</div></div>;
}

function CandidateModal({ candidate, onClose, onStageChange, onAddNote, onSchedule, onReject }: { candidate: Candidate; onClose: () => void; onStageChange: (stage: Stage) => void; onAddNote: (note: string) => void; onSchedule: (event: React.FormEvent<HTMLFormElement>) => void; onReject: () => void }) {
  const [note, setNote] = useState('');
  return <ModalShell title={candidate.name} description={`${candidate.role} · Applied ${candidate.applied}`} onClose={onClose} wide>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-5">
        <div className="grid grid-cols-2 gap-3"><div className="rounded-lg bg-surface-soft p-3"><p className="text-[10px] uppercase tracking-wider text-muted">Stage</p><select value={candidate.stage} onChange={(event) => onStageChange(event.target.value as Stage)} className="input-field mt-1.5 min-h-9 py-1.5 text-xs"><option>Applied</option><option>Screening</option><option>Interview</option><option>Offer</option><option>Hired</option><option>Rejected</option></select></div><div className="rounded-lg bg-surface-soft p-3"><p className="text-[10px] uppercase tracking-wider text-muted">Rating</p><div className="flex items-center gap-1 mt-2">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={16} className={star <= candidate.rating ? 'text-accent-yellow' : 'text-hairline'} fill={star <= candidate.rating ? 'currentColor' : 'none'} />)}<span className="text-xs text-muted ml-1">{candidate.rating}/5</span></div></div></div>
        <div><h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Candidate details</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"><span className="flex items-center gap-2 text-body"><Mail size={14} className="text-muted" />{candidate.email}</span><span className="flex items-center gap-2 text-body"><Phone size={14} className="text-muted" />{candidate.phone}</span><span className="flex items-center gap-2 text-body"><MapPin size={14} className="text-muted" />{candidate.location}</span><span className="flex items-center gap-2 text-body"><Briefcase size={14} className="text-muted" />{candidate.experience} experience</span></div></div>
        <div><h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Skills</h3><div className="flex flex-wrap gap-2">{candidate.skills.map((skill) => <span key={skill} className="badge bg-primary-surface text-primary">{skill}</span>)}</div></div>
        <div><h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Notes</h3><div className="rounded-lg bg-surface-soft p-3 text-xs text-body whitespace-pre-line min-h-16">{candidate.notes || 'No notes yet.'}</div><div className="flex gap-2 mt-2"><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a note..." aria-label="New candidate note" className="input-field min-h-10 py-2 text-xs" /><button onClick={() => { onAddNote(note); setNote(''); }} className="btn-secondary min-h-10 px-3 text-xs">Add</button></div></div>
      </div>
      <div className="lg:col-span-2 space-y-4"><div className="rounded-xl border border-hairline p-4"><div className="flex items-center gap-2 mb-3"><CalendarDays size={15} className="text-primary" /><h3 className="text-xs font-bold text-ink">Interview</h3></div>{candidate.interview ? <div className="rounded-lg bg-primary-surface p-3 text-xs"><p className="font-semibold text-primary">{candidate.interview.date} at {candidate.interview.time}</p><p className="text-body mt-1">with {candidate.interview.interviewer}</p></div> : <p className="text-xs text-muted mb-3">No interview scheduled.</p>}<form onSubmit={onSchedule} className="space-y-2 mt-3"><input name="date" type="date" aria-label="Interview date" className="input-field min-h-9 py-1.5 text-xs" /><input name="time" type="time" aria-label="Interview time" className="input-field min-h-9 py-1.5 text-xs" /><input name="interviewer" placeholder="Interviewer name" aria-label="Interviewer name" className="input-field min-h-9 py-1.5 text-xs" /><button className="btn-secondary w-full min-h-10 text-xs gap-1.5"><CalendarDays size={13} /> {candidate.interview ? 'Reschedule interview' : 'Schedule interview'}</button></form></div><div className="rounded-xl border border-hairline p-4"><h3 className="text-xs font-bold text-ink mb-3">Candidate actions</h3><div className="space-y-2"><button onClick={() => onStageChange(candidate.stage === 'Offer' ? 'Hired' : 'Offer')} className="btn-cta w-full min-h-10 text-xs gap-1.5"><CheckCircle2 size={13} /> {candidate.stage === 'Offer' ? 'Mark as hired' : 'Move to offer'}</button><button onClick={onReject} className="btn-secondary w-full min-h-10 text-xs text-semantic-down hover:bg-red-50">Reject candidate</button></div></div></div>
    </div>
  </ModalShell>;
}

function VacancyModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <ModalShell title="Add vacancy" description="Create a new position for your hiring pipeline" onClose={onClose}><form onSubmit={onSubmit} className="space-y-4"><label className="block text-xs font-semibold text-ink">Job title<input name="title" required placeholder="e.g. Senior Product Manager" className="input-field mt-1.5" /></label><label className="block text-xs font-semibold text-ink">Department<select name="department" required className="input-field mt-1.5"><option value="">Select department...</option><option>Engineering</option><option>Product & Design</option><option>Finance</option><option>Human Resources</option><option>Marketing</option></select></label><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-semibold text-ink">Employment type<select name="type" className="input-field mt-1.5"><option>Full-time</option><option>Contract</option><option>Part-time</option></select></label><label className="block text-xs font-semibold text-ink">Openings<input name="openings" type="number" min="1" defaultValue="1" className="input-field mt-1.5" /></label></div><label className="block text-xs font-semibold text-ink">Description<textarea name="description" rows={3} placeholder="Describe the role and responsibilities..." className="input-field mt-1.5" /></label><div className="flex justify-end gap-3 pt-4 border-t border-hairline-soft"><button type="button" onClick={onClose} className="btn-secondary text-sm">Cancel</button><button type="submit" className="btn-cta text-sm gap-2"><Plus size={14} /> Create draft</button></div></form></ModalShell>;
}
