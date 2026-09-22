'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Plus, UserPlus, ClipboardCheck, BookOpen, Laptop, FileSignature } from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';

const checklist = [
  { id: '1', title: 'Complete personal profile', category: 'Profile', owner: 'New hire', due: '18 Sep', status: 'completed', icon: UserPlus },
  { id: '2', title: 'Upload identity documents', category: 'Documents', owner: 'New hire', due: '18 Sep', status: 'completed', icon: FileSignature },
  { id: '3', title: 'Set up laptop and accounts', category: 'IT Setup', owner: 'IT team', due: '19 Sep', status: 'completed', icon: Laptop },
  { id: '4', title: 'Review employee handbook', category: 'Training', owner: 'New hire', due: '22 Sep', status: 'in-progress', icon: BookOpen },
  { id: '5', title: 'Meet your team', category: 'Team', owner: 'Manager', due: '23 Sep', status: 'pending', icon: UserPlus },
  { id: '6', title: 'Complete compliance training', category: 'Training', owner: 'New hire', due: '25 Sep', status: 'pending', icon: ClipboardCheck },
  { id: '7', title: '30-day check-in', category: 'Review', owner: 'Manager', due: '18 Oct', status: 'pending', icon: Clock },
];

const meta: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  completed: { label: 'Completed', color: 'bg-cta-surface text-cta-hover', icon: CheckCircle2 },
  'in-progress': { label: 'In progress', color: 'bg-primary-surface text-primary', icon: Clock },
  pending: { label: 'Not started', color: 'bg-surface-strong text-muted', icon: Circle },
};

export default function OnboardingChecklistPage() {
  const [filter, setFilter] = useState('All tasks');
  const filters = ['All tasks', 'My tasks', 'Completed', 'Pending'];
  const filtered = checklist.filter((task) =>
    filter === 'All tasks' || filter === 'My tasks' && task.owner === 'New hire' || filter === 'Completed' && task.status === 'completed' || filter === 'Pending' && task.status !== 'completed'
  );

  return (
    <div>
      <ModuleHeader
        eyebrow="Onboarding setup"
        title="Checklist Templates"
        description="Create and manage onboarding tasks for every new hire"
        action={<button className="btn-cta gap-2"><Plus size={15} /> Add task</button>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="card"><p className="text-xs text-muted font-semibold">Total tasks</p><p className="mt-2 font-mono text-2xl font-bold text-ink">{checklist.length}</p><p className="text-xs text-muted mt-1">In this template</p></div>
        <div className="card"><p className="text-xs text-muted font-semibold">Completed</p><p className="mt-2 font-mono text-2xl font-bold text-cta">3</p><p className="text-xs text-cta mt-1">43% complete</p></div>
        <div className="card"><p className="text-xs text-muted font-semibold">Average completion</p><p className="mt-2 font-mono text-2xl font-bold text-primary">9.4 days</p><p className="text-xs text-muted mt-1">Per employee</p></div>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline-soft flex items-center gap-2 overflow-x-auto">
          {filters.map((f) => <button key={f} onClick={() => setFilter(f)} className={`min-h-10 px-4 rounded-pill text-xs font-semibold whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>{f}</button>)}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead><tr className="border-b border-hairline"><th className="table-header">Task</th><th className="table-header">Category</th><th className="table-header">Owner</th><th className="table-header">Due date</th><th className="table-header">Status</th></tr></thead>
            <tbody>
              {filtered.map((task) => {
                const st = meta[task.status];
                const StatusIcon = st.icon;
                const TaskIcon = task.icon;
                return (
                  <tr key={task.id} className="table-row">
                    <td className="table-cell"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-primary-surface flex items-center justify-center"><TaskIcon size={14} className="text-primary" /></div><span className="font-semibold text-ink">{task.title}</span></div></td>
                    <td className="table-cell"><span className="badge bg-surface-strong text-muted">{task.category}</span></td>
                    <td className="table-cell text-body">{task.owner}</td>
                    <td className="table-cell text-muted">{task.due}</td>
                    <td className="table-cell"><span className={`badge gap-1.5 ${st.color}`}><StatusIcon size={12} />{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
