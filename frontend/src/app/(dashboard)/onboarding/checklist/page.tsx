'use client';

import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  ClipboardCheck,
  FileSignature,
  Flag,
  Laptop,
  Plus,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

type TaskStatus = 'pending' | 'in-progress' | 'completed';
type Priority = 'Low' | 'Medium' | 'High';

type Task = {
  id: string;
  title: string;
  category: string;
  assignee: string;
  employee: string;
  dueDate: string;
  status: TaskStatus;
  priority: Priority;
  icon: LucideIcon;
};

const employees = ['Ava Thompson', 'Liam Chen', 'Maya Patel'];
const categories = ['Profile', 'Documents', 'IT Setup', 'Training', 'Team', 'Review'];
const priorities: Priority[] = ['Low', 'Medium', 'High'];

const initialTasks: Task[] = [
  { id: '1', title: 'Complete personal profile', category: 'Profile', assignee: 'New hire', employee: 'Ava Thompson', dueDate: '2026-09-18', status: 'completed', priority: 'High', icon: UserPlus },
  { id: '2', title: 'Upload identity documents', category: 'Documents', assignee: 'New hire', employee: 'Ava Thompson', dueDate: '2026-09-18', status: 'completed', priority: 'High', icon: FileSignature },
  { id: '3', title: 'Set up laptop and accounts', category: 'IT Setup', assignee: 'IT team', employee: 'Ava Thompson', dueDate: '2026-09-19', status: 'completed', priority: 'Medium', icon: Laptop },
  { id: '4', title: 'Review employee handbook', category: 'Training', assignee: 'New hire', employee: 'Liam Chen', dueDate: '2026-09-22', status: 'in-progress', priority: 'Medium', icon: BookOpen },
  { id: '5', title: 'Meet your team', category: 'Team', assignee: 'Manager', employee: 'Liam Chen', dueDate: '2026-09-23', status: 'pending', priority: 'Low', icon: UserPlus },
  { id: '6', title: 'Complete compliance training', category: 'Training', assignee: 'New hire', employee: 'Maya Patel', dueDate: '2026-09-25', status: 'pending', priority: 'High', icon: ClipboardCheck },
  { id: '7', title: '30-day check-in', category: 'Review', assignee: 'Manager', employee: 'Maya Patel', dueDate: '2026-10-18', status: 'pending', priority: 'Medium', icon: Clock },
];

const statusMeta: Record<TaskStatus, { label: string; color: string; icon: LucideIcon }> = {
  pending: { label: 'Not started', color: 'bg-surface-strong text-muted', icon: Circle },
  'in-progress': { label: 'In progress', color: 'bg-primary-surface text-primary', icon: Clock },
  completed: { label: 'Completed', color: 'bg-cta-surface text-cta-hover', icon: CheckCircle2 },
};

const statusOrder: TaskStatus[] = ['pending', 'in-progress', 'completed'];
const today = new Date();
const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}

function isOverdue(task: Task) {
  return task.status !== 'completed' && task.dueDate < todayIso;
}

export default function OnboardingChecklistPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState('All tasks');
  const [employeeFilter, setEmployeeFilter] = useState('All employees');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ name: '', category: categories[0], assignee: 'New hire', employee: employees[0], dueDate: '', priority: 'Medium' as Priority });

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const matchesFilter = filter === 'All tasks'
      || (filter === 'My tasks' && task.assignee === 'New hire')
      || (filter === 'Completed' && task.status === 'completed')
      || (filter === 'Pending' && task.status !== 'completed');
    return matchesFilter && (employeeFilter === 'All employees' || task.employee === employeeFilter);
  }), [tasks, filter, employeeFilter]);

  const completedCount = tasks.filter((task) => task.status === 'completed').length;
  const overdueCount = tasks.filter(isOverdue).length;

  function advanceStatus(task: Task) {
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item));
    toast(`${task.title} moved to ${statusMeta[nextStatus].label.toLowerCase()}.`, 'success');
  }

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.category || !form.assignee || !form.dueDate || !form.priority) {
      toast('Complete all required fields before adding the task.', 'error');
      return;
    }
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: form.name.trim(),
      category: form.category,
      assignee: form.assignee,
      employee: form.employee,
      dueDate: form.dueDate,
      status: 'pending',
      priority: form.priority,
      icon: ClipboardCheck,
    };
    setTasks((current) => [...current, newTask]);
    setForm({ name: '', category: categories[0], assignee: 'New hire', employee: employees[0], dueDate: '', priority: 'Medium' });
    setIsAddOpen(false);
    toast('Task added to Not started.', 'success');
  }

  function confirmDelete() {
    if (!deleteTask) return;
    setTasks((current) => current.filter((task) => task.id !== deleteTask.id));
    toast(`“${deleteTask.title}” deleted.`, 'success');
    setDeleteTask(null);
  }

  return (
    <div>
      <ModuleHeader
        eyebrow="Onboarding setup"
        title="Checklist Templates"
        description="Create and manage onboarding tasks for every new hire"
        action={<button onClick={() => setIsAddOpen(true)} className="btn-cta gap-2"><Plus size={15} /> Add task</button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="card"><p className="text-xs text-muted font-semibold">Total tasks</p><p className="mt-2 font-mono text-2xl font-bold text-ink">{tasks.length}</p><p className="text-xs text-muted mt-1">In this template</p></div>
        <div className="card"><p className="text-xs text-muted font-semibold">Completed</p><p className="mt-2 font-mono text-2xl font-bold text-cta">{completedCount}</p><p className="text-xs text-cta mt-1">{tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0}% complete</p></div>
        <div className="card"><p className="text-xs text-muted font-semibold">Average completion</p><p className="mt-2 font-mono text-2xl font-bold text-primary">9.4 days</p><p className="text-xs text-muted mt-1">{overdueCount ? `${overdueCount} overdue task${overdueCount === 1 ? '' : 's'}` : 'Per employee'}</p></div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline-soft flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {['All tasks', 'My tasks', 'Completed', 'Pending'].map((item) => <button key={item} onClick={() => setFilter(item)} className={`min-h-10 px-4 rounded-pill text-xs font-semibold whitespace-nowrap transition-colors ${filter === item ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>{item}</button>)}
          </div>
          <label className="relative ml-auto flex items-center gap-2 text-xs font-semibold text-muted whitespace-nowrap">
            <Users size={15} />
            <span className="sr-only">Filter by employee</span>
            <select value={employeeFilter} onChange={(event) => setEmployeeFilter(event.target.value)} className="appearance-none bg-surface-strong text-ink rounded-lg pl-3 pr-8 min-h-10 text-xs font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option>All employees</option>
              {employees.map((employee) => <option key={employee}>{employee}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 pointer-events-none text-muted" />
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 lg:p-5 bg-surface-soft/30">
          {statusOrder.map((status) => {
            const meta = statusMeta[status];
            const StatusIcon = meta.icon;
            const columnTasks = filteredTasks.filter((task) => task.status === status);
            return (
              <section key={status} aria-labelledby={`${status}-heading`} className="min-w-0">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 id={`${status}-heading`} className="flex items-center gap-2 text-sm font-bold text-ink"><StatusIcon size={16} className={status === 'completed' ? 'text-cta' : status === 'in-progress' ? 'text-primary' : 'text-muted'} />{meta.label}</h2>
                  <span className="badge bg-surface-strong text-muted">{columnTasks.length}</span>
                </div>
                <div className="space-y-3 min-h-[10rem]">
                  {columnTasks.map((task) => {
                    const TaskIcon = task.icon;
                    const overdue = isOverdue(task);
                    return (
                      <article key={task.id} className="rounded-xl border border-hairline-soft bg-canvas p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary-surface flex items-center justify-center shrink-0"><TaskIcon size={15} className="text-primary" /></div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm text-ink leading-snug">{task.title}</h3>
                            <span className="inline-flex mt-2 badge bg-surface-strong text-muted">{task.category}</span>
                          </div>
                          <button onClick={() => setDeleteTask(task)} aria-label={`Delete ${task.title}`} className="min-h-8 min-w-8 rounded-lg text-muted hover:text-semantic-down hover:bg-red-50 flex items-center justify-center transition-colors"><Trash2 size={14} /></button>
                        </div>
                        <div className="mt-4 pt-3 border-t border-hairline-soft flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
                          <span className="inline-flex items-center gap-1.5"><UserPlus size={13} />{task.assignee}</span>
                          <span className={`inline-flex items-center gap-1.5 ${overdue ? 'text-semantic-down font-semibold' : ''}`}><CalendarDays size={13} />{overdue && <AlertTriangle size={13} />}{formatDueDate(task.dueDate)}{overdue ? ' · overdue' : ''}</span>
                          <span className={`inline-flex items-center gap-1.5 font-semibold ${task.priority === 'High' ? 'text-semantic-down' : task.priority === 'Medium' ? 'text-primary' : 'text-muted'}`}><Flag size={12} />{task.priority}</span>
                        </div>
                        <button onClick={() => advanceStatus(task)} className={`mt-3 w-full min-h-9 rounded-lg text-xs font-semibold text-left px-3 transition-colors hover:brightness-95 ${meta.color}`} aria-label={`Move ${task.title} to next status`}>Click to move to {statusMeta[statusOrder[(statusOrder.indexOf(status) + 1) % statusOrder.length]].label}</button>
                      </article>
                    );
                  })}
                  {!columnTasks.length && <div className="rounded-xl border border-dashed border-hairline bg-canvas/50 min-h-40 flex items-center justify-center text-xs text-muted">No tasks here</div>}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <form onSubmit={handleAddTask} className="relative w-full max-w-lg rounded-2xl bg-canvas border border-hairline shadow-2xl overflow-hidden animate-in fade-in zoom-in-95" aria-labelledby="add-task-title">
            <div className="px-6 py-5 border-b border-hairline-soft flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-1">Checklist</p><h2 id="add-task-title" className="text-lg font-bold text-ink">Add task</h2></div><button type="button" onClick={() => setIsAddOpen(false)} aria-label="Close add task dialog" className="min-h-10 min-w-10 rounded-lg hover:bg-surface-strong flex items-center justify-center"><X size={17} className="text-muted" /></button></div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="sm:col-span-2"><span className="field-label">Task name <span className="text-semantic-down">*</span></span><input autoFocus required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Schedule welcome meeting" className="input" /></label>
              <label><span className="field-label">Category <span className="text-semantic-down">*</span></span><select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="input">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
              <label><span className="field-label">Assignee <span className="text-semantic-down">*</span></span><select required value={form.assignee} onChange={(event) => setForm({ ...form, assignee: event.target.value })} className="input"><option>New hire</option><option>Manager</option><option>IT team</option><option>HR team</option></select></label>
              <label><span className="field-label">Employee <span className="text-semantic-down">*</span></span><select required value={form.employee} onChange={(event) => setForm({ ...form, employee: event.target.value })} className="input">{employees.map((employee) => <option key={employee}>{employee}</option>)}</select></label>
              <label><span className="field-label">Due date <span className="text-semantic-down">*</span></span><input required type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="input" /></label>
              <label><span className="field-label">Priority <span className="text-semantic-down">*</span></span><select required value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Priority })} className="input">{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
            </div>
            <div className="px-6 py-4 border-t border-hairline-soft flex items-center justify-end gap-3 bg-surface-soft/30"><button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary text-sm">Cancel</button><button type="submit" className="btn-cta text-sm">Add task</button></div>
          </form>
        </div>
      )}

      <ConfirmDialog open={Boolean(deleteTask)} title="Delete this task?" description={deleteTask ? `“${deleteTask.title}” will be removed from this checklist.` : ''} confirmLabel="Delete task" variant="danger" onConfirm={confirmDelete} onCancel={() => setDeleteTask(null)} />
    </div>
  );
}
