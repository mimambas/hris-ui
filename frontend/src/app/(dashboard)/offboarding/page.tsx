'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Plus, RefreshCw, UserMinus, X, Calculator } from 'lucide-react';
import api from '@/lib/api';
import ModuleHeader from '@/components/ui/ModuleHeader';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

type OffTask = { id: string; title: string; owner: string; done: boolean };
type OffRecord = { id: string; employee: string; employee_code: string; reason: string; last_working_date: string; status: string; progress: number; tasks: OffTask[] };

export default function OffboardingPage() {
  const [records, setRecords] = useState<OffRecord[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<OffRecord | null>(null);
  const [completeTarget, setCompleteTarget] = useState<OffRecord | null>(null);
  const [settlement, setSettlement] = useState<any>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [offboarding, employeeResponse] = await Promise.all([
        api.get('/offboarding'),
        api.get('/employees', { params: { status: 'active', per_page: 100 } }),
      ]);
      setRecords(offboarding.data.items ?? []);
      setEmployees(employeeResponse.data.items ?? []);
    } catch (e: any) { toast(e.response?.data?.detail || 'Unable to load offboarding.', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const toggleTask = async (record: OffRecord, task: OffTask) => {
    try {
      const response = await api.patch(`/offboarding/${record.id}`, { task_key: task.id, done: !task.done });
      setRecords((rows) => rows.map((row) => row.id === record.id ? response.data : row));
      setSelected(response.data);
    } catch (e: any) { toast(e.response?.data?.detail || 'Unable to update clearance task.', 'error'); }
  };

  const complete = async () => {
    if (!completeTarget) return;
    try {
      const response = await api.patch(`/offboarding/${completeTarget.id}`, { action: 'complete' });
      setRecords((rows) => rows.map((row) => row.id === completeTarget.id ? response.data : row));
      setCompleteTarget(null);
      setSelected(response.data);
      toast('Offboarding completed and employee deactivated.', 'success');
    } catch (e: any) { toast(e.response?.data?.detail || 'Unable to complete offboarding.', 'error'); }
  };

  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await api.post('/offboarding', { employee_id: data.get('employee_id'), reason: data.get('reason'), last_working_date: data.get('last_working_date'), notes: data.get('notes') });
      setShowCreate(false);
      await load();
      toast('Offboarding workflow created.', 'success');
    } catch (e: any) { toast(e.response?.data?.detail || 'Unable to create offboarding.', 'error'); }
    finally { setSaving(false); }
  };

  const loadSettlement = async (record: OffRecord) => { try { const response = await api.get(`/offboarding/${record.id}/settlement`); setSettlement(response.data); } catch (e: any) { toast(e.response?.data?.detail || 'Unable to calculate settlement.', 'error'); } };
  return <div>
    <ModuleHeader eyebrow="People operations" title="Offboarding" description="Manage clearance, handover, access revocation, and final settlement" action={<button onClick={() => setShowCreate(true)} className="btn-cta gap-2"><Plus size={15} /> Start offboarding</button>} />
    {loading ? <div className="card p-8 text-center text-sm text-muted">Loading offboarding…</div> : records.length === 0 ? (
      <div className="card"><EmptyState title="No offboarding workflows" description="Start an offboarding workflow for an active employee." /></div>
    ) : <div className="grid gap-4">{records.map((record) => <div key={record.id} className="card">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center"><UserMinus size={18} className="text-semantic-down" /></div>
        <div className="flex-1"><p className="text-sm font-bold text-ink">{record.employee}</p><p className="text-xs text-muted">{record.employee_code} · {record.reason} · Last day {record.last_working_date}</p></div>
        <span className={`badge ${record.status === 'completed' ? 'bg-cta-surface text-cta' : 'bg-amber-50 text-accent-yellow'}`}>{record.status}</span>
        <button onClick={() => setSelected(record)} className="btn-secondary text-xs">View clearance</button><button onClick={() => void loadSettlement(record)} className="btn-secondary text-xs gap-1"><Calculator size={13} /> Settlement</button>
        {record.status === 'active' && <button disabled={record.progress < 100} onClick={() => setCompleteTarget(record)} className="btn-cta text-xs gap-1 disabled:opacity-50"><CheckCircle2 size={13} /> Complete</button>}
      </div>
      <div className="mt-4 flex items-center gap-3"><div className="h-2 flex-1 rounded-full bg-surface-strong overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${record.progress}%` }} /></div><span className="font-mono text-xs text-muted">{record.progress}%</span></div>
    </div>)}</div>}

    {selected && <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><div className="absolute inset-0 bg-ink/40" onClick={() => setSelected(null)} />
      <div className="relative w-full max-w-lg rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
        <div className="flex justify-between items-start mb-5"><div><h2 className="text-base font-bold text-ink">Clearance checklist</h2><p className="text-xs text-muted mt-1">{selected.employee} · {selected.reason}</p></div><button onClick={() => setSelected(null)} className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button></div>
        <div className="space-y-2">{selected.tasks.map((task) => <button key={task.id} onClick={() => void toggleTask(selected, task)} className="w-full flex items-center gap-3 rounded-lg border border-hairline-soft p-3 text-left hover:bg-surface-soft"><CheckCircle2 size={17} className={task.done ? 'text-cta' : 'text-muted-soft'} /><span className={`flex-1 text-sm ${task.done ? 'text-muted line-through' : 'text-ink'}`}>{task.title}</span><span className="text-xs text-muted">{task.owner}</span></button>)}</div>
      </div></div>}

    {showCreate && <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><div className="absolute inset-0 bg-ink/40" onClick={() => setShowCreate(false)} />
      <form onSubmit={create} className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
        <div className="flex justify-between mb-5"><div><h2 className="text-base font-bold text-ink">Start offboarding</h2><p className="text-xs text-muted mt-1">Create clearance tasks for an employee.</p></div><button type="button" onClick={() => setShowCreate(false)} className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button></div>
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-ink">Employee<select required name="employee_id" className="input-field mt-1.5"><option value="">Select employee…</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name} · {employee.employee_id}</option>)}</select></label>
          <label className="block text-sm font-semibold text-ink">Reason<select required name="reason" className="input-field mt-1.5"><option>Resignation</option><option>Termination</option><option>Contract ended</option><option>Retirement</option></select></label>
          <label className="block text-sm font-semibold text-ink">Last working date<input required name="last_working_date" type="date" className="input-field mt-1.5" /></label>
          <label className="block text-sm font-semibold text-ink">Notes<textarea name="notes" rows={2} className="input-field mt-1.5" /></label>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-hairline-soft"><button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button><button disabled={saving} className="btn-cta disabled:opacity-50">{saving ? 'Saving…' : 'Create workflow'}</button></div>
      </form></div>}

    {settlement && <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><div className="absolute inset-0 bg-ink/40" onClick={() => setSettlement(null)} /><div className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6"><div className="flex justify-between items-start mb-5"><div><h2 className="text-base font-bold text-ink">Settlement estimate</h2><p className="text-xs text-muted mt-1">{settlement.employee} · {settlement.last_working_date}</p></div><button onClick={() => setSettlement(null)} className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button></div><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted">Base salary</span><span className="font-mono text-ink">Rp {Number(settlement.base_salary).toLocaleString('id-ID')}</span></div><div className="flex justify-between"><span className="text-muted">Prorated salary estimate</span><span className="font-mono text-ink">Rp {Number(settlement.prorated_salary).toLocaleString('id-ID')}</span></div><div className="flex justify-between border-t border-hairline-soft pt-3 font-bold"><span className="text-ink">Estimated total</span><span className="font-mono text-primary">Rp {Number(settlement.estimated_total).toLocaleString('id-ID')}</span></div></div><p className="mt-5 text-[11px] text-muted">{settlement.disclaimer}</p></div></div>}
    <ConfirmDialog open={Boolean(completeTarget)} title="Complete offboarding?" description="The employee will be deactivated after all clearance tasks are complete." confirmLabel="Complete" onConfirm={() => void complete()} onCancel={() => setCompleteTarget(null)} />
  </div>;
}
